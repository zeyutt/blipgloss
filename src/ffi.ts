import { FFIType, dlopen, suffix } from 'bun:ffi';
import { existsSync } from 'node:fs'
import path from 'node:path'

const platform = process.platform
const arch = process.arch === 'x64' ? 'amd64' : process.arch

// 修复平台名称映射
let platformName: string;
if (platform === 'win32') {
   platformName = 'windows';  // 映射 win32 -> windows
} else if (platform === 'darwin') {
   platformName = 'darwin';
} else {
   platformName = 'linux';
}

let suffix: string;
if (platform === 'win32') {
   suffix = 'dll';
} else if (platform === 'darwin') {
   suffix = 'dylib';
} else {
   suffix = 'so';
}

// 使用修正后的平台名称
const filename = `blipgloss-${platformName}-${arch}.${suffix}`;
const location = path.resolve(import.meta.dir, '..', 'release', filename);


// const location = new URL(filename, import.meta.url).pathname;

console.log('Loading library from:', location);
console.log('File exists:', existsSync(location));

if (!existsSync(location)) {
  throw new Error(`Library file not found: ${location}`);
}

export const { symbols } = dlopen(location, {
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
	SetIntValue: {
		args: [FFIType.ptr, FFIType.ptr, FFIType.int],
		returns: FFIType.void,
	},
	SetBooleanValue: {
		args: [FFIType.ptr, FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	GetBoolValue: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.bool,
	},
	GetIntValue: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.int,
	},
	HasDarkBackground: {
		args: [],
		returns: FFIType.bool,
	},
	UnsetRule: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
	JoinHorizontal: {
		args: [FFIType.f64, FFIType.ptr],
		returns: FFIType.ptr,
	},
	JoinVertical: {
		args: [FFIType.f64, FFIType.ptr],
		returns: FFIType.ptr,
	},
	Width: {
		args: [FFIType.ptr],
		returns: FFIType.int,
	},
	Height: {
		args: [FFIType.ptr],
		returns: FFIType.int,
	},
	Align: {
		args: [FFIType.ptr, FFIType.float],
		returns: FFIType.void,
	},
	Margin: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
	Padding: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
	Border: {
		args: [
			FFIType.ptr,
			FFIType.ptr,
			FFIType.bool,
			FFIType.bool,
			FFIType.bool,
			FFIType.bool,
		],
		returns: FFIType.void,
	},
	BorderStyle: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
	FreeString: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	Inherit: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
	WithWhitespaceChars: {
		args: [FFIType.ptr],
		returns: FFIType.ptr,
	},
	WithWhitespaceBackground: {
		args: [FFIType.ptr, FFIType.int],
		returns: FFIType.ptr,
	},
	WithWhitespaceForeground: {
		args: [FFIType.ptr, FFIType.int],
		returns: FFIType.ptr,
	},
	Place: {
		args: [
			FFIType.int,
			FFIType.int,
			FFIType.f64,
			FFIType.f64,
			FFIType.ptr,
			FFIType.ptr,
		],
		returns: FFIType.ptr,
	},
	PlaceVertical: {
		args: [FFIType.int, FFIType.f64, FFIType.ptr, FFIType.ptr],
		returns: FFIType.ptr,
	},
	PlaceHorizontal: {
		args: [FFIType.int, FFIType.f64, FFIType.ptr, FFIType.ptr],
		returns: FFIType.ptr,
	},
	SetString: {
		args: [FFIType.ptr, FFIType.ptr],
		returns: FFIType.void,
	},
});
