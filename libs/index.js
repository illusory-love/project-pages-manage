const program = require('commander')
const appInfo = require('../package.json')


program
	.version(appInfo.version)
	.usage(`[option] <file ...>`)
	.description(`项目页面管理（创建、删除）`)
	.command('install [name]', 'install one or more packages')
	.command('search [query]', 'search with optional query')
	.parse(process.argv)