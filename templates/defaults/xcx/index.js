const path = require('path')
const fs = require('fs-extra')
const writeJson = require('write-json')

exports.onBefore = async (cmd, { modulePath, targetPath, config }) => {
	// console.log('onBefore:', cmd, modulePath, targetPath, config)
	// return false
}

exports.onAfter = async (cmd, { modulePath, targetPath, config }) => {
	// console.log('onAfter:', cmd, modulePath, targetPath, config)
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
		// console.log(cmd, pages)
		switch(cmd){
			case 'create':
				pages.includes(route) || pages.push(route)
				break;
			case 'delete':
				if (pages.includes(route)){
					const i = pages.indexOf(route)
					pages.splice(i, i)
				}
				break;
		}
		writeJson.sync(appPath, pagesJson)
	}
}