const program  = require('commander')
const appInfo  = require('../package.json')
const path     = require('path')
const readYaml = require('read-yaml')

// 配制文件路径
const yamlConfig    = readYaml.sync(path.join(__dirname, `config.yml`))
const defaultModule = yamlConfig.default.module

program
	.allowUnknownOption()
	.version(appInfo.version)
	.usage(`[option] <filename ...>\n\t create,c delete,d reset,r`)
	.description(`项目模版页面管理`)

// 创建页面
program
	.command('create <page>')
	.alias('c')
	.description('创建页面（如未指定模版，则以默认模版进行创建）')
	.option('-t, --template <pagename>', '指定页面模版名称', defaultModule)
	.action(require('./commander/commander-create'))

// 删除页面
program
	.command('delete <page>')
	.description('删除页面')
	.alias('d')
	.action(require('./commander/commander-delete'))

// 重置初始状态
program
	.command('reset <page>')
	.alias('r')
	.description('重置页面（如未指定模版，则以默认模版进行重置）')
	.option('-t, --template <pagename>', '指定页面模版名称', defaultModule)
	.action(require('./commander/commander-reset'))

// 自定义页面模版管理
program
	.command('template <cmd> [name]')
	.alias('t')
	.description('可添加自定义页面模版')
	.option('-g, --global', '添加到全局')
	.option('-d, --delete', '强制删除指定的模版文件')
	.action(require('./commander/commander-template'))

program
	.command('set <type> <value>')
	.alias('s')
	.description('对配制文件进行修改')
	.action(require('./commander/commander-set'))


program.parse(process.argv)