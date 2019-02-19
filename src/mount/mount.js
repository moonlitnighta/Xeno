import {error , getElement} from '../utils/index.js';
import compile from './compile/index.js';
import render from './render/index.js';
import { setData } from '../core/cache.js';
import { callHook } from '../core/callHook.js';

export default function (sourceOptions , parentElm){
	let options = this.$options;
	let el = options.el;
	let template = options.template;

	if(sourceOptions.__vnode__){
		this._vnode = sourceOptions.__vnode__;
	} else {
		if(!template && el){
			template = getElement(el).outerHTML;
		}

		//编译模板获得vnode 并缓存vnode到原始选项中节省下次渲染时间
		if(template){
			this._vnode = sourceOptions.__vnode__ = compile(template);
		}
	}

	callHook(this , 'beforeMount');
		
	//根据解析的vnode创建真实节点
	//此步创建节点 并 解析指令 最后根据表达式求值设置节点的真实属性
	this.$elm = render(this , parentElm);

	//在实例的根节点上储存实例
	//如果更节点未渲染 则在父节点上储存 （如 x-if为false 或 x-for为空时）
	if(!this._vnode || this._vnode[0].moving){
		parentElm && setData(
			parentElm,
			this._uuid ,
			'xeno-childer'
		);
	} else {
        setData(
            this.$elm,
            this._uuid,
            'xeno'
        );
	}
	
	
	//将组建挂载到页面
	el && this.$mount(el);
}