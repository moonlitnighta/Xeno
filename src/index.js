import expand from './expand.js';
function Xeno(options){
	if (!(this instanceof Xeno)) {
    	warn('Xeno是一个构造器，请使用`new`关键字调用');
    	return new Xeno(options);
  	}
  	this._resolveOption(options);
  	this._init();
  	this._mount(options);
}

expand(Xeno);

export default Xeno;