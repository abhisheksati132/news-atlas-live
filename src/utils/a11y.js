export function runA11yChecks() {
  const issues = [];
  const buttons = Array.from(document.querySelectorAll('button'));
  buttons.forEach((b) => {
    const label = b.getAttribute('aria-label') || b.textContent?.trim();
    if (!label) {
      issues.push({ type: 'button-missing-label', element: b.outerHTML.slice(0, 80) + '...' });
    }
  })
  if (issues.length > 0) {
    console.warn('[a11y] Detected issues:', issues);
  } else {
    console.log('[a11y] No basic issues detected for buttons.');
  }
  return issues;
}
