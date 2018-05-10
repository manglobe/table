<template>
    <section :class="{'excel-wrap': editorAble, 'excel-display': !editorAble}"
     ref="excelWrap" 
     >
      <div class="flex-wrap">
        <div v-if="editorAble" class="btn-handle-2">
          <!-- <el-button 
            v-if="isEdit"
            type="text" 
            @click="editTable">编辑表</el-button> -->
          <span class="excel-undo" @click="undo">
            <svg aria-hidden="true">
              <use xlink:href="#icon-hebingxingzhuang"></use>
            </svg>
            撤销
          </span>
          <span class="excel-redo" @click="redo">
            <svg aria-hidden="true">
              <use xlink:href="#icon-hebingxingzhuang"></use>
            </svg>
            重做
          </span>
          <el-button 
            type="text" 
            @click="saveTable"
            :disabled='!isEdit'
            :loading='saving'>保存</el-button>
          <span class="line"></span>
          <el-popover
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
          <!-- <el-button 
            v-else
            type="text" 
            @click="undoTable">取消</el-button> -->
          <div class="tools">
            <span>fx</span>
            <input type="text" readonly ref="funcInput">
            <FakeSelect svg='#icon-gongshi' ref="funcSelect"  v-bind:changeHandle="funcSelect" v-bind:options="excelFunctionsOptions" name="公式"/>
            <FakeSelect svg='#icon-charutubiao' v-bind:changeHandle="chartSelect" v-bind:options="excelChartsOptions" name="插入图表"/>
            <FakeSelect svg='#icon-shengchengtubiao' v-bind:changeHandle="chartSelectFull" v-bind:options="excelChartsOptions" name="自动生成图表"/>
          </div>
        </div>

        <div :id="idName" ref="excel" class="hot htCenter handsontable htRowHeaders htColumnHeaders"></div>
        <div class="charts" :class="{'display-block': !editorAble}">
          <div 
          class="chart-wrap" 
          v-for="(item, index) in chartOptionsSourse" 
          :key="index" 
          :class="{ 'title-editing':titleEditingIndex === index }"
          @mouseenter = "()=>toggleChartsRange(item,true)"
          @mouseleave = "()=>toggleChartsRange(item,false)"
        >
            <div class="chart-layer" @click="()=>quitChartEditor(index)"></div>
            <div class="chart-title-editor" >
              <input
                type="text" 
                :value="item.title" 
                autofocus
                maxlength="20"
                @keydown="e=>titleEditorKeydownHandle(e,index)"
                @input="chartTitleEditorCacheValue= $event.target.value"
              />
              <i class="el-icon-close" title="取消" @click="()=>quitChartEditor(index, false)"></i>
              <i class="el-icon-check" title="保存" @click="e=>quitChartEditor(index, true)"></i>
            </div>
            <Charts 
              :readonly="editorAble"
              :optionsSourse ="item"
              :changeHandle ="v=>chartControllerHandle(v,index)"
              :chartsUnit = "excelCharts"
              :finishedHandle = "chartsFinishedHandle"
            >
            </Charts>
        </div>
        </div>
        <!-- <div class="chart-wrap">
            <Charts :options="chartOptionFull" >
            </Charts>
        </div> -->
      
      </div>
    </section>

</template>

<script>
import Handsontable from "handsontable-pro";
import SheetClip from "sheetclip";
import Calculation from "@/util/Calculation.js";
import handleObject from "@/util/handleObject";
import "handsontable-pro/dist/handsontable.full.css";
import FakeSelect from "./fakeSelect.vue";
import { excelFunctions, excelCharts } from "./excelPlugins/excelStaticData";
import EchartsWrapper from "@/components/echartsWrapper.vue";
import IEcharts from 'vue-echarts-v3/src/full.js';
import Charts from '@/components/echartsBox.vue';
export default {
  components: { FakeSelect, IEcharts, Charts },
  props: {
    id: {
      type: [String, Number],
      default: ""
    },
    propTable: {
      type: Object,
      default:  function(){
        return {}
      }
    },
    editorAble: {
      type: Boolean,
      default: true
    },
    save:{
      type: Function,
    },
    delete:{
      type: Function,
    },
    allChartsFinished:{ // 全图表加载完成事件
      type: Function,
    }
  },
  data() {
    var self = this;
    return {
      excelCharts:excelCharts,
      chartOptionsSourse: self.propTable.imgData?JSON.parse(self.propTable.imgData):[],
      excelFunctionsOptions: Object.keys(excelFunctions).map(ele => ({
        value: ele,
        label: excelFunctions[ele].name
      })),
      excelChartsOptions: Object.keys(excelCharts).map(ele => ({
        value: ele,
        label: excelCharts[ele].name
      })),
      titleEditingIndex:'',
      drawStep: [],
      chartStep: [],
      funcStore: {},
      funcCache: "",
      visible: false,
      hot1: "",
      isEdit: false,
      saving: false,
      tableId: self.propTable.tableId,
      clipboardCache: [],
      sheetclip: new SheetClip(),
      firstSelectedRow: "",
      firstSelectedCol: "",
      lastSelectedRow: "",
      lastSelectedCol: "",
      chartTitleEditorCacheValue: "",
      selectedRow:[],
      hotSettings: {
        readOnly: !this.editorAble,
        data:
          typeof self.propTable.tableData === "string"
            ? JSON.parse(self.propTable.tableData)
            : self.propTable.tableData,
        mergeCells: true,
        comments: true,
        colHeaders: true,
        rowHeaders: true,
        minCols: 1,
        minRows: 1,
        maxCols: 15,
        colWidths: this.editorAble?120:64,
        rowHeaderWidth: this.editorAble?52:40,
        rowHeights: this.editorAble?40:30,
        columnHeaderHeight: this.editorAble?40:30,
        autoRowSize: {syncLimit: '40%'},
     
        outsideClickDeselects: false,
        //  eventTarget => {
        //   if (
        //     self.$refs.funcSelect.$refs.mySelect.contains(eventTarget) ||
        //     self.$refs.excel.contains(eventTarget)
        //   ) {
        //     return false;
        //   }
        //   return true;
        // },
        className: "htCenter htMiddle",
        afterSelection(r, c, r2, c2) {
          self.selectedRange = [r, c, r2, c2];

        },

        afterSelectionEnd(r,c,r2,c2){
          if(r>r2){
            [r,r2]=[r2,r]
          }
          if(c>c2){
            [c,c2]=[c2,c]
          }
          const SelectedRange = self.hot1.getSelected();
          if(SelectedRange.length===1){
            self.selectedRow = []
          }
          for(let i = r;i<=r2;i++){
            if(!self.selectedRow[i]){
              self.selectedRow[i] = [];
            }
            for(let u=c; u<=c2; u++){
              self.selectedRow[i][u] = 1
            }
          }
          self.hot1[Symbol.for('lastSelected')] = SelectedRange;
          // let mixed= self.hot1[Symbol.for('lastSelected')].reduce(mix)
          // self.hot1[Symbol.for('lastSelected')] = 
          if(self.funcStore[`${r}-${c}`]&& /^=/.test(self.funcStore[`${r}-${c}`])){
            self.$refs.funcInput.value = self.funcStore[`${r}-${c}`]
          }else{
            self.$refs.funcInput.value = '';
          }
        },
        beforeChange: function(changes, sourse) {

          // 控制函数存储器
          const controlStore = (key, value) => {
            const STORE = self.funcStore;
            // if (value === undefined && !STORE[key]) {
            //   return;
            // }
            if (value === false) {
              delete STORE[key];
              return;
            }
            if (STORE[key] && STORE[key].autoFill) {
              STORE[key] = STORE[key].autoFill;
              return;
            }
            if (!/^=/.test(value)) {
              delete STORE[key];
              return;
            }
            STORE[key] = value;
          };
          // 补全括号
          const bracketsComplete = str => {
            let pre = str.match(/\(/g) ? str.match(/\(/g).length : 0;
            let next = str.match(/\)/g) ? str.match(/\)/g).length : 0;
            if (pre - next > 0) {
              for (let i = 0; i < pre - next; i++) {
                str += ")";
              }
            }
            return str;
          };
          // 提取命名函数
          const filterNameFunc = value => {
            let midVal = value;
            Object.keys(excelFunctions).forEach(ele => {
              if (midVal.toUpperCase().indexOf(ele) > 0) {
                let reg = new RegExp(
                  `${ele}\\((\\(.*?\\)|[^\\(\\)])*\\)?`,
                  "g"
                );
                // let reg = new RegExp(`${ele}\\((.*?)\\)`, "g");
                midVal = midVal.replace(reg, match => {
                  return excelFunctions[ele].func(match);
                });
              }
            });
            return midVal;
          };
          // 计算
          const computeValue = (row, col, value) => {
            controlStore([`${row}-${col}`], value);
            if (/^=/.test(value)) {
              let newVal = filterNameFunc(bracketsComplete(value));
              try {
                let thisCell = `${String.fromCharCode(col + 65)}${row + 1}`;
                if (newVal.toUpperCase().indexOf(thisCell) > 0) {
                  throw "choose self";
                }
                let expression = newVal
                  .replace(/\=/, "")
                  .replace(/([a-z]+)(\d+)/gi, (match, $1, $2) => {
                    return (
                      self.hot1.getDataAtCell(
                        $2 - 1,
                        $1.toUpperCase().charCodeAt(0) - 65
                      ) || 0
                    );
                  });
                  let isNum = false;
                  if(/[\d\.](?!%)/.test(expression)){
                    console.log('isNum')
                    isNum =true 
                  }
                  expression = expression.replace(/([\d\.]+)%/g,(match,$1)=>{
                    return $1/100
                  })
                  console.log(expression)
                newVal = isNum?eval(expression):eval(expression)*100+'%';
              } catch (error) {
                newVal = "#VALUE!";
                if (error === "choose self") {
                  self.$alert(
                    self.$createElement('p',  {class:"confirm-message" }, [
                      self.$createElement('svg', null, [
                        self.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
                      ]),
                      self.$createElement('span', null, '公式中的单元格引用了公式的结果，从而创建了循环引用,请重新选择。')
                    ]),
                    "范围选择错误",
                    {
                      confirmButtonText: "确定"
                    }
                  );

                  controlStore([`${row}-${col}`], false);
                  newVal = null;
                } else if (sourse !== "funcRender") { 
                  self.$alert(
                    self.$createElement('p',  {class:"confirm-message" }, [
                      self.$createElement('svg', null, [
                        self.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
                      ]),
                      self.$createElement('span', null, `你是否要输入公式文本?
                      当第一个字符是 = 时，表格会认为它是公式，为避免这个问题，请在 = 号前输入'，例如：'=1+1，则此时单元格会显示：=1+1`)
                    ]), "公式输入异常", {
                    confirmButtonText: "确定"
                  });
                }
                // controlStore([`${changes[0][0]}-${changes[0][1]}`], false);
              }
              // 修改输入值
              return newVal === "Infinity" ? "#DIV/0!" : newVal;
            }
            if(/^'=/.test(value)){
              return value.replace(/^'/,'');
            }
            return value;
          };

          changes.forEach((columDataArr, rowIndex) => {
            let changedVal = changes[rowIndex][3];
            const row = changes[rowIndex][0];
            const col = changes[rowIndex][1];
            let val = computeValue(row, col, changedVal);
            changes[rowIndex][3] = val;
          });
        },

        afterBeginEditing: function(row, col) {
          self.quitEditor()
          let edit = self.hot1.getActiveEditor();
          let editArea = edit.TEXTAREA;
          self.editArea = editArea;
          if(/^=/.test(editArea.value)){
            editArea.value = `'`+editArea.value;
          }
          if (self.funcStore[`${row}-${col}`]) {
            editArea.value = self.funcStore[`${row}-${col}`];
          }
          let Input = self.inputNode;
          Input.row = row;
          Input.col = col;
          const inputHandle = () => {
            if (/^\=/.test(editArea.value)) {
              self.hot1.destroyEditor(true)
              self.drawInput(editArea.value);
            }
          };
          inputHandle();
          editArea.addEventListener("input", inputHandle);
        },

        afterChange: function(changes, sourse) {
          console.log(changes, sourse)
          if (sourse !== "funcRender") {
            self.funcRender();
          }
          if (changes) {
            self.chartDataUpDate(changes);
            self.isEdit = true;
            self.$emit("whetherSave", self.isEdit, self.id);
          }
        },

        afterCopy: function(changes, coords) {
          // 缓存已合并的单元格
          const mergedArr = self.hot1.getPlugin("MergeCells")
            .mergedCellsCollection.mergedCells;
          self.pasteMergeCache = [];
          // this.getPlugin(
          //       "MergeCells"
          //     ).mergedCellsCollection.getWithinRange({})
          mergedArr.filter(ele => {
            if (
              ele.row >= coords[0].startRow &&
              ele.col >= coords[0].startCol &&
              ele.row + ele.rowspan -1 <= coords[0].endRow &&
              ele.col + ele.colspan -1 <= coords[0].endCol
            ) {
              self.pasteMergeCache.push({
                rowReduce: ele.row - coords[0].startRow,
                colReduce: ele.col - coords[0].startCol,
                rowspan: ele.rowspan,
                colspan: ele.colspan
              });
              return true;
            }
          });

          self.clipboardCache = self.sheetclip.stringify(changes);
        },

        afterCut: function(changes) {
          self.clipboardCache = self.sheetclip.stringify(changes);
        },

        afterPaste: function(changes, coords) {
          console.log(changes, coords)
          if (self.pasteMergeCache.length) {
            self.pasteMergeCache.forEach(ele => {
              self.hot1
                .getPlugin("MergeCells")
                .merge(
                  coords[0].startRow + ele.rowReduce,
                  coords[0].startCol + ele.colReduce,
                  coords[0].startRow + ele.rowReduce + ele.rowspan - 1,
                  coords[0].startCol + ele.colReduce + ele.colspan - 1
                );
            });
          }
          self.clipboardCache = self.sheetclip.stringify(changes);
        },

        afterContextMenuShow(context) {
          self.firstSelectedRow = this.getSelectedRange()[0].from.row;
          self.firstSelectedCol = this.getSelectedRange()[0].from.col;
          self.lastSelectedRow = this.getSelectedRange()[0].to.row;
          self.lastSelectedCol = this.getSelectedRange()[0].to.col;
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            for (
              let j = self.firstSelectedCol;
              j <= self.lastSelectedCol;
              j++
            ) {
              self.selectedData[i][j] = this.getDataAtCell(i, j);
            }
          }
        },       
        beforeAutofillInsidePopulate(
          index,
          direction,
          dataSourse,
          deltas,
          empty,
          fillSize
        ) {
          let thisCellData =
            dataSourse[index.row % dataSourse.length][
              index.col % dataSourse[0].length
            ];
          let originRange = self.selectedRange;
          let targetStartCell = [];

          switch (direction) {
            case "left":
              targetStartCell = [originRange[0], originRange[1] - fillSize.col];
              break;
            case "right":
              targetStartCell = [originRange[0], originRange[1] + 1];
              break;
            case "up":
              targetStartCell = [originRange[0] - fillSize.row, originRange[1]];
              break;
            case "down":
              targetStartCell = [originRange[0] + 1, originRange[1]];
              break;
            default:
              throw error("direction is undefined");
              break;
          }
          const autoFillFunction = data => {
            if (data) {
              let md = data.replace(/([A-Z]+)([0-9]+)/gi, (match, $1, $2) => {
                return (
                  String.fromCharCode(
                    $1.charCodeAt(0) +
                      index.col +
                      targetStartCell[1] -
                      originRange[1]
                  ) +
                  (+$2 + index.row + targetStartCell[0] - originRange[0])
                );
              });
              self.funcStore[
                `${targetStartCell[0] + index.row}-${targetStartCell[1] +
                  index.col}`
              ] = { autoFill: md };
            }
          };
          const checkData = (r, c) => {
            if (/^\=/.test(self.funcStore[`${r}-${c}`])) {
              return self.funcStore[`${r}-${c}`];
            }
            return false;
          };
          autoFillFunction(
            checkData(
              originRange[0] + index.row % dataSourse.length,
              originRange[1] + index.col % dataSourse[0].length
            )
          );
        },

        afterMergeCells(cellRange) {
          self.hot1.setDataAtCell(
            cellRange.from.row,
            cellRange.from.col,
            this[Symbol.for("mergeData")]
          );
        },

        beforeUndo(action){
          console.log(action)
        },
        afterCreateCol(index, amount, source){
          self.hot1.updateSettings({
            colWidths:  120*10/self.hot1.countCols()
          })
        },
        afterRemoveCol(index, amount){
          self.hot1.updateSettings({
            colWidths:  120*10/self.hot1.countCols()
          })
        }

      }
    };
  },

  watch: {
    "propTable": function(newVal, oldVal) {
      this.chartOptionsSourse= newVal.imgData?JSON.parse(newVal.imgData):[]
      this.tableId= newVal.tableId
      this.hotSettings={...this.hotSettings,
      ...{
        data:typeof newVal.tableData === "string"
            ? JSON.parse (newVal.tableData)
            : newVal.tableData
      }}
      this.hot1.updateSettings(
        {data:this.hotSettings.data}
      )
      setTimeout(()=>{
        this.isEdit = false;
        this.$emit("whetherSave", this.isEdit, this.id);
        this.hot1.deselectCell()
      })
    },
    "hotSettings.data": function(newVal, oldVal) {
      this.isEdit = true;
      this.$emit("whetherSave", this.isEdit, this.id);
    },
    "chartOptionsSourse":function(){
      this.isEdit = true;
      this.$emit("whetherSave", this.isEdit, this.id);
    },
  },

  computed: {
    selectedData() {
      const result = [];
      for (let i = 0; i < 12; i++) {
        let row = [];
        for (let j = 0; j < 20; j++) {
          row.push("");
        }
        result.push(row);
      }
      return result;
    },
    idName() {
      return `excel${this.id}`;
    },
  },

  methods: {
    chartDataUpDate(changes){
      this.chartOptionsSourse = this.chartOptionsSourse.map(ele=>{
        // 全局图表
        if(ele.range === 'full'){
          return {
            ...ele,
            ...{
              data:JSON.parse(this.getExcelData().tableData),
            }
          }
        }
        //前置校验 减少重绘
        if(changes.some(changesEle=>ele.selectedRow[changesEle[0]]&&ele.selectedRow[changesEle[0]][changesEle[1]] === 1)){
          return{
            ...ele,
            ...{
              data: this.computeChartData(ele.selectedRow, ele.range)
            }
          }
        }
        return ele
      })
    },
    computeChartData(selectedRow, range){
      if(range&& range.length===1){
        return this.hot1.getData(...range[0])
      }
      const selectedCol = selectedRow.find(ele=>ele)
      const emptyRow = Array.from(selectedRow).map((ele,index)=>ele?false:index).filter(ele=>ele)
      const emptyCol = Array.from(selectedCol).map((ele,index)=>ele?false:index).filter(ele=>ele)
      const bigestRange= [
        selectedRow.findIndex(ele=>ele),
        selectedCol.findIndex(ele=>ele),
        selectedRow.length-1,
        selectedCol.length-1,
      ]
      let bigestData = this.hot1.getData(...bigestRange)
      let data = bigestData.filter((ele,index)=> !emptyRow.includes(index))
        .map(ele=>ele.filter((ele,index)=> !emptyCol.includes(index)))

      return data
    },
    chartSelect(v, i) {
      const selectRange = this.hot1[Symbol.for('lastSelected')]
      let data;
      if(selectRange.length>1){
        // 前置校验是否进行了多次选择， 减少计算成本
        const selectedCol = this.selectedRow.find(ele=>ele)
        const colStr = selectedCol.toString()
        if(this.selectedRow.some(ele=>ele.toString() !== colStr)){
          this.$alert(
            this.$createElement('p',  {class:"confirm-message" }, [
              this.$createElement('svg', null, [
                this.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
              ]),
              this.$createElement('span', null, "图表的数据范围不能形成一个规则矩形,请重新选择。")
            ]),
            "范围选择错误",
            {
              confirmButtonText: "确定"
            }
          );
          return false
        }
        data = this.computeChartData(this.selectedRow)
      }else{
        data = this.hot1.getData(...selectRange[0])
      }
      
      this.chartOptionsSourse.push({
        data,
        type: v,
        title:'图表标题',
        transpose: false,
        range: selectRange,
        selectedRow: this.selectedRow,
      })

    },
    chartSelectFull(v) {
       this.chartOptionsSourse.push({
        data: JSON.parse(this.getExcelData().tableData),
        type: v,
        title:'图表标题',
        transpose: false,
        range:'full'
      })

    },
    chartControllerHandle(v,index){
      switch (v){
        case 'transpose':
          this.chartOptionsSourse.splice(index,1,{
            ...this.chartOptionsSourse[index],
            ...{transpose:!this.chartOptionsSourse[index].transpose}
          } )

        break
        case 'editorTitle':
          this.titleEditingIndex=index
        break
        case 'delete':
          // this.$confirm(
          //   this.$createElement('p',  {class:"confirm-message" }, [
          //     this.$createElement('svg', null, [
          //        this.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
          //     ]),
          //     this.$createElement('span', null, '确定要删除该表格吗？')
          //   ]),
          //   {
          //     confirmButtonText: "确定",
          //     cancelButtonText: "取消"
          //   }
          // )
          // .then(() => {
            this.chartOptionsSourse.splice(index,1)
          // })
          // .catch(() => {
          //   return false;
          // });
        break
        default: 
          console.log('chartControllerHandle error');
      }
    },
    quitChartEditor(index, save){
      this.titleEditingIndex = '';
      if(save){
        this.chartOptionsSourse.splice(index,1,{
          ...this.chartOptionsSourse[index],
          ...{title:this.chartTitleEditorCacheValue}
        } )
      }
    },
    titleEditorKeydownHandle(e,index){
      if(e.keyCode===13){
        this.quitChartEditor(index, true)
      }
      if(e.keyCode===27){
        this.quitChartEditor(index)
      }
    },
    toggleChartsRange(item,show){
      if(!this.editorAble){
        return false
      }
      if(show){
        if(item.range==='full'){
          this.addDrawStep('full', 'chartStep')
        }else{
          item.range.forEach(ele=>{
            this.addDrawStep(...ele,'chartStep')
          })
        }
      }else{
        this.chartStep=[]
      }
        this.drawCanvas()
    },
    addDrawStep(r, c, r2, c2,type) {
      if(r>r2){
        [r,r2]=[r2,r]
      }
      if(c>c2){
        [c,c2]=[c2,c]
      }

      const _this =this;
      const settings = this.hot1.getSettings();

      //  _this.hot1.getPlugin('autoRowSize').recalculateAllRowsHeight()
      const rowsHeight = _this.hot1.getPlugin('autoRowSize').heights.map(ele=>ele<settings.rowHeights?settings.rowHeights:ele)
      if(r === 'full'){
        _this[c].push({
            render(ctx, color) {
          ctx.strokeStyle = color;
          ctx.strokeRect(
            settings.rowHeaderWidth,
            settings.columnHeaderHeight,
            _this.$refs.excel.clientWidth-settings.rowHeaderWidth,
            eval(rowsHeight.join('+')) 
          );
        }
        })
      }

      this[type||'drawStep'].push({
        render(ctx, color) {
          ctx.strokeStyle = color;
          ctx.strokeRect(
            settings.rowHeaderWidth + c *  settings.colWidths,
            settings.columnHeaderHeight + (eval(rowsHeight.slice(0,r).join('+'))||0),
            (c2 - c + 1) * settings.colWidths ,
            eval(rowsHeight.slice(r,r2+1).join('+'))
          );
        }
      });
    },
    // function
    funcSelect(v) {
      let selectItem;
      const Input = this.inputNode;
      if (Input.style.display === "block") {
        selectItem = [Input.row, Input.col];
      } else {
        selectItem = this.hot1.getSelectedLast();
      }
      Input.row = selectItem[0];
      Input.col = selectItem[1];
      setTimeout(()=>{
        this.drawInput(
          `=${v.toUpperCase()}(`,
          true
        );
      })
    },
    funcRender() {
      let renderArr =  Object.keys(this.funcStore).map(ele=>{
        const element = this.funcStore[ele];
        const coordsArr = ele.match(/\d+/g);
        return [
          +coordsArr[0],
          +coordsArr[1],
          element,
        ]
      })

      this.hot1&&this.hot1.setDataAtRowProp(renderArr, 'funcRender')
    },
    createCanvas(node) {
      let Canvas = document.createElement("canvas");
      node =node.getElementsByClassName('wtHider')[0]
      node.appendChild(Canvas)
      this.canvasNode = Canvas;
      this.createInput(node);
      return Canvas;
    },
    quitFunctionEditor() {
      this.drawStep = [];
      let Canvas = this.canvasNode;
      let ctx = Canvas.getContext("2d");
      let Input = this.inputNode;
      Input.value = "";
      ctx.clearRect(0, 0, Canvas.width, Canvas.height);
      Input.style.display = "none";
      this.inputDisplay.style.display = "none";
    },
    quitEditor(shouldSaveData, shouldGetFocus) {
      const Input = this.inputNode;

      if (shouldSaveData) {
        this.hot1.setDataAtCell(Input.row, Input.col, Input.value);
      }
      this.quitFunctionEditor();
      for (const key in Input.quitCallbacks) {
        if (Input.quitCallbacks.hasOwnProperty(key)) {
          Input.quitCallbacks[key]()
          
        }
      }
      
      if (shouldGetFocus) {
        setTimeout(() => {
          this.hot1.selectCell(Input.row, Input.col, Input.row, Input.col);
        });
      }
    },
    createInput(node) {
      let Input = document.createElement("textarea");
      let InputDisplay = document.createElement("div");
      Input.classList.add("layer-input");
      InputDisplay.classList.add("layer-input-display");
      this.inputNode = Input; 
      this.inputDisplay = InputDisplay;
      node.insertBefore(Input, this.canvasNode);
      node.insertBefore(InputDisplay, this.canvasNode);
      Input.quitCallbacks = {};
      Input.addEventListener("keydown",(e)=> {
        // enter
        if (e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          this.quitEditor(true, Input.isSelecting);
        }
        // esc
        if (e.keyCode === 27) {
          e.preventDefault();
          this.quitEditor(false, true);
        }
      });
      Input.addEventListener("input", this.drawFromInput);
      Input.changeVal = value => {
        Input.value = value;
        this.drawFromInput();
      };
    },
    drawCanvas() {
      const colorArr = [
        "#71a1e6",
        "#008000",
        "#9900cc",
        "#800000",
        "#00cc33",
        "#c60",
        "#c09"
      ];
      let Canvas = this.canvasNode;
      Canvas.width = Canvas.clientWidth;
      Canvas.height = Canvas.clientHeight;
      let ctx = Canvas.getContext("2d");
      ctx.clearRect(0, 0, Canvas.width, Canvas.height);
      this.drawStep.forEach((ele, index) => {
        ele.render(ctx, colorArr[index % 7]);
      });
      this.chartStep.forEach((ele, index) => {
        ele.render(ctx, colorArr[index % 7]);
      });
    },
    drawInput(value, startEdit) {
      let Input = this.inputNode;
      let InputDisplay = this.inputDisplay;
      const row = Input.row;
      const col = Input.col;
      const rowsHeight = this.hot1.getPlugin('autoRowSize').heights.map(ele=>ele<this.hotSettings.rowHeights?this.hotSettings.rowHeights:ele)
      const settings = this.hot1.getSettings();
      Input.style.top = settings.columnHeaderHeight +  (eval(rowsHeight.slice(0,row).join('+'))||0) + "px";
      Input.style.left = settings.rowHeaderWidth + col * settings.colWidths + "px";
      Input.style.width = settings.colWidths + 2 + "px";
      Input.style.height = rowsHeight[row]+ 'px';
      InputDisplay.style.top = Input.style.top
      InputDisplay.style.left = Input.style.left
      InputDisplay.style.width = Input.style.width
      InputDisplay.style.height = Input.style.height
      Input.changeVal(value);      
      Input.style.display = "block";
      InputDisplay.style.display = "block";
      this.hot1.deselectCell();
      Input.focus();
      // 存储原始值
      let cacheValue = value;
      const selectRange = (r, c, r2, c2) => {
        let midStr;
        if (r === r2 && c === c2) {
          // 1格
          midStr = `${String.fromCharCode(c + 65)}${r + 1}`;
        } else {
          // 多格
          midStr = `${String.fromCharCode(Math.min(c, c2) + 65)}${Math.min(
            r,
            r2
          ) + 1}:${String.fromCharCode(Math.max(c, c2) + 65)}${Math.max(r, r2) +
            1}`;
        }
        return midStr;
      };

      // 单元格选择函数
      const selectCall = (r, c, r2, c2) => {
        let selectStr, selectBeforeStr, selectEndStr;
        selectBeforeStr = Input.value.slice(0, Input.selectionStart);
        selectEndStr = Input.value.slice(Input.selectionEnd);
        selectCall.callback = false;
        //  光标位置检测
        if (!Input.selectionStart === Input.selectionEnd) {
          selectStr = Input.value.slice(
            Input.selectionStart,
            Input.selectionEnd
          );
         
          if (/([a-z]\d+\:[a-z]\d+|[a-z]\d+)/i.test(selectStr)) {

            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr + str + selectEndStr);
            };
          }
        } else {
          if (/([a-z]\d+\:[a-z]\d+|[a-z]\d+)$/i.test(selectBeforeStr)) {
            
            let localSelectedRange = selectBeforeStr.match(
              /([a-z]\d+\:[a-z]\d+|[a-z]\d+)$/i
            )[0];
            let reg = new RegExp(localSelectedRange + "$");
            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr.replace(reg, str) + selectEndStr);
            };
          }

          if (
            /[\*\/\-\+\(\:\^]{1}$/.test(selectBeforeStr) ||
            /^\=$/.test(selectBeforeStr)
          ) {
            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr + str + selectEndStr);
            };
          }
        }
        let cacheSelectionStart= Input.value.length - Input.selectionStart;
        let cacheSelectionEnd= Input.value.length -  Input.selectionEnd;
        let selectedRangeStr = selectRange(r, c, r2, c2);
        selectCall.callback && selectCall.callback(selectedRangeStr);
        selectCall.callback && Input.setSelectionRange(Input.value.length - cacheSelectionStart,Input.value.length  - cacheSelectionEnd)
        Input.focus();
      };

      // 检测是否进入选择模式
      const checkToStartSelect = () => {
        Input.isSelecting = false;
        this.hot1.removeHook("afterSelectionEnd", selectCall);
        Input.style.height = Input.scrollHeight + 4 + "px";
        this.inputDisplay.style.height = Input.style.height;
        if (!/^=/.test(Input.value)) {
          return false;
        }
        Input.isSelecting = true;
        this.hot1.addHook("afterSelectionEnd", selectCall);
        // 编辑器的'退出回掉'中注入'清除选择单元格'的监听函数
        Input.quitCallbacks.clearSelect = () => {
          Input.isSelecting = false;
          this.hot1.removeHook("afterSelectionEnd", selectCall);
        };
      };
      checkToStartSelect();
      Input.addEventListener("input", checkToStartSelect);
      const clickHandle = e => {
        // blur
        if (Input.style.display !== "block" || e.target === Input) {
          return false;
        }
        if (!this.$refs.excel.contains(e.target)) {
          this.quitEditor(true, true);
          return;
        }
        if (!Input.isSelecting) {
          this.quitEditor(true);
        }
      };

      setTimeout(() => window.addEventListener("click", clickHandle));
      return Input;
    },
    drawFromInput() {
      if (!/^=/.test(this.inputNode.value)) {
        this.inputDisplay.innerHTML = this.inputNode.value
        return false 
      }
      let displayValue = this.inputNode.value.replace(/([a-z]+\d+\:[a-z]+\d+|[a-z]+\d+)/gi,'<span>$1</span>')
      this.inputDisplay.innerHTML=displayValue
      this.drawStep = [];
      try {
        this.inputNode.value
          .match(/([a-z]+\d+\:[a-z]+\d+|[a-z]+\d+)/gi)
          .forEach(ele => {
            if (/\:/.test(ele)) {
              const c =
                ele
                  .match(/[a-z]/gi)[0]
                  .toUpperCase()
                  .charCodeAt(0) - 65;
              const c2 =
                ele
                  .match(/[a-z]/gi)[1]
                  .toUpperCase()
                  .charCodeAt(0) - 65;
              const r = ele.match(/\d+/g)[0] - 1;
              const r2 = ele.match(/\d+/g)[1] - 1;
              this.addDrawStep(r, c, r2, c2);
            } else {
              const c =
                ele
                  .match(/[a-z]/gi)[0]
                  .toUpperCase()
                  .charCodeAt(0) - 65;
              const r = ele.match(/\d+/g)[0] - 1;
              this.addDrawStep(r, c, r, c);
            }
          });
        this.drawCanvas();
      } catch (error) {
        console.log(error);
      }
    },
    changeCellType(type) {
      let self = this;
      for (var i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
        for (var j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
          if (
            self.hotSettings.data[i][j] &&
            !isNaN(parseFloat(self.hotSettings.data[i][j]))
          ) {
            switch (type) {
              case 0: //常规
                self.$set(
                  self.hotSettings.data[i],
                  j,
                  self.formatNumber(self.selectedData[i][j], null)
                );
                break;
              case 1: //数字
                self.$set(
                  self.hotSettings.data[i],
                  j,
                  self.formatNumber(self.selectedData[i][j], null)
                );
                break;
              case 2: //数字(保留两位小数)
                self.$set(
                  self.hotSettings.data[i],
                  j,
                  self.formatNumber(self.selectedData[i][j], 2)
                );
                break;
              case 3: //百分比
                self.$set(
                  self.hotSettings.data[i],
                  j,
                  self.formatPercentage(self.selectedData[i][j], null)
                );
                break;
              case 4: //百分比(保留两位小数)
                self.$set(
                  self.hotSettings.data[i],
                  j,
                  self.formatPercentage(self.selectedData[i][j], 2)
                );
                break;
            }
          }
        }
      }
    },
    formatNumber(value, decimal) {
      if (!value) {
        return "";
      } else if (value.toString().indexOf("%") < 0) {
        if (!decimal) {
          return value;
        } else {
          return parseFloat(value).toFixed(2);
        }
      } else {
        let result = Calculation(value).div(1);
        if (!decimal) {
          return result;
        } else {
          return result.toFixed(2);
        }
      }
    },
    formatPercentage(value, decimal) {
      if (!value) {
        return "";
      } else if (value.toString().indexOf("%") > 0) {
        if (!decimal) {
          return parseFloat(value).toFixed(0) + "%";
        } else {
          return parseFloat(value).toFixed(2) + "%";
        }
      } else {
        let result = Calculation(value).mul(100);
        if (!decimal) {
          return result + "%";
        } else {
          return result.toFixed(2) + "%";
        }
      }
    },
    calculateRow(formula) {
      let self = this;
      switch (formula) {
        case "add":
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            let result = self.selectedData[i][self.firstSelectedCol];
            for (
              let j = self.firstSelectedCol + 1;
              j <= self.lastSelectedCol;
              j++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).add(value);
            }
            self.$set(
              self.hotSettings.data[i],
              self.lastSelectedCol + 1,
              result
            );
          }
          break;
        case "sub":
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            let result = self.selectedData[i][self.firstSelectedCol];
            for (
              let j = self.firstSelectedCol + 1;
              j <= self.lastSelectedCol;
              j++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).sub(value);
            }
            self.$set(
              self.hotSettings.data[i],
              self.lastSelectedCol + 1,
              result
            );
          }
          break;
        case "div":
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            let result = self.selectedData[i][self.firstSelectedCol];
            for (
              let j = self.firstSelectedCol + 1;
              j <= self.lastSelectedCol;
              j++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).div(value);
            }
            self.$set(
              self.hotSettings.data[i],
              self.lastSelectedCol + 1,
              result
            );
          }
          break;
        case "mul":
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            let result = self.selectedData[i][self.firstSelectedCol];
            for (
              let j = self.firstSelectedCol + 1;
              j <= self.lastSelectedCol;
              j++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).mul(value);
            }
            self.$set(
              self.hotSettings.data[i],
              self.lastSelectedCol + 1,
              result
            );
          }
          break;
        case "average":
          for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            let result = self.selectedData[i][self.firstSelectedCol];
            let count = 1;
            for (
              let j = self.firstSelectedCol + 1;
              j <= self.lastSelectedCol;
              j++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).add(value);
              count++;
            }
            let average = Calculation(parseFloat(result)).div(count);
            if (result.toString().indexOf("%") > 0) {
              average = `${average}%`;
            }
            self.$set(
              self.hotSettings.data[i],
              self.lastSelectedCol + 1,
              average
            );
          }
          break;
      }
    },
    calculateCol(formula) {
      let self = this;
      let rowLength = self.hotSettings.data.length;
      let colLength = self.hotSettings.data[0].length;
      if (self.lastSelectedRow + 1 === rowLength) {
        self.hotSettings.data.push(new Array(colLength));
      }
      switch (formula) {
        case "add":
          for (let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
            let result = self.selectedData[self.firstSelectedRow][j];
            for (
              let i = self.firstSelectedRow + 1;
              i <= self.lastSelectedRow;
              i++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).add(value);
            }
            self.$set(
              self.hotSettings.data[self.lastSelectedRow + 1],
              j,
              result
            );
          }
          break;
        case "sub":
          for (let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
            let result = self.selectedData[self.firstSelectedRow][j];
            for (
              let i = self.firstSelectedRow + 1;
              i <= self.lastSelectedRow;
              i++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).sub(value);
            }
            self.$set(
              self.hotSettings.data[self.lastSelectedRow + 1],
              j,
              result
            );
          }
          break;
        case "div":
          for (let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
            let result = self.selectedData[self.firstSelectedRow][j];
            for (
              let i = self.firstSelectedRow + 1;
              i <= self.lastSelectedRow;
              i++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).div(value);
            }
            self.$set(
              self.hotSettings.data[self.lastSelectedRow + 1],
              j,
              result
            );
          }
          break;
        case "mul":
          for (let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
            let result = self.selectedData[self.firstSelectedRow][j];
            for (
              let i = self.firstSelectedRow + 1;
              i <= self.lastSelectedRow;
              i++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).mul(value);
            }
            self.$set(
              self.hotSettings.data[self.lastSelectedRow + 1],
              j,
              result
            );
          }
          break;
        case "average":
          for (let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++) {
            let result = self.selectedData[self.firstSelectedRow][j];
            let count = 1;
            for (
              let i = self.firstSelectedRow + 1;
              i <= self.lastSelectedRow;
              i++
            ) {
              let value = self.selectedData[i][j] || 0;
              result = Calculation(result).add(value);
              count++;
            }
            let average = Calculation(parseFloat(result)).div(count);
            if (result.toString().indexOf("%") > 0) {
              average = `${average}%`;
            }
            self.$set(
              self.hotSettings.data[self.lastSelectedRow + 1],
              j,
              average
            );
          }
          break;
      }
    },
    getExcelData() {
      let dataStr = JSON.stringify(this.hotSettings.data);
      return {
        tableData: JSON.stringify(this.hotSettings.data),
        cellInfo: JSON.stringify(
          this.hot1.getPlugin("MergeCells").mergedCellsCollection.mergedCells
        ),
        quotaId: this.$route.query.quotaId,
        tableId: this.tableId,
      };
    },
    saveTable() {
      let params = {...this.getExcelData(),...{imgData: JSON.stringify(this.chartOptionsSourse)}};
      this.saving = true;
      this.isEdit = false;
      this.save(params).then(res => { 
        if (res.responseCode == "0") {
          this.tableId = res.result.tableId;
          this.saving = false;
          this.isEdit = false;
          this.$message.success("保存成功！");
          this.$emit("whetherSave", this.isEdit, this.id);
        }
      });
    },
    deleteTable() {
      let params = { tableId: this.tableId };
      this.delete(params).then(res=>{
        if (res.responseCode == "0") {
          this.$message.success("删除成功");
          this.$emit("whetherSave", "del", this.id);
          this.visible = false
        }
      })
    },
    undo(){
      // console.log(this.hot1.isUndoAvailable())
      this.hot1.undo()
    },
    redo(){
      // console.log(this.hot1.isRedoAvailable())
      this.hot1.redo()
    },
    chartsFinishedHandle(){
      this[Symbol.for('finishedCharts')] = this[Symbol.for('finishedCharts')] || 0;
      this[Symbol.for('finishedCharts')] ++
      if(this[Symbol.for('finishedCharts')] === this.chartOptionsSourse.length){
        this.allChartsFinished&&this.allChartsFinished();
        this[Symbol.for('finishedCharts')] = 0
      }
    }
  },
  mounted() {    
    var self = this;
    var webExcel = document.getElementById(`${this.idName}`);
    self.hot1 = new Handsontable(webExcel, self.hotSettings);
    self.hot1.updateSettings({
      colWidths:  120*10/self.hot1.countCols(),
      contextMenu: {
        items: {
          row_above: {
            name: "向上插入一行"
          },
          row_below: {
            name: "向下插入一行"
          },
          col_left: {
            name: "向左插入一列"
          },
          col_right: {
            name: "向右插入一列"
          },
          remove_row: {
            name: "删除行"
          },
          remove_col: {
            name: "删除列"
          },
          mergeCells: {
            name() {
              let sel = this.getSelectedLast();
              if (sel) {
                let info = this.getPlugin(
                  "MergeCells"
                ).mergedCellsCollection.get(sel[0], sel[1]);
                if (
                  info.row === sel[0] &&
                  info.col === sel[1] &&
                  info.row + info.rowspan - 1 === sel[2] &&
                  info.col + info.colspan - 1 === sel[3]
                ) {
                  this[Symbol.for("useMerge")] = false;
                  return "取消合并单元格";
                }
              }
              this[Symbol.for("useMerge")] = true;
              return "合并单元格";
            },
            callback(key, options) {
              let rangeArr = [
                options[0].start.row,
                options[0].start.col,
                options[0].end.row,
                options[0].end.col
              ];
              if (!this[Symbol.for("useMerge")]) {
                this.getPlugin("MergeCells").unmerge(...rangeArr);
                return;
              }

              const mergedCellsCollection = this.getPlugin(
                "MergeCells"
              ).mergedCellsCollection
              const isOverlapping = mergedCellsCollection.isOverlapping({
                row:options[0].start.row,
                col:options[0].start.col,
                rowspan: options[0].end.row -  options[0].start.row + 1,
                colspan: options[0].end.col -  options[0].start.col + 1,
              })
              const range= {
                from: options[0].start,
                to: options[0].end
              }

              if(isOverlapping){
                const ranges = mergedCellsCollection.getWithinRange(range)
                ranges.forEach(ele=>{
                  mergedCellsCollection.remove(ele.row, ele.col)
                })
              }

              let rangeData = this.getData(...rangeArr);
              let midArr = [];
              rangeData.forEach(ele => {
                midArr = [...midArr, ...ele];
              });
              midArr = midArr.filter(ele => ele);
              if (midArr.length > 1) {
                self
                  .$confirm(
                    self.$createElement('p',  {class:"confirm-message" }, [
                      self.$createElement('svg', null, [
                        self.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
                      ]),
                      self.$createElement('span', null, "合并后的单元格将只保留左/上单元格中的值，确定合并吗？")
                    ]),
                    "",
                    {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消"
                    }
                  )
                  .then(() => {
                    this[Symbol.for("mergeData")] = midArr[0];
                    this.getPlugin("MergeCells").merge(...rangeArr);
                  })
                  .catch(() => {
                    return false;
                  });
              } else {
                this[Symbol.for("mergeData")] = midArr[0];
                this.getPlugin("MergeCells").merge(...rangeArr);
              }
            }
          },
          cellsType: {
            key: "types",
            name: "设置单元格格式",
            submenu: {
              items: [
                {
                  key: "types:normal",
                  name: "常规",
                  callback: function(key, options) {
                    self.changeCellType(0);
                    self.hot1.render();
                  }
                },
                {
                  key: "types:numbers",
                  name: "数字",
                  callback: function(key, options) {
                    self.changeCellType(1);
                    self.hot1.render();
                  }
                },
                {
                  key: "types:numbersWithDecimal",
                  name: "数字(保留两位小数)",
                  callback: function(key, options) {
                    self.changeCellType(2);
                    self.hot1.render();
                  }
                },
                {
                  key: "types:percentage",
                  name: "百分比",
                  callback: function(key, options) {
                    self.changeCellType(3);
                    self.hot1.render();
                  }
                },
                {
                  key: "types:percentageWithDecimal",
                  name: "百分比(保留两位小数)",
                  callback: function(key, options) {
                    self.changeCellType(4);
                    self.hot1.render();
                  }
                }
              ]
            }
          },
          copy: {
            name: "复制"
          },
          cut: {
            name: "剪切"
          },
          paste: {
            name: "粘贴",
            disabled: function() {
              return self.clipboardCache.length === 0;
            },
            callback: function() {
              var plugin = self.hot1.getPlugin("copyPaste");
              self.hot1.listen();
              plugin.paste(self.clipboardCache);
            }
          }
        }
      }
    });
    if(this.editorAble){
      let Canvas = this.createCanvas(webExcel);
      this.canvas = Canvas;
    }else if(this.chartOptionsSourse.length === 0){
      this.allChartsFinished();
      this[Symbol.for('finishedCharts')] = 0
    }
    this[Symbol.for('keydownSave')] = function(e){
      if(e.ctrlKey&&e.keyCode===83){
        e.preventDefault();
        self.saveTable()
      }
    }
    window.addEventListener('keydown', this[Symbol.for('keydownSave')])
  },
  updated(){
    if(this.chartOptionsSourse.length === 0){
      this.allChartsFinished&&this.allChartsFinished();
      this[Symbol.for('finishedCharts')] = 0
    }
    this.hot1.updateSettings({
      colWidths:  120*10/this.hot1.countCols()
    })
  },
  destroyed(){
    window.removeEventListener('keydown',this[Symbol.for('keydownSave')])
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.excel-display{
  margin:0 auto;
  text-align: center;
  position: relative;
  height: auto;
  .flex-wrap{
    width: 100%;
  }

  .hot{
    display: inline-block;
    margin: 0 auto;
    pointer-events: none;
  }
  .chart-wrap{
    pointer-events: none;    
  }
}
.hot .ht_master>.wtHolder {
  height: auto !important;
  display: inline-block;
}
.excel-wrap {
  width: 95%;
  margin: 0 auto;
  margin-top: 30px;
  padding: 60px 40px 40px;
  background: #ffffff;
  box-sizing: border-box;
  border: 1px solid #e5e9f1;
  box-shadow: 0 0 3px 0 #ced7e8;
  position: relative;
  text-align: center;

  & .hot {
    display: inline-block;
    max-width: 100%;
    margin: 0 auto;
    // overflow: scroll;
  }
  table * {
    border-color: #e8e8e8 !important;
  }
  th,
  td {
    vertical-align: middle !important;
  }
}
.flex-wrap {
  display: flex;
  max-width: 100%;
  overflow: hidden;
  flex-wrap: wrap;
  width: min-content;
  margin: 0 auto;
}
#hot-display-license-info {
  display: none;
}
.btn-handle-2 {
  text-align: right;
  margin: 0 auto;
  width: 100%;
  .excel-undo,.excel-redo{
    float: left;
    margin-top:10px;
    font-size: 14px;
    color: #666;
    cursor:pointer;
    svg{
      vertical-align:middle;
      width:14px;
      height:14px;
      display:inline-block;
      margin-right:5px;
    }
  }
  .excel-redo{
    margin-left: 20px;
    svg{
      transform: scaleX(-1);
      // margin-left:5px;
    }
  }
  .line {
    display: inline-block;
    height: 16px;
    width: 2px;
    background-color: #06aea6;
    border-radius: 2px;
    margin: 0 6px;
    vertical-align: sub;
  }
  .tools {
    display: flex;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    width: 100%;
    height: 40px;
    margin-top: 10px;
    align-items: center;
    border-bottom: none;
    box-sizing: border-box;
    text-align: center;
    span {
      width: 52px;
      font-size: 14px;
      color: #666666;
    }
    input {
      flex: 1;
      border:none;
      outline:none;
      cursor:auto;
    }
  }
}
td {
  position: relative;

  i {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: block;
    font-style: normal;
    background: #fff;
  }
}
// .table-name .el-input__inner {
//   border: none!important;
//   text-align: center;
//   // width: 60%;
//   font-size: 18px;
// }

.block-important {
  display: block !important;
}
.params-choosed {
  position: relative;
  &::after {
    display: block;
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border: 1px dashed #000;
  }
}
.hot {
  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 105;
    // background: rgba(122, 20, 233, 0.1);
    top: 0;
    left: 0;
    pointer-events: none;
  }
}
.layer-input {
  display: none;
  position: absolute;
  z-index: 104;
  border: none;
  outline-width: 0;
  margin: 0;
  padding: 1px 5px 0 5px;
  font-family: inherit;
  line-height: 21px;
  font-size: inherit;
  box-shadow: 1px 2px 5px rgba(0, 0, 0, 0.6);
  border: 2px solid rgb(82, 146, 247);
  resize: none;
  -webkit-text-fill-color: transparent; 
  border-radius: 0;
  background-color: #fff;
  font-size: 14px;
  box-sizing: border-box !important;
  overflow: hidden;
  -webkit-padding-start: 1px;
  -webkit-padding-end: 1px;
  &::selection {
    color: #3390ff; /* WebKit/Blink Browsers */
    background: #3390ff;
  }
}
.layer-input-display {
  display: none;
  text-align: start;
  word-break: break-all;
  position: absolute;
  z-index: 105;
  border: none;
  outline-width: 0;
  margin: 0;
  padding: 1px 5px 0 5px;
  font-family: inherit;
  line-height: 21px;
  font-size: inherit;
  resize: none;
  color: #000;
  border-radius: 0;
  background-color: transparent;
  font-size: 14px;
  box-sizing: border-box !important;
  overflow: hidden;
  pointer-events: none;
  text-align-last: left;
  border: 2px solid rgb(82, 146, 247);
  -webkit-padding-start: 1px;
  -webkit-padding-end: 1px;
  span{
    border-radius: 6px;
    &:nth-child(7n+1){
      background: rgba(113,161,230,0.2);
    }
    &:nth-child(7n+2){
      background: rgba(0,128,0,0.2);
    }
    &:nth-child(7n+3){
      background: rgba(153,0,204,0.2);
    }
    &:nth-child(7n+4){
      background: rgba(128,0,0,0.2);
    }
    &:nth-child(7n+5){
      background: rgba(0,204,51,0.2);
    }
    &:nth-child(7n+6){
      background: rgba(204,102,0,0.2);
    }
    &:nth-child(7n){
      background: rgba(204,0,153,0.2);
    }
  }
}
.charts{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  &.display-block{
    display: block;
    .chart-wrap{
      margin: 18px auto 0 !important;
    }
  }
}
.chart-wrap{
  margin-top: 18px;
  height: 300px;
  background: #FFFFFF;
  border: 1px solid #E5E9F1;
  box-shadow: 0 0 3px 0 #CED7E8;
  width: calc(50% - 10px);
  margin-right: 0;
  box-sizing: border-box;
  position: relative;
  &:nth-child(odd){
    margin-right: 20px;
  }
  .chart-layer{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 2;
    display: none;
  }
  .chart-title-editor{
    position: absolute;
    opacity: 0;
    top: 10px;
    width: 60%;
    left: 0;
    right: 0;
    display: block;
    margin: auto;
    z-index: 3;
    transform: translate(0,-80%);
    display: flex;
    align-items: center;
    input{
      -webkit-appearance: none;
      background-color: rgb(255, 255, 255);
      background-image: none;
      box-sizing: border-box;
      color: rgb(31, 45, 61);
      display: inline-block;
      font-size: inherit;
      height: 36px;
      line-height: 1;
      width: 100%;
      border-radius: 4px;
      border: 1px solid rgb(191, 203, 217);
      border-image: initial;
      outline: none;
      padding: 3px 10px;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      &:focus{
        outline: none;
        border-color: rgb(32, 160, 255);
      }
    }
    .el-icon-close, .el-icon-check{
      width: 36px;
      height: 36px;
      display: inline-block;
      margin: 0 5px;
      line-height: 36px;
      cursor: pointer;
      color: #06aea6;
    }
    .el-icon-close{
      color: #aaa;
    }
 
  }
  &.title-editing{
    .chart-layer{
      display: block;
    }
    .chart-title-editor{
      opacity: 1;
      transform: translate(0,0);
      transition: 0.6s;
      
    }
  }
}
.confirm-message{
  text-align: left;
  display: flex;
  svg{
    width: 24px;
    height: 24px;
    margin: 0 12px;
    vertical-align: middle;
    flex-shrink: 0;
  }
  span{
    font-size: 14px;
    color: #333333;
    vertical-align: middle;      
  }
}
.el-message-box{
  .el-message-box__close{
    font-size: 14px;
  }
  .el-message-box__content{
    padding: 10px 20px 24px;
  }
  .el-message-box__btns{
    text-align: center;
  }
  .el-button{
    width: 88px;
    height: 40px;
    line-height: 40px;
    box-sizing: border-box;
    // background: #06AEA6;
    border-radius: 2px;
    padding: 0;
  }
}
</style>