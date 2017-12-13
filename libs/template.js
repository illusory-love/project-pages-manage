const path         = require('path')
const fs           = require('fs-extra')
const { cwd, dir } = require('./constants')
const Yml          = require('yml')

/**
 * 获取指定名称的所有模版信息
 * @param  {string} pathName 模版名称
 * @return {array}           模版信息集合
 */
function getExistTemplateInformation(pathName){
	// 获取配制信息
	const config = Yml.load(path.join(dir, `config.yml`))
	// 优先取当前执行命令的目录
	// 添加配制中的所有模版路径
	const cusDirectorys = config.CustomTemplate.split(',')
	const defDirectorys = config.DefaultTemplate.split(',')

	// 遍历获取存在的模版, 不同目录可能存在同名的模版
	const cusTemp = cusDirectorys
		.map((directory) => path.join(cwd, directory, pathName))
		.filter((directory) => fs.pathExistsSync(directory))
	const defTemp = defDirectorys
		.map((directory) => path.join(dir, directory, pathName))
		.filter((directory) => fs.pathExistsSync(directory))

	return cusTemp.concat(defTemp).map(templateInformationByPathForCallback)
}

/**
 * 获取指定路径下的模版信息
 * @param  {string} tempPath 模版路径
 */
function templateInformationByPathForCallback(tempPath){
	// 获取指定文件完整路径路径
	const modulePath = path.join(tempPath, 'module')
	const configPath = path.join(tempPath, 'config.yml')
	const scriptPath = path.join(tempPath, 'index.js')

	return {
		module: modulePath,
		config: fs.pathExistsSync(configPath) ? Yml.load(configPath) : null,
		script: fs.pathExistsSync(scriptPath) ? require(scriptPath) : null
	}
}

module.exports = (name) => {
	// 获取存在的模版信息
	return name && getExistTemplateInformation(name)
}
