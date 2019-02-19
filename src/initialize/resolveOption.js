import Xeno from '../index.js';
import { set } from '../core/cacheInsts.js';
import component from '../global/component.js';
import directive from '../global/directive.js';
import filter from '../global/filter.js';
import { hooks , callHook } from '../core/callHook.js';

let uuid = 0;
export default function (options , props){
	this.$options = options = Object.assign({} , options);

	this.$name = options.name || null;
	this.$refs = {};

	//处理钩子函数
	for(let i = 0; i < hooks.length; i ++){
		let hook = options[hooks[i]];
		if(hook){
			options[hooks[i]] = Array.isArray(hook) ? hook : [hook];
		}
	}

	//储存子组件列表
	this.$childrens = [];

	//注册组件
	let components = options.components;
	if(components){
		this._components = {};
		let _component = component.bind(this);
		for(let k in components){
			_component(k , components[k]);
		}
	}

	//注册指令
	let directives = options.directives;
	if(directives){
		this._directives = {};
		let _directive = directive.bind(this);
		for(let k in directives){
			_directive(k , directives[k]);
		}
	}

	//注册过滤器
	let filters = options.filters;
	if(filters){
		let $filter = filter.bind(this);
		for(let k in filters){
			$filter(k , filters[k]);
		}
	}

	//合并props
	if(this.$name === 'component' && props){
		this.$props = {};
		for(let k in props){
			this.$props[k] = props[k];
		}
	} else {
		if(props && options.props && options.props.length){
			this.$props = {};
			for(let k in props){
				if(options.props.indexOf(k) > -1){
					this.$props[k] = props[k];
				}
			}
		}
	}

	//为每个实例标记唯一id
	this._uuid = uuid++;

	//储存每个实例
	set(this);

	callHook(this , 'beforeCreate');
}