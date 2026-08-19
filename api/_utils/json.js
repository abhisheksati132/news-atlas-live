/**
 * Safely extracts JSON from a string that might contain markdown or other text.
 * @param {string} input 
 * @returns {object|null}
 */
export function extractJSON(input) {
  if (typeof input !== 'string') return null;
  
  // Try direct parse first
  try {
    return JSON.parse(input);
  } catch (e) {
    // If it fails, try to find JSON block
    const match = input.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON:", innerE.message);
      }
    }
  }
  return null;
}
