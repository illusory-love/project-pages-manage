const Confirm = require('prompt-confirm')
const path    = require('path')
const fs      = require('fs-extra')
const colors  = require('colors')

const { FileExist, forEachFiles } = require('../utils')
const { DeleteProcessing }  = require('./commander-delete')
const { CreateProcessing }  = require('./commander-create')
const templates = require('../template')
const log = require('../log')

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在{1}...`.magenta
const STREND   = `>>> 页面『{0}』{1}完成。`.green
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRABORT = `>>> 页面『{0}』{1}行为被模版脚本 onBefore 中止`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』{1}失败 \n {2}`.red


/**
 * 重置操作
 * @param {string}  target  	 目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param {string}  moduleName   模版名称
 * @param {string}  actionText   操作标签文案
 * @param {boolean} forbid 		 禁止输出日志 (默认: false)
 */
async function ResetProcessing(target, moduleName, actionText = '重置', forbid){
	try{
		// 获取当前可选模版
		let objTemp
		let params
		if (!forbid){
			log.info(STRBEIGN.format(target.name, actionText))
			// 获取当前需要删除的页面的模版名称
			const modulePage = templates.modulePage.get(target.path)
			// 如果不是通过此工具创建的页面则不存在此映射,因此不需要作处理
			if (modulePage){
				// 获取模版对象
				objTemp = templates(modulePage[0])[modulePage[1]]
				params = {
					modulePath: objTemp.module, 
					targetPath: target.path, 
					config    : objTemp.config 
				}
				// 获取监听执行结果
				const promiseCallbcak = objTemp.script.onBefore ? objTemp.script.onBefore('reset', params) : Promise.resolve()
				// 根据模版脚本返回值确定是否继续操作
				if (await promiseCallbcak === false){
					// 表示脚本不允许继续往下执行了
					log.warn(STRABORT.format(target.name))
					process.exit(0)
				}
			}
		}
		// 当可选模版只有一个的时候可在创建前选删除已有
		// objTemp.length == 1 && await DeleteProcessing(target, true)
		// 重新创建当前页面
		await CreateProcessing(target, moduleName, { 
			actionText, 
			forbid  : true,
			onBefore: () => DeleteProcessing(target, true)
		})

		log.disable(!!forbid)
		log.success(STREND.format(target.name, actionText))
		log.disable(false)

		// 操作完成后的回调
		if (!forbid && objTemp){
			objTemp.script.onAfter && objTemp.script.onAfter('reset', params)
		}
	} catch (err) {
		log.error(STRFAIL.format(target.name, actionText, err))
	}
}

module.exports = (pageName, option) => {
	// 获取当前文件信息
	const exist = FileExist(pageName)

	// 判断页面是否存在 
	if (!exist.result) 
		return log.warn(STRNOT.format(pageName))

	// 提示确认是否删除 
	const propmt = new Confirm(`您确定要重置此页面吗？`)
	// 监听选择结果
	propmt.ask(answer => answer && ResetProcessing(exist, option.template))
}

module.exports.ResetProcessing = ResetProcessing

