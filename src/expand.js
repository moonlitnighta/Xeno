import resolveOption from './initialize/resolveOption.js';
import { getElement } from './utils/index.js';
import init from './initialize/init.js';
import mount from './mount/mount.js';
import extend from './global/extend.js';
import component from './global/component.js';
import { removeNode , replaceNode } from './global/removeNode.js'
import eventEmitter from './core/eventEmitter.js';
import clear from './core/clear.js';
import directive from './global/directive.js';
import { directiveInt } from './directive/index.js';
import { callHook } from './core/callHook.js';
import { isElm } from './utils/index.js';
import nextTick from './core/nextTick.js';
import watch from './core/watch.js';
import safetyEval from './global/evaluate.js';
import filter from './global/filter.js';
import { regComponent } from './components/index.js';

export default function (Xeno){

	//原型方法扩展
	eventEmitter(Xeno);	
	Xeno.prototype._components = {};
	Xeno.prototype._directives = {};
	Xeno.prototype._resolveOption = resolveOption;
	Xeno.prototype._init = init;
	Xeno.prototype._mount = mount;
	Xeno.prototype._clear = clear;
	Xeno.prototype.$nextTick = nextTick;
	Xeno.prototype.$watch = watch;
	Xeno.prototype.$mount = function (elm , parent){
		let oldElm = elm ? isElm(elm) ? elm : getElement(elm) : null;
		let newElm = this.$elm;
		let parentElm = parent || oldElm.parentNode;

		if(oldElm){
			newElm && parentElm.replaceChild(newElm , oldElm);
		} else {
			newElm && parentElm.appendChild(newElm);
		}
		callHook(this , 'mounted');
	}

	//全局api扩展
	Xeno.filter = filter.bind(Xeno.prototype);
	Xeno.extend = extend;
	Xeno.safetyEval = safetyEval;
	Xeno.component = component.bind(Xeno.prototype);
	Xeno.removeNode = removeNode;
	Xeno.replaceNode = replaceNode;
	Xeno.directive = directive.bind(Xeno.prototype);

	//扩展内置指令
	directiveInt(Xeno);

	//注册内置组件
	regComponent(Xeno);
}