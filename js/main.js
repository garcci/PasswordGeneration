// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 在开发环境下注册Service Worker
    // 通过检查URL来判断是否是生产环境
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return;
    }
    
    navigator.serviceWorker.register('/js/utils/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// 防抖函数
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// 添加滑动条交互功能
function initPasswordSlider() {
    const sliderContainer = document.getElementById('lengthSlider');
    if (!sliderContainer) return;
    
    // 创建轨道元素（如果不存在）
    if (!sliderContainer.querySelector('.slider-track')) {
        const track = document.createElement('div');
        track.className = 'slider-track';
        
        const fill = document.createElement('div');
        fill.className = 'slider-fill';
        
        track.appendChild(fill);
        sliderContainer.appendChild(track);
    }
    
    const valueDisplay = sliderContainer.querySelector('.dynamic-value-tooltip');
    const track = sliderContainer.querySelector('.slider-track');
    const fill = sliderContainer.querySelector('.slider-fill');
    const slider = sliderContainer.querySelector('.ios-slider'); // 修复slider变量定义
    
    // 优化滑动事件处理函数
    function updateSlider() {
        // 使用requestAnimationFrame优化性能
        requestAnimationFrame(() => {
            // 更新填充宽度
            if (fill) {
                const min = parseInt(slider.min) || 8;
                const max = parseInt(slider.max) || 128;
                const percent = ((slider.value - min) / (max - min)) * 100;
                fill.style.width = `${percent}%`;
            }

            // 更新显示值和位置
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;

                // 调整显示位置以跟随当前百分比
                const min = parseInt(slider.min) || 8;
                const max = parseInt(slider.max) || 128;
                const percent = ((slider.value - min) / (max - min)) * 100;

                // 使用transform进行位置更新
                valueDisplay.style.transform = `translateX(${percent}%)
                                              translateX(-50%)`;
            }
        });
    }
    
    // 初始更新
    updateSlider();
    
    // 设置初始值
    const savedConfig = localStorage.getItem('passwordConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            slider.value = config.length || 12;
        } catch (error) {
            console.error('配置解析失败:', error);
            slider.value = 12;
        }
    } else {
        slider.value = 12;
    }
    
    // 更新显示
    updateSlider();
    
    // 添加触摸区域交互（使用整个容器作为触摸区域）
    sliderContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        updateValueFromPosition(e.clientX);
        
        const handleMouseMove = (e) => {
            e.preventDefault();
            updateValueFromPosition(e.clientX);
            requestAnimationFrame(updateSlider);
        };
        
        const stopDragging = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopDragging);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopDragging);
    });
    
    // 触摸事件（移动设备）
    sliderContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            updateValueFromPosition(e.touches[0].clientX);
            
            const handleTouchMove = (e) => {
                e.preventDefault();
                
                if (e.touches.length === 1) {
                    updateValueFromPosition(e.touches[0].clientX);
                    requestAnimationFrame(updateSlider);
                }
            };
            
            const stopTouch = () => {
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', stopTouch);
            };
            
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', stopTouch);
        }
    });
    
    // 计算点击位置并更新滑动条值
    function updateValueFromPosition(clientX) {
        const rect = sliderContainer.getBoundingClientRect();
        const pos = clientX - rect.left;
        const percent = pos / rect.width;
        let newValue = Math.round(percent * (slider.max - slider.min)) + parseInt(slider.min);
        
        // 限制最小值为8
        newValue = Math.max(parseInt(slider.min), newValue);
        // 限制最大值为128
        newValue = Math.min(parseInt(slider.max), newValue);
        
        slider.value = newValue;
        // 手动触发input事件以更新界面
        const inputEvent = new Event('input', { bubbles: true });
        slider.dispatchEvent(inputEvent);
        
        // 触发自定义更新
        updateSlider();
    }
}

// 在DOM加载后初始化
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
        initPasswordSlider();
        
        // 初始化开关样式
        document.querySelectorAll('.border-toggle').forEach(switchElement => {
            switchElement.style.setProperty('--track-color', '#007BFF');
            switchElement.style.setProperty('--thumb-color', 'white');
        });
        
        // 确保初始化复制按钮
        initCopyButton();
        
        // 移除了查看按钮的初始化
    } else {
        console.error('缺少必要DOM元素:', missingElements);
        // 设置一个观察器，在元素准备好后初始化
        const observer = new MutationObserver(() => {
            const stillMissing = requiredElements.filter(id => !document.getElementById(id));
            if (stillMissing.length === 0) {
                observer.disconnect();
                init();
                initPasswordSlider();
                
                // 初始化开关样式
                document.querySelectorAll('.border-toggle').forEach(switchElement => {
                    switchElement.style.setProperty('--track-color', '#007BFF');
                    switchElement.style.setProperty('--thumb-color', 'white');
                });
                
                // 确保初始化复制按钮
                initCopyButton();
                
                // 移除了查看按钮的初始化
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

// 初始化复制按钮
function initCopyButton() {
    const copyButton = document.getElementById('copyButton');
    if (copyButton && !copyButton.getAttribute('data-listener-added')) {
        copyButton.addEventListener('click', () => {
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
                
                // 如果复制失败，也尝试添加到历史记录（作为备份）
                const password = document.getElementById('passwordDisplay').textContent;
                addPasswordToHistory(password);
            });
            
            copyButton.setAttribute('data-listener-added', 'true');
        });
    }
}

// 移除了initViewButton函数
// 在文件顶部添加组件相关变量
let strengthMeterModule;
let passwordDisplayModule;
let passwordHistoryModule;
let passwordWorker = null;

// 添加配置消息显示函数
function showConfigMessage(message, type = 'info') {
    // 创建消息容器（如果不存在）
    let messageContainer = document.getElementById('configMessage');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'configMessage';
        messageContainer.className = `config-message ${type}`;

        // 设置基本样式
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.padding = '12px 24px';
        messageContainer.style.borderRadius = '8px';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.opacity = '0';
        messageContainer.style.transition = 'opacity 0.3s ease';
        messageContainer.style.fontFamily = 'Arial, sans-serif';
        messageContainer.style.fontSize = '15px';

        // 根据类型设置样式
        switch(type) {
            case 'success':
                messageContainer.style.backgroundColor = '#28a745';
                messageContainer.style.color = '#ffffff';
                break;
            case 'error':
                messageContainer.style.backgroundColor = '#dc3545';
                messageContainer.style.color = '#ffffff';
                break;
            default:
                messageContainer.style.backgroundColor = '#007BFF';
                messageContainer.style.color = '#ffffff';
        }

        document.body.appendChild(messageContainer);
    }

    // 更新消息内容和显示
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    messageContainer.style.opacity = '1';

    // 隐藏现有消息并显示新消息
    hideConfigMessage();
    setTimeout(() => {
        messageContainer.style.opacity = '1';
    }, 10);

    // 3秒后自动隐藏
    setTimeout(() => {
        hideConfigMessage();
    }, 3000);
}

// 隐藏配置消息的函数
function hideConfigMessage() {
    const messageContainer = document.getElementById('configMessage');
    if (messageContainer) {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 300);
    }
}

// 动态加载组件（模拟ES6 import的替代方案）
function loadComponents() {
    // 加载密码强度指示器组件
    const strengthMeterScript = document.createElement('script');
    strengthMeterScript.src = 'js/components/strength-meter.js';
    document.head.appendChild(strengthMeterScript);
    
    // 加载密码显示组件
    const passwordDisplayScript = document.createElement('script');
    passwordDisplayScript.src = 'js/components/password-display.js';
    document.head.appendChild(passwordDisplayScript);
    
    // 加载密码历史记录组件
    const passwordHistoryScript = document.createElement('script');
    passwordHistoryScript.src = 'js/components/password-history.js';
    document.head.appendChild(passwordHistoryScript);
    
    // 使用setTimeout等待脚本加载
    setTimeout(() => {
        strengthMeterModule = window.StrengthMeter;
        passwordDisplayModule = window.PasswordDisplay;
        passwordHistoryModule = window.PasswordHistory;
        
        // 初始化所有组件
        if (typeof initStrengthMeter === 'function') {
            initStrengthMeter();
        }
        if (typeof initPasswordDisplay === 'function') {
            initPasswordDisplay();
        }
        if (typeof initPasswordHistory === 'function') {
            initPasswordHistory();
        }
        
        // 使用historyUtils加载历史记录并在加载后渲染每个密码
        const history = window.historyUtils ? window.historyUtils.addPasswordToHistory : null;
        if (history) {
            const storedHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
            storedHistory.forEach(password => {
                window.PasswordHistory.renderPasswordHistory(password);
            });
        }
    }, 100);
}

// 添加新的历史记录加载函数
function loadPasswordHistory() {
    try {
        // 获取历史记录容器
        const passwordList = document.getElementById('passwordHistoryList');
        if (!passwordList) return;
        
        // 从localStorage获取历史记录
        const historyData = localStorage.getItem('passwordHistory');
        if (!historyData) return;
        
        let history = [];
        try {
            history = JSON.parse(historyData);
        } catch (parseError) {
            console.error('解析历史记录失败:', parseError);
            return;
        }
        
        // 清空现有列表
        passwordList.innerHTML = '';
        
        // 如果没有历史记录则显示提示信息
        if (!history || history.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'history-empty';
            emptyItem.textContent = '暂无复制过的密码';
            passwordList.appendChild(emptyItem);
            return;
        }
        
        // 创建历史记录项
        history.forEach(password => {
            // 创建新条目
            const historyItem = document.createElement('li');
            
            // 保留前6位和后6位，中间用...代替
            let displayPassword = password;
            if (password && password.length > 12) {
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
            passwordList.appendChild(historyItem);
        });
    } catch (error) {
        console.error('加载历史记录失败:', error);
    }
}

// 添加加载状态指示器
function showLoadingIndicator() {
    let loader = document.getElementById('passwordLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'passwordLoader';
        loader.className = 'password-loader';
        
        // 设置基本样式
        loader.style.position = 'absolute';
        loader.style.top = '50%';
        loader.style.left = '50%';
        loader.style.transform = 'translate(-50%, -50%)';
        loader.style.width = '40px';
        loader.style.height = '40px';
        loader.style.border = '4px solid #f3f3f3';
        loader.style.borderTop = '4px solid #007BFF';
        loader.style.borderRadius = '50%';
        loader.style.animation = 'spin 1s linear infinite';
        loader.style.zIndex = '10';
        loader.style.display = 'none';
        
        document.body.appendChild(loader);
    }
    return loader;
}

// 显示加载动画
function showLoader() {
    const loader = showLoadingIndicator();
    if (loader) {
        loader.style.display = 'block';
        // 设置超时以防止加载指示器一直显示
        setTimeout(() => {
            if (loader.style.display === 'block') {
                console.warn('加载超时，隐藏加载指示器');
                hideLoader();
            }
        }, 10000); // 10秒超时
    }
}

// 隐藏加载动画
function hideLoader() {
    const loader = document.getElementById('passwordLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// 在DOM加载后初始化组件
document.addEventListener('DOMContentLoaded', () => {
    // 创建加载指示器但不立即显示
    showLoadingIndicator();
    loadComponents();
    
    // 在组件加载后立即尝试加载历史记录
    setTimeout(() => {
        if (window.HistoryManager && window.HistoryManager.addPasswordToHistory) {
            loadPasswordHistory();
        }
    }, 500);
});

// 替换原有的init函数
function init() {
    // 初始化密码管理器
    const savedConfig = localStorage.getItem('passwordConfig');
    let config;
    
    if (savedConfig) {
        try {
            config = JSON.parse(savedConfig);
            
            // 设置开关初始状态
            ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.checked = Boolean(config[id]);
                }
            });
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
    
    // 初始化边框切换控件状态
    document.querySelectorAll('.border-toggle').forEach(toggle => {
        const inputId = toggle.getAttribute('for');
        const element = document.getElementById(inputId);
        
        if (element && element.type === 'checkbox') {
            if (element.checked) {
                toggle.classList.add('active');
            }
            
            // 确保事件监听器已添加
            const existingListener = toggle.getAttribute('data-listener-added');
            if (!existingListener) {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 切换active类
                    toggle.classList.toggle('active');
                    
                    // 更新隐藏的复选框状态
                    element.checked = toggle.classList.contains('active');
                    
                    // 触发表单提交以生成新密码
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    const form = document.getElementById('passwordForm');
                    if (form) {
                        form.dispatchEvent(event);
                    }
                });
                
                toggle.setAttribute('data-listener-added', 'true');
            }
        }
    });
    
    // 初始化Web Worker
    if (typeof(Worker) !== "undefined") {
        try {
            passwordWorker = new Worker("js/utils/password-worker.js");
            
            // 设置消息处理
            passwordWorker.onmessage = function(event) {
                if (event.data.error) {
                    console.error('密码生成错误:', event.data.error);
                    alert(event.data.error);
                    return;
                }
                
                const password = event.data.password;
                
                // 显示密码并添加动画效果
                const display = document.getElementById('passwordDisplay');
                if (display) {
                    // 添加淡入和缩放组合动画
                    display.textContent = password;
                    display.style.opacity = 0;
                    display.style.transform = 'scale(0.95) translateY(20px)';
                    
                    // 强制重排以确保动画生效
                    void display.offsetWidth;
                    
                    display.style.transition = 'all 0.6s ease-in-out';
                    display.style.opacity = 1;
                    display.style.transform = 'scale(1) translateY(0)';
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
                
                // 分析密码
                analyzePassword(password);
                
                // 如果在暗色模式下，确保元素正确显示
                if (document.body.classList.contains('dark-mode')) {
                    updateDarkModeStyles();
                }
                
                // 隐藏加载状态
                setTimeout(hideLoader, 600);
            };
            
            passwordWorker.onerror = function(error) {
                console.error('Web Worker错误:', error);
                alert('密码生成功能受限，请刷新页面重试');
                
                // 记录错误日志
                logError('Web Worker初始化错误', ErrorLevel.CRITICAL, error);
                // 隐藏加载状态
                hideLoader();
            };
        } catch (error) {
            console.error('Web Worker初始化错误:', error);
            passwordWorker = null;
        }
    } else {
        console.warn('Web Worker不支持，将使用主线程生成密码');
        passwordWorker = null;
    }
}

// 表单提交处理
const form = document.getElementById('passwordForm');
if (form) {
    // 强化阻止默认提交行为的方法
    form.onsubmit = function(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        
        return false;
    };
    
    // 添加事件监听器
    form.addEventListener('submit', debounce(function(e) {
        // 再次确认阻止默认行为
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        if (e && e.stopPropagation) {
            e.stopPropagation();
        }
        
        try {
            // 显示加载状态
            showLoader();
            
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
            
            // 使用密码管理器更新配置（如果可用）
            if (window.PasswordManager && window.PasswordManager.updateConfig) {
                window.PasswordManager.updateConfig(currentConfig);
            }
            
            // 使用Web Worker生成密码
            if (passwordWorker) {
                passwordWorker.postMessage({ config: currentConfig });
            } else {
                // 回退到主线程生成密码
                const options = { uppercase, lowercase, numbers, symbols };
                const password = generateSecurePassword(length, options);
                
                // 显示密码并添加动画效果
                const display = document.getElementById('passwordDisplay');
                if (display) {
                    // 添加淡入和缩放组合动画
                    display.textContent = password;
                    display.style.opacity = 0;
                    display.style.transform = 'scale(0.95) translateY(20px)';
                    
                    // 强制重排以确保动画生效
                    void display.offsetWidth;
                    
                    display.style.transition = 'all 0.6s ease-in-out';
                    display.style.opacity = 1;
                    display.style.transform = 'scale(1) translateY(0)';
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
                
                // 分析密码（仅当密码存在时）
                if (password) {
                    analyzePassword(password);
                }
                
                // 如果在暗色模式下，确保元素正确显示
                if (document.body.classList.contains('dark-mode')) {
                    updateDarkModeStyles();
                }
                
                // 隐藏加载状态
                setTimeout(hideLoader, 600);
            }
            
            return false;
        } catch (error) {
            console.error('密码生成错误:', error);
            alert(error.message);
            // 隐藏加载状态
            hideLoader();
            
            // 记录错误日志
            logError('密码生成过程中发生错误', ErrorLevel.ERROR, error);
            
            return false;
        }
    }, 300));
}

// 错误级别枚举
const ErrorLevel = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    CRITICAL: 4
};

// 自定义错误日志函数
function logError(message, level = ErrorLevel.INFO, error = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level: Object.keys(ErrorLevel)[level],
        message,
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    // 添加错误堆栈信息（如果存在）
    if (error && error.stack) {
        logEntry.stack = error.stack;
    }

    // 将日志存储在localStorage中
    try {
        const logs = JSON.parse(localStorage.getItem('appErrorLogs') || '[]');
        logs.push(logEntry);
        
        // 只保留最近100条日志
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('appErrorLogs', JSON.stringify(logs));
    } catch (storageError) {
        console.warn('无法写入本地日志:', storageError);
    }

    // 根据错误级别输出到控制台
    switch(level) {
        case ErrorLevel.DEBUG:
            if (console.debug) console.debug(`[DEBUG] ${message}`, error);
            break;
        case ErrorLevel.INFO:
            if (console.info) console.info(`[INFO] ${message}`, error);
            break;
        case ErrorLevel.WARNING:
            if (console.warn) console.warn(`[WARNING] ${message}`, error);
            break;
        case ErrorLevel.ERROR:
        case ErrorLevel.CRITICAL:
            if (console.error) console.error(`[ERROR] ${message}`, error);
            break;
    }
}

// 分析密码
function analyzePassword(password) {
    if (!password) {
        console.warn('尝试分析空密码被阻止');
        return;
    }
    
    // 分析密码特征
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    // 计算密码熵
    const entropy = calculateEntropy(password);
    
    // 记录分析结果到控制台
    console.log(`密码长度: ${password.length}`);
    console.log(`包含大写字母: ${hasUppercase}`);
    console.log(`包含小写字母: ${hasLowercase}`);
    console.log(`包含数字: ${hasNumbers}`);
    console.log(`包含特殊符号: ${hasSymbols}`);
    
    // 根据熵值给出建议
    if (entropy < 40) {
        console.warn('警告: 密码强度不足，建议增加长度或复杂度');
        // 记录低强度密码警告
        logError(`弱密码生成: 密码熵 ${entropy} bits`, ErrorLevel.WARNING);
    } else if (entropy < 80) {
        console.info('注意: 密码强度中等，适合普通用途');
    } else {
        console.log('信息: 密码强度足够，适合安全敏感用途');
    }
}

// 计算密码熵
function calculateEntropy(password) {
    if (!password) {
        console.error('无法计算空密码的熵');
        logError('尝试计算空密码的熵', ErrorLevel.WARNING);
        return 0;
    }
    
    let charsetSize = 0;
    
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32; // 粗略估计特殊字符数量
    
    // 如果无法确定字符集大小，使用默认值
    charsetSize = Math.max(charsetSize, 10); // 至少10种可能的字符
    
    // 计算熵: log2(charsetSize^length)
    return password.length * Math.log2(charsetSize);
}

// 暗色模式样式更新
function updateDarkModeStyles() {
    // 更新容器背景色
    const container = document.querySelector('.container');
    if (container) {
        container.style.backgroundColor = '#1a1a1a';
        container.style.color = '#ffffff';
    }
    
    // 更新表单元素样式
    const formElements = document.querySelectorAll('input[type="range"], button, .border-toggle');
    formElements.forEach(element => {
        if (element.classList.contains('ios-slider')) {
            element.style.backgroundColor = '#333';
        } else if (element.tagName.toLowerCase() === 'button') {
            element.style.backgroundColor = '#2d2d2d';
            element.style.color = '#ffffff';
        } else if (element.classList.contains('border-toggle')) {
            element.style.backgroundColor = '#2d2d2d';
            element.style.color = '#ffffff';
            element.style.setProperty('--track-color', '#4d4d4d');
            element.style.setProperty('--thumb-color', '#ffffff');
        }
    });
    
    // 更新密码显示区域
    const passwordDisplay = document.getElementById('passwordDisplay');
    if (passwordDisplay) {
        passwordDisplay.style.backgroundColor = '#2d2d2d';
        passwordDisplay.style.color = '#ffffff';
    }
    
    // 更新历史记录项
    const historyItems = document.querySelectorAll('#passwordHistoryList li');
    historyItems.forEach(item => {
        item.style.backgroundColor = '#2d2d2d';
        item.style.color = '#ffffff';
    });
}

// 初始化密码管理器
function initPasswordManager(config) {
    // 创建命名空间
    if (!window.PasswordManager) {
        window.PasswordManager = {
            updateConfig: function(newConfig) {
                // 这里可以实现更复杂的配置同步逻辑
                console.log('密码管理器配置更新:', newConfig);
            }
        };
    }
    
    // 如果提供了配置，应用它
    if (config) {
        window.PasswordManager.updateConfig(config);
    }
}

// 密码强度指示器更新函数
function updateStrengthMeter(password) {
    const strengthMeterContainer = document.getElementById('strengthMeter');
    const strengthMeter = strengthMeterContainer ? strengthMeterContainer.querySelector('.strength-meter') : null;
    const passwordDisplay = document.getElementById('passwordDisplay');
    
    // 使用组件中的密码显示功能（如果可用）
    if (window.PasswordDisplay && window.PasswordDisplay.renderPasswordDisplay) {
        window.PasswordDisplay.renderPasswordDisplay(password);
    } else if (passwordDisplay) {
        passwordDisplay.textContent = password;
        passwordDisplay.dataset.realPassword = password;
    }
    
    if (strengthMeter) {
        const strength = getPasswordStrength(password);
        const fill = strengthMeter.querySelector('.strength-fill');
        const label = strengthMeterContainer.querySelector('.strength-label');
        
        // 根据强度设置宽度和颜色
        let widthPercentage = '0%';
        let strengthClass = 'strength-weak';
        
        // 根据强度设置宽度和颜色
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
        
        // 更新样式
        if (fill) {
            fill.style.width = widthPercentage;
            
            // 添加过渡效果
            fill.style.transition = 'all 0.3s ease';
            
            // 动态添加强度类
            fill.className = 'strength-fill'; // 保留基础类
            fill.classList.add(strengthClass);
        }
        
        // 更新标签文本
        if (label) {
            switch(strength) {
                case 0:
                case 1:
                    label.innerHTML = '密码强度: <span>极弱</span>';
                    break;
                case 2:
                    label.innerHTML = '密码强度: <span>较弱</span>';
                    break;
                case 3:
                    label.innerHTML = '密码强度: <span>中等</span>';
                    break;
                case 4:
                    label.innerHTML = '密码强度: <span>较强</span>';
                    break;
                case 5:
                case 6:
                    label.innerHTML = '密码强度: <span>极强</span>';
                    break;
                default:
                    label.innerHTML = '密码强度: <span>未知</span>';
            }
        }
    }
}

// 密码强度计算函数
function getPasswordStrength(password) {
    // 这是一个简单的强度计算示例
    // 实际应用中应该使用更复杂的算法
    if (!password || password.length === 0) return 0;
    
    let score = 0;
    
    // 增加基于长度的分数
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // 增加基于字符类型的分数
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // 限制最大分数
    return Math.min(score, 6);
}