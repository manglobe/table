<template>
    <div class="echart-item">
	    <div class="init-chart-wrapper">
			<div style="margin-bottom: 10px;font-size: 16px;">基础图：如下图表由原始数据生成</div>
			<el-radio-group
			  v-model="whichChart"
			  @change="changeBaseEChart">
				<el-radio-button label="1">折线图</el-radio-button>
				<el-radio-button label="2">柱状图</el-radio-button>
				<el-radio-button label="0">不生成图</el-radio-button>
			</el-radio-group>
			<div style="width: 540px;height: 300px;">
				<IEcharts 
				   v-if="toggleBaseEChart"
				  :option="chart"></IEcharts>
			</div>	
		</div>
		<div class="spread-chart-wrapper">
			<div style="margin-bottom: 20px;font-size: 16px;">扩展图：选择如下不同的维度生成不同类别的图表</div>
			<el-checkbox-group 
			  v-model="checkList"
			  @change="changeSpreadEChart">
				<el-checkbox label='1'>以每行为维度分析</el-checkbox>
				<el-checkbox label='2'>以每列为维度分析</el-checkbox>
				<el-checkbox label='3' v-if="chart.tag != 'generateTableFour'">柏拉图</el-checkbox>
			</el-checkbox-group>
			<echarts-spread 
			  v-for='(spreadEChart, index) in spreadECharts'
			  :key='index'
			  v-on:eventToParent="eventOnChild"
			  :spreadChart='spreadEChart'></echarts-spread>
			</div>
		</div>
	</div>	
</template>

<script>
    import IEcharts from 'vue-echarts-v3/src/lite.js';
    import echartsSpread from '@/components/echartsSpread.vue';

    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/title';
    
	export default {
		props: {
			chart: {
				type: Object
			}
		},
		components: {
			IEcharts,
			echartsSpread
		},
		data() {
			return {
			    whichChart: this.chart.mainType,				
				chartsType: {'1': 'line', '2': 'bar', '0': 'pie'},
				checkList: this.chart.spreadType || [],
				toggleBaseEChart: this.chart.mainType == '0' ? false : true,
				spreadECharts: [],
				tableMap: {
					generateTableOne: {
						rowName: '月份',
						colName: '项目'
					},
					generateTableTwo: {
						rowName: '项目',
						colName: '月份'
					},
					generateTableThree: {
						rowName: '科室',
						colName: '项目'
					},
					generateTableFour: {
						rowName: '科室',
						colName: '月份'
					},
				},
			}
		},
		computed: {
			tempChart() {
				return this.chart;
			}
		},
		created() {
			this.changeSpreadEChart();
		},
		methods: {
			//切换基础图
			changeBaseEChart() {
				this.toggleBaseEChart = this.whichChart == '0' ? false : true;				
				this.$store.state.indicatorsTable.map(data => {
					if(data.tableId == this.chart.id) {
						data.imageType = this.whichChart;
					}
				});
				this.chart.series.map(data => {
					data.type = this.chartsType[this.whichChart];
				});
			},
			//防止渲染扩展图时修改过的标题还原
			eventOnChild(obj) {
				for(let key of Object.keys(this.tempChart)) {
					if(key == Object.keys(obj)[0]) {
						this.tempChart[key] = Object.values(obj)[0]
					}
				}
			},
			//切换扩展图
			changeSpreadEChart() {
				this.spreadECharts = [];
				let sortList = this.checkList.sort();
				sortList.map(data => {
					/***按照选中的类型生成拓展图***/
					this.spreadECharts.push(this.toSpreadEChart(this.tempChart, data));
				});
				this.$store.state.indicatorsTable.map(data => {
					if(data.tableId == this.chart.id) {
						data.flagList = this.$handleObject.deepClone(this.checkList);
					}
				});
			},			
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .echart-item {
    	display:flex;
    	background-color: #fff;
    	margin-bottom: 15px;
    	padding: 25px;
    	.init-chart-wrapper {
			flex: 1;
			// width: 40%;
			border-right: 1px dashed #d1d1d1;
			padding-right: 25px;
			margin-right: 25px;
		}
		.spread-chart-wrapper {
			flex: 2;			
		}
    }   
	.el-radio-group {
		margin-bottom: 15px;
	}
	.el-checkbox-group {
		margin-bottom: 20px;
	}
</style>