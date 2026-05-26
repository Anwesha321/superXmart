// ui.js - Handles Toast Notifications, Loaders, Dark Mode, Password Visibility

// --- Toasts ---
export function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    let icon = '';
    if(type === 'success') icon = '✅';
    if(type === 'error') icon = '❌';
    if(type === 'info') icon = 'ℹ️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Loader ---
export function showLoader() {
    let loader = document.getElementById('loader-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader-overlay';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }
    loader.classList.add('active');
}

export function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
        loader.classList.remove('active');
    }
}

// --- Dark Mode Toggle ---
export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = storedTheme ? storedTheme : (systemPrefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(themeToggleBtn, currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(themeToggleBtn, newTheme);
        });
    }
}

function updateThemeIcon(btn, theme) {
    if (!btn) return;
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// --- Password Visibility Toggle ---
export function initPasswordToggles() {
    const toggleIcons = document.querySelectorAll('.toggle-password');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.target.textContent = '🙈'; // Hide icon
            } else {
                input.type = 'password';
                e.target.textContent = '👁️'; // Show icon
            }
        });
    });
}
