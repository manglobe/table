// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import EleUI from 'element-ui';
import store from './store/store';
import service from '@/service/service';
import handleObject from '@/util/handleObject';
import dateHandle from '@/util/dateformat';
import toBaseEChart from '@/util/toBaseEChart';
import toSpreadEChart from '@/util/toSpreadEChart';
import validate from '@/util/validate';
import '../theme-shulan/index.css';
import '../theme-shulan/base.css';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import {mapActions} from 'vuex';
import '../static/svg/index.js';
Vue.config.productionTip = false
Vue.use(EleUI);

Vue.prototype.$service = service;
Vue.prototype.$handleObject = handleObject;
Vue.prototype.$dateHandle = dateHandle;
Vue.prototype.$validate = validate;
Vue.prototype.toBaseEChart = toBaseEChart;
Vue.prototype.toSpreadEChart = toSpreadEChart;

// 获取X-XSRF-TOKEN
let csrf = {}
if (!window._csrf) {
  window._csrf = {'headerName': 'X-XSRF-TOKEN', 'token': 'global'}
}
let csrfHeader = window._csrf['headerName']
let csrfContent = window._csrf['token']
csrf[csrfHeader] = csrfContent
store.commit('CSRF', csrf);

router.beforeEach((to, from, next) => {
	NProgress.start();
	next();
});
router.afterEach((to, from, next) => {
	NProgress.done();
})
/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<App/>',
	components: { App },
	beforeCreate() {
		// store.dispatch('loadUserInfo');
		store.dispatch('loadDepts');
		store.dispatch('loadFloors');
		store.dispatch('loadTypes');
	}
})

