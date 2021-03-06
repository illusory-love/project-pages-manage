const path = require('path')
const fs   = require('fs-extra')
const Yaml = require('read-yaml')
const write = require('write-yaml')

const { cwd, dir } = require('./constants')

const pathConfig = path.join(dir, `./config/config.yml`)
const pathModule = path.join(dir, `./config/modulepage.yml`)

/**
 * 获取指定名称的所有模版信息
 * @param  {string} pathName 模版名称
 * @return {array}           模版信息集合
 */
function getExistTemplateInformation(pathName){
	// 获取配制信息
	const template = Yaml.sync(pathConfig).template
	// 优先取当前执行命令的目录
	// 添加配制中的所有模版路径
	const cusDefaultDirectorys = template.custom.dir
	const cusDirectorys        = template.custom.cwd.map(arr => arr[1])
	const defDirectorys        = template.default

	// 遍历获取存在的模版, 不同目录可能存在同名的模版
	const cusDefaultTemp = filterTemplate(cusDefaultDirectorys, {
		root: dir,
		name: pathName
	})
	const cusTemp = filterTemplate(cusDirectorys, {
		root: cwd,
		name: pathName
	})
	const defTemp = filterTemplate(defDirectorys, {
		root: dir,
		name: pathName
	})

	// 追加各模版源路径的查找
	let sourceTemplates = []
	template.custom.cwd.map(arr => {
		sourceTemplates = sourceTemplates.concat(filterTemplate([arr[1]], {
			root: arr[0],
			name: pathName
		}))
	})

	return cusDefaultTemp.concat(cusTemp).concat(defTemp).concat(sourceTemplates).map(templateInformationByPathForCallback)
}
/**
 * 获取指定路径下的模版信息
 * @param  {string} tempPath 模版路径
 */
function templateInformationByPathForCallback(tempPath){
	// 获取指定文件完整路径路径
	const modulePath = path.join(tempPath, 'pages')
	const configPath = path.join(tempPath, 'config.yml')
	const scriptPath = path.join(tempPath, 'index.js')

	return {
		root  : tempPath,
		module: modulePath,
		config: fs.pathExistsSync(configPath) ? Yaml.sync(configPath) : {},
		script: fs.pathExistsSync(scriptPath) ? require(scriptPath) : {}
	}
}

/**
 * 筛选模版路径
 * @param  {array}   directorys    		模版路径数组
 * @param  {string}  options.root	  	根目录
 * @param  {string}  options.pathname  	待查找的模版名称
 * @param  {boolean} options.notExist 	是否仅保留存在的模版路径(def: false)
 * @return {array}               		处理完成的模版路径
 */
function filterTemplate(directorys, { root, name, notExist }){
	// 将模版路径转化为绝对路径
	directorys = directorys.map(directory => path.join(root, directory, name))
	// 是否仅返回存在的模版路径
	notExist || (directorys = directorys.filter(directory => fs.pathExistsSync(directory)))
	// 返回处理完成的模版路径数组
	return directorys
}


// 页面模版映射管理 
const modulePage = {
	set: function(path, module){
		// 获取模版映射配制, 每次调用是重新获取以保证是最新的
		let mapping = Yaml.sync(pathModule) || {}
		// 添加映射
		mapping[path] = module
		// 更新配制
		write.sync(pathModule, mapping)
	},
	get: function(path){
		// 获取模版映射配制, 每次调用是重新获取以保证是最新的
		let mapping = Yaml.sync(pathModule) || {}
		// 获取映射
		return mapping[path]
	},
	del: function(path){
		// 获取模版映射配制, 每次调用是重新获取以保证是最新的
		let mapping = Yaml.sync(pathModule) || {}
		// 删除映射
		delete mapping[path]
		// 更新配制
		write.sync(pathModule, mapping)
	}
}


module.exports = (name) => {
	// 获取存在的模版信息
	return name && getExistTemplateInformation(name)
}

module.exports.filterTemplate = filterTemplate
module.exports.modulePage = modulePage




