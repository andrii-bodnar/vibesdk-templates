let userContext = {};
let jwtToken = null;
let currentConfig = null;

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
        const response = await fetch(`/api/config?jwt=${jwtToken}`);
        const result = await response.json();
        
        if (result.success) {
            currentConfig = result.config;
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
    // Module enable/disable
    document.getElementById('modulePreImport').checked = config.modules.preImport;
    document.getElementById('modulePostImport').checked = config.modules.postImport;
    document.getElementById('modulePreExport').checked = config.modules.preExport;
    document.getElementById('modulePostExport').checked = config.modules.postExport;
    
    // Render rules for each module
    renderRules('preImport', config.preImport.replaceRules);
    renderRules('postImport', config.postImport.replaceRules);
    renderRules('preExport', config.preExport.replaceRules);
    renderRules('postExport', config.postExport.replaceRules);
}

function renderRules(module, rules) {
    const listDiv = document.getElementById(`${module}Rules`);
    
    if (!rules || rules.length === 0) {
        listDiv.innerHTML = '<div class="empty-state-small">No rules configured</div>';
        return;
    }
    
    listDiv.innerHTML = rules.map((rule, index) => `
        <div class="rule-item">
            <code class="rule-find">${escapeHtml(rule.find)}</code>
            <span class="arrow">→</span>
            <code class="rule-replace">${escapeHtml(rule.replace)}</code>
            <button 
                class="btn-remove-small" 
                onclick="removeRule('${module}', ${index})"
                aria-label="Remove rule">
                ❌
            </button>
        </div>
    `).join('');
}

function addRule(module) {
    const findInput = document.getElementById(`${module}Find`);
    const replaceInput = document.getElementById(`${module}Replace`);
    
    const find = findInput.value.trim();
    const replace = replaceInput.value;
    
    if (!find) {
        showError('Find pattern is required', 'saveResult');
        setTimeout(() => {
            document.getElementById('saveResult').innerHTML = '';
        }, 3000);
        return;
    }
    
    // Validate regex
    try {
        new RegExp(find);
    } catch (e) {
        showError('Invalid regex pattern: ' + e.message, 'saveResult');
        setTimeout(() => {
            document.getElementById('saveResult').innerHTML = '';
        }, 3000);
        return;
    }
    
    // Add rule to config
    if (!currentConfig) {
        currentConfig = getDefaultConfig();
    }
    
    // Get the module config
    const configModule = currentConfig[module];
    
    if (!configModule.replaceRules) {
        configModule.replaceRules = [];
    }
    
    configModule.replaceRules.push({ find, replace });
    
    // Clear inputs
    findInput.value = '';
    replaceInput.value = '';
    
    // Re-render
    renderRules(module, configModule.replaceRules);
    
    showSuccess(`Rule added. Don't forget to save!`, 'saveResult');
    setTimeout(() => {
        document.getElementById('saveResult').innerHTML = '';
    }, 3000);
}

function removeRule(module, index) {
    if (!currentConfig) return;
    
    const configModule = currentConfig[module];
    
    if (configModule.replaceRules) {
        configModule.replaceRules.splice(index, 1);
        renderRules(module, configModule.replaceRules);
        
        showSuccess(`Rule removed. Don't forget to save!`, 'saveResult');
        setTimeout(() => {
            document.getElementById('saveResult').innerHTML = '';
        }, 3000);
    }
}

function collectConfigFromForm() {
    return {
        modules: {
            preImport: document.getElementById('modulePreImport').checked,
            postImport: document.getElementById('modulePostImport').checked,
            preExport: document.getElementById('modulePreExport').checked,
            postExport: document.getElementById('modulePostExport').checked
        },
        preImport: {
            replaceRules: currentConfig?.preImport?.replaceRules || []
        },
        postImport: {
            replaceRules: currentConfig?.postImport?.replaceRules || []
        },
        preExport: {
            replaceRules: currentConfig?.preExport?.replaceRules || []
        },
        postExport: {
            replaceRules: currentConfig?.postExport?.replaceRules || []
        }
    };
}

async function saveConfiguration() {
    if (!jwtToken) {
        showError('JWT token not available', 'saveResult');
        return;
    }
    
    const resultDiv = document.getElementById('saveResult');
    resultDiv.innerHTML = '<div class="loading">💾 Saving configuration...</div>';
    
    try {
        const config = collectConfigFromForm();
        
        const response = await fetch(`/api/config?jwt=${jwtToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ config })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentConfig = config;
            showSuccess(result.message || 'Configuration saved successfully', 'saveResult');
            updateStatusDisplay(config);
            
            setTimeout(() => {
                resultDiv.innerHTML = '';
            }, 5000);
        } else {
            showError('Failed to save configuration: ' + result.error, 'saveResult');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showError('Network error while saving configuration.', 'saveResult');
    }
}

function updateStatusDisplay(config) {
    const statusDiv = document.getElementById('statusInfo');
    
    const enabledModules = [];
    if (config.modules.preImport) enabledModules.push('Pre-Import');
    if (config.modules.postImport) enabledModules.push('Post-Import');
    if (config.modules.preExport) enabledModules.push('Pre-Export');
    if (config.modules.postExport) enabledModules.push('Post-Export');
    
    const totalRules = 
        (config.preImport.replaceRules?.length || 0) +
        (config.postImport.replaceRules?.length || 0) +
        (config.preExport.replaceRules?.length || 0) +
        (config.postExport.replaceRules?.length || 0);
    
    statusDiv.className = 'status-enabled';
    statusDiv.innerHTML = `
        <div class="status-card">
            <div class="status-item">
                <strong>Active Modules:</strong> ${enabledModules.join(', ') || 'None'}
            </div>
            <div class="status-item">
                <strong>Total Replacement Rules:</strong> ${totalRules}
            </div>
            <div class="status-item">
                <strong>Pre-Import Rules:</strong> ${config.preImport.replaceRules?.length || 0}
            </div>
            <div class="status-item">
                <strong>Post-Import Rules:</strong> ${config.postImport.replaceRules?.length || 0}
            </div>
            <div class="status-item">
                <strong>Pre-Export Rules:</strong> ${config.preExport.replaceRules?.length || 0}
            </div>
            <div class="status-item">
                <strong>Post-Export Rules:</strong> ${config.postExport.replaceRules?.length || 0}
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

function getDefaultConfig() {
    return {
        modules: {
            preImport: true,
            postImport: true,
            preExport: true,
            postExport: true
        },
        preImport: {
            replaceRules: []
        },
        postImport: {
            replaceRules: []
        },
        preExport: {
            replaceRules: []
        },
        postExport: {
            replaceRules: []
        }
    };
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

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
