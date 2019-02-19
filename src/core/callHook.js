import { error } from '../utils/index.js';
import evaluate from '../global/evaluate.js';
const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
];
export function callHook(xeno , hook){
    if(!xeno) return;
    let handlers = xeno.$options[hook];
    let args = Array.prototype.slice.call(arguments , 2);
    if(handlers){
        for(let i = 0; i < handlers.length; i ++){
            try {
                evaluate(function (){
                    handlers[i].apply(xeno , args);
                })
            } catch (err){
                error(hook + '钩子触发错误 ' + err.message);
            }
        }
    }
}
export let hooks = LIFECYCLE_HOOKS;