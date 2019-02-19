import { makeMap , verifyFunProxy } from '../../utils/index.js';
import parseFilter from './parseFilter.js';

const ncname = '[a-zA-Z_][\\w\\-\\.]*';
const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
const startTagOpen = new RegExp(("^<" + qnameCapture));
const endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
const startTagClose = /^\s*(\/?)>/;
const doctype = /^<!DOCTYPE [^>]+>/i;
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr');
const isTextExp = /{{.+}}/;
const parseParams = /^(\w+)\((.*)\)/;

let filterFunction = {};

function eventPrams(text){
    let pramsMatch = text.match(parseParams);
    if(!pramsMatch || !pramsMatch[2]){
        let fn = pramsMatch ? pramsMatch[1] : text;
        return "{fn:"+fn+",params:null}"
    } else {
        let params = pramsMatch[2].replace(/\s/g , '').split(',');
        let i = params.indexOf('$event');
        if(i > -1){
            params[i] = "'$event'";
        }

        return "{fn:"+pramsMatch[1]+",params:["+params.join(',')+"]}"
    }
}

function createFunction(exp){
    if(!filterFunction[exp]){
        filterFunction[exp] = true;

        let withCode = '';
        let withCodeEnd = '';

        for(let i = 0; i < xforNum; i ++){
            withCode += 'with(arguments['+i+'] || {}){';
            withCodeEnd += '}';
        }
        return ('"' + exp + '"' + ':function(data){'+ withCode +
            'return ' + exp
        + withCodeEnd +'},\n');
    }
    return '';
}

function calculationAttribute(key , text){
    text = text ? text.replace(/\n/g, '') : '';
    let attrDescription = {original:key , expression:text , state:'moving'};
    let qualifys = key.split('.');
    let start = qualifys.shift();
    let args = start.split(':').filter((i)=>{return !!i});
    let _key = start[0] == ':' ? ':' + args.shift() : args.shift();

    if(_key[0] === ':'){
        attrDescription.type = 'attribute';
        attrDescription.attrName = _key.slice(1);
        attrDescription.cmd = ':';
    } else if(_key[0] === '@'){
        attrDescription.type = 'event';
        attrDescription.attrName = _key.slice(1);
        attrDescription.expression = eventPrams(text);
        attrDescription.cmd = '@';
    } else if(_key[0] === '$'){
        attrDescription.type = 'style';
        attrDescription.attrName = _key.slice(1);
        attrDescription.cmd = '$';
    } else if(_key.indexOf('x-') === 0){
        attrDescription.type = 'customize';
        attrDescription.attrName = _key;
        attrDescription.cmd = 'x-';
        attrDescription.dirName = _key.replace('x-' , '');
        (attrDescription.dirName == 'on') && (attrDescription.expression = eventPrams(text));
    } else {
        attrDescription.type = 'attribute';
        attrDescription.attrName = key;
        attrDescription.state = 'static';
        attrDescription.cmd = '';
    }
    
    if(_key[0] === ':' || (_key.indexOf('x-') === 0 && attrDescription.dirName == 'bind')){
        let expObj = parseFilter(text);
        attrDescription.expression = expObj.expression;
        attrDescription.filters = expObj.filters;
    }
    
    attrDescription.args = args;
    attrDescription.qualifys = qualifys;

    //解析x-for指令
    if(_key === 'x-for'){
        let exps = text.split(/of|in/);
        attrDescription.leftExp = exps[0].match(/\w+/g);
        attrDescription.rightExp = exps[1].replace(/\s/g , '');
        attrDescription.expression = attrDescription.rightExp;
    }

    return attrDescription;
}

function morgeClass(attr , val){
    attr.expression = "'" + val + " ' +" + "(" + attr.expression + ")";
}

//解析文本节点中的表达式
function parseTextExp(text , functionStrs){
    var exps = [] , off = false;
    while(text){
        let index , content;
        if(!off){
            index = text.indexOf('{{');
            if(index === -1){
                exps.push(text);
                text = '';
                continue;
            }
            content = text.slice(0 , index);
            content !== '' && exps.push(content);
            text = text.substring(index + 2);
            off = !off;
        } else {
            index = text.indexOf('}}');
            if(index === -1){
                exps.push("{{" + text);
                text = '';
                continue;
            }
            content = text.slice(0 , index).replace(/\n/g , '');
            if(content.replace(/\s/g , '') != ''){
                let expObj = parseFilter(content);

                if(expObj.filters){
                    expObj.filters.forEach((f)=>{
                        f.params && (functionStrs += createFunction(f.params));
                    });
                }

                functionStrs += createFunction(expObj.expression);
                exps.push({
                    expression:expObj.expression,
                    filters:expObj.filters
                });
            } else {
                exps.push('{{}}');
            }
            text = text.substring(index + 2);
            off = !off;
        }
    }
    return { exps , functionStrs};
}

let xforNum = 1;
let tags = [];
export default function (html , opitons){
    let functionStrs = '';
    tags = [];
    xforNum = 1;
	opitons = opitons || {};
    filterFunction = {};

	while(html){
		let start = html.indexOf('<');

		//是否由正确的html标签开始
		if(start === 0){

			//如果是注释标签则跳过
			if(comment.test(html)){
                html = html.substring(html.indexOf('-->') + 3);
				continue;
			}

			//如果是条件注释标签则跳过
			if (conditionalComment.test(html)) {
                let conditionalEnd = html.indexOf(']>');
                if (conditionalEnd >= 0) {
                    html = html.substring(conditionalEnd + 2);
                    continue;
                }
            }

			//如果是DOCTYPE则跳过
			let doctypeMatch = html.match(doctype);
            if (doctypeMatch) {
                html = html.substring(doctypeMatch[0].length);
                continue;
            }

			//如果是结束标签
			let endTagMatch = html.match(endTag);
			if(endTagMatch){
                html = html.substring(endTagMatch[0].length);
				//调用关闭标签回调
	    		verifyFunProxy(opitons.closeTag , {
	    			type:1,
	    			tagName:endTagMatch[1]
	    		});
                if(tags.pop().xfor) xforNum --;
	    		continue;
			}

			//如果是开始标签
			parseStaerTag();

		}

		//文本开始
		if(start > 0){
			let textNode = html.slice(0 , start);
            
			if(textNode.replace(/\s/g , '') === ''){
                html = html.substring(start);
				continue;
			} else {
                parseText(textNode , start);
            }
		}

		//当前html已无子标签
		if(start < 0){
			html = '';
		}
	}

    //解析文本节点
    function parseText(content , start){
        let expressions;
        
        if(isTextExp.test(content.replace(/\n/g , ''))){
            let res = parseTextExp(content , functionStrs);
            expressions = res.exps;
            functionStrs = res.functionStrs;
        }

        //调用打开标签回调
        verifyFunProxy(opitons.openTag , {
            type:2,
            content:content,
            expressions:expressions
        });
        html = html.substring(start);

        //调用关闭标签回调
        verifyFunProxy(opitons.closeTag , {
            type:2,
            content:content
        });
    }

    //解析开始标签
    function parseStaerTag(){
    	let start = html.match(startTagOpen);
    	let attrs = [] , filter = {} , staticClass , movingClass;
    	if(start){
            html = html.substring(start[0].length);
    		let end , xfor , xif;
    		while(!(end = html.match(startTagClose))){
    			let attr = html.match(attribute);
                if(attr){
                    let key = attr[1];
                    if(!filter[key]){
                        filter[key] = true;
                 
                        if(key === 'class'){
                            movingClass ? morgeClass(movingClass , attr[3]) : (staticClass = attr[3]);
                        } else {
                            let attrMap = calculationAttribute(key , attr[3]);
                            if(key === ':class'){
                                staticClass ? morgeClass(attrMap , staticClass) : (movingClass = attrMap);
                                staticClass = null;
                            }

                            if(key === 'x-for'){
                                xfor = attrMap;
                            } else if(key === 'x-if' || key === 'x-else' || key === 'x-else-if'){
                                xif = attrMap;
                            } else {
                                attrs.push(attrMap);
                            }
                        }
                    }
                    html = html.substring(attr[0].length);
                }
    		}

            //将静态class添加
            if(staticClass){
                attrs.push(calculationAttribute('class' , staticClass));
            }

            tags.push({
                tag:start[1],
                xfor:!!xfor
            });

            if(xfor){
                xforNum ++;
                functionStrs += createFunction(xfor.expression)
            }

            if(xif){
                functionStrs += createFunction(xif.expression)
            }

            for(let i = 0; i < attrs.length; i ++){
                let attrMap = attrs[i];
                if(attrMap.state === 'moving'){
                    if(attrMap.filters){
                        attrMap.filters.forEach((f)=>{
                            f.params && (functionStrs += createFunction(f.params));
                        });
                    }
                    functionStrs += createFunction(attrMap.expression);
                }
            }
            

    		end && (html = html.substring(end[0].length));

    		//调用打开标签回调
    		verifyFunProxy(opitons.openTag , {
    			type:1,
                xfor:xfor,
                xif:xif,
    			tagName:start[1],
    			attribute:attrs
    		});
    		if((end && end[1]) || isUnaryTag(start[1])){

                verifyFunProxy(opitons.closeTag , {
        			type:1,
        			tagName:start[1]
        		});
                if(tags.pop().xfor) xforNum --;
            }
    	}
    }

    functionStrs = "return {\n" + functionStrs + "}";
    verifyFunProxy(opitons.end , functionStrs);
}