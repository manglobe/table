<template>
  <div class="charts-box">
    <!-- <div class= "charts-controller" v-if="editMode">
      <span @click="save">保存</span>
      <span @click="cancel">取消</span>
    </div>
    <div v-if="!editMode">
        <span  @click="editor">编辑</span>
        <span  @click="del">删除</span>
    </div> -->
    <div class= "charts-editor" v-if="!readonly">
      <span class="editor-icons" >
        <i></i>
        <i></i>
        <i></i>
      </span>
      <ul>
        <li v-for="item in controllers" :key="item.index" @click="clickHandle(item.value)">
          {{item.label}}
        </li>
      </ul>
    </div>
    <ChartView :options="options"
        :legendHandle="legendHandle" 
        >
    </ChartView>
  </div>
</template>
<script>
import echarts from 'echarts';
import ChartView from './chartView';
export default {
    components:{ChartView},
    props:{
      readonly:{
        type: Boolean,
      },
      optionsSourse:{
        type: Object,
      },
      onChange:{
        type: Function,
      }
  },
  data(){
      return {
          controllers: [
            {
              value: 'transpose',
              label: '切换行/列'
            },
            {
              value: 'editorTitle',
              label: '修改标题'
            },
            {
              value: 'editorLegend',
              label: '修改图例'
            },
            {
              value: 'editorXaxis',
              label: '修改横坐标'
            },
          ]
      }
  },
  computed:{
    options:function(){
      let optionObj = {}
    //   try {
    //     optionObj = this.optionsSourse.optionObj ||this.chartsUnit[this.optionsSourse.type].func(
    //       this.optionsSourse
    //     )
    //   } catch (error) {
    //     console.error(error)
    //   }
      return this.optionsSourse.optionObj || {}
    }
  },
  methods:{
    clickHandle(val){
      this[val]();
      this.onChange(this.options)
    },
    transpose(){

    },
    editorTitle(){},
    editorLegend(){},
    editorXaxis(){},

    legendHandle(){},
  },
}
</script>
<style rel="stylesheet/scss" lang="scss">
  .charts-box{
      width:100%;
      height:100%;
      text-align:left;
      position: relative;
    .charts-display,canvas{
      width:100%;
      height:100%;
    }
  }
  .charts-controller{
    display: block;

  }
  .charts-editor{
      padding-bottom: 5px;
      display: inline-block;
      position: absolute;
      right: 20px;
      top: 20px;
      z-index: 1;
      ul{  
        display: none;
        position: absolute;
        /* overflow: hidden; */
        background: #ffffff;
        border: 1px solid #e8e8e8;
        box-shadow: 0 0 3px 0 #CCCCCC;
        -webkit-padding-start: 0;
        right: 0;
        top: 8px;
        &::before{
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
      }
      li{  
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
        &:hover{
          background: #FFFBE0;
          color: #333333;
        }
      }
      
      &:hover ul{
        display: inline-block;
      }
  }
  .editor-icons {
      display: inline-block;      
      height: 4px;
      line-height: 4px;
      cursor: pointer;
    i{
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 50%; 
      background: #D8D8D8;
      margin-left: 3px;
      vertical-align: top;
    }
  }
  
    
    
</style>


