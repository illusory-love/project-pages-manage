const path = require('path')
const fs = require('fs-extra')
const writeJson = require('write-json')

const {getSubPackIndexByName} = require('./libs/utils')

exports.onBefore = async (cmd, { modulePath, targetPath, config }) => {
	// console.log('onBefore:', cmd, modulePath, targetPath, config)
	// return false
}

exports.onAfter = async (cmd, { modulePath, targetPath, config }) => {
	// console.log('onAfter:', cmd, modulePath, targetPath, config)
	// 创建完成后更新 app.json 配制
	// 获取 app.json 配制文件
	const cwd     = process.cwd()
	// 验证当前目录是否存在 src 默认目录
	const hasSrcFolder = fs.pathExistsSync(path.join(cwd, 'src'));
	const appPath = path.join(cwd, hasSrcFolder ? 'src' : '', 'app.json')
	// 判断此配制文件是是否存在
	if (fs.pathExistsSync(appPath)){
		let pagesJson = require(appPath)
		let pages     = pagesJson.pages
		let subPack   = pagesJson.subPackages
		// route => ['pages', 'user_map']
		let route     = targetPath.replace(cwd, '').split(path.sep).filter(n => n && n !== 'src')
		
		// 获取当前可能存在的分包对象
		const sub_index = getSubPackIndexByName(subPack, route[0]);
		// 当前分包
		const sub_cur   = subPack[sub_index];

		// console.log(cmd, pages)

		// 判断当前操作的是否是分包
		if (sub_cur !== undefined){
			// 更新对应的分包路由
			pages = sub_cur.pages
			route = route.slice(1).concat(route.slice(-1)).join('/')
		} else {
			// 转换成app.json中的路由
			// route => pages/user_map/user_map
			route = route.slice(1).concat(route.slice(-1)).join('/')
		}

		switch(cmd){
			case 'create':
				pages.includes(route) || pages.push(route)
				break;
			case 'delete':
				pages.includes(route) && pages.splice(pages.indexOf(route), 1)
				break;
		}

		if (sub_cur){
			// 更新分包中的 pages
			subPack[sub_index].pages = pages;
			pagesJson.subPackages = subPack;
		} else {
			// 更新页面 pages
			pagesJson.pages = pages;
		}

		// 写入更新配置文件
		writeJson.sync(appPath, pagesJson)
	}
}