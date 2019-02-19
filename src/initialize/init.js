import initState from './initState.js';
import { callHook } from '../core/callHook.js';
import initWatch from './initWatch.js';

export default function (){
	let xeno = this;

	//解析数据，为实例所用的数据建立观察者
	initState(xeno);

	//绑定watch
	initWatch(xeno);

	callHook(this , 'created');
}