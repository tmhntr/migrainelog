# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Migraine Log application.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Optimization](#optimization)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline is built using **GitHub Actions** and consists of three main workflows:

1. **Unit & Integration Tests** - Fast feedback on code quality
2. **E2E Tests** - Comprehensive browser testing
3. **Deployment** - Automated deployment to GitHub Pages

### Workflow Triggers

| Workflow | Trigger | Branches |
|----------|---------|----------|
| Unit Tests | Push, PR | `main`, `develop`, `claude/**` |
| E2E Tests | Push, PR | `main`, `develop`, `claude/**` |
| Deployment | Push, Manual | `main` only |

---

## Workflows

### 1. Unit & Integration Tests (`.github/workflows/test.yml`)

**Purpose**: Run fast unit and integration tests on every code change

**Steps**:
1. ✅ Checkout code
2. 📦 Setup Node.js 20 with npm caching
3. 📥 Install dependencies (`npm ci`)
4. 🔍 Run linter (`npm run lint`)
5. 🔧 Run type check (`tsc -b`)
6. 🧪 Run unit tests (`npm run test:run`)
7. 📊 Generate coverage report
8. ⬆️ Upload coverage artifacts

**Runtime**: ~2-3 minutes

**Artifacts**:
- Coverage reports (HTML, JSON, LCOV)
- Test results

### 2. E2E Tests (`.github/workflows/playwright.yml`)

**Purpose**: Test complete user workflows across multiple browsers

**Features**:
- 🎯 **Smart browser selection**: All browsers on `main`, Chromium only on feature branches
- ⚡ **Browser caching**: Caches Playwright browsers to speed up runs
- 🔄 **Matrix strategy**: Runs browsers in parallel
- 📊 **Detailed reports**: Uploads test reports and screenshots

**Steps**:
1. ✅ Checkout code
2. 📦 Setup Node.js 20 with npm caching
3. 📥 Install dependencies (`npm ci`)
4. 🎭 Get Playwright version and cache browsers
5. 🌐 Install Playwright browsers (or use cache)
6. 🧪 Run E2E tests for each browser
7. ⬆️ Upload test reports and results

**Runtime**: ~5-10 minutes per browser

**Artifacts**:
- Playwright HTML reports
- Test screenshots and videos (on failure)
- Test results JSON

### 3. Deployment (`.github/workflows/deploy.yml`)

**Purpose**: Build and deploy the application to GitHub Pages

**Features**:
- 🏗️ Production build with environment variables
- 🔐 Secure deployment with GitHub tokens
- 🌐 Hosted on GitHub Pages
- ⚡ npm caching for faster builds

**Steps**:
1. ✅ Checkout code
2. 📦 Setup Node.js 20 with npm caching
3. 📥 Install dependencies (`npm ci`)
4. 🏗️ Build production bundle (`npm run build`)
5. ⚙️ Configure GitHub Pages
6. ⬆️ Upload build artifact
7. 🚀 Deploy to GitHub Pages

**Runtime**: ~3-5 minutes

**Deployed URL**: `https://<username>.github.io/migrainelog/`

---

## Setup Instructions

### 1. Enable GitHub Actions

1. Go to your repository settings
2. Navigate to **Actions** > **General**
3. Ensure **Allow all actions and reusable workflows** is selected

### 2. Configure GitHub Secrets

Add the following secrets to your repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJI...` |

### 3. Enable GitHub Pages

1. Go to **Settings** > **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save changes

### 4. Branch Protection (Recommended)

Protect your `main` branch:

1. Go to **Settings** > **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks: `Run Tests`, `Playwright E2E Tests`
   - ✅ Require pull request reviews before merging

---

## Deployment

### Manual Deployment

Trigger a deployment manually:

1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

### Automatic Deployment

Deployments trigger automatically when:
- Code is pushed to the `main` branch
- All tests pass (if branch protection is enabled)

### Deployment URL

Your app will be deployed to:

```
https://<your-username>.github.io/migrainelog/
```

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

---

## Optimization

### Caching Strategy

The CI/CD pipeline uses aggressive caching to minimize build times:

#### npm Dependencies
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # Caches npm dependencies
```

**Benefit**: Reduces dependency installation from ~30s to ~5s

#### Playwright Browsers
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
```

**Benefit**: Reduces browser installation from ~2min to ~10s

### Parallel Execution

#### Matrix Strategy
E2E tests run browsers in parallel:

```yaml
strategy:
  matrix:
    project: ["chromium", "firefox", "webkit"]
```

**Benefit**: Tests 3 browsers in the time of 1

### Smart Browser Selection

Feature branches only test Chromium:

```yaml
project: ${{ github.ref == 'refs/heads/main' &&
  fromJSON('["chromium", "firefox", "webkit"]') ||
  fromJSON('["chromium"]') }}
```

**Benefit**: Faster feedback on feature branches

---

## Performance Metrics

### Before Optimization

| Workflow | Runtime | Cost |
|----------|---------|------|
| Unit Tests | ~3 min | Low |
| E2E Tests | ~15 min | High |
| Deployment | ~5 min | Medium |
| **Total** | **~23 min** | **High** |

### After Optimization

| Workflow | Runtime | Cost |
|----------|---------|------|
| Unit Tests | ~2 min | Low |
| E2E Tests (feature) | ~6 min | Low |
| E2E Tests (main) | ~8 min | Medium |
| Deployment | ~3 min | Low |
| **Total (feature)** | **~11 min** | **Low** |
| **Total (main)** | **~13 min** | **Medium** |

**Savings**: ~50% reduction in runtime and cost

---

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Possible causes**:
1. Environment variables not set
2. Different Node.js version
3. Race conditions in tests

**Solutions**:
```bash
# Match CI Node version
nvm use 20

# Use same npm command as CI
npm ci  # instead of npm install

# Set environment variables
export VITE_SUPABASE_URL="..."
export VITE_SUPABASE_ANON_KEY="..."
```

### Deployment Fails

**Common issues**:

#### Build fails
```
Error: Environment variables not set
```

**Solution**: Check that secrets are configured correctly in repository settings

#### Pages not updating
```
The deployment completed but the page hasn't updated
```

**Solution**:
1. Check that GitHub Pages source is set to "GitHub Actions"
2. Clear browser cache
3. Wait 1-2 minutes for CDN propagation

#### 404 errors on deployed site
```
Page loads but routes return 404
```

**Solution**: Check that `base` is configured correctly in `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/migrainelog/' : '/',
```

### Cache Issues

**Symptoms**:
- Tests using old code
- Build using outdated dependencies

**Solution**:
1. Go to **Actions** tab
2. Click **Caches** in left sidebar
3. Delete relevant caches
4. Re-run workflow

### Rate Limits

**Symptoms**:
```
Error: API rate limit exceeded
```

**Solution**:
- GitHub Actions has generous limits for public repos
- For private repos, upgrade your plan or optimize workflow runs
- Reduce unnecessary workflow triggers

---

## Monitoring

### GitHub Actions Dashboard

Monitor your workflows:

1. Go to **Actions** tab
2. View workflow runs, status, and logs
3. Download artifacts for debugging

### Viewing Test Reports

#### Unit Test Coverage
1. Go to workflow run
2. Download `coverage-report` artifact
3. Extract and open `index.html`

#### Playwright Reports
1. Go to workflow run
2. Download `playwright-report-*` artifact
3. Extract and run:
   ```bash
   npx playwright show-report ./playwright-report
   ```

---

## Cost Optimization

### GitHub Actions Minutes

- **Public repositories**: Unlimited
- **Private repositories**: 2,000 minutes/month (free tier)

### Reducing Usage

1. **Skip tests on docs changes**:
   ```yaml
   paths-ignore:
     - '**.md'
     - 'docs/**'
   ```

2. **Conditional E2E tests**:
   ```yaml
   if: ${{ !contains(github.event.head_commit.message, '[skip e2e]') }}
   ```

3. **Use `pull_request` instead of `push`** for feature branches

---

## Best Practices

### Commit Messages

Use conventional commits for clarity:

```
feat: add user profile page
fix: resolve auth token expiration
test: add unit tests for episode service
ci: optimize playwright caching
docs: update deployment instructions
```

### PR Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR
4. Wait for CI checks to pass
5. Request review
6. Merge after approval

### Monitoring

1. Check workflow status regularly
2. Fix failing tests immediately
3. Review coverage reports
4. Monitor deployment success

---

## Future Improvements

Potential enhancements to consider:

- [ ] Add code quality checks (SonarQube, CodeClimate)
- [ ] Integrate Lighthouse CI for performance monitoring
- [ ] Add visual regression testing
- [ ] Set up staging environment
- [ ] Add automated dependency updates (Dependabot)
- [ ] Implement semantic versioning and releases
- [ ] Add performance budgets
- [ ] Set up error monitoring (Sentry)

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Vitest CI Documentation](https://vitest.dev/guide/ci.html)

---

**Need help?** Check the GitHub Actions logs or create an issue in the repository.
