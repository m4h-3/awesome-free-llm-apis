// Safe env access that works under Node and (for CI tests) Deno.

export function env(name) {
  try {
    const p = globalThis.process;
    if (p && p.env && typeof p.env[name] === 'string') return p.env[name];
  } catch { /* no process */ }
  return '';
}
