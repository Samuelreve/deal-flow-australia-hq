const fs = require('fs');
const path = require('path');

// Copy WebViewer files to public directory
const srcDir = path.join(__dirname, 'node_modules/@pdftron/webviewer/public');
const destDir = path.join(__dirname, 'public/webviewer');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(srcDir)) {
  console.log('Copying WebViewer files to public directory...');
  copyRecursiveSync(srcDir, destDir);
  console.log('WebViewer files copied successfully!');
} else {
  console.log('WebViewer source directory not found. Make sure @pdftron/webviewer is installed.');
}