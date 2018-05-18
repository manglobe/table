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
		position: relative;
		width: 100%;
		box-sizing: border-box;
		padding: 86px 20px 60px 200px;
		overflow: hidden;
	    background-color: #f5f6f6;
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