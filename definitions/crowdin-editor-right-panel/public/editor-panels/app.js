// Editor Right Panel App - Frontend Logic

let editorContext = {};

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
 * Initialize the app with Editor context
 */
function initializeApp() {
    // Get editor context
    if (AP.getContext) {
        AP.getContext(function(context) {
            editorContext = context;
        });
    }
    
    // Load current string info
    loadCurrentString();
    
    // Listen to string changes
    if (AP.events && AP.events.on) {
        AP.events.on('string.change', function(data) {
            updateStringContext();
        });
    }
}

/**
 * Update string context display
 */
function updateStringContext() {
    const stringDiv = document.getElementById('stringInfo');
    stringDiv.innerHTML = '<div class="loading">🔄 String changed, loading...</div>';
    
    setTimeout(() => {
        loadCurrentString();
    }, 100);
}

/**
 * Load current string information
 */
function loadCurrentString() {
    const stringDiv = document.getElementById('stringInfo');
    
    if (!window.AP || !window.AP.editor) {
        stringDiv.innerHTML = '<div class="error">Editor API not available</div>';
        return;
    }
    
    AP.editor.getString(function(string) {
        if (string) {
            // Add visual indicator that string was updated
            stringDiv.className = 'string-updated';
            
            stringDiv.innerHTML = `
                <strong>String ID:</strong> ${string.id}<br>
                <strong>Text:</strong> ${string.text}<br>
                <strong>Context:</strong> ${string.context || 'N/A'}<br>
                <strong>File:</strong> ${string.file ? string.file.name : 'N/A'}
            `;
            
            // Remove update indicator after animation
            setTimeout(() => {
                stringDiv.className = '';
            }, 300);
        } else {
            stringDiv.innerHTML = 'No string selected';
            stringDiv.className = 'loading';
        }
    });
}

/**
 * Set sample text as translation
 */
function insertSampleText() {
    if (!checkEditorAPI()) return;
    
    AP.editor.setTranslation('Sample Text');
    showSuccess('Translation set to sample text');
}

/**
 * Append timestamp to translation
 */
function appendTimestamp() {
    if (!checkEditorAPI()) return;
    
    const timestamp = new Date().toLocaleTimeString();
    AP.editor.appendTranslation(` [${timestamp}]`);
    showSuccess('Timestamp appended');
}

/**
 * Convert current translation to uppercase
 */
function toUpperCase() {
    if (!checkEditorAPI()) return;
    
    AP.editor.getTopTranslation(function(translation) {
        if (translation && translation.text) {
            AP.editor.setTranslation(translation.text.toUpperCase());
            showSuccess('Converted to uppercase');
        } else {
            showError('No translation to convert');
        }
    });
}

/**
 * Clear translation
 */
function clearTranslation() {
    if (!checkEditorAPI()) return;
    
    AP.editor.clearTranslation();
    showSuccess('Translation cleared');
}

/**
 * Check if Editor API is available
 */
function checkEditorAPI() {
    if (!window.AP || !window.AP.editor) {
        showError('Editor API not available. This panel works only within Crowdin editor.');
        return false;
    }
    return true;
}

/**
 * Show success message
 */
function showSuccess(message) {
    const resultDiv = document.getElementById('actionResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="result">✅ ${message}</div>`;
        setTimeout(() => {
            resultDiv.innerHTML = '';
        }, 3000);
    }
}

/**
 * Show error message
 */
function showError(message) {
    const resultDiv = document.getElementById('actionResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
    }
}

