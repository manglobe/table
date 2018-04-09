<template>
    <div style="width: 1050px; margin: 0 auto; overflow: auto;position: relative;" v-if="!isDelete">
        <!-- <el-input class="table-name" v-model='tableName'></el-input> -->
        <div class="btn-handle-2">
          <!-- <el-button 
            v-if="isEdit"
            type="text" 
            @click="editTable">编辑表</el-button> -->
          <Funcs v-bind:changeHandle="funcSelect" />
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
        </div>
        <div :id="idName" class="hot htCenter handsontable htRowHeaders htColumnHeaders"></div>
    </div>
</template>

<script>
import Handsontable from "handsontable-pro";
import SheetClip from "sheetclip";
import Calculation from "@/util/Calculation.js";
import handleObject from "@/util/handleObject";
import "handsontable-pro/dist/handsontable.full.css";
import Funcs from "./excelFunc";
import { excelFunctions } from "./excelFunctions";
export default {
  components: { Funcs },
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
      // function
      funcSelect(v) {
        // let selectItem = self.hot1.getSelect()
        // selectItem
        // console.log(excelFunctions[v].func());
      },
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
        colWidths: 100,
        height: 228,
        // formulas: true,
        className: "htCenter htMiddle",
        beforeChange: function(changes, sourse) {
          const changeVal = changes[0][3];
          // 'A3' => ['1','3']
          const str2RowCol = str => {
            let arr = str.match(/^([a-z]+)(\d+)/i);
            return [arr[2] - 1, arr[1].charCodeAt(0) - 97];
          };
          const getParams = paramsStr => {
            if (/\:/.test(paramsStr)) {
              // TODO: /g
              let cellArr = paramsStr.match(/([a-z]\d+)\:([a-z]\d+)/i);
              return self.hot1.getData(
                +str2RowCol(cellArr[1])[0],
                str2RowCol(cellArr[1])[1],
                +str2RowCol(cellArr[2])[0],
                str2RowCol(cellArr[2])[1]
              );
            }
          };

          if (/^=/.test(changeVal)) {
            let midVal;
            let useFunc = /^=([A-Za-z]+)\(/.test(changeVal);
            if (useFunc) {
              // 使用命名函数
              let func = changeVal.match(/^=([A-Za-z]+)\(/)[1];
              const params = getParams(changeVal.match(/\((.*)\)/)[1]);
              try {
                midVal = excelFunctions[func].func(params);
              } catch (error) {
                console.log(error);
              }
            } else {
              try {
                midVal = eval(
                  changeVal
                    .replace(/\=/, "")
                    .replace(/([a-z]+)(\d+)/g, (match, $1, $2) => {
                      return (
                        self.hot1.getDataAtCell(
                          $2 - 1,
                          $1.charCodeAt(0) - 97
                        ) || 0
                      );
                    })
                );
              } catch (error) {
                console.log(error);
                alert("函数异常");
                midVal = "";
              }
            }
            // 修改输入值
            changes[0][3] = midVal;
            // 存储函数
            self.funcStore[`${changes[0][0]}-${changes[0][1]}`] = changeVal;
          } else {
            // 清空存储
            self.funcStore[`${changes[0][0]}-${changes[0][1]}`] &&
              (self.funcStore[`${changes[0][0]}-${changes[0][1]}`] = null);
          }
        },
        afterBeginEditing: function(row, col) {
          let data = self.hot1.getDataAtCell(row, col);
          let edit = self.hot1.getActiveEditor();
          let editArea = edit.TEXTAREA;
          self.editArea = editArea;
          if (self.funcStore[`${row}-${col}`]) {
            editArea.value = self.funcStore[`${row}-${col}`];
          }
          let layerInput, cacheValue;
          if (/^=/.test(editArea.value)) {
            self.drawFromInput(editArea);
            self.drawInput(row, col, editArea, editArea.value);
          }

          // 单元格选择
          const selectCall = function(r, c, r2, c2) {
            if (!/[\=\(\+\-\*\/]\s*$/.test(cacheValue)) {
              console.log("not function");
              return false;
            }

            if (row >= r && row <= r2 && col >= c && col <= c2) {
              console.log("range maxium");
              return false;
            }
            let selectRange;
            self.drawStep = [];
            if (r === r2 && c === c2) {
              // 1格
              selectRange = `${String.fromCharCode(c + 97)}${r + 1}`;
            } else {
              // 多格
              selectRange = `(${String.fromCharCode(c + 97)}${r +
                1}:${String.fromCharCode(c2 + 97)}${r2 + 1})`;
            }
            layerInput.value = cacheValue + selectRange;
            // edit.TEXTAREA.focus()
            self.drawFromInput();
            self.funcStore[`${row}-${col}`] = cacheValue + selectRange;
            layerInput.focus();
          };

          const licenseInput = function(e) {
            cacheValue = layerInput.value;
          };

          // 监听'='是否在输入框起始点
          const licenseEqual = function(e) {
            editArea.removeEventListener("input", licenseEqual);
            self.hot1.removeHook("afterSelectionEnd", selectCall);

            if (/^=/.test(this.value)) {
              layerInput = self.drawInput(row, col, e.target, this.value);
              layerInput.addEventListener("change", licenseInput);

              self.inputNode.row = row;
              self.inputNode.col = col;
              self.inputNode.quitCallbacks.push(() => {
                self.hot1.removeHook("afterSelectionEnd", selectCall);
              });

              cacheValue = layerInput.value;
              self.hot1.addHook("afterSelectionEnd", selectCall);
            }
          };
          self.licenseEqual = licenseEqual;
          editArea.addEventListener("input", licenseEqual);
        },
        afterChange: function(changes,sourse) {
          self.editArea &&
            self.editArea.removeEventListener("input", self.licenseEqual);
          if (sourse !== 'funcRender') {
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
        beforeMergeCells(cellRange) {
          let rangeDataArr = self.hot1.getData(
            cellRange.from.row,
            cellRange.from.col,
            cellRange.to.row,
            cellRange.to.col
          );
          let data;
          rangeDataArr.some(ele =>
            ele.some(ele => {
              if (ele !== "") {
                data = ele;
                return true;
              }
              return false;
            })
          );
          this[Symbol.for("mergeData")] = data;
          // self.hot1.setDataAtCell(cellRange.from.row,cellRange.from.col, data)
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
    funcRender() {
      // const _this = this
      for (const key in this.funcStore) {
        if (this.funcStore.hasOwnProperty(key)) {
          const element = this.funcStore[key];
          const coordsArr = key.match(/\d+/g);
          this.hot1.setDataAtCell(+coordsArr[0], +coordsArr[1], element, 'funcRender');
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
    createInput(node) {
      let _this = this;
      let Input = document.createElement("textarea");
      Input.classList.add("layer-input");
      this.inputNode = Input;
      node.insertBefore(Input, this.canvasNode);
      Input.quitCallbacks = [];
      const quitEditor = shouldSaveData => {
        if (shouldSaveData) {
          this.hot1.setDataAtCell(Input.row, Input.col, Input.value);
        }
        this.quitFunctionEditor();
        if (Input.quitCallbacks) {
          Input.quitCallbacks.forEach(ele => ele());
        }
      };

      Input.addEventListener("keydown", function(e) {
        // enter
        if (e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          quitEditor(true);
        }
        // esc
        if (e.keyCode === 27) {
          e.preventDefault();
          quitEditor();
        }
      });
      const mousedownHandle = function(e) {
        // blur
        if (Input.style.display !== "block") {
          return false;
        }
        if (!e.path.some(ele => ele.id === _this.idName)) {
          quitEditor(true);
        }
      };
      // Input.quitCallbacks.push(() =>
      //   window.removeEventListener("mousedown", mousedownHandle)
      // );
      window.addEventListener("mousedown", mousedownHandle);
    },
    drawCanvas() {
      let Canvas = this.canvasNode;
      Canvas.width = Canvas.clientWidth;
      Canvas.height = Canvas.clientHeight;
      let ctx = Canvas.getContext("2d");
      ctx.clearRect(0, 0, Canvas.width, Canvas.height);
      this.drawStep.forEach(ele => {
        ele.render(ctx);
      });
    },
    drawInput(r, c, targetNode, value) {
      let Input = this.inputNode;
      Input.style.top = 25 + r * 23 + "px";
      Input.style.left = 49 + c * 100 + "px";
      Input.style.minWidth = targetNode.clientWidth + "px";
      Input.style.minHeight = targetNode.clientHeight + "px";
      Input.value = value;
      Input.style.display = "block";
      Input.focus();
      return Input;
    },
    selectTd(r, c, r2, c2) {
      this.drawStep.push({
        render(ctx) {
          ctx.strokeStyle = "#FFA500";
          ctx.strokeRect(
            49 + c * 100,
            25 + r * 23,
            (c2 - c + 1) * 100 + 1,
            (r2 - r + 1) * 23 + 2
          );
        }
      });
    },
    drawFromInput(node) {
      const targetNode = node || this.inputNode;
      try {
        targetNode.value
          .match(/(\([a-z]+\d+\:[a-z]+\d+\)|[a-z]+\d+)/gi)
          .forEach(ele => {
            if (/\:/.test(ele)) {
              const c = ele.match(/[a-z]/g)[0].charCodeAt(0) - 97;
              const c2 = ele.match(/[a-z]/g)[1].charCodeAt(0) - 97;
              const r = ele.match(/\d+/g)[0] - 1;
              const r2 = ele.match(/\d+/g)[1] - 1;
              this.selectTd(r, c, r2, c2);
            } else {
              const c = ele.match(/[a-z]/g)[0].charCodeAt(0) - 97;
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
    saveTable() {
      let dataStr = JSON.stringify(this.hotSettings.data);
      let params = {
        tableData: JSON.stringify(this.hotSettings.data),
        cellInfo: JSON.stringify(
          this.hot1.getInstance().mergeCells.mergedCellInfoCollection
        ),
        quotaId: this.$route.query.quotaId,
        tableId: this.tableId,
        tableName: this.tableName
      };
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
            name: function name() {
              let sel = this.getSelectedLast();
              if (sel) {
                var info = this.getPlugin(
                  "MergeCells"
                ).mergedCellsCollection.get(sel[0], sel[1]);
                if (
                  info.row === sel[0] &&
                  info.col === sel[1] &&
                  info.row + info.rowspan - 1 === sel[2] &&
                  info.col + info.colspan - 1 === sel[3]
                ) {
                  return "取消合并单元格";
                }
              }
              return "合并单元格";
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
#hot-display-license-info {
  display: none;
}
.btn-handle-2 {
  text-align: right;
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
    background: rgba(122, 20, 233, 0.1);
    top: 0;
    pointer-events: none;
  }
}
.layer-input {
  position: absolute;
  z-index: 104;
  border: none;
  outline-width: 0;
  margin: 0;
  padding: 1px 5px 0 5px;
  font-family: inherit;
  line-height: 21px;
  font-size: inherit;
  box-shadow: 0 0 0 2px #5292f7 inset;
  resize: none;
  display: block;
  color: #000;
  border-radius: 0;
  background-color: #fff;
  font-size: 14px;
  box-sizing: border-box !important;
}
</style>