import type { Nodes } from 'mdast';
import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { markdownSource } from '@/utils/markdown';
import { renderInline, type MarkdownContext } from './markdown-inline';

type Props = Pick<MarkdownContext, 'document' | 'content'>;

export function MarkdownDocument({ document, content }: Props) {
  const color = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const surface = useThemeColor({ light: '#F1F3F7', dark: '#242A34' }, 'background');
  const border = useThemeColor({ light: '#DDE1E8', dark: '#424854' }, 'background');
  return <>{renderBlocks(document.tree.children, { document, content, color, tint, surface, border })}</>;
}

function renderBlocks(nodes: readonly Nodes[], context: MarkdownContext): ReactNode {
  return nodes.map((node, index) => <React.Fragment key={index}>{renderBlock(node, context)}</React.Fragment>);
}

function renderBlock(node: Nodes, context: MarkdownContext): ReactNode {
  const { color, border, surface, content } = context;
  switch (node.type) {
    case 'definition':
      return null;
    case 'paragraph':
      return <Text selectable style={[styles.text, { color }]}>{renderInline(node.children, context)}</Text>;
    case 'heading': {
      const fontSize = [30, 26, 22, 20, 18, 17][node.depth - 1];
      return <Text selectable accessibilityRole="header" style={{ color, fontSize, lineHeight: fontSize + 8, fontWeight: '700' }}>{renderInline(node.children, context)}</Text>;
    }
    case 'blockquote':
      return <View style={[styles.quote, { borderLeftColor: border }]}>{renderBlocks(node.children, context)}</View>;
    case 'list':
      return (
        <View style={styles.stack}>
          {node.children.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text selectable style={[styles.marker, { color }]}>
                {item.checked != null ? (item.checked ? '☑' : '☐') : node.ordered ? `${(node.start ?? 1) + index}.` : '•'}
              </Text>
              <View style={styles.listBody}>{renderBlocks(item.children, context)}</View>
            </View>
          ))}
        </View>
      );
    case 'code':
      return (
        <ScrollView horizontal style={styles.scroller} contentContainerStyle={[styles.code, { backgroundColor: surface }]}>
          <Text selectable style={[styles.text, { color, fontFamily: Fonts.mono }]}>{node.value}</Text>
        </ScrollView>
      );
    case 'thematicBreak':
      return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: border, marginVertical: 6 }} />;
    case 'table': {
      // Fixed widths per column keep rows aligned; long content wraps inside each cell.
      const columnCount = Math.max(0, ...node.children.map((row) => row.children.length));
      return (
        <ScrollView horizontal style={styles.scroller}>
          <View accessibilityLabel="Markdown table" style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: border }}>
            {node.children.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <View key={columnIndex} style={[styles.cell, { borderColor: border, backgroundColor: rowIndex === 0 ? surface : 'transparent' }]}>
                    <Text selectable style={[styles.text, { color, textAlign: node.align?.[columnIndex] ?? 'left', fontWeight: rowIndex === 0 ? '700' : '400' }]}>
                      {renderInline(row.children[columnIndex]?.children ?? [], context)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
    default:
      return <Text selectable style={[styles.text, { color }]}>{markdownSource(node, content)}</Text>;
  }
}

const styles = StyleSheet.create({
  text: { fontSize: 17, lineHeight: 27 },
  stack: { gap: 8 },
  quote: { borderLeftWidth: 3, paddingLeft: 14, gap: 10 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  marker: { minWidth: 24, fontSize: 17, lineHeight: 27 },
  listBody: { flex: 1, minWidth: 0, gap: 8 },
  scroller: { flexGrow: 0, maxWidth: '100%' },
  code: { padding: 12, borderRadius: 8, minWidth: '100%' },
  tableRow: { flexDirection: 'row' },
  cell: { width: 180, padding: 10, borderRightWidth: 1, borderBottomWidth: 1 },
});
