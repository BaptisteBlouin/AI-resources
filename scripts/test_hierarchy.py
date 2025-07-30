#!/usr/bin/env python3
"""
Test script to demonstrate the hierarchical tag structure
that powers the enhanced category browser
"""

import json
from pathlib import Path

def analyze_tag_hierarchy():
    """Analyze and display the tag hierarchy structure"""
    
    # Load the resources JSON that the web interface uses
    script_dir = Path(__file__).parent
    docs_dir = script_dir.parent / 'docs'
    resources_file = docs_dir / 'resources.json'
    
    if not resources_file.exists():
        print("❌ resources.json not found. Run generate_readme.py first.")
        return
    
    with open(resources_file, 'r') as f:
        data = json.load(f)
    
    # Build hierarchy like the web interface does
    hierarchy = {}
    all_tags = set()
    
    def extract_tags(obj, prefix=''):
        if isinstance(obj, dict):
            if '_items' in obj and isinstance(obj['_items'], list):
                for item in obj['_items']:
                    if 'tags' in item:
                        for tag in item['tags']:
                            all_tags.add(tag)
            
            for key, value in obj.items():
                if key != '_items':
                    extract_tags(value, prefix)
    
    extract_tags(data)
    
    # Build hierarchy structure
    for tag in all_tags:
        parts = tag.split('/')
        current_level = hierarchy
        path = ''
        
        for i, part in enumerate(parts):
            path = path + '/' + part if path else part
            
            if part not in current_level:
                current_level[part] = {
                    'path': path,
                    'level': i,
                    'tags': set(),
                    'direct_tags': set(),
                    'children': {}
                }
            
            current_level[part]['tags'].add(tag)
            
            if path == tag:  # This is the exact tag
                current_level[part]['direct_tags'].add(tag)
            
            current_level = current_level[part]['children']
    
    print("🌳 Hierarchical Tag Structure")
    print("=" * 60)
    print(f"Total tags analyzed: {len(all_tags)}")
    print()
    
    def print_hierarchy(level_dict, indent=0):
        for category, info in sorted(level_dict.items(), key=lambda x: len(x[1]['tags']), reverse=True):
            icon = get_icon(category, indent)
            spaces = "  " * indent
            direct_count = len(info['direct_tags'])
            total_count = len(info['tags'])
            nested_count = total_count - direct_count
            
            counts = []
            if direct_count > 0:
                counts.append(f"{direct_count} direct")
            if nested_count > 0:
                counts.append(f"{nested_count} nested")
            
            count_str = f"({', '.join(counts)})" if counts else "(0)"
            
            print(f"{spaces}{icon} {category} {count_str}")
            
            # Show some example direct tags
            if direct_count > 0 and indent < 2:
                examples = list(info['direct_tags'])[:3]
                for example in examples:
                    print(f"{spaces}    📌 {example}")
                if len(info['direct_tags']) > 3:
                    print(f"{spaces}    ... and {len(info['direct_tags']) - 3} more")
            
            # Recurse into children
            if info['children'] and indent < 3:
                print_hierarchy(info['children'], indent + 1)
                if indent == 0:
                    print()  # Extra space between top-level categories
    
    def get_icon(category, level):
        if level == 0:
            icons = {
                'libraries': '📚', 'tools': '🛠️', 'papers': '📄',
                'datasets': '📊', 'tutorials': '🎓', 'community': '👥',
                'web-resources': '🌐', 'books': '📖', 'certificates': '🏆'
            }
            return icons.get(category, '📁')
        elif level == 1:
            icons = {
                'python': '🐍', 'deep-learning': '🧠', 'machine-learning': '🤖',
                'nlp': '💬', 'cv': '👁️', 'data': '💾', 'images': '🖼️',
                'text': '📝', 'transformers': '🔄', 'generative': '✨'
            }
            return icons.get(category, '📂')
        else:
            return '📄'
    
    print_hierarchy(hierarchy)
    
    print("💡 How the Hierarchical Browser Works:")
    print("-" * 40)
    print("• Click category names to expand/collapse subcategories")
    print("• Numbers show (direct tags, +nested tags)")
    print("• Leaf nodes with direct tags open tag search")
    print("• Parent nodes show all contained tags in dropdown")
    print("• Visual hierarchy with indentation and icons")

if __name__ == "__main__":
    analyze_tag_hierarchy()