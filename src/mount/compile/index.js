import {error , warn} from '../../utils/index.js';
import parseHTML from './parseHTML.js';

const illegalRoot = {
    'slot':true
}

function createASTElement(tag){
    return {
        type:1,
        tag:tag.tagName,
        attrsMap:tag.attribute,
        children:[],
        xFor:tag.xfor,
        xIf:tag.xif,
        parent:null
    }
}

function createASTText(content , expression){
    return {
        type:2,
        children:[],
        attrsMap:[
            {
                type:'attribute',
                attrName:'textContent',
                state:expression ? 'moving' : 'static',
                expression:expression || content
            }
        ],
        parent:null
    }
}

export default function (template){
	let stack = [];
    let ast = [];

	parseHTML(template , {
		openTag:function (tag){
            let astTag = tag.type === 1 ? 
                         createASTElement(tag) :
                         createASTText(tag.content , tag.expressions);
		    
            let parent = stack[stack.length - 1];
            if(parent){
                parent.children && parent.children.push(astTag) && (astTag.parent = parent);
                stack.push(astTag);
            } else {
                ast.push(stack[0] = astTag);
            }
		},
		closeTag:function (tag){
            let stackTag = stack[stack.length - 1];
			if(tag.tagName === stackTag.tag){
                stack.pop();
                return;
            } else {
                for(let i = stack.length; i --;){
                    if(tag.tagName === stack[i].tag){
                        warn(stack[i + 1].tag + ' 标签没有进行闭合');
                        stack.splice(i);
                        return;
                    }
                }
            }

            error('无法匹配的结束标签：</' + tag.tagName + '>');
		},
		end:function(functionStrs){
			ast.data = functionStrs;
		}
	});

    if(ast[0].tag == 'template'){
        let data = ast.data;
        ast = ast[0].children;
        ast.data = data;
    }

    if(ast.length === 0){
        error('组件需要至少一个元素 而不是：' + template);
    }

    if(ast.length > 1){
        error('一个组件只能包含一个根元素');
    }

    if(illegalRoot[ast[0].tag]){
        error('组件包含非法根节点');
    }

    //标记根节点为动态节点
    if(ast[0].xIf || ast[0].xFor){
        ast[0].moving = true;
    }

	return ast;
}