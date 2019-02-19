import {
   isDOM,
   isDef
} from '../utils/index.js';

export default function (el , binding){
	isDOM(el) && (el.innerHTML = isDef(binding.value) ? binding.value : '');
}