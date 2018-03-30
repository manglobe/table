const dateHandle = {
	dateArrayFormat(dateArray) {
		return dateArray.map((data, index, array) => {
			return this.dateFormat(data);
		})
	},
	dateFormat(dateObj) {
		let dm = dateObj.getMonth() + 1;
		if(dm < 10){
			dm = '0' + dm;
		}
		let dd = dateObj.getDate();
		if(dd < 10){
			dd = '0' + dd;
		}
		return dateObj.getFullYear() + '-' + dm + '-' + dd;
	},
	fullDateformat(dateObj) {
		let dm = dateObj.getMonth() + 1;
		if(dm < 10){
			dm = '0' + dm;
		}
		let dd = dateObj.getDate();
		if(dd < 10){
			dd = '0' + dd;
		}
		let dh = dateObj.getHours();
		if(dh < 10){
			dh = '0' + dh;
		}
		let dmi = dateObj.getMinutes();
		if(dmi < 10){
			dmi = '0' + dmi;
		}
		let ds = dateObj.getSeconds();
		if(ds < 10){
			ds = '0' + ds;
		}
		return dateObj.getFullYear() + '-' + dm + '-' + dd + ' ' + dh + ':' + dmi + ':' + ds;
	}	
}

export default dateHandle;