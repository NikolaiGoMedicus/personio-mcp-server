# Personio MCP Server - Rollout Plan

**Version**: 1.0.0
**Date**: 2026-03-05
**Status**: Ready to Publish

---

## 📦 What's Ready

### Package Features
- ✅ 52 HR automation tools (Employees, Absences, Attendance, Recruiting, Documents, Approvals)
- ✅ Comprehensive 31-test suite
- ✅ OAuth2 authentication with auto-refresh
- ✅ CSV export capabilities
- ✅ V1 + V2 API support

### Distribution Setup
- ✅ NPM package configuration complete
- ✅ Interactive setup wizard (`personio-mcp-setup`)
- ✅ Post-install instructions
- ✅ Cross-platform support (macOS, Windows, Linux)
- ✅ Documentation (README + CLAUDE.md)

---

## 🎯 Rollout Options

### Option 1: GitHub Packages (Recommended for Internal Use)

**Pros:**
- ✅ Free for private organization packages
- ✅ Access control via GitHub Teams
- ✅ Already hosted on GitHub
- ✅ No additional cost

**Cons:**
- ⚠️ Requires GitHub authentication for npm install
- ⚠️ Team members need `.npmrc` configuration

**Setup:**
```bash
# 1. Authenticate to GitHub Packages
npm login --registry=https://npm.pkg.github.com

# 2. Publish
npm publish --registry=https://npm.pkg.github.com
```

**Team Installation:**
```bash
# One-time: Configure npm for GitHub Packages
echo "@gomedicus:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Install
npm install -g @gomedicus/personio-mcp-server
personio-mcp-setup
```

---

### Option 2: NPM Registry (Standard)

**Pros:**
- ✅ Standard npm workflow
- ✅ No additional configuration for users
- ✅ Familiar for all developers

**Cons:**
- ❌ $7/month for private packages
- ❌ Need to manage npm organization

**Setup:**
```bash
# 1. Login to npm
npm login

# 2. Publish
npm publish --access restricted  # private package
# OR
npm publish --access public      # public package
```

**Team Installation:**
```bash
npm install -g @gomedicus/personio-mcp-server
personio-mcp-setup
```

---

## 📋 Publishing Checklist

### Pre-Publish
- [x] Version set to 1.0.0
- [x] `private: false` in package.json
- [x] `.npmignore` configured
- [x] README documentation complete
- [x] Setup wizard tested locally
- [ ] Security audit: `npm audit`
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] GitHub repository up to date

### Publish
- [ ] Decide: GitHub Packages or NPM Registry
- [ ] Authenticate to chosen registry
- [ ] `npm publish` (with correct flags)
- [ ] Verify package is accessible
- [ ] Test installation from registry

### Post-Publish
- [ ] Update Notion AI Org page with installation instructions
- [ ] Send announcement to team (Slack #ai-workflows)
- [ ] Document in GoMedicus internal wiki
- [ ] Setup GitHub Actions for automated releases (optional)

---

## 👥 Team Rollout Strategy

### Phase 1: Pilot Users (Week 1)
**Target**: Philipp, Sebastian L., Arved (3 people with HR/data needs)

**Process:**
1. Send installation instructions via Slack DM
2. Schedule 15-min setup call if needed
3. Collect feedback on installation experience
4. Monitor for issues

### Phase 2: Early Adopters (Week 2)
**Target**: Alice, Basti, Florian (existing Claude users)

**Process:**
1. Share in AI Office Hours
2. Provide installation link in #ai-workflows
3. Async support via Slack

### Phase 3: Full Rollout (Week 3+)
**Target**: All Claude users at GoMedicus

**Process:**
1. Add to onboarding documentation
2. Include in AI Org training materials
3. Self-service installation

---

## 📖 Documentation Locations

After publishing, update these locations:

### 1. Notion AI Org Page
**Section**: 🎯 AI Outputs & Tools

**Update**: Add installation instructions
```markdown
### Personio MCP Server installieren

```bash
npm install -g @gomedicus/personio-mcp-server
personio-mcp-setup
```

Nach Installation Claude Desktop neustarten.

**GitHub**: https://github.com/NikolaiGoMedicus/personio-mcp-server
```

### 2. Slack #ai-workflows
**Announcement Template:**
```
🚀 Personio MCP Server ist jetzt verfügbar!

52 HR-Tools direkt in Claude:
• Mitarbeiter-Suche & Export
• Abwesenheiten & Attendance
• Recruiting & Dokumente

Installation:
npm install -g @gomedicus/personio-mcp-server
personio-mcp-setup

Docs: https://github.com/NikolaiGoMedicus/personio-mcp-server

Bei Fragen: @nikolai oder in den AI Office Hours
```

### 3. Internal Wiki
Create page: "MCP Server Installation - Personio"
- Link to GitHub repository
- Installation steps
- Troubleshooting
- FAQ

---

## 🔧 Troubleshooting Guide

### Common Issues

**1. "Command not found: personio-mcp-setup"**
```bash
# Solution: Ensure global bin path is in PATH
npm config get prefix  # Should show /usr/local or similar
echo $PATH             # Should include npm global bin directory
```

**2. "Cannot find Claude config"**
```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows
%APPDATA%/Claude/claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

**3. "Authentication failed" in Claude**
```bash
# Verify credentials in Claude config
cat "~/Library/Application Support/Claude/claude_desktop_config.json"

# Check Personio API credentials are correct
# Client ID & Secret from Personio > Settings > Integrations > API
```

---

## 📊 Success Metrics

**Week 1:**
- [ ] 3 pilot users successfully installed
- [ ] 0 critical bugs reported
- [ ] Feedback collected

**Week 2:**
- [ ] 6+ users actively using
- [ ] Documentation gaps identified and filled
- [ ] 90%+ successful installations

**Month 1:**
- [ ] All Claude users have access
- [ ] Used in 10+ actual HR queries
- [ ] Positive feedback in AI Office Hours

---

## 🔄 Update Strategy

### Versioning
- **Patch** (1.0.x): Bug fixes, no breaking changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

### Release Process
1. Update version in package.json
2. Update CHANGELOG.md
3. Git tag: `git tag v1.0.1 && git push --tags`
4. Publish: `npm publish`
5. Announce in #ai-workflows

### Auto-Updates
Users update with:
```bash
npm update -g @gomedicus/personio-mcp-server
```

---

## 🆘 Support

**Primary Contact**: Nikolai (@nikolai in Slack)
**Slack Channel**: #ai-workflows
**Office Hours**: Thursdays 09:30
**GitHub Issues**: https://github.com/NikolaiGoMedicus/personio-mcp-server/issues
