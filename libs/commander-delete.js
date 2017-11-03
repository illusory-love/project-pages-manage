const Confirm = require('prompt-confirm')
const path    = require('path')
const fs      = require('fs-extra')
const colors  = require('colors')

const fileIsExist = require('./file-check')
const { cwd } = require('./constants')

/**
 * 删除指定页面
 * @param  {string}  pageName 目录或文件名称
 */
function deletePages(pageName) {
	// 获取目标页面目录
	let targetPath = path.join(cwd, pageName)

	console.log(`>>> 页面【${ pageName }】正在删除...`.yellow)

	try{
		fs.removeSync(targetPath)
		console.log(`>>> 页面【${ pageName }】删除成功`.green)
	} catch (err) {
		console.error(`<<< error >>> 页面【${ pageName }】删除失败 \n ${ err }`.red)
	}
}

module.exports = function(pageName, option) {
	console.log(this)
	// 判断页面是否存在
	if (!fileIsExist(pageName)){
		console.error(`>>> 删除失败 页面【${ pageName }】不存在`.red)
		return;
	}

	// 通过 option 来标识当前的行为
	if (option === false){
		// 表示不是通过命令来的
		deletePages(pageName)
	} else {
		// 提示确认是否删除 
		const propmt = new Confirm(`您确定要删除此页面吗？`);

		propmt.ask(answer => {
			// 选择了是则删除
			answer && deletePages(pageName)
		})
	}
}