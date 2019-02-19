import Dep from './depend.js';

let uid = 0;

function Monitor(trigger , options){
	options = options || {};
	this.trigger = trigger;

	//监听器唯一ID
	this.id = uid++;

	//监听器储存位置
	this.cache = options.cache;

	//监听器属于哪个xeno实例
	this.super = options.super;

	//监听器生命周期
	this.cycle = options.cycle || 'lasting';
}
Monitor.prototype.update = function (args){

	//设置全局的监听器为当前
	let target = Dep.target;
	Dep.target = {
		monitorID : this.id,
		cacheID : this.cache
	};

	//执行触发器
	this.trigger.update.apply(this.trigger , args || []);

	//恢复全局监听器
	Dep.target = target;
}

export default Monitor;