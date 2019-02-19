import { isDef } from '../utils/index.js';

function Render(getValue , render){
	this.render = render;
	this.getValue = getValue;
	this.value = {};
}
Render.prototype.update = function (){

	//计算新值
	let newValue = this.getValue();
	
	//与旧值比较，如果相同则返回 否则操作dom设置新值
	if(this.value !== newValue){
		this.render(newValue , this.value);
		this.value = newValue;
	}
}
export default Render;