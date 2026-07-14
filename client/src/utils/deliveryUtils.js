/**
 * deliveryUtils.js
 * Parses free-text deliveryTime strings (e.g. "3 days", "2 weeks", "1 month")
 * and computes an absolute expected delivery date from an anchor timestamp.
 */

/**
 * Parse a deliveryTime string into a number of days.
 * Supports: "N day(s)", "N week(s)", "N month(s)"
 * Falls back to 7 days if unparseable.
 */
export function parseDaysDuration(deliveryTime) {
  if (!deliveryTime) return 7;
  const str = deliveryTime.toLowerCase().trim();

  const match = str.match(/(\d+)\s*(day|week|month)/);
  if (!match) return 7;

  const num = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'day') return num;
  if (unit === 'week') return num * 7;
  if (unit === 'month') return num * 30;
  return 7;
}

/**
 * Compute the expected delivery date.
 * @param {string} deliveryTime - e.g. "3 days", "1 week"
 * @param {string|Date} acceptedAt - ISO date string or Date object of bid acceptance
 * @returns {Date} expected delivery date
 */
export function computeExpectedDelivery(deliveryTime, acceptedAt) {
  const anchor = acceptedAt ? new Date(acceptedAt) : new Date();
  const days = parseDaysDuration(deliveryTime);
  const result = new Date(anchor);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format expected delivery for display.
 * @param {string} deliveryTime
 * @param {string|Date} acceptedAt
 * @returns {string} e.g. "Expected by Mon, 21 Jul 2025"
 */
export function formatExpectedDelivery(deliveryTime, acceptedAt) {
  const date = computeExpectedDelivery(deliveryTime, acceptedAt);
  return `Expected by ${date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;
}
