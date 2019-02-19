import {isPlainObject , warn , parentProxy , propsProxy} from '../utils/index.js';
import observe from '../core/observed.js'; 
import method from './method.js';

export default function (xeno){

	/*----------------------------------------data----------------------------------------*/
	let data = xeno.$options.data;
		data = typeof data === 'function' ? data.call(xeno , xeno) : data || {};

	if(!isPlainObject(data)){
		data = {};
		warn('data 应该是一个普通对象');
	}

	//创建一个指向data的副本
	xeno.$data = data;

	//将data第一级子属性代理到xeno对象
	for(let k in data){
		parentProxy(xeno , '$data' , k);
	}

	//为data每个子孙数据绑定观察者
	observe(data);

	/*----------------------------------------props----------------------------------------*/
	if(xeno.$props){
		let props = xeno.$props;
		for(let k in props){
			let getValue = props[k];
			delete props[k];
			propsProxy(props , k , getValue);
			parentProxy(xeno , '$props' , k);
		}
	}

	/*---------------------------------------methods---------------------------------------*/
	method(xeno);
}