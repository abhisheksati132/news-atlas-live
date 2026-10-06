# Untrusted input and browser policy

## Output and URLs

Trace untrusted data to its actual sink. Framework text escaping does not automatically make raw HTML, inline scripts, URL schemes, or CSS values safe. Prefer text/DOM APIs for plain text and an established, context-appropriate sanitizer for permitted rich HTML. Do not invent a regex sanitizer. [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

Validate intended protocols and destinations for redirects and links. Where the server fetches user-influenced URLs, inspect destination restrictions and redirect/DNS handling using the framework's supported approach. Do not test access to internal services without a controlled fixture. [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Uploads and served files

Check authorization, size/resource limits, actual content handling, generated storage names, and download/serving behavior. Client filenames and MIME claims are untrusted. Keep active content from executing under the application's trusted origin unless that behavior is deliberately secured. Check archive extraction boundaries when archives are accepted. [OWASP file uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## Browser policy

Treat CSP as an additional control, not a replacement for safe output handling. Derive allowed sources and nonce/hash handling from the application and delivery path. Consider report-only rollout when appropriate, then verify the enforced policy against legitimate scripts, styles, workers, frames, and connections. Do not silence violations with broad exceptions. [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).

Review HTTPS, cookie policy, framing, and MIME handling in context. Source maps are not automatically a vulnerability. Inspect whether they expose secrets, sensitive source, or violate the repository's publication policy before recommending removal. Hiding client source does not protect credentials embedded in a shipped bundle.
