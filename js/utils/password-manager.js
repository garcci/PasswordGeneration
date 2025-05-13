// 密码历史记录缓存
let generatedPasswords = new Set();

// 最大尝试次数常量
const MAX_GENERATION_ATTEMPTS = 100;

// 密码配置
let currentConfig = {
    length: 12,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
};

// 初始化函数
function initPasswordManager(config) {
    // 如果提供了新配置，则更新当前配置
    if (config) {
        updateConfig(config);
    }
    
    // 加载历史记录
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        try {
            const history = JSON.parse(savedHistory);
            // 将保存的历史密码添加到内存集合中
            history.forEach(item => {
                if (item && item.password) {
                    generatedPasswords.add(item.password);
                }
            });
        } catch (error) {
            console.error('无法解析历史记录:', error);
        }
    }
}

// 更新配置
function updateConfig(config) {
    currentConfig = {
        length: parseInt(config.length) || 12,
        uppercase: Boolean(config.uppercase),
        lowercase: Boolean(config.lowercase),
        numbers: Boolean(config.numbers),
        symbols: Boolean(config.symbols)
    };
    
    // 当配置改变时，重置历史记录计数器（可选）
    // resetPasswordHistoryCounter();
}

// 获取当前配置
function getCurrentConfig() {
    return {
        ...currentConfig
    };
}

// 生成唯一密码函数
function generateUniquePassword(newConfig) {
    // 如果提供了新配置，在生成前更新配置
    if (newConfig) {
        updateConfig(newConfig);
    }
    
    const options = {
        uppercase: currentConfig.uppercase,
        lowercase: currentConfig.lowercase,
        numbers: currentConfig.numbers,
        symbols: currentConfig.symbols
    };
    
    let attempts = 0;
    let password;
    
    // 尝试生成不重复的密码
    do {
        password = generateSecurePassword(currentConfig.length, options);
        attempts++;
        
        // 如果达到最大尝试次数，清除部分历史记录以允许新密码
        if (attempts > MAX_GENERATION_ATTEMPTS) {
            clearOldPasswordHistory();
            attempts = 0; // 重置计数器
        }
    } while (generatedPasswords.has(password));
    
    // 将新密码添加到历史记录
    generatedPasswords.add(password);
    
    // 更新本地存储的历史记录
    updatePasswordHistoryStorage(password);
    
    return password;
}

// 清除旧的历史记录
function clearOldPasswordHistory() {
    // 移除最早的一半历史记录
    const history = Array.from(generatedPasswords);
    const keepCount = Math.max(5, Math.floor(generatedPasswords.size / 2));
    
    // 清空现有集合
    generatedPasswords.clear();
    
    // 添加较新的记录
    for (let i = keepCount; i < history.length; i++) {
        generatedPasswords.add(history[i]);
    }
}

// 更新本地存储中的历史记录
function updatePasswordHistoryStorage(password) {
    // 创建新的历史记录
    const history = Array.from(generatedPasswords);
    
    // 保持最多100条记录（可以根据需要调整）
    if (history.length > 100) {
        history.splice(0, history.length - 100);
    }
    
    // 更新内存中的历史记录
    generatedPasswords = new Set(history);
    
    // 更新localStorage
    localStorage.setItem('passwordHistory', JSON.stringify(
        Array.from(generatedPasswords).map(password => ({
            password,
            timestamp: new Date().toISOString()
        }))
    ));
    
    // 更新UI显示
    loadPasswordHistory();
}

// 重置已生成的密码历史
function resetPasswordHistory() {
    generatedPasswords.clear();
    localStorage.removeItem('passwordHistory');
    
    // 更新UI显示
    loadPasswordHistory();
}

// 检查密码是否已经生成过
function isPasswordGenerated(password) {
    return generatedPasswords.has(password);
}

// 获取当前历史记录大小
function getPasswordHistorySize() {
    return generatedPasswords.size;
}

// 在页面加载时初始化
window.addEventListener('load', () => {
    // 从localStorage加载配置
    const savedConfig = localStorage.getItem('passwordConfig');
    let config;
    
    if (savedConfig) {
        try {
            config = JSON.parse(savedConfig);
        } catch (error) {
            console.error('配置解析失败:', error);
        }
    }
    
    // 初始化密码管理器
    initPasswordManager(config);
});

// 暴露公共方法
window.PasswordManager = {
    generateUniquePassword,
    updateConfig,
    getCurrentConfig,
    resetPasswordHistory,
    isPasswordGenerated,
    getPasswordHistorySize
};