const Confirm = require('prompt-confirm')
const fs      = require('fs-extra')
const colors  = require('colors')

const { FileExist, forEachFiles } = require('../utils')
const log = require('../log')

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在删除...`.magenta
const STREND   = `>>> 页面『{0}』删除完成。`.green
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』删除失败: \n {1}`.red

/**
 * 删除指定页面
 * @param {string}  target  	 目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param {boolean} forbid 禁止输出日志
 */
function DeleteProcessing(target, forbid) {
	// // 日志信息输出
	log.disable(!!forbid)
	log.info(STRBEIGN.format(target.name))
	log.disable(false)
	try{
		// 删除文件或目录
		forEachFiles(target.path, (pathname, file) => {
			// 删除文件
			fs.removeSync(pathname)	
			log.info(` ${pathname}`, '删除')
		})
		// 删除目录
		fs.removeSync(target.path)
		log.info(` ${target.path}`, '删除')
		
		log.disable(!!forbid)
		log.success(STREND.format(target.name))
		log.disable(false)
	} catch (err) {
		log.error(STRFAIL.format(target.name, err))
		throw err
	}
}

module.exports = function(pageName, option) {
	// 获取当前文件信息
	const exist = FileExist(pageName);

	// 判断页面是否存在 
	if (!exist.result) 
		return log.warn(STRNOT.format(pageName))
	
	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要删除此页面吗？`);
	// 监听操作行为
	propmt.ask(answer => answer && DeleteProcessing(exist))
}

module.exports.DeleteProcessing = DeleteProcessing

