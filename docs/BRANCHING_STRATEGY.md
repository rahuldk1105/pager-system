# Branching Strategy

This project follows a Git Flow-inspired branching strategy to maintain code quality and enable continuous deployment.

## Branch Types

### Main Branches

- **`main`** - Production-ready code
  - Always deployable
  - Protected branch (requires PR review)
  - Tagged releases created from this branch
  - Only accepts merges from `develop` or hotfix branches

- **`develop`** - Integration branch for features
  - Latest development changes
  - All feature branches merge here first
  - Automated testing runs on pushes
  - Deploys to staging environment

### Supporting Branches

- **`feature/*`** - Feature development
  - Branch from: `develop`
  - Merge to: `develop`
  - Naming: `feature/description-of-feature`
  - Example: `feature/user-authentication`

- **`bugfix/*`** - Bug fixes
  - Branch from: `develop`
  - Merge to: `develop`
  - Naming: `bugfix/issue-description`
  - Example: `bugfix/login-validation-error`

- **`hotfix/*`** - Production hotfixes
  - Branch from: `main`
  - Merge to: `main` and `develop`
  - Naming: `hotfix/critical-bug-description`
  - Example: `hotfix/security-vulnerability`

- **`release/*`** - Release preparation
  - Branch from: `develop`
  - Merge to: `main` and `develop`
  - Naming: `release/v1.2.3`
  - Used for final testing before production release

## Workflow

### Feature Development
```bash
# Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Develop and commit
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature

# Create PR to develop
# After review and approval, merge to develop
```

### Release Process
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.3

# Final testing and bug fixes
git commit -m "fix: resolve issue in release"
git push origin release/v1.2.3

# Merge to main and develop
git checkout main
git merge release/v1.2.3
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin main --tags

git checkout develop
git merge release/v1.2.3
git push origin develop

# Delete release branch
git branch -d release/v1.2.3
```

### Hotfix Process
```bash
# Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the issue
git commit -m "fix: critical bug in production"
git push origin hotfix/critical-bug

# Merge to main and develop
git checkout main
git merge hotfix/critical-bug
git tag -a v1.2.4 -m "Hotfix version 1.2.4"
git push origin main --tags

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug
```

## Branch Protection Rules

### `main` Branch
- Require PR reviews (minimum 1 reviewer)
- Require status checks to pass
- Include administrators in restrictions
- Require branches to be up to date before merging

### `develop` Branch
- Require PR reviews (minimum 1 reviewer)
- Require status checks to pass
- Allow force pushes (for maintainers only)

## Commit Convention

All commits must follow [Conventional Commits](https://conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples
```
feat: add user authentication
fix: resolve login validation error
docs: update API documentation
refactor: simplify user service logic
test: add unit tests for auth module
```

## Pull Request Guidelines

- Use descriptive titles following commit convention
- Provide clear description of changes
- Reference related issues
- Ensure all CI checks pass
- Request review from appropriate team members
- Keep PRs focused on single feature/fix
- Update documentation if needed