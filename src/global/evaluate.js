import Dep from '../core/depend.js';

export default function (getValue , target){
	let tar = Dep.target;
	Dep.target = target;
	let value = getValue();
	Dep.target = tar;
	return value;
}