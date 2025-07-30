# AI Resources Hub - Makefile
# Convenient commands for project management

.PHONY: help install update check clean validate test

# Default target
help: ## Show this help message
	@echo "AI Resources Hub - Available Commands:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	pip install -r requirements.txt
	@echo "✅ Dependencies installed!"

update: ## Generate updated README
	@echo "🔄 Generating updated README..."
	python scripts/generate_readme.py
	@echo "✅ README updated!"

check: ## Validate resources.yml syntax
	@echo "🔍 Validating resources.yml..."
	python -c "import yaml; yaml.safe_load(open('resources.yml')); print('✅ YAML syntax is valid')"

validate: check update ## Full validation (YAML + README generation)
	@echo "🎯 Full validation completed!"

clean: ## Remove generated files (none currently)
	@echo "🧹 Nothing to clean (README is tracked)"

test: validate ## Run all tests
	@echo "🧪 All tests passed!"

dev-setup: install ## Set up development environment
	@echo "🛠️  Setting up development environment..."
	@echo "💡 Consider installing: git hooks, pre-commit, etc."
	@echo "✅ Development environment ready!"

stats: ## Show project statistics
	@echo "📊 Project Statistics:"
	@echo "Resources: $$(python -c 'import yaml; data=yaml.safe_load(open("resources.yml")); print(len(data["resources"]))')"
	@echo "Categories: $$(python -c 'import yaml; data=yaml.safe_load(open("resources.yml")); tags=set(); [tags.update(r.get("tags", [])) for r in data["resources"]]; main_cats=set([t.split("/")[0] for t in tags]); print(len(main_cats))')"
	@echo "Lines of Code: $$(wc -l scripts/generate_readme.py | awk '{print $$1}')"

# Quick commands
gen: update ## Alias for update
build: update ## Alias for update