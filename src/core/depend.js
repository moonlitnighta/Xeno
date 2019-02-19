import { get } from './cacheInsts.js';
import { addTask , ready } from './update';

function Dep(){
    this.subs = {};
    this.count = 0;
}
Dep.prototype.addSub = function (monitor){
    if(!this.subs[monitor.monitorID]){
        this.subs[monitor.monitorID] = monitor;
        this.count ++;
    }
}
Dep.prototype.remove = function (monitorID){
    if(this.subs[monitorID]){
         delete this.subs[monitorID];
         this.count --;
    }
}
Dep.prototype.notify = function (){
    ready('notify');
    let args = arguments;
    addTask({
        subs:this.subs,
        args:args
    });    
}

Dep.target = null;

export default Dep;