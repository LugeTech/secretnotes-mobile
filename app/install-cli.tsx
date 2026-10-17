import { ScrollView, StyleSheet, View } from 'react-native';

import { CommandBlock } from '@/components/cli/command-block';
import { InstallSection } from '@/components/cli/install-section';
import { ExternalLink } from '@/components/external-link';
import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const cliReadme = 'https://github.com/ktappdev/secretnotes-go-backend/blob/v0.1.3/cli/README.md';

const releaseBase = 'https://github.com/ktappdev/secretnotes-go-backend/releases/download/v0.1.3';
const installerUrl = 'https://raw.githubusercontent.com/LugeTech/secretnotes-mobile/main/public/install-sn-macos.sh';
const downloads = [
  ['macOS · Apple Silicon', 'darwin_arm64.tar.gz'],
  ['macOS · Intel', 'darwin_amd64.tar.gz'],
  ['Linux · x86-64', 'linux_amd64.tar.gz'],
  ['Linux · ARM64', 'linux_arm64.tar.gz'],
  ['Windows · x86-64', 'windows_amd64.zip'],
  ['Windows · ARM64', 'windows_arm64.zip'],
] as const;

export default function InstallCliScreen() {
  return (
    <ThemedView style={styles.container}>
      <SeoHead
        title="Install the SecretNotes CLI"
        description="Install the SecretNotes CLI with Go or download v0.1.3 for macOS, Linux, and Windows."
        url="https://secretnotez.com/install-cli"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <ThemedText type="link" style={styles.eyebrow}>SECRETNOTES / TERMINAL</ThemedText>
          <ThemedText accessibilityRole="header" style={styles.title}>Your notes. In your terminal.</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.status}>v0.1.3 · Available now</ThemedText>
          <ThemedText style={styles.description}>
            Create and edit your SecretNotes from a terminal. The CLI connects to the same backend and encrypted notes as the web app.
          </ThemedText>
        </View>

        <InstallSection title="Install with Go">
          <ThemedText>1. Install the current Go release (Go 1.23 or newer is required).</ThemedText>
          <ExternalLink href="https://go.dev/doc/install"><ThemedText type="link">Go installation instructions ↗</ThemedText></ExternalLink>
          <ThemedText>2. Install the current v2 release:</ThemedText>
          <CommandBlock command="go install github.com/ktappdev/secretnotes-go-backend/cli/cmd/sn@v0.1.3" />
          <ThemedText style={styles.description}>Use this explicit version. Go currently resolves @latest to an older, separately tagged CLI module.</ThemedText>
          <ThemedText>3. Make sure Go’s binary directory is in PATH. Check your install location:</ThemedText>
          <CommandBlock command="go env GOBIN GOPATH" />
          <ThemedText>Use GOBIN when set; otherwise use the bin folder inside GOPATH (usually ~/go/bin on macOS and Linux). Add it to your user PATH and open a new terminal.</ThemedText>
          <ExternalLink href="https://go.dev/doc/tutorial/compile-install"><ThemedText type="link">Go binary directory and PATH setup ↗</ThemedText></ExternalLink>
          <ThemedText>4. Run sn to start.</ThemedText>
        </InstallSection>

        <InstallSection title="Download for macOS">
          <ThemedText>Choose Apple Silicon (M-series) or Intel below. The published macOS binaries require macOS 12 or newer.</ThemedText>
          <View style={styles.warning}>
            <ThemedText type="defaultSemiBold">Unsigned and unnotarized by Apple</ThemedText>
            <ThemedText>This macOS build is not signed or notarized by Apple. The install script verifies the archive’s SHA-256 checksum and removes quarantine from the installed binary. A matching checksum does not prove the software is safe, and removing quarantine does not sign or notarize it. Only install if you trust the source.</ThemedText>
          </View>
          {downloads.slice(0, 2).map(([label, asset]) => (
            <ExternalLink key={asset} href={`${releaseBase}/sn_0.1.3_${asset}`}><ThemedText type="link">Download {label} ↗</ThemedText></ExternalLink>
          ))}
          <ExternalLink href={`${releaseBase}/checksums.txt`}><ThemedText type="link">Published SHA-256 checksums ↗</ThemedText></ExternalLink>
          <ThemedText>For an automatic installation, download and inspect the script first:</ThemedText>
          <ExternalLink href={installerUrl}><ThemedText type="link">Read install-sn-macos.sh ↗</ThemedText></ExternalLink>
          <CommandBlock command={`curl -fL ${installerUrl} -o install-sn-macos.sh`} />
          <CommandBlock command="less install-sn-macos.sh" />
          <ThemedText>After reviewing it, run this separate command:</ThemedText>
          <CommandBlock command="sh install-sn-macos.sh" />
          <ThemedText style={styles.description}>The script installs v0.1.3 into ~/.local/bin without sudo, detects your processor, and asks before replacing an existing binary. It prints PATH setup instructions without editing your shell configuration.</ThemedText>
        </InstallSection>

        <InstallSection title="Linux and Windows downloads">
          <ThemedText>Download the archive for your processor, extract it, verify it against the published checksums, and put sn (sn.exe on Windows) in a folder on your PATH.</ThemedText>
          {downloads.slice(2).map(([label, asset]) => (
            <ExternalLink key={asset} href={`${releaseBase}/sn_0.1.3_${asset}`}><ThemedText type="link">Download {label} ↗</ThemedText></ExternalLink>
          ))}
          <ExternalLink href={`${releaseBase}/checksums.txt`}><ThemedText type="link">Published SHA-256 checksums ↗</ThemedText></ExternalLink>
        </InstallSection>

        <InstallSection title="First run">
          <CommandBlock command="sn" />
          <ThemedText>Complete the first-run server and autosave setup. Use https://pb.secretnotez.com for the same backend as the web app, and keep TLS verification enabled.</ThemedText>
          <ThemedText>You’ll then be prompted for a passphrase; the prompt is masked. Enter the exact same phrase as on the web to open your v2 note. The CLI edits text and leaves existing images unchanged.</ThemedText>
          <CommandBlock command="sn --help" />
          <ExternalLink href={cliReadme}><ThemedText type="link">CLI README: --url, autosave, TLS, and shortcuts ↗</ThemedText></ExternalLink>
        </InstallSection>

        <InstallSection title="Opening the app manually">
          <ThemedText>If macOS blocks a downloaded binary, try opening it once, then choose System Settings → Privacy &amp; Security → Open Anyway. This is Apple’s manual override. Overriding security checks can expose your Mac to malware; only proceed if you trust the download.</ThemedText>
          <ExternalLink href="https://support.apple.com/en-gb/guide/mac-help/mh40617/27/mac/27"><ThemedText type="link">Apple’s security override instructions ↗</ThemedText></ExternalLink>
        </InstallSection>

        <InstallSection title="Troubleshooting">
          <ThemedText type="defaultSemiBold">sn: command not found</ThemedText>
          <ThemedText>Add Go’s binary directory or ~/.local/bin to PATH, then reopen your terminal. Run command -v sn on macOS or Linux to check which installation is being used.</ThemedText>
          <ThemedText type="defaultSemiBold">macOS blocks the binary</ThemedText>
          <ThemedText>The script removes quarantine only after checksum verification. For manual downloads, review Apple’s override instructions above. Neither method signs or notarizes the app.</ThemedText>
          <ThemedText type="defaultSemiBold">Checksum verification fails</ThemedText>
          <ThemedText>Stop installation and download again from the release. Do not bypass verification.</ThemedText>
          <ThemedText type="defaultSemiBold">Different note or older CLI behavior</ThemedText>
          <ThemedText>Update to v0.1.3 or newer and check your server URL and exact passphrase. Older releases open legacy notes; recovering on the web creates a separate v2 copy. The current CLI uses that v2 copy. Recover legacy notes in the web app first.</ThemedText>
          <ThemedText style={styles.description}>Use the pinned Go command above. If an older binary is earlier in PATH, update or remove that installation.</ThemedText>
          <ThemedText type="defaultSemiBold">No compatible macOS download</ThemedText>
          <ThemedText>Use the Go installation if your machine supports the current Go release.</ThemedText>
        </InstallSection>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 24, paddingBottom: 48, gap: 20 },
  intro: { gap: 14, paddingVertical: 16 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: '700', letterSpacing: 1 },
  title: { fontFamily: Fonts.rounded, fontSize: 36, lineHeight: 42, fontWeight: '700', letterSpacing: -1 },
  description: { opacity: 0.8 },
  warning: { gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#b7791f', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  status: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(99, 102, 241, 0.10)' },
});
