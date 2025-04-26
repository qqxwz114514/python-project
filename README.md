# AI对话助手使用教程
这是一个基于Web的AI对话助手，具有美观的界面和丰富的功能。支持多种AI模型，支持数学公式渲染，并提供了便捷的对话管理功能。

## 功能特点
- 🎨 精美的UI设计
  
  - 现代化的渐变背景
  - 3D倾斜和光晕效果
  - 流畅的动画过渡
  - 响应式布局，支持移动端
- 🤖 多模型支持
  
  - doubao-1-5-lite-32k（快速模式）
  - doubao-1.5-vision-pro
  - DeepSeek-v3
  - chatgpt-4o-mini
  - learnlm-1.5-pro
  - gpt-4.1-mini
  - grok-3-mini-beta
  - gpt-o1-mini
  - claude-3.5-haiku
- 📝 对话功能
  
  - 实时对话
  - 支持Markdown格式
  - LaTeX数学公式渲染
  - 代码高亮显示
- 💾 对话管理
  
  - 一键复制对话内容
  - 下载对话记录
  - 清空对话历史
## 安装说明
1. 克隆仓库到本地：
bash

运行

Open Folder

1

2

git clone [ 仓库地址 ]

cd [ 仓库名 ]

2. API密钥配置：
   - 打开 script.js 文件
   - 找到 API_CONFIGS 配置对象
   - 将各个模型的 key 字段替换为你的API密钥
## 启动方法
提供三种启动方式，任选其一：

### 方法一：使用批处理启动（推荐）
双击 启动服务器.bat ，将自动检测Python环境并启动服务器。

### 方法二：Python启动

'''bash
python start_server.py
或
'''bash
python3 start_server.py

### 方法三：直接打开
双击 index.html 直接在浏览器中打开（部分功能可能受限）。

## 使用说明
1. 选择模型：
   
   - 在界面右上角的下拉菜单中选择想要使用的AI模型
   - 不同模型有不同的特点和适用场景
2. 发送消息：
   
   - 在底部输入框中输入问题
   - 点击发送按钮或按回车键发送
   - 支持多行文本输入
3. 对话管理：
   
   - 复制对话：点击复制按钮，将对话内容复制到剪贴板
   - 下载记录：点击下载按钮，保存对话记录为文本文件
   - 清空对话：点击清空按钮，重置对话历史
4. 特殊格式：
   
   - 支持Markdown语法
   - 数学公式使用 $ 或 $$ 包裹
   - 代码块使用 ``` 包裹
## 注意事项
1. API密钥安全：
   
   - 请妥善保管你的API密钥
   - 不要将包含真实API密钥的代码上传到公开仓库
2. 环境要求：
   
   - 需要现代浏览器支持
   - 建议使用Chrome、Firefox、Edge等主流浏览器
   - 需要联网使用
3. 服务器说明：
   
   - 本地服务器默认端口为8000
   - 支持局域网访问（同一WiFi下的其他设备可访问）
## 技术栈
- 前端：HTML5 + CSS3 + JavaScript
- UI组件：Font Awesome 图标
- 数学公式：MathJax
- 3D效果：Vanilla-tilt.js
- 服务器：Python SimpleHTTPServer
## 友情提示
首次启动需要打开script.js文件，修改其中的“你的密钥”，密钥获取如下
- 轨迹流动，https://cloud.siliconflow.cn/account/ak
- 火山引擎，https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey?apikey=%7B%7D
- openrouter，https://openrouter.ai/settings/keys

## 问题反馈
如有问题或建议，欢迎提交 Issue 或 Pull Request。
