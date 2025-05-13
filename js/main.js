// 防抖函数
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否所有需要的元素都存在
    const requiredElements = [
        'length',
        'uppercase',
        'lowercase',
        'numbers',
        'symbols',
        'passwordDisplay',
        'strengthMeter',
        'passwordForm'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length === 0) {
        init();
    } else {
        console.error('缺少必要DOM元素:', missingElements);
        // 设置一个观察器，在元素准备好后初始化
        const observer = new MutationObserver(() => {
            const stillMissing = requiredElements.filter(id => !document.getElementById(id));
            if (stillMissing.length === 0) {
                observer.disconnect();
                init();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

// 初始化函数
function init() {
    // 初始化密码管理器
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
    
    // 页面加载时恢复配置
    window.addEventListener('load', () => {
        // 尝试从localStorage加载配置
        const savedConfig = localStorage.getItem('passwordConfig');
        
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                
                // 应用保存的配置
                const lengthInput = document.getElementById('length');
                const uppercaseInput = document.getElementById('uppercase');
                const lowercaseInput = document.getElementById('lowercase');
                const numbersInput = document.getElementById('numbers');
                const symbolsInput = document.getElementById('symbols');
                
                if (lengthInput) lengthInput.value = config.length;
                if (uppercaseInput) uppercaseInput.checked = config.uppercase;
                if (lowercaseInput) lowercaseInput.checked = config.lowercase;
                if (numbersInput) numbersInput.checked = config.numbers;
                if (symbolsInput) symbolsInput.checked = config.symbols;
                
                // 显示配置恢复提示
                showConfigMessage('已恢复上次使用的配置', 'success');
                
                // 自动生成新密码
                const event = new Event('submit');
                const passwordForm = document.getElementById('passwordForm');
                if (passwordForm) {
                    passwordForm.dispatchEvent(event);
                }
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
    
    // 表单提交处理
    const form = document.getElementById('passwordForm');
    form.addEventListener('submit', debounce(function(e) {
        // 阻止事件冒泡和默认行为的强化方法
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        
        // 移除不兼容的window.event.returnValue方式
        // 用CSS类的方式替代实现防止刷新
        document.body.classList.add('prevent-refresh');
        setTimeout(() => {
            document.body.classList.remove('prevent-refresh');
        }, 10);
        
        try {
            // 获取表单值
            const lengthInput = document.getElementById('length');
            const uppercaseInput = document.getElementById('uppercase');
            const lowercaseInput = document.getElementById('lowercase');
            const numbersInput = document.getElementById('numbers');
            const symbolsInput = document.getElementById('symbols');
            
            let length = 12;
            let uppercase = true;
            let lowercase = true;
            let numbers = true;
            let symbols = true;
            
            // 只有在元素存在时才读取值
            if (lengthInput) {
                length = parseInt(lengthInput.value) || 12;
            }
            
            if (uppercaseInput) {
                uppercase = Boolean(uppercaseInput.checked);
            }
            
            if (lowercaseInput) {
                lowercase = Boolean(lowercaseInput.checked);
            }
            
            if (numbersInput) {
                numbers = Boolean(numbersInput.checked);
            }
            
            if (symbolsInput) {
                symbols = Boolean(symbolsInput.checked);
            }
            
            // 如果所有字符类型都是false，则启用所有类型
            const allFalse = !(uppercase || lowercase || numbers || symbols);
            if (allFalse) {
                uppercase = true;
                lowercase = true;
                numbers = true;
                symbols = true;
            }
            
            // 保存当前配置到localStorage
            const currentConfig = {
                length,
                uppercase,
                lowercase,
                numbers,
                symbols
            };
            
            localStorage.setItem('passwordConfig', JSON.stringify(currentConfig));
            
            // 使用密码管理器更新配置
            if (window.PasswordManager && window.PasswordManager.updateConfig) {
                window.PasswordManager.updateConfig(currentConfig);
            }
            
            // 使用密码管理器生成唯一密码（传递当前配置）
            const password = window.PasswordManager.generateUniquePassword(currentConfig);
            
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
            }
            
            // 更新密码强度指示器
            const strengthMeter = document.getElementById('strengthMeter');
            if (strengthMeter) {
                updateStrengthMeter(password);
            }
            
            // 添加按钮点击反馈动画
            const button = form.querySelector('button');
            if (button) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1.05)';
                }, 200);
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 400);
            }
            
            // 添加复制功能
            const copyButton = document.getElementById('copyButton');
            if (copyButton) {
                copyButton.onclick = () => {
                    const password = document.getElementById('passwordDisplay').textContent;
                    navigator.clipboard.writeText(password).then(() => {
                        // 添加复制成功动画
                        copyButton.textContent = '已复制!';
                        copyButton.style.backgroundColor = '#28a745';
                        
                        // 添加到密码历史记录（作为备份）
                        addPasswordToHistory(password);
                        
                        setTimeout(() => {
                            copyButton.textContent = '复制密码';
                            copyButton.style.backgroundColor = '#007BFF';
                        }, 2000);
                    }).catch(err => {
                        console.error('复制到剪贴板失败: ', err);
                        alert('复制到剪贴板失败，请手动复制');
                        
                        // 如果复制失败，也尝试添加到历史记录（作为备用）
                        addPasswordToHistory(password);
                    });
                };
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
    
    // 使用代理事件监听防止表单提交
    const observer = new MutationObserver(() => {
        const form = document.getElementById('passwordForm');
        if (form && !form._listenerAdded) {
            form.onsubmit = function(e) {
                if (e && e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            };
            
            form._listenerAdded = true;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 在DOM加载后立即设置阻止提交
    setTimeout(() => {
        const form = document.getElementById('passwordForm');
        if (form) {
            form.onsubmit = function(e) {
                if (e && e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            };
            
            form._listenerAdded = true;
        }
    }, 100);
}
