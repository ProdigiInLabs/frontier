/** Shared Chromium launcher for build-time tooling (brand assets, a11y audit). */
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

export function launch() {
  const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);
  const executablePath = candidates.find((path) => existsSync(path));
  return chromium.launch(executablePath ? { executablePath } : {});
}
