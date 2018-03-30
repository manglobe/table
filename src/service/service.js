import axios from '@/service/interceptors';
import api from '@/service/api';
import handleObject from '@/util/handleObject';

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : '/api'

let get = function(loc, params='') {
	if(typeof(params) == 'object') {
		params = handleObject.toUrl(params);		
	};
	let config = {
		url: loc + params,
		method: 'GET',
	};
	return axios(config).then(res => {
		return res;		
	}).catch(err => {
		return err.status;
	})
};

let post = function(loc, json = '') {
	let config = {
		url: loc,
		method: 'POST',
		data: json,
	};
	return axios(config).then(res => {
		return res;
	}).catch(err => {
		return err.response.status;
	})
};

let put = function(loc, json = '', id = '') {
	let config = {
		url: loc + id,
		method: 'PUT',
		data: json,
	};
	return axios(config).then(res => {
		if(res.data.state == 200){
			return res.data;
		}
	}).catch(err => {
		return err.response.status;
	})
};

const services = {
	//获取用户信息
	getUserInfo() {
		return get(api.userInfoAddr);
	},
	//获取专科列表
	getDepts() {
		return get(api.deptsAddr);
	},
	//获取楼层列表
	getFloors() {
		return get(api.floorsAddr);
	},
	//获取指标类型
	getTypes() {
		return get(api.typesAddr);
	},
	//创建基本信息
	createBaseInfo(params) {
		return post(api.createBaseInfoAddr, params);
	},
	//编辑基本信息
	editBaseInfo(params) {
		return post(api.editBaseInfoAddr, params);
	},
	//获取上一步的基本信息
	getOldBaseInfo(id) {
		return get(api.oldBaseInfoAddr, id);
	},
	//生成表格
	generateTable(params) {
		return post(api.generateTableAddr, params)
	},
	//获取表格
	getOldTable(id) {
		return get(api.oldTableInfoAddr, id)
	},
	//保存表格
	saveTable(params) {
		return post(api.saveTableAddr, params)
	},
	//修改表格
	updateTable(params) {
		return post(api.updateTableAddr, params)
	},
	//删除表格
	deleteTable(id) {
		return post(api.deleteTableAddr, id)
	},
	//保存旧录入信息
	saveOldEntryInfo(params) {
		return post(api.saveOldEntryInfoAddr, params)
	},
	//保存新录入信息
	saveNewEntryInfo(params) {
		return post(api.saveNewEntryInfoAddr, params)
	},
	//保存生成图信息
	saveOldCharts(params) {
		return post(api.saveOldChartsAddr, params)
	},
	//获取指标列表
	getIndicators(params) {
		return get(api.indicatorsAddr, params);
	},
	//删除指标
	deleteIndicator(id) {
		return get(api.deleteIndicatorAddr, id);
	},
	//上传头像
	upload(param) {
		return post(api.fileUploadAddr, param);
	},
	//获取分析结果
	getOldResult(id) {
		return get(api.oldResultAddr, id);
	},
	//预览
	previewData(id) {
		return get(api.previewAddr, id);
	},
}

export default services; //export语句输出的接口，与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值。