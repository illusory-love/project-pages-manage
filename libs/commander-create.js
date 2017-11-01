const Radio  = require('prompt-radio')
const path   = require('path')
const fs     = require('fs-extra')
const colors = require('colors')

const fileIsExist  = require('./file-check')
const deletePages  = require('./commander-delete')
const { cwd, dir } = require('./constants')


/**
 * 创建页面
 * @param  {string} pageName   将要创建的页面名称
 * @param  {string} moduleName 模版名称
 */
function createPage(pageName, moduleName, answer){
	// 当前模版路
	let sourcePath = path.join(dir, `../templates`, moduleName, `module`)
	// 生成页面的路径
	let targetPath = path.join(cwd, pageName)
	// 操作文案
	let operText = '创建'

	if (answer && answer.indexOf('覆盖') != -1)
		operText = '覆盖'
	if (answer && answer.indexOf('替换') != -1){
		operText = '替换'
		// 删除页面
		deletePages(pageName, false)
	}

	console.log(`>>> 页面【${ pageName }】正在${ operText }...`.yellow)
	// 开始复制或覆盖文件
	try{
		fs.copySync(sourcePath, targetPath)
		console.log(`>>> 页面【${ pageName }】${ operText }成功`.green)
	} catch (err) {
		console.error(`<<< error >>> 页面【${ pageName }】${ operText }失败: \n${err}`.red)
	}
}

module.exports = (pageName, option) => {
	// console.log('module into:', pageName, option)
	if (option === undefined)
		return;

	// 获取模版名称
	const moduleName = option.template;	

	// console.log(pageName, FileIsExist(pageName))
	// 判断当前页面是否已存在
	if (fileIsExist(pageName)){
		// 弹出确认覆盖提示
		const prompt = new Radio({
			name: 'operation',
			message: `当前页面已存在，请选择您进行的操作`+ `（空格确认选择）`.gray + `？`,
			choices: [
				'覆盖（不会对新增文件产生影响）'.cyan, 
				'替换（删除并新创建当前页面）'.cyan,
				'取消'.gray
			]
		});

		prompt.ask((answer) => {
			// console.log('您的选择: ', answer)
			if (answer != '取消'.gray && answer != undefined){
				// 覆盖文件
				createPage(pageName, moduleName, answer)
			}
		})
	} else {
		// 直接创建页面
		createPage(pageName, moduleName);
	}
}