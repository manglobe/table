const handleObject = {
	deepClone(obj) {
	    let str, newobj = obj.constructor === Array ? [] : {};
	    if(typeof obj !== 'object'){
	        return;
	    } else if(window.JSON){
	        str = JSON.stringify(obj), //系列化对象
	        newobj = JSON.parse(str); //还原
	    } else {
	        for(let i in obj){
	            newobj[i] = typeof obj[i] === 'object' ? 
	            clone(obj[i]) : obj[i]; 
	        }
	    }
	    return newobj;
	},
	toUrl(obj) {
		let _temp = [];
		for(let key in obj) {
			let value = obj[key];
			_temp.push(`${key}=${value}`);
		};
		return _temp.join('&');
	},
	uuid() {
		let s = [];
		let hexDigits = '0123456789abcdef';
		for(let i = 0; i < 32; i ++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);			
		};
		s[14] = '4';
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		let uuid = s.join('');
		return uuid;
	},
	lineFeed(string, num) {
	    let length = string.length;
	    let rows = Math.ceil(length/num);
	    if(string.indexOf('\n') != -1) {
	    	return string;
	    }else if(string.length > num) {
	        let temp = string.split('');
	        for(let i = 1; i < rows; i ++) {
	            temp.splice(num * i + (i - 1), 0, '\n');
	        }               
	        return temp.join('');
	    }else {
	        return string;
	    }   
	}
}	
export default handleObject;