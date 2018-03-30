import Vue from 'vue'
import Vuex from 'vuex'
import service from '@/service/service'
import {Notification} from 'element-ui';

Vue.use(Vuex)

const state = {
	userInfo: {},
	csrf: {},
	depts: [],
	floors: [],
	types: [],
	oldBaseInfo: {
		denominator: '',
		departmentId: '',
		floorId: '',
		molecular: '',
		percentage: '',
		quotaName: '',
		quotaTypeId: '',					
		quotaDefinitions: [null],
		formulaUnits: '%'
	},
	indicatorsTable: [],
};
const sessionStorage = window.sessionStorage;
const actions = {
	loadUserInfo({ commit }) {
		service.getUserInfo().then(res => {
			if(res.hasOwnProperty('userAdminInfo')) {
				commit('SET_USER_INFO', {userInfo: res.userAdminInfo});
			}else {
				commit('SET_USER_INFO', {userInfo: null});
				Notification.error({
					title: `错误：${res}`,
					message: `获取用户信息失败!`
				})
			}
		})
	}, 
	loadDepts({ commit }) {		
		service.getDepts().then(res => {
			commit('SET_DEPTS', {depts: res.result});		
		})
	},
	loadFloors({ commit }) {
		service.getFloors().then(res => {
			commit('SET_FLOORS', {floors: res.result});
		})
	},
	loadTypes({ commit }) {
		service.getTypes().then(res => {
			commit('SET_TYPES', {types: res.responseData.resultList});
		})
	},
}; 

const mutations = {
	SET_USER_INFO: (state, { userInfo }) => {
		state.userInfo = userInfo;
		sessionStorage.setItem('userInfo', JSON.stringify(state.userInfo));
	},
	CSRF: (state, csrf) => {
		state.csrf = csrf;
	},
	SET_DEPTS: (state, { depts }) => {
		state.depts = depts;
		// sessionStorage.setItem('generalDepts', JSON.stringify(state.generalDepts));
	},
	SET_FLOORS: (state, { floors }) => {
		state.floors = floors;
		// sessionStorage.setItem('titles', JSON.stringify(state.titles));
	},
	SET_TYPES: (state, { types }) => {
		state.types = types;
	},
	SET_ECHARTS: (state, indicatorsTable) => {
		state.indicatorsTable = indicatorsTable;
	}
};

const getters = {
	userInfoGetter(state) {
		if(state.userInfo.length == 0) {
			state.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
		};
		return state.userInfo;
	},
	quotaIdGetter(state) {
		return state.quotaId;
	}
	// generalDeptsGetter(state) {
	// 	if(state.generalDepts.length == 0) {
	// 		state.generalDepts = JSON.parse(sessionStorage.getItem('generalDepts'));
	// 	};
	// 	return state.generalDepts;
	// },
	// titlesGetter(state) {
	// 	if(state.titles.length == 0) {
	// 		state.titles = JSON.parse(sessionStorage.getItem('titles'));
	// 	};
	// 	return state.generalDepts;
	// },
};

export default new Vuex.Store({
	state,
	getters,
	mutations,
	actions,
})