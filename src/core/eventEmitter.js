export default function (Xeno){

	//添加事件
	Xeno.prototype.$on = function (event){
		this._events = this._events || (this._events = {});
		this._events[event] = (this._events[event] || (this._events[event] = []))
							  .concat(Array.prototype.slice.apply(arguments , [1]));
	}

	//添加仅单次执行事件
	Xeno.prototype.$once = function (event , fn){
		this._events = this._events || (this._events = {});
		this._events.__once__ = this._events.__once__ || (this._events.__once__ = []);
		this._events[event] = (this._events[event] || (this._events[event] = []));
		this._events.__once__.push(fn);
		this._events[event].push(fn);
	}

	//移除事件
	Xeno.prototype.$remove = function (event){
		let events = this._events[event];
		let onces = this._events.__once__;
		if(events){
			let fns = Array.prototype.slice.call(arguments , 1)
			if(fns.length){
				fns.forEach(function (fn){
					let i = events.indexOf(fn);
					i > -1 && events.splice(i , 1);
					if(onces){
						i = onces.indexOf(fn);
						i > -1 && onces.splice(i , 1);
					}
				})
			} else {
				delete this._events[event];
			}
		}
	}

	//触发事件
	Xeno.prototype.$emit = function (event){
		if(!this._events) return;
		let events = this._events[event];
		let onces = this._events.__once__ || [];
		if(events && events.length){
			let args = Array.prototype.slice.call(arguments , 1);
				args.unshift({
					target:this
				});
			for(let i = 0; i < events.length; i ++){
				let fn = events[i];
				fn.apply(this , args);
				
				//如果事件是once模式则在执行后移除
				let index = onces.indexOf(fn);
				if(index > -1){
					onces.splice(index , 1);
					events.splice(i , 1);

					if(events.length) {
						i --;
					} else {
						break;
					}
				}
			}
		}
	}
}