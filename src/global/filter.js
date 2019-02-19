import { error } from '../utils/index.js';

export default function (name , fn){
	this.$filters = this.$filters || {};
	if(typeof fn !== 'function'){
		error('注册过滤器的值必须为函数');
		return;
	}

	this.$filters[name] = fn;
}
