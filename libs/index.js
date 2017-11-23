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
	.action(require('./commander-create'))

// 删除页面
program
	.command('delete <page>')
	.description('删除页面')
	.alias('d')
	.action(require('./commander-delete'))

// 重置初始状态
program
	.command('reset <page>')
	.alias('r')
	.description('重置页面（如未指定模版，则以默认模版进行重置）')
	.option('-t, --template <pagename>', '指定页面模版名称', 'normal')
	.action(require('./commander-reset'))

program.parse(process.argv)