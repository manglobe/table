
const Calculation = function(arg1) {
  const obj = new Calculate(arg1);
  return obj;
}

const Calculate = function(value) {
  this.value = value;  
} 

const getSplitLength = function(value) {
  let str = transformPercentage(value).toString();
  let len = 0;
  if(str.indexOf('.') > 0) {
    len = str.split('.')[1].length;
  }
  return len;
}
const transformPercentage = function(value) {
  if(value.toString().indexOf('%') > 0) {
    return parseFloat(value)/100
  }else {
    return value
  }
}
// 加法
Calculate.prototype.add = function(value) {
  let thisTimesCount = getSplitLength(this.value);
  let timesCount = getSplitLength(value);
  let maxtimeCount = thisTimesCount > timesCount ? thisTimesCount : timesCount;
  let result = (Math.pow(10, maxtimeCount) * transformPercentage(this.value) + Math.pow(10, maxtimeCount) * transformPercentage(value)) / Math.pow(10, maxtimeCount);
  if(this.value.toString().indexOf('%') > 0 && value.toString().indexOf('%') > 0) {    
    return `${result*100}%`;
  }
  return result;
}
　　　
// 减法
Calculate.prototype.sub = function(value) {
  let thisTimesCount = getSplitLength(this.value);
  let timesCount = getSplitLength(value);
  let maxtimeCount = thisTimesCount > timesCount ? thisTimesCount : timesCount;
  let result = (Math.pow(10, maxtimeCount) * transformPercentage(this.value) - Math.pow(10, maxtimeCount) * transformPercentage(value)) / Math.pow(10, maxtimeCount);
  if(this.value.toString().indexOf('%') > 0 && value.toString().indexOf('%') > 0) {    
    return `${result*100}%`;
  }
  return result;
}
  
// 除法　　
Calculate.prototype.div = function(value) {
  let thisTimesCount = getSplitLength(this.value);
  let timesCount = getSplitLength(value);
  let maxtimeCount = thisTimesCount > timesCount ? thisTimesCount : timesCount;
  let result = ((Math.pow(10, maxtimeCount) * transformPercentage(this.value)) / (Math.pow(10, maxtimeCount) * transformPercentage(value)));
  if(this.value.toString().indexOf('%') > 0 && value.toString().indexOf('%') > 0) {    
    return `${result*100}%`;
  }
  return result;
}
  
// 乘法
Calculate.prototype.mul = function(value) {
  let thisTimesCount = getSplitLength(this.value);
  let timesCount = getSplitLength(value);
  let maxtimeCount = thisTimesCount > timesCount ? thisTimesCount : timesCount;
  let result = (Math.pow(10, maxtimeCount) * transformPercentage(this.value) * Math.pow(10, maxtimeCount) * transformPercentage(value)) / Math.pow(10, maxtimeCount * 2);
  if(this.value.toString().indexOf('%') > 0 && value.toString().indexOf('%') > 0) {    
    return `${result*100}%`;
  }
  return result;
}

export default Calculation;