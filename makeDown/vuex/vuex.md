# 
## 
+ 引入了fastClick
+ 为了解决rem问题，引入了lib-flexible和px2rem-loader。lib-flexible只需要在main.js中引入即可`import 'lib-flexible'`，px2rem需要在build.js中配置。
+ 在根目录下的html引入了script标签，引入了百度地图api。并且在webpack.base.conf.js中配置
```
externals: {
    "BMap": "BMap"
},

```
+ 在common中封装了一个获取当前地理位置的js文件。
+ 引入了mock。
+ 引入了axios，并且挂载到了`Vue.prototype.$http= axios`．
+ 引入了swiper。
+ 配置了config下的idnex.js来配置了 proxyTable，作用是代理配置，在后台api跨域情况下，可以在生产环境通过代理配置来避开跨域问题。在这里是为了引入banner的模拟数据。更改了api路径。
```javascript
    // 静态资源文件夹
    assetsSubDirectory: 'static',

    // 发布路径
    assetsPublicPath: '/',

    // 代理配置表，在这里可以配置特定的请求代理到对应的API接口
    // 例如将'localhost:8080/api/xxx'代理到'www.example.com/api/xxx'
    // 使用方法：
    proxyTable: {
      '/api': {
        target: 'http://xxxxxx.com', // 接口的域名
        // secure: false,  // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        pathRewrite: {
          '^/api': ''
        }
      }
    },

    // 本地访问 http://localhost:8080
    host: 'localhost', // can be overwritten by process.env.HOST


```







## 需要注意的地方
+ props，在传递对象的时候，如果需要使用默认值，那么他的默认值应该是一个返回的函数，而不是直接写一个对象！
+ 在引入swiper时候，根据版本来书写对应的对象，目前最新的是和swiper4.xApi对应的，并且如果siwper内容是动态插入的，就需要使用v-if判断一下，等到拿到动态内容时候，在渲染swiper的属性，这样就不会出现定义的属性不执行的情况！。
+ swiper的点击事件

## VUEX

+ 好处就是整个应用的数据放在一起，想要修改就是action和mutation

### 基础用法。
+ 声明store，挂载到vue上面，在入口引入。
+ 获取store，需要在计算属性return state
+ 修改store，需要在commit.mutation
+ getter 就是store的计算属性，。

### 组件内快速使用 (扩展运算符)
+ npm i babel-preset-stage-1 安装这个可以解析...
+ import {mapState,mapGetters} from 'vue'引入
+ 使用...mapState([xxx])
+ 如果想在引用的时候，重新命名，可以使用对象形式。
```
computed:{
    ...mapGetters({
        xx1:'xxx'
    })
}

```
### mutations和actions
+ mutations没有第三个参数一说。他的第二个参数可以接受一个object
+ 实际上就算我们不适用mutations也可以修改数据，通过this.$store.count = xxx。但是VUE不推荐这么做，并且我们使用vuex也应该遵循这个规定，规范自己的代码，可以在new Vuex.Store的时候，添加一个参数strict:true来拒绝从外部直接修改我们的数据，但是这个不要在正式环境使用这个参数！只有开发环境来强制规范团队代码。所以我们可以通过制定一个常量来判断是否为开发/生产环境，这是一个代码规范的问题。
```
const isDev = process.env.NODE_ENV ==='development'
export default new Vuex.Store({
    strict:isDev,
    state:{
        count:0,
        firstName:'lisi'
    },
    mutations:{
        upData(state,num){
            state.count = num
        }
    },
    getters
}) 

```
+ actions 他现在在vuex中，是处理异步操作数据的功能。他是通过this.$store.dispatch('xxx')来触发
+ 同样有mapActions和mapMutations。
```javascript
...mapMutations([xxx])

methods:{
    xxx(){
        xxxx
    }
}



```

### 模块化VUEX
+ 当数据越来越多的时候，我们需要模块化。
```
export default new Vuex.Store({
    modules:{
        a:{
            a模块
        },
        b:{
            b模块
        }
    }
})

```
+ 当模块之间的方法相同，比如mutations中的修改数据的方法，你在a中定义一个add()，b中也有一个add()，那么vuex是不接受这样的，因为他们的本质是对象模式，而对象属性不可以相同！当你的数据越来越庞大命名难免冲突，如果想这些东西可以重复写，可以开启一个属性namespaced为true.，强制给模块加命名空间！这个时候如果使用的时候，就是...mapMutations(['a/upData'])，调用的时候，就是this.['a/upData](xxx)
```
export default new Vuex.Store({
    modules:{
        a:{
            namespaced:true
            a模块
        },
        b:{
            b模块
        }
    }
})


```
+ 但是mutaions使用与调用解决了，那么getters怎么使用，不可能在页面中调用{{a/xxx}}，尽管他可能可以这么做，推荐的就是更改他的变量名，这样就可以很方便的使用了。
```
...mapGetters({
    'xxx':'a/xxx'
})

```
+ 模块里接收的state，是全局是state，那么也就可以在里面做一些调用其它模块。
+ 模块里可以增加新的模块。

### 热更新
``` javascript
export default ()=>{
    const store = new Vuex.Store({
        // strict:isDev,
        state:{
            count:10,
            firstName:'lisi'
        },
        mutations,
        getters       
    })
    if(module.hot){
        module.hot.accept([
            './getters',
            './mutation'
        ],()=>{
            const newGetters  = require('./getters').default
            const newMutation  = require('./mutation').default
            store.hotUpdate({
                getters:newGetters,
                mutations:newMutation
            })
        })
        return store
    }
}


```