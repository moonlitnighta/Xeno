import { error } from '../utils/index.js';
import { get } from './cacheInsts.js';
import Render from './render.js';
import Monitor from './monitor.js';
import Dep from './depend.js';
import { setData } from './cache.js';
import safetyEval from '../global/evaluate.js';

function proxy(fn , uuid){
	return function (){

		//通过uuid获取实例并作为methods的上下文执行
		fn.apply(get(uuid) , arguments);
	}
}

function getParentValue(exp){
	return eval('this.' + exp);
}

function getValueFunc(exp , parentExp , uuid){
	return function (){
		let getValue = function (){
			try {
				return eval('this.' + exp);
			} catch (err){
				error(exp + ':表达式求值错误');
			}
		} 
		return getValue.call(
			!parentExp ? get(uuid) : safetyEval(getParentValue.bind(get(uuid) , parentExp))
		);
	}
}

export default function (exp , fn){
	if(typeof fn === 'string') fn = this[fn] || this.$options.methods[fn];
	if(typeof fn !== 'function'){
		error('watch 需要一个合法函数或实例上一个存在的函数名');
		return;
	}

	//解析表达式
	let parentExp = '';
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
	
	//强制上下文
	fn = proxy(fn , this._uuid);

	//创建取值函数
	let getValue = getValueFunc(exp , parentExp , this._uuid);

	//创建监听器
	let render = new Render(getValue , fn);
	let monitor = new Monitor(render);
	let uuid = setData(this , monitor);
		monitor.super = this._uuid;
		monitor.cache = uuid;

	//对表达式求值触发数据搜集依赖
	render.value = safetyEval(getValue , {
		monitorID : monitor.id,
		cacheID : monitor.cache
	});
}