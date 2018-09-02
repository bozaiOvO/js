# js性能优化
## 加载执行
+ 优化JS的首要规则：将脚本放在底部。
+ 不要把内嵌脚本紧跟在`<link>`标签后面。

### 无阻塞的脚本
浏览器里 的http请求被阻塞一般都是由javascript所引起，具体原因是javascript下载完毕之后会立即执行，而javascript执行时候会 阻塞浏览器的其他行为，例如阻塞其他javascript的执行以及其他的http请求的执行。这样会导致页面加载变慢，如果这个变慢很明显，此时用户操作网页会发现页面没有反应会反应很慢，慢是网站用户体验的梦魇。

#### 延迟的脚本
+ 任何带有defer属性的`<script>`元素在DOM完成加载之前都不会被执行。

#### 动态的js脚本

+ 动态脚本加载凭借它在跨浏览器兼容性和易用的优势，成为最通用的无阻塞加载解决方案。
```
var script = document.createElement('script');
script.src = "file.js";
document.getElementsByTagName("head")[0].appendChild(script);
//等待Js加载完成后在加载这个file.js
//也就是说等待必要的js文件加载完后，加载剩余的。

```
+ 兼容写法
```
function loadScript(url, callback) {
    var script = document.createElement('script');
    if (script.readyState) {//IE
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {//其他浏览器
        script.onload = function () {
            callback();
        }
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript('file1.js', function () {
    loadScript('file2.js', function () {
        loadScript('file3.js', function () {
            alert("All files are loaded!");
        })
    })
});
```

#### XMLHTTPRequest脚本注入

+ 此技术先创建一个XHR对象，然后用它下载JS文件，最后通过创建动态<script>元素将代码注入页面。


## 数据存取

### JavaScript中四中基本的数据存取位置

+ 字面量
+ 本地变量 var或者let或者const
+ 数组元素 
+ 对象成员

#### 读取速度与优化
+ 一般而言,从字面量和局部变量获取数据的速度要快于从对象或数组的属性中获取数据的速度，但在性能方面很大程度上取决于浏览器本身。

+ 如果经常会使用到对象的某个属性或者方法，那么可以选择把它缓存到局部变量中，以加快它的读取速度。例如
```
var isArray = Array.isArray,
     slice = Array.prototype.slice;

function foo() {
    var arr = slice.apply(arguments);
    console.log(isArray(arr));
}

foo(); // => true
//但注意上面介绍的方式在针对DOM方法时，不会按照我们想象的那样工作：
var gid = document.getElementById;
console.log(gid('foo').innerText); // 报错 Illegal invocation
```

### 作用域链

#### `var a = 2 ` 会执行什么？

##### 拆分成为此法单元 var,a,=,2

##### 解析或者语法分析

##### 解释执行。`var a ` 对于 `var a = 2`; 进行处理的时候，会有 引擎、编译器、还有作用域的参与。
+ 引擎：从头到尾负责整个 Javascript 程序的编译及执行过程。
+ 编译器：负责语法分析及代码生成等。
+ 作用域：负责收集并维护由所有声明的标识符（变量）组成的一系列查询，并实施一套非常严格的规则，确定当前执行的代码对这些标识符（变量）的访问权限。
编译器的处理
+ 首先，他们会寻找该变量的名称也就是a是否存在本作用域的集合之中，如果是存在的情况下，编译器会自动忽略该声明，然后继续编译，如果不存在则会在作用域里声明一个新的变量然后赋值成a。
+ 接下来编译器会为引擎生成运行时所需的代码，这些代码用来处理 a = 2 这个赋值操作。引擎运行时会首先从作用域中查找 当前作用域集合中是否存在 变量 a。如果有，引擎就会使用这个变量。如果没有，引擎就会继续向上一级作用域集合中查找改变量。
+ 最后如果找到了变量a，就对其赋值，如果没找到，就抛出异常。

#### 作用域

##### RL查询。
+ 引擎会对变量a进行查找，查找分为两种，一是LHS(left-Hand-Side)查询，一种是RHS查询(Right-Hand-Side)查询。LHS查询就是试图查找变量的容器本身，从而可以对其赋值，也就是查找变量a，RHS查询就是查找变量的值。
```
console.log(a)//这里是RHS查询。
a=2//这里就是LHS查询，找到变量a，并且赋值为2.


function foo(a){
    console.log(a); // 2
}

foo(2); // 这里首先对 foo() 函数调用，执行 RHS 查询，即找到 foo 函数，然后 执行了  a = 2 的传参赋值，这里首先执行 LHS 查询 找到 a 并赋值为 2，然后 console.log(a) 执行了 RHS 查询。

```
 + 当RHS在整个作用域都没查找到所需的变量值时候，引擎会抛出ReferenceError。如果找到了变量值，但是想对其进行不合理的操作，比如对不是函数的值进行调用，就会抛出TypeError.
 + 如果 LHS 查找在顶层全局作用域中都没有找到所需变量，如果是在非严格模式下，全局作用域会创建一个具有该名称的变量，并将其返回给引擎，如果是在严格模式下，引擎就会抛出 ReferenceError。应该理解，ReferenceError[ˈrefrəns]和TypeError的不同！
 
 ##### 词法作用域

 + 词法作用域是由你写代码时候将变量和块级作用域写在哪里规定的。
 ```
function foo(a){
    var b = a*2;
    function bar(c){
        console.log(a,b,c);
    }

    bar(b*3);
}
foo(2); // 2,4,12


 ```
 + 上面的代码里，就有三层作用域。
 
 + 第一层是全局作用域，有标识符foo

 + 第二层是foo创建的作用域，标识符a,b,bar

 + 第三层包含着bar创建的作用域，标识符是c。

 + 在查找变量时，作用域查找会在找到第一个匹配的标识符时停止。而且它只查找一级标识符，比如a 、b、c，而对于 foo.bar.bar ，词法作用域只会查找 foo 标识符，找到这个变量之后，对象属性访问规则会分别接管对 bar 和 bar 属性的访问。

 + 全局变量会自动成为全局对象的属性。

 ##### 提升

 + 变量和函数在内的所有声明都会在任何代码被执行前首先被处理。举个栗子，当你看到var a = 2 时候，js会将其分为两个阶段，第一个是var a 在编译阶段执行，会提升最顶层，而a = 2则会留在原地等待执行。这就是变量提升。
 
 ```
function foo () {
    console.log(a)
    var a = 2 
}
foo()

 ```

 + 函数声明会提升，但是函数表达式不会提升。区分函数声明和函数表达式最简单的方式是看 `function` 关键字出现在声明中的位置。如果 `function` 时声明中的第一个词，那么就是函数声明，否则就是一个函数表达式。**而且函数会被优先提升。**
```
foo() //TypeError 因为此时只是把var foo 提升了，而函数并没有提升，如果这样调用，属于不合理操作。
var foo = function (){
    //
}


```

```
foo();  // 1      会输出 1 为不是 2    
var foo;
function foo(){
    console.log(1);
}
foo = function(){
    console.log(2);
}
```
上面这个代码可以理解为
```
function foo(){
    console.log(1)
}
foo()
var foo;
foo = function(){
    console.log(2)
}

```
注意，`var` foo 尽管出现在 `function` foo() 之前，但它是重复的声明，因为函数声明会被提升到普通变量之前。重复的 `var` 声明会被忽略，但出现在后面的函数声明却会覆盖前面的。

 ##### 闭包

###### 什么是闭包

 + 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。
 
 + 俗一点就是你女人红杏出墙了，别人可以通过你的女人了解到你家里的情况，甚至通过她改变你的家，只要你不离婚，你的家就一直被拖着，这个状态很容易出问题，但是别人用着很爽。
 
 + 阮大的说法：闭包就是能够读取其他函数内部变量的函数
 
 ###### 为什么需要闭包。

 +　我需要从外部引用函数内的局部变量！局部变量无法共享和长久的保存，而全局变量可能造成变量污染，所以我们希望有一种机制既可以长久的保存变量又不会造成全局污染。
 
 +　把变量的值始终保持在内存里。下面的函数证明了这个n在函数运行结束后，并没有清除。为啥子没清除呢？本来当执行到var a3 = a1()时候，理应该是销毁a1的执行环境的，这里没销毁是因为，a1返回了一个函数，函数里n引用了父类函数的变量n，如果销毁，那么就找不到变量n了，所以a1就会一直存在于这个内存里。也就是n也一直存在内存里。（在此可扩展Js垃圾回收机制以及执行上下文）
 
 ```
    function a1(){
        var n = 99;
        function a2(){
            n++
            alert(n)
        }
        return a2
    }
    var a3 = a1();
    a3() //100
    a3()//101   
 ```

+ 栗子：

```

let say;
function sayHello(name) {
  let str = `Hello,${name}`;
  say = function() {
    console.log(str);
  }
}
let myHello = sayHello('abby');
say(); // Hello,abby



```
这也是闭包，因为就像上面说的一样，say声明和say词法环境形成了闭包，在它的作用域里面持有了 sayHello 这个函数里面定义的 str 变量的引用，因此也能在 str 变量定义的作用域之外访问它。最常用的形成闭包的方式便是在一个函数里面嵌套另一个函数，另一个函数持有父作用域里面定义的变量。
```
function newClosure() {
  for(var i = 0; i < 5; i++) {
    setTimeout(function() {
      console.log(i);
      },1000)
  }
}
newClosure(); // 5个5
```
为什么是5个5？是因为js有一个主进程和call-stack(调用堆栈)，在一个调用堆栈处理的task处理时候，其他都需要等待。在执行遇到setTimeout异步操作时候，会让给浏览器其他的模块处理，当到达setTimeout指定的延时执行的时间之后，task(回调函数)会放入到任务队列之中。一般不同的异步任务的回调函数会放入不同的任务队列之中。等到调用栈中所有task执行完毕之后，接着去执行任务队列之中的task(回调函数)。也就是简单来说，就是setTimeout并没有立即执行，而是先执行的for循环，把setTimeout交给了webapis中的timer模块处理，当i=0~4时候，满足条件都是在执行for事件，到了等于5不满足条件弹出task，然后setTimeout进入，这个时候i就等于5了！所以输出的都是5！！！怎么解决呢？
``` 栗子1
function  a(i){
    setTimeout(function(){
        console.log(i)
    },1000)
}

for(var i = 0 ; i < 5 ; i++){
    a(i)//这里的i就是被复制过去的。
}


```
``` 栗子2
for(var i = 0 ; i < 5 ; i++){
    (function(j){
        setTimeout(function(){
            console.log(j)
        },1000)
    })(i)
}


```




