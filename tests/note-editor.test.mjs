import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import React from 'react';
import { act, create } from 'react-test-renderer';
import ts from 'typescript';

// Mock native hosts only: real editor, parser, renderer, and autosave run in Node.
registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith('test:')) context = { ...context, parentURL: import.meta.url };
    if (specifier === 'react-native' || specifier === '@/hooks/use-theme-color') return { url: `test:${specifier}`, shortCircuit: true };
    if (specifier.startsWith('@/')) specifier = new URL(`../${specifier.slice(2)}`, import.meta.url).href;
    try { return next(specifier, context); } catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !/^(file:|\.)/.test(specifier)) throw error;
      for (const extension of ['.ts', '.tsx']) {
        try { return next(specifier + extension, context); } catch { /* Try next source extension. */ }
      }
      throw error;
    }
  },
  load(url, context, next) {
    if (url === 'test:react-native') return { format: 'module', shortCircuit: true, source: `
      import React from 'react';
      export const Text = 'Text', TextInput = 'TextInput', Pressable = 'Pressable', ScrollView = 'ScrollView';
      export function View(props) {
        if (globalThis.__failTable && props.accessibilityLabel === 'Markdown table') throw new Error('Simulated renderer failure');
        return React.createElement('View', props);
      }
      export const StyleSheet = { create: value => value, hairlineWidth: 1 };
      export const Platform = { OS: 'ios', select: value => value.ios ?? value.default };
      export const Linking = { openURL: async url => globalThis.__openedLinks.push(url) };
      export const Alert = { alert: () => {} };
    ` };
    if (url === 'test:@/hooks/use-theme-color') return { format: 'module', shortCircuit: true, source: `export const useThemeColor = (props, key) => props.light ?? (key === 'text' ? '#11181C' : '#6366f1');` };
    if (url.startsWith('file:') && /\.tsx?$/.test(url) && !url.includes('/node_modules/')) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText,
    };
    return next(url, context);
  },
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__openedLinks = [];
globalThis.window = globalThis;
process.env.EXPO_PUBLIC_AUTO_SAVE_DELAY_MS = '20';
const { NoteEditor } = await import('../components/note/note-editor.tsx');
const { MarkdownPreview } = await import('../components/note/markdown-preview.tsx');
const { useAutoSave } = await import('../hooks/use-auto-save.ts');
const text = (renderer) => renderer.root.findAllByType('Text').map((node) => node.children.filter((child) => typeof child === 'string').join('')).join('\n');
const tab = (renderer, name) => renderer.root.findByProps({ accessibilityLabel: `${name} note` });

test('preview formats locally, blocks images and unsafe links, and scrolls wide content', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Preview must not fetch'); };
  let renderer;
  try {
    await act(async () => { renderer = create(React.createElement(MarkdownPreview, { content: '# Heading\n\n**bold** *italic* ~~gone~~\nsecond line\n\n![secret](https://example.com/tracker)\n\n<script>alert(1)</script>\n\n[safe](https://example.com) [unsafe](javascript:alert(1))\n\n| A | B |\n| :--- | ---: |\n| one | two |\n\n```\ncode\n```' })); });
    assert.match(text(renderer), /Heading/);
    assert.match(text(renderer), /\nsecond line/);
    assert.match(text(renderer), /Image not loaded: secret/);
    assert.match(text(renderer), /<script>alert\(1\)<\/script>/);
    assert.deepEqual(globalThis.__openedLinks, []);
    const links = renderer.root.findAllByProps({ accessibilityRole: 'link' });
    assert.equal(links.length, 1);
    await act(async () => links[0].props.onPress());
    assert.deepEqual(globalThis.__openedLinks, ['https://example.com']);
    assert.equal(renderer.root.findAllByType('ScrollView').filter((node) => node.props.horizontal).length, 2);
    assert.ok(renderer.root.findAllByType('Text').some((node) => Array.isArray(node.props.style) && node.props.style.some((style) => style.textAlign === 'right')));
  } finally {
    globalThis.fetch = originalFetch;
    if (renderer) await act(async () => renderer.unmount());
  }
});

test('mode changes preserve drafts and autosave; remote reloads update preview without saving', async () => {
  const saved = [];
  const save = async (value) => { saved.push(value); };
  function Harness({ identity = 'first', remote = 'initial' }) {
    const [draft, setDraft] = React.useState(remote);
    React.useEffect(() => setDraft(remote), [remote, identity]);
    useAutoSave(draft, 'test passphrase', save, true, remote);
    return React.createElement(NoteEditor, { key: identity, content: draft, onChangeText: setDraft });
  }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Harness)); });
  try {
    assert.equal(renderer.root.findAllByType(MarkdownPreview).length, 0);
    await act(async () => renderer.root.findByType('TextInput').props.onChangeText('**unsaved**\n世界'));
    await act(async () => tab(renderer, 'Preview').props.onPress());
    assert.match(text(renderer), /unsaved/);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 40)); });
    assert.deepEqual(saved, ['**unsaved**\n世界']);
    await act(async () => tab(renderer, 'Edit').props.onPress());
    assert.equal(renderer.root.findByType('TextInput').props.value, '**unsaved**\n世界');
    await act(async () => tab(renderer, 'Preview').props.onPress());
    await act(async () => renderer.update(React.createElement(Harness, { remote: '# Remote update' })));
    assert.equal(tab(renderer, 'Preview').props.accessibilityState.selected, true);
    assert.match(text(renderer), /Remote update/);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 40)); });
    assert.equal(saved.length, 1);
    await act(async () => renderer.update(React.createElement(Harness, { identity: 'second', remote: 'Another note' })));
    assert.equal(tab(renderer, 'Edit').props.accessibilityState.selected, true);
    assert.equal(renderer.root.findByType('TextInput').props.value, 'Another note');
  } finally { await act(async () => renderer.unmount()); }
});

test('empty and incomplete notes remain previewable', async () => {
  let renderer;
  await act(async () => { renderer = create(React.createElement(MarkdownPreview, { content: '' })); });
  assert.match(text(renderer), /Nothing to preview yet/);
  await act(async () => renderer.update(React.createElement(MarkdownPreview, { content: '**unfinished [text' })));
  assert.match(text(renderer), /\*\*unfinished \[text/);
  await act(async () => renderer.unmount());
});

test('rendering failures show original source and recover on new content', async () => {
  const content = '| A | B |\n| --- | --- |\n| secret | text |';
  const originalError = console.error;
  globalThis.__failTable = true;
  console.error = () => {};
  let renderer;
  try {
    await act(async () => { renderer = create(React.createElement(MarkdownPreview, { content })); });
    assert.match(text(renderer), /Preview unavailable/);
    assert.ok(text(renderer).includes(content));
    globalThis.__failTable = false;
    await act(async () => renderer.update(React.createElement(MarkdownPreview, { content: '# Recovered' })));
    assert.match(text(renderer), /Recovered/);
    assert.doesNotMatch(text(renderer), /Preview unavailable/);
  } finally {
    console.error = originalError;
    globalThis.__failTable = false;
    if (renderer) await act(async () => renderer.unmount());
  }
});
