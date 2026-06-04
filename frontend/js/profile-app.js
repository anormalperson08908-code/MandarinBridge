// ============================================
// FILE: frontend/js/profile-app.js (REPLACE)
// ============================================

async function readJsonResponse(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function showStatus(el, text, isError) {
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#991b1b' : '#166534';
    el.style.display = text ? 'block' : 'none';
}

async function loadProfile() {
    const statusEl = document.querySelector('#profile-status');
    showStatus(statusEl, 'Loading profile...', false);
    
    try {
        const res = await fetch("/api/users/me", { credentials: "same-origin" });
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = `/login?next=${encodeURIComponent("/profile")}`;
            }
            throw new Error('Failed to load profile');
        }
        const data = await readJsonResponse(res);
        if (!data.user) throw new Error('No user data');
        
        document.querySelector("#profile-name").value = data.user.full_name;
        document.querySelector("#profile-email").value = data.user.email;
        document.querySelector("#profile-level").value = data.user.mandarin_level;
        
        showStatus(statusEl, '');
    } catch (error) {
        console.error('Load profile error:', error);
        showStatus(statusEl, 'Could not load profile. Please refresh.', true);
    }
}

document.querySelector("#profile-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("#profile-status");
    const submitBtn = event.currentTarget.querySelector('button[type="submit"]');
    
    showStatus(status, "Saving...", false);
    if (submitBtn) submitBtn.disabled = true;

    const body = {
        full_name: document.querySelector("#profile-name").value.trim(),
        email: document.querySelector("#profile-email").value.trim(),
        mandarin_level: document.querySelector("#profile-level").value,
    };

    try {
        const res = await fetch("/api/users/me", {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await readJsonResponse(res);
        if (!res.ok) {
            const msg = data.errors ? Object.values(data.errors)[0] : "Update failed.";
            showStatus(status, msg, true);
            return;
        }

        showStatus(status, "Profile saved successfully!", false);
        
        // Show success toast if available
        if (window.showToast) {
            window.showToast('Profile updated successfully!', 'success');
        }
    } catch (error) {
        showStatus(status, "Network error. Please try again.", true);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => {
            if (status.textContent === "Profile saved successfully!") {
                showStatus(status, '');
            }
        }, 3000);
    }
});

document.querySelector("#logout-button")?.addEventListener("click", async () => {
    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    window.location.href = "/login";
});

// Loading state for lessons
async function loadLessons() {
    const list = document.querySelector("#lesson-list");
    if (!list) return;
    
    // Show loading state
    list.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div><p style="text-align:center">Loading lessons...</p>';
    
    try {
        const res = await fetch("/api/lessons", { credentials: "same-origin" });
        const lessons = await readJsonResponse(res);
        
        if (!res.ok || !Array.isArray(lessons)) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load lessons.</p></div>';
            return;
        }
        
        if (lessons.length === 0) {
            list.innerHTML = '<div class="empty-state"><div class="empty-icon">📖</div><p>No lessons yet. Create your first lesson above!</p></div>';
            return;
        }
        
        list.innerHTML = '';
        lessons.forEach((lesson) => {
            const row = document.createElement("div");
            row.className = "lesson-row";

            const textCol = document.createElement("div");
            const titleEl = document.createElement("strong");
            titleEl.textContent = lesson.title;
            const catEl = document.createElement("span");
            catEl.textContent = lesson.category;
            catEl.style.fontSize = '0.85rem';
            catEl.style.color = '#6b7280';
            catEl.style.marginLeft = '8px';
            textCol.append(titleEl, catEl);
            
            const descEl = document.createElement("p");
            descEl.textContent = lesson.description.substring(0, 100) + (lesson.description.length > 100 ? '...' : '');
            descEl.style.fontSize = '0.9rem';
            descEl.style.margin = '8px 0 0';
            descEl.style.color = '#4b5563';
            textCol.appendChild(descEl);

            const actions = document.createElement("div");
            actions.className = "small-actions";
            
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "button small light";
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", async () => {
                const newTitle = window.prompt("New lesson title", lesson.title);
                if (!newTitle) return;
                
                editBtn.disabled = true;
                editBtn.textContent = "Saving...";
                
                try {
                    const patchRes = await fetch(`/api/lessons/${lesson.id}`, {
                        method: "PATCH",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: newTitle }),
                    });
                    if (!patchRes.ok) throw new Error('Update failed');
                    await loadLessons();
                    if (window.showToast) window.showToast('Lesson updated!', 'success');
                } catch (error) {
                    window.alert("Update failed. Please try again.");
                } finally {
                    editBtn.disabled = false;
                    editBtn.textContent = "Edit";
                }
            });

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "button small danger";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", async () => {
                if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
                
                delBtn.disabled = true;
                delBtn.textContent = "Deleting...";
                
                try {
                    const delRes = await fetch(`/api/lessons/${lesson.id}`, {
                        method: "DELETE",
                        credentials: "same-origin",
                    });
                    if (delRes.status !== 204) throw new Error('Delete failed');
                    await loadLessons();
                    if (window.showToast) window.showToast('Lesson deleted', 'success');
                } catch (error) {
                    window.alert("Delete failed. Please try again.");
                } finally {
                    delBtn.disabled = false;
                    delBtn.textContent = "Delete";
                }
            });

            actions.append(editBtn, delBtn);
            row.append(textCol, actions);
            list.append(row);
        });
    } catch (error) {
        console.error('Load lessons error:', error);
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">🔌</div><p>Network error. Please check your connection.</p></div>';
    }
}

document.querySelector("#lesson-create-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.querySelector("#lesson-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    
    showStatus(status, "Creating lesson...", false);
    if (submitBtn) submitBtn.disabled = true;

    const payload = {
        title: form.querySelector("#lesson-title").value.trim(),
        category: form.querySelector("#lesson-category").value,
        description: form.querySelector("#lesson-description").value.trim(),
    };

    if (!payload.title || !payload.description) {
        showStatus(status, "Title and description are required.", true);
        if (submitBtn) submitBtn.disabled = false;
        return;
    }

    try {
        const res = await fetch("/api/lessons", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await readJsonResponse(res);
        if (!res.ok) {
            const msg = data.errors ? Object.values(data.errors)[0] : "Create failed.";
            showStatus(status, msg, true);
            return;
        }

        form.reset();
        showStatus(status, "Lesson created successfully!", false);
        if (window.showToast) window.showToast('Lesson created!', 'success');
        await loadLessons();
    } catch (error) {
        showStatus(status, "Network error. Please try again.", true);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => {
            if (status.textContent === "Lesson created successfully!") {
                showStatus(status, '');
            }
        }, 3000);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#profile-form")) {
        loadProfile();
    }
    if (document.querySelector("#lesson-list")) {
        loadLessons();
    }
});