import { callHook } from './callHook.js';
import { get } from './cacheInsts.js';
import Monitor from './monitor.js';
import { getData } from './cache.js'; 
import { isDef , isObject , arrRemove } from '../utils/index.js';

const scheduling = new MessageChannel();
const tasks = [];

function runMonitor(m , args , xenos){
	let xenoID = m.super;
	if(isDef(xenoID) && !xenos[xenoID]){
		callHook(get(xenoID) , 'beforeUpdate')
		xenos[xenoID] = true;
	}
	m.update(args);
}

scheduling.port1.onmessage = function (event){

	let xenos = {};

	//缓存本次tick的所有任务
	let tks = tasks.slice(0);
		tasks.length = 0;

	tks.forEach((task)=>{
		let subs = task.subs;
		let args = task.args;

		let keys = Object.keys(subs);
	    for(let k = 0; k < keys.length; k ++){
	    	let i = keys[k];
	        let cacheID = subs[i].cacheID;
	        let monitorID = subs[i].monitorID;

	        let ms = getData(cacheID);
            if(ms && ms[monitorID]){
            	runMonitor(ms[monitorID] , args , xenos);
                if(ms[monitorID].cycle == 'once'){
                    delete ms[monitorID];
                    delete subs[i];
                }
            } else {
                delete subs[i];
            }
	    }
	});

	//遍历所有xeno实例并触发updated
	for(let k in xenos){
		callHook(get(k)  , 'updated');
	}
}

export function ready(data){
	scheduling.port2.postMessage(data);
}

export function addTask(task){
	tasks.push(task);
}

export function getTask(){
	return tasks.length;
}
