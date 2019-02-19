import Monitor from '../../core/monitor.js';
import { forIn } from '../../utils/index.js';
import { createElementIF } from './createElement.js';
import { indexOf , error } from '../../utils/index.js';
import Xeno from '../../index.js';

function createData(datas , forCmd , item , i){
	let data = datas.filter(function (){return true});

	//在数据集合的末端添加新的数据
	let _data = {};
	_data[forCmd.leftExp[0]] = item;
	forCmd.leftExp[1] && (_data[forCmd.leftExp[1]] = i);
	data.push(_data);
	return data;
}

export default function (vnode , dataExps , datas , xeno , parentElm){
	let trigger = {};
	let forCmd = vnode.xFor;
	let nodes = [];
	let commentNode = document.createComment('');
	parentElm.appendChild(commentNode);

	function removeNode(node){
		nodes.length == 0 ?
		Xeno.replaceNode(commentNode , node.elm) :
		Xeno.removeNode(node.elm);
	}
	
	//当集合发生变化时将执行
	trigger.update = function (operate){
		let fragment = document.createDocumentFragment();

		//获取新值
		let newVal = dataExps[forCmd.rightExp].apply(datas , datas);

		if(!newVal){
			error(forCmd.rightExp + " 不能为空");
			return;
		}
		//如果是数组的子元素则手动触发依赖收集
		newVal.__target__ && newVal.__target__();

		if(operate){

			/*如果在当前数组上操作则计算出差异部分并处理*/
			let type = operate.method == 'reverse' ? 'sort' : operate.method;
			switch (type){

				//添加数组成员
				case 'push':{
					let node = nodes[nodes.length - 1];

					//为nodes 添加新成员
					for(let i = newVal.length - operate.value.length; i < newVal.length; i ++){
						let data = createData(datas , forCmd , newVal[i] , i);
						nodes.push({
							elm:createElementIF(vnode , dataExps , data , xeno , fragment),
							data:newVal[i]
						});
					}

					//为DOM添加新元素
					if(indexOf(parentElm.childNodes , commentNode) > -1){
						parentElm.replaceChild(fragment , commentNode);
					} else {
						let childNodes = parentElm.childNodes;
						if(node.elm === childNodes[childNodes.length - 1]){
							parentElm.appendChild(fragment);
						} else {
							let i = indexOf(childNodes , node.elm);
							let elm = childNodes[i+1];
							parentElm.insertBefore(fragment , elm);
						}
					}
					break;
				}
				case 'unshift':{
					for(let i = operate.value.length ; i --;){
						let data = createData(datas , forCmd , newVal[i] , i);
						let elm = createElement(vnode , dataExps , data , xeno , null);
						nodes.unshift({
							elm:elm,
							data:newVal[i]
						});
						fragment.insertBefore(elm , fragment.firstChild);
					}
					if(indexOf(parentElm.childNodes , commentNode) > -1){
						parentElm.replaceChild(fragment , commentNode);
					} else {
						parentElm.insertBefore(fragment , nodes[operate.value.length].elm);
					}
					
					break;
				}
				case 'splice':{
					let addNodes = [];
					let deletesNodes = [];

					//为新增项创建新节点
					operate.adds.forEach(function (item){
						let data = createData(datas , forCmd , item , newVal.indexOf(item));
						let elm = createElement(vnode , dataExps , data , xeno , fragment);
						addNodes.push({
							data:item,
							elm:elm
						})
					})

					//是否有删除项
					if(operate.res.length){

						//如果有删除项则删除对应的nodes子项
						operate.res.forEach(function (item , l){
							for(let i = 0; i < nodes.length; i ++){
								if(item === nodes[i].data){
									l === operate.res.length - 1 ?
									deletesNodes.push(nodes.splice.apply(nodes , [i , 1].concat(addNodes))[0]) :
									deletesNodes.push(nodes.splice(i , 1)[0]);
									return;
								}
							}
						});

						//同时删除DOM中对应节点
						deletesNodes.forEach(function (item , i){
							if(i === deletesNodes.length - 1){
								Xeno.replaceNode(nodes.length ? fragment : commentNode , item.elm);
							} else {
								Xeno.removeNode(item.elm);
							}
						})
					} else {

						//如果有新增项则新增对应的nodes子项  并将节点添加到DOM
						if(addNodes.length){
							let i = operate.value[0] > -1 ? operate.value[0] : nodes.length + operate.value[0];
							let node = nodes[i];
							nodes.splice.apply(nodes , [operate.value[0] , operate.value[1] || 0].concat(addNodes));
							node ? parentElm.insertBefore(fragment , node.elm) : parentElm.replaceChild(fragment , commentNode);
						}
					}
					break;
				}

				//删除成员
				case 'pop':{
					let node = nodes.pop();
					removeNode(node);
					break;
				}
				case 'shift':{
	                let node = nodes.shift();
	                removeNode(node);
	                break;
	            }

	            //排序
	            case 'sort':{
	            	if(newVal.length > 1){
		            	let a = document.createComment('');
		            	forIn(newVal , function (item , i){
		            		for(let l = 0; l < nodes.length; l ++){
		            			if(nodes[l].data === item && i !== l){
		            				parentElm.replaceChild(a , nodes[l].elm);
		            				parentElm.replaceChild(nodes[l].elm , nodes[i].elm);
		            				parentElm.replaceChild(nodes[i].elm , a);
		            				let _item = nodes[l];
		            				nodes[l] = nodes[i];
		            				nodes[i] = _item;
		            			}
		            		}
		            	})
		            }
	            	break;
	            }
			}
		} else {

			/*如果是赋值操作将清空并重新创建节点*/
			for(let i = 0; i < nodes.length; i ++){
				if(i == nodes.length - 1){
					nodes[i].elm.parentNode && Xeno.replaceNode(commentNode , nodes[i].elm);
				} else {
					nodes[i].elm.parentNode && Xeno.removeNode(nodes[i].elm);
				}
				
				nodes[i] = null;
			}

			nodes.length = 0;
			//遍历集合
			forIn(newVal , function (item , i){

				//复制一份求值的数据集合
				let data = createData(datas , forCmd , item , i);

				//根据组合好的数据循环创建节点
				nodes.push({
					elm:createElementIF(vnode , dataExps , data , xeno , fragment),
					data:item
				});
			});

			nodes.length && parentElm.replaceChild(fragment , commentNode)
		}
	}

	return new Monitor(trigger);
}