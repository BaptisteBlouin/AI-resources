#!/usr/bin/env python3
"""
Tag Management Utility
Manage and analyze tags in the AI Resources collection
"""

import yaml
import json
from pathlib import Path
from typing import Dict, List, Set, Counter
from collections import defaultdict, Counter
from url_index import URLIndex


class TagManager:
    """Utility for managing and analyzing tags"""
    
    def __init__(self, resources_file: Path = None):
        self.script_dir = Path(__file__).parent
        self.resources_file = resources_file or self.script_dir.parent / 'resources.yml'
        self.url_index = URLIndex()
        
    def analyze_tags(self) -> Dict:
        """Analyze current tag usage and structure"""
        try:
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading resources: {e}")
            return {}
        
        resources = data.get('resources', [])
        
        # Collect all tags and their usage
        tag_usage = Counter()
        category_usage = Counter()
        tag_combinations = defaultdict(int)
        resources_without_tags = []
        
        for resource in resources:
            tags = resource.get('tags', [])
            name = resource.get('name', resource.get('title', 'Unknown'))
            
            if not tags:
                resources_without_tags.append(name)
                continue
            
            # Count individual tags
            for tag in tags:
                tag_usage[tag] += 1
                # Count categories (first part of tag)
                category = tag.split('/')[0] if '/' in tag else tag
                category_usage[category] += 1
            
            # Count tag combinations
            if len(tags) > 1:
                combo = tuple(sorted(tags))
                tag_combinations[combo] += 1
        
        return {
            'total_resources': len(resources),
            'total_unique_tags': len(tag_usage),
            'resources_without_tags': len(resources_without_tags),
            'tag_usage': dict(tag_usage.most_common()),
            'category_usage': dict(category_usage.most_common()),
            'common_combinations': dict(sorted(tag_combinations.items(), 
                                             key=lambda x: x[1], reverse=True)[:10]),
            'untagged_resources': resources_without_tags
        }
    
    def suggest_tag_improvements(self) -> List[str]:
        """Suggest improvements to the tagging system"""
        analysis = self.analyze_tags()
        suggestions = []
        
        # Find singleton tags (used only once)
        singleton_tags = [tag for tag, count in analysis['tag_usage'].items() if count == 1]
        if singleton_tags:
            suggestions.append(f"Consider consolidating {len(singleton_tags)} tags used only once:")
            for tag in singleton_tags[:10]:  # Show first 10
                suggestions.append(f"  - {tag}")
        
        # Find resources without tags
        if analysis['resources_without_tags'] > 0:
            suggestions.append(f"{analysis['resources_without_tags']} resources have no tags:")
            for resource in analysis['untagged_resources'][:5]:  # Show first 5
                suggestions.append(f"  - {resource}")
        
        # Find inconsistent naming patterns
        categories = analysis['category_usage'].keys()
        naming_issues = []
        for category in categories:
            # Check for similar categories that might be duplicates
            for other_category in categories:
                if (category != other_category and 
                    category.replace('-', '').replace('_', '') == 
                    other_category.replace('-', '').replace('_', '')):
                    naming_issues.append(f"{category} vs {other_category}")
        
        if naming_issues:
            suggestions.append("Potential naming inconsistencies:")
            for issue in naming_issues:
                suggestions.append(f"  - {issue}")
        
        return suggestions
    
    def get_tag_hierarchy(self) -> Dict:
        """Build hierarchical structure of tags"""
        try:
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading resources: {e}")
            return {}
        
        hierarchy = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))
        
        for resource in data.get('resources', []):
            for tag in resource.get('tags', []):
                parts = tag.split('/')
                if len(parts) >= 1:
                    category = parts[0]
                    subcategory = parts[1] if len(parts) >= 2 else None
                    subitem = parts[2] if len(parts) >= 3 else None
                    
                    if subcategory:
                        if subitem:
                            hierarchy[category][subcategory][subitem].add(resource['name'])
                        else:
                            hierarchy[category][subcategory]['_items'].add(resource['name'])
                    else:
                        hierarchy[category]['_items']['_items'].add(resource['name'])
        
        # Convert sets to lists for JSON serialization
        def convert_sets(obj):
            if isinstance(obj, dict):
                return {k: convert_sets(v) for k, v in obj.items()}
            elif isinstance(obj, set):
                return list(obj)
            return obj
        
        return convert_sets(dict(hierarchy))
    
    def validate_tag_format(self) -> List[str]:
        """Validate tag formats and find issues"""
        try:
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            return [f"Error loading resources: {e}"]
        
        issues = []
        valid_pattern = r'^[a-z0-9\-]+(/[a-z0-9\-]+)*$'
        
        for resource in data.get('resources', []):
            name = resource.get('name', resource.get('title', 'Unknown'))
            for tag in resource.get('tags', []):
                # Check format
                import re
                if not re.match(valid_pattern, tag):
                    issues.append(f"Invalid tag format in '{name}': {tag}")
                
                # Check for common issues
                if tag.endswith('/'):
                    issues.append(f"Tag ends with slash in '{name}': {tag}")
                if '//' in tag:
                    issues.append(f"Double slash in tag in '{name}': {tag}")
                if tag.startswith('/'):
                    issues.append(f"Tag starts with slash in '{name}': {tag}")
        
        return issues
    
    def export_tags(self, format_type: str = 'json') -> str:
        """Export tags in various formats"""
        analysis = self.analyze_tags()
        
        if format_type == 'json':
            return json.dumps(analysis, indent=2, ensure_ascii=False)
        elif format_type == 'csv':
            import csv
            import io
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Tag', 'Usage Count', 'Category'])
            
            for tag, count in analysis['tag_usage'].items():
                category = tag.split('/')[0] if '/' in tag else 'misc'
                writer.writerow([tag, count, category])
            
            return output.getvalue()
        else:
            return str(analysis)


def main():
    """CLI for tag management"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage tags in AI Resources collection')
    parser.add_argument('--analyze', action='store_true', help='Analyze current tag usage')
    parser.add_argument('--suggest', action='store_true', help='Suggest tag improvements')
    parser.add_argument('--hierarchy', action='store_true', help='Show tag hierarchy')
    parser.add_argument('--validate', action='store_true', help='Validate tag formats')
    parser.add_argument('--export', choices=['json', 'csv'], help='Export tag data')
    parser.add_argument('--resources-file', type=Path, help='Path to resources.yml file')
    
    args = parser.parse_args()
    
    manager = TagManager(args.resources_file)
    
    if args.analyze:
        analysis = manager.analyze_tags()
        print("📊 TAG ANALYSIS")
        print("=" * 50)
        print(f"Total resources: {analysis['total_resources']}")
        print(f"Unique tags: {analysis['total_unique_tags']}")
        print(f"Resources without tags: {analysis['resources_without_tags']}")
        print(f"\n🏆 Top categories:")
        for category, count in list(analysis['category_usage'].items())[:10]:
            print(f"   {category}: {count}")
        print(f"\n🏷️  Most used tags:")
        for tag, count in list(analysis['tag_usage'].items())[:15]:
            print(f"   {tag}: {count}")
    
    elif args.suggest:
        suggestions = manager.suggest_tag_improvements()
        print("💡 TAG IMPROVEMENT SUGGESTIONS")
        print("=" * 50)
        for suggestion in suggestions:
            print(suggestion)
    
    elif args.hierarchy:
        hierarchy = manager.get_tag_hierarchy()
        print("🌳 TAG HIERARCHY")
        print("=" * 50)
        print(json.dumps(hierarchy, indent=2, ensure_ascii=False))
    
    elif args.validate:
        issues = manager.validate_tag_format()
        print("✅ TAG VALIDATION")
        print("=" * 50)
        if issues:
            print(f"Found {len(issues)} issues:")
            for issue in issues:
                print(f"❌ {issue}")
        else:
            print("✅ All tags are valid!")
    
    elif args.export:
        data = manager.export_tags(args.export)
        print(data)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()