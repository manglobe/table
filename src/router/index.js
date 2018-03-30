import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/common/index'

// const EntryStep1 = resolve => require(['@/views/pages/entryStep1.vue'], resolve);
// const EntryStep2 = resolve => require(['@/views/pages/entryStep2.vue'], resolve);
// const EntryStep3 = resolve => require(['@/views/pages/entryStep3.vue'], resolve);
// const EntryStep4 = resolve => require(['@/views/pages/entryStep4.vue'], resolve);
// const libs = resolve => require(['@/views/pages/libs.vue'], resolve);
// const Preview = resolve => require(['@/views/pages/OldCharts.vue'], resolve);

import EntryStep1 from '@/views/pages/entryStep1.vue'
import EntryStep2 from '@/views/pages/entryStep2.vue'
import EntryStep3 from '@/views/pages/entryStep3.vue'
import EntryStep4 from '@/views/pages/entryStep4.vue'
import libs from '@/views/pages/libs.vue'
import Preview from '@/views/pages/OldCharts'

Vue.use(Router)

export default new Router({
    routes: [
        //页面初始化重定向到/indicator/entryStep1
	    {
	    	path: '/',
	    	redirect: '/indicator/entryStep1',
	    },
	    //点击指标录入重定向到/indicator/entryStep1
	    {
	    	path: '/indicator/entr', 
	    	//在一个menu-item中保持高亮
	    	redirect: '/indicator/entryStep1',	    	
	    },
	    {
	        path: '/indicator',	
	        component: Index,
	        children:[
	        	{
	        		path: 'entryStep1',
	        		name: 'entryStep1',
	        		component: EntryStep1      		
	        	},
	        	{
    				path: 'entryStep2',
    				name: 'entryStep2',
    				component: EntryStep2,
    			},
    			{
    				path: 'entryStep3',
    				name: 'entryStep3',
    				component: EntryStep3,
    			},
    			{
    				path: 'entryStep4',
    				name: 'entryStep4',
    				component: EntryStep4,
    			},
	        	{
		    		path: 'libs',
		    		name: 'libs',
		    		component: libs,
		    	},		    		        	
	        ]
	    },
	    {
    		path: '/preview',
    		name: 'preview',
    		component: Preview
    	}
    ]
})
