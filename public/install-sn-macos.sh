#!/bin/sh
# SecretNotes CLI installer, pinned to v0.1.3. Inspect this file before running it.
set -eu

version=0.1.3
base_url="https://github.com/ktappdev/secretnotes-go-backend/releases/download/v${version}"
fail() { printf '%s\n' "$*" >&2; exit 1; }

[ "$(uname -s)" = Darwin ] || fail 'This installer supports macOS only. Use the Go installation on other systems.'
[ "$(id -u)" -ne 0 ] || fail 'Run this installer as your own user, without sudo.'
macos_major=$(sw_vers -productVersion | cut -d . -f 1)
[ "$macos_major" -ge 12 ] || fail 'These binaries require macOS 12 or newer.'
case "$(uname -m)" in
  arm64) arch=arm64 ;;
  x86_64) arch=amd64 ;;
  *) fail 'No compatible macOS archive. Use the Go installation instead.' ;;
esac
for tool in curl shasum tar xattr stat mktemp; do
  command -v "$tool" >/dev/null 2>&1 || fail "Required tool not found: $tool"
done

printf '%s\n' 'This build is unsigned and unnotarized by Apple.' \
  'This installer verifies the archive checksum and removes quarantine from the installed binary.' \
  'Neither action proves the software is safe. Continue only if you trust the source.'

install_dir="$HOME/.local/bin"
# Refuse symlinked or foreign-owned installation directories.
for directory in "$HOME" "$HOME/.local" "$install_dir"; do
  [ ! -L "$directory" ] || fail "Refusing symlinked installation directory: $directory"
  if [ -e "$directory" ]; then
    [ -d "$directory" ] || fail "Not a directory: $directory"
    [ "$(stat -f %u "$directory")" = "$(id -u)" ] || fail "Directory is not owned by you: $directory"
  fi
done
mkdir -p "$install_dir"
[ -w "$install_dir" ] || fail "Directory is not writable: $install_dir"
destination="$install_dir/sn"
if [ -e "$destination" ] || [ -L "$destination" ]; then
  [ -f "$destination" ] && [ ! -L "$destination" ] || fail "Refusing to replace a non-regular file: $destination"
  [ "$(stat -f %u "$destination")" = "$(id -u)" ] || fail "Existing binary is not owned by you: $destination"
  printf 'Replace %s with SecretNotes CLI v%s? [y/N] ' "$destination" "$version"
  answer=
  if ! read -r answer </dev/tty; then
    fail 'Replacement needs an interactive terminal. Existing binary left unchanged.'
  fi
  case "$answer" in y|Y|yes|YES) ;; *) fail 'Installation cancelled. Existing binary left unchanged.' ;; esac
fi

work_dir=$(mktemp -d)
stage_dir=
cleanup() {
  rm -rf "$work_dir"
  if [ -n "$stage_dir" ]; then rm -rf "$stage_dir"; fi
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
asset="sn_${version}_darwin_${arch}.tar.gz"
curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fL "$base_url/$asset" -o "$work_dir/$asset"
curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fL "$base_url/checksums.txt" -o "$work_dir/checksums.txt"
expected=$(awk -v asset="$asset" '$2 == asset { print $1 }' "$work_dir/checksums.txt")
[ "${#expected}" -eq 64 ] || fail 'Missing or ambiguous SHA-256 checksum. Installation stopped.'
case "$expected" in *[!0-9a-fA-F]*) fail 'Invalid SHA-256 checksum. Installation stopped.' ;; esac
actual=$(shasum -a 256 "$work_dir/$asset" | awk '{ print $1 }')
[ "$actual" = "$expected" ] || fail 'Checksum verification failed. Download again; do not bypass verification.'

# Extract only the binary to stdout; never unpack archive paths into the destination.
stage_dir=$(mktemp -d "$install_dir/.sn-install.XXXXXX")
tar -xzOf "$work_dir/$asset" sn > "$stage_dir/sn"
[ -s "$stage_dir/sn" ] || fail 'The archive did not contain a usable sn binary.'
chmod 755 "$stage_dir/sn"
if xattr -p com.apple.quarantine "$stage_dir/sn" >/dev/null 2>&1; then
  xattr -d com.apple.quarantine "$stage_dir/sn"
fi
mv -f "$stage_dir/sn" "$destination"
printf '\nInstalled SecretNotes CLI v%s (%s) at %s\n' "$version" "$arch" "$destination"
case ":$PATH:" in
  *":$install_dir:"*) printf '%s\n' 'Run sn to start, or sn --help for options.' ;;
  *)
    printf '%s\n' 'Add ~/.local/bin to PATH for this terminal:' '  export PATH="$HOME/.local/bin:$PATH"' \
      'To keep it, add that line to ~/.zshrc (zsh) or ~/.bash_profile (bash), then reopen your terminal.' \
      'Run sn to start, or sn --help for options.' ;;
esac
printf '%s\n' 'If another sn is earlier in PATH, remove or update that older installation.'
