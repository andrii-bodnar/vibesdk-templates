let projectContext = {};
let jwtToken = null;
let retryAttempts = {};

function waitForAP() {
    if (window.AP && typeof window.AP === 'object') {
        initializeApp();
    } else {
        setTimeout(waitForAP, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForAP);
} else {
    waitForAP();
}

function initializeApp() {
    AP.getContext(function(context) {
        projectContext = context;
        updateProjectDisplay(context);
    });
    
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadProjectLanguages();
    });
}

function updateProjectDisplay(context) {
    const projectDiv = document.getElementById('projectInfo');
    if (context && context.project_id) {
        projectDiv.innerHTML = `
            <strong>Project ID:</strong> ${context.project_id}<br>
            <strong>Organization ID:</strong> ${context.organization_id || 'N/A'}<br>
            <strong>User ID:</strong> ${context.user_id || 'N/A'}<br>
            <strong>Status:</strong> Connected and ready
        `;
        projectDiv.className = '';
    } else {
        projectDiv.innerHTML = 'No project information available';
        projectDiv.className = 'loading';
    }
}

async function loadProjectLanguages() {
    if (!jwtToken) {
        showError('JWT token not available', 'languageInfo', 'loadProjectLanguages');
        return;
    }
    
    try {
        const response = await fetch(`/api/project-languages?jwt=${jwtToken}`);
        const result = await response.json();
        
        if (result.success) {
            updateLanguageDisplay(result.languages);
            retryAttempts.languages = 0;
        } else {
            showError('Failed to load languages: ' + result.error, 'languageInfo', 'loadProjectLanguages');
        }
    } catch (error) {
        showError('Error loading project languages. Please check your connection.', 'languageInfo', 'loadProjectLanguages');
    }
}

function updateLanguageDisplay(languages) {
    const languageDiv = document.getElementById('languageInfo');
    if (languages && languages.length > 0) {
        const languageTags = languages.map(lang => 
            `<span class="language-tag">${lang.name} (${lang.id})</span>`
        ).join('');
        languageDiv.innerHTML = `
            <div class="language-list">${languageTags}</div>
        `;
        languageDiv.className = '';
    } else {
        languageDiv.innerHTML = `
            <div class="empty-state">
                <div class="icon">🌐</div>
                <h4>No Languages Configured</h4>
                <p>This project doesn't have any target languages yet.</p>
            </div>
        `;
        languageDiv.className = '';
    }
}

async function performAction(action) {
    if (!jwtToken) {
        showError('JWT token not available', 'actionResult', null);
        return;
    }
    
    const resultDiv = document.getElementById('actionResult');
    resultDiv.innerHTML = '<div class="loading">Processing...</div>';
    
    try {
        const response = await fetch(`/api/project-action?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                projectId: projectContext.project_id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `<div class="result">✅ ${result.message}</div>`;
            retryAttempts[action] = 0;
        } else {
            showError(`Failed to ${action}: ${result.error}`, 'actionResult', () => performAction(action));
        }
    } catch (error) {
        showError(`Network error while performing ${action}. Please check your connection.`, 'actionResult', () => performAction(action));
    }
}

function retry(retryFunction) {
    if (typeof retryFunction === 'function') {
        retryFunction();
    }
}

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

