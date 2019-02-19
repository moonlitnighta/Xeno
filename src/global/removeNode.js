import { removeData , key , getEvent , getInst , getRefXeno} from '../core/cache.js';
import { triggerDir } from '../directive/index.js';
import { arrRemove } from '../utils/index.js';

/*
	当要从文档中删除节点时
	1、根据节点的uuid查找节点是否存在缓存数据 
	2、清除节点绑定的事件
	3、触发节点指令解绑事件
	4、如果节点属于某个xeno实例的根节点 则清除xeno实例数据
	5、删除节点数据
*/

function removeNodeData(node){
	//遍历删除子节点的数据
	let childs = node.childNodes , l = 0;
	if(childs && (l = childs.length)){
		for(let i = 0; i < l; i ++){
			removeNodeData(childs[i])
		}
	};
	
	let uuid = node[key];
	if(uuid){
		let event = getEvent(uuid);
		if(event){
			for(let i = 0; i < event.length; i ++){
				node.removeEventListener(event[i].eventName , event[i] , event[i].eventType);
			}
		}
		//如果元素有绑定指令 则触发指令的unbind
		triggerDir(node , null , 'unbind');

		//解除ref属性
		if(node.__REF__){
			let xeno = getRefXeno(uuid);
			let ref = xeno.$refs[node.__REF__];
			if(Array.isArray(ref)){
				arrRemove(ref , node);
			} else {
				delete xeno.$refs[node.__REF__]
			}
		}

		//删除数据
		removeData(uuid);
	}
	delete node[key];
}
export function removeNode(node){
	//删除和DOM相关的所有数据
	removeNodeData(node);
	
	//删除DOM
	node.parentNode && node.parentNode.removeChild(node);
}

export function replaceNode(newNode , node){

	//删除和DOM相关的所有数据
	removeNodeData(node);

	//删除DOM
	node.parentNode && node.parentNode.replaceChild(newNode , node);
}
