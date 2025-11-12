let userContext = {};
let jwtToken = null;
let languageMapping = {};

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
        const response = await fetch(`/api/mt-config?jwt=${jwtToken}`);
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
    languageMapping = config.languageMapping || {};
    renderMappingList();
}

function renderMappingList() {
    const listDiv = document.getElementById('mappingList');
    const mappings = Object.entries(languageMapping);
    
    if (mappings.length === 0) {
        listDiv.innerHTML = `
            <div class="empty-state">
                <div class="icon">🗺️</div>
                <p>No language mappings configured yet.</p>
                <p class="hint">Add your first mapping below to get started.</p>
            </div>
        `;
        return;
    }
    
    listDiv.innerHTML = mappings.map(([from, to]) => `
        <div class="mapping-item">
            <code class="lang-code">${from}</code>
            <span class="arrow">→</span>
            <code class="lang-code">${to}</code>
            <button 
                class="btn-remove" 
                onclick="removeMapping('${from}')"
                aria-label="Remove mapping from ${from} to ${to}">
                ❌
            </button>
        </div>
    `).join('');
}

function addMapping() {
    const fromLang = document.getElementById('fromLanguage').value.trim();
    const toLang = document.getElementById('toLanguage').value.trim();
    
    if (!fromLang || !toLang) {
        showError('Both language codes are required', 'saveResult');
        setTimeout(() => {
            document.getElementById('saveResult').innerHTML = '';
        }, 3000);
        return;
    }
    
    if (fromLang === toLang) {
        showError('Language codes must be different', 'saveResult');
        setTimeout(() => {
            document.getElementById('saveResult').innerHTML = '';
        }, 3000);
        return;
    }
    
    // Add to mapping
    languageMapping[fromLang] = toLang;
    
    // Clear inputs
    document.getElementById('fromLanguage').value = '';
    document.getElementById('toLanguage').value = '';
    
    // Re-render list
    renderMappingList();
    
    // Show success message
    showSuccess(`Mapping added: ${fromLang} → ${toLang}. Don't forget to save!`, 'saveResult');
    setTimeout(() => {
        document.getElementById('saveResult').innerHTML = '';
    }, 3000);
}

function removeMapping(fromLang) {
    delete languageMapping[fromLang];
    renderMappingList();
    
    showSuccess(`Mapping removed: ${fromLang}. Don't forget to save!`, 'saveResult');
    setTimeout(() => {
        document.getElementById('saveResult').innerHTML = '';
    }, 3000);
}

function updateStatusDisplay(config) {
    const statusDiv = document.getElementById('statusInfo');
    
    const mappingCount = Object.keys(config.languageMapping || {}).length;
    const mappingList = Object.entries(config.languageMapping || {})
        .map(([from, to]) => `<li><code>${from} → ${to}</code></li>`)
        .join('');
    
    statusDiv.className = 'status-enabled';
    statusDiv.innerHTML = `
        <div class="status-card">
            <div class="status-item">
                <strong>Language Mappings:</strong> ${mappingCount} configured
                ${mappingCount > 0 ? `<ul class="mapping-preview">${mappingList}</ul>` : ''}
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
    
    const resultDiv = document.getElementById('saveResult');
    resultDiv.innerHTML = '<div class="loading">💾 Saving configuration...</div>';
    
    try {
        const response = await fetch(`/api/mt-config?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                languageMapping: languageMapping
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(result.message, 'saveResult');
            updateStatusDisplay({ languageMapping });
            
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
