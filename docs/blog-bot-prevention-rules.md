# Blog Bot Prevention Rules

**Rules learned from past failures to prevent future incidents.**

---

## Rule 1: Author Identity — Zach Olinske

**Category:** metadata-identity  
**Severity:** critical  
**Triggered By:** Any reference to blog author, domain, or personal identity

### Correct Forms
- Author name: **Zach Olinske** (with 'e' at end)
- Domain: **zach.olinske.com** (with 'e')
- Repository owner: **FallenHoot** (GitHub)
- Repository names: **olinske-editorial**, **olinske** (public)

### Incorrect Forms (NEVER use)
- ❌ "Zach Olinski" (with 'i' — NOT the author's name)
- ❌ "zach.olinski.com" (wrong domain)
- ❌ "olinski-editorial" (wrong repo name)
- ❌ References to other people's names when discussing the author

### Where This Appears
- Frontmatter `author:` field in published posts
- Blog metadata and configuration files
- Git commit messages when publishing
- Domain references in URLs and deployment contexts
- Any documentation referring to the blog owner

### Validation Checklist
Before any publish operation:
1. ✅ Verify frontmatter has `author: "Zach Olinske"`
2. ✅ Check all domain references use `.olinske.com`
3. ✅ Confirm repository names are `olinske-*`
4. ✅ Review commit messages for correct spelling

### Root Cause
Bot was using incorrect spelling in multiple contexts, likely from copying patterns without validation against source of truth (user correction messages).

### Prevention
- Store author identity as constant/config
- Validate against whitelist before generating content
- Add pre-publish check for author field accuracy
- Include in all pre-deployment validation gates

---

## Incident Log Template

When adding new prevention rules, create an entry:

```json
{
  "timestamp": "ISO8601 date",
  "slug": "article slug or N/A",
  "stage": "where failure occurred",
  "error": "what went wrong",
  "rootCause": "why it happened",
  "resolution": "how it was fixed",
  "preventionRule": "what we learned",
  "category": "category name",
  "severity": "critical|high|medium|low"
}
```
