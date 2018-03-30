<template>
	<div>
	    <div class="steps">
			<span class="step stepActive" @click="gotoStep(1)">1、定义指标</span>
			<span class="step stepActive" @click="gotoStep(2)"><span class="arrow arrowActive"></span>2、新增查检表</span>
			<span class="step stepActive"><span class="arrow arrowActive"></span>3、生成报表</span>
			<span class="step" @click="gotoStep(4)"><span class="arrow arrowActive"></span>4、分析结果</span>
		</div>				
		<div class="button-wrapper">
		    <el-button
			  size="large"
			  @click="gotoStep(2)">上一步</el-button>
	    	<el-button
	    	  type="primary" 
	    	  size="large"
	    	  @click="gotoStep(4)">下一步</el-button>
	    </div>	    
	    <div class="entry-step-3">
		    <div class="check-group">
				<div style="margin-bottom: 10px;font-size: 16px;">请选择哪些表需要按照原始数据生成图</div>
				<el-checkbox 
				  style="margin-bottom: 10px;"			 
				  v-model="checkAll"
				  @change="handleCheckAllChange">全选</el-checkbox>
				<el-checkbox-group 
				  v-model="checkList"
				  @change="handleCheckTableChange">
					<el-checkbox
					  v-for="(tableInfo, index) in tablesInfo"
					  :key="index" 
					  :label="tableInfo.tableId">
						<span>{{tableInfo.tableName.length > 7 ? tableInfo.tableName.slice(0,7) + '...' : tableInfo.tableName}}</span>
						<span class="tool-tip">
							{{tableInfo.tableName}}
							<div class="arrow"></div>
						</span>
					</el-checkbox>
				</el-checkbox-group>
				<div style="text-align: center;margin-top: 15px;">
					<el-button
					  type="primary"
					  :disabled="hasTables" 
					  @click="generateCharts">生成图</el-button>
			    	<el-button
			    	  :disabled="hasTables" 		    	  
			    	  @click="resetCharts">重 置</el-button>
				</div>
			</div>
			<div class="echarts-wrapper">
				<echarts-wrapper 
				  v-for='(EChart, index) in ECharts'
				  :key='index'
				  :chart='EChart'></echarts-wrapper>
			</div>	
		</div>
	</div>	
</template>

<script>
    import service from '@/service/service';
    import handleObject from '@/util/handleObject';
    import echartsWrapper from '@/components/echartsWrapper.vue';
    import NProgress from 'nprogress';
    
    const colorArr = [
        "#ffb847",
        "#29cdff",
        "#7dd97c",
        "#00b4a9",
        "#239af6",
        "#fe6b28",
        "#fd8b8f",
        "#7a6cf7",
        "#779de9",
        "#c23030",
        "#08b53f",
        "#f8e81c",
    ];
	export default {
		components: {
            echartsWrapper
        },
		data() {
			return {
				ECharts: [],
				tempTable: [],
				tablesInfo: [],
				checkAll: false,
				checkList: [],
				indicatorsTable: [],
				checkedTables: [],
				toggleChart: [],
			}
		},
		computed: {
			hasTables() {
				return this.checkList.length == 0 ? true : false;
			},
			// checkAll() {
			// 	return this.indicatorsTable.length === this.checkList.length && this.checkList.length !== 0
			// },
		},
		beforeRouteEnter(to, from, next) {
			service.getOldTable(to.query.quotaId).then(res => {
				next(vm => {
					if(res.result){					
						res.result.map(data => {
							vm.tablesInfo.push({
								tableName: data.tableName,
								tableId: data.tableId
							});						
						});
						vm.indicatorsTable = handleObject.deepClone(res.result);
						vm.indicatorsTable.map(data => {
							/***判断上次表格是否被选中***/
							if(data.isSelected == 'y') {
								vm.checkList.push(data.tableId);
							};						
						});
						vm.checkAll = vm.indicatorsTable.length === vm.checkList.length && vm.checkList.length !== 0
						/***将表格数据保存在vuex中***/
						vm.$store.commit('SET_ECHARTS', handleObject.deepClone(vm.indicatorsTable));
						if(vm.checkList.length != 0) {
							vm.generateCharts();
						};
					}					
				})
			})
		},
		methods: {
			gotoStep(num) {
				let query = this.$route.query.isEdit ? Object.assign({quotaId: this.$route.query.quotaId},{isEdit:this.$route.query.isEdit}) : {quotaId: this.$route.query.quotaId};
				if(num == 4) {
					NProgress.start();
					// this.$service.saveOldCharts(this.$store.state.indicatorsTable).then(res => {						
					// 	if(res.responseCode == 0) {
					// 		this.$router.push({
					// 			name: `entryStep${num}`,
					// 			query,
					// 		});
					// 	}else {
					// 		NProgress.done();
					// 	}
					// })
					this.$router.push({
						name: `entryStep${num}`,
						query,
					});
				}else {
					this.$router.push({
						name: `entryStep${num}`,
						query,
					});
				}				
			},
			//全选checkbox
			handleCheckAllChange(event) {
				this.checkList = event.target.checked ? this.tablesInfo.map(data => {
					return data.tableId;
				}) : [];			
			},
			//点击checkbox
			handleCheckTableChange(value) {
				this.checkAll = this.indicatorsTable.length === this.checkList.length && this.checkList.length !== 0
			},
			//生成图
			generateCharts() {
				/***将选中的表格数据转换成ECharts选项***/
				this.ECharts = this.toBaseEChart(this.$store.state.indicatorsTable.filter(data => {
						return this.checkList.includes(data.tableId);
					})
				);				
				/***选中的表格isSelected标识置为y，没有选中的表格变为初始化状态***/
				this.$store.state.indicatorsTable.map(data => {
					if(this.checkList.includes(data.tableId)) {
						data.isSelected = 'y';
					}else {
						data.isSelected = 'n';
						data.imageType = ['generateTableThree', 'generateTableOne'].includes(data.tableModelFlag) ? '1' : '2';
						data.flagList = [];
					}
				})				
			},
			//重置
			resetCharts() {
				this.checkList = [];
				this.$store.state.indicatorsTable.map(data => {
					data.isSelected = 'n';
					data.imageType = ['generateTableThree', 'generateTableOne'].includes(data.tableModelFlag) ? '1' : '2';
					data.flagList = [];
				});
			},			
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
	@import "../../assets/scss/position.scss";	
	.entry-step-3 {
	    // top: 65px;
	    margin-bottom: 40px;	    
	    display: flex;
	    flex-direction: column;
	    .check-group {
		    width: 80%;
			min-width: 710px;
			margin: 12px auto;
			.el-checkbox {
				position: relative;
				.tool-tip {
					position: absolute;
					opacity: 0;
					visibility: hidden;
					padding: 5px 10px;
					border: 1px solid rgb(209, 229, 229);
					top: -38px;
					transition: all .2s;
    				left: 13px;
    				background-color: #fff;
    				border-radius: 2px;
    				box-shadow: 0 2px 4px 0 rgba(0,0,0,.12),0 0 6px 0 rgba(0,0,0,.04);
    				z-index: 1000;
    				.arrow {
    					position: absolute;
			    		bottom: -7px;
    					left: 13px;
			    		display: inline-block;
			    		border-left: 6px solid transparent;
			    		border-top: 6px solid rgb(209, 229, 229);
			    		border-right: 6px solid transparent;
			    		&:before {
							content: '';
							position: absolute;
				    		left: -6px;
    						top: -7px;
				    		display: inline-block;
				    		border-left: 6px solid transparent;
				    		border-top: 6px solid #fff;
				    		border-right: 6px solid transparent;
						}
    				}
				}
				&:hover {
					.tool-tip {
						visibility: visible;
						opacity: 1;
					}
				}
			}
		}
		.echarts-wrapper {
			flex: 1;
			overflow: overlay;
			min-width: 1111px;
		}		
	}		
</style>