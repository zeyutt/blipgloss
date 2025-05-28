import { existsSync } from 'node:fs'
import path from 'node:path'

const platform = process.platform
const arch = process.arch === 'x64' ? 'amd64' : process.arch

console.log(`Testing on ${platform}-${arch}`)

// 检查构建输出
const distFile = './dist/index.js'
if (existsSync(distFile)) {
  console.log('✅ TypeScript build output exists')
} else {
  console.error('❌ TypeScript build output not found')
  process.exit(1)
}

// 检查二进制文件
const expectedFile = platform === 'win32' 
  ? `release/blipgloss-windows-${arch}.dll`
  : `release/blipgloss-${platform}-${arch}.so`

console.log(`Looking for: ${expectedFile}`)

if (existsSync(expectedFile)) {
  console.log('✅ Binary file exists')
  
  // 检查文件大小
  const { statSync } = await import('node:fs')
  const stats = statSync(expectedFile)
  console.log(`📁 File size: ${Math.round(stats.size / 1024)}KB`)
  
  // 更详细的 FFI 测试
  try {
    console.log('Testing FFI loading...')
    
    // 使用与 ffi.ts 相同的符号定义
    const { dlopen, FFIType } = await import('bun:ffi')
    
    const lib = dlopen(expectedFile, {
      NewStyle: {
        args: [],
        returns: FFIType.ptr,
      },
      Render: {
        args: [FFIType.ptr, FFIType.ptr],
        returns: FFIType.ptr,
      },
      String: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
      },
      Copy: {
        args: [FFIType.ptr],
        returns: FFIType.ptr,
      },
      SetColorValue: {
        args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.int],
        returns: FFIType.void,
      },
    })
    
    console.log('✅ FFI library loaded successfully')
    console.log('Available symbols:', Object.keys(lib.symbols))
    
    // 简单测试一个函数
    try {
      const style = lib.symbols.NewStyle()
      if (style) {
        console.log('✅ NewStyle function works')
      }
    } catch (error) {
      console.warn('⚠️ NewStyle function test failed:', error.message)
    }
    
  } catch (error) {
    console.error('❌ FFI loading failed:', error.message)
    console.log('')
    console.log('Debug information:')
    console.log('- Check if Go build exported the correct functions')
    console.log('- Verify DLL dependencies with: dumpbin /dependents release/blipgloss-windows-amd64.dll')
    console.log('- Ensure all required C runtime libraries are available')
    
    // 尝试直接使用项目的 ffi.ts
    console.log('\nTrying to use project FFI module...')
    try {
      const ffi = await import('./src/ffi.ts')
      console.log('✅ Project FFI module loaded successfully')
      console.log('Available symbols:', Object.keys(ffi.symbols))
    } catch (ffiError) {
      console.error('❌ Project FFI module failed:', ffiError.message)
    }
  }
} else {
  console.log('❌ Binary file not found')
  console.log('Available files:')
  try {
    const { readdirSync } = await import('node:fs')
    const files = readdirSync('release')
    files.forEach(file => console.log(`  - ${file}`))
  } catch (error) {
    console.error('Cannot read release directory')
  }
}