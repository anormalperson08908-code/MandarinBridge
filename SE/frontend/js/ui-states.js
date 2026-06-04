// ============================================
// FILE: frontend/js/ui-states.js (CREATE THIS)
// ============================================
// Loading and empty state components

const UIStates = {
    createLoadingState(container, message = 'Loading...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-state';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
        container.innerHTML = '';
        container.appendChild(loadingDiv);
        return loadingDiv;
    },

    createEmptyState(container, message = 'No items found', action = null) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            <div class="empty-icon">📚</div>
            <p>${message}</p>
            ${action ? `<button class="button small" onclick="${action.handler}">${action.label}</button>` : ''}
        `;
        container.innerHTML = '';
        container.appendChild(emptyDiv);
        return emptyDiv;
    },

    removeLoadingState(container) {
        const loading = container.querySelector('.loading-state');
        if (loading) loading.remove();
    }
};

// Add CSS for states
const uiStyles = document.createElement('style');
uiStyles.textContent = `
    .loading-state, .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: #6b7280;
    }
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top-color: #d6452f;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 16px;
    }
    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(uiStyles);