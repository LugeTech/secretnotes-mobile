import type { Definition, Nodes } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const parser = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(content: string) {
  const tree = parser.parse(content);
  const definitions = new Map<string, Definition>();
  function collect(node: Nodes): void {
    if (node.type === 'definition' && !definitions.has(node.identifier.toUpperCase())) {
      definitions.set(node.identifier.toUpperCase(), node);
    }
    if ('children' in node) node.children.forEach(collect);
  }
  collect(tree);
  return { tree, definitions };
}

export function safeMarkdownUrl(url: string): string | undefined {
  if (!/^(https?:\/\/|mailto:)/i.test(url) || /[\u0000-\u0020\u007f]/u.test(url)) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'mailto:') return parsed.pathname ? url : undefined;
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname) return url;
  } catch {
    return;
  }
}

export function markdownSource(node: Nodes, content: string): string {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start !== undefined && end !== undefined ? content.slice(start, end) : '';
}
