<template>
    <section class="excel-wrap" ref="excelWrap" v-if="!isDelete">
      <div class="flex-wrap">

   
        <!-- <el-input class="table-name" v-model='tableName'></el-input> -->
        <div class="btn-handle-2">
          <!-- <el-button 
            v-if="isEdit"
            type="text" 
            @click="editTable">编辑表</el-button> -->

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
        <div class="chart-wrap">
          <IEcharts
            style="width:100%;height:100%;text-align:left"
            :option="chartOption" 
            />
        </div>
        <div class="chart-wrap">
          <IEcharts
            style="width:100%;height:100%;text-align:left"
            :option="chartOptionFull" 
            />
        </div>
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
import IEcharts from "vue-echarts-v3/src/lite.js";

export default {
  components: { FakeSelect, IEcharts },
  props: {
    id: {
      type: [String, Number],
      default: ""
    },
    propTable: {
      type: Object
    }
  },
  data() {
    var self = this;
    return {
      chartOption: {},
      chartOptionFull: {},
      excelFunctionsOptions: Object.keys(excelFunctions).map(ele => ({
        value: ele,
        label: excelFunctions[ele].name
      })),
      excelChartsOptions: Object.keys(excelCharts).map(ele => ({
        value: ele,
        label: excelCharts[ele].name
      })),
      drawStep: [],
      funcStore: {},
      funcCache: "",
      visible: false,
      isDelete: false,
      hot1: "",
      isEdit: false,
      saving: false,
      tableName: self.propTable.tableName,
      tableId: self.propTable.tableId,
      new: self.propTable.new,
      clipboardCache: [],
      sheetclip: new SheetClip(),
      firstSelectedRow: "",
      firstSelectedCol: "",
      lastSelectedRow: "",
      lastSelectedCol: "",
      hotSettings: {
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
        colWidths: 120,
        rowHeaderWidth: 52,
        rowHeights: 40,
        columnHeaderHeight: 40,
        outsideClickDeselects: eventTarget => {
          if (
            self.$refs.funcSelect.$refs.mySelect.contains(eventTarget) ||
            self.$refs.excel.contains(eventTarget)
          ) {
            return false;
          }
          return true;
        },
        className: "htCenter htMiddle",
        afterSelectionEnd(r,c,r2,c2){
          self.hot1[Symbol.for('lastSelected')] = [r,c,r2,c2]
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
            if (value === undefined && !STORE[key]) {
              return;
            }
            if (value === false) {
              STORE[key] = null;
              return;
            }
            if (STORE[key] && STORE[key].autoFill) {
              STORE[key] = STORE[key].autoFill;
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
                newVal = eval(expression);
              } catch (error) {
                newVal = "#VAlUE!";
                if (error === "choose self") {
                  self.$alert(
                    "公式中的单元格引用了公式的结果，从而创建了循环引用,请重新选择。",
                    "范围选择错误",
                    {
                      confirmButtonText: "确定"
                    }
                  );

                  controlStore([`${row}-${col}`], false);
                  newVal = null;
                } else if (sourse !== "funcRender") {
                  self.$alert("请检查表达式是否正常", "函数表达式异常", {
                    confirmButtonText: "确定"
                  });
                }

                // controlStore([`${changes[0][0]}-${changes[0][1]}`], false);
              }
              // 修改输入值
              return newVal === "Infinity" ? "#DIV/0!" : newVal;
            }
            return value;
          };

          changes.forEach((columDataArr, rowIndex) => {
            let changeVal = changes[rowIndex][3];
            const row = changes[rowIndex][0];
            const col = changes[rowIndex][1];
            let val = computeValue(row, col, changeVal);
            changes[rowIndex][3] = val;
          });
        },

        afterBeginEditing: function(row, col) {
          let data = self.hot1.getDataAtCell(row, col);
          let edit = self.hot1.getActiveEditor();
          let editArea = edit.TEXTAREA;
          self.editArea = editArea;
          if (self.funcStore[`${row}-${col}`]) {
            editArea.value = self.funcStore[`${row}-${col}`];
          }
          let Input = self.inputNode;
          Input.row = row;
          Input.col = col;
          const inputHandle = () => {
            if (/^\=/.test(editArea.value)) {
              self.drawInput(editArea, editArea.value);
            }
          };
          inputHandle();
          editArea.removeEventListener("input", inputHandle);
          editArea.addEventListener("input", inputHandle);
        },
        afterChange: function(changes, sourse) {
          if (sourse !== "funcRender") {
            self.funcRender();
          }
          if (changes) {
            self.isEdit = true;
            self.$emit("whetherSave", self.isEdit, self.id);
          }
        },
        afterCopy: function(changes, coords) {
          // 缓存已合并的单元格
          const mergedArr = self.hot1.getPlugin("MergeCells")
            .mergedCellsCollection.mergedCells;
          self.pasteMergeCache = [];
          mergedArr.filter(ele => {
            if (
              ele.row >= coords[0].startRow &&
              ele.col >= coords[0].startCol &&
              coords[0].startRow + ele.rowspan - 1 <= coords[0].endRow &&
              coords[0].startCol + ele.colspan - 1 <= coords[0].endCol
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
        // 2018.4.2 new setting add
        afterSelection(r, c, r2, c2) {
          self.selectedRange = [r, c, r2, c2];
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
        }
      }
    };
  },

  watch: {
    "hotSettings.data": function(newVal, oldVal) {
      this.isEdit = true;
      this.$emit("whetherSave", this.isEdit, this.id);
    }
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
    }
  },

  methods: {
    chartSelect(v) {
      const selectRange = this.hot1[Symbol.for('lastSelected')]
      let data = this.hot1.getData(...selectRange)
      this.chartOption = excelCharts[v].func(
        data
      );
    },
    chartSelectFull(v) {
      this.chartOptionFull = excelCharts[v].func(
        JSON.parse(this.getExcelData().tableData)
      );
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
      this.drawInput(
        this.hot1.getCell(selectItem[0], selectItem[1]),
        `=${v.toUpperCase()}(`,
        true
      );
    },
    funcRender() {
      // const _this = this
      for (const key in this.funcStore) {
        if (this.funcStore.hasOwnProperty(key)) {
          const element = this.funcStore[key];
          const coordsArr = key.match(/\d+/g);
          this.hot1.setDataAtCell(
            +coordsArr[0],
            +coordsArr[1],
            element,
            "funcRender"
          );
        }
      }
    },
    createCanvas(node) {
      let Canvas = document.createElement("canvas");
      node.appendChild(Canvas);
      this.canvasNode = Canvas;
      this.createInput(node);
      return Canvas;
    },
    quitEditor(shouldSaveData, shouldGetFocus) {
      const Input = this.inputNode;

      if (shouldSaveData) {
        this.hot1.setDataAtCell(Input.row, Input.col, Input.value);
      }
      this.quitFunctionEditor();
      // this.hot1.destroyEditor();
      if (Input.quitCallbacks) {
        Input.quitCallbacks.forEach(ele => ele());
      }
      if (shouldGetFocus) {
        setTimeout(() => {
          this.hot1.selectCell(Input.row, Input.col, Input.row, Input.col);
        });
      }
    },
    createInput(node) {
      let _this = this;
      let Input = document.createElement("textarea");
      Input.classList.add("layer-input");
      this.inputNode = Input;
      node.insertBefore(Input, this.canvasNode);
      Input.quitCallbacks = [];
      Input.addEventListener("keydown", function(e) {
        // enter
        if (e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          _this.quitEditor(true, Input.isSelecting);
        }
        // esc
        if (e.keyCode === 27) {
          e.preventDefault();
          _this.quitEditor(false, true);
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
    },

    drawInput(targetNode, value, startEdit) {
      let Input = this.inputNode;
      const row = Input.row;
      const col = Input.col;
      Input.style.top = this.hotSettings.columnHeaderHeight +  row* this.hotSettings.rowHeights + "px";
      Input.style.left = this.hotSettings.rowHeaderWidth + col * this.hotSettings.colWidths + "px";
      Input.style.width = targetNode.clientWidth + 2 + "px";
      Input.style.height = targetNode.clientHeight + 1 + "px";
      Input.changeVal(value);
      // this.drawFromInput();
      Input.style.display = "block";
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

        //  光标位置检测
        if (!Input.selectionStart === Input.selectionEnd) {
          selectStr = Input.value.slice(
            Input.selectionStart,
            Input.selectionEnd
          );
          if (/([a-z]\d+\:[a-z]\d+|[a-z]\d+)/.test(selectStr)) {
            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr + str + selectEndStr);
            };
          }
        } else {
          if (/([a-z]\d+\:[a-z]\d+|[a-z]\d+)$/.test(selectBeforeStr)) {
            let localSelectedRange = selectBeforeStr.match(
              /([a-z]\d+\:[a-z]\d+|[a-z]\d+)$/
            )[0];
            let reg = new RegExp(localSelectedRange + "$");
            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr.replace(reg, str) + selectEndStr);
            };
          }

          if (
            /[\*\/\-\+\(\:)]{1}$/.test(selectBeforeStr) ||
            /^\=$/.test(selectBeforeStr)
          ) {
            selectCall.callback = str => {
              Input.changeVal(selectBeforeStr + str + selectEndStr);
            };
          }
        }

        let selectedRangeStr = selectRange(r, c, r2, c2);
        selectCall.callback && selectCall.callback(selectedRangeStr);
        Input.focus();
      };

      // 检测是否进入选择模式
      const checkToStartSelect = () => {
        Input.isSelecting = false;
        this.hot1.removeHook("afterSelectionEnd", selectCall);
        Input.style.height = Input.scrollHeight + 4 + "px";
        if (!/^=/.test(Input.value)) {
          return false;
        }
        Input.isSelecting = true;
        this.hot1.addHook("afterSelectionEnd", selectCall);
        // 编辑器的'退出回掉'中注入'清除选择单元格'的监听函数
        Input.quitCallbacks.push(() => {
          Input.isSelecting = false;
          this.hot1.removeHook("afterSelectionEnd", selectCall);
        });
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

      Input.quitCallbacks.push(() =>
        window.removeEventListener("click", clickHandle)
      );

      setTimeout(() => window.addEventListener("click", clickHandle));
      return Input;
    },

    selectTd(r, c, r2, c2) {
      const _this =this 
      this.drawStep.push({
        render(ctx, color) {
          ctx.strokeStyle = color;
          ctx.strokeRect(
            _this.hotSettings.rowHeaderWidth + c *  _this.hotSettings.colWidths,
            _this.hotSettings.columnHeaderHeight + r * _this.hotSettings.rowHeights,
            (c2 - c + 1) * _this.hotSettings.colWidths ,
            (r2 - r + 1) * _this.hotSettings.rowHeights
          );
        }
      });
    },
    drawFromInput() {
      if (!/^=/.test(this.inputNode.value)) {
        return false;
      }
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
              this.selectTd(r, c, r2, c2);
            } else {
              const c =
                ele
                  .match(/[a-z]/gi)[0]
                  .toUpperCase()
                  .charCodeAt(0) - 65;
              const r = ele.match(/\d+/g)[0] - 1;
              this.selectTd(r, c, r, c);
            }
          });
        this.drawCanvas();
      } catch (error) {
        console.log(error);
      }
    },
    quitFunctionEditor() {
      this.drawStep = [];
      let Canvas = this.canvasNode;
      let ctx = Canvas.getContext("2d");
      let Input = this.inputNode;
      ctx.clearRect(0, 0, Canvas.width, Canvas.height);
      Input.style.display = "none";
      Input.value = "";
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
        tableName: this.tableName
      };
    },
    saveTable() {
      let params = this.getExcelData();
      this.saving = true;
      this.isEdit = false;
      if (!this.new) {
        this.$service.updateTable(params).then(res => {
          if (res.responseCode == "0") {
            this.saving = false;
            this.isEdit = false;
            this.$message.success("保存成功！");
            this.$emit("whetherSave", this.isEdit, this.id);
          }
        });
      } else {
        this.$service.saveTable(params).then(res => {
          if (res.responseCode == "0") {
            this.new = false;
            this.tableId = res.result.tableId;
            this.saving = false;
            this.isEdit = false;
            this.$message.success("保存成功！");
            this.$emit("whetherSave", this.isEdit, this.id);
          }
        });
      }
    },
    deleteTable() {
      let params = { tableId: this.tableId };
      if (this.tableId) {
        this.$service.deleteTable(params).then(res => {
          if (res.responseCode == "0") {
            this.$message.success("删除成功");
            this.isDelete = true;
            this.$emit("whetherSave", "del", this.id);
          }
        });
      } else {
        this.$message.success("删除成功");
        this.isDelete = true;
        this.$emit("whetherSave", "del", this.id);
      }
    }
  },
  mounted() {
    var self = this;
    var webExcel = document.getElementById(`${this.idName}`);
    let Canvas = this.createCanvas(webExcel);
    this.canvas = Canvas;
    self.hot1 = new Handsontable(webExcel, self.hotSettings);
    self.hot1.updateSettings({
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

              let rangeData = this.getData(...rangeArr);
              let midArr = [];
              rangeData.forEach(ele => {
                midArr = [...midArr, ...ele];
              });
              midArr = midArr.filter(ele => ele);
              if (midArr.length > 1) {
                self
                  .$confirm(
                    "合并后的单元格将只保留左/上单元格中的值，确定合并吗？",
                    "合并单元格",
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
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
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
    vertical-align: middle;
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
    z-index: 2;
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
  color: #000;
  border-radius: 0;
  background-color: #fff;
  font-size: 14px;
  box-sizing: border-box !important;
  overflow: hidden;
}
.chart-wrap{
  margin-top: 18px;
  height: 275px;
  background: #FFFFFF;
  border: 1px solid #E5E9F1;
  box-shadow: 0 0 3px 0 #CED7E8;
  width: calc(50% - 10px);
  margin-right: 20px;
  box-sizing: border-box;
  &:last-child{
    margin-right: 0;
  }
}
</style>