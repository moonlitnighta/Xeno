import Monitor from '../../core/monitor.js';
import Render from '../../core/render.js';
import { get } from '../../core/cacheInsts.js';
import { renderElement } from './createElement.js';
import { error , getExp , isDef } from '../../utils/index.js';
import { createValue } from '../../core/evaluate.js';
import appendChild from './appendChild.js';
import Xeno from '../../index.js';

function getVals(fns){
	return function (){
		let v = true;
		for(let i = 0; i < fns.length; i ++){
			if(fns[i].apply(this , arguments)){
				v = false;
				break;
			}
		}
		return v;
	}
}

export default function (vnode , dataExps , datas , xenoID , parentElm){

	let elm = document.createComment('');
	parentElm && appendChild(!parentElm.content ? parentElm : parentElm.content , elm);

	//检查命令
	let cmd = vnode.xIf;
	let getValue;
	if(vnode.parent){
		let childers = vnode.parent.children;
		let upon;
		
		if(cmd.dirName == 'else' || cmd.dirName == 'else-if'){
			upon = childers[(childers.indexOf(vnode) - 1)];
			if(!upon || !upon.xIf || (upon.xIf.dirName !== 'if' && upon.xIf.dirName !== 'else-if')){

				error('指令错误 ' + cmd.dirName + '必须紧跟if 或 else-if 后面');
				return;
			}
		}

		if(cmd.dirName == 'else'){
			let valueFns = [];
			let upons = childers.slice(0 , childers.indexOf(vnode));
			for(let i = upons.length; i --;){
				let node = upons[i];
				if(node.xIf){
					valueFns.push(createValue(getExp(dataExps , node.xIf.expression) , datas));
				}
			}
			getValue = getVals(valueFns);
		} else {
			getValue = createValue(getExp(dataExps , cmd.expression) , datas);
		}
	} else {
		getValue = createValue(getExp(dataExps , cmd.expression) , datas);
	}
	let render = function (value){

		//缓存xif指令
		let xif = vnode.xIf;

		if(value){

			//如果指令为else if  则检查在其之前的条件是否有成立的，如果有则退出
			if(xif.dirName === 'else-if'){
				let childers = vnode.parent.children;
				let upons = childers.slice(0 , childers.indexOf(vnode));
				for(let i = upons.length; i--;){
					let node = upons[i];
					if(node.xIf && node.elm.nodeName !== '#comment'){
						//还原xif指令
						vnode.xIf = xif;
						return;
					}
				}
			}

			let oldNode = elm;
			let parentElm = oldNode.parentNode;
			if(oldNode.nodeName === '#comment'){
				let newNode = renderElement(vnode , dataExps , datas , get(xenoID));
				parentElm && appendChild(parentElm.content || parentElm , newNode , oldNode , get(vnode.isComponent));
				elm = newNode;
			}
		} else {
			if(elm.nodeName !== '#comment'){
				let oldNode;
				let parentElm = elm.parentNode;
				if(!parentElm && isDef(vnode.isComponent)){
					let xeno = get(vnode.isComponent);
					parentElm = xeno.$elm.parentNode;
					oldNode = xeno.$elm;
				}
				let comment = document.createComment('');

				//文档中删除节点
				parentElm.replaceChild(comment , oldNode || elm);

				//清除实例及实例数据 、实例所包含DOM等数据
				oldNode && Xeno.removeNode(oldNode);
				Xeno.removeNode(elm);
				elm = comment;
			}
			//占位符
			vnode.elm = elm;
		}	
	}

	let trigger = new Render(getValue , render);
	return new Monitor(trigger , {super:xenoID});
}