# 纸牌对抗 (Card Confrontation) - 部署指南

本项目是一个基于 Vite + React + Tailwind CSS 开发的纸牌游戏，包含单人 AI 对战和基于 Socket.io 的多人对战功能。

## 1. 部署到 GitHub

1. 在 GitHub 上创建一个新的仓库。
2. 在本地终端运行以下命令：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

## 2. 部署到 Vercel

### 注意事项
*   **Vercel 静态部署**：Vercel 默认支持静态网站部署。由于 Vercel Serverless Functions 不支持长连接，**多人对战 (Socket.io) 功能在 Vercel 上将无法正常运行**。
*   **单人模式**：单人 AI 对战模式可以完全在 Vercel 上运行。

### 部署步骤
1. 登录 [Vercel](https://vercel.com/)。
2. 点击 **Add New** -> **Project**。
3. 导入你的 GitHub 仓库。
4. 在 **Environment Variables** 中添加以下变量：
    *   `GEMINI_API_KEY`: 你的 Google Gemini API 密钥（用于 AI 建议功能）。
5. 点击 **Deploy**。

## 3. 多人对战部署建议
如果你需要完整的多人对战功能，建议将后端部署到支持长连接的平台，例如：
*   [Railway](https://railway.app/)
*   [Render](https://render.com/)
*   [Heroku](https://www.heroku.com/)

在这些平台上，你可以直接运行 `npm start` 来启动包含 Socket.io 的 Express 服务器。
