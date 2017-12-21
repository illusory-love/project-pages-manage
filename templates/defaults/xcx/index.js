const path = require('path')
const fs = require('fs-extra')
const writeJson = require('write-json')

exports.onBefore = async (cmd, modulePath, targetPath) => {
	// console.log('onBefore:', cmd, modulePath, targetPath)
	// return false
}

exports.onAfter = async (cmd, modulePath, targetPath) => {
	// console.log('onAfter:', cmd, modulePath, targetPath)
	// 创建完成后更新 app.json 配制
	// 获取 app.json 配制文件
	const cwd     = process.cwd()
	const appPath = path.join(cwd, 'app.json')
	// 判断此配制文件是是否存在
	if (fs.pathExistsSync(appPath)){
		let pagesJson = require(appPath)
		let pages     = pagesJson.pages
		let route     = targetPath.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '').split('/')
		// 转换成app.json中的路由
		route = route.concat(route.slice(-1)).join('/')
		// 判断当前路由是否已经存在了
		if (!pages.includes(route)){
			pages.push(route)
			writeJson.sync(appPath, pagesJson)
		}
	}
}