import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMarkdown, safeMarkdownUrl } from '../utils/markdown.ts';

test('parses formatting, nested lists, aligned tables, and Unicode', () => {
  const source = '# Heading 世界\n\n**bold** *italic* ~~gone~~ `code`\nline two\n\n> quote\n\n3. ordered\n   - nested\n\n```ts\nconst value = 1;\n```\n\n| Left | Right |\n| :--- | ---: |\n| a | b |';
  const { tree } = parseMarkdown(source);
  assert.deepEqual(tree.children.map((node) => node.type), ['heading', 'paragraph', 'blockquote', 'list', 'code', 'table']);
  assert.equal(tree.children[0].children[0].value, 'Heading 世界');
  assert.deepEqual(tree.children[1].children.filter((node) => node.type !== 'text').map((node) => node.type), ['strong', 'emphasis', 'delete', 'inlineCode']);
  assert.match(tree.children[1].children.at(-1).value, /\nline two/);
  assert.equal(tree.children[3].start, 3);
  assert.equal(tree.children[3].children[0].children[1].type, 'list');
  assert.deepEqual(tree.children.at(-1).align, ['left', 'right']);
});

test('keeps HTML and images as data and tolerates incomplete Markdown', () => {
  const { tree } = parseMarkdown('<script>alert(1)</script>\n\n![private](https://example.com/tracker.png)\n\n**unfinished [link\n\n```\nunfinished code');
  assert.equal(tree.children[0].type, 'html');
  assert.equal(tree.children[1].children[0].type, 'image');
  assert.equal(tree.children.at(-1).value, 'unfinished code');
  assert.deepEqual(parseMarkdown('').tree.children, []);
});

test('reference links use the first definition', () => {
  const { definitions } = parseMarkdown('[Read][site]\n\n[site]: https://example.com\n[site]: https://other.example');
  assert.equal(definitions.get('SITE').url, 'https://example.com');
});

test('only explicit valid web and email destinations are actionable', () => {
  for (const url of ['https://example.com/path?q=1', 'http://example.com', 'mailto:hello@example.com', 'HTTPS://EXAMPLE.COM']) assert.equal(safeMarkdownUrl(url), url);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', '//example.com', '/relative', '#fragment', 'https://', 'mailto:', ' https://example.com', 'https://exa\nmple.com', 'tel:123', 'secertnotemobile://home']) assert.equal(safeMarkdownUrl(url), undefined, url);
});
