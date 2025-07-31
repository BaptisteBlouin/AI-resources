/**
 * AI Resources Hub - Interactive Web Application
 * Simple, reliable approach for displaying nested resources
 */

class AIResourcesApp {
    constructor() {
        this.resources = {};
        this.searchInput = document.getElementById('search-input');
        this.resourcesGrid = document.getElementById('resources-grid');
        this.loading = document.getElementById('loading');
        this.totalResourcesEl = document.getElementById('total-resources');
        this.totalCategoriesEl = document.getElementById('total-categories');
        this.searchResultsInfo = document.getElementById('search-results-info');
        this.searchResultsCount = document.getElementById('search-results-count');
        this.searchTermEl = document.getElementById('search-term');
        this.clearSearchBtn = document.getElementById('clear-search');
        
        this.init();
    }

    async init() {
        try {
            await this.loadResources();
            this.setupEventListeners();
            this.renderResources();
            this.updateStats();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load resources. Please try refreshing the page.');
        }
    }

    async loadResources() {
        try {
            const response = await fetch('resources.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.resources = await response.json();
        } catch (error) {
            console.error('Error loading resources:', error);
            this.resources = {};
        }
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
                this.searchInput.select();
            }
            
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.handleSearch('');
                this.searchInput.blur();
            }
        });

        // Category toggle functionality - use event delegation
        this.resourcesGrid.addEventListener('click', (e) => {
            const toggle = e.target.closest('.category-toggle');
            if (toggle) {
                e.preventDefault();
                const categoryId = toggle.dataset.category;
                this.toggleCategory(categoryId);
            }
        });

        // Clear search button
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.handleSearch('');
            this.searchInput.focus();
        });
    }

    handleSearch(query) {
        const q = query.toLowerCase().trim();
        const grid = this.resourcesGrid;
        const sections = Array.from(grid.querySelectorAll('.category-section'));
        const items = Array.from(grid.querySelectorAll('.search-item'));
      
        // If no query, just reset to default:
        if (!q) {
          items.forEach(i => i.style.display = '');
          sections.forEach(sec => {
            sec.style.display = '';
            const toggle = sec.querySelector('.category-toggle');
            const id     = toggle?.dataset.category;
            if (!id) return;
            if (sec.classList.contains('depth-0')) this.expandCategory(id);
            else                                   this.collapseCategory(id);
          });
          this.updateCategoryCounts();
          this.hideSearchResults();
          return;
        }
      
        // 1️⃣ Collapse every category-content and reset arrows
        grid.querySelectorAll('.category-content.expanded').forEach(content => {
          content.classList.remove('expanded');
          const section = content.closest('.category-section');
          const arrow   = section?.querySelector('.expand-arrow');
          if (arrow) arrow.textContent = '▶';
        });
      
        // 2️⃣ Hide every category-section
        sections.forEach(sec => sec.style.display = 'none');
      
        // 3️⃣ Show only items that match, and collect their category IDs
        const matchedCats = new Set();
        items.forEach(item => {
          if (item.textContent.toLowerCase().includes(q)) {
            item.style.display = '';
            // walk up and record every ancestor category
            let sec = item.closest('.category-section');
            while (sec) {
              const id = sec.querySelector('.category-toggle')?.dataset.category;
              if (id) matchedCats.add(id);
              sec = sec.parentElement.closest('.category-section');
            }
          } else {
            item.style.display = 'none';
          }
        });
      
        // helper: for "cat-A-B-C" → ["cat-A","cat-A-B","cat-A-B-C"]
        const expandChain = id => {
          const parts = id.replace(/^cat-/, '').split('-');
          return parts.map((_,i) => 'cat-' + parts.slice(0,i+1).join('-'));
        };
      
        // 4️⃣ Un-hide & expand only the branches leading to matches
        matchedCats.forEach(catId => {
          expandChain(catId).forEach(id => {
            const sec = grid.querySelector(`[data-category="${id}"]`)
                            ?.closest('.category-section');
            if (!sec) return;
            sec.style.display = '';
            this.expandCategory(id);
          });
        });
      
        // 5️⃣ Update counts & show summary
        const total = items.filter(i => i.style.display !== 'none').length;
        this.updateCategoryCounts(q, total);
        this.showSearchResults(q, total);
    }
      
      

    toggleCategory(categoryId) {
        const content = document.getElementById(`content-${categoryId}`);
        const toggle = document.querySelector(`[data-category="${categoryId}"]`);
        
        if (!content || !toggle) return;

        const isExpanded = content.classList.contains('expanded');
        const arrow = toggle.querySelector('.expand-arrow');
        
        if (isExpanded) {
            content.classList.remove('expanded');
            if (arrow) arrow.textContent = '▶';
        } else {
            content.classList.add('expanded');
            if (arrow) arrow.textContent = '▼';
        }
    }

    expandCategory(categoryId) {
        const content = document.getElementById(`content-${categoryId}`);
        const toggle = document.querySelector(`[data-category="${categoryId}"]`);
        
        if (!content || !toggle) return;

        content.classList.add('expanded');
        const arrow = toggle.querySelector('.expand-arrow');
        if (arrow) arrow.textContent = '▼';
    }

    collapseCategory(categoryId) {
        const content = document.getElementById(`content-${categoryId}`);
        const toggle = document.querySelector(`[data-category="${categoryId}"]`);
        
        if (!content || !toggle) return;

        content.classList.remove('expanded');
        const arrow = toggle.querySelector('.expand-arrow');
        if (arrow) arrow.textContent = '▶';
    }

    renderResources() {
        if (!this.resources || Object.keys(this.resources).length === 0) {
            this.showError('No resources available.');
            return;
        }

        const html = this.generateHTML(this.resources);
        this.resourcesGrid.innerHTML = html;

        // Expand all main categories by default
        Object.keys(this.resources).forEach(categoryId => {
            this.expandCategory(categoryId);
        });
    }

    generateHTML(data, parentPath = '', depth = 0) {
        if (!data || depth > 4) return '';

        let html = '';
        const categories = Object.keys(data).filter(key => key !== '_items').sort();

        categories.forEach(categoryKey => {
            const category = data[categoryKey];
            const currentPath = parentPath ? `${parentPath}-${categoryKey}` : categoryKey;
            const title = this.formatTitle(categoryKey);
            const icon = this.getCategoryIcon(categoryKey);
            const totalItems = this.countItems(category);
            
            if (totalItems === 0) return;

            const items = category._items || [];
            const hasSubcategories = categories.some(key => key !== '_items' && category[key]);

            // Generate unique ID for this category
            const categoryId = `cat-${currentPath}`;

            html += `
                <div class="category-section depth-${depth}" data-depth="${depth}">
                    <div class="category-header">
                        <button class="category-toggle" data-category="${categoryId}">
                            <span class="category-icon">${icon}</span>
                            <span class="category-title">${title}</span>
                            <span class="category-count">(${totalItems})</span>
                            <span class="expand-arrow">▶</span>
                        </button>
                    </div>
                    <div class="category-content" id="content-${categoryId}">
                        ${items.length > 0 ? this.generateResourceItems(items, categoryId) : ''}
                        ${this.generateHTML(category, currentPath, depth + 1)}
                    </div>
                </div>
            `;
        });

        return html;
    }

    generateResourceItems(items, categoryId) {
        return items.map(item => {
            const name = item.name || item.title || 'Unnamed Resource';
            const url = item.url || '#';
            const description = item.description || item.summary || 'No description available';
            const badges = this.generateBadges(url, item);

            return `
                <div class="resource-item search-item" data-category="${categoryId}">
                    <div class="resource-header">
                        <h4 class="resource-name">
                            <a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>
                        </h4>
                        <div class="resource-badges">${badges}</div>
                    </div>
                    <p class="resource-description">${description}</p>
                </div>
            `;
        }).join('');
    }

    generateBadges(url, item) {
        const badges = [];

        // GitHub badges
        const githubMatch = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
        if (githubMatch) {
            const [, owner, repo] = githubMatch;
            const cleanRepo = repo.replace(/\.git$/, '');
            
            badges.push(
                `<img src="https://img.shields.io/github/stars/${owner}/${cleanRepo}?style=flat-square&logo=github&logoColor=white" alt="GitHub Stars" />`,
                `<img src="https://img.shields.io/github/last-commit/${owner}/${cleanRepo}?style=flat-square&logo=github&logoColor=white" alt="Last Commit" />`
            );
        }

        // ArXiv badges
        const arxivMatch = url.match(/https:\/\/arxiv\.org\/abs\/(.+)/);
        if (arxivMatch) {
            const paperId = arxivMatch[1];
            badges.push(
                `<img src="https://img.shields.io/badge/arXiv-${paperId}-b31b1b?style=flat-square&logo=arxiv&logoColor=white" alt="arXiv Paper" />`
            );
        }

        // Type badges based on tags
        const tags = item.tags || [];
        if (tags.some(tag => tag.toLowerCase().includes('tutorial'))) {
            badges.push(
                `<img src="https://img.shields.io/badge/Type-Tutorial-28a745?style=flat-square&logo=book" alt="Tutorial" />`
            );
        } else if (tags.some(tag => tag.toLowerCase().includes('tool'))) {
            badges.push(
                `<img src="https://img.shields.io/badge/Type-Tool-17a2b8?style=flat-square&logo=tools" alt="Tool" />`
            );
        }

        return badges.join(' ');
    }

    countItems(node) {
        if (!node) return 0;
        
        let total = (node._items || []).length;
        
        Object.keys(node).forEach(key => {
            if (key !== '_items' && typeof node[key] === 'object') {
                total += this.countItems(node[key]);
            }
        });
        
        return total;
    }

    updateStats() {
        const totalResources = this.countItems(this.resources);
        const totalCategories = Object.keys(this.resources).length;
        
        this.totalResourcesEl.textContent = totalResources;
        this.totalCategoriesEl.textContent = totalCategories;
    }

    updateCategoryCounts(searchTerm = '', totalMatches = 0) {
        const allCategories = this.resourcesGrid.querySelectorAll('.category-section');
        
        allCategories.forEach(categorySection => {
            const categoryToggle = categorySection.querySelector('.category-toggle');
            const countElement = categoryToggle?.querySelector('.category-count');
            
            if (!countElement) return;
            
            if (searchTerm) {
                // Count visible items in this category during search
                const visibleItems = categorySection.querySelectorAll('.search-item:not([style*="display: none"])');
                const count = visibleItems.length;
                countElement.textContent = `(${count})`;
                
                // Add search styling to indicate filtered results
                countElement.style.background = count > 0 ? '#059669' : 'rgba(255, 255, 255, 0.2)';
            } else {
                // Reset to original counts
                const categoryId = categoryToggle.dataset.category;
                const originalCount = this.getOriginalCategoryCount(categoryId);
                countElement.textContent = `(${originalCount})`;
                countElement.style.background = '';
            }
        });
    }

    getOriginalCategoryCount(categoryId) {
        // Extract the category path from the ID and calculate original count
        const pathParts = categoryId.replace('cat-', '').split('-');
        let currentData = this.resources;
        
        for (const part of pathParts) {
            if (currentData && currentData[part]) {
                currentData = currentData[part];
            } else {
                return 0;
            }
        }
        
        return this.countItems(currentData);
    }

    showSearchResults(searchTerm, totalMatches) {
        this.searchResultsCount.textContent = totalMatches;
        this.searchTermEl.textContent = searchTerm;
        this.searchResultsInfo.classList.remove('hidden');
    }

    hideSearchResults() {
        this.searchResultsInfo.classList.add('hidden');
    }

    formatTitle(key) {
        return key.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    getCategoryIcon(category) {
        const icons = {
            'tools': '🛠️',
            'libraries': '📚',
            'papers': '📄',
            'datasets': '📊',
            'tutorials': '🎓',
            'community': '👥',
            'web-resources': '🌐',
            'frameworks': '🏗️',
            'models': '🤖',
            'apis': '🔌',
            'data-management': '📋',
            'python': '🐍',
            'llm-frameworks': '🤖',
            'transformers': '🔄',
            'forums': '💬',
            'blogs-and-articles': '📝',
            'deep-learning': '🧠',
            'text': '📄'
        };
        return icons[category.toLowerCase()] || '📁';
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.loading.innerHTML = `
            <div style="color: var(--warning); font-size: 1.1rem;">
                ⚠️ ${message}
            </div>
        `;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIResourcesApp();
});