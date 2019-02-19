import { generateUUID } from '../utils/index.js';
import Xeno from '../index.js';
import { get } from './cacheInsts.js';

const id = '__xeno_uuid__';
const cache = {};

/*
	在一个对象上储存数据 通常在一个DOM节点上储存和节点相关的数据
*/
export const setData = function (obj , data , type){
	let uuid = obj[id] || (obj[id] = generateUUID());
	let datas = cache[uuid] || (cache[uuid] = {});

	if(type == 'xeno'){

		//如果obj为一个组件根节点 则储存节点所在的实例
		datas.instanceUUID = data;
	} else if(type == 'event'){
		let event = datas.event || (datas.event = []);
		event.indexOf(data) === -1 && event.push(data);
	} else if(type == 'directive'){
		let directives = datas.directives || (datas.directives = {});
		directives[data.name] = data;
	} else if(type == 'xeno-childer'){
		let childersInsts = datas.childersInsts || (datas.childersInsts = []);
		childersInsts.indexOf(data) === -1 && childersInsts.push(data);
	} else if(type == 'ref-xeno'){
		datas.refXeno = data;
	} else {
		datas[data.id] = data;
	}
	return uuid;
}

//获取储存在对象上的数据
export const getData = function (uuid){
	return cache[uuid];
}

//获取储存在对象上的 xeno实例id
export const getInst = function (uuid){
	return get(cache[uuid].instanceUUID);
}

//获取储存在对象上所绑定的事件数据
export const getEvent = function (uuid){
	return cache[uuid].event;
}

//获取绑定在对象上的指令数据
export const getDirective = function (uuid){
	return cache[uuid].directives;
}

//获取元素ref所指向的xeno实例
export const getRefXeno = function (uuid){
	return get(cache[uuid].refXeno);
}

//删除储存在对象上的数据
export const removeData = function (uuid){

	//如果当前删除的DOM属于某个xeno实例的根节点 则连同删除xeno实例
	if(cache[uuid].instanceUUID){
		get(cache[uuid].instanceUUID)._clear(true);
	}
	let childersInsts = cache[uuid].childersInsts;
	if(childersInsts){
		for(let i = 0; i < childersInsts.length; i ++){
			get(childersInsts[i])._clear(true);
		}
	}
	delete cache[uuid];
}

export const key = id;

