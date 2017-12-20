const colors = require('colors')
const logSymbols = require('log-symbols')

/**
 * 输出日志信息
 * @param  {string} message 日志内容
 * @param  {obejct} option  配制信息
 * @param  {string} option.forbid  禁用列表
 * @param  {string} option.label   自定义标签名
 * @param  {string} option.method  消息输出模式
 * @param  {string} option.color   颜色: require('colors')内置对像
 * @return {[type]}         [description]
 */
function outputMessage(message, option){
	// 对接收的参数进行处理
	let conf = {
		method: 'info',
		label : '信息',
		color : 'cyan'
	}
	conf = Object.assign(conf, option)

	const label   = conf.label
	const method  = conf.method
	const color   = conf.color
	const forbid  = conf.forbid
	const isArray = Object.prototype.toString.call(forbid) == '[object Array]'
	// 判断当前是否允许输出
	if (forbid === true || (isArray && forbid.includes(method))) return
	// log 图标映射对象
	const symbol = logSymbols[method == 'warn' ? 'warning' : method]
	// 输出信息
	console.log(symbol, `[${label || '信息'}]`[color] + ` ${message}`)
}

module.exports = {
	forbid : [],
	disable: function(types) {
		// 更新当前的禁用状态
		this.forbid = typeof types == 'string' ? types.split(',') : types
	},
	info   : function(message, label, color = 'cyan') {
		// 调用输出
		const params = {
			forbid: this.forbid,
			method: 'info',
			label,
			color
		}
		outputMessage(message, params) 
	},
	warn   : function(message, label = '警告', color = 'yellow') { 
		// 调用输出
		const params = {
			forbid: this.forbid,
			method: 'warn',
			label,
			color
		}
		outputMessage(message, params)
	},
	error  : function(message, label = '错误', color = 'red') { 
		// 调用输出
		const params = {
			forbid: this.forbid,
			method: 'error',
			label,
			color
		}
		outputMessage(message, params)
	},
	success: function(message, label = '成功', color = 'cyan') { 
		// 调用输出
		const params = {
			forbid: this.forbid,
			method: 'success',
			label,
			color
		}
		outputMessage(message, params)
	}
}

