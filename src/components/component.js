import { error } from '../utils/index.js';
import Xeno from '../index.js';

export default {
	name:'component',
	template:'<div></div>',
	props:['is'],
	data:()=>{
		return {
			current:null,
			comment:null,
			_props:{},
		}
	},
	mounted(){
		let props = this.$props;
		for(let k in props){
			this._props[k] = ()=>{
				return this.$props[k];
			}
		};
		this.render();
	},
	methods:{
		render(){
			this.$nextTick(()=>{
				if(!this.comment){
					this.comment = document.createComment('');
					this.$elm.parentNode.replaceChild(this.comment , this.$elm);
				}

				let oldElm = this.current ? this.current.$elm : this.comment;
				if(!this.is){
					Xeno.replaceNode(this.comment , oldElm);
					this.$elm = this.comment;
					this.current = null;
					return;
				};

				let Component;
				if(this.$parent.hasOwnProperty('_components')){
					Component = this.$parent._components[this.is];
				}
				if(!Component){
					error('元组件渲染错误，请检查确保注册' + this.is + '组件');
					return;
				}

				let component = new Component(this._props);
				Xeno.replaceNode(component.$elm , oldElm);
				
				component.$parent = this;
				this.$childrens.push(component);
				this.current = component;
				this.$elm = component.$elm;
			})
		}	
	},
	watch:{
		'is':'render'
	}
}