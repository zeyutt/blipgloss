import path from 'node:path'
import { platform } from 'node:process'
import { mkdir } from 'node:fs/promises'

const skipNative = process.argv.includes('--skip-native');

console.log('Building TypeScript definitions...');
const tscProc = Bun.spawnSync(['bunx', 'tsc', '--emitDeclarationOnly', '--declaration'], {
  cwd: process.cwd(),
  env: process.env
});

if (tscProc.exitCode !== 0) {
  console.warn('TypeScript declaration generation failed:', tscProc.stderr.toString());
}

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

if (skipNative) {
  console.log('Skipping native binary compilation.');
  process.exit(0);
}

// 确保 release 目录存在
try {
  await mkdir('release', { recursive: true });
} catch (error) {
  // 目录已存在，忽略错误
}

// 本地 Go 编译（仅当前平台）
console.log('Compiling native binary for current platform...')

const currentPlatform = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'darwin' : 'linux';
const currentArch = process.arch === 'x64' ? 'amd64' : process.arch === 'arm64' ? 'arm64' : 'amd64';

const outputName = `release/blipgloss-${currentPlatform}-${currentArch}`;
const extension = platform === 'win32' ? '.dll' : (platform === 'darwin' ? '.dylib' : '.so');

// 使用本地 go 编译，添加详细的构建标志
const buildArgs = [
  'build',
  '-buildmode=c-shared',
  '-ldflags=-s -w -extldflags=-static',
  '-tags=netgo',
  '-o', outputName + extension,
  '.'
];

console.log('Running Go build with args:', buildArgs.join(' '));

const proc = Bun.spawnSync(['go', ...buildArgs], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    GOOS: currentPlatform,
    GOARCH: currentArch,
    CGO_ENABLED: '1',
    // Windows 特定环境变量
    ...(platform === 'win32' && {
      CC: 'gcc',
      CXX: 'g++'
    })
  }
});

console.log('Go build output:', proc.stdout.toString());

if (proc.stderr.length > 0) {
  console.log('Go build stderr:', proc.stderr.toString());
}

if (proc.exitCode !== 0) {
  console.error('Local Go build failed with exit code:', proc.exitCode);
  process.exit(1);
} else {
  console.log(`✅ Local binary compiled successfully: ${outputName}${extension}`);
  
  // 验证文件是否真的创建了
  const file = Bun.file(outputName + extension);
  if (await file.exists()) {
    const size = (await file.stat()).size;
    console.log(`📁 File size: ${Math.round(size / 1024)}KB`);
  } else {
    console.error('❌ Binary file was not created!');
  }
}