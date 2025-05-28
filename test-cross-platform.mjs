import { existsSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'

console.log('🧪 Cross-platform build test')
console.log('===========================')

const expectedFiles = [
  'blipgloss-linux-amd64.so',
  'blipgloss-linux-arm64.so', 
  'blipgloss-darwin-amd64.dylib',
  'blipgloss-darwin-arm64.dylib',
  'blipgloss-windows-amd64.dll'
]

const releaseDir = './release'

if (!existsSync(releaseDir)) {
  console.error('❌ Release directory not found')
  process.exit(1)
}

console.log('📂 Checking release directory...')
const files = readdirSync(releaseDir)
console.log('Available files:', files)

let allPassed = true
let summary = {
  found: [],
  missing: [],
  totalSize: 0
}

expectedFiles.forEach(fileName => {
  const filePath = `${releaseDir}/${fileName}` 
  if (existsSync(filePath)) {
    const stats = statSync(filePath)
    const sizeKB = Math.round(stats.size / 1024)
    summary.found.push({ fileName, sizeKB })
    summary.totalSize += sizeKB
    console.log(`✅ ${fileName} (${sizeKB}KB)`)
  } else {
    summary.missing.push(fileName)
    console.log(`❌ ${fileName}`)
    allPassed = false
  }
})

console.log('\n📊 Summary:')
console.log(`Found: ${summary.found.length}/${expectedFiles.length} files`)
console.log(`Total size: ${summary.totalSize}KB`)

if (summary.found.length > 0) {
  console.log('\n✅ Successfully built for:')
  summary.found.forEach(({ fileName, sizeKB }) => {
    const platform = fileName.includes('linux') ? 'Linux' :
                    fileName.includes('darwin') ? 'macOS' :
                    fileName.includes('windows') ? 'Windows' : 'Unknown'
    const arch = fileName.includes('amd64') ? 'x64' :
                fileName.includes('arm64') ? 'ARM64' : 'Unknown'
    console.log(`  - ${platform} ${arch} (${sizeKB}KB)`)
  })
}

if (summary.missing.length > 0) {
  console.log('\n❌ Missing builds for:')
  summary.missing.forEach(fileName => {
    const platform = fileName.includes('linux') ? 'Linux' :
                    fileName.includes('darwin') ? 'macOS' :
                    fileName.includes('windows') ? 'Windows' : 'Unknown'
    const arch = fileName.includes('amd64') ? 'x64' :
                fileName.includes('arm64') ? 'ARM64' : 'Unknown'
    console.log(`  - ${platform} ${arch}`)
  })
}

process.exit(allPassed ? 0 : 1)