// A1:B2 => [A1,A2,B1,B2]
const disposeRange = rangeStr => {
    let arr = rangeStr.toUpperCase().match(/([A-Z]+|[0-9]+)/g)
    let rowStart = arr[1]
    let colStart = arr[0].charCodeAt(0)
    let rowEnd = arr[3]
    let colEnd = arr[2].charCodeAt(0)

    let rowArr = Array.from({
        length: rowEnd - rowStart + 1
    }, (val, index) => +rowStart + index);
    let colArr = Array.from({
        length: colEnd - colStart + 1
    }, (val, index) => String.fromCharCode(+colStart + index));

    let rangeArr = []

    rowArr.forEach(rowEle => {
        colArr.forEach(colEle => {
            rangeArr.push(colEle + rowEle)
        })
    })

    return rangeArr
}

export const excelFunctions = {
    SUM: {
        name: '求和',
        func(valueStr) {
            // let valueArr = valueStr.split(',')
            // valueStr = valueStr.replace(/([a-z]+\d+):([a-z]+\d+)/g, (match, $1, $2) => {
            //     let rowStart = $1.match(/[a-z]/g)[0].charCodeAt(0);
            //     let colStart = $1.match(/\d+/g)[0];
            //     let rowReduce = $2.match(/\d+/g)[0] - $1.match(/\d+/g)[0] + 1
            //     let colReduce = $2.match(/[a-z]/g)[0].charCodeAt(0) - $1.match(/[a-z]/g)[0].charCodeAt(0) + 1
            //     let rowArr = Array.from({
            //         length: rowReduce
            //     }, (val, index) => +colStart + index);
            //     let colArr = Array.from({
            //         length: colReduce
            //     }, (val, index) => String.fromCharCode(+rowStart + index));
            //     console.log(`rowArr`)
            //     console.log(rowArr)
            //     console.log(colArr)
            //     console.log(`colArr`)
            //     let newStr = '';
            //     rowArr.forEach(rowEle => {
            //         colArr.forEach(colEle => {
            //             newStr += colEle + rowEle + '+'
            //         })
            //     })
            //     return newStr.slice(0, -1)
            // })
            console.log('求和')
            let newStr = valueStr.replace(/sum/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
                return `(${disposeRange(match).join('+')})`
            }).replace(/,/g, '+');
            return newStr
        }
    },
    REDUCE: {
        name: '求差',
        func() {
            console.log(arguments)
        }
    },
    QUOTIENT: {
        name: '求商',
        func() {
            console.log(arguments)
        }
    },
    AVERAGE: {
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