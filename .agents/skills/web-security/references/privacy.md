# Privacy in application flows

Use for scoped changes to telemetry, browser storage, third-party requests, or
handling of personal data. Map the data from collection through transfer,
retention, access, and deletion. Security controls and privacy purpose are separate:
encrypted data can still be unnecessary data. Consult the
[W3C Privacy Principles](https://www.w3.org/TR/privacy-principles/) and
[NIST Privacy Framework](https://www.nist.gov/privacy-framework) for engineering
guidance, not an automatic legal-compliance claim.

Keep each collected field tied to a product purpose. Prefer aggregate or coarse
signals when they answer the question. Avoid copying user text, full URLs/query
strings, credentials, or sensitive DOM into logs, traces, replay, or screenshots.
Redact before transmission and reuse existing telemetry controls. A hashed stable
identifier can remain linkable; do not call it anonymous without evidence.

Inspect third-party requests and client caches in the relevant permission or
consent states. Follow the application's actual policy; do not prescribe a banner
for every site or interpret a browser permission as consent for unrelated uses.
Changes to collection purpose, vendors, or production retention need the authority
for that change. A diagnostic task alone does not authorize exporting real data.

Scope cached and persisted state to the correct user/tenant. Test logout, account
switch, shared-device use, expiry, and deletion where supported. Define what is
retained in backups or downstream systems rather than claiming immediate global
erasure from a UI event. Do not store credentials or sensitive drafts merely to
make an offline feature convenient.

Use synthetic data and redacted evidence. Record observed requests, storage,
access boundaries, and retention/deletion behavior; separate local evidence from
unverified production behavior. Use
[publication auditing](../../sensitive-info-audit/SKILL.md) for shared artifacts
and [RUM guidance](../../performance/references/RUM.md) for performance telemetry.
