const list   = require('prompt-list')
const path   = require('path')
const fs     = require('fs-extra')
const colors = require('colors')
const format = require('string-format')

const { FileExist, Log, Error } = require('./utils')
const { DeleteProcessing } = require('./commander-delete')
const { cwd, dir }     = require('./constants')
// format 方法注册
format.extend(String.prototype)

// 常量字符定义
const STRBEIGN = `>>> 页面『{0}』正在{1}...`.magenta
const STREND   = `>>> 页面『{0}』{1}完成。`.magenta
const STRNOT   = `>>> 页面『{0}』不存在。`.yellow
const STRFAIL  = `<<< error >>> 页面『{0}』{1}失败 \n {2}`.red

const TEXTCREATE = '创建'
const TEXTCOVER = '覆盖'
const TEXTREPLACE = '替换'
const TEXTCANCEL = '取消'

/**
 * 创建页面
 * @param  {string} pageName   将要创建的页面名称
 * @param  {string} targetPath 当前页面或目录完整路径
 * @param  {string} moduleName 模版名称
 * @param  {string} actionText 操作文本
 */
function CreateProcessing(pageName, targetPath, moduleName = '', actionText){
	Log(STRBEIGN.format(pageName, actionText))
	// 当前模版路
	let sourcePath = path.join(dir, `../templates`, moduleName, `module`)
	// 开始复制或覆盖文件
	try{
		fs.copySync(sourcePath, targetPath)
		Log(STREND.format(pageName, actionText))
	} catch (err) {
		Error(STRFAIL.format(pageName, actionText, err))
		throw err
	}
}

/**
 * 获取用户选择结果对应的输出文本
 * @param  {string} answer 选择结果
 * @return {string}        选对结果对应的输出文本
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
	// console.log('module into:', pageName, option)

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


