/**
 * Helper for generic wait and retry logic
 */
export async function waitForCondition(
  condition,
  timeout = 5000,
  interval = 250
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`waitForCondition: Timeout after ${timeout}ms`);
}
