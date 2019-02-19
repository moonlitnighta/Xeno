import {isObject , arrRemove} from '../utils/index.js';
import Dep from './depend.js';

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
//增强数组方法 为数组类型数据绑定监听
const arrayKeys = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

arrayKeys.forEach(method => {
    let protoFn = arrayProto[method];
    arrayMethods[method] = function (){
        let res = protoFn.apply(this , arguments);
        let operate = {method:method , value:[]};

        switch (method){
            case 'push':{
                for(let i = 0; i < arguments.length; i ++){
                    operate.value = arguments;
                    defineReactive(this , this.length - arguments.length + i);
                }
                break;
            }
            case 'unshift':{
                for(let i = 0; i < arguments.length; i ++){
                    operate.value = arguments;
                    defineReactive(this , i);
                }
                break;
            }
            case 'splice':{
                operate.value = arguments;
                operate.res = res;
                operate.adds = [];

                //是否有新增项 如果有则获取
                if(!isNaN(arguments[1])){
                    operate.adds = Array.prototype.splice.apply(operate.value , [2 , operate.value.length - 1]);
                }

                //将新增项绑定监听
                for(let i = 0; i < operate.adds.length; i ++){
                    defineReactive(this , this.indexOf(operate.adds[i]));
                }
                break;
            }
        }

        this.__update__(operate);
        return res;
    }
})

function arrayObserver(arr){
    for(let i = 0; i < arr.length; i ++){
        isObject(arr[i]) && defineReactive(arr , i);
    }
}

function arrDefineReactive(value , dep){
    let __update__ = value.__update__;
    value.__update__ = function (operate){
        __update__ && __update__(operate);
        dep.notify(operate);
    }
    value.__proto__ = arrayMethods;
}

//为单个数据创建观察者
function defineReactive(obj , key){
    let isArray = Array.isArray;
    let value;

    //管理当前属性所依赖的所有dom操作
    let dep;

    //过滤
    if(isArray(obj)){
        value = obj[key];
        if(isArray(value)){
            dep = new Dep();
            arrDefineReactive(value , dep);
            value.__target__ = function (){
                if(Dep.target){
                    dep.addSub(Dep.target);
                }
            }
        }

        //遍历子元素
        observe(value)
        return;
    }

    let property = getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return
    }

    let getter = property && property.get;
    if(!getter){
        value = obj[key];
    }

    let setter = property && property.set;

    dep = new Dep();

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            let _value = getter ? getter.call(obj) : value;
            if(Dep.target){
                dep.addSub(Dep.target);
            }

            return _value;
        },
        set: function reactiveSetter(newVal) {
            let _value = getter ? getter.call(obj) : value;
            if (newVal === _value || (newVal !== newVal && _value !== _value)) {
                return
            }
            if (setter) {
                setter.call(obj, newVal)
            } else {
                value = newVal
            }

            //如果当前值为数组，则增强数组的方法以便达到数组改变而改变view
            isArray(value) && arrDefineReactive(value , dep);

            //遍历子元素
            observe(value);

            //触发更新
            dep.notify();
        }
    });

    //如果当前值为数组，则增强数组的方法以便达到数组改变而改变view
    isArray(value) && arrDefineReactive(value , dep);

    //遍历子元素
    observe(value)
}

function observe(value){
	if (!isObject(value)) {
        return;
    }

    //遍历对象的每个属性
    //为每个属性建立观察者
    if(Array.isArray(value)){
        arrayObserver(value);
    } else {
    	let keys = Object.keys(value);
	    for (var i = 0; i < keys.length; i++) {
	        defineReactive(value, keys[i])
	    }
    }
}

export default observe;