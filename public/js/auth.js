// 共用驗證函式庫
class AuthManager {
    constructor() {
        this.user = null;
        this.liff = null;
        this.LIFF_ID = '2008786875-F7ifLsbN'; // 請替換成你的 LIFF ID
    }
    
    // 初始化 LIFF
    async initLiff() {
        if (typeof liff === 'undefined') {
            console.error('LIFF SDK 未載入');
            return false;
        }
        
        try {
            await liff.init({ liffId: this.LIFF_ID });
            this.liff = liff;
            return true;
        } catch (error) {
            console.error('LIFF 初始化失敗:', error);
            return false;
        }
    }
    
    // 檢查登入狀態
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
        const userData = localStorage.getItem('user_data');
        
        if (isLoggedIn && userData) {
            this.user = JSON.parse(userData);
            return true;
        }
        
        return false;
    }
    
    // 取得當前使用者
    getCurrentUser() {
        if (!this.user) {
            this.checkLoginStatus();
        }
        return this.user;
    }
    
    // 更新使用者資料
    updateUserData(newData) {
        const currentData = this.getCurrentUser() || {};
        const updatedData = { ...currentData, ...newData };
        
        this.user = updatedData;
        localStorage.setItem('user_data', JSON.stringify(updatedData));
    }
    
    // 登出
    logout() {
        // 如果使用 LIFF 登入，呼叫 LIFF 登出
        if (this.liff && this.liff.isLoggedIn()) {
            this.liff.logout();
        }
        
        // 清除本地儲存
        localStorage.removeItem('user_data');
        localStorage.removeItem('is_logged_in');
        this.user = null;
        
        // 跳轉到登入頁
        window.location.href = '/auth/login.html';
    }
    
    // 檢查權限（管理員/一般使用者）
    isAdmin() {
        const user = this.getCurrentUser();
        // 這裡可以根據你的需求設定權限檢查
        return user && (user.userId === 'admin' || user.role === 'admin');
    }
    
    // 要求登入（如果未登入就跳轉）
    requireLogin(redirectUrl = '/auth/login.html') {
        if (!this.checkLoginStatus()) {
            // 儲存當前頁面，登入後可以返回
            const currentUrl = window.location.pathname + window.location.search;
            localStorage.setItem('return_url', currentUrl);
            
            // 跳轉到登入頁
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
    
    // 要求管理員權限
    requireAdmin(redirectUrl = '/dashboard/index.html') {
        if (!this.requireLogin()) {
            return false;
        }
        
        if (!this.isAdmin()) {
            alert('此功能需要管理員權限');
            window.location.href = redirectUrl;
            return false;
        }
        
        return true;
    }
}

// 建立全域實例
const auth = new AuthManager();

// 頁面載入時自動檢查登入狀態
document.addEventListener('DOMContentLoaded', function() {
    auth.checkLoginStatus();
    
    // 如果有返回網址，登入後跳轉回去
    if (auth.checkLoginStatus() && localStorage.getItem('return_url')) {
        const returnUrl = localStorage.getItem('return_url');
        localStorage.removeItem('return_url');
        
        if (returnUrl && returnUrl !== window.location.pathname) {
            window.location.href = returnUrl;
        }
    }
});
