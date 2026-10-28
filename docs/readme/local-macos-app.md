# 从源码安装和更新 macOS 桌面版

在项目根目录双击 `Update-Orca.command`，或在终端运行：

```sh
./Update-Orca.command
```

入口要求 Node.js 24 和 pnpm。使用 nvm 时会自动选择已安装的 Node.js 24。
首次构建需要联网下载依赖，并需要 Xcode Command Line Tools 编译原生组件。
安装位置为 `/Applications/Orca.app`；完成后可从 Finder 的“应用程序”或 Spotlight 搜索 Orca 启动。

源码更新后，退出 Orca，再次运行同一入口即可。脚本打包当前工作目录中的源码，
不会自动拉取 Git、提交代码或修改用户设置。安装失败会返回错误，构建失败不会替换已安装的 App。
替换前会将旧版移至 `~/Applications/Orca-backup.XXXXXX/Orca.app`；确认新版正常后可删除备份。

脚本复用 `pnpm install:release` 和 `pnpm build:mac`，生成 Intel 与 Apple Silicon 两种架构的
DMG、ZIP 和 App，并安装适合当前机器的 App。产物位于 `dist/`，本地版本号包含时间戳和 Git 提交标识。
这属于本地构建，未经过 Apple 公证；公开分发应使用项目现有的正式签名发布流程。
App 中的官方更新不代表此源码目录的更新，更新自定义源码请使用上述入口。

本地 macOS 构建使用 ad-hoc 签名，其签名要求绑定本次构建的代码哈希。
ShipIt 无法将另一个构建（包括官方签名版）直接安装到它上面，否则会出现
`code failed to satisfy specified code`。因此本地构建不启动自动更新检查，
手动检查、下载和安装入口会提示使用本脚本。若要转用官方自动更新，
请退出应用并手动安装官方签名版；不要通过关闭签名校验来处理此错误。
