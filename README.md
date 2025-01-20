ArkPets Chrome Extension
==============

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/laeififkebmljoilogkbjkgeojbjlebl)](https://chromewebstore.google.com/detail/laeififkebmljoilogkbjkgeojbjlebl)
[![Mozilla Add-on Version](https://img.shields.io/amo/v/arkpets)](https://addons.mozilla.org/addon/arkpets/)
[![Microsoft Edge Add-on Version](https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fndfompmmhblphdgdcphajfdighkfpbei)](
https://microsoftedge.microsoft.com/addons/detail/ndfompmmhblphdgdcphajfdighkfpbei)

基于 [ArkPets-Web](https://github.com/fuyufjh/ArkPets-Web) 开发的明日方舟桌宠 Chrome 扩展，可以把 2D 干员模型显示在任意网页上。

Based on [ArkPets-Web](https://github.com/fuyufjh/ArkPets-Web), this Chrome extension displays 2D operator models on any webpage.

启发自 [ArkPets](https://github.com/isHarryh/Ark-Pets) (Windows 平台)。素材版权属于[鹰角网络](https://www.hypergryph.com/)。

Inspired by [ArkPets](https://github.com/isHarryh/Ark-Pets) (Windows-only). The material copyrights belong to [Hypergryph](https://www.hypergryph.com/).

如果您有建议或发现问题，欢迎在 [GitHub Issues](https://github.com/fuyufjh/ArkPets-Chrome/issues) 中提出。

If you have suggestions or find any issues, please feel free to raise them in [GitHub Issues](https://github.com/fuyufjh/ArkPets-Chrome/issues).

## 开发指南 Dev Guide

安装 Node.js (v20+) 以及 `npm`。

```bash
# 安装依赖
# Install dependencies
npm install

# 安装 ArkPets-Web
# Install ArkPets-Web
git submodule update --init --recursive
cd ArkPets-Web && npm install && npm run build && cd ..

# 打包并监听修改，打包将生成 dist 目录，用于在 Chrome 中 Loaded unpacked
# Build and listen for changes, the build will generate the dist directory, which can be used in Chrome Loaded unpacked
npm run watch

# 打包生成分发 zip 包
# Build and generate zip package for distribution
./build.sh
```
