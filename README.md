<div align="center">

# 🤖 AI Resources Hub

### A curated collection of cutting-edge AI tools, libraries, papers, and learning resources

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/BaptisteBlouin/AI-Tools)
[![Community Driven](https://img.shields.io/badge/Community-Driven-blue.svg)](CONTRIBUTING.md)
[![Auto Updated](https://img.shields.io/badge/Auto-Updated-green.svg)](scripts/generate_readme.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Empowering developers, researchers, and AI enthusiasts with the best resources in artificial intelligence*

---

</div>

## ✨ What Makes This Special?

<table>
<tr>
<td width="33%" align="center">
<img src="https://img.icons8.com/clouds/100/000000/artificial-intelligence.png" alt="AI Icon"/>
<h3>🎯 Curated Quality</h3>
<p>Every resource is carefully vetted by the community to ensure high quality and relevance</p>
</td>
<td width="33%" align="center">
<img src="https://img.icons8.com/clouds/100/000000/search.png" alt="Search Icon"/>
<h3>🔍 Smart Discovery</h3>
<p>Advanced search and filtering capabilities to find exactly what you need</p>
</td>
<td width="33%" align="center">
<img src="https://img.icons8.com/clouds/100/000000/update.png" alt="Update Icon"/>
<h3>⚡ Always Fresh</h3>
<p>Automatically updated content with the latest tools and research</p>
</td>
</tr>
</table>

## 🚀 Key Features

- 📊 **Interactive Interface**: Modern, searchable UI with real-time filtering
- 🏷️ **Smart Categorization**: Hierarchical organization for easy navigation  
- 🔗 **Rich Metadata**: GitHub stars, last commit dates, and resource types
- 🌙 **Dark Mode Support**: Automatic theme adaptation based on system preferences
- 📱 **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- ⌨️ **Keyboard Shortcuts**: Quick search with `Ctrl/Cmd + K`
- 🤝 **Community Driven**: Open for contributions from AI enthusiasts worldwide

## 🎯 Who This Is For

| 👨‍💻 **Developers** | 👩‍🔬 **Researchers** | 🎓 **Students** | 🏢 **Organizations** |
|-------------------|---------------------|-----------------|---------------------|
| Find tools and frameworks to build AI applications | Discover latest papers and cutting-edge research | Access tutorials and learning materials | Identify enterprise solutions and best practices |

## 🚀 Quick Start

### 💻 For Developers

```bash
# Clone this repository for offline access
git clone https://github.com/BaptisteBlouin/AI-Tools.git

# Generate an updated README with the latest resources
cd AI-Tools
python scripts/generate_readme.py

# Add new resources easily
echo "  - name: 'Your Amazing AI Tool'
    url: 'https://github.com/you/amazing-tool'
    description: 'Brief description of what it does'
    tags: ['tools/machine-learning']" >> resources.yml
```

### 🔍 Using the Search

- **Basic Search**: Type any keyword in the search box above
- **Quick Access**: Press `Ctrl+K` (or `Cmd+K` on Mac) to focus search
- **Category Filtering**: Search for category names like "papers" or "tutorials"
- **Smart Matching**: Search works across titles, descriptions, and tags

### 📱 Navigation Tips

- 🏷️ **Category Icons**: Each category has a distinct icon for quick visual identification
- 🔗 **External Links**: All resource links open in new tabs
- 📊 **Live Badges**: GitHub repositories show real-time stars and activity
- 📂 **Collapsible Categories**: Click category headers to expand/collapse sections

## 📚 Resources

The following list is automatically generated from `resources.yml`.

<!-- START AUTO -->
<!-- Generated on 2025-07-30 12:15:22 UTC by generate_readme.py -->

<style>
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --radius: 8px;
}

* { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
}

/* Summary badges removed */

/* Search */
#resource-search {
  width: 100%;
  max-width: 600px;
  padding: 1rem 1.5rem;
  margin: 2rem auto;
  display: block;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

#resource-search:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: var(--bg-primary);
}

/* Simplified navigation - no TOC */

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.category {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s ease;
}

.category:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.category-summary {
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--primary-color) 0%, #3b82f6 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  transition: background 0.3s ease;
  user-select: none;
}

.category[open] .category-summary {
  background: linear-gradient(135deg, var(--success-color) 0%, #10b981 100%);
}

.category-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Items List */
.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.resource-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.resource-item:hover {
  background: var(--bg-card);
}

.resource-item:last-child {
  border-bottom: none;
}

.resource-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resource-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.resource-name a {
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.resource-name a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.resource-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.resource-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.resource-badges img {
  height: 20px;
  transition: opacity 0.2s ease;
}

.resource-badges img:hover {
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-summary {
    font-size: 1rem;
    padding: 0.875rem 1rem;
  }
  
  .resource-item {
    padding: 0.875rem 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border-color: #475569;
  }
}
</style>

<input type="text" id="resource-search" placeholder="🔍 Search resources... (Ctrl+K)" />

<div class="categories-grid"><details class="category depth-0" id="community">
  <summary class="category-summary"><span class="category-icon">👥</span><span class="category-title">Community</span> <span class="category-count">(2)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer">Hugging Face Hub</a></h4><p class="resource-description">Models, datasets, and inference API for NLP, CV, and beyond.</p><div class="resource-badges"><img src="https://img.shields.io/badge/Type-Tool-17a2b8?style=flat-square&logo=tools" alt="Tool"/></div></div></li>
  </ul>
<details class="category depth-1" id="forums">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Forums</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://www.reddit.com/r/MachineLearning/" target="_blank" rel="noopener noreferrer">r/MachineLearning</a></h4><p class="resource-description">Active community for ML research and discussions.</p><div class="resource-badges"></div></div></li>
  </ul>
</details>
</details>
<details class="category depth-0" id="datasets">
  <summary class="category-summary"><span class="category-icon">📊</span><span class="category-title">Datasets</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="text">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Text</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://github.com/openai/gpt-2-output-dataset" target="_blank" rel="noopener noreferrer">OpenAI WebText</a></h4><p class="resource-description">Dataset of web pages used to train GPT-2.</p><div class="resource-badges"><a href="https://github.com/openai/gpt-2-output-dataset" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/openai/gpt-2-output-datase?style=flat-square&logo=github&logoColor=white" alt="GitHub Stars"/></a> <a href="https://github.com/openai/gpt-2-output-dataset/commits" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/last-commit/openai/gpt-2-output-datase?style=flat-square&logo=github&logoColor=white" alt="Last Commit"/></a></div></div></li>
  </ul>
</details>
</details>
<details class="category depth-0" id="libraries">
  <summary class="category-summary"><span class="category-icon">📚</span><span class="category-title">Libraries</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="python">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Python</span> <span class="category-count">(1)</span></summary>
<details class="category depth-2" id="llm-frameworks">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Llm Frameworks</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://github.com/langchain-ai/langchain" target="_blank" rel="noopener noreferrer">LangChain</a></h4><p class="resource-description">Framework for building LLM-powered applications.</p><div class="resource-badges"><a href="https://github.com/langchain-ai/langchain" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/langchain-ai/langchain?style=flat-square&logo=github&logoColor=white" alt="GitHub Stars"/></a> <a href="https://github.com/langchain-ai/langchain/commits" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/last-commit/langchain-ai/langchain?style=flat-square&logo=github&logoColor=white" alt="Last Commit"/></a></div></div></li>
  </ul>
</details>
</details>
</details>
<details class="category depth-0" id="papers">
  <summary class="category-summary"><span class="category-icon">📄</span><span class="category-title">Papers</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="transformers">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Transformers</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer">Attention Is All You Need</a></h4><p class="resource-description">Introduced the Transformer architecture, revolutionizing sequence modeling.</p><div class="resource-badges"><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/arXiv-1706.03762-b31b1b?style=flat-square&logo=arxiv&logoColor=white" alt="arXiv Paper"/></a></div></div></li>
  </ul>
</details>
</details>
<details class="category depth-0" id="tools">
  <summary class="category-summary"><span class="category-icon">🛠️</span><span class="category-title">Tools</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="data-management">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Data Management</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://huggingface.co/" target="_blank" rel="noopener noreferrer">Hugging Face Hub</a></h4><p class="resource-description">Models, datasets, and inference API for NLP, CV, and beyond.</p><div class="resource-badges"><img src="https://img.shields.io/badge/Type-Tool-17a2b8?style=flat-square&logo=tools" alt="Tool"/></div></div></li>
  </ul>
</details>
</details>
<details class="category depth-0" id="tutorials">
  <summary class="category-summary"><span class="category-icon">🎓</span><span class="category-title">Tutorials</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="deep-learning">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Deep Learning</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://course.fast.ai/" target="_blank" rel="noopener noreferrer">Fast.ai Practical Deep Learning for Coders</a></h4><p class="resource-description">Hands-on course to build state-of-the-art deep learning models.</p><div class="resource-badges"><img src="https://img.shields.io/badge/Type-Tutorial-28a745?style=flat-square&logo=book" alt="Tutorial"/></div></div></li>
  </ul>
</details>
</details>
<details class="category depth-0" id="web-resources">
  <summary class="category-summary"><span class="category-icon">🌐</span><span class="category-title">Web Resources</span> <span class="category-count">(1)</span></summary>
<details class="category depth-1" id="blogs-and-articles">
  <summary class="category-summary"><span class="category-icon">📁</span><span class="category-title">Blogs And Articles</span> <span class="category-count">(1)</span></summary>
  <ul class="items-list">
    <li class="resource-item"><div class="resource-content"><h4 class="resource-name"><a href="https://distill.pub/" target="_blank" rel="noopener noreferrer">Distill.pub</a></h4><p class="resource-description">Interactive, visual essays on modern ML concepts.</p><div class="resource-badges"></div></div></li>
  </ul>
</details>
</details></div>

<script>
(function() {
  'use strict';
  
  // Enhanced search functionality
  const searchInput = document.getElementById('resource-search');
  const categories = document.querySelectorAll('.category');
  const resourceItems = document.querySelectorAll('.resource-item');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      if (!query) {
        // Show all categories and items
        categories.forEach(cat => {
          cat.style.display = '';
          cat.querySelectorAll('.resource-item').forEach(item => {
            item.style.display = '';
          });
        });
        return;
      }
      
      categories.forEach(category => {
        const categoryText = category.textContent.toLowerCase();
        const items = category.querySelectorAll('.resource-item');
        let hasVisibleItems = false;
        
        items.forEach(item => {
          const itemText = item.textContent.toLowerCase();
          if (itemText.includes(query)) {
            item.style.display = '';
            hasVisibleItems = true;
          } else {
            item.style.display = 'none';
          }
        });
        
        // Show category if it matches or has visible items
        if (categoryText.includes(query) || hasVisibleItems) {
          category.style.display = '';
        } else {
          category.style.display = 'none';
        }
      });
    });
    
    // Add search shortcut (Ctrl/Cmd + K)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
  
  // Smooth scrolling removed - no TOC links
  
  // Add analytics for external links (optional)
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
      // Analytics tracking could go here
      console.log('External link clicked:', this.href);
    });
  });
  
})();
</script>

<!-- END AUTO -->

## 🤝 Contributing

We believe in the power of community! Your contributions help make this resource collection even better for everyone.

### 🎯 How to Contribute

| Method | Description | Difficulty |
|--------|-------------|------------|
| 🔗 **Add Resources** | Submit new tools, papers, or tutorials via `resources.yml` | ⭐ Easy |
| 🐛 **Report Issues** | Found a broken link or outdated info? Let us know! | ⭐ Easy |
| 💡 **Suggest Features** | Have ideas for improvements? We'd love to hear them! | ⭐⭐ Medium |
| 🛠️ **Code Improvements** | Enhance the generation script or add new features | ⭐⭐⭐ Advanced |

### 📋 Quick Start Guide

1. **Fork** this repository
2. **Edit** `resources.yml` to add your resource
3. **Test** your changes by running `python scripts/generate_readme.py`
4. **Submit** a pull request with a clear description

### 📚 Documentation

- 📖 [**Contributing Guide**](CONTRIBUTING.md) - Detailed contribution instructions
- 🤝 [**Code of Conduct**](CODE_OF_CONDUCT.md) - Community guidelines and standards
- 🎯 [**Resource Guidelines**](AGENTS.md) - What makes a good resource submission

---

<div align="center">

### 🌟 Show Your Support

If this resource collection has helped you, consider giving it a ⭐ star!

[![GitHub stars](https://img.shields.io/github/stars/BaptisteBlouin/AI-Tools?style=social)](https://github.com/BaptisteBlouin/AI-Tools/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/BaptisteBlouin/AI-Tools?style=social)](https://github.com/BaptisteBlouin/AI-Tools/network/members)

### 🔄 Automation

This README is automatically generated from [`resources.yml`](resources.yml) using our [smart generation script](scripts/generate_readme.py).

**Last Updated**: `Generated automatically on every commit`

---

<sub>Built with ❤️ by the AI community • [Report Issues](https://github.com/BaptisteBlouin/AI-Tools/issues) • [Join Discussions](https://github.com/BaptisteBlouin/AI-Tools/discussions)</sub>

</div>