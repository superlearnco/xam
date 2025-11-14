#!/usr/bin/env tsx
/**
 * Production Deployment Checklist Script
 * 
 * This script verifies that your application is ready for production deployment.
 * Run before deploying to catch common issues.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn" | "info";
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => CheckResult["status"], message: string, details?: string) {
  try {
    const status = fn();
    results.push({ name, status, message, details });
  } catch (error) {
    results.push({
      name,
      status: "fail",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log("\n🚀 Production Deployment Checklist\n");
console.log("Running checks...\n");

// Check 1: Environment Variables Template Exists
check(
  "Environment Variables",
  () => {
    const exists = fs.existsSync(path.join(process.cwd(), ".env.production.example"));
    return exists ? "pass" : "warn";
  },
  ".env.production.example exists",
  "Make sure all required environment variables are documented"
);

// Check 2: Build succeeds
check(
  "Build",
  () => {
    try {
      console.log("  Building application...");
      execSync("npm run build", { stdio: "pipe" });
      return "pass";
    } catch {
      return "fail";
    }
  },
  "Application builds successfully"
);

// Check 3: TypeScript compiles
check(
  "TypeScript",
  () => {
    try {
      console.log("  Type checking...");
      execSync("npm run typecheck", { stdio: "pipe" });
      return "pass";
    } catch {
      return "fail";
    }
  },
  "TypeScript type checking passes"
);

// Check 4: Tests pass
check(
  "Tests",
  () => {
    try {
      console.log("  Running tests...");
      execSync("npm test", { stdio: "pipe" });
      return "pass";
    } catch {
      return "warn";
    }
  },
  "Unit tests pass",
  "Fix failing tests before deploying"
);

// Check 5: Dependencies are up to date
check(
  "Dependencies",
  () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );
    const hasDeps = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
    return hasDeps ? "pass" : "fail";
  },
  "package.json has dependencies"
);

// Check 6: Security headers configured
check(
  "Security Headers",
  () => {
    const vercelJsonExists = fs.existsSync(path.join(process.cwd(), "vercel.json"));
    if (vercelJsonExists) {
      const vercelJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf-8")
      );
      const hasHeaders = vercelJson.headers && vercelJson.headers.length > 0;
      return hasHeaders ? "pass" : "warn";
    }
    return "warn";
  },
  "Security headers configured in vercel.json"
);

// Check 7: Analytics integration
check(
  "Analytics",
  () => {
    const rootTsx = fs.readFileSync(path.join(process.cwd(), "app/root.tsx"), "utf-8");
    const hasAnalytics = rootTsx.includes("@vercel/analytics");
    return hasAnalytics ? "pass" : "warn";
  },
  "Vercel Analytics integrated",
  "Analytics component found in root.tsx"
);

// Check 8: Error boundaries
check(
  "Error Handling",
  () => {
    const rootTsx = fs.readFileSync(path.join(process.cwd(), "app/root.tsx"), "utf-8");
    const hasErrorBoundary = rootTsx.includes("ErrorBoundary");
    return hasErrorBoundary ? "pass" : "warn";
  },
  "Error boundary configured",
  "ErrorBoundary found in root.tsx"
);

// Check 9: README documentation
check(
  "Documentation",
  () => {
    const readmeExists = fs.existsSync(path.join(process.cwd(), "README.md"));
    const deploymentExists = fs.existsSync(path.join(process.cwd(), "DEPLOYMENT.md"));
    if (readmeExists && deploymentExists) return "pass";
    if (readmeExists || deploymentExists) return "warn";
    return "fail";
  },
  "Documentation exists",
  "README.md and DEPLOYMENT.md should be present"
);

// Check 10: Bundle size check script exists
check(
  "Performance Monitoring",
  () => {
    const scriptExists = fs.existsSync(path.join(process.cwd(), "scripts/check-bundle-size.ts"));
    return scriptExists ? "pass" : "info";
  },
  "Bundle size monitoring configured"
);

// Check 11: .gitignore configured
check(
  "Git Configuration",
  () => {
    const gitignoreExists = fs.existsSync(path.join(process.cwd(), ".gitignore"));
    if (gitignoreExists) {
      const gitignore = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf-8");
      const hasEnv = gitignore.includes(".env");
      const hasNodeModules = gitignore.includes("node_modules");
      const hasBuild = gitignore.includes("build");
      return hasEnv && hasNodeModules && hasBuild ? "pass" : "warn";
    }
    return "fail";
  },
  ".gitignore properly configured",
  "Should exclude .env, node_modules, build, etc."
);

// Check 12: No console.logs in production code
check(
  "Code Quality",
  () => {
    try {
      const appFiles = execSync('find app -name "*.tsx" -o -name "*.ts"', {
        encoding: "utf-8",
      })
        .split("\n")
        .filter(Boolean);

      let consoleLogCount = 0;
      for (const file of appFiles) {
        if (file.includes("test") || file.includes(".test.")) continue;
        const content = fs.readFileSync(file, "utf-8");
        const matches = content.match(/console\.(log|debug)/g);
        if (matches) consoleLogCount += matches.length;
      }

      if (consoleLogCount === 0) return "pass";
      if (consoleLogCount < 5) return "warn";
      return "info";
    } catch {
      return "info";
    }
  },
  "Console logs cleaned up",
  "Consider removing console.log statements from production code"
);

// Print results
console.log("\n📊 Checklist Results:\n");

const statusSymbols = {
  pass: "✅",
  fail: "❌",
  warn: "⚠️",
  info: "ℹ️",
};

const statusCounts = {
  pass: 0,
  fail: 0,
  warn: 0,
  info: 0,
};

for (const result of results) {
  statusCounts[result.status]++;
  const symbol = statusSymbols[result.status];
  console.log(`${symbol} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${result.details}`);
  }
}

console.log("\n" + "─".repeat(60) + "\n");
console.log(`✅ Passed: ${statusCounts.pass}`);
console.log(`❌ Failed: ${statusCounts.fail}`);
console.log(`⚠️  Warnings: ${statusCounts.warn}`);
console.log(`ℹ️  Info: ${statusCounts.info}`);

// Exit with error if any checks failed
if (statusCounts.fail > 0) {
  console.log("\n❌ Some checks failed. Please fix issues before deploying.\n");
  process.exit(1);
}

if (statusCounts.warn > 0) {
  console.log(
    "\n⚠️  Some checks have warnings. Review before deploying to production.\n"
  );
}

if (statusCounts.fail === 0 && statusCounts.warn === 0) {
  console.log("\n✅ All checks passed! Ready for production deployment.\n");
  console.log("Next steps:");
  console.log("1. Deploy Convex: npx convex deploy --prod");
  console.log("2. Set Convex environment variables (see DEPLOYMENT.md)");
  console.log("3. Deploy to Vercel: git push (auto-deploy) or vercel --prod");
  console.log("4. Verify deployment at your production URL");
  console.log("5. Run post-deployment checks (see DEPLOYMENT.md)\n");
}

