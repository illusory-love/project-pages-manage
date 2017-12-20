const colors = require('colors')

const disable = []
/**
 * 输出日志信息
 * @param  {string} message 日志内容
 * @param  {string|obejct} label   标签名称或配制信息
 * @param  {string} color   颜色: require('colors')内置对像
 * @return {[type]}         [description]
 */
function outputMessage(message, label, color){
	// 对接收的参数进行处理
	let conf = {
		method: 'log',
		label : typeof label == 'string' ? label : '信息',
		color : typeof color == 'string' ? color : 'cyan'
	}
	if (typeof label == 'object') {
		conf = Object.assign(conf, label)
	}
	// 输出信息
	console[conf.method](`[${conf.label ? conf.label : '信息'}]`[conf.color] + ` ${message}`)
}

module.exports = {
	level: () => {},
	info : (message, label, color)  => outputMessage(message, label, color),
	warn : (message, label = '警告', color = 'yellow')  => outputMessage(message, label, color),
	error: (message, label = '错误', color = 'red') => outputMessage(message, label, color)
}