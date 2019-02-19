export default function directive(name , options){

	//处理选项
	if(typeof options === 'function'){
		options = {
			bind:options,
			update:options
		};
	}
	this._directives[name] = options;
}