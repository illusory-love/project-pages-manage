const list   = require('prompt-list')
const path   = require('path')
const fs     = require('fs-extra')
const colors = require('colors')
const format = require('string-format')

const { FileExist, forEachFiles } = require('./utils')
const { DeleteProcessing } = require('./commander-delete')
const { cwd, dir }     = require('./constants')
const templates = require('./template')
// format 方法注册
format.extend(String.prototype)

// 常量字符定义
const STRBEIGN = `>>> 模版『{0}』正在{1}...`.magenta
const STREND   = `>>> 模版『{0}』{1}完成。`.magenta
const STRNOT   = `>>> 模版『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』{1}失败 \n {2}`.red
const STRABORT = `>>> 模版『{0}』{1}行为被用户中止`.yellow

const TEXTCREATE  = '创建'
const TEXTCOVER   = '覆盖'
const TEXTREPLACE = '替换'
const TEXTCANCEL  = '取消'

/**
 * 创建页面
 * @param  {string} pageName   将要创建的页面名称
 * @param  {string} targetPath 当前页面或目录完整路径
 * @param  {string} moduleName 模版名称
 * @param  {string} actionText 操作文本
 */
function CreateProcessing(pageName, targetPath, moduleName = '', actionText){
	// 当前模版路
	let temp = templates(moduleName)

	if (temp.length){
		// 验证当前是否有多个模版
		if (temp.length > 1){
			// 获取选择项
			const choices = temp.map((tmp, idx) => `「${pageName + idx}」\t ${tmp.module}`).concat(['取消'])
			// 弹出选择列表
			const prompt = new List({
				name: 'choiceTemplate',
				message: `请选择您需要{0}的模版`.format(actionText),
				choices
			})
			prompt.ask(answer => {
				console.console.log(answer)
			})
		} else {
			operationModule(temp[0], pageName, actionText, targetPath)
		}
	} else {
		console.warn(STRNOT.format(pageName))
		process.exit(0)
	}
}

async function operationModule(temp, pageName, actionText, targetPath){
	// 执行开始创建
	console.log(STRBEIGN.format(pageName, actionText))
	// 获取源模版路径
	let sourcePath = temp.module
	// 开始复制或覆盖文件
	try{
		// 操作前的回调
		const cbResult = await temp.onBefore && temp.onBefore('create', temp.module)

		if (cbResult === false){
			console.log(STRABORT.format(pageName, actionText))
			process.exit(0)
		}
		// 复制模版目录
		fs.copySync(sourcePath, targetPath)

		if (temp.config.rename){
			console.log(`>>> 开始文件重命名`.magenta)
			// 遍历目录下所有的文件
			forEachFiles(targetPath, (pathname, file) => {
				// 获取新老文件的目录
				const oldPathname = pathname
				const newPathname = pathname.replace(/[a-z0-9]+(\.[a-z0-9]+$)/i, `${pageName}$1`)
				// 日志输出时的旧文件
				const outPathname = oldPathname.replace(cwd, '')
				// 开始重命名
				fs.renameSync(oldPathname, newPathname)
				// 打印重命名的过程
				console.log(`${outPathname} => ${newPathname}`.gray)
			});
			console.log(`>>> 文件重命名结束`.magenta)
		}

		console.log(STREND.format(pageName, actionText))

		temp.onAfter && temp.onAfter('create', temp.module)
	} catch (err) {
		console.error(STRFAIL.format(pageName, actionText, err))
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
				`${TEXTCOVER}（不会对新增文件产生影响）`.cyan, 
				`${TEXTREPLACE}（删除并新创建当前页面）`.cyan,
				TEXTCANCEL.gray
			]
		});
		// 监听选择行为
		prompt.ask((answer) => {
			// 操作结果
			const actionText = actionTextByAnswer(answer)
			// 如果有文本, 则执行后续操作
			actionText && CreateProcessing(pageName, exist.path, moduleName, actionText)
		})
	} else {
		// 直接创建页面
		CreateProcessing(pageName, exist.path, moduleName, TEXTCREATE);
	}
}

module.exports.CreateProcessing = CreateProcessing


