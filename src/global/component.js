import Xeno from '../index.js';

export default function (name , options){
	let components = this._components;
	if(typeof options === 'function' && options.prototype.constructor === options && options.prototype.__proto__ === Xeno.prototype){
		components[name] = options;
	} else {
		components[name] = Xeno.extend(options);
	}
}