#!/usr/bin/env python3
"""
URL Index Manager
Maintains a fast lookup index of URLs for duplicate detection
"""

import json
import yaml
from pathlib import Path
from typing import Dict, Set, List, Optional
from urllib.parse import urlparse, urlunparse


class URLIndex:
    """Manages URL index for fast duplicate detection"""
    
    def __init__(self, index_file: Path = None):
        self.index_file = index_file or Path(__file__).parent / 'url_index.json'
        self.index = self._load_index()
    
    def _load_index(self) -> Dict[str, Dict]:
        """Load existing URL index or create empty one"""
        try:
            if self.index_file.exists():
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load URL index: {e}")
        
        return {}
    
    def _save_index(self):
        """Save URL index to file"""
        try:
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(self.index, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Error saving URL index: {e}")
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL for consistent comparison"""
        if not url:
            return ""
        
        # Clean up the URL first
        url = url.strip()
        
        # Remove common prefixes that users might add (case insensitive)
        prefixes_to_remove = ['www.', 'http://www.', 'https://www.', 'http://', 'https://']
        url_lower = url.lower()
        for prefix in prefixes_to_remove:
            if url_lower.startswith(prefix):
                url = url[len(prefix):]
                break
        
        # Add https:// if no protocol specified
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        try:
            parsed = urlparse(url)
            
            # Handle cases where the URL might be malformed
            if not parsed.netloc and parsed.path:
                # Try to fix URLs like "github.com/user/repo" without protocol
                url = 'https://' + parsed.path
                parsed = urlparse(url)
            
            # Remove www. from netloc for consistent comparison
            netloc = parsed.netloc.lower()
            if netloc.startswith('www.'):
                netloc = netloc[4:]
            
            # Normalize: remove trailing slash, convert to lowercase, remove www
            normalized = urlunparse((
                'https',  # Always use https for normalization
                netloc,
                parsed.path.rstrip('/') or '/',  # Keep root slash
                parsed.params,
                parsed.query,
                ''  # Remove fragment for comparison
            ))
            return normalized
        except Exception:
            return url.lower().strip()
    
    def add_url(self, url: str, name: str, tags: List[str] = None) -> bool:
        """Add URL to index. Returns True if added, False if duplicate"""
        normalized_url = self._normalize_url(url)
        
        if normalized_url in self.index:
            return False
        
        self.index[normalized_url] = {
            'name': name,
            'original_url': url,
            'tags': tags or [],
            'added_date': None  # Will be set when resource is actually added
        }
        self._save_index()
        return True
    
    def check_duplicate(self, url: str) -> Optional[Dict]:
        """Check if URL is duplicate. Returns existing resource info if found"""
        normalized_url = self._normalize_url(url)
        return self.index.get(normalized_url)
    
    def remove_url(self, url: str) -> bool:
        """Remove URL from index"""
        normalized_url = self._normalize_url(url)
        if normalized_url in self.index:
            del self.index[normalized_url]
            self._save_index()
            return True
        return False
    
    def rebuild_from_resources(self, resources_file: Path) -> int:
        """Rebuild index from existing resources.yml file"""
        try:
            with open(resources_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading resources file: {e}")
            return 0
        
        resources = data.get('resources', [])
        self.index = {}  # Clear existing index
        
        added_count = 0
        for resource in resources:
            url = resource.get('url')
            name = resource.get('name') or resource.get('title', 'Unknown')
            tags = resource.get('tags', [])
            
            if url:
                normalized_url = self._normalize_url(url)
                self.index[normalized_url] = {
                    'name': name,
                    'original_url': url,
                    'tags': tags,
                    'added_date': None
                }
                added_count += 1
        
        self._save_index()
        return added_count
    
    def get_all_tags(self) -> Set[str]:
        """Get all unique tags from indexed resources"""
        all_tags = set()
        for resource_info in self.index.values():
            all_tags.update(resource_info.get('tags', []))
        return all_tags
    
    def search_similar_urls(self, url: str, threshold: float = 0.8) -> List[Dict]:
        """Find URLs that might be similar (for fuzzy duplicate detection)"""
        from difflib import SequenceMatcher
        
        normalized_url = self._normalize_url(url)
        similar = []
        
        for indexed_url, info in self.index.items():
            similarity = SequenceMatcher(None, normalized_url, indexed_url).ratio()
            if similarity >= threshold:
                similar.append({
                    'url': indexed_url,
                    'info': info,
                    'similarity': similarity
                })
        
        return sorted(similar, key=lambda x: x['similarity'], reverse=True)
    
    def get_stats(self) -> Dict:
        """Get statistics about the URL index"""
        total_urls = len(self.index)
        domains = {}
        tags = set()
        
        for info in self.index.values():
            # Extract domain
            try:
                domain = urlparse(info['original_url']).netloc.lower()
                domains[domain] = domains.get(domain, 0) + 1
            except:
                pass
            
            # Collect tags
            tags.update(info.get('tags', []))
        
        return {
            'total_urls': total_urls,
            'total_domains': len(domains),
            'total_tags': len(tags),
            'top_domains': sorted(domains.items(), key=lambda x: x[1], reverse=True)[:10]
        }


def main():
    """CLI interface for URL index management"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage URL index for AI resources')
    parser.add_argument('--rebuild', action='store_true', help='Rebuild index from resources.yml')
    parser.add_argument('--check', type=str, help='Check if URL is duplicate')
    parser.add_argument('--stats', action='store_true', help='Show index statistics')
    parser.add_argument('--resources-file', type=Path, help='Path to resources.yml file')
    
    args = parser.parse_args()
    
    # Determine paths
    script_dir = Path(__file__).parent
    resources_file = args.resources_file or script_dir.parent / 'resources.yml'
    
    # Initialize URL index
    url_index = URLIndex()
    
    if args.rebuild:
        print("Rebuilding URL index from resources.yml...")
        count = url_index.rebuild_from_resources(resources_file)
        print(f"✅ Rebuilt index with {count} URLs")
    
    elif args.check:
        duplicate = url_index.check_duplicate(args.check)
        if duplicate:
            print(f"❌ Duplicate URL found:")
            print(f"   Name: {duplicate['name']}")
            print(f"   URL: {duplicate['original_url']}")
            print(f"   Tags: {', '.join(duplicate['tags'])}")
        else:
            print("✅ URL is not a duplicate")
    
    elif args.stats:
        stats = url_index.get_stats()
        print(f"📊 URL Index Statistics:")
        print(f"   Total URLs: {stats['total_urls']}")
        print(f"   Total domains: {stats['total_domains']}")
        print(f"   Total tags: {stats['total_tags']}")
        print(f"\n🏆 Top domains:")
        for domain, count in stats['top_domains']:
            print(f"   {domain}: {count}")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()