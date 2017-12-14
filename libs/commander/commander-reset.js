const Confirm = require('prompt-confirm')
const path    = require('path')
const fs      = require('fs-extra')
const colors  = require('colors')
const format  = require('string-format')

const { FileExist, forEachFiles } = require('../utils')
const { DeleteProcessing }  = require('./commander-delete')
const { CreateProcessing }  = require('./commander-create')
// format 方法注册
format.extend(String.prototype)

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在重置...`.magenta
const STREND   = `>>> 页面『{0}』重置完成。`.magenta
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』重置失败 \n {1}`.red


/**
 * 重置操作
 * @param {string}  target  	 目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param {string}  moduleName   模版名称
 * @param {boolean} forbidLogger 禁止输出日志
 */
async function ResetProcessing(target, moduleName, forbidLogger){
	forbidLogger || console.log(STRBEIGN.format(target.name))
	try{
		// 删除当前页面
		await DeleteProcessing(target, true)
		// 重新创建当前页面
		await CreateProcessing(target, moduleName, '创建', true)

		forbidLogger || console.log(STREND.format(target.name))
	} catch (err) {
		console.error(STRFAIL.format(target.name, err))
	}
}

module.exports = (pageName, option) => {
	// 获取当前文件信息
	const exist = FileExist(pageName)

	// 判断页面是否存在 
	if (!exist.result) 
		return console.warn(STRNOT.format(pageName))

	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要重置此页面吗？`)
	// 监听选择结果
	propmt.ask(answer => answer && ResetProcessing(exist, option.template))
}

module.exports.ResetProcessing = ResetProcessing

