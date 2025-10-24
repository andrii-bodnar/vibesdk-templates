// Profile Resources Menu App - Frontend Logic

let userContext = {};
let jwtToken = null;
let retryAttempts = {};

/**
 * Wait for Crowdin Apps JS API to load
 */
function waitForAP() {
    if (window.AP && typeof window.AP === 'object') {
        initializeApp();
    } else {
        setTimeout(waitForAP, 100);
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForAP);
} else {
    waitForAP();
}

/**
 * Initialize the app with Crowdin context
 */
function initializeApp() {
    // Get user context
    AP.getContext(function(context) {
        userContext = context;
        updateUserDisplay(context);
    });
    
    // Get JWT token for API calls
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadUserPreferences();
    });
}

/**
 * Update user information display
 */
function updateUserDisplay(context) {
    const userDiv = document.getElementById('userInfo');
    if (context && context.user_id) {
        userDiv.innerHTML = `
            <strong>User ID:</strong> ${context.user_id}<br>
            <strong>Organization ID:</strong> ${context.organization_id || 'N/A'}<br>
            <strong>Status:</strong> Connected and ready
        `;
        userDiv.className = '';
    } else {
        userDiv.innerHTML = 'No user information available';
        userDiv.className = 'loading';
    }
}

/**
 * Load user preferences
 */
async function loadUserPreferences() {
    if (!jwtToken) {
        showError('JWT token not available', 'preferencesInfo', null);
        return;
    }
    
    const preferencesDiv = document.getElementById('preferencesInfo');
    preferencesDiv.innerHTML = '<div class="loading">Loading user preferences...</div>';
    
    try {
        const response = await fetch(`/api/user-preferences?jwt=${jwtToken}`);
        const result = await response.json();
        
        if (result.success) {
            displayPreferences(result.preferences);
            retryAttempts.preferences = 0;
        } else {
            showError(`Failed to load preferences: ${result.error}`, 'preferencesInfo', loadUserPreferences);
        }
    } catch (error) {
        showError('Network error while loading preferences. Please check your connection.', 'preferencesInfo', loadUserPreferences);
    }
}

/**
 * Display user preferences
 */
function displayPreferences(preferences) {
    const preferencesDiv = document.getElementById('preferencesInfo');
    
    if (preferences && Object.keys(preferences).length > 0) {
        const prefsHTML = Object.entries(preferences).map(([key, value]) => `
            <div class="preference-item">
                <span class="pref-key">${key}:</span>
                <span class="pref-value">${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
            </div>
        `).join('');
        
        preferencesDiv.innerHTML = `
            <div class="preferences-display">
                ${prefsHTML}
            </div>
            <button onclick="showEditForm()" class="action-button" style="margin-top: 15px;">
                ✏️ Edit Preferences
            </button>
        `;
        preferencesDiv.className = '';
        
        // Populate form with current values
        populateForm(preferences);
    } else {
        preferencesDiv.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚙️</div>
                <h4>No Preferences Configured</h4>
                <p>Click below to set your preferences.</p>
            </div>
            <button onclick="showEditForm()" class="action-button" style="margin-top: 15px;">
                ⚙️ Configure Preferences
            </button>
        `;
        preferencesDiv.className = '';
    }
}

/**
 * Show edit preferences form
 */
function showEditForm() {
    const formDiv = document.getElementById('editPreferencesForm');
    formDiv.style.display = 'block';
    formDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Populate form with current preferences
 */
function populateForm(preferences) {
    if (preferences.theme) {
        document.getElementById('themeSelect').value = preferences.theme;
    }
    if (preferences.language) {
        document.getElementById('languageSelect').value = preferences.language;
    }
    if (preferences.notifications !== undefined) {
        document.getElementById('notificationsCheck').checked = preferences.notifications;
    }
    if (preferences.emailDigest) {
        document.getElementById('emailDigestSelect').value = preferences.emailDigest;
    }
}

/**
 * Save user preferences
 */
async function savePreferences() {
    if (!jwtToken) {
        showError('JWT token not available', 'preferencesInfo', null);
        return;
    }
    
    // Get form values
    const preferences = {
        theme: document.getElementById('themeSelect').value,
        language: document.getElementById('languageSelect').value,
        notifications: document.getElementById('notificationsCheck').checked,
        emailDigest: document.getElementById('emailDigestSelect').value,
        lastUpdated: new Date().toISOString()
    };
    
    const preferencesDiv = document.getElementById('preferencesInfo');
    preferencesDiv.innerHTML = '<div class="loading">Saving preferences...</div>';
    
    try {
        const response = await fetch(`/api/user-preferences?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preferences })
        });
        
        const result = await response.json();
        
        if (result.success) {
            preferencesDiv.innerHTML = `
                <div class="result">✅ ${result.message}</div>
            `;
            // Hide form and reload preferences
            document.getElementById('editPreferencesForm').style.display = 'none';
            setTimeout(() => {
                loadUserPreferences();
            }, 1000);
        } else {
            showError(`Failed to save preferences: ${result.error}`, 'preferencesInfo', savePreferences);
        }
    } catch (error) {
        showError('Network error while saving preferences. Please check your connection.', 'preferencesInfo', savePreferences);
    }
}

/**
 * Perform user action
 */
async function performAction(action) {
    if (!jwtToken) {
        showError('JWT token not available', 'actionResult', null);
        return;
    }
    
    const resultDiv = document.getElementById('actionResult');
    resultDiv.innerHTML = '<div class="loading">Processing...</div>';
    
    try {
        const response = await fetch(`/api/user-action?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                userId: userContext.user_id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `<div class="result">✅ ${result.message}</div>`;
            retryAttempts[action] = 0;
            
            // Reload preferences if cache was cleared
            if (action === 'clear-cache') {
                setTimeout(() => {
                    loadUserPreferences();
                }, 1500);
            }
        } else {
            showError(`Failed to ${action}: ${result.error}`, 'actionResult', () => performAction(action));
        }
    } catch (error) {
        showError(`Network error while performing ${action}. Please check your connection.`, 'actionResult', () => performAction(action));
    }
}

/**
 * Retry a failed operation
 */
function retry(retryFunction) {
    if (typeof retryFunction === 'function') {
        retryFunction();
    }
}

/**
 * Show error message with optional retry button
 */
function showError(message, elementId = 'actionResult', retryFunction = null) {
    const element = document.getElementById(elementId);
    if (element) {
        let errorHTML = `
            <div class="error">
                <strong>❌ Error</strong>
                <p>${message}</p>
        `;
        
        if (retryFunction) {
            const retryId = 'retry_' + Date.now();
            errorHTML += `
                <div class="error-actions">
                    <button class="retry-button" onclick="retry(window.${retryId})">
                        🔄 Try Again
                    </button>
                </div>
            `;
            window[retryId] = retryFunction;
        }
        
        errorHTML += `</div>`;
        element.innerHTML = errorHTML;
    }
}

