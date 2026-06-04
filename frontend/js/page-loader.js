// frontend/js/page-loader.js
// Page transition loading screen

class PageLoader {
    constructor() {
        this.loadingElement = null;
        this.isLoading = false;
        this.pendingNavigation = null;
        this.init();
    }

    init() {
        // Create loading element
        this.createLoadingElement();
        
        // Intercept all link clicks
        this.interceptNavigation();
        
        // Handle back/forward navigation
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.hide();
            }
        });
    }

    createLoadingElement() {
        const loadingHTML = `
            <div id="page-loading-overlay" class="page-loading" style="display: none;">
                <div class="loading-container">
                    <div class="loading-bridge">
                        <div class="bridge-icon">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#d6452f"/>
                                        <stop offset="100%" stop-color="#f5b041"/>
                                    </linearGradient>
                                </defs>
                                <path d="M10 70 L30 40 L50 55 L70 40 L90 70" 
                                      fill="none" stroke="url(#bridgeGrad)" stroke-width="6" 
                                      stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M30 40 L30 25 M70 40 L70 25" 
                                      fill="none" stroke="#d6452f" stroke-width="4" 
                                      stroke-linecap="round"/>
                                <circle cx="50" cy="65" r="8" fill="#f5b041" opacity="0.8">
                                    <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        </div>
                    </div>
                    <div class="loading-waves">
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                    </div>
                    <div class="loading-text">
                        Loading MandarinBridge
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                    <div class="loading-progress">
                        <div class="loading-progress-bar"></div>
                    </div>
                    <p style="margin-top: 20px; color: #6b7280; font-size: 0.85rem;">
                        Preparing your learning experience...
                    </p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
        this.loadingElement = document.getElementById('page-loading-overlay');
    }

    show(message = 'Loading...') {
        if (!this.loadingElement) return;
        
        // Update message if provided
        const textEl = this.loadingElement.querySelector('.loading-text');
        if (textEl && message !== 'Loading...') {
            const dotSpan = textEl.querySelectorAll('span');
            textEl.innerHTML = `${message} <span>.</span><span>.</span><span>.</span>`;
            if (dotSpan.length) {
                const newDots = textEl.querySelectorAll('span');
                newDots.forEach((dot, i) => {
                    if (dotSpan[i]) dot.style.animationDelay = dotSpan[i].style.animationDelay;
                });
            }
        }
        
        this.loadingElement.style.display = 'flex';
        this.isLoading = true;
    }

    hide() {
        if (!this.loadingElement) return;
        
        this.loadingElement.classList.add('hide');
        setTimeout(() => {
            this.loadingElement.style.display = 'none';
            this.loadingElement.classList.remove('hide');
            this.isLoading = false;
            
            // Reset message
            const textEl = this.loadingElement.querySelector('.loading-text');
            if (textEl) {
                textEl.innerHTML = 'Loading MandarinBridge<span>.</span><span>.</span><span>.</span>';
            }
        }, 300);
    }

    interceptNavigation() {
        // Intercept clicks on navigation links
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Skip external links, anchors, and javascript:
            if (href.startsWith('http') && !href.includes(window.location.host)) return;
            if (href.startsWith('#') || href.startsWith('javascript:')) return;
            
            // Skip if Ctrl/Cmd key is pressed (open in new tab)
            if (e.ctrlKey || e.metaKey) return;
            
            // Show loading screen for internal navigation
            e.preventDefault();
            
            // Show loading with custom message based on destination
            let loadingMessage = 'Loading';
            if (href.includes('dashboard')) loadingMessage = 'Loading Dashboard';
            else if (href.includes('profile')) loadingMessage = 'Loading Profile';
            else if (href.includes('quiz')) loadingMessage = 'Preparing Quiz';
            else if (href.includes('modules')) loadingMessage = 'Loading Lessons';
            else if (href.includes('progress')) loadingMessage = 'Fetching Progress';
            
            this.show(loadingMessage);
            
            // Navigate after a short delay (ensures loading screen shows)
            setTimeout(() => {
                window.location.href = href;
            }, 150);
        });
    }

    // Show loading for async operations
    async withLoading(promise, options = {}) {
        const { message = 'Loading...', minDisplayTime = 500 } = options;
        
        this.show(message);
        const startTime = Date.now();
        
        try {
            const result = await promise;
            const elapsed = Date.now() - startTime;
            
            if (elapsed < minDisplayTime) {
                await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed));
            }
            
            return result;
        } finally {
            this.hide();
        }
    }
}

// Create global instance
window.pageLoader = new PageLoader();

// Auto-show for slow page loads
if (document.readyState === 'loading') {
    window.pageLoader.show();
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.pageLoader.hide(), 500);
    });
} else {
    setTimeout(() => window.pageLoader.hide(), 200);
}

// Also show loading for form submissions that redirect
document.addEventListener('submit', (e) => {
    const form = e.target;
    const action = form.getAttribute('action');
    
    // If form submission will cause page reload/navigation
    if (!action || action === '' || !action.startsWith('#')) {
        // Don't show for API forms that stay on page
        if (form.id === 'profile-form' || form.id === 'lesson-create-form') {
            return;
        }
        
        let loadingMessage = 'Processing';
        if (form.id === 'login-form') loadingMessage = 'Logging in';
        else if (form.id === 'register-form') loadingMessage = 'Creating Account';
        
        window.pageLoader.show(loadingMessage);
    }
});