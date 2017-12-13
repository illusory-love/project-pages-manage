const fs = require('fs-extra')
const path = require('path')

const { cwd, dir } = require('./constants')

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
 * @param  {number}   deep      遍历层级(默认: 1)
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
		} else {
			// 获取当前文件路径并返回
			cb && cb(pathname, file)
		}
	})
}