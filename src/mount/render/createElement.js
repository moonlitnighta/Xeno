import { setAttribute , setProperty , isHTMLTag , error , isDef } from '../../utils/index.js';
import { createExpressionMonitor } from './createExpressionMonitor.js';
import renderForCommand from './renderForCommand.js';
import renderXifCommand from './renderXifCommand.js';
import renderComponent from './renderComponent.js';
import { setData } from '../../core/cache.js';
import bindDirective from './bindDirective.js';
import appendChild from './appendChild.js';
import { get } from '../../core/cacheInsts.js';

function setMonitor(obj , monitor , xenoID){
	let uuid = setData(obj , monitor);
	monitor.super = xenoID;
	monitor.cache = uuid;
	monitor.update();
}

function getName(vnode , type){
	for(let i = 0; i < vnode.attrsMap.length; i ++){
		if(vnode.attrsMap[i].attrName == type){
			return vnode.attrsMap[i].expression;
		}
	}
}

function createSlot(xeno , slot){
	let _slots = xeno._slots || (xeno._slots = []);
	_slots.push({
		name:getName(slot , 'name'),
		elm:slot.parent.elm
	});
}

function transformDir(depiction){
	let _depiction;
	if(depiction.type === 'customize' && depiction.dirName === 'on'){

		//如果是x-on指令则将指令转为@
		_depiction = Object.assign({} , depiction);
		_depiction.type = 'event';
		_depiction.cmd = '@';
		let eventName = _depiction.args[0];
		if(!eventName){
			error('x-on指令必须绑定一个事件');
			return;
		} else {
			_depiction.attrName = eventName;
		}
	} else if(depiction.type === 'customize' && depiction.dirName === 'bind'){
		//如果是bind指令则转为 :
		_depiction = Object.assign({} , depiction);
		_depiction.type = 'attribute';
		_depiction.cmd = ':';
		let attrName = _depiction.args[0];
		if(!attrName){
			error('x-bind指令必须绑定一个属性或特性名');
			return;
		} else {
			_depiction.attrName = attrName;
		}
	} else {
		_depiction = depiction
	}

	return _depiction;
}

function issueSlot(childrens , dataExps , datas , xeno , slotList){
	for(let i = 0; i < childrens.length; i ++){
		let childNode = childrens[i];

		//遍历插槽将节点插入对应插槽
		let name = getName(childNode , 'slot');
		for(let l = 0; l < slotList.length; l ++){

			//如果该节点和插槽对应则插入
			if(name === slotList[l].name){

				//创建节点
				let parent = slotList[l].elm;
				let elm = createElement(childNode , dataExps , datas , xeno , parent);
				if(elm){

					//清空父节点 （仅一次）
					if(!parent.__clear__){
						parent.innerHTML = '';
						parent.__clear__ = 'yes';
					}
					
					appendChild(
						parent , 
						!elm.content ? elm : elm.content , 
						null ,
						get(childNode.isComponent)
					)
				} 	
			}
		}
	}
}

//绑定到父级refs
function bindRef(vnode , depiction , xeno){
	if(!vnode.elm && !vnode.isComponent) {
		console.log('----------bind ref : elm is null-----------');
		return;
	}

	let ref = vnode.isComponent ? get(vnode.isComponent) : vnode.elm;
	let refName = depiction.expression;

	//在当前节点上储存所在的xeno实例
	!vnode.isComponent && setData(ref , xeno._uuid , 'ref-xeno');

	//如果是for渲染
	if(!vnode.xFor){
		xeno.$refs[refName] = ref;
	} else {
		let refs = xeno.$refs[refName] || (xeno.$refs[refName] = []);
		refs.push(ref);
	}

	ref.__REF__ = refName;
}

function parseAttrs(vnode , dataExps , datas , xeno , component){
	let attrsMap = vnode.attrsMap;
	for(let i = 0; i < attrsMap.length; i ++){
		let depiction = attrsMap[i];

		//如果是组件 则 可能是父组件传参
		if(component){
			let props = component.$options.props;
			if(
				depiction.cmd == ':' || depiction.dirName === 'bind' && 
				props && props.indexOf(depiction.attrName) > -1
				){
				continue;
			}
		}

		//如为静态则直接设置
		if(depiction.state === 'static'){

			//ref
			if(depiction.attrName !== 'ref'){
				depiction.attrName == "textContent" ? 
				setProperty(vnode.elm , depiction.attrName , depiction.expression) :
				setAttribute(vnode.elm , depiction.attrName , depiction.expression);
			} else {
				bindRef(vnode , depiction , xeno)
			}
		} else {
			let _depiction = transformDir(depiction);
			
			//解析指令并创建更新的函数
			if(_depiction.type === 'customize'){
				//自定义指令
				bindDirective(_depiction , vnode , dataExps , datas , xeno)
			} else {
				//如果指令为绑定事件 并且作用在一个组件上 则将组件代替DOM传入并绑定事件
				if(_depiction.cmd == '@' && component){
					setMonitor(component , 
						createExpressionMonitor(_depiction , component._uuid , dataExps , datas , xeno._uuid) ,
						xeno._uuid
					);
				} else {
					setMonitor(vnode.elm ,
						createExpressionMonitor(_depiction , vnode.elm , dataExps , datas , xeno._uuid) ,
						xeno._uuid
					);
				}
			}
		}
	}
}
export function renderElement(vnode , dataExps , datas , xeno , parentElm){
	let component , doc = document;

	//分析节点类型创建节点 或 组件
	if(vnode.type === 1){

		//如果是普通html标签则创建普通DOM
		if(isHTMLTag(vnode.tag)){
			vnode.elm = doc.createElement(vnode.tag);
		} else {			
			if(vnode.tag === 'slot'){

				//如果是插槽
				//如果该节点为插槽 vnode.elm 将为undefined;
				createSlot(xeno , vnode);
			} else {
				//如果是组件
				component = renderComponent(vnode , xeno , datas , dataExps , parentElm);
				component && (vnode.isComponent = component._uuid);
				vnode.elm = component ? component.$elm : doc.createElement(vnode.tag);
			}
		}
	} else {
		//文本节点
		vnode.elm = doc.createTextNode('');
	}


	//跳过插槽
	//解析节点的属性 并 对表达式求值
	vnode.elm && vnode.tag !== 'slot' && parseAttrs(vnode , dataExps , datas , xeno , component);

	//遍历子节点 并创建
	//如果父节点为组件 则查看是否存在插槽 如果存在插槽 则将子节点和插槽对应
	if(!component){
		for(let i = 0; i < vnode.children.length; i ++){
			createElement(vnode.children[i] , dataExps , datas , xeno , vnode.elm || parentElm);
		}
	} else {
		let slotList = component._slots;
		slotList && issueSlot(vnode.children , dataExps , datas , xeno , slotList);
	}

	//跳过插槽
	//将节点添加到父节点
	if(vnode.elm && parentElm){
		appendChild(!parentElm.content ? parentElm : parentElm.content , vnode.elm , null , component);
	}

	//如果该节点为插槽 vnode.elm 将为undefined;
	if(vnode.moving) xeno.$elm = vnode.elm;
	return vnode.elm;
}

export function createElementIF(vnode , dataExps , datas , xeno , parentElm){
	//处理xif指令
	if(vnode.xIf){
		//解析指令
		setMonitor(
			vnode.parent ? vnode.parent.elm : parentElm ,
			renderXifCommand(vnode , dataExps , datas , xeno._uuid , parentElm) ,
			xeno._uuid
		);
		return vnode.elm;
	}
	return renderElement(vnode , dataExps , datas , xeno , parentElm);
}

export function createElement(vnode , dataExps , datas , xeno , parentElm){
	//单独处理for指令循环
	if(vnode.xFor){
		setMonitor(parentElm , renderForCommand(vnode , dataExps , datas , xeno , parentElm) , xeno._uuid);
		return;
	}

	return createElementIF(vnode , dataExps , datas , xeno , parentElm);
}
