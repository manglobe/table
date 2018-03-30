/*
 * @file Api 接口配置
 * @author Hale Shen
 * @时间 2017-07-21
 */
// const path = require('path');

 export default {
    userInfoAddr: '/user/info/get',

 	floorsAddr: '/quality/floor/list',
 	deptsAddr: '/quality/department/list',
 	typesAddr: '/quality/quotaType/list',

 	createBaseInfoAddr: '/quality/quotaBaseInfo/create',
 	editBaseInfoAddr: '/quality/quotaBaseInfo/edit',

 	generateTableAddr: '/quality/quotaTable/generateQuotaTable',
 	
 	oldBaseInfoAddr: '/quality/quotaBaseInfo/detail?quotaId=',
 	oldTableInfoAddr: '/quality/quotaTable/getNewQuotaTable?quotaId=',
 	saveTableAddr: '/quality/quotaTable/saveQuotaTable',
 	updateTableAddr: '/quality/quotaTable/updateQuotaTable',
 	deleteTableAddr: '/quality/quotaTable/deleteNewQuotaTable',
 	
 	saveOldEntryInfoAddr: '/quality/result/analysis/edit',
 	saveNewEntryInfoAddr: '/quality/result/analysis/create',
 	saveOldChartsAddr: '/quality/quotaTable/updateQuotaTableElement',
 	
 	fileUploadAddr: '/file/upload',
 	
 	oldResultAddr: '/quality/result/analysis/detail?quotaId=',
 	
 	indicatorsAddr: '/quality/quotaBaseInfo/list?',
 	deleteIndicatorAddr: '/quality/quotaBaseInfo/delete?quotaId=',
 	previewAddr: '/quality/pdf/view?quotaIds=',
 }