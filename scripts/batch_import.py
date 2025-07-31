#!/usr/bin/env python3
"""
AI Resources Batch Import Tool
Batch import resources from YAML files with duplicate checking
"""

import yaml
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from url_index import URLIndex


class BatchImporter:
    """Tool for batch importing resources from YAML files"""
    
    def __init__(self, resources_file: Path = None):
        self.script_dir = Path(__file__).parent
        self.resources_file = resources_file or self.script_dir.parent / 'resources.yml'
        self.url_index = URLIndex()
        self.stats = {
            'total': 0,
            'added': 0,
            'skipped_duplicates': 0,
            'errors': 0,
            'duplicates': []
        }
        
    def _validate_resource(self, resource: Dict, index: int) -> Tuple[bool, str]:
        """Validate a single resource entry"""
        
        # Check required fields
        required_fields = ['name', 'url', 'description', 'tags']
        for field in required_fields:
            if field not in resource:
                return False, f"Missing required field: {field}"
            if not resource[field]:
                return False, f"Empty field: {field}"
        
        # Validate URL format
        url = resource['url'].strip()
        if not url.startswith(('http://', 'https://')):
            return False, f"Invalid URL format: {url}"
        
        # Validate tags format
        tags = resource['tags']
        if not isinstance(tags, list):
            return False, "Tags must be a list"
        
        for tag in tags:
            if not isinstance(tag, str):
                return False, f"Invalid tag type: {tag}"
            # Basic tag format validation
            if not tag.strip():
                return False, "Empty tag found"
            # Check tag format (lowercase, hyphens, slashes)
            import re
            if not re.match(r'^[A-Za-z0-9\-]+(/[A-Za-z0-9\-]+)*', tag):
                return False, f"Invalid tag format: {tag}"
        
        return True, "Valid"
    
    def _check_duplicate(self, url: str) -> Optional[Dict]:
        """Check if URL is a duplicate"""
        return self.url_index.check_duplicate(url)
    
    def _process_batch_file(self, batch_file: Path, skip_duplicates: bool = True, 
                           interactive: bool = False) -> Tuple[List[Dict], List[str]]:
        """Process a batch YAML file and return valid resources and errors"""
        
        print(f"\n📁 Processing batch file: {batch_file}")
        
        try:
            with open(batch_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            return [], [f"Failed to load YAML file: {e}"]
        
        # Handle different YAML structures
        resources_list = []
        if isinstance(data, dict):
            if 'resources' in data:
                resources_list = data['resources']
            else:
                return [], ["YAML file must contain a 'resources' key or be a list of resources"]
        elif isinstance(data, list):
            resources_list = data
        else:
            return [], ["YAML file must contain either a list of resources or a dict with 'resources' key"]
        
        if not resources_list:
            return [], ["No resources found in file"]
        
        valid_resources = []
        errors = []
        
        print(f"📊 Found {len(resources_list)} resources to process")
        
        for i, resource in enumerate(resources_list, 1):
            self.stats['total'] += 1
            
            print(f"\n[{i}/{len(resources_list)}] Processing: {resource.get('name', 'Unnamed')}")
            
            # Validate resource structure
            is_valid, error_msg = self._validate_resource(resource, i)
            if not is_valid:
                error = f"Resource {i} ({resource.get('name', 'Unnamed')}): {error_msg}"
                errors.append(error)
                print(f"❌ {error}")
                self.stats['errors'] += 1
                continue
            
            # Check for duplicates
            duplicate = self._check_duplicate(resource['url'])
            if duplicate:
                self.stats['skipped_duplicates'] += 1
                self.stats['duplicates'].append({
                    'new': resource,
                    'existing': duplicate,
                    'index': i
                })
                
                if skip_duplicates:
                    print(f"⚠️  Skipping duplicate URL: {resource['url']}")
                    print(f"   Existing: {duplicate['name']}")
                    continue
                
                # Interactive mode for duplicates
                if interactive:
                    print(f"🔍 DUPLICATE DETECTED:")
                    print(f"   New: {resource['name']} - {resource['url']}")
                    print(f"   Existing: {duplicate['name']} - {duplicate['original_url']}")
                    
                    choice = input("   Add anyway? (y/N): ").strip().lower()
                    if choice != 'y':
                        print("   Skipped by user")
                        continue
                else:
                    # Non-interactive: skip by default
                    print(f"⚠️  Skipping duplicate URL: {resource['url']}")
                    continue
            
            # Resource is valid and not a duplicate (or user chose to add anyway)
            valid_resources.append(resource)
            print(f"✅ Valid resource: {resource['name']}")
        
        return valid_resources, errors
    
    def _add_resources_to_file(self, resources: List[Dict]) -> bool:
        """Add valid resources to the main resources.yml file"""
        
        if not resources:
            print("No resources to add")
            return True
        
        try:
            # Load existing resources
            with open(self.resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            existing_resources = data.get('resources', [])
            
            # Add new resources
            for resource in resources:
                existing_resources.append(resource)
                
                # Update URL index
                self.url_index.add_url(
                    resource['url'], 
                    resource['name'], 
                    resource['tags']
                )
                
                self.stats['added'] += 1
            
            # Save updated resources
            data['resources'] = existing_resources
            with open(self.resources_file, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True, 
                         sort_keys=False, indent=2)
            
            print(f"\n✅ Successfully added {len(resources)} resources")
            print(f"📁 Total resources in collection: {len(existing_resources)}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error adding resources to file: {e}")
            return False
    
    def _print_summary(self):
        """Print import summary"""
        print("\n" + "="*60)
        print("📊 BATCH IMPORT SUMMARY")
        print("="*60)
        print(f"Total resources processed: {self.stats['total']}")
        print(f"Successfully added: {self.stats['added']}")
        print(f"Skipped duplicates: {self.stats['skipped_duplicates']}")
        print(f"Errors: {self.stats['errors']}")
        
        if self.stats['duplicates']:
            print(f"\n🔍 Duplicates found:")
            for dup in self.stats['duplicates']:
                print(f"   - {dup['new']['name']} -> {dup['existing']['name']}")
        
        if self.stats['added'] > 0:
            print(f"\n💡 Don't forget to run: python3 generate_readme.py")
    
    def import_batch(self, batch_file: Path, skip_duplicates: bool = True, 
                    interactive: bool = False, dry_run: bool = False) -> bool:
        """Main batch import function"""
        
        if not batch_file.exists():
            print(f"❌ Batch file not found: {batch_file}")
            return False
        
        print(f"🚀 Starting batch import from: {batch_file}")
        if dry_run:
            print("🔍 DRY RUN MODE - No changes will be made")
        
        # Process the batch file
        valid_resources, errors = self._process_batch_file(
            batch_file, skip_duplicates, interactive
        )
        
        # Print errors
        if errors:
            print(f"\n❌ {len(errors)} errors found:")
            for error in errors:
                print(f"   {error}")
        
        # Add resources to file (unless dry run)
        if not dry_run and valid_resources:
            success = self._add_resources_to_file(valid_resources)
        else:
            success = True
            if dry_run and valid_resources:
                print(f"\n🔍 DRY RUN: Would add {len(valid_resources)} resources")
        
        # Print summary
        self._print_summary()
        
        return success and len(errors) == 0
    
    def create_sample_batch_file(self, output_file: Path):
        """Create a sample batch YAML file for reference"""
        
        sample_data = {
            'resources': [
                {
                    'name': 'Example AI Tool',
                    'url': 'https://example.com/ai-tool',
                    'description': 'An example AI tool for demonstration purposes',
                    'tags': ['tools/example', 'tutorials/demo']
                },
                {
                    'name': 'Another Example',
                    'url': 'https://github.com/example/repo',
                    'description': 'Another example resource',
                    'tags': ['libraries/python/ml', 'tools/development']
                }
            ]
        }
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                yaml.dump(sample_data, f, default_flow_style=False, allow_unicode=True, 
                         sort_keys=False, indent=2)
            
            print(f"✅ Sample batch file created: {output_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error creating sample file: {e}")
            return False


def main():
    """Main CLI entry point"""
    
    parser = argparse.ArgumentParser(
        description='Batch import AI resources from YAML files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 batch_import.py --file batch.yml              # Import with duplicate skip
    python3 batch_import.py --file batch.yml --interactive # Interactive duplicate handling  
    python3 batch_import.py --file batch.yml --dry-run    # Dry run (no changes)
    python3 batch_import.py --create-sample sample.yml    # Create sample batch file

YAML file format:
    resources:
      - name: "Resource Name"
        url: "https://example.com"
        description: "Resource description"
        tags: ["category/subcategory", "other/tag"]
      - name: "Another Resource"
        # ... more resources
        """
    )
    
    parser.add_argument('--file', '-f', type=Path, 
                       help='YAML file containing resources to import')
    parser.add_argument('--resources-file', type=Path, 
                       help='Path to resources.yml file')
    parser.add_argument('--skip-duplicates', action='store_true', default=True,
                       help='Skip duplicate URLs (default: True)')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Interactive mode for handling duplicates')
    parser.add_argument('--dry-run', action='store_true',
                       help='Dry run - validate but don\'t add resources')
    parser.add_argument('--create-sample', type=Path,
                       help='Create a sample batch YAML file')
    
    args = parser.parse_args()
    
    try:
        importer = BatchImporter(args.resources_file)
        
        if args.create_sample:
            success = importer.create_sample_batch_file(args.create_sample)
            sys.exit(0 if success else 1)
        
        if not args.file:
            print("❌ No batch file specified. Use --file or --create-sample")
            parser.print_help()
            sys.exit(1)
        
        success = importer.import_batch(
            args.file,
            skip_duplicates=args.skip_duplicates,
            interactive=args.interactive,
            dry_run=args.dry_run
        )
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()