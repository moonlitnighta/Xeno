import xModel from './xModel.js';
import xShow from './xShow.js';
import xHtml from './xHtml.js';
import { get } from '../core/cacheInsts.js';
import { getDirective , key } from '../core/cache.js';
import Dep from '../core/depend.js'
import safetyEval from '../global/evaluate.js';

export function triggerDir(elm , name , type , newValue , oldValue){
	let uuid = elm[key];
	if(!uuid) return;

	//获取指令列表
	let directives = getDirective(uuid);
	if(directives){
		directives = name ? {[name]:directives[name]} : directives;

		//执行指令
		for(let k in directives){
			let dir = directives[k];
			let fn = dir.directive[type];
			if(fn){
				let vnode = dir.vnode;
				let el = vnode.elm == elm ? vnode.elm : elm;
				let binding = Object.assign({} , dir.binding);
				binding.value = newValue || safetyEval(dir.getValue);
				binding.oldValue = oldValue;
				fn.call(get(dir.xenoID) , el , binding , vnode);
			}
		}
	}
}

export function directiveInt(Xeno){
	Xeno.directive('model' , xModel);
	Xeno.directive('show' , xShow);
	Xeno.directive('html' , xHtml);
}