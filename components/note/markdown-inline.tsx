import type { Nodes } from 'mdast';
import React, { type ReactNode } from 'react';
import { Alert, Linking, Text } from 'react-native';

import { Fonts } from '@/constants/theme';
import { markdownSource, safeMarkdownUrl, type parseMarkdown } from '@/utils/markdown';

export type MarkdownContext = {
  document: ReturnType<typeof parseMarkdown>;
  content: string;
  color: string;
  tint: string;
  surface: string;
  border: string;
};

function MarkdownLink({ url, children, tint }: { url: string; children: ReactNode; tint: string }) {
  const destination = safeMarkdownUrl(url);
  if (!destination) return <>{children}</>;
  return (
    <Text
      accessibilityRole="link"
      accessibilityHint={destination}
      style={{ color: tint, textDecorationLine: 'underline' }}
      onPress={() => {
        void Linking.openURL(destination).catch(() => Alert.alert('Could not open link', 'Try opening the address in your browser.'));
      }}
    >{children}</Text>
  );
}

export function renderInline(nodes: readonly Nodes[], context: MarkdownContext): ReactNode {
  return nodes.map((node, index) => <React.Fragment key={index}>{renderNode(node, context)}</React.Fragment>);
}

function renderNode(node: Nodes, context: MarkdownContext): ReactNode {
  const { content, document, surface, tint } = context;
  switch (node.type) {
    case 'text':
    case 'html':
      return node.value;
    case 'break':
      return '\n';
    case 'strong':
      return <Text style={{ fontWeight: '700' }}>{renderInline(node.children, context)}</Text>;
    case 'emphasis':
      return <Text style={{ fontStyle: 'italic' }}>{renderInline(node.children, context)}</Text>;
    case 'delete':
      return <Text style={{ textDecorationLine: 'line-through' }}>{renderInline(node.children, context)}</Text>;
    case 'inlineCode':
      return <Text style={{ fontFamily: Fonts.mono, backgroundColor: surface }}>{node.value}</Text>;
    case 'link':
      return <MarkdownLink url={node.url} tint={tint}>{renderInline(node.children, context)}</MarkdownLink>;
    case 'linkReference': {
      const definition = document.definitions.get(node.identifier.toUpperCase());
      return definition ? (
        <MarkdownLink url={definition.url} tint={tint}>{renderInline(node.children, context)}</MarkdownLink>
      ) : markdownSource(node, content);
    }
    case 'image':
    case 'imageReference':
      return `[Image not loaded${node.alt ? `: ${node.alt}` : ''}]`;
    default:
      return markdownSource(node, content);
  }
}
