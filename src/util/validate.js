const validate = {
	string(str) {
		if(!str || str.length > 600){
			return true;
		}else {
			return false;
		}
	},
	value(val) {
		if(!val){
			return true;
		}else {
			return false;
		}
	},
	number(val) {
		if(!val || isNaN(Number(val)) || val.length > 5){
			return true;
		}else {
			return false;
		}
	},
	array(arr) {
		return arr.map((data) => {
			if(!data || this.string(data)){
				return true;
			}else {
				return false;
			}
		})
	},
	phone(str) {
		if(!(/^1[34578]\d{9}$/.test(str))){   
	        return true; 
	    }
	},
	chinese(str) {
		let reg = new RegExp('[\\u4E00-\\u9FFF]+','g');
		return reg.test(str);
	}
}

export default validate;