// Show loading for slow page loads
(function initPageLoader() {
    // If page takes more than 300ms to load, show loading indicator
    const startTime = Date.now();
    
    window.addEventListener('load', () => {
        const loadTime = Date.now() - startTime;
        if (loadTime > 300) {
            // Page was slow, keep loading visible a bit longer
            const loader = document.querySelector('.page-loading');
            if (loader) {
                setTimeout(() => {
                    loader.classList.add('hide');
                    setTimeout(() => {
                        if (loader) loader.style.display = 'none';
                    }, 300);
                }, 500);
            }
        } else {
            const loader = document.querySelector('.page-loading');
            if (loader) {
                loader.classList.add('hide');
                setTimeout(() => {
                    if (loader) loader.style.display = 'none';
                }, 300);
            }
        }
    });
})();

// Toast Notification System
function showToast(message, type = 'error') {
  const existingToast = document.querySelector('.global-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `global-toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✗'}</span>
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast && toast.remove) toast.remove();
  }, 5000);

  toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
}

// Loading Overlay
function showLoadingOverlay(message = 'Loading...') {
  let overlay = document.querySelector('#loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.querySelector('#loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Active Navigation Link
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    try {
      const target = new URL(link.getAttribute('href'), window.location.origin).pathname;
      if (target === path) {
        link.classList.add('active');
      }
    } catch {
      // ignore invalid href
    }
  });
});

// Export for use in other files
window.showToast = showToast;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;