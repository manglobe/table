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
  if(data.length === 0){
    return 'mix'
  }
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
  if (numbers.length === 0) {
    return 'precent'
  }
  return 'mix'
}

const checkType = (data, column,  secLegends)=>{
  const firstData = [];
  const secData = [];
  data.forEach((ele, index) => {
    if(secLegends && secLegends.includes(column[index])){
      secData.push(ele)
    } else {
      firstData.push(ele)
    }
  });
  return  [checkData(firstData),  checkData(secData)]
}

const chartDataFilter = (dataSourse, isTranspose) => {
  let filtedData = dataSourse.data.filter(ele => ele.join('') !== '');
  if (filtedData.length === 0) {
    return {
      column: [],
      row: [],
      data: [],
    }
  }
  filtedData = transpose(transpose(filtedData).filter(ele => ele.join('') !== ''))

  const isDataType = value => /^\d+(\.\d+)?%?$/.test(String(value));

    // 去除标题行

  if (!isDataType(filtedData[0][filtedData[0].length - 1]) && !isDataType(filtedData[1][filtedData[1].length - 1])) {
    filtedData = filtedData.slice(1)
  }

  let column = filtedData.map(ele => ele[0]);
  let row = filtedData[0];
  let data = filtedData;

  if (filtedData[0][0] === '' || filtedData[0][0] === null) {
    data = data.slice(1).map(ele => ele.slice(1))
    row = row.slice(1)
    column = column.slice(1)
  } else {
    if (!isDataType(row[row.length - 1])) {
      column = column.slice(1)
      data = data.slice(1)

      if (!isDataType(column[column.length - 1])) {
        row = row.slice(1)
        data = data.map(ele => ele.slice(1))
      } else {
        column = column.map((ele, index) => `系列${index+1}`)
      }
    } else {
      if (!isDataType(column[column.length - 1])) {
        row = row.slice(1)
        data = data.map(ele => ele.slice(1))
      } else {
        column = column.map((ele, index) => `系列${index+1}`)
      }
    }
  }
  
  let returnData = {
    column: isTranspose ? row : column,
    row: isTranspose ? column : row,
    data: isTranspose ? transpose(data) : data,
  }
  const checkResult =  checkType(returnData.data, returnData.column, dataSourse.secLegends)
   
  // 解析%
  returnData.data =  returnData.data.map(ele1 => ele1.map(ele => {
    ele = (ele === '' || ele === null) ? 0 : ele
    if (/%$/.test(ele)) {
      return ele.replace(/%/, '') / 100
    }
    return ele
  }));
  returnData.types = checkResult

  if (dataSourse.legend) {
    const legends = dataSourse.legend.split(';')
    returnData.column = returnData.column.map((ele, index) => legends[index] || ' ')
  }

  if (dataSourse.xAxis) {
    const xAxises = dataSourse.xAxis.split(';')
    returnData.row = returnData.row.map((ele, index) => xAxises[index] || ' ')
  }

  return returnData

  
}

import echarts from 'echarts';

const publicConfig = (dataSourse) => ({
  title: {
    top: 10,
    left: 'center',
    text: dataSourse.title,
    textStyle: {
      fontWeight: 'normal',
      fontSize: 16,
      color: '#333',
    }
  },
  color: ["rgb(83,189,231)",
    "rgb(255,132,101)",
    "rgb(58,201,168)",
    "rgb(254,161,1)",
    "rgb(255,189,173)",
    "rgb(117,236,208)",
    "rgb(255,207,124)",
    "rgb(124,217,255)",
    "rgb(207,164,255)",
    "rgb(243,220,93)"
  ],

})
const change2precent = (data, type) =>{
 return type === 'precent' ? (data * 100).toFixed(2) + '%' : data
}
const isSec = (secLegends , column) => index =>{
  if(secLegends && secLegends.includes(column[index]) ){ 
    return  1 
  }
  return 0
}
const excelCharts = {
  line: {
    name: '折线图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse, dataSourse.transpose);
      const {column, row, data, types} = filtedData;
      const yAxisIndex = isSec(dataSourse.secLegends ,column)
      return {
        ...publicConfig(dataSourse),
        legend: {
          padding: [0, 5],
          bottom: 5,
          data: column.map(ele => ele.substr(0, 19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
          tooltip: {
            show: true
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            return params.map((ele, index) => `
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ele.color};"></span>
              ${ele.seriesName||''}: ${change2precent(ele.data, types[yAxisIndex(index)])}`).join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: row,
          axisLabel: {
            formatter: function (val) {
              return val === 'null' ? '' : val.substr(0, 19)
            }
          },
        },
        yAxis: [{
            type: 'value',
            axisLabel: {
              formatter: function (val) {
                return change2precent(val, types[0])
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return change2precent(params.value, types[0])
                }
              }
            }
          },
          dataSourse.secLegends && dataSourse.secLegends.length > 0 ? {
            type: 'value',
            axisLabel: {
              formatter: function (val) {
                return change2precent(val, types[1])
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return change2precent(params.value, types[1])
                }
              }
            }
          }:null
        ],
        series: data.map((ele, index) => ({
          data: ele,
          type: 'line',
          name: column[index] ? column[index].substr(0, 19) : '',
          yAxisIndex: yAxisIndex(index)
        }))
      }
    }
  },
  bar: {
    name: '柱状图（簇形）',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse, dataSourse.transpose)
      const {column, row, data, types} = filtedData;
      const yAxisIndex = isSec(dataSourse.secLegends ,column)
      return {
        ...publicConfig(dataSourse),
        legend: {
          padding: [0, 5],
          bottom: 5,
          data: column.map(ele => ele.substr(0, 19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
          tooltip: {
            show: true
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            return params.map((ele, index) => `
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ele.color};"></span>
              ${ele.seriesName||''}: ${change2precent(ele.data, types[yAxisIndex(index)])}`).join('<br/>')
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: row,
          axisLabel: {
            formatter: function (val) {
              return val === 'null' ? '' : val.substr(0, 19)
            }
          },
        }],
        yAxis:  [{
          type: 'value',
          axisLabel: {
            formatter: function (val) {
              return change2precent(val, types[0])
            }
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return change2precent(params.value, types[0])
              }
            }
          }
        },
        dataSourse.secLegends && dataSourse.secLegends.length > 0 ? {
          type: 'value',
          axisLabel: {
            formatter: function (val) {
              return change2precent(val, types[1])
            }
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return change2precent(params.value, types[1])
              }
            }
          }
        }:null],
        series: data.map((ele, index) => ({
          data: ele,
          type: 'bar',
          name: column[index] ? column[index].substr(0, 19) : '',
          yAxisIndex: yAxisIndex(index)
        }))
      };
    }
  },
  pie: {
    name: '饼图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse, dataSourse.transpose)
      const {column, row, data, types} = filtedData;
      const yAxisIndex = isSec(dataSourse.secLegends ,column)
      return {
        ...publicConfig(dataSourse),
        legend: {
          padding: [0, 5],
          bottom: 5,
          data: column.map(ele => ele.substr(0, 19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)",
          formatter: function (params) {
            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
              ${params.data.name|| '' }: ${change2precent(params.data.value ,types[yAxisIndex(index)])} (${params.percent}%)`
          }
        },
        series: [{
          data: data.map((ele, index) => ({
            value: ele[0],
            name: column[index] ? column[index].substr(0, 19) : ''
          })),
          type: 'pie',
          radius: '50%',
        }]
      };
    }
  },
  pareto: {
    name: '柏拉图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse, dataSourse.transpose)
      const {column, row, data, types} = filtedData;
      const yAxisIndex = isSec(dataSourse.secLegends ,column);

      const sumArr = transpose(data).map(ele => {
        return eval(ele.map(ele => isNaN(+ele) ? 0 : ele).join('+'))
      });
      const sum = eval(sumArr.join('+'));
      const proportion = sumArr.map(ele => ele / sum)

      const sortArr = sumArr.map((ele, index) => ({
        name: row[index],
        value: ele,
        proportion: proportion[index],
      }))
      sortArr.sort((p, n) => p.value < n.value)
      let sortedProportion = sortArr.map(ele => ele.proportion)
      sortedProportion.reduce((p, n, i) => {
        sortedProportion[i] = p + n;
        return p + n
      })
      return {
        ...publicConfig(dataSourse),
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: function (params) {
            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>
            ${params[0].name  === 'null' ? '' : params[0].name}: ${change2precent(params[0].data , types[0])}<br />
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:transparent"></span> ${(params[1].data*100).toFixed(2)}%`
          }
        },
        xAxis: [{
          type: 'category',
          data: dataSourse.xAxis?sortArr.map((ele, index) => dataSourse.xAxis.split(';')[index]|| ''): sortArr.map(ele => ele.name),
          axisPointer: {
            type: 'shadow'
          },
          axisLabel: {
            formatter: function (val) {
              return val === 'null' ? '' : val.substr(0, 19)
            }
          },
        }],
        yAxis: [{
            type: 'value',
            axisLabel: {
              formatter: function (val) {
                return change2precent(val, types[0])
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return change2precent(params.value, types[0])
                }
              }
            }
          },
          {
            type: 'value',
            name: '占比',
            min: 0,
            max: 1,
            axisLabel: {
              formatter: value => `${value*100} %`
            }
          }
        ],
        series: [{
            type: "bar",
            data: sortArr.map(ele => ele.value),
            barCategoryGap: 0,
            itemStyle: {
              borderColor: 'rgba(0,0,0,0.3)',
              borderWidth: 1,
            }
          },
          {
            type: "line",
            data: sortedProportion,
            yAxisIndex: 1,
          },
        ]
      }
    }
  },
}


export default excelCharts;