<template>
<div ref='box' class="charts-display" :data-option = "options"></div>
</template>
<script>
import echarts from 'echarts';
export default {
  props:{
      options:{
        type: Object,
      },
      finishedHandle:{
        type: Function,
      },
      legendHandle:{
        type: Function,
      },
  },
  data(){
      return {
          chart:{},
      }
  },
  computed:{
  },
  methods:{
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
      this.chart.on('legendselectchanged', (params)=>{
        this.legendHandle(params)
      })
    })
  },
  beforeUpdate(){
    this.chart.clear();
    this.chart.setOption({...this.options,...{animation:false}});
  },
}
</script>


