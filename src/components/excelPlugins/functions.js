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

const excelFunctions = {
  SUM: {
    name: '求和',
    func(valueStr) {
      let newStr = valueStr.replace(/sum/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
        return `(${disposeRange(match).join('+')})`
      }).replace(/,/g, '+');
      return newStr
    }
  },
  AVERAGE: {
    name: '求平均数',
    func(valueStr) {
      let midStr = valueStr.replace(/AVERAGE/i, '').replace(/[a-z]+\d+\:[a-z]+\d+/gi, (match) => {
        return `(${disposeRange(match).join(',')})`
      });
      let newStr = midStr.replace(/,/g, '+');
      return `(${newStr}/${midStr.split(',').length})`
    }
  },
}

export default excelFunctions;