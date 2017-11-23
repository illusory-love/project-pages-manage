const Confirm = require('prompt-confirm')
const fs      = require('fs-extra')
const colors  = require('colors')
const format  = require('string-format')

const { FileExist, Log, Error, Warn } = require('./utils')
// format 方法注册
format.extend(String.prototype)
// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在删除...`.magenta
const STREND   = `>>> 页面『{0}』删除完成。`.magenta
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』删除失败: \n {1}`.red

/**
 * 删除指定页面
 * @param  {string}  page 目录或文件名称
 * @param  {string}  path 当前页面完整路径
 */
function DeleteProcessing(page, path) {
	// 日志信息输出
	Log(STRBEIGN.format(page))
	try{
		// 删除文件或目录
		fs.removeSync(path)
		Log(STREND.format(page))
	} catch (err) {
		Error(STRFAIL.format(page, err))
		throw err
	}
}

module.exports = function(pageName, option) {
	// 获取当前文件信息
	const { result, path } = FileExist(pageName);

	// 判断页面是否存在 
	if (!result) return Warn(STRNOT.format(pageName))
	
	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要删除此页面吗？`);
	// 监听操作行为
	propmt.ask(answer => answer && DeleteProcessing(pageName, path))
}

module.exports.DeleteProcessing = DeleteProcessing

