import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { MarkdownPreview } from './markdown-preview';

type NoteEditorProps = {
  content: string;
  onChangeText: (content: string) => void;
};

// The screen keys this component by note identity; mode never enters saved content.
export function NoteEditor({ content, onChangeText }: NoteEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const color = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({ light: '#667085', dark: '#AAB2BF' }, 'icon');
  const borderColor = useThemeColor({ light: '#DDE1E8', dark: '#424854' }, 'background');

  return (
    <View style={styles.container}>
      <View style={[styles.toolbar, { borderColor }]} accessibilityRole="tablist">
        {(['edit', 'preview'] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityLabel={value === 'edit' ? 'Edit note' : 'Preview note'}
            accessibilityState={{ selected: mode === value }}
            onPress={() => setMode(value)}
            style={[styles.tab, { borderBottomColor: mode === value ? tint : 'transparent' }]}
          >
            <Text style={[styles.tabText, { color: mode === value ? tint : muted }]}>
              {value === 'edit' ? 'Edit' : 'Preview'}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode === 'edit' ? (
        <>
          <TextInput
            accessibilityLabel="Note content"
            value={content}
            onChangeText={onChangeText}
            placeholder="Start typing your note..."
            placeholderTextColor={muted}
            multiline
            scrollEnabled
            style={[styles.input, { color }]}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Text style={[styles.hint, { color: muted }]}>
            Markdown supported: # heading · **bold** · - list
          </Text>
        </>
      ) : <MarkdownPreview content={content} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0 },
  toolbar: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12 },
  tab: { minHeight: 44, minWidth: 76, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 2 },
  tabText: { fontSize: 14, fontWeight: '600' },
  input: { flex: 1, minHeight: 180, paddingHorizontal: 20, paddingVertical: 18, fontSize: 17, lineHeight: 27, borderWidth: 0 },
  hint: { paddingHorizontal: 20, paddingBottom: 14, fontSize: 12, lineHeight: 18 },
});
