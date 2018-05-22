
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
  if(filtedData.length === 0){
    return {
      column:[],
      row:[],
      data:[],
    }
  }
  filtedData = transpose(transpose(filtedData).filter(ele => ele.join('') !== ''))

  const isDataType = value=>/^\d+(\.\d+)?%?$/.test(String(value));

  // 去除标题行

  if(!isDataType(filtedData[0][filtedData[0].length-1])&&!isDataType(filtedData[1][filtedData[1].length-1])){
    filtedData = filtedData.slice(1)
  }
  
  let column = filtedData.map(ele => ele[0]);
  let row = filtedData[0];
  let data = filtedData;
  let xAxisLength = 0;
  let yAxisLength = 0;


  if(filtedData[0][0] === ''|| filtedData[0][0] === null){
    data = data.slice(1).map(ele => ele.slice(1))
    row = row.slice(1)    
    column = column.slice(1)
    xAxisLength = 1
    yAxisLength = 1
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
  data= data.map(ele=>ele.map(ele2=>(ele2==='' || ele2===null) ? 0 : ele2))

  const checkResult = checkData(data)
  return {
    column,
    row,
    data: data.map(ele1=>ele1.map(ele=>{
      if(/%$/.test(ele)){
        return ele.replace(/%/,'')/100
      }
      return ele
    })),
    type: checkResult.type
  }
}

import echarts from 'echarts';

const excelCharts = {
  line: {
    name: '折线图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)

        if(dataSourse.legend){
            const legends = dataSourse.legend.split(';')
            filtedData.column = filtedData.column.map((ele,index)=> legends[index]||'')
        }

        if(dataSourse.xAxis){
            const xAxises = dataSourse.xAxis.split(';')
            filtedData.row = filtedData.row.map((ele,index)=> xAxises[index]||'')
        }

      return {
        title: {
          top: 10,
          left: 'center',
          text: dataSourse.title,
          textStyle:{
              fontWeight:'normal',
              fontSize:16,
              color:'#333',
          }
        },
        legend: {
          padding: [0, 5],
          bottom: 5,
          data:  filtedData.column.map(ele=>ele.substr(0,19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
          tooltip: {
            show: true
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params){
            return params.map(ele=>`
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ele.color};"></span>
              ${ele.seriesName||''}: ${filtedData.type === 'precent'?(ele.data * 100).toFixed(2) + '%':ele.data}`).join('<br/>')
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: filtedData.row,
          axisLabel: {
            formatter: function (val) {
              return val === 'null' ? '' : val.substr(0,19)
            }
          },
        },
        yAxis: dataSourse.secLegends&&dataSourse.secLegends.length>0?[
            {
                type: 'value',
                axisLabel: {
                    formatter: function (val) {
                    if(filtedData.type === 'precent'){
                        return val * 100 + '%';
                    } 
                    return val
                    }
                },
                axisPointer: {
                    label: {
                        formatter: function (params) {
                            return (params.value * 100).toFixed(2) + '%';
                            if(filtedData.type === 'precent'){
                            return (params.value  * 100).toFixed(2) + '%';
                            } 
                            return params
                        }
                    }
                }
            },
            {
                type: 'value',
                axisLabel: {
                    formatter: function (val) {
                    if(filtedData.type === 'precent'){
                        return val * 100 + '%';
                    } 
                    return val
                    }
                },
                axisPointer: {
                    label: {
                        formatter: function (params) {
                            return (params.value * 100).toFixed(2) + '%';
                            if(filtedData.type === 'precent'){
                            return (params.value  * 100).toFixed(2) + '%';
                            } 
                            return params
                        }
                    }
                }
            }
        ]:{
            type: 'value',
            axisLabel: {
                formatter: function (val) {
                if(filtedData.type === 'precent'){
                    return val * 100 + '%';
                } 
                return val
                }
            },
            axisPointer: {
                label: {
                    formatter: function (params) {
                        return (params.value * 100).toFixed(2) + '%';
                        if(filtedData.type === 'precent'){
                        return (params.value  * 100).toFixed(2) + '%';
                        } 
                        return params
                    }
                }
            }
            },
        series:filtedData.data.map((ele, index) => ({
          data: ele,
          type: 'line',
          name: filtedData.column[index]?filtedData.column[index].substr(0,19):'',
          yAxisIndex: dataSourse.secLegends&&dataSourse.secLegends.includes(filtedData.column[index])?1:0
        })),
        color: ["rgb(83,189,231)",
        "rgb(255,132,101)",
        "rgb(58,201,168)",
        "rgb(254,161,1)",
        "rgb(255,189,173)",
        "rgb(117,236,208)",
        "rgb(255,207,124)",
        "rgb(124,217,255)",
        "rgb(207,164,255)",
        "rgb(243,220,93)"]
      }
    }
  },
  bar: {
    name: '柱状图（簇形）',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)
      return {
        title: {
          top: 10,
          left: 'center',
          text: dataSourse.title,
        },
        legend: {
          padding: [0, 5],
          bottom: 5,
          data: filtedData.column.map(ele=>ele.substr(0,19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
          tooltip: {
            show: true
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params){
            return params.map(ele=>`
              <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ele.color};"></span>
              ${ele.seriesName||''}: ${filtedData.type === 'precent'?(ele.data * 100).toFixed(2) + '%':ele.data}`).join('<br/>')
          }
        },
        calculable: true,
        xAxis: [{
          type: 'category',
          data: filtedData.row,
          axisLabel: {
            formatter: function (val) {
              return val === 'null' ? '' : val.substr(0,19)
            }
          },
        }],
        yAxis: dataSourse.secLegends&&dataSourse.secLegends.length>0?
        [{
          type: 'value',
          axisLabel: {
            formatter: function (val) {
              if(filtedData.type === 'precent'){
                return val * 100 + '%';
              } 
              return val
            }
          },
          axisPointer: {
              label: {
                  formatter: function (params) {
                    return (params.value * 100).toFixed(2) + '%';
                    if(filtedData.type === 'precent'){
                      return (params.value  * 100).toFixed(2) + '%';
                    } 
                    return params
                  }
              }
          }
        },{
          type: 'value',
          axisLabel: {
            formatter: function (val) {
              if(filtedData.type === 'precent'){
                return val * 100 + '%';
              } 
              return val
            }
          },
          axisPointer: {
              label: {
                  formatter: function (params) {
                    return (params.value * 100).toFixed(2) + '%';
                    if(filtedData.type === 'precent'){
                      return (params.value  * 100).toFixed(2) + '%';
                    } 
                    return params
                  }
              }
          }
        }]
        :[{
          type: 'value',
          axisLabel: {
            formatter: function (val) {
              if(filtedData.type === 'precent'){
                return val * 100 + '%';
              } 
              return val
            }
          },
          axisPointer: {
              label: {
                  formatter: function (params) {
                    return (params.value * 100).toFixed(2) + '%';
                    if(filtedData.type === 'precent'){
                      return (params.value  * 100).toFixed(2) + '%';
                    } 
                    return params
                  }
              }
          }
        }],
        series:filtedData.data.map((ele, index) => ({
          data: ele,
          type: 'bar',
          name: filtedData.column[index]?filtedData.column[index].substr(0,19):'',
          yAxisIndex: dataSourse.secLegends&&dataSourse.secLegends.includes(filtedData.column[index])?1:0
        }))
      };
    }
  },
  pie: {
    name: '饼图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)
      return {
        title: {
          top: 10,
          left: 'center',
          text: dataSourse.title,
        },
        legend: {
          padding: [0, 5],
          bottom: 5,
          data: filtedData.row.map(ele=>ele.substr(0,19)),
          formatter: function (name) {
            return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
          },
        },
        tooltip : {
          trigger: 'item',
          formatter: "{b} : {c} ({d}%)",
          formatter: function(params){
            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
              ${params.data.name|| '' }: ${filtedData.type === 'precent'?(params.data.value * 100).toFixed(2) + '%':params.data.value} (${params.percent}%)`
          }
          
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
        series: [{
          data: filtedData.data[0].map((ele, index)=>({
            value: ele,
            name: filtedData.row[index]?filtedData.row[index].substr(0,19):''
          })),
          type: 'pie',
          radius : '50%',
        }]
      };
    }
  },
  pareto: {
    name: '柏拉图',
    func(dataSourse) {
      let filtedData = chartDataFilter(dataSourse.transpose?transpose(dataSourse.data):dataSourse.data)

      const sumArr =  transpose(filtedData.data).map(ele=>{
        return eval(ele.map(ele=> isNaN(+ele)?0:ele).join('+'))
      });
      const sum = eval(sumArr.join('+'));
      const proportion = sumArr.map(ele=>ele/sum)

      const sortArr = sumArr.map((ele, index)=>({
        name: filtedData.row[index],
        value: ele,
        proportion: proportion[index],
      }))
      sortArr.sort((p,n)=>p.value<n.value)
      let sortedProportion = sortArr.map(ele=>ele.proportion)
      sortedProportion.reduce((p,n,i)=>{sortedProportion[i]=p+n; return p+n})
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'cross',
              crossStyle: {
                  color: '#999'
              }
          },
          formatter: function(params){
            return `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>
            ${params[0].name  === 'null' ? '' : params[0].name}: ${filtedData.type === 'precent'?(params[0].data * 100).toFixed(2) + '%':params[0].data}<br />
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:transparent"></span> ${(params[1].data*100).toFixed(2)}%`
          }
        },
        // legend: {
        //     padding: [0, 5],
        //     bottom: 5,
        //     data: sortArr.map(ele=>ele.name.substr(0,19)),
        //     formatter: function (name) {
        //       console.log(name)
        //       return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
        //     },
        // },
        xAxis: [
            {
                type: 'category',
                data: sortArr.map(ele=>ele.name),
                axisPointer: {
                  type: 'shadow'
                },
                axisLabel: {
                  formatter: function (val) {
                    return val === 'null' ? '' : val.substr(0,19)
                  }
                },
            }
        ],
        yAxis: [
            {
              type: 'value',
              axisLabel: {
                formatter: function (val) {
                  if(filtedData.type === 'precent'){
                    return val * 100 + '%';
                  } 
                  return val
                }
              },
              axisPointer: {
                label: {
                    formatter: function (params) {
                      return (params.value  * 100).toFixed(2) + '%';
                      if(filtedData.type === 'precent'){
                        return (params.value  * 100).toFixed(2) + '%';
                      } 
                      return params
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
                    formatter: value =>`${value*100} %`
                }
            }
        ],
        series: [
          {
            type:"bar",
            data: sortArr.map(ele=>ele.value),
            barCategoryGap: 0,
            itemStyle:{
              borderColor: 'rgba(0,0,0,0.3)',
              borderWidth: 1,
              // tooltip:{
              //   formatter: params=> params.data
              // }
            }
          },
          {
            type:"line",
            data: sortedProportion,
            yAxisIndex: 1,
            // tooltip:{
            //   formatter: (params) =>{return `${(params.data*100).toFixed(2)} %`}
            // }
          },
        ]
      }
    }
  },
}


export default excelCharts;