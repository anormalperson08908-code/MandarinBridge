// ============================================
// FILE: frontend/js/auth-forms.js (REPLACE)
// ============================================

async function readJsonResponse(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function showBox(el, message, isError = true) {
    if (!el) return;
    if (!message) {
        el.hidden = true;
        el.textContent = "";
        return;
    }
    el.hidden = false;
    el.textContent = message;
    el.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7';
    el.style.color = isError ? '#991b1b' : '#166534';
}

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `global-toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : '✗'}</span>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
    toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
}

// Add toast styles
if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
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
        .toast-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

document.querySelector("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const serverBox = document.querySelector("#login-server-error");
    const submitBtn = form.querySelector('button[type="submit"]');
    
    showBox(serverBox, "");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";
    }

    const email = form.querySelector("#login-email").value.trim();
    const password = form.querySelector("#login-password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await readJsonResponse(response);
        
        if (!response.ok) {
            const msg = data.errors?._form || data.errors?.email || data.errors?.password || "Invalid email or password.";
            showBox(serverBox, msg);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Login";
            }
            return;
        }

        showToast("Login successful! Redirecting...", "success");
        
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next") || "/dashboard";
        setTimeout(() => {
            window.location.href = next.startsWith("/") ? next : "/dashboard";
        }, 500);
    } catch (error) {
        console.error('Login error:', error);
        showBox(serverBox, "Network error. Please check your connection.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    }
});

document.querySelector("#register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const serverBox = document.querySelector("#register-server-error");
    const submitBtn = form.querySelector('button[type="submit"]');
    
    showBox(serverBox, "");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";
    }

    const password = form.querySelector("#register-password").value;
    if (password.length < 8) {
        showBox(serverBox, "Password must be at least 8 characters long.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
        return;
    }

    const payload = {
        full_name: form.querySelector("#register-name").value.trim(),
        email: form.querySelector("#register-email").value.trim(),
        password: password,
        mandarin_level: form.querySelector("#register-level").value,
    };

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await readJsonResponse(response);
        
        if (!response.ok) {
            if (data.errors) {
                const first = Object.values(data.errors)[0];
                showBox(serverBox, first || "Registration failed.");
            } else {
                showBox(serverBox, "Registration failed. Please try again.");
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Create Account";
            }
            return;
        }

        showToast("Account created successfully! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 500);
    } catch (error) {
        console.error('Registration error:', error);
        showBox(serverBox, "Network error. Please check your connection.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
    }
});