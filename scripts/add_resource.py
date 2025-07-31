#!/usr/bin/env python3
"""
AI Resources Add Tool
Interactive CLI for adding new resources to the collection
"""

import yaml
import sys
import re
import requests
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from urllib.parse import urlparse
from url_index import URLIndex


class ResourceAdder:
    """Interactive tool for adding resources"""
    
    def __init__(self, resources_file: Path = None):
        self.script_dir = Path(__file__).parent
        self.resources_file = resources_file or self.script_dir.parent / 'resources.yml'
        self.url_index = URLIndex()
        self.existing_tags = self._load_existing_tags()
        
    def _load_existing_tags(self) -> Set[str]:
        """Load all existing tags from the URL index and resources file"""
        tags = set()
        
        # Get tags from URL index
        tags.update(self.url_index.get_all_tags())
        
        # Also load from resources file as backup
        try:
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            for resource in data.get('resources', []):
                tags.update(resource.get('tags', []))
                
        except Exception as e:
            print(f"Warning: Could not load existing tags from resources file: {e}")
        
        return tags
    
    def _validate_url(self, url: str) -> Tuple[bool, str]:
        """Validate URL format and accessibility"""
        if not url:
            return False, "URL cannot be empty"
        
        # Clean up the URL
        original_url = url.strip()
        
        # Handle various URL formats users might enter
        url = original_url.lower().strip()
        
        # Remove common prefixes for normalization, but keep original for validation
        test_url = original_url
        if not test_url.startswith(('http://', 'https://')):
            # Try with https first
            test_url = 'https://' + test_url
        
        # Basic URL format validation
        try:
            parsed = urlparse(test_url)
            if not parsed.netloc:
                return False, "Invalid URL format"
            
            # Ensure the netloc looks reasonable
            if '.' not in parsed.netloc:
                return False, "Invalid domain format"
                
        except Exception:
            return False, "Invalid URL format"
        
        # Check if URL is accessible (optional, can be skipped for speed)
        try:
            response = requests.head(test_url, timeout=10, allow_redirects=True)
            if response.status_code >= 400:
                print(f"⚠️  Warning: URL returned status {response.status_code}")
            elif response.url != test_url:
                print(f"⚠️  Note: URL redirects to {response.url}")
        except requests.RequestException:
            print("⚠️  Warning: Could not verify URL accessibility (continuing anyway)")
        
        return True, test_url
    
    def _format_tags_display(self, tags: List[str]) -> str:
        """Format tags for display with colors and organization"""
        if not tags:
            return "No tags"
        
        # Group tags by category
        categories = {}
        for tag in sorted(tags):
            parts = tag.split('/')
            category = parts[0] if parts else 'misc'
            if category not in categories:
                categories[category] = []
            categories[category].append(tag)
        
        output = []
        for category, cat_tags in sorted(categories.items()):
            output.append(f"\n📁 {category.upper()}:")
            for i, tag in enumerate(cat_tags, 1):
                output.append(f"   {i:2d}. {tag}")
        
        return ''.join(output)
    
    def _select_tags_interactive(self) -> List[str]:
        """Interactive tag selection and creation"""
        selected_tags = []
        
        print("\n" + "="*60)
        print("🏷️  TAG SELECTION")
        print("="*60)
        print("Available tags:")
        print(self._format_tags_display(list(self.existing_tags)))
        
        while True:
            print(f"\nCurrently selected: {selected_tags}")
            print("\nOptions:")
            print("1. Add existing tag (enter tag name)")
            print("2. Create new tag (enter new tag name)")
            print("3. Remove tag (enter tag name to remove)")
            print("4. Done selecting tags")
            print("5. Search tags (enter partial name)")
            
            choice = input("\nEnter your choice (1-5) or tag name: ").strip()
            
            if choice == '4' or choice.lower() == 'done':
                break
            elif choice == '5' or choice.lower().startswith('search'):
                search_term = input("Enter search term: ").lower()
                matching_tags = [tag for tag in self.existing_tags if search_term in tag.lower()]
                if matching_tags:
                    print(f"\nFound {len(matching_tags)} matching tags:")
                    for i, tag in enumerate(matching_tags, 1):
                        print(f"   {i:2d}. {tag}")
                else:
                    print("No matching tags found.")
                continue
            elif choice == '3':
                tag_to_remove = input("Enter tag name to remove: ").strip()
                if tag_to_remove in selected_tags:
                    selected_tags.remove(tag_to_remove)
                    print(f"✅ Removed tag: {tag_to_remove}")
                else:
                    print(f"❌ Tag not in selection: {tag_to_remove}")
                continue
            
            # Handle tag input (choice 1 or 2)
            tag_name = choice if choice not in ['1', '2'] else input("Enter tag name: ").strip()
            
            if not tag_name:
                print("❌ Tag name cannot be empty")
                continue
            
            # Validate tag format (should be like category/subcategory/item)
            if not re.match(r'^[A-Za-z0-9\-]+(/[A-Za-z0-9\-]+)*', tag_name):
                print("❌ Invalid tag format. Use lowercase letters, numbers, hyphens, and forward slashes.")
                print("   Examples: tools/development, libraries/python/ml, datasets/images")
                continue
            
            if tag_name in selected_tags:
                print(f"❌ Tag already selected: {tag_name}")
                continue
            
            # Add tag
            selected_tags.append(tag_name)
            
            if tag_name not in self.existing_tags:
                print(f"✨ Created new tag: {tag_name}")
                self.existing_tags.add(tag_name)
            else:
                print(f"✅ Added existing tag: {tag_name}")
        
        return selected_tags
    
    def _get_resource_info(self, url: str) -> Dict:
        """Get resource information interactively"""
        print("\n" + "="*60)
        print("📝 RESOURCE INFORMATION")
        print("="*60)
        
        # Try to extract information from URL
        suggested_name = self._suggest_name_from_url(url)
        
        # Get name
        name_prompt = f"Resource name"
        if suggested_name:
            name_prompt += f" (suggested: {suggested_name})"
        name_prompt += ": "
        
        name = input(name_prompt).strip()
        if not name and suggested_name:
            name = suggested_name
            print(f"✅ Using suggested name: {name}")
        
        while not name:
            name = input("❌ Name is required. Enter resource name: ").strip()
        
        # Get description
        description = input("Description: ").strip()
        while not description:
            description = input("❌ Description is required. Enter description: ").strip()
        
        # Select tags
        tags = self._select_tags_interactive()
        
        return {
            'name': name,
            'url': url,
            'description': description,
            'tags': tags
        }
    
    def _suggest_name_from_url(self, url: str) -> Optional[str]:
        """Try to suggest a name based on the URL"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.strip('/')
            
            # GitHub repositories
            if 'github.com' in domain:
                parts = path.split('/')
                if len(parts) >= 2:
                    return parts[1].replace('-', ' ').replace('_', ' ').title()
            
            # ArXiv papers
            if 'arxiv.org' in domain:
                return "Research Paper"
            
            # Common academic domains
            if any(domain.endswith(suffix) for suffix in ['.edu', '.ac.uk', '.org']):
                if path:
                    # Extract meaningful part from path
                    path_parts = path.split('/')
                    for part in path_parts:
                        if len(part) > 3 and part.lower() not in ['www', 'index', 'html', 'php']:
                            return part.replace('-', ' ').replace('_', ' ').title()
            
            # Default to domain name
            domain_name = domain.split('.')[0] if '.' in domain else domain
            return domain_name.replace('-', ' ').replace('_', ' ').title()
            
        except Exception:
            return None
    
    def add_resource_interactive(self) -> bool:
        """Main interactive flow for adding a resource"""
        print("\n🤖 AI Resources Add Tool")
        print("="*60)
        
        # Get URL
        url = input("Enter resource URL: ").strip()
        is_valid, validated_url = self._validate_url(url)
        
        if not is_valid:
            print(f"❌ Invalid URL: {validated_url}")
            return False
        
        url = validated_url
        
        # Check for duplicates
        duplicate = self.url_index.check_duplicate(url)
        if duplicate:
            print(f"\n❌ DUPLICATE URL DETECTED!")
            print(f"   Existing resource: {duplicate['name']}")
            print(f"   URL: {duplicate['original_url']}")
            print(f"   Tags: {', '.join(duplicate['tags'])}")
            
            proceed = input("\nDo you want to continue anyway? (y/N): ").strip().lower()
            if proceed != 'y':
                print("❌ Cancelled by user")
                return False
        
        # Get resource information
        try:
            resource_info = self._get_resource_info(url)
        except KeyboardInterrupt:
            print("\n❌ Cancelled by user")
            return False
        
        # Show summary and confirm
        print("\n" + "="*60)
        print("📋 RESOURCE SUMMARY")
        print("="*60)
        print(f"Name: {resource_info['name']}")
        print(f"URL: {resource_info['url']}")
        print(f"Description: {resource_info['description']}")
        print(f"Tags: {', '.join(resource_info['tags'])}")
        
        confirm = input("\nAdd this resource? (Y/n): ").strip().lower()
        if confirm and confirm != 'y':
            print("❌ Cancelled by user")
            return False
        
        # Add to resources file
        return self._add_to_resources_file(resource_info)
    
    def _add_to_resources_file(self, resource_info: Dict) -> bool:
        """Add resource to the YAML file"""
        try:
            # Load existing resources
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            resources = data.get('resources', [])
            resources.append(resource_info)
            
            # Save updated resources
            with open(self.resources_file, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True, 
                         sort_keys=False, indent=2)
            
            # Update URL index
            self.url_index.add_url(
                resource_info['url'], 
                resource_info['name'], 
                resource_info['tags']
            )
            
            print(f"\n✅ Successfully added resource: {resource_info['name']}")
            print(f"📁 Total resources: {len(resources)}")
            
            # Suggest running the generator
            print(f"\n💡 Don't forget to run: python3 generate_readme.py")
            
            return True
            
        except Exception as e:
            print(f"❌ Error adding resource: {e}")
            return False


def main():
    """Main CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Add new resources to AI Resources collection',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 add_resource.py                    # Interactive mode
    python3 add_resource.py --url URL          # Pre-fill URL
    python3 add_resource.py --batch FILE       # Batch import from file
        """
    )
    
    parser.add_argument('--url', help='Pre-fill URL for the resource')
    parser.add_argument('--resources-file', type=Path, help='Path to resources.yml file')
    parser.add_argument('--batch', type=Path, help='Batch import from YAML file')
    
    args = parser.parse_args()
    
    try:
        adder = ResourceAdder(args.resources_file)
        
        if args.batch:
            from batch_import import BatchImporter
            importer = BatchImporter(args.resources_file)
            success = importer.import_batch(args.batch, interactive=True)
            sys.exit(0 if success else 1)
        
        # Pre-fill URL if provided
        if args.url:
            # Monkey patch the input for URL
            original_input = input
            def mock_input(prompt):
                if "resource URL" in prompt:
                    print(f"{prompt}{args.url}")
                    return args.url
                return original_input(prompt)
            __builtins__['input'] = mock_input
        
        success = adder.add_resource_interactive()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()