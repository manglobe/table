<template>
    <div :v-bind:id="excelId" class="hot htCenter handsontable htRowHeaders htColumnHeaders"></div>
</template>
<script>
import Handsontable from "handsontable-pro";
import SheetClip from "sheetclip";
import config from './HandsontableConfig';
const sheetclip = new SheetClip();   // 二维复制
export default {
  prop: {
    excelId: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
        config: {
            ...config
        }
    };
  },
  mounted() {
    var self = this;
    var webExcel = document.getElementById(this.excelId);
    self.hot = new Handsontable(webExcel, this.config);
    self.hot.updateSettings({
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
                    self.hot.render();
                  }
                },
                {
                  key: "types:numbers",
                  name: "数字",
                  callback: function(key, options) {
                    self.changeCellType(1);
                    self.hot.render();
                  }
                },
                {
                  key: "types:numbersWithDecimal",
                  name: "数字(保留两位小数)",
                  callback: function(key, options) {
                    self.changeCellType(2);
                    self.hot.render();
                  }
                },
                {
                  key: "types:percentage",
                  name: "百分比",
                  callback: function(key, options) {
                    self.changeCellType(3);
                    self.hot.render();
                  }
                },
                {
                  key: "types:percentageWithDecimal",
                  name: "百分比(保留两位小数)",
                  callback: function(key, options) {
                    self.changeCellType(4);
                    self.hot.render();
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
              var plugin = self.hot.getPlugin("copyPaste");
              self.hot.listen();
              plugin.paste(self.clipboardCache);
            }
          }
        }
      }
    });
  }
};
</script>
