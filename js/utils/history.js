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

// 将密码添加到历史记录
function addPasswordToHistory(password) {
    let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
    
    // 移除已存在的相同密码（避免重复）
    history = history.filter(item => item.password !== password);
    
    // 添加新密码到开头
    history.unshift({
        password: password,
        timestamp: new Date().toISOString()
    });
    
    // 保持最多5条记录
    if (history.length > 5) {
        history = history.slice(0, 5);
    }
    
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    
    // 更新历史记录显示
    loadPasswordHistory();
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