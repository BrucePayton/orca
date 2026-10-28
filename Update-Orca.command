#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"
if [[ "$(uname -s)" != Darwin ]]; then
  echo '此入口仅用于 macOS。'
  exit 1
fi

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [[ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)" != 24 ]]; then
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    source "$HOME/.nvm/nvm.sh"
    nvm use 24
  else
    echo '请先安装 Node.js 24 和 pnpm，再运行此文件。'
    exit 1
  fi
fi
export ORCA_BACKGROUND_LAUNCH=1

assert_app_closed() {
  if pgrep -f '^/Applications/Orca[.]app/Contents/MacOS/Orca( |$)' >/dev/null; then
    echo '请先退出 Orca，再运行此文件；不会强制终止正在进行的工作。'
    exit 1
  fi
}

assert_app_closed
pnpm install:release
pnpm --dir mobile install --frozen-lockfile
pnpm build:mac

case "$(uname -m)" in
  arm64) source_app='dist/mac-arm64/Orca.app' ;;
  x86_64) source_app='dist/mac/Orca.app' ;;
  *) echo '不支持的 Mac 架构。'; exit 1 ;;
esac
test -x "$source_app/Contents/MacOS/Orca"
/usr/bin/codesign --verify --deep --strict "$source_app"
assert_app_closed

stage_dir="$(mktemp -d /Applications/.orca-install.XXXXXX)"
trap 'rm -rf "$stage_dir"' EXIT
/usr/bin/ditto "$source_app" "$stage_dir/Orca.app"
/usr/bin/codesign --verify --deep --strict "$stage_dir/Orca.app"
backup_app=''
if [[ -e /Applications/Orca.app ]]; then
  mkdir -p "$HOME/Applications"
  backup_dir="$(mktemp -d "$HOME/Applications/Orca-backup.XXXXXX")"
  backup_app="$backup_dir/Orca.app"
  mv /Applications/Orca.app "$backup_app"
fi
if ! mv "$stage_dir/Orca.app" /Applications/Orca.app; then
  if [[ -n "$backup_app" ]]; then
    mv "$backup_app" /Applications/Orca.app
  fi
  exit 1
fi
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f /Applications/Orca.app
echo '已安装：/Applications/Orca.app。可在“应用程序”中双击启动。'
if [[ -n "$backup_app" ]]; then
  echo "旧版备份：$backup_app"
fi
