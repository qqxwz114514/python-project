document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const copyButton = document.getElementById('copy-btn');
    const downloadButton = document.getElementById('download-btn');
    const clearButton = document.getElementById('clear-btn');
    const modelSelector = document.getElementById('model-selector');
    const modelNameDisplay = document.getElementById('model-name');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // API配置 - 模型集
    const API_CONFIGS = {
        standard: {
            url: 'https://api.siliconflow.cn/v1/chat/completions',
            key: '你的密钥',
            model: 'deepseek-ai/DeepSeek-V3',
            display: 'DeepSeek-v3'
        },
        gpt: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'openai/gpt-4o-mini',
            display: 'chatgpt-4o-mini'
        },
        fast: {
            url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            key: '你的密钥',
            model: 'doubao-1-5-lite-32k-250115',
            display: 'doubao-1-5-lite-32k'
        },
        vision: {
            url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
            key: '你的密钥',
            model: 'doubao-1.5-vision-pro-250328',
            display: 'doubao-1.5-vision-pro'
        },
        learnlm: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'google/learnlm-1.5-pro-experimental:free',
            display: 'learnlm-1.5-pro'
        },
        qwen: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'openai/gpt-4.1-mini',
            display: 'gpt-4.1-mini'
        },
        grok: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'x-ai/grok-3-mini-beta',
            display: 'grok-3-mini-beta'
        },
        o1: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'openai/o1-mini',
            display: 'gpt-o1-mini'
        },
        claude: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            key: '你的密钥',
            model: 'anthropic/claude-3.5-haiku',
            display: 'claude-3.5-haiku'
        }
    };
    
    // 当前活动的模式和配置
    let activeMode = 'fast'; // 默认使用fast模式（doubao模型）

    // 存储对话历史
    let conversationHistory = [
        { role: "assistant", content: "您好！我是AI助手，有什么可以帮您的吗？" }
    ];

    // 当前流式响应的消息元素
    let currentStreamMessageElement = null;
    
    // 模型选择器更改事件
    function handleModelChange() {
        const selectedMode = modelSelector.value;
        
        if (selectedMode !== activeMode) {
            activeMode = selectedMode;
            modelNameDisplay.textContent = API_CONFIGS[activeMode].display;
            showToast(`已切换到${API_CONFIGS[activeMode].display}`);
            
            // 不需要任何特殊的欢迎语切换逻辑
        }
    }
    
    // 创建思考过程元素
    function createThinkingProcessElement(thinkingText) {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('thinking-process', 'collapsed');
        
        // 确保内容被正确解析为markdown
        const formattedThinking = parseMarkdown(thinkingText);
        thinkingDiv.innerHTML = formattedThinking;
        
        // 添加展开/折叠按钮
        const toggleButton = document.createElement('button');
        toggleButton.classList.add('thinking-toggle');
        toggleButton.innerHTML = '展开 <i class="fas fa-chevron-down"></i>';
        
        toggleButton.addEventListener('click', () => {
            const isCollapsed = thinkingDiv.classList.contains('collapsed');
            if (isCollapsed) {
                thinkingDiv.classList.remove('collapsed');
                toggleButton.innerHTML = '收起 <i class="fas fa-chevron-up"></i>';
            } else {
                thinkingDiv.classList.add('collapsed');
                toggleButton.innerHTML = '展开 <i class="fas fa-chevron-down"></i>';
            }
        });
        
        thinkingDiv.appendChild(toggleButton);
        return thinkingDiv;
    }
    
    // 发送消息函数
    function sendMessage() {
        const userMessage = userInput.value.trim();
        
        if (!userMessage) return;
        
        // 添加用户消息到界面
        addMessageToUI('user', userMessage);
        
        // 清空输入框
        userInput.value = '';
        
        // 更新对话历史
        conversationHistory.push({ role: "user", content: userMessage });
        
        // 显示正在输入指示器
        showTypingIndicator();
        
        // 调用API获取回复
        fetchAIResponseStream();
    }

    // 处理Markdown格式和数学公式
    function parseMarkdown(text) {
        // 创建临时DOM元素
        const tempDiv = document.createElement('div');
        
        // 保存数学公式
        const mathExpressions = [];
        
        // 临时替换LaTeX公式，但不使用文本标记，而是返回唯一标识符
        text = text.replace(/(\\\(.*?\\\)|\\\[.*?\\\]|\$\$.*?\$\$|\$.*?\$)/gs, function(match) {
            mathExpressions.push(match);
            // 返回一个非常特殊的标记，使用Unicode特殊字符，极不可能出现在普通文本中
            return `\u200B\u200C\u200D\u2060\uFEFF${mathExpressions.length - 1}\u200B\u200C\u200D\u2060\uFEFF`;
        });
        
        // 处理加粗格式
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 处理斜体
        text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // 处理代码块
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 处理行内代码
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理换行符
        text = text.replace(/\n/g, '<br>');
        
        // 恢复LaTeX公式 - 使用Unicode零宽字符组合作为标记
        text = text.replace(/\u200B\u200C\u200D\u2060\uFEFF(\d+)\u200B\u200C\u200D\u2060\uFEFF/g, function(match, number) {
            return mathExpressions[parseInt(number)];
        });
        
        return text;
    }

    // 添加消息到界面
    function addMessageToUI(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(role === 'user' ? 'user-message' : 'ai-message');
        messageDiv.dataset.role = role;
        messageDiv.dataset.content = content;
        
        // 添加3D视差效果
        const zValue = role === 'user' ? 20 : 15;
        messageDiv.style.transform = `translateZ(${zValue}px)`;
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        // 处理Markdown格式
        const formattedContent = parseMarkdown(content);
        contentDiv.innerHTML = formattedContent;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 重新应用视差效果
        applyParallaxToNewMessage(messageDiv);
        
        // 检查并渲染数学公式
        if (window.MathJax && (
            content.includes('\\(') || 
            content.includes('\\)') || 
            content.includes('$') || 
            content.includes('\\[') || 
            content.includes('\\]'))) {
            setTimeout(() => {
                MathJax.typesetPromise([contentDiv]).then(() => {
                    // 渲染完成后更新滚动位置
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }).catch((err) => {
                    console.log('MathJax渲染错误:', err);
                });
            }, 100);
        }
        
        return messageDiv;
    }
    
    // 为流式响应创建空消息框
    function createStreamMessageElement() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message');
        
        // 添加3D视差效果
        messageDiv.style.transform = 'translateZ(15px)';
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 重新应用视差效果
        applyParallaxToNewMessage(messageDiv);
        
        return messageDiv;
    }

    // 应用视差效果到新消息
    function applyParallaxToNewMessage(messageElement) {
        const applyMovement = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const depth = messageElement.classList.contains('user-message') ? 15 : 10;
            const moveX = (x - 0.5) * depth;
            const moveY = (y - 0.5) * depth;
            
            // 保持z轴变换，只修改x和y
            const currentTransform = messageElement.style.transform;
            const zTransform = currentTransform.match(/translateZ\([^)]+\)/)[0];
            
            messageElement.style.transform = `translateX(${moveX}px) translateY(${moveY}px) ${zTransform}`;
        };
        
        // 先移除可能存在的监听器
        document.removeEventListener('mousemove', applyMovement);
        document.addEventListener('mousemove', applyMovement);
    }

    // 显示AI正在输入的指示器
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingDiv.appendChild(dot);
        }
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 隐藏输入指示器
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // 获取纯文本对话内容
    function getPlainTextConversation() {
        let text = '';
        const messages = chatMessages.querySelectorAll('.message');
        
        messages.forEach(message => {
            const role = message.classList.contains('user-message') ? '我' : 'AI';
            let content = '';
            
            // 优先使用原始内容
            if (message.dataset.content) {
                content = message.dataset.content;
            } else {
                // 回退到解析HTML
                content = message.querySelector('.message-content').textContent;
            }
            
            text += `${role}: ${content}\n\n`;
        });
        
        return text;
    }

    // 复制对话内容到剪贴板
    function copyConversation() {
        const text = getPlainTextConversation();
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('对话内容已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
                showToast('复制失败，请重试');
            });
    }

    // 下载对话记录
    function downloadConversation() {
        const text = getPlainTextConversation();
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const fileName = `对话记录_${dateStr}.txt`;
        
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        showToast('对话记录已下载');
    }

    // 清空对话
    function clearConversation() {
        // 保留第一条AI消息
        const initialMessage = chatMessages.querySelector('.message');
        
        // 移除所有其他消息
        while (chatMessages.childElementCount > 1) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
        
        // 重置对话历史
        conversationHistory = [
            { role: "assistant", content: "您好！我是AI助手，有什么可以帮您的吗？" }
        ];
        
        showToast('对话已清空');
    }

    // 显示提示框
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 调用API - 流式响应
    async function fetchAIResponseStream() {
        try {
            // 禁用发送按钮，避免多次提交
            sendButton.disabled = true;
            
            // 获取当前活动的API配置
            const apiConfig = API_CONFIGS[activeMode];
            
            let systemPrompt = apiConfig.system_prompt || "";
            
            const messages = systemPrompt ? 
                [{ role: "system", content: systemPrompt }, ...conversationHistory] : 
                conversationHistory;
            
            // 准备请求体
            const requestBody = {
                model: apiConfig.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 8192,
                stream: true
            };
            
            // 准备请求
            const response = await fetch(apiConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.key}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            // 隐藏输入指示器
            hideTypingIndicator();
            
            // 创建空消息框准备接收流式内容
            currentStreamMessageElement = createStreamMessageElement();
            const contentDiv = currentStreamMessageElement.querySelector('.message-content');
            
            // 完整的回复内容
            let fullResponse = '';
            
            // 创建reader来读取流
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            
            // 标记是否包含数学公式
            let containsMath = false;
            
            // 逐步读取响应流
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // 解码数据块
                const chunk = decoder.decode(value, { stream: true });
                
                // 处理数据块
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            // 解析JSON数据
                            const jsonData = JSON.parse(line.replace('data: ', ''));
                            
                            // 获取新内容（处理不同模型可能有不同的响应格式）
                            let newContent = '';
                            
                            // 标准的OpenAI格式响应
                            if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                newContent = jsonData.choices[0].delta.content;
                            }
                            
                            if (newContent) {
                                fullResponse += newContent;
                                
                                // 检查是否包含数学表达式
                                if (
                                    newContent.includes('$$') || 
                                    newContent.includes('$') || 
                                    newContent.includes('\\[') || 
                                    newContent.includes('\\]')
                                ) {
                                    containsMath = true;
                                }
                                
                                // 显示内容
                                contentDiv.innerHTML = parseMarkdown(fullResponse);
                                
                                // 滚动到最新消息
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            console.error('解析数据块时出错:', e);
                        }
                    }
                }
            }
            
            // 设置完整消息的内容和角色数据
            currentStreamMessageElement.dataset.role = 'assistant';
            currentStreamMessageElement.dataset.content = fullResponse;
            
            // 如果包含数学公式，则在流完成后渲染
            if (containsMath && window.MathJax) {
                setTimeout(() => {
                    MathJax.typesetPromise([contentDiv]).then(() => {
                        // 渲染完成后更新滚动位置
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }).catch((err) => {
                        console.log('MathJax渲染错误:', err);
                    });
                }, 100);
            }
            
            // 将完整回复添加到对话历史
            conversationHistory.push({ role: "assistant", content: fullResponse });
            
            // 重新启用发送按钮
            sendButton.disabled = false;
            
        } catch (error) {
            console.error('调用AI API时出错:', error);
            
            // 隐藏输入指示器
            hideTypingIndicator();
            
            // 显示错误消息
            addMessageToUI('ai', `抱歉，发生了错误：${error.message}`);
            
            // 重新启用发送按钮
            sendButton.disabled = false;
        }
    }
    
    // 原始非流式API调用函数 - 保留作为备用
    async function fetchAIResponse() {
        try {
            const response = await fetch(API_CONFIGS.standard.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIGS.standard.key}`
                },
                body: JSON.stringify({
                    model: API_CONFIGS.standard.model,
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 8192,
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            
            // 获取AI回复
            const aiResponse = data.choices[0].message.content;
            
            // 隐藏输入指示器
            hideTypingIndicator();
            
            // 添加AI回复到界面
            addMessageToUI('ai', aiResponse);
            
            // 更新对话历史
            conversationHistory.push({ role: "assistant", content: aiResponse });
            
        } catch (error) {
            console.error('调用AI API时出错:', error);
            
            // 隐藏输入指示器
            hideTypingIndicator();
            
            // 显示错误消息
            addMessageToUI('ai', `抱歉，发生了错误：${error.message}`);
        }
    }

    // 添加事件监听器
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 添加复制、下载和清空对话的事件监听器
    copyButton.addEventListener('click', copyConversation);
    downloadButton.addEventListener('click', downloadConversation);
    clearButton.addEventListener('click', clearConversation);
    
    // 添加模型选择器的事件监听器
    modelSelector.addEventListener('change', handleModelChange);

    // 初始化默认模型名称显示
    modelNameDisplay.textContent = API_CONFIGS[activeMode].display;
    
    // 确保选择器显示当前模型
    modelSelector.value = activeMode;

    // 设置初始焦点
    userInput.focus();
}); 