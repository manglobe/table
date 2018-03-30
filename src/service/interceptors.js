import axios from 'axios'
import { Message } from 'element-ui';

//在axios实例上添加了拦截器方法，然后再引用这个axios

axios.interceptors.response.use(res => {
	if(res.data.responseCode != '0') {
		Message.error(res.data.responseMessage);
	}
	return res.data;
}, err => {
	switch(err.response.status) {
		case 401: 
			window.location.href = '/login';
			break;
		case 404:
			Message.error(`找不到网络资源！${err.response.status}`);
			break;
		case 500: 
			Message.error(`服务器错误！${err.response.status}`);
			break;
		case -1:
			Message.error(`服务器无响应！${err.response.status}`);
	}
	console.log(err.response)
	return Promise.reject(err.response);
})

// axios.interceptors.request.use(config => {

// }, err => {

// })
export default axios;