const Confirm = require('prompt-confirm')
const path    = require('path')
const fs      = require('fs-extra')
const colors  = require('colors')
const format  = require('string-format')

const { FileExist, Log, Error, Warn } = require('./utils')
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
 * @param {string} page 	  页面名称
 * @param {string} path 	  文件地址
 * @param {string} moduleName 模版名称
 */
function ResetProcessing(page, path, moduleName){
	Log(STRBEIGN.format(page))
	try{
		// 删除当前页面
		DeleteProcessing(page, path)
		// 重新创建当前页面
		CreateProcessing(page, path, moduleName, '创建')
		Log(STREND.format(page))
	} catch (err) {
		Error(STRFAIL.format(page, err))
	}
}

module.exports = (pageName, option) => {
	// 获取当前文件信息
	const { result, path } = FileExist(pageName);

	// 判断页面是否存在 
	if (!result) return Warn(STRNOT.format(pageName))

	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要重置此页面吗？`);
	// 监听选择结果
	propmt.ask(answer => answer && ResetProcessing(pageName, path, option.template))
}

module.exports.ResetProcessing = ResetProcessing

