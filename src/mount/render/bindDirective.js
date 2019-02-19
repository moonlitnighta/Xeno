import { error , getExp } from '../../utils/index.js';
import { createValue } from '../../core/evaluate.js';
import { setData } from '../../core/cache.js';
import Render from '../../core/render.js';
import Monitor from '../../core/monitor.js';
import { triggerDir } from '../../directive/index.js';
import Dep from '../../core/depend.js';
import safetyEval from '../../global/evaluate.js';

function createMonitor(render , getValue , xenoID){
	let trigger = new Render(getValue , render);
	return new Monitor(trigger , {
		super:xenoID
	});
}

function createRender(elm , dirName , type){
	return function (value , oldValue){
		triggerDir(elm , dirName , type , value , oldValue);
	}
}

export default function (depiction , vnode , dataExps , datas , xeno){
	let directive;
	let args = depiction.args;
	let dirName = depiction.dirName;
	let expression = depiction.expression;
	let modifiers = ((q , o)=>{q.forEach((i)=>{o[i]=!0}); return o;})(depiction.qualifys , {});

	//查找指令
	directive = xeno._directives[dirName] || Object.getPrototypeOf(xeno)._directives[dirName];
	if(!directive){
		error(dirName + '指令不存在');
		return;
	}

	let getValue = createValue(getExp(dataExps , expression) , datas);

	//将指令绑定到DOM
	setData(vnode.elm , {
		name:dirName,
		getValue:getValue,
		xenoID:xeno._uuid,
		directive:directive,
		vnode:vnode,
		binding:{
			name:dirName,
			expression:expression,
			args:args,
			modifiers:modifiers
		}
	} , 'directive');

	
	//如果指令存在bind 立即执行
	if(directive.bind){
		safetyEval(function (){
			triggerDir(vnode.elm , dirName , 'bind');
		});
	}

	//如果指令存在update钩子 则创建触发器并触发依赖的数据搜集该依赖
	if(directive.update){
		let render = createRender(vnode.elm , dirName , 'update');
		let updateMonitor = createMonitor(render , getValue , xeno._uuid);
		let uuid = setData(vnode.elm , updateMonitor);
			updateMonitor.cache = uuid;
		
		safetyEval(getValue , {
			monitorID : updateMonitor.id,
			cacheID : updateMonitor.cache
		});
	}
}	