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
          v-if="indicatorsTable.length>1"
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
        <div 
          class="indicator-table"
          v-for ="(item, index) in indicatorsTable"
          :key="index" 
          v-if="currentPage - index === 1"
        >
          <web-excel 

            :prop-table="item"
            v-on:whetherSave='dependEdit'
            :id="currentPage-1"
            :save="save"
            :delete="del"
            ></web-excel>     
        </div>
        <!-- <div class="indicator-table">
          <web-excel 
            v-if="currentTableData"
            :prop-table="currentTableData"
            v-on:whetherSave='dependEdit'
            :id="currentPage-1"
            :save="save"
            :delete="del"
            ></web-excel>     
        </div> -->
		</div>
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
      currentPage: 1,
    };
  },
  computed:{
    currentTableData(){
      return this.indicatorsTable[this.currentPage-1]
    }
  },
  beforeRouteEnter(to, from, next) {
    service.getOldTable(to.query.quotaId).then(res => {
      next(vm => {
        if (res.result) {
          vm.indicatorsTable = res.result;
        }
      });
    });
  },
  methods: {
    unSaveAlert(){
      this.$alert(
        this.$createElement('p',  {class:"confirm-message" }, [
          this.$createElement('svg', null, [
            this.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
          ]),
          this.$createElement('span', null, '您对表格有所修改，但尚未保存，请点击表格右上角进行保存！')
        ]),
      '',
      {
        confirmButtonText: '知道了'
      });
    },
    confirmGotoStep(num) {
      let mark = this.args.some(data => {
        return data === true;
      });
      mark ? this.unSaveAlert() : this.gotoStep(num);
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
      if (arg1 != "del") {
        this.$set(this.args, parseInt(arg2), arg1);
      } else {
        this.args.splice(arg2, 1);
      }
    },
    addTable() {
      let mark = this.args.some(data => {
        return data === true;
      });
      if(mark){
        this.unSaveAlert()
        return false
      }
      
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
        })(10, 10),
        cellInfo: true,
        tableId: "",
        new: true,
        tableName: "表格名称"
      });
      this.changePage(this.indicatorsTable.length)      
    },
    changePage(number){
      let mark = this.args.some(data => {
        return data === true;
      });
      if(mark){
        // this.dialogVisible = true;
        this.unSaveAlert()
        return false
      }else{
        this.currentPage = number
      }
    },
    changePageProxy(number){
        this.currentPage = number
    },
    save(params){
      const index = this.currentPage-1
      params= {...params,...{sort:index}}
      if(this.indicatorsTable[index].new){
        return this.$service.saveTable(params).then(res=>{
          if (res.responseCode == "0") {
            this.indicatorsTable.splice(index, 1, res.result)
            return res
          }
        })
      }
      return this.$service.updateTable(params).then(res=>{
        if (res.responseCode == "0") {
          this.indicatorsTable = res.result.filter(ele=>ele.isDeleted === 'n')
          return res
        }
      })
    },
    vif(index){
      return index === this.currentPage -1
    },
    del (params){
      const index = this.currentPage-1
      params= {...params,...{sort:index}, ...{ quotaId: this.$route.query.quotaId }}
      return this.$service.deleteTable(params).then(res=>{
        if (res.responseCode == "0") {
          this.indicatorsTable.splice(index,1);
          this.currentPage = Math.min(index+1, this.indicatorsTable.length)||1
          return res
        }
      })
   },
   checkClickHandle(e){
    let mark = this.args.some(data => {
    return data === true;
    });
    if(mark){
      e.stopPropagation()
      // _this.dialogVisible = true;
      this.unSaveAlert()
    }
   },
   checkSaveHandle(){
    if(this.indicatorsTable.length>1){
      this.$refs.pagonation.$el.addEventListener('click', this.checkClickHandle , true)
      }
    }
  },
  mounted(){
    this.checkSaveHandle()
  },
  updated(){
    this.checkSaveHandle()
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