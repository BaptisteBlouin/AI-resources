# AI Resources Management Tools

This directory contains tools for managing the AI Resources collection efficiently.

## 🛠️ Available Tools

### 1. Add Resource CLI (`add_resource.py`)
Interactive command-line tool for adding new resources with duplicate detection and tag management.

**Usage:**
```bash
# Interactive mode
python3 add_resource.py

# Pre-fill URL
python3 add_resource.py --url "https://example.com/awesome-tool"

# Batch import from YAML file
python3 add_resource.py --batch batch_resources.yml

# Help
python3 add_resource.py --help
```

**Features:**
- ✅ Smart URL validation and duplicate detection (handles http/https, www/non-www variations)
- 🏷️ Interactive tag selection and creation
- 📝 Auto-suggest resource names from URLs
- 🔍 Real-time validation
- 📋 YAML generation
- 📁 **NEW**: Batch import from YAML files with duplicate checking

### 2. Batch Import Tool (`batch_import.py`)
**NEW**: Dedicated tool for importing multiple resources from YAML files with comprehensive validation and duplicate checking.

**Usage:**
```bash
# Import resources from YAML file
python3 batch_import.py --file batch_resources.yml

# Interactive mode (ask about duplicates)
python3 batch_import.py --file batch_resources.yml --interactive

# Dry run (validate only, no changes)
python3 batch_import.py --file batch_resources.yml --dry-run

# Create sample YAML file
python3 batch_import.py --create-sample sample.yml

# Help
python3 batch_import.py --help
```

**Features:**
- 📁 Import multiple resources from YAML files
- ✅ Comprehensive validation (required fields, URL format, tag format)
- 🔍 Smart duplicate detection with detailed reporting
- 🔄 Interactive mode for handling duplicates
- 📊 Detailed import statistics and progress tracking
- 🧪 Dry-run mode for testing
- 📝 Sample file generation
- ⚡ Same smart URL normalization as single resource tool

**YAML Format:**
```yaml
resources:
  - name: "Resource Name"
    url: "https://example.com"
    description: "Resource description"
    tags: ["category/subcategory", "other/tag"]
  - name: "Another Resource"
    url: "https://github.com/example/repo"
    description: "Another description"
    tags: ["libraries/python", "tools/development"]
```

### 3. URL Index Manager (`url_index.py`)
Maintains a fast lookup index for duplicate URL detection.

**Usage:**
```bash
# Rebuild index from resources.yml
python3 url_index.py --rebuild

# Check if URL is duplicate
python3 url_index.py --check "https://example.com"

# Show statistics
python3 url_index.py --stats

# Help
python3 url_index.py --help
```

**Features:**
- ⚡ Fast duplicate detection with smart URL normalization
- 🔄 Auto-sync with resources.yml
- 📊 Usage statistics
- 🔍 Handles all URL variations (http/https, www/non-www, trailing slashes)

### 4. Tag Manager (`manage_tags.py`)
Analyze and manage the tagging system.

**Usage:**
```bash
# Analyze current tags
python3 manage_tags.py --analyze

# Suggest improvements
python3 manage_tags.py --suggest

# Validate tag formats
python3 manage_tags.py --validate

# Show tag hierarchy
python3 manage_tags.py --hierarchy

# Export tags as JSON/CSV
python3 manage_tags.py --export json
```

**Features:**
- 📊 Tag usage analysis
- 💡 Improvement suggestions
- ✅ Format validation
- 🌳 Hierarchy visualization
- 📤 Export capabilities

### 5. README Generator (`generate_readme.py`)
Enhanced version that now maintains the URL index automatically.

**Usage:**
```bash
# Generate README and update web resources
python3 generate_readme.py

# Quiet mode
python3 generate_readme.py --quiet
```

**New Features:**
- 🔄 Auto-updates URL index
- 📊 Improved statistics
- 🌐 Web resource generation

## 🌐 Web Interface

### Add Resource Form (`../docs/add-form.html`)
Web-based interface for adding resources with GitHub integration.

**Features:**
- 🌐 User-friendly web interface
- 🏷️ Interactive tag selection
- ✅ Real-time validation
- 🔗 GitHub PR/Issue integration
- 📋 YAML preview and copy
- 📁 **NEW**: Batch import via file upload with YAML validation

**Access:** Open `docs/add-form.html` in a web browser or visit the GitHub Pages URL.

## 🚀 Quick Start

1. **First time setup:**
   ```bash
   # Rebuild URL index
   python3 url_index.py --rebuild
   
   # Analyze current tags
   python3 manage_tags.py --analyze
   ```

2. **Add a new resource (CLI):**
   ```bash
   python3 add_resource.py
   ```

3. **Add multiple resources (Batch CLI):**
   ```bash
   python3 batch_import.py --create-sample sample.yml
   # Edit sample.yml with your resources
   python3 batch_import.py --file sample.yml --dry-run
   python3 batch_import.py --file sample.yml
   ```

4. **Add a new resource (Web):**
   Open `docs/add-form.html` in your browser (supports both single and batch import)

5. **Generate updated documentation:**
   ```bash
   python3 generate_readme.py
   ```

## 📁 File Structure

```
scripts/
├── add_resource.py      # Main CLI add tool (now with batch support)
├── batch_import.py      # Dedicated batch import tool
├── batch_extension.js   # Web batch import functionality
├── url_index.py         # URL index manager
├── manage_tags.py       # Tag management utility
├── generate_readme.py   # Enhanced README generator
├── url_index.json       # URL index storage (auto-generated)
└── README.md           # This file

docs/
├── add-form.html       # Web add interface (now with batch import)
├── add-form.js         # Web interface logic
├── resources.json      # Generated web resources
├── index.html          # Main web interface (updated)
└── app.js             # Main web app logic
```

## 🔧 Requirements

- Python 3.7+
- PyYAML
- requests (for URL validation)

## 🔗 Smart URL Handling

The system now includes intelligent URL normalization that automatically handles:

- **Protocol variations**: `http://` vs `https://` vs no protocol
- **www variations**: `www.example.com` vs `example.com` 
- **Trailing slashes**: `example.com/` vs `example.com`
- **Case sensitivity**: `EXAMPLE.COM` vs `example.com`

**Examples that are detected as duplicates:**
```
pytorch.org
www.pytorch.org
http://pytorch.org  
https://pytorch.org
https://www.pytorch.org/
```

All these variations normalize to: `https://pytorch.org/`

## 💡 Tips

- The URL index is automatically updated when running `generate_readme.py`
- Use the tag manager to maintain consistency in your tagging system
- The web interface supports GitHub authentication for creating PRs
- All tools support `--help` for detailed usage information
- When adding URLs, you can enter them in any format - the system will normalize them automatically

## 🐛 Troubleshooting

1. **"URL index not found"**: Run `python3 url_index.py --rebuild`
2. **"Invalid tag format"**: Use lowercase letters, numbers, hyphens, and forward slashes only
3. **"Module not found"**: Make sure you're running from the scripts directory
4. **Web interface not loading**: Ensure you're accessing it via a web server (not file://)

---

*These tools are designed to make contributing to the AI Resources collection as easy as possible. Happy contributing! 🎉*