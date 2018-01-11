const path      = require('path')
const fs        = require('fs-extra')
const readYaml  = require('read-yaml')
const writeYaml = require('write-yaml')
const colors    = require('colors')
const Confirm   = require('prompt-confirm')


const { cwd, dir } = require('../constants')
const { forEachFiles } = require('../utils')
const { filterTemplate } = require('../template')
const log = require('../log')

// 配制文件路径
const yamlPath = path.join(dir, `./config/config.yml`)

// ls命令 列出目前所有的默认及自定义模版
function ordersList(){
	// 列出目前支持的所有模版
	// 获取配制信息
	const template = readYaml.sync(yamlPath).template

	const modulePath1 = template.default.map((directory) => path.join(dir, directory))
	const modulePath2 = template.custom.dir.map((directory) => path.join(dir, directory))
	const modulePath3 = template.custom.cwd.map((array) => path.join.apply(null, array))
	const modulePath4 = template.custom.cwd.map((array) => path.join(cwd, array[1]))

	// 输出默认模版
	outputModule('默认', getListOfExistTemplates(modulePath1))
	// 输出自定义模版
	outputModule('全局（自定义）', getListOfExistTemplates(modulePath2))
	outputModule('本地（源路径）', getListOfExistTemplates(modulePath3))
	outputModule('本地（当前路径）', getListOfExistTemplates(modulePath4))
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
			// 输出模版目录
			log.info(`${module.path}`.magenta, tagText)
			// 读取目录下所有的文件并遍历
			log.info(module.name.join(' '), '模版名称')
		})
	}
}

/**
 * 添加横版
 * @param {string} name   添加的模版名称或路径
 * @param {object} option 二级命令
 */
async function ordersAdd(name, option){
	// 获取当前模版配制信息
	const conf = readYaml.sync(yamlPath)
	// 处理未指定模版名称的情况
	if (!name){
		log.warn(`未指定需要添加的模版名称`.yellow)
		process.exit()
	}

	// 准备添加模版
	if (option.global){
		// 将自定义模版添加到全局
		// 判断本地的模版目录是否存在 
		const localModulePath = path.join(cwd, name)
		// 验证待复制的模版目录是否存在
		if (!fs.existsSync(localModulePath)){
			log.warn(`源页面模版「${name}」不存在`.red)
			process.exit(0)
		}

		const modulePath = conf.template.custom.dir.map((directory) => path.join(dir, directory))
		// 获取所有自定义模版
		const moduleList = getListOfExistTemplates(modulePath)

		// 遍历模版, 判断当前模版是否已存在
		// 将二维数组转成一维数组
		// 因只要添加至全局的模版都会放置一级目录, 因此只需要以获取传入的尾部模版名称来判断
		// temp/xcx 只需要 xcx 就可以了
		const targetName = name.split(/\/|\\/).slice(-1)[0]
		if ([].concat.apply([], moduleList.map((module) => module.name)).includes(targetName)){
			const prompt = new Confirm('已存在同名模版，是否替换？')
			await prompt.run().then(answer => answer || process.exit())
		}
		
		// 删除当前目录
		fs.removeSync(path.join(modulePath[0], targetName))
		// 添加自定义模版至全局中
		forEachFiles(localModulePath, (pathname, filename) => {
			// console.log(pathname, ' : ', filename)
			// proj template add temp2/module -g
			// /Users/wg/Documents/projects/test/pages/temp2/module/index.js : index.js
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/images : images
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/readme.md : readme.md
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/scripts/index.js : index.js
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/scripts : scripts
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/styles/main.less : main.less
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/styles/vars.less : vars.less
			// /Users/wg/Documents/projects/test/pages/temp2/module/pages/styles : styles
			const sourcePath = pathname
			/** 
			 * 处理复制至全局后的模版目录名称
			 * 添加时仅保留模版的名称
			 * 比如执行: proj t add modulepath/modulename 
			 * 最终添加至全局的是: ./customize/modulename
			 * 不会是: ./customize/modulepath/modulename
			**/
			const _module    = targetName
			const _path      = path.join(cwd, name.replace(_module, ''))
			const _name      = pathname.replace(_path, '')
			const targetPath = path.join(modulePath[0], _name)

			// console.log(_module, _path, _name, targetPath);
			// module /Users/wg/Documents/projects/test/pages/temp2/ module/pages/scripts/index.js /Users/wg/Documents/projects/project-pages-manage/templates/customize/module/pages/scripts/index.js
			// 复制当前文件
			fs.copySync(sourcePath, targetPath)
			log.info(`${sourcePath} => ${targetPath}`)
		})
		log.success(`模版「${name}」添加成功`.green)
	} else {
		// 添加本地模版目录,以命令执行
		const _cwd = conf.template.custom.cwd
		// 验证当前模版路径是否已经添加过了
		if (_cwd.filter(arr => arr[1] == name).length){
			log.warn(`模版目录「${name}」已存在`.yellow)
			process.exit(0)
		}
		// 添加当前模版
		// 模版的源根路径(执行命令时的目录), 模版相对路径
		_cwd.push([cwd, name])
		writeYaml.sync(yamlPath, conf)

		log.success(`模版目录「${name}」添加成功`.green)
	}
}

/**
 * 获取所有存在的模版
 * @param  {string}  moduleDirectorys 模版路径列表
 * @return {array}                    已存在的模版
 *
 * @param {string} return.path 模版完整根路径
 * @param {array}  return.name 模版名称列表
 */
function getListOfExistTemplates(moduleDirectorys){
	// 模版列表
	const moduleList = []
	// 判断是否存在模版
	if (moduleDirectorys.length){
		// 遍历模版路径
		moduleDirectorys.forEach((modulePath) => {
			const moduleJson = { 
				path: modulePath, 
				name: [] 
			}
			// 因添加的自定义模版目录并不是所有项目中都有, 所以需要判断他是否存在 
			if (fs.existsSync(modulePath)){
				// 读取模版目录下所有存在的文件(一级)
				fs.readdirSync(modulePath).forEach((filename) => {
					// 获取当前文件完整路径
					const pathname = path.join(modulePath, filename)
					// 判断当前是否是目录
					// 因页面模版都是目录形式
					if (fs.lstatSync(pathname).isDirectory()){
						moduleJson.name.push(filename)
					}
				})
			}
			// 只有存在才添加显示
			moduleJson.name.length && moduleList.push(moduleJson)
		})
	}
	return moduleList
}

/**
 * 删除自定义模版
 * @param  {string} name   模版名称或目录
 * @param  {object} option 命令配制
 * @return {[type]}        [description]
 */
function ordersRemove(name, option){
	if (!name) return
	// 获取配制信息
	let config = readYaml.sync(yamlPath)
	let custom = config.template.custom
	const isGlobal = !!option.global
	const isDelete = !!option.delete
	const isDeleteFiles = isGlobal || isDelete
	// 获取需要删除的模版路径
	if (!isGlobal){
		let index = custom.cwd.map(arr => arr[1]).indexOf(name)
		if (index != -1){
			custom.cwd.splice(index, 1)
			// 更新配制文件
			writeYaml.sync(yamlPath, config)
			log.info(`>>> 模版目录配制「${name}」删除成功`.green)
			// 如果不需要再继续删除文件则直接中止进程
			isDelete || process.exit()
		} else {
			return log.warn(`<<< 模版目录配制「${name}」不存在 >>>`.yellow)
		}
	}

	// 获取所有存在的模版
	// 获取模版路径
	const customPath = isGlobal ? custom.dir : custom.cwd.map(arr => arr[1])
	const moduleList = filterTemplate(isDelete ? [name] : customPath, {
		root: isGlobal ? dir : cwd,
		name: isDelete ? '' : name
	})

	// 判断当前模版是否存在
	if (!moduleList.length) 
		return log.warn(`<<< 模版目录「${name}」不存在 >>>`.yellow)

	// 弹出确认提示
	const propmt = new Confirm('删除后无法恢复，是否确认删除？')
	propmt.ask(answer => {
		if (answer) {
			moduleList.forEach((modulepath) => {
				forEachFiles(modulepath, (pathname, filename) => {
					fs.removeSync(pathname)
					log.info(` ${pathname} `, '删除')	
				})
				// 删除模版目录
				fs.removeSync(modulepath)
				log.info(` ${modulepath} `, '删除')
			})
			log.success(` 模版目录「${name}」删除完成`.green)
		}
	})
}

module.exports = (cmd, name, option) => {
	// 根据命令执行对应的函数处理
	({
		add: ordersAdd,
		ls : ordersList,
		rm : ordersRemove
	}[cmd] || (() => {}))(name, option)
}






