/**
 * Batch Import Extension for Add Resource Form
 * Extends the existing AddResourceForm class with batch import functionality
 */

// YAML parser for JavaScript (simple implementation)
class SimpleYAMLParser {
    static parse(yamlContent) {
        try {
            // This is a simplified YAML parser for the specific format we need
            // For production, you'd want to use a proper YAML library like js-yaml
            
            const lines = yamlContent.split('\n');
            const result = {};
            let currentKey = null;
            let currentResource = null;
            let resources = [];
            let inResources = false;
            let indentLevel = 0;
            
            for (let line of lines) {
                line = line.trimRight();
                if (!line || line.startsWith('#')) continue;
                
                const trimmed = line.trim();
                const indent = line.length - line.trimLeft().length;
                
                // Top level resources key
                if (trimmed === 'resources:') {
                    inResources = true;
                    indentLevel = indent;
                    continue;
                }
                
                if (inResources) {
                    // New resource item
                    if (trimmed.startsWith('- name:')) {
                        if (currentResource) {
                            resources.push(currentResource);
                        }
                        currentResource = {};
                        const nameValue = trimmed.substring(7).trim().replace(/^["']|["']$/g, '');
                        currentResource.name = nameValue;
                        continue;
                    }
                    
                    // Resource properties
                    if (currentResource && indent > indentLevel) {
                        if (trimmed.startsWith('url:')) {
                            currentResource.url = trimmed.substring(4).trim().replace(/^["']|["']$/g, '');
                        } else if (trimmed.startsWith('description:')) {
                            currentResource.description = trimmed.substring(12).trim().replace(/^["']|["']$/g, '');
                        } else if (trimmed.startsWith('tags:')) {
                            currentResource.tags = [];
                            // Handle inline array or multi-line array
                            const tagsContent = trimmed.substring(5).trim();
                            if (tagsContent.startsWith('[') && tagsContent.endsWith(']')) {
                                // Inline array format: ["tag1", "tag2"]
                                const tagsStr = tagsContent.slice(1, -1);
                                currentResource.tags = tagsStr.split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
                            }
                        } else if (trimmed.startsWith('- ') && currentResource.tags && Array.isArray(currentResource.tags)) {
                            // Multi-line array format
                            const tagValue = trimmed.substring(2).trim().replace(/^["']|["']$/g, '');
                            currentResource.tags.push(tagValue);
                        }
                    }
                }
            }
            
            // Add last resource
            if (currentResource) {
                resources.push(currentResource);
            }
            
            // If no resources key found, try parsing as direct array
            if (resources.length === 0) {
                // Try parsing as direct resource list
                return this.parseDirectArray(yamlContent);
            }
            
            return { resources };
            
        } catch (error) {
            console.error('YAML parsing error:', error);
            throw new Error(`YAML parsing failed: ${error.message}`);
        }
    }
    
    static parseDirectArray(yamlContent) {
        // Simplified parser for direct array format
        const resources = [];
        const lines = yamlContent.split('\n');
        let currentResource = null;
        
        for (let line of lines) {
            line = line.trimRight();
            if (!line || line.startsWith('#')) continue;
            
            const trimmed = line.trim();
            
            if (trimmed.startsWith('- name:')) {
                if (currentResource) {
                    resources.push(currentResource);
                }
                currentResource = {};
                currentResource.name = trimmed.substring(7).trim().replace(/^["']|["']$/g, '');
            } else if (currentResource) {
                if (trimmed.startsWith('url:')) {
                    currentResource.url = trimmed.substring(4).trim().replace(/^["']|["']$/g, '');
                } else if (trimmed.startsWith('description:')) {
                    currentResource.description = trimmed.substring(12).trim().replace(/^["']|["']$/g, '');
                } else if (trimmed.startsWith('tags:')) {
                    currentResource.tags = [];
                    const tagsContent = trimmed.substring(5).trim();
                    if (tagsContent.startsWith('[') && tagsContent.endsWith(']')) {
                        const tagsStr = tagsContent.slice(1, -1);
                        currentResource.tags = tagsStr.split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
                    }
                } else if (trimmed.startsWith('- ') && currentResource.tags && Array.isArray(currentResource.tags)) {
                    const tagValue = trimmed.substring(2).trim().replace(/^["']|["']$/g, '');
                    currentResource.tags.push(tagValue);
                }
            }
        }
        
        if (currentResource) {
            resources.push(currentResource);
        }
        
        return resources;
    }
}

// Extend the existing AddResourceForm class with batch import functionality
if (typeof AddResourceForm !== 'undefined') {
    
    // Store original setupEventListeners method
    const originalSetupEventListeners = AddResourceForm.prototype.setupEventListeners;
    
    // Extend setupEventListeners to include batch import handlers
    AddResourceForm.prototype.setupEventListeners = function() {
        // Call original method
        originalSetupEventListeners.call(this);
        
        // Add batch import event listeners
        this.setupBatchImportListeners();
    };
    
    // Add batch import state
    AddResourceForm.prototype.initBatchImport = function() {
        this.batchData = {
            resources: [],
            validatedResources: [],
            errors: [],
            duplicates: [],
            stats: {
                total: 0,
                valid: 0,
                duplicates: 0,
                errors: 0
            }
        };
    };
    
    AddResourceForm.prototype.setupBatchImportListeners = function() {
        // Initialize batch import state
        this.initBatchImport();
        
        // Import mode tabs
        document.querySelectorAll('.import-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchImportMode(e.target.dataset.mode));
        });
        
        // Batch import form elements
        const batchFileInput = document.getElementById('batch-file');
        if (batchFileInput) {
            batchFileInput.addEventListener('change', () => this.handleBatchFileSelect());
        }
        
        const validateBtn = document.getElementById('batch-validate-btn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.validateBatchFile());
        }
        
        const previewBtn = document.getElementById('batch-preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.showBatchPreview());
        }
        
        const submitBtn = document.getElementById('batch-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitBatchImport());
        }
        
        const downloadSampleBtn = document.getElementById('download-sample-btn');
        if (downloadSampleBtn) {
            downloadSampleBtn.addEventListener('click', () => this.downloadSampleYAML());
        }
    };
    
    AddResourceForm.prototype.switchImportMode = function(mode) {
        // Update tab states
        document.querySelectorAll('.import-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        // Show/hide appropriate forms
        document.querySelectorAll('.import-mode-content').forEach(content => {
            if (content.dataset.mode === mode) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
        
        // Reset batch data when switching modes
        if (mode === 'batch') {
            this.initBatchImport();
        }
    };
    
    AddResourceForm.prototype.handleBatchFileSelect = function() {
        const fileInput = document.getElementById('batch-file');
        const validateBtn = document.getElementById('batch-validate-btn');
        const previewBtn = document.getElementById('batch-preview-btn');
        const submitBtn = document.getElementById('batch-submit-btn');
        const validationDiv = document.getElementById('batch-file-validation');
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Basic file validation
            if (!file.name.match(/\.(yml|yaml)$/i)) {
                this.showValidation('batch-file-validation', 'error', 'Please select a YAML file (.yml or .yaml)');
                validateBtn.disabled = true;
                return;
            }
            
            if (file.size > 1024 * 1024) { // 1MB limit
                this.showValidation('batch-file-validation', 'error', 'File size must be less than 1MB');
                validateBtn.disabled = true;
                return;
            }
            
            // Enable validation button
            validateBtn.disabled = false;
            previewBtn.disabled = true;
            submitBtn.disabled = true;
            
            this.clearValidation('batch-file-validation');
        } else {
            validateBtn.disabled = true;
            previewBtn.disabled = true;
            submitBtn.disabled = true;
        }
    };
    
    AddResourceForm.prototype.validateBatchFile = function() {
        const fileInput = document.getElementById('batch-file');
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const yamlContent = e.target.result;
                const parsedData = SimpleYAMLParser.parse(yamlContent);
                
                this.processBatchData(parsedData);
                this.showBatchValidationResults();
                
            } catch (error) {
                this.showValidation('batch-file-validation', 'error', `YAML parsing error: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
    };
    
    AddResourceForm.prototype.processBatchData = function(parsedData) {
        // Reset batch data
        this.initBatchImport();
        
        // Get resources array
        let resources = [];
        if (parsedData.resources && Array.isArray(parsedData.resources)) {
            resources = parsedData.resources;
        } else if (Array.isArray(parsedData)) {
            resources = parsedData;
        } else {
            throw new Error('No resources found in YAML file');
        }
        
        this.batchData.resources = resources;
        this.batchData.stats.total = resources.length;
        
        // Validate each resource
        resources.forEach((resource, index) => {
            const validation = this.validateBatchResource(resource, index);
            
            if (validation.isValid) {
                if (validation.isDuplicate) {
                    this.batchData.duplicates.push({
                        resource,
                        index,
                        existing: validation.existingResource
                    });
                    this.batchData.stats.duplicates++;
                } else {
                    this.batchData.validatedResources.push(resource);
                    this.batchData.stats.valid++;
                }
            } else {
                this.batchData.errors.push({
                    resource,
                    index,
                    error: validation.error
                });
                this.batchData.stats.errors++;
            }
        });
    };
    
    AddResourceForm.prototype.validateBatchResource = function(resource, index) {
        // Check required fields
        const required = ['name', 'url', 'description', 'tags'];
        for (const field of required) {
            if (!resource[field]) {
                return {
                    isValid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }
        
        // Validate URL format
        try {
            new URL(resource.url);
        } catch {
            return {
                isValid: false,
                error: 'Invalid URL format'
            };
        }
        
        // Validate tags
        if (!Array.isArray(resource.tags) || resource.tags.length === 0) {
            return {
                isValid: false,
                error: 'Tags must be a non-empty array'
            };
        }
        
        // Check for invalid tag format
        for (const tag of resource.tags) {
            if (typeof tag !== 'string' || !tag.match(/^[a-z0-9\-]+(\\/[a-z0-9\-]+)*$/)) {
                return {
                    isValid: false,
                    error: `Invalid tag format: ${tag}`
                };
            }
        }
        
        // Check for duplicates
        const normalizedUrl = this.normalizeUrl(resource.url);
        if (this.existingUrls.has(normalizedUrl)) {
            return {
                isValid: true,
                isDuplicate: true,
                existingResource: { url: normalizedUrl }
            };
        }
        
        return { isValid: true, isDuplicate: false };
    };
    
    AddResourceForm.prototype.showBatchValidationResults = function() {
        const stats = this.batchData.stats;
        const previewBtn = document.getElementById('batch-preview-btn');
        const submitBtn = document.getElementById('batch-submit-btn');
        
        let message = `Found ${stats.total} resources: `;
        let type = 'success';
        
        if (stats.errors > 0) {
            message += `${stats.errors} errors, `;
            type = 'error';
        }
        
        if (stats.duplicates > 0) {
            message += `${stats.duplicates} duplicates, `;
            if (type !== 'error') type = 'warning';
        }
        
        message += `${stats.valid} valid resources`;
        
        this.showValidation('batch-file-validation', type, message);
        
        // Enable buttons based on results
        previewBtn.disabled = stats.total === 0;
        submitBtn.disabled = stats.valid === 0;
    };
    
    AddResourceForm.prototype.showBatchPreview = function() {
        const previewSection = document.getElementById('batch-preview-section');
        const previewContent = document.getElementById('batch-preview-content');
        
        // Create stats display
        const stats = this.batchData.stats;
        const statsHtml = `
            <div class="batch-preview-stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.valid}</div>
                    <div class="stat-label">Valid</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.duplicates}</div>
                    <div class="stat-label">Duplicates</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.errors}</div>
                    <div class="stat-label">Errors</div>
                </div>
            </div>
        `;
        
        // Create resource list
        const resourcesHtml = this.createBatchResourceListHtml();
        
        previewContent.innerHTML = statsHtml + resourcesHtml;
        previewSection.style.display = 'block';
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
    };
    
    AddResourceForm.prototype.createBatchResourceListHtml = function() {
        let html = '<div class="batch-resource-list">';
        
        // Valid resources
        this.batchData.validatedResources.forEach(resource => {
            html += this.createResourceItemHtml(resource, 'valid', 'Valid');
        });
        
        // Duplicates
        this.batchData.duplicates.forEach(({ resource }) => {
            html += this.createResourceItemHtml(resource, 'duplicate', 'Duplicate');
        });
        
        // Errors
        this.batchData.errors.forEach(({ resource, error }) => {
            html += this.createResourceItemHtml(resource, 'error', error);
        });
        
        html += '</div>';
        return html;
    };
    
    AddResourceForm.prototype.createResourceItemHtml = function(resource, status, statusText) {
        const tagsHtml = (resource.tags || []).map(tag => 
            `<span class="batch-resource-tag">${tag}</span>`
        ).join('');
        
        return `
            <div class="batch-resource-item">
                <div class="batch-resource-info">
                    <div class="batch-resource-name">${resource.name || 'Unnamed'}</div>
                    <div class="batch-resource-url">${resource.url || 'No URL'}</div>
                    <div class="batch-resource-description">${resource.description || 'No description'}</div>
                    <div class="batch-resource-tags">${tagsHtml}</div>
                </div>
                <div class="batch-resource-status ${status}">${statusText}</div>
            </div>
        `;
    };
    
    AddResourceForm.prototype.submitBatchImport = function() {
        const skipDuplicates = document.getElementById('skip-duplicates').checked;
        const validateOnly = document.getElementById('validate-only').checked;
        const submissionType = document.getElementById('batch-submission-type').value;
        
        if (validateOnly) {
            alert('Validation complete! Resources would be ready for import.');
            return;
        }
        
        let resourcesToSubmit = [...this.batchData.validatedResources];
        
        if (!skipDuplicates) {
            // Add duplicates if user wants to include them
            resourcesToSubmit.push(...this.batchData.duplicates.map(d => d.resource));
        }
        
        if (resourcesToSubmit.length === 0) {
            alert('No resources to submit!');
            return;
        }
        
        // Generate YAML for submission
        const yamlContent = this.generateBatchYAML(resourcesToSubmit);
        
        // Handle different submission types
        this.handleBatchSubmission(submissionType, yamlContent, resourcesToSubmit);
    };
    
    AddResourceForm.prototype.generateBatchYAML = function(resources) {
        let yaml = 'resources:\\n';
        
        resources.forEach(resource => {
            yaml += `- name: "${resource.name}"\\n`;
            yaml += `  url: "${resource.url}"\\n`;
            yaml += `  description: "${resource.description}"\\n`;
            yaml += '  tags: [';
            yaml += resource.tags.map(tag => `"${tag}"`).join(', ');
            yaml += ']\\n\\n';
        });
        
        return yaml;
    };
    
    AddResourceForm.prototype.handleBatchSubmission = function(type, yamlContent, resources) {
        switch (type) {
            case 'copy-yaml':
                navigator.clipboard.writeText(yamlContent.replace(/\\n/g, '\\n')).then(() => {
                    alert('YAML content copied to clipboard!');
                });
                break;
                
            case 'github-issue':
                const issueBody = `## Batch Resource Import Request\\n\\n` +
                    `Please add the following ${resources.length} resources:\\n\\n` +
                    `\`\`\`yaml\\n${yamlContent.replace(/\\n/g, '\\n')}\`\`\``;
                
                const issueUrl = `https://github.com/BaptisteBlouin/AI-resources/issues/new?` +
                    `title=${encodeURIComponent('Batch Import: ' + resources.length + ' resources')}&` +
                    `body=${encodeURIComponent(issueBody)}`;
                
                window.open(issueUrl, '_blank');
                break;
                
            case 'github-pr':
                alert('GitHub PR creation for batch import is not yet implemented. Please use the "Copy YAML" option and create a manual PR.');
                break;
                
            default:
                console.error('Unknown submission type:', type);
        }
    };
    
    AddResourceForm.prototype.downloadSampleYAML = function() {
        const sampleYAML = `resources:
  - name: "Example AI Tool"
    url: "https://example.com/ai-tool"
    description: "An example AI tool for demonstration purposes"
    tags: ["tools/example", "tutorials/demo"]
  - name: "Another Example"
    url: "https://github.com/example/repo"  
    description: "Another example resource"
    tags: ["libraries/python/ml", "tools/development"]
  - name: "Third Example"
    url: "https://arxiv.org/abs/example"
    description: "Example research paper"
    tags: ["papers/machine-learning", "papers/nlp"]`;
        
        const blob = new Blob([sampleYAML], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-batch-import.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // Utility methods
    AddResourceForm.prototype.showValidation = function(elementId, type, message) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.className = `validation-status ${type}`;
        element.textContent = message;
        element.classList.remove('hidden');
    };
    
    AddResourceForm.prototype.clearValidation = function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('hidden');
        element.textContent = '';
    };
}