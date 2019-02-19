import { triggerDir } from '../../directive/index.js';

export default function (parent , newElm , oldElm , xeno){

	//将节点插入到父节点
	if(oldElm){
		!xeno ? parent.replaceChild(newElm , oldElm) : xeno.$mount(oldElm , parent);
	} else {
		!xeno ? parent.appendChild(newElm) : xeno.$mount(null , parent);
	}
	

	//执行节点所有指令的inserted
	triggerDir(newElm , null , 'inserted');
}