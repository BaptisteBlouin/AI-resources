#!/usr/bin/env python3
"""
Test script to demonstrate improved URL normalization
"""

from url_index import URLIndex

def test_url_normalization():
    """Test various URL formats to ensure they normalize correctly"""
    
    ui = URLIndex()
    
    print("🧪 Testing URL Normalization")
    print("=" * 50)
    
    # Test cases with various URL formats
    test_cases = [
        # Basic domain variations
        "pytorch.org",
        "www.pytorch.org", 
        "http://pytorch.org",
        "https://pytorch.org",
        "http://www.pytorch.org",
        "https://www.pytorch.org",
        "pytorch.org/",
        "https://pytorch.org/",
        "https://www.pytorch.org/",
        
        # GitHub variations
        "github.com/facebook/react",
        "www.github.com/facebook/react",
        "http://github.com/facebook/react",
        "https://github.com/facebook/react",
        "https://www.github.com/facebook/react",
        "github.com/facebook/react/",
        
        # ArXiv variations
        "arxiv.org/abs/1706.03762",
        "www.arxiv.org/abs/1706.03762",
        "https://arxiv.org/abs/1706.03762",
        
        # Edge cases
        "  https://pytorch.org/  ",  # With spaces
        "HTTP://PYTORCH.ORG",       # Uppercase
    ]
    
    # Show normalization results
    print("URL Normalization Results:")
    print("-" * 50)
    
    normalized_urls = {}
    for url in test_cases:
        normalized = ui._normalize_url(url)
        if normalized not in normalized_urls:
            normalized_urls[normalized] = []
        normalized_urls[normalized].append(url)
        print(f"{url:<35} -> {normalized}")
    
    print(f"\n📊 Summary:")
    print(f"Total test URLs: {len(test_cases)}")
    print(f"Unique normalized URLs: {len(normalized_urls)}")
    
    print(f"\n🔍 Groupings:")
    for normalized, originals in normalized_urls.items():
        if len(originals) > 1:
            print(f"  {normalized}")
            for original in originals:
                print(f"    ← {original}")
    
    # Test duplicate detection
    print(f"\n🔍 Duplicate Detection Test:")
    print("-" * 50)
    
    test_duplicates = [
        "pytorch.org",
        "www.pytorch.org", 
        "https://pytorch.org",
        "github.com/huggingface/transformers",
        "https://github.com/huggingface/transformers",
        "github.com/openai/nonexistent-repo",  # Should be new
    ]
    
    for url in test_duplicates:
        duplicate = ui.check_duplicate(url)
        status = "❌ DUPLICATE" if duplicate else "✅ NEW"
        print(f"{url:<40} -> {status}")
        if duplicate:
            print(f"    Existing: {duplicate['name']}")

if __name__ == "__main__":
    test_url_normalization()