import {parentProxy} from '../utils/index.js';
import { get } from '../core/cacheInsts.js';
import evaluate from '../global/evaluate.js';

function proxy(fn , uuid){
	return function (){

		//通过uuid获取实例并作为methods的上下文执行
		let arg = arguments;
		evaluate(function (){
			fn.apply(get(uuid) , arg);
		})
	}
}

export default function (xeno){
	let methods = xeno.$options.methods;
	xeno.$methods = {};

	for(let k in methods){
		xeno.$methods[k] = proxy(methods[k] , xeno._uuid);
		parentProxy(xeno , '$methods' , k);
	}
}