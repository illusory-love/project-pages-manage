exports.onBefore = async (cmd, modulePath, targetPath) => {
	// console.log('onBefore:', cmd, modulePath, targetPath)
	// return false
}

exports.onAfter = async (cmd, modulePath, targetPath) => {
	console.log('onAfter:', cmd, modulePath, targetPath)
	// 创建完成后更新 app.json 配制
	
}