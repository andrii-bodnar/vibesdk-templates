// Organization Menu App - Frontend Logic

let orgContext = {};
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
    // Get organization context
    AP.getContext(function(context) {
        orgContext = context;
        updateOrgDisplay(context);
    });
    
    // Get JWT token for API calls
    AP.getJwtToken(function(token) {
        jwtToken = token;
    });
}

/**
 * Update organization information display
 */
function updateOrgDisplay(context) {
    const orgDiv = document.getElementById('orgInfo');
    if (context && context.organization_id) {
        orgDiv.innerHTML = `
            <strong>Organization ID:</strong> ${context.organization_id}<br>
            <strong>Status:</strong> Connected and ready
        `;
        orgDiv.className = '';
    } else {
        orgDiv.innerHTML = 'No organization information available';
        orgDiv.className = 'loading';
    }
}

/**
 * Load projects organized by groups
 */
async function loadProjectsByGroups() {
    if (!jwtToken) {
        showError('JWT token not available', 'projectsResult', null);
        return;
    }
    
    const resultDiv = document.getElementById('projectsResult');
    resultDiv.innerHTML = '<div class="loading">Loading projects and groups...</div>';
    
    try {
        const response = await fetch(`/api/projects-by-groups?jwt=${jwtToken}`);
        const result = await response.json();
        
        if (result.success) {
            displayProjectsByGroups(result.data);
            retryAttempts.projectsByGroups = 0;
        } else {
            showError(`Failed to load projects: ${result.error}`, 'projectsResult', loadProjectsByGroups);
        }
    } catch (error) {
        showError('Network error while loading projects. Please check your connection.', 'projectsResult', loadProjectsByGroups);
    }
}

/**
 * Display projects organized by groups
 */
function displayProjectsByGroups(data) {
    const resultDiv = document.getElementById('projectsResult');
    
    if (!data.groups || data.groups.length === 0) {
        resultDiv.innerHTML = `
            <div class="empty-state">
                <div class="icon">📂</div>
                <h4>No Groups Found</h4>
                <p>This organization doesn't have any groups yet.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="groups-container">';
    
    // Display ungrouped projects first if any
    if (data.ungroupedProjects && data.ungroupedProjects.length > 0) {
        html += `
            <div class="group-card">
                <div class="group-header">
                    <h3>📋 Ungrouped Projects</h3>
                    <span class="project-count">${data.ungroupedProjects.length} project(s)</span>
                </div>
                <div class="projects-list">
                    ${data.ungroupedProjects.map(project => `
                        <div class="project-item">
                            <span class="project-name">${project.name}</span>
                            <span class="project-id">#${project.id}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Display groups with their projects
    data.groups.forEach(group => {
        const projectCount = group.projects ? group.projects.length : 0;
        html += `
            <div class="group-card">
                <div class="group-header">
                    <h3>📁 ${group.name}</h3>
                    <span class="project-count">${projectCount} project(s)</span>
                </div>
                ${group.description ? `<p class="group-description">${group.description}</p>` : ''}
                ${projectCount > 0 ? `
                    <div class="projects-list">
                        ${group.projects.map(project => `
                            <div class="project-item">
                                <span class="project-name">${project.name}</span>
                                <span class="project-id">#${project.id}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-projects">No projects in this group</p>'}
            </div>
        `;
    });
    
    html += '</div>';
    
    resultDiv.innerHTML = html;
}

/**
 * Refresh data
 */
function refreshData() {
    loadProjectsByGroups();
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

