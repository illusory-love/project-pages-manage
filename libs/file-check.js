const fs = require('fs-extra')
const path = require('path')

const { cwd } = require('./constants')


module.exports = (pagename) => {
	// 以命令执行的目录作为起始目录
	const fullPath = path.join(cwd, pagename);
	// 当前目录是否已存在
	return fs.pathExistsSync(fullPath);
}