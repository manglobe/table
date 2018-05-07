<template>
	<div class="indicator-lib">
    <!-- <iframe src="" frameborder="0" class="pdf-iframe" ref="iframe"></iframe> -->
    <div class="pdf-preview">
      <Preview :previewData = "previewData" :updatedCallBack="addPdf" />
    </div>
		<section class="form-wrap">

			<div class="handle-wrap">
				<span class="input-title">指标名称：</span>
				<el-input 
				class="large-input" 
				placeholder="请输入" 
				v-model="indicator" 
				@keyup.enter.native="search">
				</el-input>	    		
			</div>

			<div class="handle-wrap">
				<span>
					<span class="input-title">楼层：</span>
					<el-select 
					v-model="floorId" 
					filterable 
					placeholder="请选择">
						<el-option	
						v-for="floor in floors"
						:key="floor.floorId"
						:label="floor.floorName"
						:value="floor.floorId">
						</el-option>
					</el-select>
				</span>
				<span>
					<span class="input-title">专科：</span>
					<el-select 
					v-model="deptId" 
					filterable 
					placeholder="请选择">
						<el-option
						v-for="dept in depts"
						:key="dept.departmentId"
						:label="dept.departmentName"
						:value="dept.departmentId">
						</el-option>
					</el-select>
				</span>
				
			</div>

			<div class="handle-wrap">
				<span class="input-title">录入人员：</span>
				<el-input 
					class="large-input" 
				placeholder="请输入" 
				v-model="person" 
				@keyup.enter.native="search">
				</el-input>
			</div>

			<div class="handle-wrap">
				<span class="input-title">录入时间：</span>
				<el-date-picker 
					class="date-input large-input" 
					v-model="dateRange" 
					type="daterange" 
					placeholder="开始时间 - 结束时间" 
					clearable>
				</el-date-picker>
			</div>
			<div style="text-align: center;margin-bottom: 25px;">  	
				<el-button 
				type="primary" 
				@click="search">
				查 询
				</el-button>
				<el-button 
				@click="reset">
				重 置
				</el-button> 
			</div> 
		</section>
		<section class="display-wrap">
			<div class="table-title">质量指标库</div>
			<div class="handle-table">
				<el-button type="text" @click="pdf">导出</el-button>
				<span class="line"></span>
				<el-button type="text">打印</el-button>
			</div>    	
			<el-table
			:data="tableData" 
			v-loading="tableLoading" 
			element-loading-text="拼命加载中" 
			empty-text="没有您查询的结果，请重新输入条件查询"
			stripe 
      @selection-change="handleSelectionChange"
			style="width: 1082">
				<el-table-column type="selection" width="50"></el-table-column>
				<el-table-column label="序列" type="index" width="70"></el-table-column>
				<el-table-column prop="quotaName" label="指标名称">
				</el-table-column>
				<el-table-column prop="userName" label="录入人员">
				</el-table-column>
				<el-table-column prop="recordDate" label="录入时间">
				</el-table-column>
				<el-table-column label="操作" width='160'>
					<template slot-scope="scope">
						<el-button
						style="font-family: Microsoft YaHei;" 
						type="text"
						@click="edit(scope.row)">
						编辑
						</el-button>
						<el-button 
						style="font-family: Microsoft YaHei;"
						type="text"
						@click="deleteRow(scope.row)">
						删除
						</el-button>                   
						<router-link 
						style="margin-left: 10px;color: #06aea6;text-decoration: none;"
						:to="{name: 'preview', query: {quotaId: scope.row.quotaId}}"
						target='_blank'>
						预览
						</router-link>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="curPage"
				:page-sizes="[10, 15, 20, 30]"
				:page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="totalPages">
			</el-pagination>
			<el-dialog 
			title="提示"
			:visible.sync="indicatorDialogVisible" 
			top="4%"  
			:show-close="false">
				<span>您确定要删除该指标么？</span>
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="confirmDel">确定</el-button>
					<el-button @click="indicatorDialogVisible = false">取消</el-button>
				</span>	    	
			</el-dialog>	
		</section>	
	</div>
</template>

<script>
import { mapState } from "vuex";
import Preview from './OldCharts.vue';
import service from '@/service/service';
import getPdf from '@/util/pdf';
import JSZip from 'jszip';
import { Loading } from 'element-ui';
export default {
  components: {
      Preview
    },
  data() {
    return {
      tableData: [],
      indicator: "",
      floorId: "",
      deptId: "",
      person: "",
      dateRange: [],
      tableLoading: true,
      indicatorDialogVisible: false,
      visible2: false,
      params: {},
      totalPages: 0,
      pageSize: 10,
      curPage: 1,
      delId: "",
      previewData: false,
      previewDatas: false,
    };
  },
  computed: {
    ...mapState(["floors", "depts"]),
    tableIndex() {}
  },
  created() {
    this.loadIndicators();
  },
  methods: {
    search() {
      (this.curPage = 1), this.loadIndicators();
    },
    reset() {
      this.indicator = "";
      this.floorId = "";
      this.deptId = "";
      this.person = "";
      this.dateRange = [];
      (this.pageSize = 10), (this.curPage = 1), this.loadIndicators();
    },
    deleteRow(row) {
      this.indicatorDialogVisible = true;
      this.delId = row.quotaId;
    },
    edit(row) {
      this.$router.push({
        path: "/indicator/entryStep1",
        query: {
          quotaId: row.quotaId,
          isEdit: true
        }
      });
    },
    confirmDel() {
      this.indicatorDialogVisible = false;
      this.tableLoading = true;
      this.$service.deleteIndicator(this.delId).then(res => {
        if (res.responseCode != 0) {
          this.tableLoading = false;
          this.$message.error(res.responseMessage);
        } else {
          this.$message.success("删除成功！");
          this.loadIndicators();
        }
      });
    },
    loadIndicators() {
      this.tableLoading = true;
      this.params = {
        quotaName: this.indicator,
        floorId: this.floorId,
        departmentId: this.deptId,
        userName: this.person,
        recordStartDate:
          this.dateRange[0] != null && this.dateRange.length != 0
            ? this.$dateHandle.dateArrayFormat(this.dateRange)[0] + " 00:00:00"
            : "",
        recordEndDate:
          this.dateRange[0] != null && this.dateRange.length != 0
            ? this.$dateHandle.dateArrayFormat(this.dateRange)[1] + " 23:59:59"
            : "",
        startIndex: this.curPage - 1,
        pageSize: this.pageSize
      };
      this.$service.getIndicators(this.params).then(res => {
        this.tableLoading = false;
        [this.tableData, this.totalPages] = [
          res.responseData.resultList,
          res.responseData.totalCount
        ];
      });
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.loadIndicators();
    },
    handleCurrentChange(num) {
      this.curPage = num;
      this.loadIndicators();
    },
    handleSelectionChange(selection){
      this.selectedUrl = selection.map(ele=>ele.quotaId)
    },
    async addPdf(node){
      let blob = await getPdf(node);
      const _this = this;
      const zip = this.zip;
      zip.file(`${_this[Symbol.for('pdfIndex')]}.pdf`,blob);
      _this[Symbol.for('pdfIndex')]++
      this.previewData = this.previewDatas.next().value;
      if(!this.previewData){
        zip.generateAsync({type:"blob"})
        .then(function (blob) {
            // 回收变量
            _this[Symbol.for('pdfIndex')] = undefined;
            // 下载blob
            var link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.download = 'pdf';
              link.click();
              window.URL.revokeObjectURL(link.href);
            // window.open(window.URL.createObjectURL(blob))
            _this.loadingInstance.close();
        });
      }
    },
    pdf(){
      this.loadingInstance = Loading.service({ fullscreen: true, text: 'pdf生成中……' });
      service.previewData({quotaIds:this.selectedUrl}).then(res=>{
        function* previewDatas(){
          const { result } = res
          for (let i = 0; i<result.length; i++) {
             yield result[i]
          }
          return false
        }
        this.previewDatas= previewDatas();
        this.previewData= this.previewDatas.next().value;
        this.zip = new JSZip()
        this.pdfIndex = 1;
        this[Symbol.for('pdfIndex')] = 1;
      })
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../assets/scss/position.scss";

.indicator-lib {
  width: 100%;
  box-sizing: border-box;
  & > section {
    background: #ffffff;
    border: 1px solid #e5e9f1;
    box-shadow: 0 0 3px 0 #ced7e8;
    margin-bottom: 20px;
    padding: 20px 0;
  }

  .form-wrap {
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
  .handle-wrap {
    margin-bottom: 15px;
	width: 50%;
    .input-title {
      display: inline-block;
      width: 72px;
      text-align: right;
    }
    .el-select,
    .small-input {
      width: 220px;
    }
    .large-input {
      width: 520px;
    }
  }
  .table-title {
    text-align: center;
    font-size: 18px;
    height: 70px;
    line-height: 70px;
    background-color: #fff;
	font-weight: bold;
  }
  .handle-table {
    text-align: right;
    .el-button {
      color: #333;
      margin: 0px 5px;
    }
    .line {
      width: 1px;
      height: 15px;
      background-color: #333;
      display: inline-block;
      vertical-align: text-bottom;
    }
  }
  .el-dialog--small {
    width: 25%;
    min-width: 345px;
  }
  .el-table {
    border: none !important;
    .el-table__header-wrapper {
      th {
        background-color: #f5f5f5;
        div {
          background-color: #f5f5f5;
        }
      }
    }
    .el-table__body-wrapper {
      td {
        border-bottom: none !important;
      }
      tr:nth-child(2n) {
        td {
          background-color: #f5f5f5;
        }
      }
      tr:nth-child(2n + 1) {
        td {
          background-color: #fff;
        }
      }
    }
    &:before {
      height: 0 !important;
    }
    &:after {
      width: 0 !important;
    }
  }
  .el-pagination {
    // @include align-justify-center;
    height: 40px;
    background-color: #fff;
    padding-top: 20px;
    text-align: center;
    .el-pagination__editor{
      padding: 0 2px;
      border: none;
    }
  }
}

.pdf-preview{
  position: fixed;
  opacity: 0;
  left: 0;
  right: 0;
  top: 0;
  // bottom: 0;
  display: block;
  z-index: -9999;
  width: 100%;
  // overflow: scroll;
  overflow: hidden;
  pointer-events: none;
}
</style>