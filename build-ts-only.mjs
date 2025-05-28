import path from 'node:path'

console.log('Building TypeScript only (for testing)...');

// TypeScript 构建
const output = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  external: ['bun:ffi'],
  target: 'bun',
  format: 'esm'
})

if (!output.success) {
  console.error('TypeScript build failed');
  process.exit(1);
}

console.log('✅ TypeScript build completed');
console.log('⚠️  Native binaries skipped - FFI calls will fail');
console.log('');
console.log('To build native binaries:');
console.log('1. Start Docker Desktop');
console.log('2. Run: bun run build');
console.log('');
console.log('For local testing only:');
console.log('bun run build:local');