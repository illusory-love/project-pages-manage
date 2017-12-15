const path   = require('path')
const fs     = require('fs-extra')
const readYaml = require('read-yaml')
const writeYaml = require('write-yaml')
const colors = require('colors')
const format = require('string-format')

const { cwd, dir } = require('../constants')
const { forEachFiles } = require('../utils')

// format 方法注册
format.extend(String.prototype)

// 配制文件路径
const yamlPath = path.join(dir, `config.yml`)

/**
 * 处理不带 - 的命令
 * @param {string} cmd 命令名称	
 * @return {[type]} [description]
 */
function ordinaryOrders(cmd){
	if (cmd == 'ls'){
		// 列出目前支持的所有模版
		// 获取配制信息
		const template = readYaml.sync(yamlPath).template

		const modulePath1 = template.default.map((directory) => path.join(dir, directory))
		const modulePath2 = template.custom.dir.map((directory) => path.join(dir, directory))
		const modulePath3 = template.custom.cwd.map((directory) => path.join(cwd, directory))

		// 输出默认模版
		outputModule('默认', getListOfExistTemplates(modulePath1))
		// 输出自定义模版
		outputModule('自定义', getListOfExistTemplates(modulePath2))
		outputModule('自定义', getListOfExistTemplates(modulePath3))
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
	if (moduleDirectorys.length){
		// 遍历模版路径
		moduleDirectorys.forEach((module) => {
			// 获取当前模版完整路径
			const modulePath  = module.path

			console.log(`>>> ${tagText}模版`.cyan + `「${modulePath}」`.gray)
			// 读取目录下所有的文件并遍历
			module.name.forEach((file) => console.log(`[模版]`.cyan + ` ${file}`))
		})
	}
}

/**
 * 处理正常的 - 命令
 * @param {object} option 命令配制对象
 * @return {[type]} [description]
 */
function normalOrders(option){

	if (option.add){
		// 获取需要添加的模版名称
		const addModuleName = option.add;
		// 获取当前模版配制信息
		const conf = readYaml.sync(yamlPath)
		

		// 准备添加模版
		if (option.global){
			// 将自定义模版添加到全局
			// 判断本地的模版目录是否存在 
			const localModulePath = path.join(cwd, addModuleName)

			if (!fs.existsSync(localModulePath)){
				console.error(`[错误]`.cyan + ` 源页面模版「${addModuleName}」不存在`.red)
				process.exit(0)
			}

			const modulePath = conf.template.custom.dir.map((directory) => path.join(dir, directory))
			// 获取所有自定义模版
			const moduleList = getListOfExistTemplates(modulePath)

			// 遍历模版, 判断当前模版是否已存在
			// 将二维数组转成一维数组
			if ([].concat.apply([], moduleList.map((module) => module.name)).includes(addModuleName)){
				console.warn(`[警告]`.cyan + ` 已存在同名模版`.yellow)
				process.exit(0)
			}
			
			// 添加自定义模版至全局中
			forEachFiles(localModulePath, (pathname, filename) => {
				const sourcePath = pathname
				const targetPath = path.join(modulePath[0], pathname.replace(cwd, ''))

				fs.copySync(sourcePath, targetPath)

				console.log(`[信息]`.cyan + ` ${sourcePath} => ${targetPath}`)
			})
		} else {
			// 添加本地模版目录,以命令执行
			const cwd = conf.template.custom.cwd

			if (cwd.includes(addModuleName)){
				console.warn(`模版目录「${addModuleName}」已存在`.yellow)
				process.exit(0)
			}
			
			cwd.push(addModuleName)
			writeYaml.sync(yamlPath, conf)

			console.log(`[info]`.cyan + ` 模版目录「${addModuleName}」添加成功`.green)
		}
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
	if (moduleDirectorys.length){
		// 遍历模版路径
		moduleDirectorys.forEach((modulePath) => {
			// 因添加的自定义模版目录并不是所有项目中都有, 所以需要判断他是否存在 
			if (fs.existsSync(modulePath)){
				const moduleJson = { 
					path: modulePath, 
					name: [] 
				}
				// 读取模版目录下所有的存在的模版
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
			}
		})
	}
	return moduleList
}

module.exports = (cmd, name) => {
	// 命令格式验证
	!{
		add:normalOrders,
		ls :ordinaryOrders
	}[cmd]()
	// typeof option === 'string' ? ordinaryOrders(option) : normalOrders(option)
}






