# Contributing to Rikstoto AI Model Testing Platform

Thank you for your interest in contributing to the Rikstoto AI Model Testing Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept responsibility for mistakes
- Prioritize the project's best interests

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without consent
- Any conduct that creates an unsafe environment

## Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/rikstoto/ai-wrapper.git
   cd rikstoto-ai-wrapper
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set Up Development Environment**
   - Follow setup instructions in README.md
   - Copy `.env.example` to `.env` and configure

## Development Setup

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # If available
```

### Frontend Setup
```bash
cd frontend
npm install
```

## How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Screenshots if applicable

### Suggesting Features
1. Check if already suggested
2. Create a feature request with:
   - Use case description
   - Proposed solution
   - Alternative solutions considered
   - Mockups/diagrams if applicable

### Code Contributions
1. Pick an issue or create one
2. Comment on the issue to claim it
3. Develop your solution
4. Write/update tests
5. Update documentation
6. Submit a pull request

## Coding Standards

### Python (Backend)
```python
"""
Follow PEP 8 style guide
Use type hints for function parameters and returns
"""

from typing import Dict, List, Optional

def generate_text(
    model_name: str,
    prompt: str,
    max_length: Optional[int] = 500
) -> Dict[str, any]:
    """
    Generate text using specified model.
    
    Args:
        model_name: Name of the model to use
        prompt: Input prompt for generation
        max_length: Maximum length of generated text
        
    Returns:
        Dictionary containing generated text and metadata
    """
    pass
```

### TypeScript/React (Frontend)
```typescript
// Use TypeScript strictly
// Define interfaces for all props and state
// Use functional components with hooks

interface ModelSelectProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ 
  models, 
  selectedModel, 
  onModelChange 
}) => {
  // Component implementation
};
```

### General Guidelines
- Write self-documenting code
- Keep functions small and focused
- Use meaningful variable names
- Add comments for complex logic
- Follow DRY principle
- Write unit tests for new features

## Testing Guidelines

### Backend Testing
```bash
cd backend
pytest tests/
pytest tests/ --cov=.  # With coverage
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Test Requirements
- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error scenarios
- Include integration tests where applicable

## Commit Guidelines

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples
```bash
feat(backend): add support for GPT-4 model
fix(frontend): resolve JSON editor validation issue
docs: update installation instructions
test(backend): add unit tests for generate endpoint
```

## Pull Request Process

1. **Before Submitting**
   - [ ] All tests pass
   - [ ] Code follows style guidelines
   - [ ] Documentation is updated
   - [ ] Commit messages follow guidelines
   - [ ] Branch is up to date with main

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project standards
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No security vulnerabilities introduced
   ```

3. **Review Process**
   - At least one approval required
   - Address all review comments
   - Ensure CI/CD checks pass
   - Squash commits if requested

## Development Tips

### Useful Commands
```bash
# Format Python code
black backend/
flake8 backend/

# Format TypeScript/React code
cd frontend
npm run format
npm run lint

# Run all checks
npm run check-all
```

### Environment Variables
Never commit `.env` files. Always use `.env.example` as reference.

### Model Testing
When adding new models:
1. Test with various input types
2. Verify error handling
3. Check performance impact
4. Update model documentation

## Getting Help

- Check documentation and existing issues
- Ask questions in discussions
- Contact maintainers for guidance
- Join Rikstoto dev channels (internal)

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Internal Rikstoto communications

Thank you for contributing to make this platform better!

---
Last Updated: 2024
Version: 1.0