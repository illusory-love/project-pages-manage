const fs = require('fs-extra')
const path = require('path')
const format  = require('string-format')

const { cwd, dir } = require('./constants')

// format 方法注册
format.extend(String.prototype)

// 复制文件时需要排除的文件
const exclude = ['node_modules', '.DS_Store']

/**
 * 检查待生成的文件或目录是否存在
 * @param  {string} pagename 文件或目录名称
 * @return {object}          判断结果
 *         return.result {boolean} 文件或目录是否存在
 *         return.name   {string}  文件或目录名称
 *         return.path   {string}  文件或目录的完整路径
 */
exports.FileExist = (pagename) => {
	// 以命令执行的目录作为起始目录
	const fullPath = path.join(cwd, pagename);
	// 当前目录是否已存在
	return {
		result: fs.pathExistsSync(fullPath),
		name  : pagename,
		path  : fullPath
	}
}

/**
 * 遍历目录下的所有文件
 * @param  {string}   directory 目录路径
 * @param  {function} step      每次遍历到目录时的回调
 */
exports.forEachFiles = (directory, cb) => {
	// 获取目录下的所有文件
	const files = fs.readdirSync(directory)
	// 遍历获取到的文件
	files.forEach(file => {
		const pathname = path.join(directory, file)
		const stat = fs.lstatSync(pathname)
		// 判断当前是否是目录
		if (stat.isDirectory()){
			// 递归获取目录下的文件
			exports.forEachFiles(pathname, cb)
		}
		// 获取当前文件路径并返回并排除不需要的文件
		exclude.includes(file) || cb && cb(pathname, file)
	})
}