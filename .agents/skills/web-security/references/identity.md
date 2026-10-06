# Identity, authorization, and sessions

## Authorization

Enforce access for every protected operation using the authenticated principal and authoritative resource ownership. Prefer deny-by-default policy and checks close to the data/service boundary. Test horizontal access between users as well as vertical access between roles. Scope database queries or equivalent resource lookups to the correct tenant, including child resources and bulk operations. [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Inspect who can assign privileged fields, roles, or ownership. An authenticated request is not authority to set any field in its body. Avoid trusting a user/tenant ID supplied by the client when it should come from the session or a verified authorization decision.

## Session lifecycle

Use the existing supported authentication/session library. Check session creation, rotation at privilege changes, expiry, revocation, and logout. Verify cookie scope and appropriate `Secure`, `HttpOnly`, and `SameSite` behavior without breaking intended identity-provider flows. Do not log session identifiers or place them in URLs. [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

Review shared caches, browser history, service workers, and application query caches for account data crossing a logout or identity switch. Confirm the intended response cache policy through the deployed path. Do not use a client cache clear as a substitute for server authorization.

## CSRF and cross-origin requests

Identify whether credentials are attached automatically, such as cookies, and which operations change state. Keep mutations out of safe navigation methods. Use the framework's CSRF mechanism and verify token/origin handling for the actual deployment. SameSite cookies are useful defense in depth, not a universal replacement for CSRF analysis. [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

CORS governs browser cross-origin access, not caller authorization. Keep allowed origins and credential behavior aligned with intended clients. Do not assume a request is trustworthy because it contains a custom header or came from the UI. Test legitimate cross-origin authentication flows as well as rejection paths.
