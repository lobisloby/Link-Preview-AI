const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distPath = path.join(__dirname, '..', 'dist');
const zipPath = path.join(__dirname, '..', 'link-preview-ai.zip');

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Check if dist exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist/ folder not found. Run npm run build first.');
  process.exit(1);
}

// Create zip using PowerShell (Windows) or zip (Unix)
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    execSync(
      `powershell Compress-Archive -Path "${distPath}\\*" -DestinationPath "${zipPath}" -Force`,
      { stdio: 'inherit' }
    );
  } else {
    execSync(`cd "${distPath}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  }
  
  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  console.log('');
  console.log('✅ Extension packaged successfully!');
  console.log(`📦 File: link-preview-ai.zip`);
  console.log(`📊 Size: ${sizeMB} MB`);
  console.log('');
  console.log('Next: Upload to Chrome Web Store Developer Dashboard');
  console.log('https://chrome.google.com/webstore/devconsole');
  
} catch (error) {
  console.error('❌ Failed to create zip:', error.message);
  process.exit(1);
}