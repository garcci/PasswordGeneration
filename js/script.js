// 密码生成器主函数
function generateSecurePassword(length, options) {
    console.log('generateSecurePassword 被调用:', { length, options });
    
    // 确保options对象存在并有默认值
    options = options || {};
    
    // 默认启用所有字符类型，如果未提供或为undefined
    const { 
        uppercase = true, 
        lowercase = true, 
        numbers = true, 
        symbols = true 
    } = options;
    
    console.log('使用配置:', { uppercase, lowercase, numbers, symbols });
    
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

    console.log('可用字符集:', availableCharSets);
    
    // 验证至少有一个字符类型被选中
    if (availableCharSets.length === 0) {
        console.error('没有选择任何字符类型');
        throw new Error('至少需要选择一种字符类型');
    }

    // 确保长度有效
    length = parseInt(length) || 12; // 默认长度为12
    if (length < 8 || length > 128) {
        console.error('无效的密码长度:', length);
        throw new Error('密码长度必须在8到128位之间');
    }
    
    console.log('生成密码长度:', length);

    // 如果密码长度不足指定长度，补充随机字符
    let password = '';
    
    // 确保每种选中的字符类型都有至少一个字符
    availableCharSets.forEach(setName => {
        const charSet = charSets[setName];
        password += charSet[Math.floor(Math.random() * charSet.length)];
    });

    console.log('初步密码:', password);
    
    // 如果密码长度不足指定长度，补充随机字符
    while (password.length < length) {
        const randomSet = availableCharSets[Math.floor(Math.random() * availableCharSets.length)];
        const charSet = charSets[randomSet];
        password += charSet[Math.floor(Math.random() * charSet.length)];
    }

    console.log('最终密码:', password);
    
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

    console.log('调整后密码:', password);
    return password;
}

// 表单提交处理
document.getElementById('passwordForm').addEventListener('submit', 
  debounce(function(e) {
    console.log('表单提交事件触发');
    e.preventDefault(); // 阻止默认的表单提交行为
    
    // 确保事件对象正确
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // 为了更安全地阻止冒泡和捕获
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    try {
        // 尝试从localStorage获取配置
        const savedConfig = localStorage.getItem('passwordConfig');
        let length, uppercase, lowercase, numbers, symbols;
        
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                console.log('加载保存的配置:', config);
                length = config.length;
                uppercase = config.uppercase;
                lowercase = config.lowercase;
                numbers = config.numbers;
                symbols = config.symbols;
            } catch (error) {
                console.error('配置解析失败:', error);
            }
        }
        
        // 如果没有保存的配置或解析失败，则使用默认值
        if (!savedConfig || !length) {
            length = 12; // 默认长度
            console.log('使用默认长度:', length);
        }
        
        // 确保长度在有效范围内
        if (length < 8 || length > 128) {
            length = 12;
            console.log('重置为有效长度:', length);
        }
        
        // 确保字符类型为布尔值（特别是当它们可能是undefined时）
        uppercase = Boolean(uppercase);
        lowercase = Boolean(lowercase);
        numbers = Boolean(numbers);
        symbols = Boolean(symbols);
        
        // 如果所有字符类型都是false，则启用所有类型
        if (!uppercase && !lowercase && !numbers && !symbols) {
            uppercase = true;
            lowercase = true;
            numbers = true;
            symbols = true;
            console.log('启用所有字符类型');
        }
        
        console.log('最终配置:', { length, uppercase, lowercase, numbers, symbols });
        
        // 更新表单显示
        const lengthInput = document.getElementById('length');
        const uppercaseInput = document.getElementById('uppercase');
        const lowercaseInput = document.getElementById('lowercase');
        const numbersInput = document.getElementById('numbers');
        const symbolsInput = document.getElementById('symbols');
        
        if (lengthInput) lengthInput.value = length;
        if (uppercaseInput) uppercaseInput.checked = uppercase;
        if (lowercaseInput) lowercaseInput.checked = lowercase;
        if (numbersInput) numbersInput.checked = numbers;
        if (symbolsInput) symbolsInput.checked = symbols;
        
        // 保存当前配置到localStorage
        const currentConfig = {
            length,
            uppercase,
            lowercase,
            numbers,
            symbols
        };
        
        localStorage.setItem('passwordConfig', JSON.stringify(currentConfig));
        console.log('配置已保存至localStorage');
        
        const options = { uppercase, lowercase, numbers, symbols };
        
        const password = generateSecurePassword(length, options);
        console.log('生成的密码:', password);
        
        // 显示密码并添加动画效果
        const display = document.getElementById('passwordDisplay');
        if (display) {
            display.textContent = password;
            display.style.opacity = 0;
            display.style.transform = 'translateY(20px)';
            setTimeout(() => {
                display.style.transition = 'all 0.5s ease-in';
                display.style.opacity = 1;
                display.style.transform = 'translateY(0)';
            }, 50);
        } else {
            console.error('密码显示元素未找到');
        }
        
        // 更新密码强度指示器
        const strengthMeter = document.getElementById('strengthMeter');
        if (strengthMeter) {
            updateStrengthMeter(password);
        } else {
            console.error('强度指示器未找到');
        }
        
        // 添加按钮点击反馈动画
        const form = document.getElementById('passwordForm');
        const button = form ? form.querySelector('button') : null;
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1.05)';
            }, 200);
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 400);
        } else {
            console.error('表单或按钮未找到');
        }
        
        // 添加复制功能
        const copyButton = document.getElementById('copyButton');
        if (copyButton) {
            copyButton.onclick = () => {
                navigator.clipboard.writeText(password).then(() => {
                    // 添加复制成功动画
                    copyButton.textContent = '已复制!';
                    copyButton.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        copyButton.textContent = '复制密码';
                        copyButton.style.backgroundColor = '#007BFF';
                    }, 2000);
                }).catch(err => {
                    console.error('复制到剪贴板失败: ', err);
                    alert('复制到剪贴板失败，请手动复制');
                });
            };
        } else {
            console.error('复制按钮未找到');
        }
        
        // 分析密码
        analyzePassword(password);
    } catch (error) {
        console.error('密码生成错误:', error);
        alert(error.message);
    }
    
    // 返回false以阻止表单提交
    return false;
}, 300));

// 防止表单提交的另一种方法
document.getElementById('passwordForm').onsubmit = function(e) {
    e.preventDefault();
    return false;
};

// 防抖函数
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// 页面加载时恢复配置
window.addEventListener('load', () => {
    // 尝试从localStorage加载配置
    const savedConfig = localStorage.getItem('passwordConfig');
    
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            // 应用保存的配置
            document.getElementById('length').value = config.length;
            document.getElementById('uppercase').checked = config.uppercase;
            document.getElementById('lowercase').checked = config.lowercase;
            document.getElementById('numbers').checked = config.numbers;
            document.getElementById('symbols').checked = config.symbols;
            
            // 显示配置恢复提示
            showConfigMessage('已恢复上次使用的配置', 'success');
            
            // 自动生成新密码
            const event = new Event('submit');
            document.getElementById('passwordForm').dispatchEvent(event);
        } catch (error) {
            console.error('配置恢复失败:', error);
            showConfigMessage('配置恢复失败，使用默认设置', 'error');
        }
    }
    
    // 添加暗色模式切换按钮
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'darkModeToggle';
    darkModeToggle.textContent = '切换暗色模式';
    darkModeToggle.style.position = 'absolute';
    darkModeToggle.style.top = '20px';
    darkModeToggle.style.right = '20px';
    darkModeToggle.style.zIndex = '1000';
    darkModeToggle.style.padding = '8px 16px';
    darkModeToggle.style.fontSize = '14px';
    darkModeToggle.style.borderRadius = '8px';
    darkModeToggle.style.cursor = 'pointer';
    darkModeToggle.style.transition = 'all 0.3s ease';
    document.body.appendChild(darkModeToggle);

    // 暗色模式切换功能
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') 
            ? '切换亮色模式' 
            : '切换暗色模式';
    });
});

// 密码强度评估函数
function getPasswordStrength(password) {
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
    if (!strengthMeter) return; // 添加空值检查
    
    const strengthBar = strengthMeter.querySelector('.strength-bar');
    const strengthLabel = strengthMeter.querySelector('.strength-label span');
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthLabel.textContent = '无';
        return;
    }
    
    const strength = getPasswordStrength(password);
    const strengthPercentage = (strength / 6) * 100;
    strengthBar.style.width = `${strengthPercentage}%`;
    
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

// 显示配置消息
function showConfigMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'config-message';
    messageDiv.textContent = message;
    messageDiv.style.opacity = 0;
    
    const container = document.querySelector('.container');
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
            container.removeChild(messageDiv);
        }, 500);
    }, 3000);
    
    // 根据类型设置颜色
    if (type === 'error') {
        messageDiv.style.color = '#dc3545';
    }
}

// 密码分析函数
function analyzePassword(password) {
    if (!password) return;
    
    // 计算密码熵值
    let charSpace = 0;
    if (/[A-Z]/.test(password)) charSpace += 26;
    if (/[a-z]/.test(password)) charSpace += 26;
    if (/[0-9]/.test(password)) charSpace += 10;
    if (/[^A-Za-z0-9]/.test(password)) charSpace += 32; // 粗略估计特殊字符数量
    
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
    let analysisDiv = container.querySelector('.password-analysis');
    
    if (!analysisDiv) {
        analysisDiv = document.createElement('div');
        analysisDiv.className = 'password-analysis';
        container.appendChild(analysisDiv);
    }
    
    analysisDiv.innerHTML = analysisHTML;
    
    // 添加动画效果
    analysisDiv.style.opacity = 0;
    setTimeout(() => {
        analysisDiv.style.transition = 'opacity 0.5s ease';
        analysisDiv.style.opacity = 1;
    }, 100);
}

// 添加交互效果：输入框获得焦点时的动画
const inputs = document.querySelectorAll('input, button');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.style.borderColor = '#007BFF';
    });
    
    input.addEventListener('blur', () => {
        input.style.borderColor = '#ddd';
    });
});

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
    
    // 保持最多10条记录
    if (history.length > 10) {
        history = history.slice(0, 10);
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