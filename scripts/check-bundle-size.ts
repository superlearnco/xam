import { statSync, readdirSync } from "fs";
import { join } from "path";

const BUILD_DIR = "./build/client";
const MAX_BUNDLE_SIZE = 500 * 1024; // 500 KB

interface BundleStats {
  file: string;
  size: number;
}

function getFileSize(filepath: string): number {
  try {
    const stats = statSync(filepath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function getAllJsFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...getAllJsFiles(fullPath));
      } else if (item.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

function checkBundleSize() {
  console.log("📊 Checking bundle sizes...\n");
  
  const jsFiles = getAllJsFiles(BUILD_DIR);
  const stats: BundleStats[] = [];
  let totalSize = 0;
  let hasWarnings = false;
  
  for (const file of jsFiles) {
    const size = getFileSize(file);
    const relativePath = file.replace(BUILD_DIR + "/", "");
    stats.push({ file: relativePath, size });
    totalSize += size;
  }
  
  // Sort by size descending
  stats.sort((a, b) => b.size - a.size);
  
  // Display top 10 largest files
  console.log("Top 10 largest JavaScript bundles:\n");
  for (let i = 0; i < Math.min(10, stats.length); i++) {
    const stat = stats[i];
    const sizeStr = formatSize(stat.size);
    const status = stat.size > MAX_BUNDLE_SIZE ? "⚠️" : "✅";
    
    console.log(`${status} ${stat.file}: ${sizeStr}`);
    
    if (stat.size > MAX_BUNDLE_SIZE) {
      hasWarnings = true;
    }
  }
  
  console.log(`\nTotal JS bundle size: ${formatSize(totalSize)}`);
  console.log(`Max recommended size per bundle: ${formatSize(MAX_BUNDLE_SIZE)}`);
  
  if (hasWarnings) {
    console.log("\n⚠️  Warning: Some bundles exceed the recommended size limit.");
    console.log("Consider code splitting or lazy loading for large modules.");
    process.exit(1);
  } else {
    console.log("\n✅ All bundles are within the recommended size limit!");
    process.exit(0);
  }
}

checkBundleSize();

