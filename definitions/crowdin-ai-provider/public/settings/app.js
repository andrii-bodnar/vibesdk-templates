let userContext = {};
let jwtToken = null;

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
        userContext = context;
        console.log('User Context:', context);
    });
    
    AP.getJwtToken(function(token) {
        jwtToken = token;
        loadConfiguration();
    });
}

async function loadConfiguration() {
    if (!jwtToken) {
        showError('JWT token not available', 'statusInfo');
        return;
    }
    
    const statusDiv = document.getElementById('statusInfo');
    statusDiv.className = 'loading';
    statusDiv.textContent = 'Loading configuration...';
    
    try {
        const response = await fetch(`/api/ai-config?jwt=${jwtToken}`);
        const result = await response.json();
        
        if (result.success) {
            updateFormWithConfig(result.config);
            updateStatusDisplay(result.config);
        } else {
            showError('Failed to load configuration: ' + result.error, 'statusInfo');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        showError('Error loading configuration. Please check your connection.', 'statusInfo');
    }
}

function updateFormWithConfig(config) {
    // Update form fields with loaded configuration
    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('apiEndpoint').value = config.apiEndpoint || '';
}

function updateStatusDisplay(config) {
    const statusDiv = document.getElementById('statusInfo');
    
    const hasApiKey = config.apiKey && config.apiKey.length > 0;
    const apiKeyMasked = hasApiKey ? config.apiKey.substring(0, 7) + '...' : 'Not configured';
    
    statusDiv.className = hasApiKey ? 'status-enabled' : 'status-disabled';
    statusDiv.innerHTML = `
        <div class="status-card">
            <div class="status-item">
                <strong>Configuration Status:</strong> ${hasApiKey ? '✅ Configured' : '⚠️ Not Configured'}
            </div>
            <div class="status-item">
                <strong>API Key:</strong> ${apiKeyMasked}
            </div>
            <div class="status-item">
                <strong>API Endpoint:</strong> ${config.apiEndpoint || 'Default (OpenAI)'}
            </div>
            <div class="status-item">
                <strong>Organization ID:</strong> ${userContext.organization_id || 'N/A'}
            </div>
            <div class="status-item">
                <strong>Scope:</strong> Organization-wide (applies to all projects)
            </div>
        </div>
    `;
}

async function saveConfiguration() {
    if (!jwtToken) {
        showError('JWT token not available', 'saveResult');
        return;
    }
    
    // Get form values
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
    
    // Validate required fields
    if (!apiKey) {
        showError('API Key is required', 'saveResult');
        return;
    }
    
    const resultDiv = document.getElementById('saveResult');
    resultDiv.innerHTML = '<div class="loading">💾 Saving configuration...</div>';
    
    try {
        const response = await fetch(`/api/ai-config?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey,
                apiEndpoint
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message, 'saveResult');
            updateStatusDisplay({ apiKey, apiEndpoint });
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                resultDiv.innerHTML = '';
            }, 5000);
        } else {
            showError('Failed to save configuration: ' + result.error, 'saveResult');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showError('Network error while saving configuration. Please check your connection.', 'saveResult');
    }
}

function showSuccess(message, elementId = 'saveResult') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="success">
                <strong>✅ Success</strong>
                <p>${message}</p>
            </div>
        `;
    }
}

function showError(message, elementId = 'saveResult') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error">
                <strong>❌ Error</strong>
                <p>${message}</p>
            </div>
        `;
    }
}

