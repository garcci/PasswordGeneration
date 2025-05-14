// 密码强度指示器组件
(function() {
    // 创建命名空间
    window.StrengthMeter = {};
    
    // 获取密码强度
    function getPasswordStrength(password) {
        if (!password || password.length < 8) return 0;
        
        let score = 0;
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[^a-zA-Z\d]/.test(password);
        const length = password.length;
        
        // 基础分数（每种字符类型加1分）
        score += hasLowercase ? 1 : 0;
        score += hasUppercase ? 1 : 0;
        score += hasNumbers ? 1 : 0;
        score += hasSymbols ? 1 : 0;
        
        // 长度加分
        if (length >= 12) score++;
        if (length >= 16) score++;
        
        // 检查是否有重复字符
        const uniqueChars = new Set(password).size;
        if (uniqueChars / password.length < 0.5) {
            score = Math.max(0, score - 1); // 如果有大量重复字符，扣分
        }
        
        return score;
    }
    
    // 密码强度指示器渲染函数
    function renderStrengthMeter(password) {
        const strength = getPasswordStrength(password);
        const strengthMeter = document.getElementById('strengthMeter');
        
        if (!strengthMeter) return;
        
        // 创建或获取元素
        let strengthBar = strengthMeter.querySelector('.strength-meter');
        let strengthLabel = strengthMeter.querySelector('.strength-label');
        
        // 如果元素不存在则创建
        if (!strengthBar) {
            strengthBar = document.createElement('div');
            strengthBar.className = 'strength-meter';
            strengthMeter.appendChild(strengthBar);
        }
        
        if (!strengthLabel) {
            strengthLabel = document.createElement('div');
            strengthLabel.className = 'strength-label';
            strengthMeter.appendChild(strengthLabel);
        }
        
        // 根据强度设置宽度和颜色
        let widthPercentage = 0;
        let strengthClass = '';
        
        switch(strength) {
            case 0:
            case 1:
                widthPercentage = '16%';
                strengthClass = 'strength-weak';
                break;
            case 2:
                widthPercentage = '33%';
                strengthClass = 'strength-medium';
                break;
            case 3:
                widthPercentage = '50%';
                strengthClass = 'strength-medium';
                break;
            case 4:
                widthPercentage = '66%';
                strengthClass = 'strength-strong';
                break;
            case 5:
                widthPercentage = '83%';
                strengthClass = 'strength-strong';
                break;
            case 6:
                widthPercentage = '100%';
                strengthClass = 'strength-very-strong';
                break;
            default:
                widthPercentage = '0%';
                strengthClass = 'strength-weak';
        }
        
        // 创建或更新强度填充条
        let fill = strengthBar.querySelector('.strength-fill');
        if (!fill) {
            fill = document.createElement('div');
            fill.className = 'strength-fill';
            strengthBar.appendChild(fill);
        }
        
        // 更新样式
        if (fill) {
            fill.style.width = widthPercentage;
            // 移除旧的强度类
            fill.className = 'strength-fill'; // 保留基础类
            fill.classList.add(strengthClass);
        }
        
        // 更新标签文本
        if (strengthLabel) {
            switch(strength) {
                case 0:
                case 1:
                    strengthLabel.innerHTML = '密码强度: <span>极弱</span>';
                    break;
                case 2:
                    strengthLabel.innerHTML = '密码强度: <span>较弱</span>';
                    break;
                case 3:
                    strengthLabel.innerHTML = '密码强度: <span>中等</span>';
                    break;
                case 4:
                    strengthLabel.innerHTML = '密码强度: <span>较强</span>';
                    break;
                case 5:
                case 6:
                    strengthLabel.innerHTML = '密码强度: <span>极强</span>';
                    break;
                default:
                    strengthLabel.innerHTML = '密码强度: <span>未知</span>';
            }
        }
    }
    
    // 初始化强度指示器
    function initStrengthMeter() {
        const strengthMeterContainer = document.getElementById('strengthMeter');
        if (!strengthMeterContainer) return;
        
        // 创建必要的DOM元素（如果不存在）
        let strengthBar = strengthMeterContainer.querySelector('.strength-meter');
        let strengthLabel = strengthMeterContainer.querySelector('.strength-label');
        
        if (!strengthBar) {
            strengthBar = document.createElement('div');
            strengthBar.className = 'strength-meter';
            strengthMeterContainer.appendChild(strengthBar);
        }
        
        if (!strengthLabel) {
            strengthLabel = document.createElement('div');
            strengthLabel.className = 'strength-label';
            strengthMeterContainer.appendChild(strengthLabel);
        }
    }
    
    // 暴露公共方法
    window.StrengthMeter.renderStrengthMeter = renderStrengthMeter;
    window.StrengthMeter.initStrengthMeter = initStrengthMeter;
})();