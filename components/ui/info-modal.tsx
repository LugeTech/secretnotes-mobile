import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function InfoModal({ visible, title, message, onClose }: InfoModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'icon');
  const overlayColor = useThemeColor(
    { light: 'rgba(0, 0, 0, 0.5)', dark: 'rgba(0, 0, 0, 0.7)' },
    'background'
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={[styles.overlay, { backgroundColor: overlayColor }]} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={[styles.modal, { backgroundColor, borderColor }]}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
                <IconSymbol name="xmark.circle.fill" size={24} color={textColor} />
              </Pressable>
            </View>
            <ThemedText style={styles.message}>{message}</ThemedText>
            <Pressable
              style={[styles.button, { borderColor }]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <ThemedText style={styles.buttonText}>Got it</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
