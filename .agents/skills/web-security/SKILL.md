---
name: web-security
description: Audit and repair web application authentication, authorization, sessions, CSRF, XSS, uploads, privacy-sensitive data flows, and browser/server trust boundaries using repository evidence and scoped tests. Use for defensive application-security work or a concrete trust-boundary defect, not secret scanning alone or unsolicited external penetration testing.
---

# Web security

Tie security findings to an attacker-controlled input, a trust boundary, an affected asset, and a reproducible failure. Tie privacy findings to the observed data flow, collection purpose, access or retention policy, and user impact; unnecessary authorized collection can be a privacy defect without an attacker. A security-header score or a scanner pass is not proof that the application's authorization or privacy behavior is correct.

## Establish scope and evidence

Identify the routes, browser/client code, server handlers, session mechanism, data ownership, external integrations, and deployed configuration relevant to the request. Inspect the actual framework and middleware versions before applying current advice. Preserve protections already supplied by the framework.

A review request is read-only. A fix request authorizes scoped implementation and local verification. Use controlled test accounts and disposable data where execution is needed. Do not expand a source review into scanning external targets, accessing other users' data, or changing production settings without authority for those actions. Complete independent inspection before asking for missing access.

Read only the relevant reference:

- [Privacy in application flows](references/privacy.md) for telemetry, browser storage, third-party requests, and data retention.
- [Standards sources](../web-standard/references/standards-sources.md) when choosing a verification standard or resolving protocol/version claims.
- [Identity, authorization, and sessions](references/identity.md) for account/tenant boundaries, cookies, and authenticated mutations.
- [Untrusted input and browser policy](references/input-and-policy.md) for rendering, URLs, uploads, CSP, and cross-origin behavior.
- [Finding assessment and fix verification](references/finding-assessment.md)
  for supplied scanner claims, uncertain exploit paths, candidate disposition,
  or checking whether a security patch closes the original boundary.

Use `sensitive-info-audit` for publication secrets and redacted evidence. Use `triage-dependency-updates` for an actual dependency vulnerability or upgrade, rather than treating every security task as a package update.

## Review and repair

Trace enforcement on the server or trusted boundary. A hidden button, client route guard, CORS policy, or unpredictable object ID is not object-level authorization. Check both reads and mutations, including bulk operations and alternate endpoints.

State the concrete scenario and confidence before changing code. Reproduce the boundary failure using minimal permitted data. Prefer the framework's supported control over a custom sanitizer, cryptographic scheme, session mechanism, or broad regular expression. Preserve valid application flows while fixing the defect.

Keep the reported claim distinct from nearby weaknesses found during inspection.
Preserve source identifiers and give each supplied finding a disposition, even
when evidence contradicts it or remains incomplete. A failed build or missing
service blocks runtime proof; it does not disprove the vulnerability.

Keep context-specific encoding, sanitization, validation, and authorization distinct. Verify the actual output sink and request credentials. Do not solve a CSP violation by broadly allowing inline code or fix a CORS error by reflecting every origin.

## Verify the boundary

Pair positive tests for legitimate behavior with negative tests at the trusted boundary. Select the applicable cases:

- unauthenticated, expired/revoked session, and legitimate current session
- same-role users with different resource ownership, tenant separation, and role changes
- direct API requests that bypass UI checks, including alternate HTTP methods or batch routes
- hostile input in the actual HTML, attribute, URL, script, or file-serving context
- rejected cross-site mutations and allowed intended cross-origin flows
- logout/cache behavior and responses containing sensitive account data

Check the deployed headers and proxy/CDN behavior when configuration is in scope. Distinguish source evidence, local proof, and verified deployed behavior. Do not retain exploit payloads containing real secrets or personal data in public artifacts.

Report severity, affected path/endpoint, preconditions, observed impact, fix, and test evidence. Mark unverified deployment assumptions explicitly. Use `code-review` for a broader diff review. When the requested endpoint includes addressing security findings on an open PR or preparing or publishing a security release, automatically use [babysit](../babysit/SKILL.md) and return boundary-test evidence to that workflow. An audit or local fix alone does not start follow-through. Do not claim a complete penetration test or compliance certification from this workflow.
