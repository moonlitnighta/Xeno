import {
    isObject,
    isDef,
    getExp,
    error
} from '../utils/index.js';
import { get } from './cacheInsts.js';
import safetyEval from '../global/evaluate.js';

//过滤器求值函数
function filterEval(getValue , filter , getParams , xenoID){
	return function (){
		let args = getParams ? getParams() : [];
			args.unshift(getValue());
		return filter.apply(get(xenoID) , args);
	}
}

//过滤器参数求值
function getFilterParam(getValue){
	return function (){
		return safetyEval(getValue);
	}
}

//创建表达式求值函数
export function createValue(exp , data){
	return function (){
		try {
			return exp.apply(data , data);
		} catch (e){
			error('表达式求值错误，请确保实例上有该属性：' + e.message);
			return '';
		}
		
	}
}

//整体表达式求值
export function createGetValue(dataExps , depiction , datas , xenoID){
	let filters = depiction.filters;
	let value = createValue(getExp(dataExps , depiction.expression) , datas);
	if(!filters){
		return value;
	}

	for(let i = 0; i < filters.length; i++){
		let params;
		let filter = findFilter(filters[i].filter , xenoID);
		if(!filter) return value;
		
		if(filters[i].params){
			params = getFilterParam(createValue(getExp(dataExps , filters[i].params) , datas));
		}
		value = filterEval(value , filter , params , xenoID);
	}
	return value;
}

//查找过滤器
export function findFilter(name , xenoID){
	let xeno = get(xenoID);
	let filter;
	try{
		filter = xeno.$filters[name] || Object.getPrototypeOf(xeno).$filters[name];
	} catch (e){
		error('无法获取名为' + name + '过滤器，检查是否注册 :' + e.message);
		return;
	}
	
	if(!filter){
		error('无法获取名为' + name + '过滤器，检查是否注册');
	}
	return filter;
}

//创建文本内容求值函数
export function createTextValue(exps , data , dataExps , xenoID){
	return function (){
		let value = '';
		for(let i = 0; i < exps.length; i ++){
			if(isObject(exps[i])){
				let getValue = createGetValue(dataExps , exps[i] , data , xenoID);
				let v = getValue();
				v  = isDef(v) ? v : '';
				value += v;
			} else {
				value += exps[i];
			}
		}
		return value;
	}
}