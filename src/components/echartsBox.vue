<template>
  <div ref='box' class="charts-box">
      {{options}}
  </div>
</template>
<script>
import echarts from 'Echarts';
export default {
  props:{
      options:{
          type: Object
      }
  },
  data(){
      return {
          
      }
  },
  computed:{
        chart: function(){
            return echarts.init(this.$refs.box)
        }
  },

  mounted(){
      let myChart = echarts.init(this.$refs.box);
      this.chart.setOption(this._props.options);
  },
  updated(){
      this.chart.clear();
      this.chart.setOption(this._props.options);
      
  }
}
</script>
<style>
    .charts-box{
        width: 400px;
        height: 400px;
    }
</style>


