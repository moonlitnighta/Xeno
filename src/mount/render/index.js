import { createFunction } from '../../utils/index.js';
import { createElement } from './createElement.js';

export default function (xeno , parentElm){
	let vnode = xeno._vnode;
	if(!vnode) return;
	let options = xeno.$options;
	let dataExps = createFunction(vnode.data)();
	vnode.forEach(item => {
		createElement(item , dataExps , [xeno] , xeno , parentElm);
	});

	return vnode[0].elm;
}

