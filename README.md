# mteam-tab-opener
# M-Team 种子详情批量打开器 (Tampermonkey 脚本)

一个 Tampermonkey 油猴脚本，为 [M-Team](https://m-team.cc) 种子列表页添加浮动按钮组，支持一键打开前 N 个、下 N 个或全部种子详情页，并自动记录打开进度。所有链接均在后台标签页打开，不影响当前浏览。

## 功能特点

- **前5 / 前10**：从页面顶部开始，打开前 5 个或前 10 个种子详情页，并重置进度。
- **下5 / 下10**：从当前进度开始，打开接下来的 5 个或 10 个链接，自动更新进度。
- **下一个**：每次只打开一个链接，适合逐个浏览。
- **全部**：一次性打开当前页所有种子详情链接。
- **智能进度**：记录已打开的索引，避免重复打开。
- **后台打开**：所有新标签页在后台打开，不打断当前浏览。

## 安装方法

1. 安装浏览器扩展 Tampermonkey（[Chrome 版](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) / [Firefox 版](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)）。
2. 点击以下链接安装脚本（或直接复制 `mteam-tab-opener.user.js` 内容新建脚本）：
   - [安装脚本](https://github.com/你的用户名/mteam-tab-opener/raw/main/mteam-tab-opener.user.js)  <!-- 替换为你的 raw 链接 -->
3. 访问任意 M-Team 种子列表页面（如首页、分区页、搜索结果页），右下角会出现操作按钮。

## 使用说明

- 进入种子列表页后，浮动按钮组固定在右下角。
- 点击 **前5** 或 **前10** 会重新获取当前页面的所有种子链接，并打开指定数量，同时将“下一个”的起点重置为已打开的数量之后。
- 点击 **下5** 或 **下10** 会从当前进度继续打开后续链接。
- 点击 **下一个** 逐个打开未浏览的链接，若已全部打开会询问是否从头开始。
- 点击 **全部** 直接打开当前页所有种子详情链接。

## 自定义修改

如果需要修改选择器（例如网站改版导致链接无法识别），可以编辑脚本开头的 `LINK_SELECTOR` 变量。默认选择器为 `a[href^="/detail/"]`。

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交 Issue 或 Pull Request 来改进脚本。
