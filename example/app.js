
var cartItem = {
	template:`
		<div class="cart-item">
			<p $background-image="'url('+img+')'"></p>
			<div>{{name}}的商品</div>
			<div>$ {{amount / 100}}</div>
		</div>
	`,
	props:['name'],
	data:function (){
		return {
			img:'./assets/logo.png',
			amount:''
		}
	},
	mounted:function (){
		this.amount = parseInt((Math.random() * 10000));
		this.$emit('getAmount' , this.amount , '++');

	},
	beforeDestroy:function (){
		this.$emit('getAmount' , this.amount , '--');
	}
}

var cart = {
	template:`
		<div class="cart">
			<div class="cart-title">
				<h2>{{title}}</h2>
				<span><button @click="edit('add')">add</button><button @click="edit('rem')">remove</button></span>
			</div>
			<div class="cart-body">
				<cart-item x-for="(item , i) of num" :name="title" @getAmount="totalAmount"></cart-item>
			</div>
			<div class="cart-accounts"><p>总商品数量: {{num.length}}</p><p>总金额: <span>$ {{total / 100}}</span></p></div>
		</div>
	`,
	components:{
		'cart-item':cartItem
	},
	props:['title'],
	data:function (){
		return {
			num:[1],
			total:0
		}
	},
	methods:{
		edit(type){
			type == 'add' ? 
			this.num.length <= 6 && this.num.push(1) : 
			this.num.length > 1 && this.num.pop();
		},
		totalAmount:function (amount , type){
			type == '++' ? 
			(this.total += amount) : 
			(this.total -= amount) ;
		}
	}
}

var components = {

	/*--------------------------------------------------------响应------------------------------------------------------*/

	xmodel:{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="xmodel">
				<input x-model="value" placeholder="请输入任意" />

				<p>{{value}}</p>

				<input x-model.number="numberVal" placeholder="number 修饰符" />

				<p>{{numberVal}}</p>

				<input x-model="value2" placeholder="值被watch监听连同旧值一起输出" />

				<p>{{watchVal}}</p>
			</div>
		</div>`,
		data:function (){
			return {
				title:'响 应',
				value:'',
				value2:'',
				numberVal:null,
				watchVal:''
			}
		},
		watch:{
			value2:function (newValue , oldValue){
				this.watchVal = 'new value: ' + newValue + ' , old value: ' + oldValue;
			}
		}
	},

	/*--------------------------------------------------------指令------------------------------------------------------*/

	directive:{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="directive">
				<div>
					<h2>X-FOR</h2>
					<ul>
						<li x-for="(item , i) of list">
							<em>index: {{i}}</em> <span>姓名: {{item.name}}</span> <span>身高: {{item.height}}</span>	
							<p>
								{{item.name}}的childrens :  
								<a x-for="t of item.childrens">{{t}},</a>
							</p>
						</li>
					</ul>
					<p>
						<button @click="add">push</button>
						<span x-html="space"></span>
						<button @click="remove">remove</button>
					</p>
				</div>
				<div>
					<h2>X-SHOW</h2>
					<p>有 ID 为 1 、2、3的模块</p>
					<input x-model.number="moduleIdShow" placeholder="要显示的模块id" />

					<div x-show="moduleIdShow == 1">模块1</div>
					<div x-show="moduleIdShow == 2">模块2</div>
					<div x-show="moduleIdShow == 3">模块3</div>
					<div x-show="[1,2,3].indexOf(moduleIdShow) === -1">没有要显示的模块</div>
				</div>
				<div>
					<h2>X-IF</h2>
					<p>有 ID 为 1 、2、3的模块</p>
					<input x-model.number="moduleId" placeholder="要渲染的模块id" />

					<div x-if="moduleId == 1">模块1</div>
					<div x-else-if="moduleId == 2">模块2</div>
					<div x-else-if="moduleId == 3">模块3</div>
					<div x-else>else成立 不渲染任何模块</div>
				</div>
			</div>
		</div>`,
		data:function (){
			return {
				title:'指 令',
				space:'&nbsp;&nbsp;',
				list:[
					{name:'小明' , height:'170cm' , childrens:['c1' , 'c2' , 'c3']},
					{name:'小红' , height:'160cm' , childrens:['c1' , 'c2' , 'c3']},
					{name:'小张' , height:'177cm' , childrens:['c1' , 'c2' , 'c3']}
				],
				moduleId:null,
				moduleIdShow:null
			}
		},
		methods:{
			add:function (){
				this.list.push({name:'小王' , height:'180cm' , childrens:['c1' , 'c2' , 'c3']})
			},
			remove:function (){
				this.list.pop();
			}
		}
	},

	/*--------------------------------------------------------组件化------------------------------------------------------*/

	'component-module':{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="component-module">
				<cart x-for="(item , i) of carts" :title="item"></cart>
			</div>
		</div>`,
		components:{
			cart:cart
		},
		data:function (){
			return {
				space:'&nbsp;&nbsp;',
				title:'组件化',
				carts:['已购买' , '未付款']
			}
		}
	},

	/*--------------------------------------------------------插槽------------------------------------------------------*/

	'distribute':{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="distribute">
				<div class="distribute-head">
					<p class="module-a" slot="left"><span>MODULE<br />A</span></p>
					<p class="module-b" slot="center"><span>MODULE<br />B</span></p>
					<p class="module-c" slot="right"><span>MODULE<br />C</span></p>
				</div>
				<div class="distribute-body">
					<item>
						<p class="module-a" slot="left"><span>MODULE<br />A</span></p>
						<p class="module-b" slot="center"><span>MODULE<br />B</span></p>
						<p class="module-c" slot="right"><span>MODULE<br />C</span></p>
					</item>
					<item>
						<p class="module-a" slot="right"><span>MODULE<br />A</span></p>
						<p class="module-b" slot="left"><span>MODULE<br />B</span></p>
						<p class="module-c" slot="center"><span>MODULE<br />C</span></p>
					</item>
					<item>
						<p class="module-a" slot="center"><span>MODULE<br />A</span></p>
						<p class="module-b" slot="right"><span>MODULE<br />B</span></p>
						<p class="module-c" slot="left"><span>MODULE<br />C</span></p>
					</item>
				</div>
			</div>
		</div>`,
		components:{
			'item':{
				template:`
					<div class="distribute-item">
						<div class="distribute-item-title">MODULE E</div>
						<div class="distribute-item-body">
							<div><slot name="left" /></div>
							<div><slot name="center" /></div>
							<div><slot name="right" /></div>
						</div>
					</div>
				`
			}
		},
		data:function (){
			return {
				title:'内容分发'
			}
		}
	},

	/*--------------------------------------------------------过滤器------------------------------------------------------*/

	filter:{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="xmodel">
				<input x-model="value" placeholder="单个过滤器" />

				<p>{{value | filter1}}</p>

				<input x-model="value2" placeholder="多过滤器串联及 传参" />

				<p>{{value2 | filter1 | filter2('我是参数')}}</p>
			</div>
		</div>`,
		data:function (){
			return {
				title:'过滤器',
				value:'',
				value2:'',
			}
		},
		filters:{
			filter1:function (v){
				return v ? v + ' - ' + v : '';
			},
			filter2:function(v , p){
				return v ? v + ' - ' + v.split('-')[0] + ' - ' + p : ''
			}
		},
	},

	/*--------------------------------------------------------事件------------------------------------------------------*/

	event:{
		template:`
		<div class="content">
			<div class="title"><span>{{title}}</span></div>
			<div class="event">
				<div class="event-item" @click="click($event)">
					<h2>原生事件</h2>
					<button>ON CLICK</button>
					<p>{{clickVal ? 'target name: '+clickVal+' ! 这是原生事件' :'没有触发'}}</p>
				</div>
				<div class="event-item">
					<h2>组件事件</h2>
					<input-view x-model="value"></input-view>
					<p>通过在组件上绑定x-model取到的值：{{value}}</p>
				</div>
				<div class="event-item">
					<h2>自定义组件事件</h2>
					<button @click="onLoading">ON CLICK</button>
					<p>{{loading ? '通过click 触发自定义 loading 事件' : '没有触发' }}</p>
				</div>
			</div>
		</div>`,
		components:{
			'input-view':{
				template:`
					<div class="input"><input @input="getValue($event)" placeholder="该框为独立组件并emit input 事件" /></div>
				`,
				data:function (){
					return {
						value:''
					}
				},
				methods:{
					getValue:function (e){
						this.$emit('input' , e.target.value);
					}
				}
			}
		},
		data:function (){
			return {
				title:'事件',
				value:'',
				clickVal:false,
				loading:false
			}
		},
		created:function (){
			this.$on('loading' , function (){
				this.loading = true;
			});
		},
		methods:{
			click:function (e){
				this.clickVal = e.target.nodeName;
			},
			onLoading:function (){
				this.$emit('loading');
			}
		}
	},
}
var v = new Xeno({
	el:'#app',
	components:components,
	data:function (){
		return {
			logo:'./assets/logo.png'
		}
	},
	mounted:function (){

	}
})