const path      = require('path')
const readYaml  = require('read-yaml')
const writeYaml = require('write-yaml')

const { dir } = require('../constants')
const log = require('../log')
const template = require('../template')

// 配制文件路径
const yamlPath = path.join(dir, `config.yml`)

module.exports = (type, value, option) => {
	// 目前仅有一个配制允许修改
	if (type === 'config'){
		// 为了保证配制文件是最新的,所以每次执行都重新读取
		let config = readYaml.sync(yamlPath)
		let def    = config.default
		let target = value.split('=')

		if (target.length == 2){
			// 判断命令是否合法
			if (target[0] in def){
				// 判断当前需要更新的默认模版是否存在
				if (template(target[1]).length){
					// 更新当前配制
					def[target[0]] = target[1]
					// 更新配制yaml文件
					writeYaml.sync(yamlPath, config)
					// 输出日志
					log.success(`配制项「${target[0]}」更新成功`.green)
				} else {
					log.warn(`需要更新的默认模版「${target[1]}」不存在，请确认后再操作。\n- 您可以执行 [proj t ls] 查看目前支持的模版`.yellow)
				}
			} else {
				log.warn(`配制项「${target[0]}」不存在`.yellow)
			}
		} else {
			// log.warn(`配制项「${target[0]}」不存在`)
			log.error('配制项格式错误，应为 key=value'.red)
		}
	}
}