const fs = require('fs-extra')
const path = require('path')

const { cwd } = require('./constants')

/**
 * 检查文件或目录是否存在
 * @param  {string} pagename 文件或目录名称
 * @return {object}          判断结果
 *         return.result {boolean} 文件或目录是否存在
 *         return.path   {string}  文件或目录的完整路径
 */
exports.FileExist = (pagename) => {
	// 以命令执行的目录作为起始目录
	const fullPath = path.join(cwd, pagename);
	// 当前目录是否已存在
	return {
		result: fs.pathExistsSync(fullPath),
		path  : fullPath
	}
}

/**
 * 只是觉得写着很烦于是这么处理了下
 * @param  {string} msg 内容
 */
exports.Log = (msg) => console.log(msg)

/**
 * 只是觉得写着很烦于是这么处理了下
 * @param  {string} msg 内容
 */
exports.Error = (msg) => console.log(msg) 

/**
 * 只是觉得写着很烦于是这么处理了下
 * @param  {string} msg 内容
 */
exports.Warn = (msg) => console.warn(msg) 