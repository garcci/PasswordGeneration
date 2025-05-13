// 密码生成器主函数
function generateSecurePassword(length, options) {
    const { uppercase, lowercase, numbers, symbols } = options;
    
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

    // 确保满足最小长度要求
    if (length < 8 || length > 128) {
        throw new Error('密码长度必须在8到128位之间');
    }

    // 确保每种选中的字符类型都有至少一个字符
    let password = '';
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
    if ((uppercase || lowercase) && password[0].match(/[^a-zA-Z]/)) {
        // 找到第一个字母的位置
        for (let i = 0; i < password.length; i++) {
            if (password[i].match(/[a-zA-Z]/)) {
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
            if (password[i].match(/[A-Z]/)) {
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

// 表单提交处理
document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    try {
        const length = parseInt(document.getElementById('length').value);
        const uppercase = document.getElementById('uppercase').checked;
        const lowercase = document.getElementById('lowercase').checked;
        const numbers = document.getElementById('numbers').checked;
        const symbols = document.getElementById('symbols').checked;
        
        const options = { uppercase, lowercase, numbers, symbols };
        
        const password = generateSecurePassword(length, options);
        
        // 显示密码并添加动画效果
        const display = document.getElementById('passwordDisplay');
        display.textContent = password;
        display.style.opacity = 0;
        display.style.transform = 'translateY(20px)';
        setTimeout(() => {
            display.style.transition = 'all 0.5s ease-in';
            display.style.opacity = 1;
            display.style.transform = 'translateY(0)';
        }, 50);
        
        // 添加按钮点击反馈动画
        const button = this.querySelector('button');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1.05)';
        }, 200);
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 400);
    } catch (error) {
        console.error('密码生成错误:', error);
        alert(error.message);
    }
});

// 添加页面加载动画
window.addEventListener('load', () => {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    container.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        container.style.transition = 'all 1s ease-out';
        container.style.opacity = 1;
        container.style.transform = 'translateY(0)';
    }, 100);
});

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