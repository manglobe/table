<template>
	<div class="spread-chart">
		<IEcharts :option="spreadChart" :notMerge="true"></IEcharts>
		<i class="el-icon-edit" @click="editTitle" v-if="!toggleEdit">
			<span class="icon-title-edit">编辑标题</span>
		</i>
		<div class="icon-wrap" v-else>
			<i 
			  class="el-icon-check" 
			  style="margin-right: 5px;"
			  @click="saveEdit">
				<span class="icon-title-save">确认</span>
			</i>
			<i 
			  class="el-icon-close"
			  @click="cancelEdit">
				<span class="icon-title-cancel">取消</span>
			</i>
		</div>
		<el-input 
		  type="textarea"
		  :autosize="{minRows:1}"
		  resize="none"
		  v-model="spreadTitle"
		  v-show="toggleEdit"
		  placeholder="请输入标题"></el-input>
	</div>
</template>

<script>
	import IEcharts from 'vue-echarts-v3/src/lite.js';

	export default {
		props: {
			spreadChart: {
				type: Object,
			}
		},
		components: {
			IEcharts,
		},
		data() {
			return {
				toggleEdit: false,
				spreadTitle: this.spreadChart.title.text, 
				tempTitle: this.spreadChart.title.text
			}
		},
		methods: {
			editTitle() {
				this.toggleEdit =! this.toggleEdit;
			},
			saveEdit() {
				this.spreadChart.title.text = this.$handleObject.lineFeed(this.spreadTitle, 22);
				this.tempTitle = this.spreadTitle;
				this.$store.state.indicatorsTable.map(data => {
					if(data.tableId == this.spreadChart.id) {
						switch(this.spreadChart.type) {
							case '1':
								data.xaxisName = this.spreadTitle;
								this.$emit('eventToParent', {xaxisName: this.spreadTitle});
								break;
							case '2':
								data.yaxisName = this.spreadTitle;
								this.$emit('eventToParent', {yaxisName: this.spreadTitle});
								break;
							case '3':
								data.platoName = this.spreadTitle;
								this.$emit('eventToParent', {platoName: this.spreadTitle});
								break;
						}
					};
				});
				// this.$store.commit('SET_ECHARTS', this.$handleObject.deepClone(this.$store.state.indicatorsTable));
				this.toggleEdit = false;
			},
			cancelEdit() {
				this.toggleEdit = false;
				this.spreadTitle = this.tempTitle;
				this.spreadChart.title.text = this.tempTitle;
			},
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
	.spread-chart {
		width: 500px;
		height: 230px;
		display: inline-block;
		margin-right: 20px;
		margin-bottom: 20px;
		position: relative;
		.el-icon-edit {
		    position: absolute;
		    top: 6px;
		    right: 14px;
		    color: #b9b9b9;
		    cursor: pointer;
		}
		.icon-wrap {
			position: absolute;
		    top: 4px;
		    right: 10px;
		    color: #b9b9b9;
		    cursor: pointer;		    
		}
		[class*="el-icon"] {
			font-size: 12px;
	    	&:hover {
		    	color: #06aea6;
		    	[class*="icon-title"] {
		    		display: inline-block;
		    	}
		    }
		    [class*="icon-title"] {
		    	position: absolute;
		    	font-size: 10px;
		    	display: none;
	    	    width: 26px;				    
			    top: 16px;
		    }
		    .icon-title-edit {
		    	width: 50px;
		    	left: -22px;
		    }
		    .icon-title-save {
		    	left: -4px;
		    }
		    .icon-title-cancel {
		    	left: 17px;
		    }
	    }
		.el-textarea {
		    width: 70%;
		    top: 1px;
		    position: absolute;
		    left: 70px;
		    .el-textarea__inner {
		    	text-align: center;
		    }
		}
	}
</style>