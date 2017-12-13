const Confirm = require('prompt-confirm')
const fs      = require('fs-extra')
const colors  = require('colors')
const format  = require('string-format')

const { FileExist, forEachFiles } = require('./utils')
// format 方法注册
format.extend(String.prototype)
// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在删除...`.magenta
const STREND   = `>>> 页面『{0}』删除完成。`.magenta
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』删除失败: \n {1}`.red

/**
 * 删除指定页面
 * @param {string}  target  	 目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param {boolean} forbidLogger 禁止输出日志
 */
function DeleteProcessing(target, forbidLogger) {
	// 日志信息输出
	forbidLogger || console.log(STRBEIGN.format(target.name))
	try{
		// 删除文件或目录
		forEachFiles(target.path, (pathname, file) => {
			// 删除文件
			fs.removeSync(pathname)	
			console.log(`[删除]`.cyan + ` ${pathname}`)
		})
		// 删除目录
		fs.removeSync(target.path)
		console.log(`[删除]`.cyan + ` ${target.path}`)
		
		forbidLogger || console.log(STREND.format(target.name))
	} catch (err) {
		console.error(STRFAIL.format(target.name, err))
		throw err
	}
}

module.exports = function(pageName, option) {
	// 获取当前文件信息
	const exist = FileExist(pageName);

	// 判断页面是否存在 
	if (!exist.result) 
		return console.warn(STRNOT.format(pageName))
	
	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要删除此页面吗？`);
	// 监听操作行为
	propmt.ask(answer => answer && DeleteProcessing(exist))
}

module.exports.DeleteProcessing = DeleteProcessing

