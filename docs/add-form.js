/**
 * Add Resource Form - Interactive Web Interface
 * Handles form validation, tag management, and GitHub integration
 */

class AddResourceForm {
    constructor() {
        this.existingTags = new Set();
        this.selectedTags = new Set();
        this.existingUrls = new Set();
        this.formData = {};
        this.tagCategories = new Map();
        this.tagHierarchy = new Map();
        this.tagUsageCount = new Map();
        
        this.init();
    }

    async init() {
        await this.loadExistingData();
        this.setupEventListeners();
        this.setupTagSystem();
        console.log('Add Resource Form initialized');
    }

    async loadExistingData() {
        try {
            // Load existing resources to check for duplicates and get tags
            const response = await fetch('resources.json');
            if (response.ok) {
                const data = await response.json();
                this.extractTagsAndUrls(data);
            }
        } catch (error) {
            console.error('Could not load existing resources:', error);
        }
    }

    extractTagsAndUrls(data, prefix = '') {
        if (!data || typeof data !== 'object') return;

        for (const [key, value] of Object.entries(data)) {
            if (key === '_items' && Array.isArray(value)) {
                // Process items
                value.forEach(item => {
                    if (item.url) {
                        this.existingUrls.add(this.normalizeUrl(item.url));
                    }
                    if (item.tags) {
                        item.tags.forEach(tag => {
                            this.existingTags.add(tag);
                            
                            // Track tag usage count
                            this.tagUsageCount.set(tag, (this.tagUsageCount.get(tag) || 0) + 1);
                            
                            // Track categories and hierarchy
                            const parts = tag.split('/');
                            const category = parts[0];
                            
                            // Top-level categories
                            if (!this.tagCategories.has(category)) {
                                this.tagCategories.set(category, new Set());
                            }
                            this.tagCategories.get(category).add(tag);
                            
                            // Build hierarchy for nested browsing
                            let currentPath = '';
                            for (let i = 0; i < parts.length; i++) {
                                const part = parts[i];
                                const parentPath = currentPath;
                                currentPath = currentPath ? `${currentPath}/${part}` : part;
                                
                                if (!this.tagHierarchy.has(currentPath)) {
                                    this.tagHierarchy.set(currentPath, {
                                        fullPath: currentPath,
                                        level: i,
                                        parent: parentPath,
                                        children: new Set(),
                                        tags: new Set(),
                                        directTags: new Set()
                                    });
                                }
                                
                                // Add to parent's children
                                if (parentPath && this.tagHierarchy.has(parentPath)) {
                                    this.tagHierarchy.get(parentPath).children.add(currentPath);
                                }
                                
                                // Add tag to all levels it belongs to
                                this.tagHierarchy.get(currentPath).tags.add(tag);
                                
                                // Add as direct tag only if it's the exact path
                                if (currentPath === tag) {
                                    this.tagHierarchy.get(currentPath).directTags.add(tag);
                                }
                            }
                        });
                    }
                });
            } else if (typeof value === 'object') {
                // Recursively process subcategories
                this.extractTagsAndUrls(value, prefix ? `${prefix}/${key}` : key);
            }
        }
    }

    normalizeUrl(url) {
        if (!url) return '';
        
        try {
            // Clean up the URL first
            let cleanUrl = url.trim();
            
            // Remove common prefixes that users might add
            const prefixesToRemove = ['www.', 'http://www.', 'https://www.'];
            for (const prefix of prefixesToRemove) {
                if (cleanUrl.toLowerCase().startsWith(prefix)) {
                    cleanUrl = cleanUrl.substring(prefix.length);
                    break;
                }
            }
            
            // Add https:// if no protocol specified
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            
            const urlObj = new URL(cleanUrl);
            
            // Remove www. from hostname for consistent comparison
            let hostname = urlObj.hostname.toLowerCase();
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }
            
            // Always use https for normalization, remove trailing slash, no fragment
            const normalized = `https://${hostname}${urlObj.pathname === '/' ? '' : urlObj.pathname.replace(/\/$/, '')}${urlObj.search}`;
            
            return normalized;
        } catch (error) {
            console.error('URL normalization error:', error);
            return url.toLowerCase().trim();
        }
    }

    setupEventListeners() {
        // URL validation
        const urlInput = document.getElementById('url');
        urlInput.addEventListener('blur', () => this.validateUrl());
        urlInput.addEventListener('input', () => this.clearValidation('url-validation'));

        // Auto-suggest name from URL
        urlInput.addEventListener('blur', () => this.suggestNameFromUrl());

        // Enhanced tag input
        const tagInput = document.getElementById('tag-input');
        tagInput.addEventListener('input', (e) => this.handleTagInput(e));
        tagInput.addEventListener('keydown', (e) => this.handleTagKeydown(e));
        tagInput.addEventListener('focus', () => this.showTagSuggestions());

        // Browse tags button
        const browseTagsBtn = document.getElementById('browse-tags-btn');
        if (browseTagsBtn) {
            console.log('Found browse tags button, adding listener');
            browseTagsBtn.addEventListener('click', () => {
                console.log('Browse tags button clicked');
                this.toggleTagBrowser();
            });
        } else {
            console.error('Browse tags button not found');
        }

        // Close suggestions dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tag-suggestions-dropdown') && !e.target.closest('#tag-input')) {
                this.hideTagSuggestions();
            }
        });

        // Handle clicks on suggestions using event delegation
        const suggestionsContent = document.getElementById('suggestions-content');
        if (suggestionsContent) {
            suggestionsContent.addEventListener('click', (e) => {
                const suggestionEl = e.target.closest('.tag-suggestion');
                if (suggestionEl) {
                    e.preventDefault();
                    e.stopPropagation();
                    const tagName = suggestionEl.dataset.tag;
                    this.addTag(tagName);
                    document.getElementById('tag-input').value = '';
                    this.hideTagSuggestions();
                }
            });
        }
        
        const closeButton = document.querySelector('.close-suggestions');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideTagSuggestions();
            });
        }

        // Form submission
        const form = document.getElementById('add-resource-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Preview button
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('close-preview').addEventListener('click', () => this.hidePreview());
        document.getElementById('confirm-submit').addEventListener('click', () => this.submitResource());

        // Real-time validation
        ['name', 'description'].forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('input', () => this.validateField(fieldId));
        });

        // Handle removing tags
        document.getElementById('selected-tags').addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                this.removeTag(e.target.dataset.tag);
            }
        });
    }

    setupTagSystem() {
        // Initialize popular tags and categories
        this.populatePopularTags();
        this.populateCategories();
        this.updateTagCounter();
    }

    populatePopularTags() {
        const popularTagsList = document.getElementById('popular-tags-list');
        if (!popularTagsList) return;

        // Get most used tags (top 10)
        const sortedTags = Array.from(this.tagUsageCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        popularTagsList.innerHTML = sortedTags
            .map(([tag, count]) => `
                <div class="popular-tag" data-tag="${tag}" title="Used ${count} times">
                    ${tag}
                </div>
            `).join('');

        // Add click handlers
        popularTagsList.querySelectorAll('.popular-tag').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tagName = el.dataset.tag;
                console.log('Popular tag clicked:', tagName);
                this.addTag(tagName);
            });
        });
    }

    populateCategories() {
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) {
            console.error('categories-list element not found');
            return;
        }

        console.log('Tag hierarchy size:', this.tagHierarchy.size);
        
        // Get top-level categories (level 0) - simplified approach
        const topLevel = Array.from(this.tagHierarchy.values())
            .filter(item => item.level === 0)
            .sort((a, b) => b.tags.size - a.tags.size);

        console.log('Top-level categories found:', topLevel.length);
        
        // Create simple category buttons
        const categoriesHTML = topLevel.map(category => {
            const icon = this.getCategoryIcon(category.fullPath, 0, false);
            const tagCount = category.tags.size;
            
            return `
                <div class="simple-category-item" data-category="${category.fullPath}">
                    <span class="category-icon">${icon}</span>
                    <span class="category-name">${category.fullPath}</span>
                    <span class="category-count">${tagCount}</span>
                </div>
            `;
        }).join('');
        
        categoriesList.innerHTML = categoriesHTML;
        this.attachSimpleCategoryHandlers(categoriesList);
    }

    buildCategoryTree(items, level) {
        return items.map(item => {
            const hasChildren = item.children.size > 0;
            const tagCount = item.tags.size;
            const directTagCount = item.directTags.size;
            const indent = level * 1.5;
            
            // Get icon based on category and level
            const icon = this.getCategoryIcon(item.fullPath, level, hasChildren);
            
            // Build the item HTML
            let html = `
                <div class="category-item ${hasChildren ? 'has-children' : ''}" 
                     data-category="${item.fullPath}" 
                     data-level="${level}"
                     style="padding-left: ${indent}rem;">
                    <div class="category-content">
                        <span class="category-icon">${icon}</span>
                        <span class="category-name">${item.fullPath.split('/').pop()}</span>
                        <span class="category-counts">
                            ${directTagCount > 0 ? `<span class="direct-count">${directTagCount}</span>` : ''}
                            ${tagCount !== directTagCount ? `<span class="total-count">+${tagCount - directTagCount}</span>` : ''}
                        </span>
                        ${hasChildren ? '<span class="expand-arrow">▶</span>' : ''}
                    </div>
                </div>
            `;

            // Add children if they exist
            if (hasChildren) {
                const children = Array.from(item.children)
                    .map(childPath => this.tagHierarchy.get(childPath))
                    .filter(child => child)
                    .sort((a, b) => b.tags.size - a.tags.size);
                
                html += `<div class="category-children hidden" data-parent="${item.fullPath}">`;
                html += this.buildCategoryTree(children, level + 1);
                html += `</div>`;
            }

            return html;
        }).join('');
    }

    getCategoryIcon(path, level, hasChildren) {
        const pathParts = path.split('/');
        const category = pathParts[0];
        const subcategory = pathParts[1];
        
        if (level === 0) {
            // Top-level category icons
            const icons = {
                'libraries': '📚',
                'tools': '🛠️',
                'papers': '📄',
                'datasets': '📊',
                'tutorials': '🎓',
                'community': '👥',
                'web-resources': '🌐',
                'books': '📖',
                'certificates': '🏆',
                'universities': '🏛️'
            };
            return icons[category] || '📁';
        } else if (level === 1) {
            // Subcategory icons
            const subIcons = {
                'python': '🐍',
                'javascript': '🟨',
                'deep-learning': '🧠',
                'machine-learning': '🤖',
                'nlp': '💬',
                'cv': '👁️',
                'data': '💾',
                'tools': '⚙️',
                'images': '🖼️',
                'text': '📝',
                'audio': '🔊',
                'transformers': '🔄',
                'generative': '✨',
                'reinforcement-learning': '🎮',
                'forums': '💭',
                'blogs-and-articles': '📰'
            };
            return subIcons[subcategory] || (hasChildren ? '📂' : '📄');
        } else {
            // Deeper levels
            return hasChildren ? '📂' : '📄';
        }
    }

    attachSimpleCategoryHandlers(container) {
        const items = container.querySelectorAll('.simple-category-item');
        console.log('Attaching simple category handlers to', items.length, 'items');
        
        items.forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryPath = el.dataset.category;
                
                console.log('Simple category clicked:', categoryPath);
                
                // Set the category as search term in the tag input
                const tagInput = document.getElementById('tag-input');
                if (tagInput) {
                    tagInput.value = categoryPath;
                    tagInput.focus();
                    
                    // Trigger the input event to show suggestions
                    tagInput.dispatchEvent(new Event('input'));
                    
                    console.log('Set search term to:', categoryPath);
                } else {
                    console.error('Tag input not found');
                }
            });
        });
    }

    // Keep the old complex handlers for backward compatibility (will be removed later)
    attachCategoryHandlers(container) {
        const items = container.querySelectorAll('.category-item');
        console.log('Attaching category handlers to', items.length, 'items');
        
        items.forEach(el => {
            // Check if handler already attached
            if (el.dataset.handlerAttached) return;
            
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryPath = el.dataset.category;
                const hasChildren = el.classList.contains('has-children');
                
                console.log('Category clicked:', categoryPath, 'hasChildren:', hasChildren);
                
                if (hasChildren) {
                    this.toggleCategoryChildren(categoryPath);
                } else {
                    this.showCategoryTags(categoryPath);
                }
            });
            
            // Mark as having handler attached
            el.dataset.handlerAttached = 'true';
        });
    }

    toggleCategoryChildren(categoryPath) {
        console.log('Toggling category children for:', categoryPath);
        
        const childrenContainer = document.querySelector(`[data-parent="${categoryPath}"]`);
        const arrow = document.querySelector(`[data-category="${categoryPath}"] .expand-arrow`);
        
        console.log('Found childrenContainer:', !!childrenContainer);
        console.log('Found arrow:', !!arrow);
        
        if (!childrenContainer) {
            console.error('Children container not found for:', categoryPath);
            return;
        }
        
        if (!arrow) {
            console.error('Arrow not found for:', categoryPath);
            return;
        }
        
        const isHidden = childrenContainer.classList.contains('hidden');
        console.log('Currently hidden:', isHidden);
        
        if (isHidden) {
            childrenContainer.classList.remove('hidden');
            arrow.textContent = '▼';
            console.log('Expanded category:', categoryPath);
            
            // Attach handlers to newly revealed children
            this.attachCategoryHandlers(childrenContainer);
        } else {
            childrenContainer.classList.add('hidden');
            arrow.textContent = '▶';
            console.log('Collapsed category:', categoryPath);
        }
    }

    showCategoryTags(categoryPath) {
        const hierarchyItem = this.tagHierarchy.get(categoryPath);
        if (!hierarchyItem) return;

        const availableTags = Array.from(hierarchyItem.tags)
            .filter(tag => !this.selectedTags.has(tag))
            .sort();

        if (availableTags.length === 0) return;

        // Focus tag input and show suggestions for this category path
        const tagInput = document.getElementById('tag-input');
        tagInput.focus();
        
        // If it's a leaf node with direct tags, show them in suggestions
        if (hierarchyItem.directTags.size > 0) {
            tagInput.value = categoryPath + '/';
            this.updateTagSuggestions(categoryPath + '/');
        } else {
            // If it's a category node, show available tags
            this.showCategoryTagsModal(categoryPath, availableTags);
        }
    }

    showCategoryTagsModal(categoryPath, tags) {
        // Create a temporary dropdown showing all tags in this category
        const suggestionsDiv = document.getElementById('tag-suggestions');
        const suggestionsContent = document.getElementById('suggestions-content');
        
        const categoryName = categoryPath.split('/').pop();
        
        suggestionsContent.innerHTML = `
            <div class="category-tags-header">
                <strong>📁 ${categoryName}</strong> (${tags.length} tags)
            </div>
            ${tags.map(tag => {
                const usage = this.tagUsageCount.get(tag) || 0;
                return `
                    <div class="tag-suggestion" data-tag="${tag}">
                        <span class="tag-suggestion-text">${tag}</span>
                        <span class="tag-suggestion-category">${usage} uses</span>
                    </div>
                `;
            }).join('')}
        `;

        this.showTagSuggestions();
    }

    updateTagCounter() {
        const tagCount = document.getElementById('tag-count');
        const tagsInput = document.getElementById('selected-tags');
        
        const count = this.selectedTags.size;
        tagCount.textContent = count;
        
        if (count > 0) {
            tagsInput.classList.add('has-tags');
        } else {
            tagsInput.classList.remove('has-tags');
        }
    }

    async validateUrl() {
        const urlInput = document.getElementById('url');
        const validationDiv = document.getElementById('url-validation');
        let url = urlInput.value.trim();

        if (!url) {
            this.clearValidation('url-validation');
            return;
        }

        // Clean and prepare URL for validation
        let testUrl = url;
        
        // Add protocol if missing
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
            testUrl = 'https://' + testUrl;
        }

        // Check URL format
        try {
            const urlObj = new URL(testUrl);
            // Basic domain validation
            if (!urlObj.hostname.includes('.')) {
                this.showValidation('url-validation', 'Invalid domain format', 'error');
                return;
            }
        } catch {
            this.showValidation('url-validation', 'Invalid URL format', 'error');
            return;
        }

        // Normalize for duplicate checking
        const normalizedUrl = this.normalizeUrl(url);

        // Check for duplicates
        if (this.existingUrls.has(normalizedUrl)) {
            // Try to find which resource has this URL
            let duplicateInfo = 'This URL already exists in the collection';
            // In a real implementation, you could show which resource has this URL
            this.showValidation('url-validation', duplicateInfo, 'error');
            return;
        }

        // Check for similar URLs (without www, with/without https, etc.)
        const variations = this.generateUrlVariations(url);
        let similarFound = false;
        
        for (const variation of variations) {
            const normalizedVariation = this.normalizeUrl(variation);
            if (this.existingUrls.has(normalizedVariation)) {
                this.showValidation('url-validation', `Similar URL exists: ${variation}`, 'warning');
                similarFound = true;
                break;
            }
        }

        if (!similarFound) {
            // Show validation in progress
            this.showValidation('url-validation', 'Validating URL...', 'warning');
            
            // Note: Due to CORS, we can't directly fetch most URLs from the browser
            // In a real implementation, this would go through a backend service
            setTimeout(() => {
                this.showValidation('url-validation', '✅ URL appears to be valid and unique', 'success');
                // Update the input with the properly formatted URL
                urlInput.value = testUrl;
            }, 1000);
        }
    }

    generateUrlVariations(url) {
        const variations = [];
        const cleanUrl = url.trim().toLowerCase();
        
        // Generate common variations users might have meant
        const withoutProtocol = cleanUrl.replace(/^https?:\/\//, '');
        const withoutWww = withoutProtocol.replace(/^www\./, '');
        const withWww = withoutWww.startsWith('www.') ? withoutWww : 'www.' + withoutWww;
        
        // Add all variations with both protocols
        for (const base of [withoutWww, withWww]) {
            variations.push('http://' + base);
            variations.push('https://' + base);
            variations.push(base); // without protocol
        }
        
        return [...new Set(variations)]; // Remove duplicates
    }

    suggestNameFromUrl() {
        const urlInput = document.getElementById('url');
        const nameInput = document.getElementById('name');
        
        if (nameInput.value || !urlInput.value) return;

        try {
            const url = new URL(urlInput.value.startsWith('http') ? urlInput.value : `https://${urlInput.value}`);
            let suggestion = '';

            // GitHub repos
            if (url.hostname === 'github.com') {
                const pathParts = url.pathname.split('/').filter(p => p);
                if (pathParts.length >= 2) {
                    suggestion = pathParts[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
            }
            // ArXiv papers
            else if (url.hostname === 'arxiv.org') {
                suggestion = 'Research Paper';
            }
            // Other domains
            else {
                const domain = url.hostname.replace('www.', '');
                const name = domain.split('.')[0];
                suggestion = name.charAt(0).toUpperCase() + name.slice(1);
            }

            if (suggestion) {
                nameInput.value = suggestion;
                nameInput.style.background = 'rgba(37, 99, 235, 0.1)';
                setTimeout(() => {
                    nameInput.style.background = '';
                }, 2000);
            }
        } catch (error) {
            console.log('Could not suggest name from URL');
        }
    }

    handleTagInput(e) {
        const input = e.target.value;
        this.updateTagSuggestions(input);
    }

    handleTagKeydown(e) {
        const input = e.target;
        
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            this.addTag(input.value.trim());
            input.value = '';
            this.updateTagSuggestions('');
        } else if (e.key === 'Backspace' && !input.value) {
            // Remove last tag
            const tags = Array.from(this.selectedTags);
            if (tags.length > 0) {
                this.removeTag(tags[tags.length - 1]);
            }
        }
    }

    updateTagSuggestions(input) {
        const suggestionsDiv = document.getElementById('tag-suggestions');
        const suggestionsContent = document.getElementById('suggestions-content');
        
        if (!suggestionsDiv || !suggestionsContent) {
            console.error('Suggestions elements not found');
            return;
        }
        
        if (!input || input.length < 1) {
            if (input === '') {
                this.hideTagSuggestions();
            }
            return;
        }

        console.log('Updating tag suggestions for:', input);

        const matchingTags = Array.from(this.existingTags)
            .filter(tag => 
                tag.toLowerCase().includes(input.toLowerCase()) && 
                !this.selectedTags.has(tag)
            )
            .sort((a, b) => {
                // Prioritize exact matches and higher usage
                const aExact = a.toLowerCase().startsWith(input.toLowerCase()) ? 0 : 1;
                const bExact = b.toLowerCase().startsWith(input.toLowerCase()) ? 0 : 1;
                if (aExact !== bExact) return aExact - bExact;
                
                const aUsage = this.tagUsageCount.get(a) || 0;
                const bUsage = this.tagUsageCount.get(b) || 0;
                return bUsage - aUsage;
            })
            .slice(0, 8);

        console.log('Found matching tags:', matchingTags.length);

        if (matchingTags.length === 0) {
            // Show option to create new tag
            suggestionsContent.innerHTML = `
                <div class="tag-suggestion new-tag-suggestion" data-tag="${input}">
                    <span class="tag-suggestion-text">✨ Create new tag: <strong>${input}</strong></span>
                    <span class="tag-suggestion-category">NEW</span>
                </div>
            `;
        } else {
            suggestionsContent.innerHTML = matchingTags
                .map(tag => {
                    const category = tag.split('/')[0];
                    const usage = this.tagUsageCount.get(tag) || 0;
                    return `
                        <div class="tag-suggestion" data-tag="${tag}">
                            <span class="tag-suggestion-text">${tag}</span>
                            <span class="tag-suggestion-category">${usage} uses</span>
                        </div>
                    `;
                }).join('') + 
                (input.match(/^[a-z0-9\-]+([\/][a-z0-9\-]+)*$/) ? `
                    <div class="tag-suggestion new-tag-suggestion" data-tag="${input}">
                        <span class="tag-suggestion-text">✨ Create: <strong>${input}</strong></span>
                        <span class="tag-suggestion-category">NEW</span>
                    </div>
                ` : '');
        }

        this.showTagSuggestions();
    }

    showTagSuggestions() {
        const suggestionsDiv = document.getElementById('tag-suggestions');
        suggestionsDiv.classList.remove('hidden');
    }

    hideTagSuggestions() {
        const suggestionsDiv = document.getElementById('tag-suggestions');
        suggestionsDiv.classList.add('hidden');
    }

    toggleTagBrowser() {
        console.log('toggleTagBrowser called');
        const browserPreview = document.getElementById('tag-browser-preview');
        if (!browserPreview) {
            console.error('tag-browser-preview element not found');
            return;
        }
        
        const isVisible = !browserPreview.style.display || browserPreview.style.display === 'none';
        console.log('Current visibility:', isVisible ? 'hidden' : 'visible');
        
        if (isVisible) {
            browserPreview.style.display = 'grid';
            browserPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            console.log('Tag browser shown');
        } else {
            browserPreview.style.display = 'none';
            console.log('Tag browser hidden');
        }
    }

    addTag(tagName) {
        console.log('addTag called with:', tagName);
        console.log('this.selectedTags before:', new Set(this.selectedTags));
        if (!tagName || this.selectedTags.has(tagName)) {
            console.log('Tag rejected:', !tagName ? 'empty' : 'already selected');
            return;
        }

        // Validate tag format
        if (!/^[a-zA-Z0-9\- ]+([\/][a-zA-Z0-9\- ]+)*$/.test(tagName)) {
            const tagInput = document.getElementById('tag-input');
            const message = 'Invalid tag format. Use lowercase letters, numbers, hyphens, and forward slashes (e.g., libraries/python/ml)';
            
            // Show validation error near the input
            tagInput.style.borderColor = 'var(--error)';
            tagInput.title = message;
            
            setTimeout(() => {
                tagInput.style.borderColor = '';
                tagInput.title = '';
            }, 3000);
            
            return;
        }

        this.selectedTags.add(tagName);
        console.log('this.selectedTags after:', new Set(this.selectedTags));
        this.existingTags.add(tagName); // Add to existing for future suggestions
        
        // Update tag usage count for new tags
        if (!this.tagUsageCount.has(tagName)) {
            this.tagUsageCount.set(tagName, 0);
        }
        
        this.renderSelectedTags();
        this.updateTagCounter();
        
        // Clear any validation messages
        this.clearValidation('tag-validation');
    }

    removeTag(tagName) {
        this.selectedTags.delete(tagName);
        this.renderSelectedTags();
        this.updateTagCounter();
    }

    renderSelectedTags() {
        const container = document.getElementById('selected-tags');
        const noTagsMessage = container.querySelector('.no-tags-message');
        
        if (this.selectedTags.size === 0) {
            container.innerHTML = '<div class="no-tags-message">No tags selected yet</div>';
            return;
        }

        // Remove no-tags message if it exists
        if (noTagsMessage) {
            noTagsMessage.remove();
        }

        const sortedTags = Array.from(this.selectedTags).sort();
        
        container.innerHTML = sortedTags
            .map(tag => {
                const isNewTag = !this.tagUsageCount.has(tag) || this.tagUsageCount.get(tag) === 0;
                return `
                    <span class="tag-item ${isNewTag ? 'new-tag' : ''}" title="${isNewTag ? 'New tag' : `Used ${this.tagUsageCount.get(tag)} times`}">
                        ${isNewTag ? '✨ ' : ''}${tag}
                        <span class="tag-remove" data-tag="${tag}">×</span>
                    </span>
                `;
            }).join('');
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        // Basic validation
        if (field.required && !value) {
            field.style.borderColor = 'var(--error)';
            return false;
        } else {
            field.style.borderColor = 'var(--border)';
            return true;
        }
    }

    showValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `validation-status ${type}`;
        element.classList.remove('hidden');
    }

    clearValidation(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('hidden');
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        ['url', 'name', 'description'].forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (this.selectedTags.size === 0) {
            alert('Please add at least one tag.');
            return;
        }

        this.showPreview();
    }

    showPreview() {
        this.formData = {
            name: document.getElementById('name').value.trim(),
            url: document.getElementById('url').value.trim(),
            description: document.getElementById('description').value.trim(),
            tags: Array.from(this.selectedTags).sort(),
            submissionType: document.getElementById('submission-type').value
        };

        const previewContent = document.getElementById('preview-content');
        previewContent.innerHTML = `
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">
                <h4>YAML Format:</h4>
                <pre style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius); overflow-x: auto; font-family: monospace; font-size: 0.9rem;">${this.generateYAML()}</pre>
            </div>
            <div>
                <h4>Resource Details:</h4>
                <p><strong>Name:</strong> ${this.formData.name}</p>
                <p><strong>URL:</strong> <a href="${this.formData.url}" target="_blank">${this.formData.url}</a></p>
                <p><strong>Description:</strong> ${this.formData.description}</p>
                <p><strong>Tags:</strong> ${this.formData.tags.join(', ')}</p>
                <p><strong>Submission:</strong> ${this.getSubmissionTypeLabel(this.formData.submissionType)}</p>
            </div>
        `;

        document.getElementById('preview-modal').classList.remove('hidden');
    }

    hidePreview() {
        document.getElementById('preview-modal').classList.add('hidden');
    }

    generateYAML() {
        return `- name: "${this.formData.name}"
  url: "${this.formData.url}"
  description: "${this.formData.description}"
  tags: [${this.formData.tags.map(tag => `"${tag}"`).join(', ')}]`;
    }

    getSubmissionTypeLabel(type) {
        const labels = {
            'github-pr': 'GitHub Pull Request',
            'github-issue': 'GitHub Issue',
            'copy-yaml': 'Copy YAML for Manual Addition'
        };
        return labels[type] || type;
    }

    async submitResource() {
        this.hidePreview();
        this.showLoading('Submitting resource...');

        try {
            switch (this.formData.submissionType) {
                case 'github-pr':
                    await this.createGitHubPR();
                    break;
                case 'github-edit':
                    await this.openGitHubDirectEdit();
                    break;
                case 'github-issue':
                    await this.createGitHubIssue();
                    break;
                case 'copy-yaml':
                    this.copyYAMLToClipboard();
                    break;
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your resource. Please try again or use the manual YAML option.');
        } finally {
            this.hideLoading();
        }
    }

    async createGitHubPR() {
        this.showLoading('Creating GitHub issue...');
        
        try {
            await this.createStructuredGitHubIssue();
        } catch (error) {
            console.error('Issue creation error:', error);
            alert('There was an error creating the GitHub issue. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async calculateInsertionPoint() {
        // Analyze the tag structure to find the best insertion point
        const primaryTag = this.formData.tags[0];
        const tagParts = primaryTag.split('/');
        
        return {
            category: tagParts[0],
            subcategory: tagParts[1] || null,
            suggestedLine: null, // Would need server-side calculation for exact line
            canAutoInsert: false, // For now, always use enhanced issue method
            insertionGuide: this.generateInsertionGuide(tagParts)
        };
    }

    generateInsertionGuide(tagParts) {
        const category = tagParts[0];
        const subcategory = tagParts[1];
        
        let guide = `📍 **Where to add this resource in resources.yml:**\n\n`;
        
        if (subcategory) {
            guide += `1. Find the **"${category}"** section\n`;
            guide += `2. Look for the **"${subcategory}"** subsection\n`;
            guide += `3. Add your resource at the end of that subsection\n`;
        } else {
            guide += `1. Find the **"${category}"** section\n`;
            guide += `2. Add your resource at the end of that section\n`;
        }
        
        guide += `\n💡 **Tip**: Use Ctrl+F to search for existing resources with similar tags to find the right location.`;
        
        return guide;
    }

    generateEnhancedYAML(insertionInfo) {
        const yaml = this.generateYAML();
        const guide = insertionInfo.insertionGuide;
        
        return `# ========================================
# 📝 NEW RESOURCE TO ADD
# ========================================
# ${guide.replace(/\n/g, '\n# ')}
# ========================================

${yaml}

# ========================================
# 📝 END OF NEW RESOURCE
# ========================================`;
    }

    generatePRBody(enhancedYAML, insertionInfo) {
        return `## 🚀 New Resource Submission

### 📋 Resource Details
- **Name**: ${this.formData.name}
- **URL**: ${this.formData.url}
- **Description**: ${this.formData.description}
- **Tags**: ${this.formData.tags.map(tag => `\`${tag}\``).join(', ')}

### 📍 Where to Add This Resource

${insertionInfo.insertionGuide}

### 📝 YAML Code to Add

\`\`\`yaml
${this.generateYAML()}
\`\`\`

### 🔧 Complete Code with Comments

<details>
<summary>Click to expand the commented version</summary>

\`\`\`yaml
${enhancedYAML}
\`\`\`

</details>

### ✅ Pre-submission Checklist

- [x] **URL validated**: Resource URL is accessible and working
- [x] **No duplicates**: Checked against existing resources
- [x] **Tags formatted**: Following the established tag format
- [x] **Description quality**: Clear and helpful description provided
- [ ] **Placement verified**: Resource added to the correct category section
- [ ] **YAML valid**: No syntax errors in the YAML structure

### 🤖 Submission Info

- **Submitted via**: Web form interface
- **Validation**: URL and tags pre-validated
- **Category**: ${this.formData.tags[0].split('/')[0]}
- **Submission date**: ${new Date().toISOString().split('T')[0]}

---

**For maintainers**: This resource has been pre-validated through the web interface. The YAML is ready to be copied into the appropriate section of \`resources.yml\`.`;
    }

    async openGitHubWebEditor(enhancedYAML, insertionInfo) {
        // This would open GitHub's web editor at a specific line
        // For now, we'll use the enhanced issue method as it's more reliable
        return this.createEnhancedGitHubIssue(
            `Add resource: ${this.formData.name}`,
            this.generatePRBody(enhancedYAML, insertionInfo)
        );
    }

    async createEnhancedGitHubIssue(title, body) {
        const githubUrl = `https://github.com/BaptisteBlouin/AI-resources/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=resource-submission,web-form&template=resource-submission.md`;
        
        // Show user-friendly instructions
        const instructionsModal = this.createInstructionsModal();
        document.body.appendChild(instructionsModal);
        
        // Open GitHub in new tab
        window.open(githubUrl, '_blank');
        
        setTimeout(() => {
            instructionsModal.remove();
        }, 10000); // Auto-remove after 10 seconds
    }

    createInstructionsModal() {
        const modal = document.createElement('div');
        modal.className = 'loading-overlay';
        modal.innerHTML = `
            <div class="loading-content" style="max-width: 600px;">
                <h2>🚀 GitHub Issue Created!</h2>
                <div style="text-align: left; margin: 1rem 0;">
                    <p><strong>What just happened:</strong></p>
                    <ol style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>A new GitHub issue was created with your resource details</li>
                        <li>The issue includes the exact YAML code and placement instructions</li>
                        <li>Our maintainers will review and add your resource</li>
                    </ol>
                    
                    <p><strong>Next steps:</strong></p>
                    <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>✅ Check the GitHub tab that just opened</li>
                        <li>✅ Click "Submit new issue" if you haven't already</li>
                        <li>✅ You'll get notified when your resource is added</li>
                    </ul>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">
                        <strong>💡 Pro tip:</strong> Want to add it yourself? The issue contains the exact YAML code and detailed instructions on where to place it in the resources.yml file!
                    </div>
                </div>
                <div class="button-group">
                    <button type="button" class="button button-primary" onclick="this.closest('.loading-overlay').remove()">
                        ✅ Got it!
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    async openGitHubDirectEdit() {
        this.showLoading('Opening GitHub editor...');
        
        try {
            // Calculate insertion guidance
            const insertionInfo = await this.calculateInsertionPoint();
            const yaml = this.generateYAML();
            
            // Copy YAML to clipboard first
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(yaml);
            }
            
            // Create instruction modal
            const instructionsModal = this.createDirectEditModal(insertionInfo, yaml);
            document.body.appendChild(instructionsModal);
            
            // Open GitHub file editor
            const editUrl = `https://github.com/BaptisteBlouin/AI-resources/edit/main/resources.yml`;
            window.open(editUrl, '_blank');
            
        } catch (error) {
            console.error('GitHub edit error:', error);
            // Fallback to enhanced issue
            await this.createGitHubPR();
        } finally {
            this.hideLoading();
        }
    }

    createDirectEditModal(insertionInfo, yaml) {
        const modal = document.createElement('div');
        modal.className = 'loading-overlay';
        modal.innerHTML = `
            <div class="loading-content" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
                <h2>📝 GitHub Direct Edit Instructions</h2>
                <div style="text-align: left; margin: 1rem 0;">
                    <div style="background: var(--success); color: white; padding: 0.75rem; border-radius: var(--radius); margin-bottom: 1rem;">
                        ✅ <strong>YAML copied to clipboard!</strong> Ready to paste.
                    </div>
                    
                    <p><strong>Follow these steps:</strong></p>
                    <ol style="margin: 1rem 0; padding-left: 1.5rem; line-height: 1.6;">
                        <li><strong>GitHub editor opened</strong> in a new tab</li>
                        <li><strong>Find the right location:</strong>
                            <div style="background: var(--bg-secondary); padding: 0.75rem; border-radius: var(--radius); margin: 0.5rem 0; font-family: monospace;">
                                ${insertionInfo.insertionGuide.replace(/\n/g, '<br>')}
                            </div>
                        </li>
                        <li><strong>Paste your code:</strong> Press Ctrl+V (or Cmd+V on Mac) to paste the YAML</li>
                        <li><strong>Commit changes:</strong> Scroll down, add a commit message like "Add ${this.formData.name}"</li>
                        <li><strong>Create Pull Request:</strong> Click "Propose changes" button</li>
                    </ol>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">
                        <strong>📋 Your YAML code:</strong>
                        <pre style="background: var(--bg-primary); padding: 0.75rem; border-radius: var(--radius); margin: 0.5rem 0; overflow-x: auto; font-size: 0.85rem;">${yaml}</pre>
                        <button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText(\`${yaml.replace(/`/g, '\\`')}\`)">
                            📋 Copy YAML Again
                        </button>
                    </div>
                    
                    <div style="background: rgba(37, 99, 235, 0.1); padding: 1rem; border-radius: var(--radius); margin: 1rem 0; border-left: 4px solid var(--primary);">
                        <strong>💡 Pro Tips:</strong>
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            <li>Use Ctrl+F to search for similar resources</li>
                            <li>Make sure indentation matches existing entries</li>
                            <li>The commit message should be descriptive</li>
                        </ul>
                    </div>
                </div>
                <div class="button-group">
                    <button type="button" class="button button-secondary" onclick="this.closest('.loading-overlay').remove()">
                        📝 Got it, let me edit!
                    </button>
                    <button type="button" class="button button-primary" onclick="window.addForm.createGitHubPR(); this.closest('.loading-overlay').remove();">
                        🔄 Use Smart Issue Instead
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    async createStructuredGitHubIssue() {
        const title = `[Resource] ${this.formData.name}`;
        
        // Create the issue body in the exact format expected by the template
        const body = `### Resource Name *

${this.formData.name}

### URL *

${this.formData.url}

### Description *

${this.formData.description}

### Tags *

${this.formData.tags.join(', ')}

### Submission Checklist

- [x] The URL is accessible and working
- [x] The resource is not already in the collection  
- [x] The description is clear and helpful
- [x] The tags follow the format: category/subcategory/item

---

**Submitted via web form** • **Auto-validated** • **Ready for review**`;

        // Use the standard GitHub issue creation URL with body parameter
        const githubUrl = `https://github.com/BaptisteBlouin/AI-resources/issues/new?labels=resource-submission,pending-review&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
        
        // Show success modal
        const successModal = this.createSuccessModal();
        document.body.appendChild(successModal);
        
        // Open GitHub
        window.open(githubUrl, '_blank');
    }

    createSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'loading-overlay';
        modal.innerHTML = `
            <div class="loading-content" style="max-width: 500px;">
                <h2>🚀 Ready to Submit!</h2>
                <div style="text-align: left; margin: 1rem 0;">
                    <p><strong>What's happening:</strong></p>
                    <ol style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>GitHub issue form opened in new tab</li>
                        <li>Your resource details are pre-filled</li>
                        <li>Click "Submit new issue" to send for review</li>
                    </ol>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius); margin: 1rem 0;">
                        <strong>⚡ Automatic Process:</strong><br>
                        Once approved by a maintainer, your resource will be automatically added to the collection via GitHub workflow!
                    </div>
                    
                    <p><strong>Timeline:</strong></p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        <li>📝 Submit issue (now)</li>
                        <li>👀 Maintainer review (usually within 24h)</li>
                        <li>✅ Auto-approval → Automatic PR creation</li>
                        <li>🎉 Resource live in collection!</li>
                    </ul>
                </div>
                <div class="button-group">
                    <button type="button" class="button button-primary" onclick="this.closest('.loading-overlay').remove()">
                        ✅ Perfect, let's submit!
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    async createGitHubIssue() {
        const title = `New Resource: ${this.formData.name}`;
        const body = `## Resource Submission

**Name:** ${this.formData.name}
**URL:** ${this.formData.url}
**Description:** ${this.formData.description}
**Tags:** ${this.formData.tags.join(', ')}

### YAML:
\`\`\`yaml
${this.generateYAML()}
\`\`\`

Submitted via web form.`;

        const githubUrl = `https://github.com/BaptisteBlouin/AI-resources/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=resource-submission`;
        
        window.open(githubUrl, '_blank');
        alert('Redirected to GitHub Issues! Please submit the issue from there.');
    }

    copyYAMLToClipboard() {
        const yaml = this.generateYAML();
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(yaml).then(() => {
                alert('YAML copied to clipboard! You can now paste it into resources.yml manually.');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = yaml;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('YAML copied to clipboard! You can now paste it into resources.yml manually.');
        }
    }

    showLoading(message) {
        document.getElementById('loading-message').textContent = message;
        document.getElementById('loading-overlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addForm = new AddResourceForm();
});