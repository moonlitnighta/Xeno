import { error , getExp } from '../../utils/index.js';
import { createGetValue } from '../../core/evaluate.js';

function getStatusVal(val){
	return function (){
		return val;
	}
}
export default function (vnode , parent , data , dataExps , parentElm){
	let attrsMap = vnode.attrsMap;
	let Component;

	//首先在父级查找是否注册组件
	//否则查看是否全局注册组件
	let name = vnode.tag;
	Component = parent._components[name] || Object.getPrototypeOf(parent)._components[name];
	if(!Component){
		error('组件尚未注册');
		return;
	}

	//根据组件设置的属性设置求值函数
	let props = {};
	for(let i = 0; i < attrsMap.length; i ++){
		let attr = attrsMap[i];
		if(attr.cmd === ':'){
			props[attr.attrName] = attr.state == "moving" ?
								   createGetValue(dataExps , attr , data , parent._uuid) :
								   getStatusVal(attr.expression);
		}
	}
	let component = new Component(props , parentElm);
	parent.$childrens.push(component);
	component.$parent = parent;
	return component;
}