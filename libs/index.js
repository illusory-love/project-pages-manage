const program = require('commander')
const appInfo = require('../package.json')


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
	.option('-t, --template <pagename>', '指定页面模版名称', 'normal')
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
	.option('-t, --template <pagename>', '指定页面模版名称', 'normal')
	.action(require('./commander/commander-reset'))

// 自定义页面模版管理
program
	.command('template')
	.alias('t')
	.description('可添加自定义页面模版')
	.option('-a, --add <modulename>', '添加模版')
	.option('-g, --global', '添加到全局')
	.action(require('./commander/commander-template'))


program.parse(process.argv)