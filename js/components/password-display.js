// 密码显示组件
(function() {
    // 创建命名空间
    window.PasswordDisplay = {};
    
    // 密码显示渲染函数
    function renderPasswordDisplay(password) {
        const displayContainer = document.querySelector('.password-container');
        const display = document.getElementById('passwordDisplay');
        
        if (!display) return;
        
        // 显示密码并添加动画效果
        display.textContent = password;
        display.style.opacity = 0;
        display.style.transform = 'translateY(20px)';
        
        // 确保容器可见性
        if (displayContainer) {
            displayContainer.style.opacity = 0;
            displayContainer.style.transform = 'translateY(20px)';
        }
        
        setTimeout(() => {
            display.style.transition = 'all 0.5s ease-in';
            display.style.opacity = 1;
            display.style.transform = 'translateY(0)';
            
            if (displayContainer) {
                displayContainer.style.transition = 'all 0.5s ease-in';
                displayContainer.style.opacity = 1;
                displayContainer.style.transform = 'translateY(0)';
            }
        }, 50);
    }
    
    // 初始化密码显示容器
    function initPasswordDisplay() {
        const container = document.querySelector('.password-container');
        const display = document.getElementById('passwordDisplay');
        
        // 如果容器不存在则创建
        if (!container) {
            const newContainer = document.createElement('div');
            newContainer.className = 'password-container';
            
            // 将密码显示移到新容器中
            if (display) {
                const form = document.getElementById('passwordForm');
                if (form) {
                    form.parentNode.insertBefore(newContainer, form.nextSibling);
                    newContainer.appendChild(display);
                }
            }
        }
    }
    
    // 暴露公共方法
    window.PasswordDisplay.renderPasswordDisplay = renderPasswordDisplay;
    window.PasswordDisplay.initPasswordDisplay = initPasswordDisplay;
})();