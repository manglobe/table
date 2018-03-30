<template>
	<div class="side-bar">
		<el-menu 
          :default-active="currentPath" 
          class="el-menu-vertical-demo" 
          unique-opened           
          router>
            <el-menu-item index="/indicator/entr" @click="initItem">
                <i class="el-icon-edit"></i>指标录入
            </el-menu-item>
            <el-menu-item index="/indicator/libs">
                <i class="el-icon-menu"></i>指标库
            </el-menu-item>
		</el-menu>
	</div>
</template>

<script>
	export default {
		data() {
			return {               
			}
		},
        computed: {
            currentPath() {
                return this.$route.path.slice(0, 15);
            },

        },
        methods: {
            initItem() {
                for(let key of Object.keys(this.$store.state.oldBaseInfo)) {
                    key == 'quotaDefinitions' ? this.$store.state.oldBaseInfo[key] = [null] : (key == 'formulaUnits' ? this.$store.state.oldBaseInfo[key] = '%' : this.$store.state.oldBaseInfo[key] = '')
                }    
            }
        }
	}
</script>

<style rel="stylesheet/scss" lang="scss">
	.side-bar{
        position: absolute;
        width: 180px;
        left: 0;
        top: 76px;
        bottom:0;
        box-shadow: 0 1px 4px 0 hsla(0,0%,79%,.5);
        .el-menu {
            height: 100%;
            background-color: #fff!important;
            .el-menu-item, .el-submenu__title {
                padding-left: 32px!important;
                font-size: 18px;
                &.is-active {
                    background-color:#f5f5f5;
                }
                &:hover {
                    background-color: #f5f5f5!important;
                }
                .el-submenu__icon-arrow {
                    font-size: 14px;
                }
            }
        }
    }
</style>