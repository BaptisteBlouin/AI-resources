# 🤝 Contributing to AI Resources Hub

Welcome to our amazing community! We're thrilled that you want to contribute to making this the best AI resources collection on the web.

## 🌟 Types of Contributions

We welcome all kinds of contributions:

- 🔗 **New Resources**: Add tools, papers, tutorials, datasets, etc.
- 🐛 **Bug Fixes**: Fix broken links, outdated information, or errors
- 📝 **Documentation**: Improve guides, examples, or explanations
- 💡 **Features**: Enhance the generation script or add new functionality
- 🎨 **Design**: Improve styling, layout, or user experience

## 🚀 Quick Contribution Guide

### Adding a New Resource

1. **Fork** this repository to your GitHub account
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YourUsername/AI-Resources.git
   cd AI-Resources
   ```

3. **Create a branch** for your contribution:
   ```bash
   git checkout -b add-awesome-resource
   ```

4. **Add your resource** to `resources.yml`:
   ```yaml
   - name: "Your Amazing AI Tool"
     url: "https://github.com/author/amazing-tool"
     description: "A brief, compelling description of what this tool does"
     tags: ["tools/machine-learning", "libraries/python"]
   ```

5. **Test your changes**:
   ```bash
   python scripts/generate_readme.py
   # Or use the Makefile
   make update
   ```

6. **Commit and push**:
   ```bash
   git add resources.yml README.md
   git commit -m "✨ Add Amazing AI Tool for machine learning"
   git push origin add-awesome-resource
   ```

7. **Create a Pull Request** from your fork to the main repository

## 📋 Resource Guidelines

### ✅ What Makes a Great Resource

- **High Quality**: Well-maintained, documented, and actively used
- **Unique Value**: Offers something distinct or particularly excellent
- **Active**: Recently updated or maintained (check last commit date)
- **Accessible**: Has clear documentation and examples
- **Relevant**: Directly related to AI/ML development or research

### 📝 Resource Format

```yaml
- name: "Clear, descriptive name"
  url: "https://valid-url.com"
  description: "Concise description (max 150 characters) explaining what it does and why it's useful"
  tags: ["category/subcategory", "additional/tag"]
```

### 🏷️ Tagging System

Use hierarchical tags to organize resources:

```yaml
# Main categories
tools/           # AI development tools
libraries/       # Code libraries and frameworks
papers/          # Research papers
datasets/        # Training and evaluation datasets
tutorials/       # Learning resources
community/       # Forums, communities, blogs
web-resources/   # Online tools and services

# Subcategories (examples)
tools/data-management
libraries/python/llm-frameworks
papers/transformers
datasets/computer-vision
tutorials/deep-learning
community/forums
web-resources/apis
```

## 🔧 Development Guidelines

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/BaptisteBlouin/AI-Resources.git
cd AI-Resources

# Install dependencies (if needed)
pip install pyyaml

# Test the generation script
python scripts/generate_readme.py

# Or use Makefile commands
make update          # Generate README and web assets
make serve          # Start local development server
make stats          # Show project statistics

# Run with different options
python scripts/generate_readme.py --help
```

### Code Style

- Use type hints in Python functions
- Add docstrings for all functions
- Follow PEP 8 style guidelines
- Write descriptive commit messages
- Test your changes before submitting

### Testing Your Changes

Always test your changes locally:

```bash
# Generate README with your changes
python scripts/generate_readme.py

# Check for any errors in YAML syntax
python -c "import yaml; yaml.safe_load(open('resources.yml'))"

# Verify the generated README looks correct
# Open README.md in your browser or markdown preview
```

## 📚 Commit Message Guidelines

Use clear, descriptive commit messages:

- `✨ Add [Resource Name]` - New resource
- `🐛 Fix [issue description]` - Bug fixes
- `📝 Update [what was updated]` - Documentation
- `🎨 Improve [aspect improved]` - Styling/UX
- `🔧 Refactor [what was refactored]` - Code improvements

## 🚨 Before Submitting

- [ ] Resource is high-quality and actively maintained
- [ ] URL is valid and accessible
- [ ] Description is clear and under 150 characters
- [ ] Tags follow the established hierarchy
- [ ] README generates without errors
- [ ] No duplicate resources exist
- [ ] Follows all guidelines above

## 🔍 Review Process

1. **Automated Checks**: Basic validation of YAML syntax and links
2. **Community Review**: Other contributors may provide feedback
3. **Maintainer Review**: Final approval and merge
4. **Auto-Update**: README is automatically regenerated

## 💬 Getting Help

- 🐛 **Found a bug?** [Create an issue](https://github.com/BaptisteBlouin/AI-Resources/issues)
- 💡 **Have an idea?** [Start a discussion](https://github.com/BaptisteBlouin/AI-Resources/discussions)
- ❓ **Need help?** Comment on your PR or reach out in discussions

## 🎯 Advanced Contributions

### Enhancing the Generation Script

The `scripts/generate_readme.py` script powers the automatic README generation. You can contribute by:

- Adding new badge types or integrations
- Improving the search functionality
- Enhancing the responsive design
- Adding new export formats
- Optimizing performance

### Documentation Improvements

Help us improve:
- This contributing guide
- Code documentation
- Usage examples
- Tutorial content

## 🌈 Community

We're building an inclusive, welcoming community. Please:

- Be respectful and constructive in all interactions
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Help newcomers get started
- Share knowledge and learn from others

---

<div align="center">

**Thank you for contributing to AI Resources Hub!** 🙏

*Together, we're building the ultimate resource for the AI community*

</div>