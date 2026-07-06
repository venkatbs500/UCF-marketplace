#!/usr/bin/env node

import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "../src/app");

const requiredRoutes = [
  "page.tsx",
  "marketplace/page.tsx",
  "housing/page.tsx",
  "tutoring/page.tsx",
  "jobs/page.tsx",
  "events/page.tsx",
  "ai/page.tsx",
  "lost-found/page.tsx",
  "discounts/page.tsx",
  "sign-in/page.tsx",
  "verify/page.tsx",
  "onboarding/page.tsx",
  "sell/page.tsx",
  "messages/page.tsx",
  "profile/page.tsx",
  "admin/page.tsx",
  "qa/page.tsx",
];

const optionalRoutes = [
  "marketplace/[listingId]/page.tsx",
  "sellers/[sellerId]/page.tsx",
  "saved/page.tsx",
  "housing/new/page.tsx",
  "housing/[housingId]/page.tsx",
  "housing/[housingId]/edit/page.tsx",
  "tutoring/new/page.tsx",
  "tutoring/[tutorId]/page.tsx",
  "tutoring/[tutorId]/edit/page.tsx",
  "lost-found/new/page.tsx",
  "lost-found/[itemId]/page.tsx",
  "lost-found/[itemId]/edit/page.tsx",
  "jobs/new/page.tsx",
  "jobs/[jobId]/page.tsx",
  "jobs/[jobId]/edit/page.tsx",
  "events/new/page.tsx",
  "events/[eventId]/page.tsx",
  "events/[eventId]/edit/page.tsx",
  "discounts/new/page.tsx",
  "discounts/[discountId]/page.tsx",
  "discounts/[discountId]/edit/page.tsx",
  "sell/preview/page.tsx",
  "dev/error-demo/page.tsx",
];

async function routeExists(routePath) {
  try {
    await access(path.join(appDir, routePath));
    return true;
  } catch {
    return false;
  }
}

let missingRequired = 0;

console.log("Knight Market route smoke check\n");

console.log("Required routes:");
for (const route of requiredRoutes) {
  const exists = await routeExists(route);
  if (exists) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`❌ ${route}`);
    missingRequired += 1;
  }
}

console.log("\nOptional routes:");
for (const route of optionalRoutes) {
  const exists = await routeExists(route);
  if (exists) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`⚠️  ${route}`);
  }
}

console.log("");

if (missingRequired > 0) {
  console.error(`Smoke check failed: ${missingRequired} required route(s) missing.`);
  process.exit(1);
}

console.log("Smoke check passed.");
process.exit(0);
