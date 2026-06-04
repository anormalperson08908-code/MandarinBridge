// ============================================
// FILE: frontend/js/error-handler.js (CREATE THIS)
// ============================================
// Unified error handling with user-friendly messages

const ErrorHandler = {
    showToast(message, type = 'error') {
        // Remove existing toast
        const existingToast = document.querySelector('.global-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `global-toast toast-${type}`;
        toast.innerHTML = `
            <span>${this.getIcon(type)}</span>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => toast.remove(), 5000);
        
        toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
    },

    getIcon(type) {
        switch(type) {
            case 'success': return '✓';
            case 'warning': return '⚠';
            default: return '✗';
        }
    },

    handleAPIError(error, context = '') {
        console.error(`${context}:`, error);
        
        let userMessage = error.message || 'Something went wrong.';
        
        if (error.status === 401) {
            userMessage = 'Your session has expired. Please login again.';
            setTimeout(() => {
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
            }, 2000);
        }
        
        this.showToast(userMessage, 'error');
        return userMessage;
    },

    showLoading(element, show = true) {
        if (!element) return;
        
        if (show) {
            element.classList.add('loading');
            const originalContent = element.innerHTML;
            element.setAttribute('data-original-content', originalContent);
            element.innerHTML = '<span class="spinner"></span> Loading...';
            element.disabled = true;
        } else {
            element.classList.remove('loading');
            const original = element.getAttribute('data-original-content');
            if (original) element.innerHTML = original;
            element.disabled = false;
        }
    }
};

// Add global CSS for toast and spinner
const style = document.createElement('style');
style.textContent = `
    .global-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        padding: 12px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
    }
    .toast-error { background: #dc2626; color: white; }
    .toast-success { background: #16a34a; color: white; }
    .toast-warning { background: #eab308; color: #1f2937; }
    .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
    }
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #fff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
`;
document.head.appendChild(style);