const list   = require('prompt-list')
const path   = require('path')
const fs     = require('fs-extra')
const colors = require('colors')

const { FileExist, forEachFiles } = require('../utils')
const { DeleteProcessing } = require('./commander-delete')
// const { ResetProcessing } = require('./commander-reset')
const { cwd, dir }     = require('../constants')
const templates = require('../template')
const log = require('../log')

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在{1}...`.magenta
const STREND   = `>>> 页面『{0}』{1}完成。`.green
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRNOTTMP= `>>> 模版『{0}』不存在。`.yellow
const STRABORT = `>>> 页面『{0}』{1}行为被用户中止`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』{1}失败 \n {2}`.red

const TEXTCREATE  = '创建'
const TEXTCOVER   = '覆盖'
const TEXTREPLACE = '替换'
const TEXTCANCEL  = '取消'
const TEXTRESET   = '重置'

/**
 * 创建页面
 * @param  {string} target  目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param  {string}  moduleName    模版名称
 * @param  {string}  actionText    操作文本
 * @param  {boolean} forbid  禁止输出日志
 */
async function CreateProcessing(target, moduleName = 'normal', actionText = TEXTCREATE, forbid){
	// 当前模版路
	let objTemp = typeof moduleName == 'string' ? templates(moduleName) : moduleName

	if (objTemp.length){
		// 验证当前是否有多个模版
		if (objTemp.length > 1){
			// 获取选择项
			const choices = objTemp.map((tmp, idx) => `[${target.name}-${idx}] ${tmp.root}`).concat(['取消'.gray])
			// 弹出选择列表
			const prompt = new list({
				name: 'choiceTemplate',
				message: `请选择您需要{0}的模版`.format(actionText),
				choices
			})
			await prompt.run().then(async answer => {
				if (!answer.includes('取消')){ 
					// 重新创建前先删除 
					await DeleteProcessing(target, true)
					// 获取当前选择的对象
					const index = answer.match(/\[.+-(\d+)\]/)[1]
					operationModule(objTemp[index], target, actionText, forbid)
				}
			})
		} else {
			// 创建文件
			operationModule(objTemp[0], target, actionText, forbid)
		}
	} else {
		// 模版不存在,输出警告直接退出
		log.warn(STRNOTTMP.format(moduleName))
		process.exit(0)
	}
}

/**
 * 根据指定的模版生成页面
 * @param  {object} objTemp       模版信息对象
 *                  objTemp.module {string} 模版名称
 *                  objTemp.config {object} 模版配置信息
 *                  objTemp.script {object} 模版自定义脚本
 * @param  {string} target  目标创建页信息对象
 *                  target.result {boolean} 目标文件是否存在
 *                  target.name   {string}  目标页面名称
 *                  target.path   {string}  目标文件完整路径
 * @param  {string}  actionText    当前的操作名称
 * @param  {boolean} forbid  禁止输出日志
 */
async function operationModule(objTemp, target, actionText, forbid){
	// 执行开始创建
	log.disable(!!forbid)
	log.info(STRBEIGN.format(target.name, actionText))
	log.disable(false)
	// 开始复制或覆盖文件
	try{
		// 获取源模版路径
		let modulePath = objTemp.module
		let script     = objTemp.script
		let config     = objTemp.config
		// 操作前的回调
		const cbResult = await script.onBefore && script.onBefore('create', objTemp.module, target.path)
		// 根据自定义脚本返回值确定是否继续操作
		if (cbResult === false){
			log.info(STRABORT.format(target.name, actionText))
			process.exit(0)
		}

		log.info(` ${modulePath} => ${target.path}`, actionText)
		// 单文件创建, 便于输出日志
		forEachFiles(modulePath, (pathname, file) => {
			let sourcePath = pathname;
			let targetPath = path.join(target.path, pathname.replace(objTemp.module, ''));
			// 是否需要重命名
			if (config.rename) {
				targetPath = targetPath.replace(/[a-z0-9]+(\.[a-z0-9]+$)/i, `${target.name}$1`)
			}
			// 创建或覆盖文件
			fs.copySync(sourcePath, targetPath)

			const outPath = targetPath.split('/').slice(0, -1).join('/')
			const outFile = targetPath.split('/').slice(-1)[0]
			log.info(` ${outPath}/{${file} => ${outFile}}`, actionText)
		})
		log.disable(!!forbid)
		log.success(STREND.format(target.name, actionText))
		log.disable(false)
		// 操作完成后的回调
		script.onAfter && script.onAfter('create', objTemp.module, target.path)
	} catch (err) {
		log.error(STRFAIL.format(target.name, actionText, err))
		process.exit(0)
	}
}

/**
 * 获取用户选择结果对应的输出文本
 * @param  {string} answer 选择结果
 * @return {string}        选择结果对应的输出文本
 */
function actionTextByAnswer(answer){
	// 当前的行为文本
	let actionText = '';
	// 判断是否有选择
	if (answer && answer.indexOf(TEXTCANCEL) == -1){
		actionText = TEXTCREATE
		answer.indexOf(TEXTCOVER) > -1 && (actionText = TEXTCOVER)
		answer.indexOf(TEXTREPLACE) > -1 && (actionText = TEXTREPLACE)
	}
	return actionText
}

module.exports = (pageName, option) => {
	// console.console.log('module into:', pageName, option)

	// 获取模版名称
	const moduleName = option.template;	
	// 获取当前文件信息
	const exist = FileExist(pageName);
	// 判断当前页面是否已存在
	if (exist.result){
		// 弹出确认覆盖提示
		const prompt = new list({
			name: 'operation',
			message: `当前页面已存在，请选择您进行的操作？`,
			choices: [
				TEXTCANCEL.gray,
				`${TEXTREPLACE}`.cyan,
				`${TEXTCOVER}`.cyan
			]
		});
		// 监听选择行为
		prompt.ask((answer) => {
			// 操作结果
			const actionText = actionTextByAnswer(answer)

			if (!actionText) return

			// 如果有文本, 则执行后续操作
			if(actionText == TEXTREPLACE)
				// 放在外面引用会在加载时出现循环引用导致报错, 因此只有使用时才引用
				require('./commander-reset').ResetProcessing(exist, moduleName, '替换')
			else 
				CreateProcessing(exist, moduleName, actionText)
		})
	} else {
		// 直接创建页面
		CreateProcessing(exist, moduleName, TEXTCREATE);
	}
}

module.exports.CreateProcessing = CreateProcessing


