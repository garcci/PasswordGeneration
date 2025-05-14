// 密码字符集
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+{}[]=<>/.,?~' + "-:\"|';:`"
};

// 修改密码生成功能
function generateSecurePassword(length, options) {
    const { uppercase, lowercase, numbers, symbols } = options;
    
    // 使用更安全的随机数生成方法
    function getRandomValue(max) {
        const array = new Uint32Array(1);
        // 在Web Worker中使用self.crypto而不是window.crypto
        if (typeof self !== 'undefined' && self.crypto && self.crypto.getRandomValues) {
            self.crypto.getRandomValues(array);
        } else {
            // 回退到Math.random()，虽然安全性较低
            array[0] = Math.floor(Math.random() * max);
        }
        return array[0] % max;
    }
    
    // 处理密码生成请求
    self.onmessage = function(e) {
        try {
            // 获取参数
            const { config } = e.data;
            
            // 验证配置
            if (!config || typeof config !== 'object') {
                throw new Error('无效的配置');
            }
            
            // 生成密码
            let password = '';
            const availableCharSets = [];
            
            if (config.uppercase) availableCharSets.push('uppercase');
            if (config.lowercase) availableCharSets.push('lowercase');
            if (config.numbers) availableCharSets.push('numbers');
            if (config.symbols) availableCharSets.push('symbols');
            
            // 验证至少有一个字符类型被选中
            if (availableCharSets.length === 0) {
                throw new Error('至少需要选择一种字符类型');
            }
            
            // 确保每种选中的字符类型都有至少一个字符
            availableCharSets.forEach(setName => {
                const charSet = charSets[setName];
                password += charSet[getRandomValue(charSet.length)];
            });
            
            // 如果密码长度不足指定长度，补充随机字符
            while (password.length < config.length) {
                const randomSet = availableCharSets[getRandomValue(availableCharSets.length)];
                const charSet = charSets[randomSet];
                password += charSet[getRandomValue(charSet.length)];
            }
            
            // 将密码转换为数组进行随机排序
            password = password.split('').sort(() => Math.random() - 0.5).join('');
            
            // 确保字母开头的规则
            if ((config.uppercase || config.lowercase) && !/^[a-zA-Z]/.test(password)) {
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
            if (config.uppercase && config.lowercase) {
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
            
            // 确保密码不是常见的弱密码
            const weakPasswords = [
                'password', '123456', 'qwerty', 'abc123',
                'password1', '123456789', 'iloveyou', 'admin',
                'welcome', 'monkey', 'login', 'princess'
            ];
            
            if (weakPasswords.includes(password.toLowerCase())) {
                // 如果生成的是弱密码，递归重新生成
                return generateSecurePassword(config.length, {
                    uppercase: config.uppercase,
                    lowercase: config.lowercase,
                    numbers: config.numbers,
                    symbols: config.symbols
                });
            }
            
            // 返回结果给主线程
            self.postMessage({ 
                password,
                strength: getPasswordStrength(password)
            });
        } catch (error) {
            self.postMessage({ error: error.message });
        }
    };

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
}

// 添加错误处理
try {
    // 检查是否在Web Worker上下文中
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        // 在Web Worker中
        self.onmessage = function(e) {
            if (e.data.config) {
                const password = generateSecurePassword(e.data.config.length, {
                    uppercase: e.data.config.uppercase,
                    lowercase: e.data.config.lowercase,
                    numbers: e.data.config.numbers,
                    symbols: e.data.config.symbols
                });
                
                self.postMessage({ password: password });
            }
        };
    }
} catch (error) {
    console.error('Web Worker初始化错误:', error);
    // 创建一个简单的密码生成函数作为回退
    function simpleGeneratePassword(length = 12, options = { uppercase: true, lowercase: true, numbers: true, symbols: true }) {
        const chars = [];
        
        if (options.uppercase) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        if (options.lowercase) chars.push(...'abcdefghijklmnopqrstuvwxyz');
        if (options.numbers) chars.push(...'0123456789');
        if (options.symbols) chars.push(...'!@#$%^&*()_+{}[]=<>/-');
        
        if (chars.length === 0) {
            return '';
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }
        
        return password;
    }
}
