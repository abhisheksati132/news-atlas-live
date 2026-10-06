# Starter Templates Reference

Complete, copy-paste HTML starters. Each includes all premium patterns from the design-engineer skill — ambient gradients, glass surfaces, proper typography, hover states, responsive, accessible. Pick one, customize content, ship.

**How to use**: Copy the template. Change `--brand` color. Replace text content. Done.

All templates share the same CSS token system from the Quick Start in SKILL.md. You can mix and match sections across templates.

---

## Dashboard Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --brand: #6366f1;
      --brand-subtle: rgba(99, 102, 241, 0.1);
      --brand-glow: rgba(99, 102, 241, 0.15);
      --bg-primary: #09090b;
      --bg-surface: #18181b;
      --bg-raised: #27272a;
      --text-primary: #fafafa;
      --text-secondary: #a1a1aa;
      --text-tertiary: #71717a;
      --border: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.15);
      --success: #22c55e;
      --error: #ef4444;
      --font: 'Inter', system-ui, sans-serif;
    }

    body {
      font-family: var(--font);
      font-size: 0.9375rem;
      color: var(--text-primary);
      background: var(--bg-primary);
      -webkit-font-smoothing: antialiased;
    }

    .app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

    /* Sidebar */
    .sidebar {
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      padding: 24px 16px;
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh;
      overflow-y: auto;
    }
    .sidebar-logo { font-weight: 700; font-size: 1.125rem; padding: 0 8px 24px; }
    .sidebar-section { margin-bottom: 24px; }
    .sidebar-label {
      font-size: 0.6875rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--text-tertiary);
      padding: 0 8px; margin-bottom: 8px;
    }
    .sidebar-link {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border-radius: 8px;
      color: var(--text-secondary); text-decoration: none;
      font-size: 0.875rem; font-weight: 500;
      transition: all 0.15s ease;
    }
    .sidebar-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
    .sidebar-link.active { color: var(--brand); background: var(--brand-subtle); }
    .sidebar-avatar {
      margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px; padding: 16px 8px 0;
    }
    .sidebar-avatar img { width: 32px; height: 32px; border-radius: 50%; }

    /* Main content */
    .main { padding: 32px; }
    .main-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 32px;
    }
    .main-header h1 { font-size: 1.5rem; font-weight: 600; }

    /* Stat cards */
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 20px;
    }
    .stat-label {
      font-size: 0.75rem; font-weight: 500; text-transform: uppercase;
      letter-spacing: 0.04em; color: var(--text-tertiary); margin-bottom: 8px;
    }
    .stat-value { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; }
    .stat-trend { font-size: 0.8125rem; font-weight: 500; margin-top: 4px; }
    .stat-trend.up { color: var(--success); }
    .stat-trend.down { color: var(--error); }

    /* Content grid */
    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    .panel {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 24px;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .panel-title { font-size: 0.9375rem; font-weight: 600; }

    /* Table */
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.75rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.04em;
      color: var(--text-tertiary); padding: 10px 0; border-bottom: 1px solid var(--border);
    }
    td { padding: 12px 0; border-bottom: 1px solid var(--border); }
    tr:hover td { background: rgba(255,255,255,0.02); }
    td:last-child, th:last-child { text-align: right; }

    /* Button */
    .btn-sm {
      height: 36px; padding: 0 14px; font-size: 0.8125rem; font-weight: 500;
      font-family: inherit; border-radius: 8px; border: 1px solid var(--border-strong);
      background: transparent; color: var(--text-primary); cursor: pointer;
      transition: all 0.15s;
    }
    .btn-sm:hover { background: rgba(255,255,255,0.05); }

    @media (max-width: 1024px) {
      .stats { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .app { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .main { padding: 20px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo">Dashboard</div>
      <div class="sidebar-section">
        <div class="sidebar-label">Menu</div>
        <a href="#" class="sidebar-link active">&#9632; Overview</a>
        <a href="#" class="sidebar-link">&#9636; Analytics</a>
        <a href="#" class="sidebar-link">&#9998; Projects</a>
        <a href="#" class="sidebar-link">&#9881; Settings</a>
      </div>
      <div class="sidebar-avatar">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--brand-subtle);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;color:var(--brand);">JD</div>
        <div><div style="font-size:0.8125rem;font-weight:500;">Jane Doe</div><div style="font-size:0.75rem;color:var(--text-tertiary);">Admin</div></div>
      </div>
    </aside>
    <main class="main">
      <div class="main-header">
        <h1>Overview</h1>
        <button class="btn-sm">Export</button>
      </div>
      <div class="stats">
        <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value">$45,231</div><div class="stat-trend up">+20.1%</div></div>
        <div class="stat-card"><div class="stat-label">Users</div><div class="stat-value">2,350</div><div class="stat-trend up">+180</div></div>
        <div class="stat-card"><div class="stat-label">Orders</div><div class="stat-value">12,234</div><div class="stat-trend up">+19%</div></div>
        <div class="stat-card"><div class="stat-label">Conversion</div><div class="stat-value">3.2%</div><div class="stat-trend down">-0.4%</div></div>
      </div>
      <div class="content-grid">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Recent Orders</span><button class="btn-sm">View all</button></div>
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>#3210</td><td>Olivia Martin</td><td><span style="color:var(--success)">Completed</span></td><td>$316.00</td></tr>
              <tr><td>#3209</td><td>Jackson Lee</td><td><span style="color:var(--success)">Completed</span></td><td>$242.00</td></tr>
              <tr><td>#3208</td><td>Isabella Nguyen</td><td><span style="color:var(--text-tertiary)">Pending</span></td><td>$837.00</td></tr>
              <tr><td>#3207</td><td>William Kim</td><td><span style="color:var(--success)">Completed</span></td><td>$721.00</td></tr>
            </tbody>
          </table>
        </div>
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Activity</span></div>
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;gap:12px;align-items:start;"><div style="width:8px;height:8px;border-radius:50%;background:var(--brand);margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:0.8125rem;">New user registered</div><div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:2px;">2 min ago</div></div></div>
            <div style="display:flex;gap:12px;align-items:start;"><div style="width:8px;height:8px;border-radius:50%;background:var(--success);margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:0.8125rem;">Order #3210 completed</div><div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:2px;">15 min ago</div></div></div>
            <div style="display:flex;gap:12px;align-items:start;"><div style="width:8px;height:8px;border-radius:50%;background:var(--text-tertiary);margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:0.8125rem;">Server update deployed</div><div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:2px;">1 hr ago</div></div></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

---

## Contact Form Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --brand: #6366f1; --brand-subtle: rgba(99,102,241,0.1); --brand-glow: rgba(99,102,241,0.15);
      --bg-primary: #09090b; --bg-surface: #18181b;
      --text-primary: #fafafa; --text-secondary: #a1a1aa; --text-tertiary: #71717a;
      --border: rgba(255,255,255,0.08); --border-strong: rgba(255,255,255,0.15);
      --font: 'Inter', system-ui, sans-serif;
    }
    body {
      font-family: var(--font); color: var(--text-primary);
      background: var(--bg-primary);
      background-image: radial-gradient(ellipse 80% 50% at 50% -20%, var(--brand-glow), transparent);
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 48px 24px;
      -webkit-font-smoothing: antialiased;
    }
    .form-card {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 40px; max-width: 480px; width: 100%;
      box-shadow: 0 24px 48px rgba(0,0,0,0.3);
    }
    .form-card h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
    .form-card p { color: var(--text-secondary); font-size: 0.9375rem; margin-bottom: 32px; }
    .field { margin-bottom: 20px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
    input, textarea {
      width: 100%; height: 48px; padding: 0 16px; font-size: 0.9375rem; font-family: inherit;
      color: var(--text-primary); background: var(--bg-primary);
      border: 1px solid var(--border); border-radius: 10px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, textarea:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-subtle); }
    textarea { height: 120px; padding: 14px 16px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      width: 100%; height: 56px; font-size: 1rem; font-weight: 600; font-family: inherit;
      color: #fff; background: linear-gradient(135deg, var(--brand), #8b5cf6);
      border: none; border-radius: 14px; cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 1px 2px rgba(0,0,0,0.08); margin-top: 8px;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--brand-glow); }
    .btn-primary:active { transform: translateY(0) scale(0.98); transition-duration: 0.1s; }
    .btn-primary:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand); }

    @media (max-width: 640px) {
      .row { grid-template-columns: 1fr; }
      .form-card { padding: 28px 20px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition-duration: 0.01ms !important; }
    }
  </style>
</head>
<body>
  <div class="form-card">
    <h1>Get in touch</h1>
    <p>We'd love to hear from you. Fill out the form below and we'll respond within 24 hours.</p>
    <form>
      <div class="row">
        <div class="field"><label for="first">First name</label><input id="first" type="text" required></div>
        <div class="field"><label for="last">Last name</label><input id="last" type="text" required></div>
      </div>
      <div class="field"><label for="email">Email</label><input id="email" type="email" required></div>
      <div class="field"><label for="msg">Message</label><textarea id="msg" required></textarea></div>
      <button type="submit" class="btn-primary">Send message &rarr;</button>
    </form>
  </div>
</body>
</html>
```

---

## Pricing Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --brand: #6366f1; --brand-subtle: rgba(99,102,241,0.1); --brand-glow: rgba(99,102,241,0.15);
      --bg-primary: #09090b; --bg-surface: #18181b; --bg-raised: #27272a;
      --text-primary: #fafafa; --text-secondary: #a1a1aa; --text-tertiary: #71717a;
      --border: rgba(255,255,255,0.08); --border-strong: rgba(255,255,255,0.15);
      --font: 'Inter', system-ui, sans-serif;
    }
    body {
      font-family: var(--font); color: var(--text-primary); background: var(--bg-primary);
      background-image: radial-gradient(ellipse 80% 50% at 50% -20%, var(--brand-glow), transparent);
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
    .pricing-header { text-align: center; padding: 96px 0 48px; }
    .pricing-header h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.03em; }
    .pricing-header p { color: var(--text-secondary); margin-top: 12px; font-size: 1.125rem; }

    /* Toggle */
    .toggle-group {
      display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 32px;
    }
    .toggle-label { font-size: 0.875rem; color: var(--text-secondary); }
    .toggle-label.active { color: var(--text-primary); font-weight: 500; }
    .toggle-pill {
      width: 48px; height: 28px; border-radius: 9999px;
      background: var(--bg-raised); border: 1px solid var(--border);
      position: relative; cursor: pointer; transition: background 0.2s;
    }
    .toggle-pill.on { background: var(--brand); border-color: var(--brand); }
    .toggle-pill::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--text-primary); transition: transform 0.2s;
    }
    .toggle-pill.on::after { transform: translateX(20px); background: #fff; }
    .save-badge {
      font-size: 0.75rem; font-weight: 600; padding: 2px 8px;
      background: var(--brand-subtle); color: var(--brand);
      border-radius: 9999px;
    }

    /* Cards */
    .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 0 0 96px; }
    .pricing-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px; display: flex; flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }

    /* Featured card */
    .pricing-card.featured {
      border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.05);
      position: relative;
    }
    .pricing-card.featured::before {
      content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
    }
    .popular-badge {
      font-size: 0.75rem; font-weight: 600; padding: 4px 12px;
      background: var(--brand); color: #fff; border-radius: 9999px;
      display: inline-block; margin-bottom: 16px; width: fit-content;
    }

    .plan-name { font-size: 1.125rem; font-weight: 600; margin-bottom: 4px; }
    .plan-desc { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 20px; }
    .plan-price { font-size: 3rem; font-weight: 800; letter-spacing: -0.03em; }
    .plan-price span { font-size: 1rem; font-weight: 400; color: var(--text-tertiary); }
    .plan-features { list-style: none; margin: 24px 0; flex: 1; }
    .plan-features li {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; font-size: 0.875rem; color: var(--text-secondary);
    }
    .plan-features li::before { content: '✓'; color: var(--brand); font-weight: 700; }

    .btn-primary {
      display: flex; align-items: center; justify-content: center;
      height: 48px; font-size: 0.9375rem; font-weight: 600; font-family: inherit;
      color: #fff; background: linear-gradient(135deg, var(--brand), #8b5cf6);
      border: none; border-radius: 12px; cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--brand-glow); }
    .btn-secondary {
      display: flex; align-items: center; justify-content: center;
      height: 48px; font-size: 0.9375rem; font-weight: 500; font-family: inherit;
      color: var(--text-primary); background: transparent;
      border: 1px solid var(--border-strong); border-radius: 12px; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); }

    @media (max-width: 1024px) { .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="pricing-header">
      <h1>Simple, transparent pricing</h1>
      <p>Choose the plan that fits your needs. Upgrade or downgrade anytime.</p>
      <div class="toggle-group">
        <span class="toggle-label active">Monthly</span>
        <div class="toggle-pill" onclick="this.classList.toggle('on')"></div>
        <span class="toggle-label">Annual</span>
        <span class="save-badge">Save 20%</span>
      </div>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="plan-name">Free</div>
        <div class="plan-desc">For individuals getting started</div>
        <div class="plan-price">$0<span>/mo</span></div>
        <ul class="plan-features">
          <li>Up to 3 projects</li>
          <li>Basic analytics</li>
          <li>Community support</li>
        </ul>
        <button class="btn-secondary">Get started free</button>
      </div>
      <div class="pricing-card featured">
        <div class="popular-badge">Most Popular</div>
        <div class="plan-name">Pro</div>
        <div class="plan-desc">For growing teams</div>
        <div class="plan-price">$29<span>/mo</span></div>
        <ul class="plan-features">
          <li>Unlimited projects</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
          <li>Custom domains</li>
          <li>Team collaboration</li>
        </ul>
        <button class="btn-primary">Upgrade to Pro &rarr;</button>
      </div>
      <div class="pricing-card">
        <div class="plan-name">Enterprise</div>
        <div class="plan-desc">For large organizations</div>
        <div class="plan-price">$99<span>/mo</span></div>
        <ul class="plan-features">
          <li>Everything in Pro</li>
          <li>SSO & SAML</li>
          <li>Dedicated support</li>
          <li>Custom integrations</li>
          <li>SLA guarantee</li>
        </ul>
        <button class="btn-secondary">Contact sales</button>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## Auth Page Template (Login)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --brand: #6366f1; --brand-subtle: rgba(99,102,241,0.1); --brand-glow: rgba(99,102,241,0.15);
      --bg-primary: #09090b; --bg-surface: #18181b;
      --text-primary: #fafafa; --text-secondary: #a1a1aa; --text-tertiary: #71717a;
      --border: rgba(255,255,255,0.08); --border-strong: rgba(255,255,255,0.15);
      --font: 'Inter', system-ui, sans-serif;
    }
    body {
      font-family: var(--font); color: var(--text-primary);
      background: var(--bg-primary);
      min-height: 100vh; display: flex;
      -webkit-font-smoothing: antialiased;
    }
    /* Left side — brand art */
    .auth-art {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--brand), #8b5cf6);
      position: relative; overflow: hidden;
    }
    .auth-art::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1), transparent 60%);
    }
    .auth-art-content { position: relative; z-index: 1; color: #fff; padding: 48px; max-width: 480px; }
    .auth-art-content h2 { font-size: 2rem; font-weight: 700; margin-bottom: 12px; }
    .auth-art-content p { opacity: 0.85; font-size: 1.0625rem; line-height: 1.6; }

    /* Right side — form */
    .auth-form-side {
      flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px;
    }
    .auth-card { max-width: 400px; width: 100%; }
    .auth-logo { font-weight: 700; font-size: 1.25rem; margin-bottom: 32px; }
    .auth-card h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .auth-card .subtitle { color: var(--text-secondary); margin-bottom: 32px; }

    .field { margin-bottom: 20px; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
    input {
      width: 100%; height: 48px; padding: 0 16px; font-size: 0.9375rem; font-family: inherit;
      color: var(--text-primary); background: var(--bg-surface);
      border: 1px solid var(--border); border-radius: 10px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-subtle); }

    .field-row { display: flex; justify-content: space-between; align-items: center; }
    .forgot { font-size: 0.8125rem; color: var(--brand); text-decoration: none; }
    .forgot:hover { text-decoration: underline; }

    .btn-primary {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 56px; font-size: 1rem; font-weight: 600; font-family: inherit;
      color: #fff; background: linear-gradient(135deg, var(--brand), #8b5cf6);
      border: none; border-radius: 14px; cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      margin-top: 8px;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--brand-glow); }

    .divider {
      display: flex; align-items: center; gap: 16px; margin: 24px 0;
      color: var(--text-tertiary); font-size: 0.8125rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    .btn-social {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; height: 48px; font-size: 0.9375rem; font-weight: 500; font-family: inherit;
      color: var(--text-primary); background: transparent;
      border: 1px solid var(--border-strong); border-radius: 12px; cursor: pointer;
      transition: all 0.2s; margin-bottom: 12px;
    }
    .btn-social:hover { background: rgba(255,255,255,0.05); }

    .auth-footer { text-align: center; margin-top: 24px; font-size: 0.875rem; color: var(--text-secondary); }
    .auth-footer a { color: var(--brand); text-decoration: none; font-weight: 500; }
    .auth-footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .auth-art { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition-duration: 0.01ms !important; }
    }
  </style>
</head>
<body>
  <div class="auth-art">
    <div class="auth-art-content">
      <h2>Build something amazing</h2>
      <p>Join thousands of teams shipping faster with our platform. Start building today.</p>
    </div>
  </div>
  <div class="auth-form-side">
    <div class="auth-card">
      <div class="auth-logo">Brand</div>
      <h1>Welcome back</h1>
      <p class="subtitle">Sign in to your account to continue</p>
      <form>
        <div class="field"><label for="email">Email</label><input id="email" type="email" placeholder="you@company.com" required></div>
        <div class="field">
          <div class="field-row"><label for="pass">Password</label><a href="#" class="forgot">Forgot?</a></div>
          <input id="pass" type="password" required>
        </div>
        <button type="submit" class="btn-primary">Sign in &rarr;</button>
      </form>
      <div class="divider">or</div>
      <button class="btn-social">Continue with Google</button>
      <button class="btn-social">Continue with GitHub</button>
      <div class="auth-footer">Don't have an account? <a href="#">Sign up</a></div>
    </div>
  </div>
</body>
</html>
```

---

## 404 Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --brand: #6366f1; --brand-subtle: rgba(99,102,241,0.1); --brand-glow: rgba(99,102,241,0.15);
      --bg-primary: #09090b; --text-primary: #fafafa; --text-secondary: #a1a1aa;
      --border-strong: rgba(255,255,255,0.15);
    }
    body {
      font-family: 'Inter', system-ui, sans-serif; color: var(--text-primary);
      background: var(--bg-primary);
      background-image: radial-gradient(ellipse 80% 50% at 50% -20%, var(--brand-glow), transparent);
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 48px 24px;
      -webkit-font-smoothing: antialiased;
    }
    .error-code {
      font-size: clamp(6rem, 15vw, 12rem); font-weight: 800;
      letter-spacing: -0.05em; line-height: 1;
      background: linear-gradient(180deg, #fafafa 0%, rgba(250,250,250,0.2) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 16px 0 8px; }
    p { color: var(--text-secondary); font-size: 1.0625rem; max-width: 400px; margin: 0 auto 32px; }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center;
      height: 48px; padding: 0 28px; font-size: 0.9375rem; font-weight: 600; font-family: inherit;
      color: #fff; background: linear-gradient(135deg, var(--brand), #8b5cf6);
      border: none; border-radius: 12px; cursor: pointer; text-decoration: none;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--brand-glow); }
    .btn-secondary {
      display: inline-flex; align-items: center; height: 48px; padding: 0 24px;
      font-size: 0.9375rem; font-weight: 500; font-family: inherit;
      color: var(--text-primary); background: transparent;
      border: 1px solid var(--border-strong); border-radius: 12px;
      cursor: pointer; text-decoration: none; transition: all 0.2s; margin-left: 12px;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div>
    <div class="error-code">404</div>
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
    <div>
      <a href="/" class="btn-primary">Go home &rarr;</a>
      <a href="#" class="btn-secondary">Contact support</a>
    </div>
  </div>
</body>
</html>
```

---

## Light Theme Variant

To convert any dark template to light, add `class="light"` to `<html>` and change the token block:

```css
:root {
  --brand: #6366f1;
  --brand-subtle: rgba(99, 102, 241, 0.08);
  --brand-glow: rgba(99, 102, 241, 0.06);
  --bg-primary: #fafafa;
  --bg-surface: #ffffff;
  --bg-raised: #f4f4f5;
  --text-primary: #18181b;
  --text-secondary: #71717a;
  --text-tertiary: #a1a1aa;
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
}
body {
  background-image: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.04), transparent);
}
```

Cards should use `box-shadow` for elevation instead of glass effects:
```css
.card {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
```
