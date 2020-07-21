//发布订阅
class Emitter{
	constructor(){
		this.listeners = {}
	}
	on(type, listener){
		this.listeners[type] = listener
	}
	emit(){
		this.listeners[type] && this.listeners[type]()
	}
}
let socket = io('/');
let hotEmitter = new Emitter();
const onConnected = () => {
	console.log('客户端连接成功')
}
//存放服务端传给的hash 本次的hash 和 上一次的hash
let currentHash, hotCurrentHash;
socket.on("hash",(hash)=>{
	currentHash = hash
});

//收到ok事件之后
socket.on('ok',()=>{
	//true代表热更新
	reloadApp(true);
})
hotEmitter.on('webpackHotUpdate',()=>{
	if(!hotCurrentHash || hotCurrentHash == currentHash){
		return hotCurrentHash = currentHash
	} 
	hotCheck()
})

function hotCheck(){
	hotDownloadMainfest().then((update)=>{
		let chunkIds = Object.keys(update.c)
		chunkIds.forEach(chunkId=>{
			hotDownloadUpdateChunk(chunkId);
		})
	})
}
function hotDownloadUpdateChunk(chunkId){
	let script = document.createElement('script');
	script.charset = 'utd-8'
	script.src = '/'+chunkId+'.'+hotCurrentHash+'.hot-update.js'
	document.head.appendChild(script);
}
//此方法用来询问服务器到底这一次编译相对于上一次编译改变了哪些chunk、哪些模块
function hotDownloadMainfest(){
	return new Promise(function(resolve){
		let request = new XMLHttpRequest()
		let requestPath = '/'+hotCurrentHash+".hot-update.json"
		request.open('GET', requestPath, true)
		request.onreadystatechange = function(){
			if(request.readyState === 4){
				let update = JSON.parse(request.responseText)
				resolve(update)
			}
		}
		request.send()
	})
}

function reloadApp(hot){
	if(hot){
		//发布
		hotEmitter.emit('webpackHotUpdate')
	}else{
		//不支持热更新直接刷新
		window.location.reload()
	}
}

window.hotCreateModule = function(){
	let hot = {
		_acceptedDependencies:{},
		accept: function(deps, callback){
			//callback 对应render回调
			for(let i = 0; i < deps.length; i++){
				hot._acceptedDependencies[deps[i]] = callback
			}
			
		}
	}
	return hot
}

//通过jsonp获取的最新代码   jsonp中有webpackHotUpdate这个函数
window.webpackHotUpdate = function(chunkId, moreModules){
	for(let moduleId in moreModules){
		//从模块缓存中取到老的模块定义
		let oldModule = __webpack_requrie__.c[moduleId]
		let {parents, children} = oldModule
		//parents哪些模块引用和这个模块  children这个模块用了哪些模块
		//更新缓存为最新代码
		let module = __webpack_requrie__.c[moduleId] = {
			i: moduleId,
			l: false,
			exports: {},
			parents,
			children,
			hot: window.hotCreateModule(moduleId)
		}
		moreModules[moduleId].call(module.exports, module, module.exports, __webpack_requrie__)
		module.l = true
		//index.js ---import a.js import b.js  a.js和b.js的父模块（index.js）   
		parents.forEach(par=>{
			//父中的老模块的对象
			let parModule = __webpack_requrie__.c[par]
			parModule && parModule.hot && parModule.hot._acceptedDependencies[moduleId] && parModule.hot._acceptedDependencies[moduleId]()
		})
		//热更新之后 本次的hash变为上一次的hash  置旧操作
		hotCurrentHash = currentHash
	}
}


socket.on("connect", onConnected);


