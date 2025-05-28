import { readdir } from 'node:fs/promises'
import path from 'node:path'

const expectedFiles = [
  'blipgloss-linux-amd64.so',
  'blipgloss-linux-arm64.so', 
  'blipgloss-darwin-amd64.dylib',
  'blipgloss-darwin-arm64.dylib',
  'blipgloss-windows-amd64.dll',
  'blipgloss-windows-arm64.dll'
];

try {
  const releaseDir = path.join(process.cwd(), 'release');
  const files = await readdir(releaseDir);
  
  console.log('Generated files:');
  files.forEach(file => console.log(`  ✓ ${file}`));
  
  const missing = expectedFiles.filter(expected => 
    !files.some(file => file.includes(expected.split('.')[0]))
  );
  
  if (missing.length > 0) {
    console.log('\nMissing files:');
    missing.forEach(file => console.log(`  ✗ ${file}`));
  } else {
    console.log('\n✅ All platform binaries generated successfully!');
  }
} catch (error) {
  console.error('Error checking build files:', error.message);
}