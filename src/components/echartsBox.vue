<template>
  <div class="charts-box" :data-option = "options" >
    <div class= "charts-controller" v-if="readonly">
      <span class="controller-icons">
        <i></i>
        <i></i>
        <i></i>
      </span>
      <ul v-if="controlAble">
        <li v-for="item in controllers" :key="item.index" @click="clickHandle(item.value)">
          {{item.label}}
        </li>
      </ul>
    </div>
    <div ref='box' class="charts-display"></div>
  </div>
</template>
<script>
import echarts from 'echarts';
export default {
  props:{
      optionsSourse:{
          type: Object,
      },
      changeHandle:{
          type: Function,
      } ,
      chartsUnit:{
          type: Object,
      } ,
      readonly:{
          type: Boolean,
      },
      finishedHandle:{
        type: Function,
      }
  },
  data(){
      return {
          chart:{},
          controlAble: true,
          controllers: [
            {
              value: 'transpose',
              label: '切换行/列'
            },
            {
              value: 'editorTitle',
              label: '修改标题'
            },
            // {
            //   value: 'editorLegend',
            //   label: '修改图例'
            // },
            {
              value: 'delete',
              label: '删除图表'
            },
          ]
      }
  },
  computed:{
    options:function(){
      let optionObj = {}
      try {
        optionObj = this.chartsUnit[this.optionsSourse.type].func(
          this.optionsSourse
        )
      } catch (error) {
        console.error(error)
      }
      return optionObj
    }
  },
  methods:{
    clickHandle(val){
      // hack 防止删除操作后 控制菜单依然显示
      this.controlAble = false
      this.changeHandle(val);
      setTimeout(()=>this.controlAble = true)
    }
  },
  mounted(){
    setTimeout(()=>{
      // 异步获取目标节点size
      this.chart = echarts.init(this.$refs.box)
      this.chart.setOption(this.options);
      this.chart.on('finished' ,()=>{
        if(JSON.stringify(this.chart.getOption) !== '{}'){
          this.finishedHandle&&this.finishedHandle()
        }
      })

    })
  },
  beforeUpdate(){
    this.chart.clear();
    this.chart.setOption({...this.options,...{animation:false}});
    
  },
  updated(){
  }
}
</script>
<style>
    .charts-box{
        width:100%;
        height:100%;
        text-align:left;
        position: relative;
    }
    .charts-box .charts-display{
        width:100%;
        height:100%;
    }
    .charts-box canvas{
        width: 100%;
        height: 100%;
    }
    .charts-controller{
        padding-bottom: 5px;
        display: inline-block;
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 1;
    }
    .controller-icons {
        display: inline-block;      
        height: 4px;
        line-height: 4px;
        cursor: pointer;
    }
    .controller-icons i{
        display: inline-block;
        width: 4px;
        height: 4px;
        border-radius: 50%; 
        background: #D8D8D8;
        margin-left: 3px;
        vertical-align: top;
    }
    .charts-controller ul{  
      display: none;
      position: absolute;
      /* overflow: hidden; */
      background: #ffffff;
      border: 1px solid #e8e8e8;
      box-shadow: 0 0 3px 0 #CCCCCC;
      -webkit-padding-start: 0;
      right: 0;
      top: 8px;
    }
    .charts-controller li{  
      width: 95px;
      height: 36px;
      line-height: 36px;
      display: inline-block;
      cursor: pointer;
      text-align: center;
      position: relative;
      z-index: 2;
      background: #fff;
      font-size: 1px;
      color: #666666;
    }
    .charts-controller li:hover{
      background: #FFFBE0;
      color: #333333;
    }
    .charts-controller:hover ul{
      display: inline-block;
    }
    .charts-controller ul::before{
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      display: block;
      top: -6px;
      right: 11px;
      border: 1px solid #e8e8e8;
      border-right: none;
      border-bottom: none;
      background: #fff;
      z-index: 1;
      transform: rotate(60deg) skew(30deg);
      box-shadow: 0 0 3px 0 #CCCCCC;
    }
</style>


