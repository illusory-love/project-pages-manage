const list   = require('prompt-list')
const path   = require('path')
const fs     = require('fs-extra')
const colors = require('colors')
const readYaml  = require('read-yaml')

const { FileExist, forEachFiles } = require('../utils')
const { DeleteProcessing } = require('./commander-delete')
const { cwd, dir }     = require('../constants')
const templates = require('../template')
const log = require('../log')

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在{1}...`.magenta
const STREND   = `>>> 页面『{0}』{1}完成。`.green
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRNOTTMP= `>>> 模版『{0}』不存在。`.yellow
const STRABORT = `>>> 页面『{0}』{1}行为被模版脚本 onBefore 中止`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』{1}失败 \n {2}`.red

const TEXTCREATE  = '创建'
const TEXTCOVER   = '覆盖'
const TEXTREPLACE = '替换'
const TEXTCANCEL  = '取消'
const TEXTRESET   = '重置'

// 配制文件路径
const yamlConfig = readYaml.sync(path.join(dir, `config.yml`))
const defModule  = yamlConfig.default.module

/**
 * 创建页面
 * @param  {string}   target  目标创建页信息对象
 *                    target.result {boolean} 目标文件是否存在
 *                    target.name   {string}  目标页面名称
 *                    target.path   {string}  目标文件完整路径
 * @param  {string}   moduleName    模版名称
 * @param  {object}   option  配制项
 * @param  {string}   option.actionText 当前的操作名称
 * @param  {boolean}  option.forbid     禁止输出日志
 * @param  {function} option.onBefore   创建前的回调
 */
async function CreateProcessing(target, moduleName = defModule, { actionText, forbid, onBefore } = { actionText: TEXTCREATE }){
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
			await prompt.run().then(answer => {
				if (!answer.includes('取消')){
					// 获取当前选择的对象
					const index = answer.match(/\[.+-(\d+)\]/)[1]
					operationModule(objTemp[index], target, { actionText, forbid, onBefore })
				}
			})
		} else {
			// 创建文件
			operationModule(objTemp[0], target, { actionText, forbid, onBefore })
		}
	} else {
		// 模版不存在,输出警告直接退出
		log.warn(STRNOTTMP.format(moduleName))
		process.exit(0)
	}
}

/**
 * 根据指定的模版生成页面
 * @param  {object}   objTemp       模版信息对象
 *                    objTemp.module {string} 模版名称
 *                    objTemp.config {object} 模版配置信息
 *                    objTemp.script {object} 模版自定义脚本
 * @param  {string}   target  目标创建页信息对象
 *                    target.result {boolean} 目标文件是否存在
 *                    target.name   {string}  目标页面名称
 *                    target.path   {string}  目标文件完整路径
 * @param  {object}   option  配制项
 * @param  {string}   option.actionText 当前的操作名称
 * @param  {boolean}  option.forbid     禁止输出日志
 * @param  {function} option.onBefore   创建前的回调
 */
async function operationModule(objTemp, target, { actionText, forbid, onBefore }){
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
		const reg = /\/|\\/
		// 获取模块脚本可能存在的监听结果
		const promiseCallbcak = script.onBefore ? script.onBefore('create', modulePath, target.path, config) : Promise.resolve()
		
		// 根据模版脚本返回值确定是否继续操作
		if (await promiseCallbcak === false){
			// 表示脚本不允许继续往下执行了
			log.warn(STRABORT.format(target.name, actionText))
			process.exit(0)
		}

		// 在调用此方法时执行创建行为之前的回调
		onBefore && onBefore()

		// 正常流程, 开始创建文件
		log.info(` ${modulePath} => ${target.path}`, actionText)

		// 单文件创建, 便于输出日志
		forEachFiles(modulePath, (pathname, file) => {
			let sourcePath = pathname;
			let targetPath = path.join(target.path, pathname.replace(objTemp.module, ''));

			// 是否需要重命名
			if (config.rename) {
				const targetName = target.name.split(reg).slice(-1)[0]
				targetPath = targetPath.replace(/[a-z0-9]+(\.[a-z0-9]+$)/i, `${targetName}$1`)
			}

			// 创建或覆盖文件
			fs.copySync(sourcePath, targetPath)

			if (config.rename){
				const outPath = targetPath.split(reg).slice(0, -1).join('/')
				const outFile = targetPath.split(reg).slice(-1)[0]
				log.info(` ${outPath}/{${file} => ${outFile}}`, actionText)
			} else {
				log.info(`${sourcePath} => ${targetPath}`)
			}
		})
		log.disable(!!forbid)
		log.success(STREND.format(target.name, actionText))
		log.disable(false)
		// 操作完成后的回调
		script.onAfter && script.onAfter('create', modulePath, target.path, config)
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
	// 获取模版名称
	const moduleName = option.template;	
	// 获取当前文件信息
	const exist = FileExist(pageName);
	// log.info('moduleName:'+ moduleName)
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
				CreateProcessing(exist, moduleName, { actionText } )
		})
	} else {
		// 直接创建页面
		CreateProcessing(exist, moduleName, { actionText: TEXTCREATE });
	}
}

module.exports.CreateProcessing = CreateProcessing


