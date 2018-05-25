<template>
  <div class="charts-box" 
  :class="{
    'title-editing':showTitleEditor,
    'xAxis-editing':showXaxisEditor,
    'legend-editing':showLegendEditor,
    }">
    <div class="chart-layer" v-if="showLayer" @click="quitLayer"  @mousedown="e=>e.stopPropagation()"></div>
    <!-- 标题 -->
    <div
      class="chart-layer-editor"
      @mousedown="e=>e.stopPropagation()"
    >
      <div class="point" v-if="showLegendEditor">
        图例的修改，请使用英文 " ; " 区别各个字段
      </div>
      <div class="point" v-if="showXaxisEditor">
        横坐标的修改，请使用英文 " ; " 区别各个字段
      </div>
   
      <textarea
        type="text" 
        :value="editingValue" 
        autofocus
        @keydown="e=>titleEditorKeydownHandle(e)"
        @input="chartEditorCacheValue= $event.target.value"
      />
      <i class="el-icon-close" title="取消" @click="()=>quitChartEditor()"></i>
      <i class="el-icon-check" title="保存" @click="()=>quitChartEditor(true)"></i>
    </div>


    <div class= "charts-editor" v-if="!readonly">
      <span class="editor-icons" >
        <i></i>
        <i></i>
        <i></i>
      </span>
      <ul>
        <li v-for="item in controllers" :key="item.index" @click="e=>clickHandle(e,item.value)">
          {{item.label}}
        </li>
      </ul>
    </div>
    <ChartView :options="options"
        :legendHandle="legendHandle" 
        >
    </ChartView>

    <!-- 次坐标系 -->
    <div class="chart-secAxis-editor" v-if="showSecAxisEditor" @mousedown="e=>e.stopPropagation()">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedLegends" @change="handleCheckedLegendsChange">
          <el-checkbox v-for="item in legends" :label="item" :key="item">{{item}}</el-checkbox>
        </el-checkbox-group>
    </div> 
  </div>
</template>
<script>
import echarts from 'echarts';
import ChartView from './chartView';
import { excelCharts } from "../excelPlugins";

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
      },
  },
  data(){
      return {
        cacheOptionsSourse:{},
        showLayer: false,
        editingType:'',
        chartEditorCacheValue:'',

        showTitleEditor: false,

        showLegendEditor: false,

        showXaxisEditor: false,

        showSecAxisEditor: false,
        checkAll: true,
        checkedLegends: [],
        isIndeterminate: true,
      }
  },
  computed:{
    options: function(){
      const chartDatas = excelCharts[this.cacheOptionsSourse.type].func(this.cacheOptionsSourse)
      return chartDatas
    },
    legends: function(){
      return this.options.legend.data
    },
    editingValue: function(){
      switch(this.editingType){
        case 'title':
          return this.cacheOptionsSourse.title;
        case 'legend':
          return this.options.legend.data.join(';')
        case 'xAxis':
          return this.options.xAxis.data?this.options.xAxis.data.join(';'):this.options.xAxis[0].data.join(';')
      }
    },
    controllers:function(){
      switch(this.cacheOptionsSourse.type){
        case "pie":[
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
        ]
        return 
        case "pareto":
        return [
          {
            value: 'transpose',
            label: '切换行/列'
          },
          {
            value: 'editorTitle',
            label: '修改标题'
          },
          {
            value: 'editorXaxis',
            label: '修改横坐标'
          },
        ]
        default :
        return [
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
          {
            value: 'setSecAxis',
            label: '指定次坐标系'
          },
        ]
      }
    }
  },
  watch:{
    optionsSourse:function(newQuestion, oldQuestion){
      this.cacheOptionsSourse = newQuestion
    },
    cacheOptionsSourse:function(newQuestion, oldQuestion){
      this.onChange&&this.onChange(newQuestion)
    },
    checkedLegends: function(newQuestion, oldQuestion){
      this.cacheOptionsSourse = {
        ...this.cacheOptionsSourse,
        ...{
          secLegends: newQuestion
        }
      }
    }
  },
  methods:{
    clickHandle(e,val){
      e.stopPropagation();
      this[val]();
    },

    // 转置
    transpose(){
      this.cacheOptionsSourse= {
        ...this.cacheOptionsSourse,
        ...{transpose : !this.cacheOptionsSourse.transpose,
            legend: undefined,
            xAxis: undefined,
        }
      }
    },

    // 退出所有编辑
    quitLayer(){
      this.quitChartEditor()
    },
    quitChartEditor(save){


      switch (this.editingType) {
        case 'title':
            this.quiteTitleEditor(save)
          break;
      
        case 'legend':
            this.quiteLegendEditor(save)
          break;

        case 'xAxis':
            this.quiteXaxisEditor(save)
          break;
      
        default:
          break;
      }
      this.showLayer = false;
      this.showSecAxisEditor = false;
      this.showLegendEditor = false;
      this.showXaxisEditor = false;
      this.chartEditorCacheValue = '';

    },
    titleEditorKeydownHandle(e){
      if(e.keyCode===13){
        this.quitChartEditor(true)
      }
      if(e.keyCode===27){
        this.quitChartEditor()
      }
    },

    // 修改标题
    editorTitle(){
      this.showLayer = true
      this.showTitleEditor = true
      this.editingType = 'title'
    },
    quiteTitleEditor(save){
      if(save&&this.chartEditorCacheValue){
        if(this.chartEditorCacheValue.length === 0){
          this.$alert(
            this.$createElement('p',  {class:"confirm-message" }, [
              this.$createElement('svg', null, [
                this.$createElement('use', {attrs:{'xlink:href':'#icon-zhuyi'}},null)
              ]),
              this.$createElement('span', null, '图表名称不能为空!')
            ]),
            "",
            {
              confirmButtonText: "确定"
            }
          );
          return false
        }
        this.cacheOptionsSourse= {
          ...this.cacheOptionsSourse,
          ...{title: this.chartEditorCacheValue}
        }
      }
      this.showTitleEditor = false
    },

    // 修改图例
    editorLegend(){
      this.showLayer = true
      this.showLegendEditor = true
      this.editingType = 'legend'
    },
    quiteLegendEditor(save){
      if(save&&this.chartEditorCacheValue){
        this.cacheOptionsSourse= {
          ...this.cacheOptionsSourse,
          ...{legend: this.chartEditorCacheValue}
        }
      }
    },

    // 修改横坐标
    editorXaxis(){
      this.showLayer = true
      this.showXaxisEditor = true
      this.editingType = 'xAxis'

    },
    quiteXaxisEditor(save){
      if(save&&this.chartEditorCacheValue){
        this.cacheOptionsSourse= {
          ...this.cacheOptionsSourse,
          ...{xAxis: this.chartEditorCacheValue}
        }
      }
    },

    // 指定次坐标系
    setSecAxis(){
      this.showLayer = true
      this.showSecAxisEditor = true
    },
    handleCheckAllChange(checkAll) {
      this.checkedLegends = checkAll ? this.legends : [];
      this.isIndeterminate = false;
    },
    handleCheckedLegendsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.legends.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.legends.length;
    },

    legendHandle(){},
  },
  created(){
    this.cacheOptionsSourse = this.optionsSourse
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
  .charts-box{
      width:100%;
      height:100%;
      text-align:left;
      position: relative;
      overflow: hidden;
    .charts-display,canvas{
      width:100%;
      height:100%;
    }

    .chart-layer{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2;
      cursor: default;
    }
    .chart-layer-editor{
      position: absolute;
      opacity: 0;
      top: 16px;
      width: 60%;
      left: 0;
      right: 0;
      margin: auto;
      z-index: 3;
      transform: translate(0,-150%);
      display: flex;
      align-items: center;
      flex-wrap:wrap;
      justify-content:space-around;
      .point{
        color:#fff;
        padding-bottom:5px;
        font-size: 14px;
      }
      textarea{
        resize: none;
        box-sizing:border-box;
        -webkit-appearance: none;
        background-color: #eaeaea;
        background-image: none;
        box-sizing: border-box;
        color: rgb(31, 45, 61);
        display: block;
        font-size: inherit;
        height: 28px;
        width: 100%;
        border-radius: 4px;
        border: 1px solid #06AEA6;
        box-shadow: 0 0 3px #06Aea6;
        border-image: initial;
        outline: none;
        padding: 3px 10px;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

      }
      .el-icon-close, .el-icon-check{
        width: 36px;
        height: 36px;
        display: inline-block;
        margin: 0 5px;
        line-height: 36px;
        cursor: pointer;
        color: #06aea6;
      }
      .el-icon-close{
        color: #aaa;
      }
  
    }
    &.title-editing{
      .chart-layer-editor{
        display: flex;
        opacity: 1;
        transform: translate(0,0);
        transition: 0.6s;
      }
    }
    &.legend-editing{
       .chart-layer-editor{
        display: flex;
        opacity: 1;
        transform: translate(0,-50%);
        transition: 0.6s;
        top: 50%;
        textarea{
          height: 72px;
          display: block;
          width: 100%;
        }
      }
    }
    &.xAxis-editing{
      .chart-layer-editor{
        display: flex;
        opacity: 1;
        transform: translate(0,-50%);
        transition: 0.6s;
        top: 50%;
        textarea{
          height: 72px;
          display: block;
          width: 100%;
        }
      }
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
      top: 15px;
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
  .chart-secAxis-editor{
    position: absolute;
    padding: 10px 10px;
    box-sizing: border-box;
    display: inline-block;
    left: 50%;
    top: 50%;
    z-index: 10;
    background: #fff;
    transform: translate(-50%, -50%);
    width: 90%;
    span{
      color: #666;
      vertical-align:text-bottom;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &>label{
      margin-bottom: 5px;
      margin-left: 5px;
      color: #333;
    }
    .el-checkbox-group{
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      label{
        margin: 5px 5px 0;
      }
    }
    .is-checked+.el-checkbox__label{
      color: #333
    }

  }
    
    
</style>


