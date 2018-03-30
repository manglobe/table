import handleObject from '@/util/handleObject';

const colorArr = [
    "#ffb847",
    "#29cdff",
    "#7dd97c",
    "#00b4a9",
    "#239af6",
    "#fe6b28",
    "#fd8b8f",
    "#7a6cf7",
    "#779de9",
    "#c23030",
    "#08b53f",
    "#f8e81c",
];
const chartsType = {'1': 'line', '2': 'bar', '0': 'pie'};

export default function toInitChart(tables) {
	let charts = [];
    for(let table of tables) {
        let chart =  {
        	id: table.tableId,
        	tag: table.tableModelFlag,
        	mainType: table.imageType,
        	spreadType: table.flagList,
            xaxisName: table.xaxisName,
            yaxisName: table.yaxisName,
            platoName: table.platoName,
            notPercentage: notPercentage(table.rows),
            color: colorArr,
            title: {
                text: handleObject.lineFeed(table.tableName, 22),
                x: 'center',
                width: 200,
                textStyle: {
                   fontSize: 15,
                   fontWeight: 'normal',
                   width: 100
                },
                rich: {
                    a: {
                        width: 100
                    }
                }                         
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: toInitLegend(table.rows),
                // x: 'right',
                // y: 'bottom',
                // orient: 'vertical',
                top: 35,
                formatter(string) {
                    return string.length > 3 && location.hash.indexOf('preview') == -1 ? `${string.slice(0,3)}...` : string
                },
                tooltip: {
                    show: true
                }
            },
            xAxis: {
                data: toInitX(table.columns),
                axisLabel: {
                	interval: 0,
                	// rotate: 30,
                    formatter(string) {
                        let length = string.length;
                        let rows = Math.ceil(length/4);
                        if(string.length > 4) {
                            let temp = string.split('');
                            for(let i = 1; i < rows; i ++) {
                                temp.splice(4 * i + (i - 1), 0, '\n');
                            }         
                            return temp.join('');
                        }else {
                            return string;
                        }
                    }
                }
            },
            yAxis:[
                {
                    type: 'value',
                    name: '',
                    axisLabel: {
                        formatter: notPercentage(table.rows) ? '{value}%' : '{value}',
                    }                 
                },
            ],
            series: toInitRow(table.rows, table.imageType)
        }
        charts.push(chart);
    }
    return charts;
};

function notPercentage(data) {
    //如果有一项是百分符号，则都采用百分符号进行计算
    return data.some(item => {
        let [first, ...rest] = item.cellList;
        return rest.some(element => {
            return (element.cellValue + '').indexOf('%') !== -1; 
        }) == true;
    })
};

function toInitX(datas) {
    let arr = [];
    let [first, ...rest] = datas;
    for(let data of rest) {
        arr.push(data.columnName);
    }
    return arr;
};

function toInitLegend(datas) {
    let arr = [];               
    for(let data of datas) {
        let [first, ...rest] = data.cellList;
        arr.push(first.cellValue);
    };
    return arr;
};

function toInitRow(datas, imageType) {
    let arr = [];
    for(let data of datas) {
        let [first, ...rest] = data.cellList;
        let arr1 = [];       
        for(let data of rest) {
            let val = data.cellValue ? data.cellValue.replace('%', '') : data.cellValue; 
            arr1.push(val);
        }
        arr.push({
            name: first.cellValue,
            type: chartsType[imageType],
            data: arr1
        })
    }
    return arr;
};