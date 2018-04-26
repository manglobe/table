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
    func(valueStr) {
      let newStr = valueStr.replace(/subtraction/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
        return `(${disposeRange(match).join('+')})`
      }).replace(/,/g, '-');
      return newStr
    }
  },
  QUOTIENT: {
    name: '求商',
    func(valueStr) {
      let newStr = valueStr.replace(/quotient/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
        return `(${disposeRange(match).join('+')})`
      }).replace(/,/g, '/');
      return newStr
    }
  },
  AVERAGE: {
    name: '求平均数',
    func(valueStr) {
      let newStr = valueStr.replace(/AVERAGE/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
        return `(${disposeRange(match).join('+')})`
      }).replace(/,/g, '+');
      return `(${newStr}/${newStr.match(/[a-z]+\d+/gi).length})`
    }
  },
}
const transpose = (matrix) => {
  return matrix[0].map((ele, index) => {
    let newArr = [];
    for (const iterator of matrix) {
      newArr = [...newArr, iterator[index]]
    }
    return newArr;
  })
}


const checkData = data => {
  // const str = data.map(ele=>ele.join(',')).join(',')+','
  let numbers = [];
  let percents = [];
  let others = [];
  for (const iterator of data) {
    for (const iteratorItem of iterator) {
      if (/^\d+(\.\d+)?$/.test(String(iteratorItem))) {
        numbers.push(iteratorItem)
      } else if (/^\d+(\.\d+)?%$/.test(String(iteratorItem))) {
        percents.push(iteratorItem)
      } else {
        others.push(iteratorItem)
      }
    }
  }
  if (others.length > 0) {
    return {
      type: 'error',
      msg: '您选中的单元格包含了不合法的字符，请确保除首行首列外，其余的单元格均为数字或百分数'
    }
  }
  if (numbers.length === 0) {
    return {
      type: 'precent',
    }
  }
  return {
    type: 'mix'
  }
}

const chartDataFilter = dataSourse => {
  let filtedData = dataSourse.filter(ele => ele.join('') !== '');
  filtedData = transpose(transpose(filtedData).filter(ele => ele.join('') !== ''))
  let column = filtedData.map(ele => ele[0]);
  let row = filtedData[0];
  let data = filtedData;
  const isDataType = value=>/^\d+(\.\d+)?%?$/.test(String(value));
  if(filtedData[0][0] === (''||null)){
    data = data.slice(1).map(ele => ele.slice(1))
    row = row.slice(1)    
    column = column.slice(1)
  }else{
    if(!isDataType(row[row.length-1])){
      column = column.slice(1)
      data = data.slice(1)
      if(!isDataType(column[column.length-1])){
        row = row.slice(1)
        data = data.map(ele => ele.slice(1))
      }else{
        column = column.map((ele, index) => `系列${index+1}`)
      }
    }else{
      if(!isDataType(column[column.length-1])){
        row = row.slice(1)
        data = data.map(ele => ele.slice(1))
      }else{
        column = column.map((ele, index) => `系列${index+1}`)
      }
    }
  }
  // if (!column.slice(1).some(ele => !/^\d+(\.\d+)?%?$/.test(String(ele)))) {
  //   column = (/^\d+(\.\d+)?%?$/.test(String(column[0]))?column:column.slice(1)).map((ele, index) => `系列${index+1}`)
  // } else {
  //   data = data.map(ele => ele.slice(1))
  //   row = row.slice(1)    
  // }
  // if (!row.slice(1).some(ele => !/^\d+(\.\d+)?%?$/.test(String(ele)))) {
  //   row = (/^\d+(\.\d+)?%?$/.test(String(row[0]))?row:row.slice(1)).map((ele, index) => index + 1)
  // } else {
  //   data = data.slice(1)
  //   // column = column.slice(1)
    
  // }

  const checkResult = checkData(data)
  if (checkResult.type === 'error') {
    return checkResult.msg
  }

  return {
    column,
    row,
    data,
    type: checkResult.type
  }
}
export const excelCharts = {
  sum: {
    name: '折线图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)
      return {
        title: {
          top: 10,
          left: 'center',
          text: dataSourse.title,
          // subtext: ' '
        },
        legend: {
          bottom: 10,
          data: filtedData.column
        },
        tooltip: {
          trigger: 'axis'
        },
        // grid: {
        //     left: '3%',
        //     right: '4%',
        //     bottom: '3%',
        //     containLabel: true
        // },
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
          boundaryGap: false,
          data: filtedData.row
        },
        yAxis: {
          type: 'value'
        },
        series: filtedData.data.map((ele, index) => ({
          data: ele,
          type: 'line',
          name: filtedData.column[index]
        }))
      }
    }
  },
  reduce: {
    name: '柱状图（簇形）',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)
      return {
        title: {
          top: 10,
          left: 'center',
          text: '图表标题',
          // subtext: ' '
        },
        legend: {
          bottom: 10,
          data: filtedData.column
        },
        tooltip: {
          trigger: 'axis'
        },
        // toolbox: {
        //     show : true,
        //     feature : {
        //         mark : {show: true},
        //         dataView : {show: true, readOnly: false},
        //         magicType : {show: true, type: ['line', 'bar']},
        //         restore : {show: true},
        //         saveAsImage : {show: true}
        //     }
        // },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: filtedData.row
        }],
        yAxis: [{
          type: 'value'
        }],
        series: filtedData.data.map((ele, index) => ({
          data: ele,
          type: 'bar',
          name: filtedData.column[index]
        }))
      };
    }
  },
  quotient: {
    name: '饼图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)
      return {
        title: {
          top: 10,
          left: 'center',
          text: '图表标题',
          // subtext: ' '
        },
        legend: {
          bottom: 10,
          data: filtedData.column
        },
        tooltip: {
          trigger: 'axis'
        },
        // toolbox: {
        //     show : true,
        //     feature : {
        //         mark : {show: true},
        //         dataView : {show: true, readOnly: false},
        //         magicType : {show: true, type: ['line', 'bar']},
        //         restore : {show: true},
        //         saveAsImage : {show: true}
        //     }
        // },

        series: filtedData.data.map((ele, index) => ({
          data: ele,
          type: 'pie',
          name: filtedData.column[index]
        }))
      };
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