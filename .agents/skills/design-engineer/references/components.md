# Components Reference

Complete CSS patterns for common UI components. Every component follows the design-engineer principles: glass surfaces, rounded corners, proper spacing, hover/focus states.

## Modal / Dialog

```css
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
  animation: fadeIn 0.2s ease;
}

/* Modal body */
.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  max-width: 520px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; }
.modal p { color: var(--text-secondary); font-size: 0.9375rem; margin-bottom: 24px; }
.modal-actions {
  display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;
}

/* Close button (top-right) */
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 8px;
  color: var(--text-tertiary); cursor: pointer;
  transition: all 0.15s ease;
}
.modal-close:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
```

**Accessibility**: Modal must trap focus. Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Close on Escape. Return focus to trigger on close.

## Toast / Notification

```css
.toast-container {
  position: fixed;
  bottom: 24px; right: 24px;
  display: flex; flex-direction: column;
  gap: 8px; z-index: 60;
}

.toast {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-size: 0.875rem;
  color: var(--text-primary);
  min-width: 320px;
  max-width: 480px;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-success { border-left: 3px solid var(--success); }
.toast-error   { border-left: 3px solid var(--error); }
.toast-warning { border-left: 3px solid var(--warning); }
.toast-info    { border-left: 3px solid var(--info); }

.toast-dismiss {
  margin-left: auto;
  background: none; border: none;
  color: var(--text-tertiary); cursor: pointer;
  padding: 4px;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
```

## Tabs

```css
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding: 0 4px;
}
.tab {
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;
}
.tab:hover { color: var(--text-primary); }
.tab.active {
  color: var(--brand);
  border-bottom-color: var(--brand);
}

.tab-panel { padding: 24px 0; }
.tab-panel[hidden] { display: none; }
```

**Accessibility**: Use `role="tablist"`, `role="tab"`, `role="tabpanel"`. Arrow keys navigate tabs. `aria-selected="true"` on active.

## Accordion / Collapsible

```css
.accordion { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
.accordion-item + .accordion-item { border-top: 1px solid var(--border); }

.accordion-trigger {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: transparent;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}
.accordion-trigger:hover { background: rgba(255,255,255,0.03); }
.light .accordion-trigger:hover { background: #f9fafb; }

.accordion-trigger svg {
  width: 16px; height: 16px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}
.accordion-trigger[aria-expanded="true"] svg { transform: rotate(180deg); }

.accordion-content {
  padding: 0 20px 16px;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
```

## Dropdown / Select Menu

```css
.dropdown { position: relative; }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 200px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 20;
  animation: dropdownOpen 0.15s ease;
}

.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s ease;
}
.dropdown-item:hover {
  background: var(--brand-subtle);
  color: var(--text-primary);
}
.dropdown-item.active {
  background: var(--brand-subtle);
  color: var(--brand);
  font-weight: 500;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

@keyframes dropdownOpen {
  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

## Tooltip

```css
/* Pure CSS tooltip — no JS needed */
[data-tooltip] {
  position: relative;
  cursor: help;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  color: var(--text-primary);
  background: var(--bg-raised);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  z-index: 70;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease;
}
[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
```

## Skeleton Loader

Use instead of spinners. Shimmer animation on placeholder shapes that match the content layout.

```css
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-raised) 25%,
    rgba(255,255,255,0.06) 50%,
    var(--bg-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
.skeleton-text { height: 16px; margin-bottom: 8px; }
.skeleton-text:last-child { width: 60%; }
.skeleton-title { height: 24px; width: 40%; margin-bottom: 16px; }
.skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; }
.skeleton-image { width: 100%; aspect-ratio: 16/9; }
.skeleton-btn { height: 48px; width: 140px; border-radius: 12px; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.light .skeleton {
  background: linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 50%, #f4f4f5 75%);
  background-size: 200% 100%;
}
```

## Progress Bar

```css
.progress { height: 8px; background: var(--bg-raised); border-radius: 999px; overflow: hidden; }
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--brand), #8b5cf6);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* With label */
.progress-labeled {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.progress-label { font-size: 0.875rem; font-weight: 500; }
.progress-value { font-size: 0.875rem; color: var(--text-secondary); }
```

## Avatar Group

```css
.avatar-group {
  display: flex;
}
.avatar-group .avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
  object-fit: cover;
  margin-left: -10px;
}
.avatar-group .avatar:first-child { margin-left: 0; }
.avatar-group .avatar-count {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--bg-raised);
  border: 2px solid var(--bg-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 600;
  color: var(--text-secondary);
  margin-left: -10px;
}
```

## Breadcrumb

```css
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.875rem;
}
.breadcrumb a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}
.breadcrumb a:hover { color: var(--text-primary); }
.breadcrumb-separator { color: var(--text-tertiary); font-size: 0.75rem; }
.breadcrumb-current { color: var(--text-primary); font-weight: 500; }
```

## Pagination

```css
.pagination {
  display: flex; align-items: center; gap: 4px;
}
.page-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.page-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary); }
.page-btn.active {
  background: var(--brand-subtle);
  color: var(--brand);
  border-color: var(--brand);
  font-weight: 600;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
```

## Tag / Chip / Badge

```css
/* Standard badge */
.badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px;
  font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 9999px;
}
.badge-primary { background: var(--brand-subtle); color: var(--brand); }
.badge-success { background: var(--success-subtle); color: var(--success); }
.badge-warning { background: var(--warning-subtle); color: var(--warning); }
.badge-error   { background: var(--error-subtle); color: var(--error); }
.badge-neutral { background: var(--bg-raised); color: var(--text-secondary); }

/* Removable tag */
.tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  font-size: 0.8125rem;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
}
.tag-remove {
  width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer;
  color: var(--text-tertiary); border-radius: 4px;
  transition: all 0.1s;
}
.tag-remove:hover { background: var(--error-subtle); color: var(--error); }
```

## Toggle / Switch

```css
.toggle {
  position: relative;
  width: 48px; height: 28px;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
}
.toggle::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  background: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
}
.toggle:checked {
  background: var(--brand);
  border-color: var(--brand);
}
.toggle:checked::after {
  transform: translateX(20px);
  background: #ffffff;
}
.toggle:focus-visible {
  box-shadow: 0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand);
}
```

## Empty State

```css
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 64px 24px;
}
.empty-state-icon {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: var(--brand-subtle);
  display: flex; align-items: center; justify-content: center;
  color: var(--brand); font-size: 1.5rem;
  margin-bottom: 20px;
}
.empty-state h3 { font-size: 1.125rem; margin-bottom: 8px; }
.empty-state p { color: var(--text-secondary); max-width: 360px; margin-bottom: 24px; }
/* Always include an action button — never leave users stranded */
```

## Alert / Callout

```css
.alert {
  display: flex; gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}
.alert-icon { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }
.alert-success { background: var(--success-subtle); border: 1px solid var(--success-border); color: var(--success-text); }
.alert-error   { background: var(--error-subtle); border: 1px solid var(--error-border); color: var(--error-text); }
.alert-warning { background: var(--warning-subtle); border: 1px solid var(--warning-border); color: var(--warning-text); }
.alert-info    { background: var(--info-subtle); border: 1px solid var(--info-border); color: var(--info-text); }
```

## Stat Card (Dashboard)

```css
.stat-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
}
.stat-label {
  font-size: 0.75rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}
.stat-value {
  font-size: 2rem; font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.stat-trend {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.8125rem; font-weight: 500;
  margin-top: 8px;
}
.stat-trend.up { color: var(--success); }
.stat-trend.down { color: var(--error); }
```
