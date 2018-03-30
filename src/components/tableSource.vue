<template>
	<div class="table-wrap" v-if="!isDelete">  
	    <div v-loading="isLoading" element-loading-text="拼命加载中">    
	               
	        <table class="table-body" cellspacing="0" cellpadding="0" @contextmenu.prevent="showMenu" @click="disapper" ref="tablediv">
	        	<thead>
	                <tr >
	                    <th 
	                      v-for="(tableHeader, i) in tempTable.columns"
	                      :key="i">
	                    	
	                    	<i 
	                    	  class="el-icon-circle-cross"
	                    	  v-show="!isEdit && i != 0"
	                    	  @click="deleteCol(i)"></i>
	                    </th>
	                </tr>
	            </thead>
	            <tbody>
	                <tr 
	                  v-for="(tableRow, j) in tempTable.rows"
	                  :key="j">
	                    <td ref="ele"
	                      v-for="(cellList, m) in tableRow.cellList"
	                      :key="m">
	                    	
	                    	<i 
	                    	  class="el-icon-circle-cross"
	                    	  v-show="!isEdit && m == 0"
	                    	  @click="deleteRow(j)"></i>
	                    </td>
	                </tr>
	            </tbody>
	            <!-- 右键菜单栏 -->
	        <div class='box' v-show="!needShow" :style="{top:topnum+ 'px', left :leftnum + 'px'}" ref ="box">
	        	<ul>
	        		<li v-for="item in items">{{item.message}}</li>
	        	</ul>
	        </div>  
	        </table>
	        

	                        
		    <div class="btn-handle-1" v-show="!isEdit">
		    	<el-button 
		    	  type="primary"
		    	  @click="saveTable">保 存</el-button>
		    	<el-button @click="cancelEditTable">取 消</el-button>
		    </div>
        </div>
        <div class="btn-handle-2">
        	<el-button 
        	  v-if="isEdit"
        	  type="text" 
        	  @click="editTable">编辑表</el-button>
        	<el-button 
        	  v-else
        	  type="text" 
        	  @click="addRow">新增行</el-button>
        	<span class="line"></span>
        	<el-popover
        	  v-if="isEdit"
        	  trick='click'
        	  placement='top-end'
        	  v-model='visible'>
        		<p>确定要删除该表格吗？</p>
        		<div style='text-align:right;margin:0'>
        			<el-button 
        			  size='mini' 
        			  type='text'
        			  @click="visible = false">
        			  取消
        			</el-button> 
        			<el-button 
        			  size='mini' 
        			  type='primary'
        			  @click="deleteTable">
        			  确定
        			</el-button> 	
        		</div>
        		<el-button 	        	  
	        	  type="text"
	        	  slot='reference'>删除表</el-button>  	
	        	</el-popover>       	
        	<el-button 
        	  v-else
        	  type="text" 
        	  @click="addCol">新增列</el-button>
        </div> 
    </div>
</template>

<script>
	export default {
		props: ['table'],
		data() {
			return {
				needShow:true,
				isEdit: true,
				tempTable: this.$handleObject.deepClone(this.table),
				newTable: this.$handleObject.deepClone(this.table),
				isLoading: false,
				visible: false,
				isDelete: false,
				topnum:0,
				leftnum:0,
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
				items:[
				    {message:'复制'},
				    {message:'粘贴'},
				    {message:'剪切'},
				    {message:'向上插入一行'},
				    {message:'向下插入一行'},
				    {message:'向左插入一行'},
				    {message:'向右插入一行'},
				    {message:'删除行'},
				    {message:'合并单元格'}
				    
				],
				

			}
		},
		methods: {
			
			editTable() {
				this.isEdit = false;
			},
			deleteTable() {
				this.visible = false;
				this.isLoading = true;
				let params = {tableId: this.table.tableId};
				this.$service.deleteTable(params).then(res => {			
					if(res.responseCode == '0') {
						this.$message.success('删除成功');
						this.isDelete = true;
					}
					this.isLoading = false;	
				})				
			},
			
			cancelEditTable() {
				this.isEdit = true;
				this.tempTable = this.$handleObject.deepClone(this.newTable);
			},
			saveTable() {
				this.isLoading = true;
				this.$service.saveTable(this.tempTable).then(res => {
					if(res.responseCode == '0') {
						this.$message.success('保存成功');
						this.isEdit = true;
						// this.tempTable = res.result[0];
						this.newTable = res.result[0];
					}	　
					this.isLoading = false;					
				})
			},
			deleteCol(i) {
				if(this.tempTable.columns.length == 2) {
					this.$message.warning('表格最少要保留一列哦！');
					return;
				};
				this.tempTable.columns.splice(i, 1);
				for(let row of this.tempTable.rows) {
					row.cellList.splice(i, 1);
				};
			},
			deleteRow(j) {
				if(this.tempTable.rows.length == 1) {
					this.$message.warning('表格最少要保留一行哦！');
					return;
				};				
				this.tempTable.rows.splice(j, 1);
			},
			addRow() {
				let colLength = this.tempTable.columns.length;
				let rowLength = this.tempTable.rows.length;
				let newRow = {
					rowId: this.$handleObject.uuid(),
					creator: window.user ? window.user.userId : 'dbcf4da1fb3b48f49f13b609f13cbe08',
					tableId: this.tempTable.tableId,
				};
				let cellArr = [];
				for(let i = 0; i < colLength; i ++) {
					let newCell = {
						cellDetailId: this.$handleObject.uuid(),
						cellValue: i == 0 ? this.tableMap[this.tempTable.tableModelFlag].rowName + (rowLength + 1) : '',
						columnId: this.tempTable.columns[i].columnId,
						creator: window.user ? window.user.userId : 'dbcf4da1fb3b48f49f13b609f13cbe08',
						rowId: newRow.rowId,
					};
					cellArr.push(newCell);
				};
				Object.assign(newRow, {cellList: cellArr});	
				this.tempTable.rows.push(newRow);	
			},
			addCol() {
				let colLength = this.tempTable.columns.length;
				//add column of thead
				let newColThead = {
					columnId: this.$handleObject.uuid(),
					columnName: this.tableMap[this.tempTable.tableModelFlag].colName + colLength,
					creator: window.user ? window.user.userId : 'dbcf4da1fb3b48f49f13b609f13cbe08',
					tableId: this.tempTable.tableId,
				};
				this.tempTable.columns.push(newColThead);
				//add column of tbody
				for(let row of this.tempTable.rows) {
					let newCell = {
						cellDetailId: this.$handleObject.uuid(),
						cellValue: '',
						columnId: newColThead.columnId,
						creator: window.user ? window.user.userId : 'dbcf4da1fb3b48f49f13b609f13cbe08',
						rowId: row.rowId,
					};
					row.cellList.push(newCell);
				};
			},

			showMenu(event){
				this.needShow = false;
				// console.log(event.target);
				// let W = this.$refs.ele.width;
				// console.log(W)
				let x = event.target.offsetLeft +100;
				let y = event.target.offsetTop + 21;
				
				this.topnum = y;
				this.leftnum = x;
				// console.log(this.topnum);
				// console.log(this.leftnum)
				// this.refs.tablediv.style.z-index="1";
				// this.refs.box.style.z-index="2";


				

			},

			disapper(){
				this.needShow = true;
				
				
			}
			
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
	.table-wrap { 
		background-color: #fff;	
		overflow: overlay;
		padding: 0 45px;
		margin-bottom: 20px;
		padding-bottom: 20px;
        position: relative;
        z-index:0;
        .table-title {
            text-align: center;
            font-weight: normal;
            font-size: 18px;
            margin: 11px 0;
            .el-input__inner {
            	border: none!important;
            	width: 80%;
            	height: 100%;
            	text-align: center;
            }
        }                      
		.table-body {
        	width: 100%;
            border-collapse: collapse!important;	                
            box-sizing: border-box;
            border: 1px solid rgb(223, 236, 236);
            position:relative;
           
                th,td {
                box-sizing: border-box;
                border: 1px solid rgb(223, 236, 236);
                padding: 5px 0px;
                text-align: center;
                font-weight: normal!important;
                .el-input__inner, .el-textarea__inner{
                	border: none!important;
                	width: 100%;
                	height: 100%;
                	text-align: center;
                	padding: 5px 12px!important;
                }
            }
        }
        thead {
        	tr {
        		height:42px;
        		background-color: #f5f5f5;
        		.el-input__inner, .el-textarea__inner {
        			background-color: #f5f5f5;
        		}
        	}
        }
        tbody {
        	tr{
        		height:42px;
        	}
        	tr:nth-child(2n) {
        		background-color: #f5f5f5;
        		.el-input__inner {
        			background-color: #f5f5f5;
        		}
        	}
        }
        .box{
        	width:150px;
        	padding:10px;
	        background-color:white;
	        position:absolute;
	       
	        ul{
	            list-style:none;
	            padding-left:0px!important;
	            margin-top:0px!important;
	            margin-bottom:0px!important;
		        li{
			        list-style:none;
			        float:left;
			        width:150px;
			        height:30px;
			        line-height:30px;
			        text-align:center;
			        padding-left:0px!important;
		        }
	        }
        }
        .el-icon-circle-cross {
        	position: absolute;
        	right: 3px;
		    cursor: pointer;
		    color: red;
		    top: 50%;
		    transform: translateY(-50%);
        }
        .btn-handle-1 {
        	text-align: center;
        	margin-top: 20px;
        }
        .btn-handle-2 {
        	position: absolute;
        	right: 45px;
        	top: 12px;
        	.line {
				display: inline-block;
				height: 16px;
				width: 2px;
				background-color: #06aea6;
				border-radius: 2px;
				margin: 0 6px;
				vertical-align: sub;
			}
        }
    }
</style>