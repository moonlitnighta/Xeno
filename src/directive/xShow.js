import {
   isDOM,
} from '../utils/index.js';

export default function (el , binding){
	isDOM(el) && (el.style.display = !!binding.value ? 'block' : 'none');
}