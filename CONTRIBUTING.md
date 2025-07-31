# 🤝 Contributing to AI Resources Hub

Welcome to our community! We're thrilled that you want to contribute to making this an useful AI resources for everyone.

## Contributions
Your contributions help make this resource collection even better for everyone.

### 🎯 How to Contribute

| Method | Description |
|--------|-------------|
| 🔗 **Add Resources** | Submit new tools, papers, or tutorials via `resources.yml` |
| 🐛 **Report Issues** | Found a broken link or outdated info? Let me know! |
| 💡 **Suggest Features** | Have ideas for improvements? Let me know! |
| 🛠️ **Code Improvements** | Enhance the generation script or add new features |

## 🚀 Quick Start

### For 💻 Contributors

```bash
# Clone this repository for offline access
git clone https://github.com/BaptisteBlouin/AI-resources.git

cd AI-resources

# Add new resources easily
python scripts/add_resource.py

# Or 
python scripts/add_resource.py --batch import.yml

# Generate an updated README with the latest resources
python scripts/generate_readme.py

```

###  import.yml  


```yaml
resources:
  - name: "Example AI Tool"
    url: "https://example.com/ai-tool"
    description: "An example AI tool for demonstration"
    tags: ["tools/example", "tutorials/demo"]
  - name: "Another Example"
    url: "https://github.com/example/repo"
    description: "Another example resource"
    tags: ["libraries/python/ml", "tools/development"]

```


**Submit** a pull request with a clear description

### For 🌐 Contributors

Follow the [web interface](https://baptisteblouin.github.io/AI-resources/) click on the `+ Add Resource` button and fill the form. It will create an issue with the resource information. This issue will be processed by the bot and the resource will be added to the collection.

