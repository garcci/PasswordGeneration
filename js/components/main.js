// 主组件文件
import { renderStrengthMeter, initStrengthMeter } from './strength-meter.js';
import { renderPasswordDisplay, initPasswordDisplay } from './password-display.js';
import { renderPasswordHistory, initPasswordHistory } from './password-history.js';

// 初始化所有组件
function initializeComponents() {
    // 初始化各个组件
    initStrengthMeter();
    initPasswordDisplay();
    initPasswordHistory();
}

// 更新所有组件
function updateComponents(password) {
    // 更新密码强度指示器
    renderStrengthMeter(password);
    
    // 更新密码显示
    renderPasswordDisplay(password);
    
    // 更新密码历史记录
    renderPasswordHistory(password);
}

// 导出组件功能
export { initializeComponents, updateComponents };