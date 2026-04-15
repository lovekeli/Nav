# WayneのNav - 纯静态导航网站

## 项目概述

WayneのNav 是一个纯静态的网址导航网站项目，精挑细选优质书签，无任何广告行为。该项目基于前端技术栈构建，提供丰富的网址分类、快捷搜索、天气显示、时间模块、星空背景等功能特性。

### 主要功能特性

- ✅ 丰富资源 - 多分类书签导航
- ✅ 随机背景 - 动态随机背景图片
- ✅ 快捷搜索 - 支持多搜索引擎和工具
- ✅ 数据管理 - 通过 JSON 配置管理数据
- ✅ 实时天气 - 集成高德开放平台 API
- ✅ 时间模块 - 显示日期和时间
- ✅ 日月轮转 - 日夜模式切换
- ✅ 星空背景 - Canvas 星空动画

### 技术栈

- **HTML5/CSS3** - 页面结构和样式
- **JavaScript (原生)** - 交互逻辑
- **Bootstrap 5.3** - UI 框架
- **Tabler Icons** - 图标库
- **Izitoast** - 通知提示组件
- **GSAP** - 动画库
- **LXGW WenKai** - 字体（霞鹜文楷）
- **UnidreamLED** - 自定义字体（时间显示）
- **Lozad** - 图片懒加载

## 项目结构

```
Nav/
├── index.html              # 主页面
├── 404.html                # 404 错误页面
├── LICENSE                 # 开源许可证
├── README.md               # 项目说明文档
├── css/
│   ├── core.css            # 主样式源文件
│   └── core.min.css        # 压缩后的生产版本
├── js/
│   ├── core.js             # 核心 JavaScript 逻辑（动态渲染内容）
│   ├── core.min.js         # 压缩后的生产版本
│   ├── data.json           # 导航数据配置（书签、搜索配置等）
│   └── randomBackground.js # 随机背景图片脚本
├── images/                 # 图片资源
│   ├── alipay.jpg          # 支付宝收款码
│   ├── wechat.jpg          # 微信收款码
│   ├── browser.svg         # 浏览器图标
│   ├── navigation.png      # 导航图片
│   └── wayne.png           # 站点 Logo
└── .github/
    └── workflows/
        └── release.yml     # GitHub Actions 自动发布工作流
```

## 配置与运行

### 本地开发

由于这是纯静态网站，可以直接通过以下方式在本地运行：

1. **使用 VS Code Live Server 插件**
   - 安装 Live Server 插件
   - 右键 `index.html`，选择 "Open with Live Server"

2. **使用 Python 内置服务器**
   ```bash
   python -m http.server 8000
   ```

3. **使用 Node.js http-server**
   ```bash
   npx http-server
   ```

### 天气 API 配置

天气功能需要配置高德开放平台 API Key：

1. 前往 [高德开放平台](https://lbs.amap.com/) 创建账号
2. 创建一个 **Web 服务** 类型的 Key
3. 将 Key 填入 `js/core.js` 中的 `A_MAP_KEY` 变量中
4. 每月有 5000 次的免费额度

### 部署方式

项目支持多种部署平台：

- **GitHub Pages** - 主要部署方式
- **Cloudflare Pages** - 备用部署 (`nav-26e.pages.dev`)
- **Vercel** - 备用部署 (`wayne-nav.vercel.app`)
- **其他静态托管服务**

### GitHub Actions 自动发布

项目配置了自动化工作流（`.github/workflows/release.yml`），当提交信息包含 `Release vx.x.x` 格式时会自动：

1. 检查版本号并创建 Git Tag
2. 生成分组更新日志（基于 Conventional Commits 规范）
3. 创建 GitHub Release

## 数据配置

### 导航数据 (js/data.json)

所有导航链接和分类都通过 `data.json` 文件配置，结构如下：

```json
{
  "pageData": [
    {
      "id": "search",
      "title": "实用搜索",
      "icon": "ti ti-search",
      "searchConfig": [...]
    },
    {
      "title": "AI团体",
      "icon": "ti ti-flame",
      "items": [...]
    }
  ]
}
```

- **searchConfig** - 搜索引擎配置（ID、名称、URL、占位符）
- **items** - 书签列表（标题、URL、描述）

### 随机背景 (js/randomBackground.js)

背景图片通过 `randomBackground.js` 动态设置，当前配置使用外部 API 获取随机图片。

## 开发约定

### CSS 变量系统

项目使用 CSS 自定义属性（变量）实现主题系统：

- **调色板变量** - 基础颜色定义
- **语义化别名** - 基于语义的颜色映射
- **日夜模式** - 通过变量切换实现主题切换
- **外观定制** - 支持自定义遮罩、模糊、透明度、主题色

### JavaScript 结构

核心逻辑在 `js/core.js` 中：

- `public_vars` - 全局变量和断点配置
- `renderContent()` - 从 JSON 动态渲染内容
- `initializePageFunctions()` - 初始化交互功能

### 提交信息规范

项目遵循 Conventional Commits 规范：

- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `perf` - 性能优化
- `refactor` - 代码重构
- `style` - 代码样式
- `test` - 测试相关
- `chore` - 日常维护
- `build` - 构建系统
- `ci` - CI 配置

## 许可证

本项目采用 GNU 许可证（见 [LICENSE](LICENSE) 文件）。

## 相关链接

- **在线演示**: [WayneのNav](https://nav.3301.qzz.io/)
- **GitHub 仓库**: https://github.com/Waynenet/Wayne-Nav
- **Telegram 频道**: https://t.me/wayne_3301
- **原作者主页**: https://home.3301.qzz.io/
