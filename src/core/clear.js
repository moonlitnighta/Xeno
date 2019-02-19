import { remove } from './cacheInsts.js';
import { arrRemove } from '../utils/index.js';
import { removeData , key , setData } from './cache.js';
import { callHook } from './callHook.js';
import { removeNode } from '../global/removeNode.js'
/*
	清除一个实例
	1、清除储存在实例对象上的数据
	2、清除实例节点数据
	3、删除实例
*/

function clearVnodeNode (vnode){
	delete vnode.elm;

	let childrens = vnode.children
	if(childrens.length){
		for(let i = 0; i < childrens.length; i ++){
			clearVnodeNode(childrens[i]);
		}
	}
}
export default function (notRemove){
	callHook(this , 'beforeDestroy');

	if(this[key]){
		removeData(this[key]);
	}

	//文档中删除DOM
	if(!notRemove){
		let elm = this.$elm;
		setData(elm , null , 'xeno')
		removeNode(elm);
	}

	//清除实例vnode上的DOM
	this._vnode && clearVnodeNode(this._vnode[0]);

	//解除父子级关系
	let childrens = this.$parent.$childrens;
	childrens.splice(childrens.indexOf(this) , 1);
	this.$parent = null;

	//解除ref
	if(this.__REF__){
		let ref = this.$parent.$refs[this.__REF__];
		if(Array.isArray(ref)){
			arrRemove(ref , this);
		} else {
			delete this.$parent.$refs[this.__REF__]
		}
	}

	remove(this._uuid);
	
	callHook(this , 'destroyed');
}