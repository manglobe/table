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
            let newStr = valueStr.replace(/sum/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
                return `(${disposeRange(match).join('+')})`
            }).replace(/,/g, '+');
            return newStr
        }
    },
    SUBTRACTION: {
        name: '求差',
        func(valueStr ) {
            let newStr = valueStr.replace(/subtraction/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
                return `(${disposeRange(match).join('+')})`
            }).replace(/,/g, '-');
             return newStr
        }
    },
    QUOTIENT: {
        name: '求商',
        func(valueStr ) {
            let newStr = valueStr.replace(/quotient/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
                return `(${disposeRange(match).join('+')})`
            }).replace(/,/g, '/');
            return newStr
        }
    },
    AVERAGE: {
        name: '求平均数',
        func(valueStr ) {
            let newStr = valueStr.replace(/AVERAGE/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
                return `(${disposeRange(match).join('+')})`
            }).replace(/,/g, '+');
            return `(${newStr}/${newStr.match(/[a-z]+\d+/gi).length})`
        }
    },
}

export const excelCharts = {
    sum: {
        name: '折线图',
        func(dataSourse) {
            console.log('折线图')
            console.log(arguments)
            return {
                legend:{
                    data: dataSourse[0].map((ele,index)=> String.fromCharCode(index+97))
                },
                tooltip : {
                    trigger: 'axis'
                },
                // toolbox: {
                //     show : true,
                //     feature : {
                //         mark : {show: true},
                //         dataView : {show: true, readOnly: false},
                //         magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                //         restore : {show: true},
                //         saveAsImage : {show: true}
                //     }
                // },
                xAxis: {
                    type: 'category',
                    boundaryGap : false,
                    data: dataSourse.map((ele,index)=>index+1)
                },
                yAxis: {
                    type: 'value'
                },
                series: dataSourse[0].map((ele, index)=>({
                    data: dataSourse.map(ele=>ele[index]),
                    type:'line',
                    name:  String.fromCharCode(index+97)
                }))
            }
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