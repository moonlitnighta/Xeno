import {
    setAttribute,
    setProperty,
    setStyleItem,
    isObject,
    isDef,
    isPrimitive,
    toString,
    isDOM,
    getExp
} from '../../utils/index.js';
import { createValue , createTextValue , createGetValue } from '../../core/evaluate.js';
import Monitor from '../../core/monitor.js';
import Render from '../../core/render.js';
import { get } from '../../core/cacheInsts.js';
import { setData } from '../../core/cache.js';
import Xeno from '../../index.js';
import { getData , key } from '../../core/cache.js';


//设置属性的函数
function createSetAttribute(elm , name){
	return function (value){
		setAttribute(elm , name , value);
	}
}

//设置文本内容
function createSetTextContent(elm , name){
	return function (value){
		setProperty(elm , name , value);
	}
}

//设置单个样式
function createSetStyleItem(elm , name){
	return function (value){
		setStyleItem(elm , name , value);
	}
}

//绑定事件
export function createBindEvent(obj , name , binding){
	let value;

	//如果有修饰则获取修饰
	let modifiers =  binding ? binding.modifiers : {};

	return function (val){

		let that = this;

		//当监听的事件函数用到外面数据当参数时需要在数据变化时更新参数
		value = val;

		//当数据变化后再次执行是检查是否绑定过事件
		if(this.render.state) return;

		//代理事件 该函数将直接绑定到节点
		function proxy($event){
			//处理合并参数
			let args = [];
			if(value.params){
				let params = value.params.slice(0);
				let i = params.indexOf('$event');
				if(i > -1){
					params[i] = $event;
				}
				args = params;
			}
			args = args.concat(Array.prototype.slice.call(arguments , [1]));

			//过滤修饰符并执行事件函数
			modifiers.stop && $event.stopPropagation && $event.stopPropagation();
			modifiers.prevent && $event.preventDefault && $event.preventDefault();
			if(modifiers.self){
				$event.target === obj && value.fn.apply({} , args);
			} else if(name === 'keyup'){
				let code = $event.keyCode;
				modifiers[code] && value.fn.apply({} , args);
			} else if(modifiers.left){
				$event.button === 0 && value.fn.apply({} , args);
			} else if(modifiers.right){
				$event.button === 2 && value.fn.apply({} , args);
			} else if(modifiers.middle){
				$event.button === 1 && value.fn.apply({} , args);
			} else {
				value.fn.apply({} , args);
			}

			//如果事件是once模式则清除数据
			if(modifiers.once && $event.target[key]){
				let ms = getData($event.target[key]);
				for(let i in ms){
					if(ms[i].trigger === that){
						delete ms[i];
						break;
					}
				}
			}
		}

		//当在组件上绑定事件时如果设置了native 则需要转到组件的根元素上绑定
		if(modifiers.native && get(obj) instanceof Xeno){
			obj = get(obj)._vnode[0].elm;
		}	

		//如果是DOM则在DOM绑定原生事件 否则在组件上添加on事件
		if(isDOM(obj)){
			obj.addEventListener(name , proxy , {
				capture: modifiers.capture,
				once: modifiers.once,
				passive:  modifiers.passive
			});

			//将节点绑定的函数保存以便后期解绑
			if(!modifiers.once){
				proxy.eventName = name;
				proxy.eventType = !!modifiers.capture;
				setData(obj , proxy , 'event');
			}
		} else {
			modifiers.once ? get(obj).$once(name , proxy) : get(obj).$on(name , proxy);
		}	

		//标记事件已绑定
		this.render.state = true
	}
}

export function createExpressionMonitor(depiction , obj , dataExps , datas , xenoID){
	let getValue , render;
	if(depiction.type == 'attribute' || depiction.type == 'style'){

		if(depiction.attrName == "textContent"){

			//设置文本内容
			getValue = createTextValue(depiction.expression , datas , dataExps , xenoID);
			render = createSetTextContent(obj , depiction.attrName);
		} else {

			//设置属性
			getValue = createGetValue(dataExps , depiction , datas , xenoID);
			render = depiction.type == 'style' ? 
					 createSetStyleItem(obj , depiction.attrName) : 
					 createSetAttribute(obj , depiction.attrName);
		}
		
	} else if(depiction.type == 'event'){

		//设置事件
		getValue = createValue(getExp(dataExps , depiction.expression) , datas);
		let binding = Object.assign({} , depiction);
		binding.modifiers = ((q , o)=>{q.forEach((i)=>{o[i]=!0}); return o;})(depiction.qualifys , {});
		render = createBindEvent(obj , depiction.attrName , binding);
	}
	
	//利用取值函数 及 渲染函数创建渲染器
	let trigger = new Render(getValue , render);

	return new Monitor(trigger);
}