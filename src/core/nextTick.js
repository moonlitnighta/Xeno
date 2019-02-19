import { get } from './cacheInsts.js';
import { getTask } from './update.js';

const scheduling = new MessageChannel();
let nexts = {};
let uuid = 0;

scheduling.port1.onmessage = function (event){

	//如果当前tick内的任务还没执行完 则延迟到下一次tick
	if(!getTask()){
		let next = nexts[event.data];
		next.nextTick.call(get(next.xenoID));
		delete nexts[event.data];
	} else {
		ready(event.data);
	}
};

function ready(data){
	scheduling.port2.postMessage(data);
}
export default function (fn){
	let id = uuid++;
	nexts[id] = {
		xenoID:this._uuid,
		nextTick:fn
	}
	ready(id);
}