// 密码生成器主函数
function generateSecurePassword(length, options) {
    // 确保options对象存在并有默认值
    options = options || {};
    
    // 默认启用所有字符类型，如果未提供或为undefined
    const { 
        uppercase = true, 
        lowercase = true, 
        numbers = true, 
        symbols = true 
    } = options;
    
    // 定义字符集
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+{}[]=<>/.,?~' + "-:\"|';:`"
    };

    // 确定使用的字符集
    const availableCharSets = [];
    if (uppercase) availableCharSets.push('uppercase');
    if (lowercase) availableCharSets.push('lowercase');
    if (numbers) availableCharSets.push('numbers');
    if (symbols) availableCharSets.push('symbols');

    // 验证至少有一个字符类型被选中
    if (availableCharSets.length === 0) {
        throw new Error('至少需要选择一种字符类型');
    }

    // 确保长度有效
    length = parseInt(length) || 12; // 默认长度为12
    if (length < 8 || length > 128) {
        throw new Error('密码长度必须在8到128位之间');
    }

    // 如果密码长度不足指定长度，补充随机字符
    let password = '';
    
    // 确保每种选中的字符类型都有至少一个字符
    availableCharSets.forEach(setName => {
        const charSet = charSets[setName];
        password += charSet[Math.floor(Math.random() * charSet.length)];
    });

    // 如果密码长度不足指定长度，补充随机字符
    while (password.length < length) {
        const randomSet = availableCharSets[Math.floor(Math.random() * availableCharSets.length)];
        const charSet = charSets[randomSet];
        password += charSet[Math.floor(Math.random() * charSet.length)];
    }

    // 将密码转换为数组进行随机排序
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    // 确保字母开头的规则
    if ((uppercase || lowercase) && !/^[a-zA-Z]/.test(password)) {
        // 找到第一个字母的位置
        for (let i = 0; i < password.length; i++) {
            if (/[a-zA-Z]/.test(password[i])) {
                // 将第一个字母移到开头
                password = password[i] + password.slice(0, i) + password.slice(i + 1);
                break;
            }
        }
    }

    // 确保大写字母开头的规则（当同时选择了大小写）
    if (uppercase && lowercase) {
        let firstUpperCaseIndex = -1;
        for (let i = 0; i < password.length; i++) {
            if (/[A-Z]/.test(password[i])) {
                firstUpperCaseIndex = i;
                break;
            }
        }
        
        if (firstUpperCaseIndex !== -1 && firstUpperCaseIndex !== 0) {
            // 将第一个大写字母移到开头
            password = password[firstUpperCaseIndex] + password.slice(0, firstUpperCaseIndex) + password.slice(firstUpperCaseIndex + 1);
        }
    }

    return password;
}

// 获取密码强度评估
function getPasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 12) strength += 2;
    else if (password.length >= 8) strength += 1;
    
    // 检查字符多样性
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumbers) strength++;
    if (hasSymbols) strength++;
    
    return Math.min(strength, 6);
}

// 更新密码强度指示器
function updateStrengthMeter(password) {
    const strengthMeter = document.getElementById('strengthMeter');
    if (!strengthMeter) return;
    
    const strengthBar = strengthMeter.querySelector('.strength-bar');
    const strengthFill = strengthMeter.querySelector('.strength-fill');
    const strengthLabel = strengthMeter.querySelector('.strength-label span');
    
    if (!password) {
        strengthFill.style.width = '0%';
        strengthLabel.textContent = '无';
        return;
    }
    
    const strength = getPasswordStrength(password);
    const strengthPercentage = (strength / 6) * 100;
    strengthFill.style.width = `${strengthPercentage}%`;
    
    let strengthText = '';
    switch (true) {
        case (strength <= 1):
            strengthText = '极弱';
            break;
        case (strength <= 2):
            strengthText = '弱';
            break;
        case (strength <= 3):
            strengthText = '中等';
            break;
        case (strength <= 4):
            strengthText = '强';
            break;
        default:
            strengthText = '极强';
    }
    
    strengthLabel.textContent = strengthText;
}

// 分析密码
function analyzePassword(password) {
    if (!password) return;
    
    // 计算密码熵值
    let charSpace = 0;
    if (/[A-Z]/.test(password)) charSpace += 26;
    if (/[a-z]/.test(password)) charSpace += 26;
    if (/[0-9]/.test(password)) charSpace += 10;
    if (/[^A-Za-z0-9]/.test(password)) charSpace += 32;
    
    const entropy = password.length * Math.log2(charSpace);
    
    // 评估重复模式
    const hasRepeatedChars = /(.)\1{2,}/.test(password);
    const hasSequences = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password);
    
    // 创建分析结果
    let analysisHTML = `<div class="password-analysis">
        <h3>密码分析</h3>
        <p>长度: ${password.length} 字符</p>
        <p>字符空间: ~${charSpace} 种可能字符</p>
        <p>熵值: ${entropy.toFixed(2)} bits</p>`;
    
    if (hasRepeatedChars) {
        analysisHTML += '<p style="color: #dc3545;">警告: 检测到重复字符</p>';
    }
    
    if (hasSequences) {
        analysisHTML += '<p style="color: #dc3545;">警告: 检测到连续字符序列</p>';
    }
    
    analysisHTML += '</div>';
    
    // 显示分析结果
    const container = document.querySelector('.container');
    let analysisDiv = container ? container.querySelector('.password-analysis') : null;
    
    if (!analysisDiv && container) {
        analysisDiv = document.createElement('div');
        analysisDiv.className = 'password-analysis';
        container.appendChild(analysisDiv);
    }
    
    if (analysisDiv) {
        analysisDiv.innerHTML = analysisHTML;
        
        // 添加动画效果
        analysisDiv.style.opacity = 0;
        setTimeout(() => {
            analysisDiv.style.transition = 'opacity 0.5s ease';
            analysisDiv.style.opacity = 1;
        }, 100);
    }
}