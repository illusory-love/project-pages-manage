const path   = require('path')
const fs     = require('fs-extra')
const Yml    = require('yml')
const colors = require('colors')
const format = require('string-format')

const { cwd, dir } = require('./constants')

// format 方法注册
format.extend(String.prototype)

/**
 * 处理不带 - 的命令
 * @param {string} cmd 命令名称	
 * @return {[type]} [description]
 */
function ordinaryOrders(cmd){
	if (cmd == 'ls'){
		// 列出目前支持的所有模版
		// 获取配制信息
		const conf = Yml.load(path.join(dir, `config.yml`))
		// 输出默认模版
		outputModule('默认', conf.DefaultTemplate)
		// 输出自定义模版
		outputModule('自定义', conf.CustomTemplate)
	}
}

/**
 * 输出所有模版目录下的支持模版
 * @param  {string} tagText    		 模版标签文本
 * @param  {array}  moduleDirectorys 模版路径
 * @return {[type]}            [description]
 */
function outputModule(tagText, moduleDirectorys){
	// 判断是否存在模版
	if (moduleDirectorys){
		// 遍历模版路径
		moduleDirectorys.split(',').forEach((directory) => {
			// 获取当前模版完整路径
			const modulePath  = path.join(dir, directory)
			console.log(`>>> ${tagText}模版`.cyan + `「${modulePath}」`.gray)
			// 读取目录下所有的文件并遍历
			fs.readdirSync(modulePath).forEach((file) => {
				// 获取当前文件完整路径
				const pathname = path.join(modulePath, file)
				// 判断当前是否是目录, 因页面模版都是目录形式
				if (fs.lstatSync(pathname).isDirectory()){
					console.log(`[模版]`.cyan + ` ${file}`)
				}
			})
		})
	}
}

/**
 * 处理正常的 - 命令
 * @param {object} option 命令配制对象
 * @return {[type]} [description]
 */
function normalOrders(option, name){
	if (option.add){
		// 添加模版
		const conf = Yml.load(path.join(dir, `config.yml`))
		// 获取定义模版
		const moduleList = getListOfExistTemplates(conf.CustomTemplate)
		// 遍历模版, 判断当前模版是否已存在
		moduleList.forEach((module) => {
			if (module.name == name){
				console.warn(`模版「${name}」已存在`.yellow)
				process.exit(0)
			}
		})

		// 添加
	}
}

/**
 * 获取所有存在的模版
 * @param  {string}  moduleDirectorys 系统默认的自定义模版配制路径
 * @return {array}                    已存在的模版
 */
function getListOfExistTemplates(moduleDirectorys){
	// 模版列表
	const moduleList = []
	// 判断是否存在模版
	if (moduleDirectorys){
		// 遍历模版路径
		moduleDirectorys.split(',').forEach((directory) => {
			// 获取当前模版完整路径
			const modulePath = path.join(dir, directory)
			const moduleJson = { 
				path: modulePath, 
				name: [] 
			}
			// 读取目录下所有的文件并遍历
			fs.readdirSync(modulePath).forEach((filename) => {
				// 获取当前文件完整路径
				const pathname = path.join(modulePath, filename)
				// 判断当前是否是目录
				// 因页面模版都是目录形式
				if (fs.lstatSync(pathname).isDirectory()){
					moduleJson.name.push(filename)
				}
			})
			moduleList.push(moduleJson)
		})
	}
	return moduleList
}

module.exports = (option) => {
	// 命令格式验证
	typeof option === 'string' ? ordinaryOrders(option) : normalOrders(option)
}