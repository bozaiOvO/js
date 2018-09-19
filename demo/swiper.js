;(function(){
	function Swiper(){
		this.init()
	}
	Swiper.prototype = {
		init:function(){
			this.gogogo();
			this.count = 0
		},
		boxEl:function(){
			var el = document.getElementsByClassName('list')[0]
			return el
		},
		el:function(){
			var el= document.getElementsByClassName('swiper-item')
			return  el 
		},
		elLength:function(){
			console.log(this.el().length)
			return this.el().length
		},
		elW:function(){
			return this.el()[0].offsetWidth
		},
		leftAndRightClick:function(isR){
			if(isR){
				this.count++;
				if(this.count==this.elLength()){
					this.count = 0
				}
			}else{
				this.count --;
				if(this.count<0){
					this.count==this.elLength()-1
				}
			}
			var w = this.count * this.elW()
			console.log(this.boxEl(),w)
			this.boxEl().style.transition = 'all ease .5s'
			this.boxEl().style.transform = 'translateX(-'+w+'px)'
		},
		gogogo(){
			setInterval(()=>{
				this.leftAndRightClick(true)
			},1500)
		}
	}
	window.Swiper=Swiper
})(window)