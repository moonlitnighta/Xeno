# Xeno
<div>ang、react、和vue等主流的前端框架都用过，虽然只用vue写过两三个项目，但个人一直比较喜欢vue。于是想凭借自己半斤八两的实力挑战一下如此巧妙的设计!
本来打算在写个解读文章，无奈后面没啥时间...只到此为止 以后有时间会继续！</div>
<br />
<div>该项目是参照vue的api格式和编写风格和自己的思路实现，所以内部实现和vue完全不同，最大的不同是没有vnode，当时写的时候vue也没有vnode...只能感叹大神的脚步永远追不上...</div>
<br />

```diff
---框架仅是实现，还存在一些兼容和细节问题，仅供学习参考、自娱自乐
```
<br />
目前实现了如下功能
1、从编译模板到实例挂载整个过程<br />
2、实现了响应式系统<br />
3、条件渲染和循环渲染<br />
4、组件化和父子通信及slot分发<br />
5、主要的几个指令和自定义指令功能<br />
6、过滤器和自定义过滤器<br />
7、事件和自定义事件<br />
8、加了个$用于设置单个样式 <br />
<br />
<br />
运行示例

    git clone https://github.com/moonlitnighta/Xeno.git
    cd Xeno
    npm i
    npm run build
<br />
<br />

一些示例
http://47.110.56.3/Xeno/example/index.html
<br />
<br />
代码示例（完全和vue相同，前缀为 x）

```javascript

Xeno.filter('xxx' , fn);
Xeno.directive('xxx' , {...});
Xeno.component('xxx' , {...});

var root = new Xeno({
  template:`
    <div id="app">
      <component-page>
        <header slot="header"> {{title}} </header>

        <div slot="body"
          class="class-a"
          :class="value ? 'class-b' : 'class-c'"
          $background-image="'url('+value+')'"
          @click="getData($event , value , 'value')">

          <input x-model="value" x-on:input="getValue" />

          <ul>
            <li x-for="(item , i) of list" x-if="i < 5">
              <span>{{i}}</span>
              <span x-show="item.value">
                {{item.value | filter1 | filter2(value)}}
              </span>

              <span x-for="(children , n) of item.childrens" x-if="n > 5">
                {{children + n}}
              </span>
            </li>
          </ul>
        </div>

        <footer slot="menu">
          {{value ? getValue() : '---'}}
        </footer>
      </component-page>
    </div>
  `,
  props:[...],
  data(){
    return {
      title:'',
      value:true,
      list:[...]
    }
  },
  directives:{
    ...
  },
  components:{
    ...
  },
  filters:{
    ...
  },
  methods:{
    ...
  },
  watch:{
    ...
  }
  beforeCreate(){
    //beforeCreate
    this.$on('ready' , (v)=>{
      //ready
    })
  },
  created(){
    //created
  },
  beforeMount(){
    //beforeMount
  },
  mounted(){
    //mounted
    this.$nextTick(()=>{
      //nextTick
      this.$emit('ready' , 'ready');
    });
  },
  beforeUpdate(){
    //beforeUpdate
  },
  updated(){
    //updated
  },
  beforeDestroy(){
    //beforeDestroy
  },
  destroyed(){
    //destroyed
  }
});

root.$mount('#app');
```
