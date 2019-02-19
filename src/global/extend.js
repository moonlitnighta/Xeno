import { error } from '../utils/index.js';
import compile from '../mount/compile/index.js';
import { internalComponent } from '../components/index.js';

export default function (options){

	//参数判断
	if(options.data && typeof options.data !== 'function'){
		error('data 选项必须为函数');
		return;
	}

	//name不能和内置全局组件相同
	if(internalComponent.indexOf(options.name) > -1){
		error('组件名称不能与全局内置组件名称相同:' + options.name);
		return;
	}

	//组件不允许直接挂载到el
	options.el && (options.el = null);

	var Super = this;
	var Component = function (props , parentElm){
		this._resolveOption(options , props);
	  	this._init();
	  	this._mount(options , parentElm);
	}

	Component.prototype = Object.create(Super.prototype);
	Component.prototype.constructor = Component;
	return Component;
}