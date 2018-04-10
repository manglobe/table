export const excelFunctions = {
    sum: {
        name: '求和',
        func(valueStr) {
            let valueArr = valueStr.split(',')
            valueStr = valueStr.replace(/([a-z]+\d+):([a-z]+\d+)/g, (match, $1, $2) => {
                let rowStart = $1.match(/[a-z]/g)[0].charCodeAt(0);
                let colStart = $1.match(/\d+/g)[0];
                let rowReduce = $2.match(/\d+/g)[0] - $1.match(/\d+/g)[0] + 1
                let colReduce = $2.match(/[a-z]/g)[0].charCodeAt(0) - $1.match(/[a-z]/g)[0].charCodeAt(0) + 1
                let rowArr = Array.from({
                    length: rowReduce
                }, (val, index) => +colStart + index);
                let colArr = Array.from({
                    length: colReduce
                }, (val, index) => String.fromCharCode(+rowStart + index));
                console.log(`rowArr`)
                console.log(rowArr)
                console.log(colArr)
                console.log(`colArr`)
                let newStr = '';
                rowArr.forEach(rowEle => {
                    colArr.forEach(colEle => {
                        newStr += colEle + rowEle + '+'
                    })
                })
                return newStr.slice(0, -1)
            })
            console.log('求和')
            return valueStr
        }
    },
    reduce: {
        name: '求差',
        func() {
            console.log(arguments)
        }
    },
    quotient: {
        name: '求商',
        func() {
            console.log(arguments)
        }
    },
    average: {
        name: '求平均数',
        func() {
            console.log(arguments)
        }
    },
}

export const excelCharts = {
    sum: {
        name: '折线图',
        func() {
            console.log('折线图')
            console.log(arguments)
        }
    },
    reduce: {
        name: '柱状图（簇形）',
        func() {
            console.log(arguments)
        }
    },
    quotient: {
        name: '饼图',
        func() {
            console.log(arguments)
        }
    },
    average: {
        name: '柏拉图',
        func() {
            console.log(arguments)
        }
    },
    diy: {
        name: '自定义',
        func() {
            console.log(arguments)
        }
    },
}