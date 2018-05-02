<template>
	<div>
	    <div class="steps">
			<span class="step stepActive" @click="confirmGotoStep(1)">1、定义指标</span>
			<span class="step stepActive"><span class="arrow arrowActive"></span>2、新增图表</span>
			<span class="step" @click="confirmGotoStep(3)"><span class="arrow arrowActive"></span>3、分析结果</span>
			<!-- <span class="step" @click="confirmGotoStep(3)"><span class="arrow arrowActive"></span>3、生成报表</span> -->
			<!-- <span class="step" @click="confirmGotoStep(4)"><span class="arrow"></span>4、分析结果</span> -->
		</div>
		<div class="button-wrapper">
        <div class="creat-excel-btn">
          <el-button @click="addTable">
              <i 
              style="font-size:16px;margin-right:10px"
              class="el-icon-plus"></i>
            新增表格
          </el-button>
        </div>	 
        <el-pagination
          ref = "pagonation"
          class="pagonation"
          :current-page="currentPage"
          @current-change= "changePage"
          :page-size="1"
          layout="total,prev, pager, next"
          :total="indicatorsTable.length"
          >
        </el-pagination> 
		    <el-button
			  size="large"
			  @click="confirmGotoStep(1)">上一步</el-button>
	    	<el-button
	    	  type="primary" 
	    	  size="large"
	    	  @click="confirmGotoStep(3)">下一步</el-button>
	    </div>
		<div class="entry-step-2">
			
	        <div class="indicator-table">
	            <web-excel 
	              v-for='(indicatorTable, index) in indicatorsTable'
                v-if = 'currentPage-1 == index'
	              :key="index"
	              :prop-table="indicatorTable"
	              v-on:whetherSave='dependEdit'
	              :id="index"></web-excel>         
	        </div>
		</div>
		<el-dialog
		  size="tiny"
		  :visible.sync='dialogVisible'>
		  <i class="el-icon-warning" style="vertical-align: top;margin-top: 10px;margin-right: 15px;font-size: 40px;"></i>
		  <div style="display: inline-block;">
		  	<strong style="font-size: 18px;">您对表格有做修改，但尚未保存！</strong>
		  	<div style="font-size: 15px;margin-top: 15px;">请点击表格右上角保存按钮进行保存</div>
		  </div>
		  <span slot="footer" class="dialog-footer">
		    <!-- <el-button 
		      @click="gotoStep()" 
		      size="small"
		      style="margin-right: 30px;">不保存</el-button> -->
		  	<el-button @click="dialogVisible = false" size="small" type="primary">知道了</el-button>
		  	<!-- <el-button @click="gotoStep()" type="primary" size="small">保存</el-button> -->
		  </span>  	
		</el-dialog>
	</div>	
</template>

<script>
import service from "@/service/service";
// import handleObject from "@/util/handleObject";
import webExcel from "@/components/webExcel";
export default {
  components: {
    webExcel,
  },
  data() {
    return {
      tableData: [
        [
          {
            x: 2,
            y: 1,
            content: "xx"
          },
          {
            x: 1,
            y: 1,
            content: "xx2"
          }
        ],
        [
          {
            x: 1,
            y: 1,
            content: "yy"
          }
        ]
      ],
      indicatorsTable: [],
      args: [],
      dialogVisible: false,
      currentPage: 1,
    };
  },
  beforeRouteEnter(to, from, next) {
    service.getOldTable(to.query.quotaId).then(res => {
      next(vm => {
        if (res.result) {
          vm.indicatorsTable = res.result;
          console.log(res.result);
        }
      });
    });
  },
  methods: {
    confirmGotoStep(num) {
      let mark = this.args.some(data => {
        return data === true;
      });
      console.log(mark);
      mark ? (this.dialogVisible = true) : this.gotoStep(num);
    },
    gotoStep(num) {
      let query = this.$route.query.isEdit
        ? Object.assign(
            { quotaId: this.$route.query.quotaId },
            { isEdit: this.$route.query.isEdit }
          )
        : { quotaId: this.$route.query.quotaId };
      this.$router.push({
        name: `entryStep${num}`,
        query
      });
    },
    dependEdit(arg1, arg2) {
      console.log(arg1)
      console.log(arg2)
      if (arg1 != "del") {
        this.$set(this.args, parseInt(arg2), arg1);
      } else {
        this.args.splice(arg2, 1);
      }
    },
    addTable() {
      this.indicatorsTable.push({
        tableData: (function(rows, columns) {
          const result = [];
          for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < columns; j++) {
              row.push("");
            }
            result.push(row);
          }
          return result;
        })(8, 10),
        cellInfo: true,
        tableId: "",
        new: true,
        tableName: "表格名称"
      });
    },
    changePage(number){
      let mark = this.args.some(data => {
        return data === true;
      });
      console.log(number,this.currentPage)
      if(mark){
        this.dialogVisible = true;
        return false
      }else{
        this.currentPage = number
      }
    },
    changePageProxy(number){
        this.currentPage = number
    }
  },
  mounted(){
    const _this = this
    this.$refs.pagonation.$el.addEventListener('click',function(e){
      
      let mark = _this.args.some(data => {
        return data === true;
        });
        if(mark){
          e.stopPropagation()
          _this.dialogVisible = true;
        }
      }, true)
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import "../../assets/scss/position.scss";
.entry-step-2 {
  // top: 80px;
  // bottom: 60px;
  margin-bottom: 40px;
  .button-wrap {
    width: 95%;
    min-width: 710px;
    margin: 13px auto;
  }
  .indicator-table {
    // width: 95%;
    // margin: 0 auto;
  }
  .el-icon-information {
    margin-left: 20px;
    color: rgba(0, 0, 0, 0.43);
  }
}
.el-popover {
  .popoverLoading {
    width: 100%;
    height: 100%;
  }
  .title {
    text-align: center;
    font-size: 16px;
    margin-bottom: 20px;
    margin-top: 10px;
  }
  .el-checkbox-group {
    padding-left: 50px;
    .el-checkbox {
      display: block;
      margin-left: 15px;
      margin-bottom: 15px;
      .checkbox-title {
        display: inline-block;
        vertical-align: middle;
        margin-left: 10px;
      }
    }
  }
  .button-handle {
    text-align: right;
    padding-right: 10px;
    margin-top: 25px;
    margin-bottom: 10px;
  }
}
.info-popover {
  z-index: 2000 !important;
}
// 2018.4.2 new recover style
.hot .ht_master>.wtHolder {
  overflow-y: hidden;
  height: auto !important;
  display: inline-block;
  max-width: 100% !important;
  width: auto !important;
}
// .ht_clone_top .wtHolder,
// .ht_clone_bottom .wtHolder {
//   overflow-x: hidden;
// }

.button-wrapper {
  .creat-excel-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 125px;
    left: 0;
    border: none;

    button {
      background: #06aea6;
      border: none;
      border-radius: 0;
      color: #fff;
      padding: 0;
      width: 100%;
      height: 100%;
      &:hover {
        background: #68d1be;
      }
    }
  }

  .pagonation{
    display: inline-block;
    position: absolute;
    left: 150px;
    top: 50%;
    bottom: 0;
    margin: auto;
    vertical-align: middle;
    transform: translate(0,-50%);
  }
}
</style>