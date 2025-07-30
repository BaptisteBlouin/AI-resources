#!/usr/bin/env python3
"""
AI Resources README Generator

A modern Python script that generates a beautiful, interactive README.md
from the resources.yml file with enhanced features and styling.
"""

import yaml
import re
import os
import sys
import argparse
from typing import Dict, List, Any
from datetime import datetime
from pathlib import Path


def get_category_color(category: str) -> str:
    """Get a color for a category based on its name.
    
    Args:
        category: Category name
        
    Returns:
        Hex color code without #
    """
    colors = {
        'tools': '10b981',
        'libraries': '3b82f6', 
        'papers': 'f59e0b',
        'datasets': '8b5cf6',
        'tutorials': 'ef4444',
        'community': '06b6d4',
        'web-resources': 'f97316'
    }
    return colors.get(category.lower(), '6b7280')


def get_category_icon(category: str) -> str:
    """Get an emoji icon for a category.
    
    Args:
        category: Category name
        
    Returns:
        Emoji icon
    """
    icons = {
        'tools': '🛠️',
        'libraries': '📚',
        'papers': '📄', 
        'datasets': '📊',
        'tutorials': '🎓',
        'community': '👥',
        'web-resources': '🌐',
        'frameworks': '🏗️',
        'models': '🤖',
        'apis': '🔌'
    }
    return icons.get(category.lower(), '📁')


def build_nested_dict(resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Builds a nested dictionary from a list of resources with hierarchical tags.
    
    Args:
        resources: List of resource dictionaries
        
    Returns:
        Nested dictionary organized by tag hierarchy
    """
    nested = {}
    for item in resources:
        tags = item.get("tags", [])
        if not tags:
            print(f"Warning: Resource '{item.get('name', item.get('title', 'Unknown'))}' has no tags")
            continue
            
        for tag in tags:
            parts = [part.strip() for part in tag.split('/') if part.strip()]
            if not parts:
                continue
                
            node = nested
            for part in parts:
                node = node.setdefault(part, {"_items": []})
            node["_items"].append(item)
    return nested


def count_items(node: Dict[str, Any]) -> int:
    """Recursively count items under a node.
    
    Args:
        node: Dictionary node to count items in
        
    Returns:
        Total number of items in this node and all subnodes
    """
    total = len(node.get("_items", []))
    for key, child in node.items():
        if key == "_items" or not isinstance(child, dict):
            continue
        total += count_items(child)
    return total


def gen_summary_badges(nested: Dict[str, Any]) -> str:
    """Disable summary badges - they're redundant with section counts.
    
    Args:
        nested: Nested dictionary of categorized resources
        
    Returns:
        Empty string - no summary badges
    """
    return ''  # Remove summary badges


def gen_toc_html(nested: Dict[str, Any], depth: int = 0) -> str:
    """Generate a simple category list without counts.
    
    Args:
        nested: Nested dictionary of categorized resources
        depth: Current nesting depth for styling
        
    Returns:
        HTML string for simplified navigation
    """
    return ''  # Disable table of contents


def get_badges_html(url: str, item: Dict[str, Any] = None) -> str:
    """Generate GitHub/ArXiv badges with enhanced styling.
    
    Args:
        url: Resource URL
        item: Resource item dictionary for additional context
        
    Returns:
        HTML string with badges
    """
    badges = []
    
    # GitHub repository badges  
    gh = re.match(r"https://github.com/([^/]+)/([^/.]+)", url)
    if gh:
        owner, repo = gh.groups()
        repo = repo.rstrip('.git')
        
        stars_url = f'https://img.shields.io/github/stars/{owner}/{repo}?style=flat-square&logo=github&logoColor=white'
        commit_url = f'https://img.shields.io/github/last-commit/{owner}/{repo}?style=flat-square&logo=github&logoColor=white' 
        
        badges.extend([
            f'<a href="{url}" target="_blank" rel="noopener noreferrer"><img src="{stars_url}" alt="GitHub Stars"/></a>',
            f'<a href="{url}/commits" target="_blank" rel="noopener noreferrer"><img src="{commit_url}" alt="Last Commit"/></a>'
        ])
    
    # ArXiv paper badges
    arxiv = re.match(r"https://arxiv.org/abs/(\S+)", url)
    if arxiv:
        paper_id = arxiv.group(1)
        arxiv_badge = f'https://img.shields.io/badge/arXiv-{paper_id}-b31b1b?style=flat-square&logo=arxiv&logoColor=white'
        badges.append(f'<a href="{url}" target="_blank" rel="noopener noreferrer"><img src="{arxiv_badge}" alt="arXiv Paper"/></a>')
    
    # Add custom badges based on resource type
    if item:
        tags = item.get('tags', [])
        if any('tutorial' in tag.lower() for tag in tags):
            tutorial_badge = 'https://img.shields.io/badge/Type-Tutorial-28a745?style=flat-square&logo=book'
            badges.append(f'<img src="{tutorial_badge}" alt="Tutorial"/>')
        elif any('tool' in tag.lower() for tag in tags):
            tool_badge = 'https://img.shields.io/badge/Type-Tool-17a2b8?style=flat-square&logo=tools'
            badges.append(f'<img src="{tool_badge}" alt="Tool"/>')
    
    return ' '.join(badges)


def gen_resources_markdown(nested: Dict[str, Any], depth: int = 0) -> str:
    """Generate GitHub-compatible markdown for resources.
    
    Args:
        nested: Nested dictionary of categorized resources
        depth: Current nesting depth for styling
        
    Returns:
        Markdown string with categorized resources
    """
    if not nested or depth > 3:
        return ''
        
    markdown = []
    
    for cat, node in sorted(nested.items()):
        if cat == '_items' or not isinstance(node, dict):
            continue
            
        title = cat.replace('-', ' ').title()
        total = count_items(node)
        
        if total == 0:
            continue
            
        # Create category header with icon and count
        icon = get_category_icon(cat)
        header_level = '#' * (depth + 3)  # Start at h3
        
        markdown.append(f'\n{header_level} {icon} {title} ({total})\n')
        
        # Add items if they exist
        if node.get('_items'):
            # Sort items by name/title
            items = sorted(
                node['_items'], 
                key=lambda x: (x.get('name') or x.get('title', '')).lower()
            )
            
            for item in items:
                name = item.get('name') or item.get('title', 'Unnamed Resource')
                url = item.get('url', '')
                desc = item.get('description') or item.get('summary', 'No description available')
                badges = get_badges_html(url, item)
                
                # Create markdown list item
                markdown.append(f'- **[{name}]({url})** - {desc}')
                
                # Add badges if they exist  
                if badges:
                    # Convert HTML badges to proper markdown
                    badge_lines = []
                    processed_badges = set()  # Avoid duplicates
                    
                    # Handle all linked badges (GitHub, ArXiv, etc.)
                    linked_matches = re.findall(r'<a href="([^"]+)" target="_blank" rel="noopener noreferrer"><img src="([^"]+)" alt="([^"]+)"/></a>', badges)
                    for link_url, badge_url, alt_text in linked_matches:
                        if badge_url not in processed_badges:
                            badge_lines.append(f'![{alt_text}]({badge_url})')
                            processed_badges.add(badge_url)
                    
                    # Handle type badges (no link) - but avoid those already processed
                    type_matches = re.findall(r'<img src="([^"]+)" alt="([^"]+)"/>', badges)
                    for badge_url, alt_text in type_matches:
                        if badge_url not in processed_badges:
                            badge_lines.append(f'![{alt_text}]({badge_url})')
                            processed_badges.add(badge_url)
                    
                    if badge_lines:
                        markdown.append(f'  {" ".join(badge_lines)}')
                
        # Recursively add subcategories
        sub_md = gen_resources_markdown(node, depth + 1)
        if sub_md:
            markdown.append(sub_md)
    
    return '\n'.join(markdown)


def gen_resources_html(nested: Dict[str, Any], depth: int = 0) -> str:
    """Generate HTML list of resources with enhanced styled cards.
    
    Args:
        nested: Nested dictionary of categorized resources
        depth: Current nesting depth for styling
        
    Returns:
        HTML string with categorized resources
    """
    if not nested or depth > 3:
        return ''
        
    html = []
    
    for cat, node in sorted(nested.items()):
        if cat == '_items' or not isinstance(node, dict):
            continue
            
        title = cat.replace('-', ' ').title()
        anchor = re.sub(r"[^\w\-]", '', title.lower().replace(' ', '-'))
        total = count_items(node)
        
        if total == 0:
            continue
            
        # Create category header with improved styling
        category_class = f"category depth-{depth}"
        icon = get_category_icon(cat)
        
        html.append(f'<details class="{category_class}" id="{anchor}">')
        html.append(
            f'  <summary class="category-summary">'
            f'<span class="category-icon">{icon}</span>'
            f'<span class="category-title">{title}</span> '
            f'<span class="category-count">({total})</span>'
            f'</summary>'
        )
        
        # Add items if they exist
        if node.get('_items'):
            html.append('  <ul class="items-list">')
            
            # Sort items by name/title
            items = sorted(
                node['_items'], 
                key=lambda x: (x.get('name') or x.get('title', '')).lower()
            )
            
            for item in items:
                name = item.get('name') or item.get('title', 'Unnamed Resource')
                url = item.get('url', '')
                desc = item.get('description') or item.get('summary', 'No description available')
                badges = get_badges_html(url, item)
                
                # Truncate long descriptions
                if len(desc) > 150:
                    desc = desc[:147] + '...'
                
                html.append(
                    f'    <li class="resource-item">'
                    f'<div class="resource-content">'
                    f'<h4 class="resource-name"><a href="{url}" target="_blank" rel="noopener noreferrer">{name}</a></h4>'
                    f'<p class="resource-description">{desc}</p>'
                    f'<div class="resource-badges">{badges}</div>'
                    f'</div>'
                    f'</li>'
                )
                
            html.append('  </ul>')
        
        # Recursively add subcategories
        sub_html = gen_resources_html(node, depth + 1)
        if sub_html:
            html.append(sub_html)
            
        html.append('</details>')
    
    return '\n'.join(html)


def get_modern_styles() -> str:
    """Generate modern CSS styles for the README.
    
    Returns:
        CSS styles as a string
    """
    return '''
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
'''


def get_enhanced_script() -> str:
    """Generate enhanced JavaScript for search and interactions.
    
    Returns:
        JavaScript code as a string
    """
    return '''
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
'''


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments.
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(
        description='Generate a modern, interactive README.md from resources.yml',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--resources-file', '-r',
        type=Path,
        help='Path to resources.yml file (default: ../resources.yml)'
    )
    
    parser.add_argument(
        '--readme-file', '-o',
        type=Path, 
        help='Path to README.md file (default: ../README.md)'
    )
    
    parser.add_argument(
        '--validate-urls', '-v',
        action='store_true',
        help='Validate URLs (slower but more accurate)'
    )
    
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Suppress output messages'
    )
    
    return parser.parse_args()


def validate_yaml_structure(data: Dict[str, Any]) -> bool:
    """Validate the structure of the YAML data.
    
    Args:
        data: Parsed YAML data
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(data, dict):
        print("Error: YAML root must be a dictionary")
        return False
        
    if 'resources' not in data:
        print("Error: YAML must contain 'resources' key")
        return False
        
    resources = data['resources']
    if not isinstance(resources, list):
        print("Error: 'resources' must be a list")
        return False
        
    required_fields = {'name', 'title'}
    for i, resource in enumerate(resources):
        if not isinstance(resource, dict):
            print(f"Error: Resource {i} must be a dictionary")
            return False
            
        if not any(field in resource for field in required_fields):
            print(f"Error: Resource {i} must have either 'name' or 'title'")
            return False
            
        if 'url' not in resource:
            print(f"Warning: Resource {i} missing 'url' field")
            
    return True


def generate_web_resources(nested: Dict[str, Any]) -> str:
    """Generate JSON data for the web application.
    
    Args:
        nested: Nested dictionary of categorized resources
        
    Returns:
        JSON string for web app consumption
    """
    import json
    return json.dumps(nested, indent=2, ensure_ascii=False)


def generate_simple_readme(nested: Dict[str, Any]) -> str:
    """Generate a simple README that redirects to GitHub Pages.
    
    Args:
        nested: Nested dictionary of categorized resources
        
    Returns:
        Simple markdown content for README
    """
    total_resources = sum(count_items(nested[cat]) for cat in nested)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    return f'''<!-- Generated on {timestamp} by generate_readme.py -->

## 🌐 View the Interactive AI Resources Hub

**[👆 Click here to explore all {total_resources} AI resources →](https://baptisteblouin.github.io/AI-Tools/)**

This repository contains a curated collection of **{total_resources} AI resources** across **{len(nested)} categories**, including:

{' • '.join([f"**{cat.replace('-', ' ').title()}** ({count_items(nested[cat])})" for cat in sorted(nested.keys())[:5]])}{"..." if len(nested) > 5 else ""}

### ✨ Features

- 🔍 **Real-time search** across all resources
- 📱 **Responsive design** for all devices  
- 🎨 **Modern interface** with smooth animations
- 📊 **Live GitHub data** (stars, commits, etc.)
- ⌨️ **Keyboard shortcuts** (`Ctrl+K` to search)
- 🌙 **Dark mode** support

### 🚀 Quick Access

- **[🌐 Browse Resources](https://baptisteblouin.github.io/AI-Tools/)** - Interactive web interface
- **[📝 Contribute](CONTRIBUTING.md)** - Add new resources
- **[🐛 Report Issues](https://github.com/BaptisteBlouin/AI-Tools/issues)** - Help us improve
- **[💬 Discussions](https://github.com/BaptisteBlouin/AI-Tools/discussions)** - Join the community

---

<div align="center">

**[⭐ Star this repository](https://github.com/BaptisteBlouin/AI-Tools/stargazers) • [🍴 Fork it](https://github.com/BaptisteBlouin/AI-Tools/fork) • [📖 View on GitHub Pages](https://baptisteblouin.github.io/AI-Tools/)**

*Automatically updated from [`resources.yml`](resources.yml) • Last updated: {datetime.now().strftime('%B %d, %Y')}*

</div>'''


def main() -> None:
    """Main function to generate both README and web assets."""
    args = parse_arguments()
    
    # Determine file paths
    script_dir = Path(__file__).parent
    resources_file = args.resources_file or script_dir.parent / 'resources.yml'
    readme_file = args.readme_file or script_dir.parent / 'README.md'
    docs_dir = script_dir.parent / 'docs'
    
    # Validate file paths
    if not resources_file.exists():
        print(f"Error: Resources file not found: {resources_file}")
        sys.exit(1)
        
    if not readme_file.exists():
        print(f"Error: README file not found: {readme_file}")
        sys.exit(1)
    
    try:
        # Load and validate YAML data
        with open(resources_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            
        if not validate_yaml_structure(data):
            sys.exit(1)
            
        # Build nested structure
        resources = data.get('resources', [])
        nested = build_nested_dict(resources)
        
        if not nested:
            print("Warning: No valid resources found")
            return
        
        # Generate web resources JSON
        web_json = generate_web_resources(nested)
        web_json_file = docs_dir / 'resources.json'
        docs_dir.mkdir(exist_ok=True)
        
        with open(web_json_file, 'w', encoding='utf-8') as f:
            f.write(web_json)
        
        # Generate simple README
        simple_readme_content = generate_simple_readme(nested)
        
        # Read and update README
        with open(readme_file, 'r', encoding='utf-8') as f:
            readme_content = f.read()
            
        if '<!-- START AUTO -->' not in readme_content or '<!-- END AUTO -->' not in readme_content:
            print("Error: README.md must contain <!-- START AUTO --> and <!-- END AUTO --> markers")
            sys.exit(1)
            
        before, rest = readme_content.split('<!-- START AUTO -->', 1)
        _, after = rest.split('<!-- END AUTO -->', 1)
        
        new_content = f"{before}<!-- START AUTO -->\n{simple_readme_content}\n<!-- END AUTO -->{after}"
        
        # Write updated README
        with open(readme_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        if not args.quiet:
            total_resources = sum(count_items(nested[cat]) for cat in nested)
            print(f"✅ README.md successfully updated!")
            print(f"🌐 Web resources JSON generated at {web_json_file}")
            print(f"📊 Generated content for {total_resources} resources across {len(nested)} categories")
            print(f"🎨 Interactive web interface available at GitHub Pages")
            
    except yaml.YAMLError as e:
        print(f"Error parsing YAML file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error generating files: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()