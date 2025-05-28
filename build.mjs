import path from 'node:path'
import { platform } from 'node:process'

const skipNative = process.argv.includes('--skip-native');

// TypeScript 构建（不使用 bun-plugin-dts）
const output = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  external: ['bun:ffi'],
  target: 'bun',
  format: 'esm'
})

// 使用 tsc 生成类型定义
if (output.success) {
  console.log('Building TypeScript definitions...');
  const tscProc = Bun.spawnSync(['bunx', 'tsc', '--emitDeclarationOnly', '--declaration'], {
    cwd: process.cwd(),
    env: process.env
  });
  
  if (tscProc.exitCode !== 0) {
    console.warn('TypeScript declaration generation failed:', tscProc.stderr.toString());
  }
}

if (skipNative) {
  console.log('TypeScript build completed. Skipping native binary compilation.');
  process.exit(0);
}

// 根据平台确定 XGO 路径
const XGO = platform === 'win32' 
  ? path.join(process.env.USERPROFILE || process.env.HOME, 'go', 'bin', 'xgo.exe')
  : path.join(process.env.HOME, 'go/bin/xgo');

// 包含所有主要平台
const TARGETS = 'linux/arm64,linux/amd64,darwin/arm64,darwin/amd64,windows/amd64,windows/arm64';

if (output.success) {
  console.log('TypeScript build completed. Compiling native binaries...')
  
  // 检查 XGO 是否存在
  const xgoExists = await Bun.file(XGO).exists();
  if (!xgoExists) {
    console.error(`XGO not found at ${XGO}. Please install XGO first.`);
    console.log('Install XGO with: go install github.com/karalabe/xgo@latest');
    process.exit(1);
  }
  
  const proc = Bun.spawnSync([
    XGO,
    "-go", "1.20",  // 修改：使用 1.20 而不是 1.20.3
    "-out", "release/blipgloss",
    `--targets=${TARGETS}`,
    "-ldflags=-s -w",
    "-buildmode=c-shared",
    ".",
  ], {
    cwd: process.cwd(),
    env: process.env
  });
  
  console.log('XGO Output:', proc.stdout.toString());
  
  if (proc.exitCode !== 0) {
    console.error('Build failed:', proc.stderr.toString());
    process.exit(1);
  } else {
    console.log('All platform binaries compiled successfully!');
  }
}