import { get } from '../core/cacheInsts.js';
import Dep from '../core/depend.js';
import {
   forciblyToNumber,
   trim,
   isDOM,
   isDef
} from '../utils/index.js';
import safetyEval from '../global/evaluate.js';

let cache = {};
let id = 0;
let key = '__XMODEL__';

function change(event , value){
	let modelId = event.target[key];
	let model = cache[modelId];
	let modifiers = model.modifiers;

	let obj = safetyEval(
			getParent.bind(get(model.xenoID).$data , model.parentExp ? '.' + model.parentExp : '')
		);

	//isInput设置为true 防止在用户输入值改变时同步到view
	model.isInput = true;

	//设置新值
	value = value || event.target.value;
	obj[model.attr] = modifiers.number ? forciblyToNumber(value) : 
				  	  modifiers.trim ? trim(value) : value

	//还原设定
	model.isInput = false;
}

function getParent(exp){
	return eval('this' + exp);
}

export default {
	bind:function(el , binding , vnode){
		//如果指令绑定的对象为组件 则在组件上$on上绑定监听事件
		let xeno = isDef(vnode.isComponent) ? get(vnode.isComponent) : null;

		let event = !binding.modifiers.lazy ? 'input' : 'change';
		let exp = binding.expression;
		let parentExp = '';

		if(el[key]){
			delete cache[el[key]];
		}
		let _id = el[key] = id++;
		xeno && (xeno[key] = _id);

		//解析表达式
		if(exp.slice(-1) == ']'){
			let i = exp.lastIndexOf('[');
			parentExp = exp.slice(0 , i);
			exp = exp.slice(i+1 , exp.length - 1);
		} else {
			let i = exp.lastIndexOf('.');
			if(i > -1){
				parentExp = exp.slice(0 , i);
				exp = exp.split('.').slice(-1)[0];
			}
		}

		cache[_id] = {
			modifiers:binding.modifiers,
			parentExp:parentExp,
			attr:exp,
			event:event,
			isComponent:vnode.isComponent,
			xenoID:this._uuid
		}
		xeno ? xeno.$on(event , change) : el.addEventListener(event , change , false);

		//将值绑定到view
		!vnode.isComponent && (el.value = binding.value);
	},
	update:function (el , binding , vnode){
		let model = cache[el[key]];
		//如果是用户输入改变的值则放弃同步到view
		if(model.isInput){
			return;
		}
		
		//当值改变时同步到输入框
		!(isDef(model.isComponent)) && (el.value = binding.value);
	},
	unbind:function (el , binding , vnode){
		let model = cache[el[key]];
		!(isDef(model.isComponent)) && el.removeEventListener(model.event , change , false);
		delete cache[el[key]];
	}
}
