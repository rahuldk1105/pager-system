# Contributing to Pager System

Thank you for your interest in contributing to the Pager System! This document provides guidelines and information for contributors.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/pager-system.git
cd pager-system

# Add upstream remote
git remote add upstream https://github.com/original-owner/pager-system.git
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare

# For backend development
cd packages/backend
cp .env.example .env
# Configure your environment variables
```

### 3. Create a Feature Branch
```bash
# Sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Create feature branch
git checkout -b feature/your-feature-name
```

### 4. Make Changes
- Follow the [branching strategy](docs/BRANCHING_STRATEGY.md)
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass and code lints

### 5. Commit Your Changes
```bash
# Stage your changes
git add .

# Commit with conventional format
git commit -m "feat: add user authentication feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Use the PR template provided
- Provide a clear description of changes
- Reference any related issues
- Request review from maintainers

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### Testing
- Write unit tests for all new features
- Maintain 80% code coverage minimum
- Test edge cases and error conditions
- Run tests before committing

### Documentation
- Update README for new features
- Add JSDoc comments for public APIs
- Keep documentation current
- Use clear, concise language

### Security
- Never commit secrets or credentials
- Use environment variables for configuration
- Follow secure coding practices
- Report security issues privately

## Commit Message Guidelines

All commits must follow the [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples
```
feat(auth): add JWT token refresh
fix(api): resolve memory leak in user service
docs(readme): update installation instructions
test(auth): add integration tests for login
```

## Pull Request Process

1. **Create PR**: Use the provided template
2. **Description**: Clearly describe what changes and why
3. **Testing**: Ensure all CI checks pass
4. **Review**: Request review from appropriate team members
5. **Approval**: Address review feedback
6. **Merge**: Squash merge with descriptive commit message

## Issue Reporting

- Use issue templates for bug reports and feature requests
- Provide detailed steps to reproduce bugs
- Include environment information
- Attach screenshots for UI issues

## Getting Help

- Check existing issues and documentation first
- Create a new issue for questions
- Join our community discussions

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for significant contributions
- GitHub repository contributors list
- Release notes

Thank you for contributing to the Pager System! 🎉