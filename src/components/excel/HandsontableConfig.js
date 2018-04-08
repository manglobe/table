const baseOption = {
    mergeCells: true,
    colHeaders: true,
    rowHeaders: true,
    minCols: 1,
    minRows: 1,
    maxCols: 15,
    colWidths: 100,
    height: 228,
    className: "htCenter htMiddle",
}
const hooks = {
    beforeChange: function (changes, sourse) {
        // TODO: this select not for single target
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
                return this.getData(+str2RowCol(cellArr[1])[0],
                    str2RowCol(cellArr[1])[1], +str2RowCol(cellArr[2])[0],
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
                midVal = eval(
                    changeVal
                    .replace(/\=/, "")
                    .replace(/([a-z]+)(\d+)/g, (match, $1, $2) => {
                        return (
                            this.getDataAtCell($2 - 1, $1.charCodeAt(0) - 97) ||
                            0
                        );
                    })
                );
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
    afterBeginEditing: function (row, col) {
        let data = this.getDataAtCell(row, col);
        let edit = this.getActiveEditor();
        if (self.funcStore[`${row}-${col}`]) {
            edit.TEXTAREA.value = self.funcStore[`${row}-${col}`];
        }
        edit.TEXTAREA.parents
        edit.TEXTAREA.addEventListener("input", function (e) {
            if (/^=/.test(this.value)) {
                if (!hasCanvas()) {
                    createCanvas();
                }

                if (/[\=\(\+\-\*\/]\s*$/.test(this.value)) {
                    const cacheValue = edit.TEXTAREA.value;
                    // 开始单元格选择
                    const selectCall = function (r, c, r2, c2) {
                        edit.TEXTAREA_PARENT.classList.add("block-important");
                        console.log(r, c);
                        let selectRange;
                        if (r === r2 && c === c2) {
                            // 1格
                            selectRange = `${String.fromCharCode(c + 97)}${r + 1}`;
                        } else {
                            // 多格
                            selectRange = `${String.fromCharCode(c + 97)}${r +
                  1}:${String.fromCharCode(c2 + 97)}${r2 + 1}`;
                        }
                        edit.TEXTAREA.value = cacheValue + selectRange;
                        // edit.TEXTAREA.focus()
                        self.funcStore[`${row}-${col}`] = cacheValue + selectRange;
                        this.removeHook("afterSelectionEnd", selectCall);
                        this.selectCell(row, col);
                        this.addHook("afterSelectionEnd", selectCall);
                        // this.addHook("beforeKeyDown", function(e) {
                        //   this.removeHook("afterSelectionEnd", selectCall);
                        //   edit.TEXTAREA_PARENT.classList.remove("block-important");
                        // });
                        // window.onkeydown = function() {
                        //   console.log("key");
                        //   this.removeHook("afterSelectionEnd", selectCall);
                        // };
                    };

                    this.addHook("afterSelectionEnd", selectCall);
                }
            }
        });
    },
    afterChange: function (changes) {
        if (changes) {
            self.isEdit = true;
        }
    },
    afterCopy: function (changes) {
        self.clipboardCache = self.sheetclip.stringify(changes);
    },
    afterCut: function (changes) {
        self.clipboardCache = self.sheetclip.stringify(changes);
    },
    afterPaste: function (changes, coords) {
        this
            .getPlugin("MergeCells")
            .merge(
                coords[0].startRow,
                coords[0].startCol,
                coords[0].endRow,
                coords[0].endCol
            );
        self.clipboardCache = self.sheetclip.stringify(changes);
    },
    afterContextMenuShow(context) {
        self.firstSelectedRow = this.getSelectedRange()[0].from.row;
        self.firstSelectedCol = this.getSelectedRange()[0].from.col;
        self.lastSelectedRow = this.getSelectedRange()[0].to.row;
        self.lastSelectedCol = this.getSelectedRange()[0].to.col;
        for (let i = self.firstSelectedRow; i <= self.lastSelectedRow; i++) {
            for (
                let j = self.firstSelectedCol; j <= self.lastSelectedCol; j++
            ) {
                self.selectedData[i][j] = this.getDataAtCell(i, j);
            }
        }
    },
    // 2018.4.2 new setting add
    beforeMergeCells(cellRange) {
        let rangeDataArr = this.getData(
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
        // this.setDataAtCell(cellRange.from.row,cellRange.from.col, data)
    },
    afterMergeCells(cellRange) {
        this.setDataAtCell(
            cellRange.from.row,
            cellRange.from.col,
            this[Symbol.for("mergeData")]
        );
    }
}
const config = {
    ...baseOption,
    ...hooks,
    // data: typeof self.propTable.tableData === "string" ?
    //     JSON.parse(self.propTable.tableData) : self.propTable.tableData,

}
export default config;