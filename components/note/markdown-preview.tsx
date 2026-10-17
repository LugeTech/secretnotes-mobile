import React, { Component, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { parseMarkdown } from '@/utils/markdown';
import { MarkdownDocument } from './markdown-document';

type Props = { content: string };

class PreviewBoundary extends Component<Props & { children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: Props) {
    if (this.state.failed && previous.content !== this.props.content) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? <PlainTextFallback content={this.props.content} /> : this.props.children;
  }
}

function PlainTextFallback({ content }: Props) {
  const color = useThemeColor({}, 'text');
  return (
    <View style={styles.container}>
      <Text style={[styles.notice, { color }]}>Preview unavailable. Your original text is shown below.</Text>
      <Text selectable style={[styles.text, { color }]}>{content}</Text>
    </View>
  );
}

function ParsedPreview({ content }: Props) {
  const document = useMemo(() => parseMarkdown(content), [content]);
  const color = useThemeColor({}, 'text');
  return (
    <View style={styles.container}>
      {content.trim() ? <MarkdownDocument document={document} content={content} /> : (
        <Text style={[styles.text, { color }]}>Nothing to preview yet.</Text>
      )}
    </View>
  );
}

export function MarkdownPreview({ content }: Props) {
  return <PreviewBoundary content={content}><ParsedPreview content={content} /></PreviewBoundary>;
}

const styles = StyleSheet.create({
  container: { padding: 20, minHeight: 180, gap: 12 },
  notice: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  text: { fontSize: 17, lineHeight: 27 },
});
