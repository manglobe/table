import handleObject from '@/util/handleObject';

const colorArr = ["#fe6b28",["#ffb847"],["#7a6cf7"],["#3398db","#fe6b28"],];

export default function initSpreadChart(chart, type) {
	let spreadChart =  {
		type: type,
		id: chart.id,
        color: colorArr[parseInt(type)],
        title: {
            text: type != '1' ? (type == '2' ? handleObject.lineFeed(chart.yaxisName,22) : handleObject.lineFeed(chart.platoName,22)) : handleObject.lineFeed(chart.xaxisName, 22),
            x: 'center',
            textStyle: {
               fontSize: 15, 
               fontWeight: 'normal',
            }                           
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            }
        },
        xAxis: {
            data: initX(chart, type),
            axisLabel: {
            	interval: 0,
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
            	name: '次数',
            	axisLabel: {
                    formatter: chart.notPercentage ? '{value}%' : '{value}',
                }                	
            },
        ],
        series: initSeries(chart, type),
    }
    if(type == '3') {
    	spreadChart.yAxis.push({
    		type: 'value',
    		name: '累计百分比',
    		// interval: 10,
    		axisLabel: {
        		formatter: '{value}%'
        	}
    	})
    };
    return spreadChart;
};
//列相加
function colSum(chart) {
	let sum = [];
	for(let i = 0;i < chart.series[0].data.length; i++){
		sum[i] = 0;
		for(let j = 0;j < chart.series.length; j++){
			sum[i] += Number(chart.series[j].data[i]);
		}
	};
	return {
		data: sum,
		type: 'bar',
		barWidth: 20
	};
};

//行相加
function rowSum(chart) {
	let sum = [];
	chart.series.map(item => {
		let value = item.data.reduce((total, num) => {
			return Number(total) + Number(num);
		});
		sum.push(value);
	});
	return {
		data: sum,
		type: 'bar',
		barWidth: 20
	};	
};

function initX(chart, type) {
	switch(type) {
		case '1':
			return chart.legend.data;
		case '2':
		    return chart.xAxis.data;
		case '3':
			return chart.tag == 'generateTableTwo' ? rank(rowSum(chart), chart.legend.data)[1] : rank(colSum(chart), chart.xAxis.data)[1];	
	}
};

function initSeries(chart, type) {
	switch(type) {
		case '1':
			return rowSum(chart);
		case '2': 
			return colSum(chart);
		case '3':
			return chart.tag == 'generateTableTwo' ? rank(rowSum(chart), chart.legend.data)[0] : rank(colSum(chart), chart.xAxis.data)[0];
	}
};

function rank(arr1, arr2){
	let arrVal = handleObject.deepClone(arr1.data);
	let arrStr = handleObject.deepClone(arr2);
	for(let i = 0; i < arrVal.length; i++){
		for(let j = 0; j < arrVal.length-1-i; j++){
			if(parseInt(arrVal[j]) < parseInt(arrVal[j+1])){
				let tmpVal = arrVal[j+1];
				arrVal[j+1] = arrVal[j];
				arrVal[j] = tmpVal;

				let tmpStr = arrStr[j+1];
				arrStr[j+1] = arrStr[j];
				arrStr[j] = tmpStr;
			}
		}
	};
	return [
	    [
			{
				data: initBorderBar(arrVal),
				type: 'bar',
				barCategoryGap: '0%',
				barWidth: '',
			},
			{
				data: countPercent(arrVal),
				type: 'line',
				yAxisIndex: 1
			}
		], 
		arrStr
	]
};

function initBorderBar(array) {
	return array.map(data => {
		return {
			value: data,
			itemStyle: {
				normal: {
					borderColor: '',
				}
			}
		}
	})
};

function countPercent(array) {
	let sum = array.reduce((newVal, oldVal) => {
		return newVal + oldVal;
	});
	let accumulate = [];
	for(let i = 0; i < array.length; i ++) {
		i == 0 ? accumulate[i] = (parseInt(array[i]))/sum*100 : accumulate[i] = (parseInt(array[i]))/sum*100 + parseFloat(accumulate[i-1])
	};
	return accumulate.map(data => {
		return parseFloat(data.toFixed(2));
	});
};
