var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: null,
    set: null
};

var _indexOf = Array.prototype.indexOf;

export function isUndef(v) {
    return v === undefined || v === null
}

export function isDef(v) {
    return v !== undefined && v !== null
}

export function isTrue(v) {
    return v === true
}

export function isFalse(v) {
    return v === false
}

export function isPrimitive(value) {
    return (typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol' || typeof value === 'boolean')
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}
var _toString = Object.prototype.toString;

export function toRawType(value) {
    return _toString.call(value).slice(8, -1)
}

export function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]'
}

export function isRegExp(v) {
    return _toString.call(v) === '[object RegExp]'
}

export function toStringType(v){
    return _toString.call(v);
}

export function isValidArrayIndex(val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

export function toString(val) {
    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
}

export function indexOf(list , item){
    return _indexOf.call(list , item);
}
export function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
export function toNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
}
export function forciblyToNumber(val) {
    var n = parseFloat(val);
    return isNaN(n) ? null : n
}
export function error(meg){
    console.error("[Xeno error]: " + meg);
}
export function warn(meg){
    console.warn(("[Xeno warn]: " + meg));
}
export function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase ? function(val) {
        return map[val.toLowerCase()]
    } : function(val) {
        return map[val]
    }
}
export function  verifyFunProxy(fn){
	typeof fn === 'function' && fn.apply(this , Array.prototype.shift.call(arguments) && arguments)
}
export function getElement(selector){
    if(!selector) return;
	if(/^[#.].+$/.test(selector)){
		let el = selector[0] === '.' ?
				 document.querySelector(selector) :
				 document.getElementById(selector.slice(1));
		if(!el){
			error('无法获取节点 ' + selector);
		}
		return el;
	} else {
		error(selector + '格式错误 仅接受ID或Class');
	}
}
export function arrRemove(arr, item) {
    if (arr.length) {
        var index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}
export function createFunction(){
    let params = Array.prototype.slice.call(arguments);
    let code = params.pop();
    try {
        return new Function(params , code);
    } catch (err) {
        error(err);
    }
}
export function transformStr(str){
    var re=/-(\w)/g;
    return str.replace(re,function ($0,$1){
        return $1.toUpperCase();
    });
}
export function partial(){
    let fn = this , args = Array.prototype.slice.call(arguments);

    return function (){
        let arg = 0;
        for(let i = 0; i < args.length && arg < arguments.length; i ++){
            if(!args[i]){
                args[i] = arguments[arg++];
            }
        }
        fn.apply(fn , args)
    }
}
export function shallowCopy(obj , excludes){
    excludes = excludes || [];
    let _obj = Object.create(null);
    for(let k in obj){
        excludes.indexOf(k) === -1 && (_obj[k] = obj[k]);
    }
    return _obj;
}
export const isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
);
export function forIn(list , fn){
    if(Array.isArray(list)){
        for(let i = 0; i < list.length; i ++){
            fn(list[i] , i);
        }
    } else if(isObject(list)){
        let keys = Object.keys(list)
        for(let i = 0; i < keys.length; i ++){
            let k = keys[i];
            fn(list[k] , k);
        }
    } else if(!isNaN(list)){
        for(let i = 0; i < list; i ++){
            fn(i , i);
        }
    } else {
        return;
    }
}
let isAttribute = /\./;
export function attributeEvaluation(data , exp){
    if(isAttribute.test(exp)){
        let list = exp.split('.');
        let v = data;
        for(let i = 0; i < list.length; i ++){
            v = v[list[i]];
        }
        return v;
    } else {
        return data[exp];
    }
}

export function parentProxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    };
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function propsProxy(target, key, getValue) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return getValue();
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
        error('子组件不可更改父组件的状态');
        return getValue();
    };
    Object.defineProperty(target, key, sharedPropertyDefinition)
}


//表达式求值
export const expEval = (function (){
    let fn = createFunction(['exp' , 'error'] , 'with(this){try{return eval("(" + exp + ")")}catch(err){error(err)}}');
    return function (data , exp){
        return fn.call(data , exp , error);
    }
})();

export const isDOM = ( typeof HTMLElement === 'object' ) ?
            function(obj){
                return obj instanceof HTMLElement;
            } :
            function(obj){
                return obj && typeof obj === 'object' && (obj.nodeType === 1 || obj.nodeType === 3)  && typeof obj.nodeName === 'string';
            }
export function isElm (elm){
    return isDOM(elm) || (elm.nodeName && elm.nodeName === '#comment');
}
//设置特性
export function setAttribute(elm , attrName , value){
    elm.setAttribute(attrName , value);
}

//设置属性
export function setProperty(elm , propertyName , value){
    elm[propertyName] = value;
}

//设置单个样式
export function setStyleItem(elm , name , value){
    elm.style[name] = value;
}

//绑定事件
export function bindClass(elm , event , fun){
    let proxy = function ($event){
        typeof fun === 'function' && fun.call(this , $event);
    }
    elm.addEventListener(event , proxy , false);
    return proxy;
}

export function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

export function getExp(exps , key){
    let fn = exps[key];
    if(fn){
        return fn;
    } else {
        !Array.isArray(key) && error('表达式无法求值(没有对应取值函数): ' + key)
    }
}




