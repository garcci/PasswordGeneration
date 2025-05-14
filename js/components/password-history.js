// 密码历史记录组件
(function() {
    // 创建命名空间
    window.PasswordHistory = {};
    
    // 密码历史记录渲染函数
    function renderPasswordHistory(password) {
        if (!password) return;
        
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
    }
    
    // 初始化密码历史记录容器
    function initPasswordHistory() {
        const historyContainer = document.querySelector('.password-history');
        const historyList = document.getElementById('passwordHistoryList');
        
        // 如果元素不存在则创建
        if (!historyContainer) {
            const newHistoryContainer = document.createElement('div');
            newHistoryContainer.className = 'password-history';
            
            const heading = document.createElement('h3');
            heading.textContent = '复制过的密码';
            
            const list = document.createElement('ul');
            list.id = 'passwordHistoryList';
            
            newHistoryContainer.appendChild(heading);
            newHistoryContainer.appendChild(list);
            
            // 将历史记录移到正确位置
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(newHistoryContainer);
            }
        }
    }
    
    // 暴露公共方法
    window.PasswordHistory.renderPasswordHistory = renderPasswordHistory;
    window.PasswordHistory.initPasswordHistory = initPasswordHistory;
})();