<template>
	<div class="main">
		<w-header></w-header>
		<w-sidebar></w-sidebar>
		<div class="content" id="content">
			<!-- <transition name="el-fade-in-linear" mode="out-in"> -->
				<router-view></router-view>
			<!-- </transition>			 -->
			<transition name="scroll">
				<div 
				  class="scroll-to-up" 
				  v-show="top > 200"
				  @click="backToTop">
					<i class="el-icon-caret-top"></i>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	import wHeader from './header';
	import wSidebar from './sidebar';

	export default {
		components: {
			wHeader,
			wSidebar
		},
		data() {
			return {
				top: '',
			}
		},
		mounted() {
			this.$nextTick(() => {
				document.getElementById('content').addEventListener('scroll', this.onScroll);
			})
		},
		methods: {
			onScroll() {
				this.top = document.getElementById('content').scrollTop;
			},
			backToTop() {
				document.getElementById('content').scrollTop = 0;
			}
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
    @import '../../assets/scss/animation.scss';
	.content {
		position: absolute;
		left: 180px;
		right: 0px;
		top: 76px;
		bottom: 0px;
		padding: 25px;
		overflow: overlay;
	    background-color: #f5f6f6;
    	box-shadow: inset 1px 0 4px 0 rgba(202,202,202,0.5);
    	.scroll-to-up {
    		background-color: #06aea6;
    		position: fixed;
    		right: 80px;
    		bottom: 160px;
    		width: 50px;
    		height: 50px;
    		border-radius: 25px;
    		cursor: pointer;
    		opacity: .4;  		
    		&:hover {
    			opacity: 1;
    			transition: opacity .2s;
    		}
    		i {
    			color: #fff;
    			display: block;
    			line-height: 50px;
    			text-align: center;
    			font-size: 22px;
    		}
    	}
	}
</style>