# Homepage (个人起始页)

一个基于 Vue 3 + Vite 构建的现代化、高颜值的浏览器起始页/网址导航。提供流畅的动画体验、毛玻璃材质 UI 以及丰富的高度自定义选项。

## ✨ 特性 (Features)

- **🔖 书签管理**：分类管理您的书签，支持右键菜单编辑、删除，支持快捷键（`1-9`）切换分类。
- **🔍 聚合搜索**：支持多种搜索引擎切换，支持在本地书签中快速过滤查找。（可在任意处按下 `Ctrl + K` 或 `Cmd + K` 唤出搜索）。
- **🎨 极佳的视觉体验**：
  - 完善的亮色/暗色模式（Dark/Light Mode）。
  - 精美的 Glassmorphism（毛玻璃） UI 设计与动态流光背景。
  - 支持自定义壁纸、背景模糊度、饱和度、亮度以及主题色调。
- **☁️ 云端同步**：配合 Github Token（在设置中配置），实现书签数据的云端保存与同步备份，多端无忧。
- **🤖 内置 AI 支持**：可配置自定义的 AI 接口（如 DeepSeek、OpenAI 等）进行便捷交互。
- **🕒 综合微件**：实时时钟、根据时间动态问候的组件。

## 🛠️ 技术栈 (Tech Stack)

- **框架**：[Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**：[Vite](https://vitejs.dev/)
- **UI/CSS**：纯 CSS (CSS Variables, CSS Grid / Flexbox, CSS Transitions) 

## 📦 快速开始 (Getting Started)

### 1. 克隆项目 & 安装依赖

```bash
# 1. 安装依赖
npm install 
# 或者使用 pnmp / yarn
# pnpm install
```

### 2. 开发环境运行

```bash
npm run dev
```

打开浏览器访问输出的本地地址 (通常是 `http://localhost:3000` 或 `http://localhost:5173`)。

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，产物将生成在 `dist/` 目录下，可将其部署到 Vercel, Netlify 或 Github Pages 等各种静态托管平台。

## ⌨️ 快捷键 (Shortcuts)

- `/` 或 `Ctrl + K` (Mac: `Cmd + K`)：快速唤醒/聚焦顶部的搜索框。
- `1 - 9`：快速切换书签大类（数字顺序对应分类排序）。
- 搜索框内 `↑ / ↓`：在书签过滤列表中选择目标，`Enter` 打开选中的书签。
- `Esc`：关闭模态框、取消焦点或关闭背景菜单。

## ⚙️ 个性化设置 (Settings)

点击右下角的 **“设置”** (齿轮图标) 可打开面板，您可以：
- 切换主题背景与色彩
- 管理搜索行为（例如强制在新标签页打开）
- 填写 Github 配置以启用自动备份（填写 Username, Repository, Branch 和 Personal Access Token）

---
*Created with ❤️ by Vue 3 & Vite.*