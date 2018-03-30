<template>
	<div class="header">
		<div class="logo-wrap">
		    <img src="/static/imgs/menuclose.png" style="margin-left: 55px;margin-right: 66px;">
			<img src="/static/imgs/logo.png">
			<span class="line">质量指标系统</span>
		</div>
		<div class="userinfo-wrap">
		    <img src="/static/imgs/Avatar.png" />
			<span style="margin-left: 10px;font-size: 12px;">{{userName}}</span>
			<span class="exit" @click="logout ">退出</span>
			<form action="/logout" method="POST" style="display:none;" id="logoutForm">
				<input type="hidden" name="_csrf" :value="csrf" />
			    <input type="hidden" name="_csrf_header" value="X-XSRF-TOKEN"/>
			    <input class="login-submit" type="submit" value="退出" />
			</form>	
		</div>
		
	</div>
</template>

<script>
	export default {
		name: 'header',
		computed: {
			userName() {
				return window.user ? window.user.userName : '管理员';
			},
			csrf() {
				return this.$store.state.csrf['X-XSRF-TOKEN'];
			}
		},
		methods: {
			logout() {
				document.querySelector('#logoutForm').submit();
			}
		},
	}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    @import '../../assets/scss/position.scss';

	.header {
        @include align-justify-between;
        height: 76px;
        padding-left: 20px;
        padding-right: 40px;
        font-size: 18px;
        color: #fff;
        background-color: #06aea6;
        .logo-wrap{
	    	@include align-justify-center;
	    	height: 70px; 
	    	.line {
	    		border-left: 2px solid #fff;
			    padding-left: 17px;
			    margin-left: 17px;
			    vertical-align: super;
			    letter-spacing: .9px;
	    	}
	    }
	    .userinfo-wrap {
	    	display: flex;
	    	align-items: center;
	    	height: 100%;
	    	font-size: 16px;
	    	position: relative;
	    	cursor: pointer;
	    	&:hover {
	    		.exit {
	    			display: inline-block;
	    		}
	    	}
	    	.exit {
	    		position: absolute;	    		
	    		display: none;
	    		width: 100px;
	    		top: 76px;
	    		right: -20px;
	    		height: 36px;
			    line-height: 36px;
			    font-size: 12px;
			    text-align: center;
			    color: #2db0d7;
			    background-color: #fff;
    			box-shadow: 1px 0 1px 1px #ccc;
			    cursor: pointer;
			    z-index: 120000
	    	}
	    }
    } 
</style>