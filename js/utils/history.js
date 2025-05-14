// 显示配置消息
function showConfigMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'config-message';
    messageDiv.textContent = message;
    messageDiv.style.opacity = 0;
    
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.appendChild(messageDiv);
    
    // 动画显示
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.5s ease';
        messageDiv.style.opacity = 1;
    }, 100);
    
    // 动画隐藏并移除
    setTimeout(() => {
        messageDiv.style.opacity = 0;
        setTimeout(() => {
            if (container.contains(messageDiv)) {
                container.removeChild(messageDiv);
            }
        }, 500);
    }, 3000);
    
    // 根据类型设置颜色
    if (type === 'error') {
        messageDiv.style.color = '#dc3545';
    }
}

// 加载密码历史记录
function loadPasswordHistory() {
    const historyList = document.getElementById('passwordHistoryList');
    if (!historyList) return;
    
    // 从localStorage获取历史记录
    const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    // 清空当前列表
    historyList.innerHTML = '';
    
    // 显示最近的5个密码（最新的在前）
    history.slice(0, 5).forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.password}</span>
            <div>
                <button class="copy-history-button" onclick="copyHistoryPassword('${item.password}')">复制</button>
                <button class="copy-history-button" onclick="removeHistoryPassword(${index})">删除</button>
            </div>
        `;
        historyList.appendChild(li);
    });
    
    // 如果历史记录为空，显示提示信息
    if (history.length === 0) {
        const li = document.createElement('li');
        li.style.textAlign = 'center';
        li.style.color = '#868e96';
        li.textContent = '暂无复制记录';
        li.colSpan = 2;
        historyList.appendChild(li);
    }
}

// 添加密码到历史记录
function addPasswordToHistory(password) {
    if (!password) return;
    
    // 获取历史记录列表
    const passwordList = document.getElementById('passwordHistoryList');
    if (!passwordList) return;
    
    // 创建新条目
    const historyItem = document.createElement('li');
    
    // 保留前6位和后6位，中间用...代替
    let displayPassword = password;
    if (password.length > 12) {
        displayPassword = password.substring(0, 6) + '...' + password.substring(password.length - 6);
    }
    
    // 创建密码显示容器
    const passwordDisplay = document.createElement('div');
    passwordDisplay.className = 'history-password-display';
    passwordDisplay.textContent = displayPassword;
    
    // 创建操作按钮
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'history-item-buttons';
    
    // 复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-history-button';
    copyButton.textContent = '复制';
    
    // 复制按钮点击事件
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(password).then(() => {
            // 修改按钮样式以提供视觉反馈
            copyButton.textContent = '已复制';
            copyButton.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                copyButton.textContent = '复制';
                copyButton.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error('复制到剪贴板失败: ', err);
            alert('复制到剪贴板失败，请手动复制');
        });
    });
    
    // 将元素组装到DOM中
    buttonContainer.appendChild(copyButton);
    historyItem.appendChild(passwordDisplay);
    historyItem.appendChild(buttonContainer);
    passwordList.insertBefore(historyItem, passwordList.firstChild);
    
    // 限制历史记录数量
    const maxHistoryItems = 10;
    while (passwordList.children.length > maxHistoryItems) {
        passwordList.removeChild(passwordList.lastChild);
    }
    
    // 更新localStorage中的历史记录
    updateLocalStorageHistory(password);
}

// 更新localStorage中的历史记录
function updateLocalStorageHistory(newPassword) {
    try {
        // 获取现有历史记录
        const historyData = localStorage.getItem('passwordHistory');
        let history = [];
        
        if (historyData) {
            try {
                history = JSON.parse(historyData);
            } catch (parseError) {
                console.error('解析历史记录失败:', parseError);
            }
        }
        
        // 添加新密码到数组开头
        history.unshift(newPassword);
        
        // 去重（保持唯一性）
        history = [...new Set(history)];
        
        // 限制历史记录数量
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        // 保存回localStorage
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        
        // 触发历史记录更新事件（如果其他组件需要监听）
        const event = new CustomEvent('passwordHistoryUpdated', { detail: { history: history } });
        window.dispatchEvent(event);
    } catch (error) {
        console.error('更新历史记录失败:', error);
    }
}

// 复制历史记录中的密码
copyHistoryPassword = function(password) {
    navigator.clipboard.writeText(password).then(() => {
        showConfigMessage('密码已复制到剪贴板', 'success');
    }).catch(err => {
        console.error('复制到剪贴板失败: ', err);
        showConfigMessage('复制到剪贴板失败', 'error');
    });
};

// 删除历史记录中的特定索引位置的密码
function removeHistoryPassword(index) {
    let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    if (index >= 0 && index < history.length) {
        history.splice(index, 1);
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        loadPasswordHistory();
        showConfigMessage('密码已从历史记录中删除', 'success');
    }
}

// 导出函数
// 使用IIFE模式导出函数到全局对象
(function() {
    const exportedFunctions = {
        addPasswordToHistory: addPasswordToHistory
    };

    // 在非模块环境中，将函数附加到window对象
    if (typeof module === 'undefined' || !module.exports) {
        window.historyUtils = exportedFunctions;
    } else {
        module.exports = exportedFunctions;
    }
})();
