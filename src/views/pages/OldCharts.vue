<template>
    <div class="gray-wrap">
        <div class="preview" id="preview"> 
            <br>
            <br>
            <br>
            <br>                        
            <div class="header">
            树兰（杭州）医院<br>医院质量指标检测报告
            <span @click="htmlToCanvas" class="noprint print-btn">打印</span> 
            </div>
            <div class="body">
                <div class="paragraph">
                    <span>1&nbsp;&nbsp;指标名称：</span>
                    <div class="content1">{{indicatorsInfo.quotaName || '暂无'}}</div>  
                </div>
                <div class="paragraph">
                    <span>2&nbsp;&nbsp;指标类型：</span>
                    <div class="content1">{{indicatorsInfo.quotaTypeName || '暂无'}}</div>  
                </div>
                <div class="paragraph">
                    <div>
                        <span>3&nbsp;&nbsp;指标定义：</span>
                        <div class="content1">
                            <div v-for="definition in indicatorsInfo.quotaDefinitions">{{definition.quotaDefinitionName || '暂无'}}</div> 
                        </div>
                    </div>
                    <div class="nav">
                        <span>3.1&nbsp;&nbsp;分子：</span>
                        <div class="content1">{{indicatorsInfo.molecular || '暂无'}}</div>
                    </div>
                    <div class="nav">
                        <span>3.2&nbsp;&nbsp;分母：</span>
                        <div class="content1">{{indicatorsInfo.denominator || '暂无'}}</div>
                    </div> 
                    <div class="nav">
                        <span>3.3&nbsp;&nbsp;公式：</span>
                        <div class="content1">{{formula}}</div>
                    </div>   
                </div>
                <div class="paragraph">
                    <span>4&nbsp;&nbsp;检测项目分析报告：</span>
                    <div 
                    style="padding:20px 0"    
                    v-for='(indicatorTable, index) in indicatorsTable'                       
                    :key="index">
                        <web-excel 
                        :editorAble="false"
                        :key="index"
                        :prop-table="indicatorTable"
                        :id="index"
                        :allChartsFinished = "allChartsFinished"></web-excel>   
                    </div>                   
                </div>
                <div class="paragraph">
                    <span>5&nbsp;&nbsp;质量分析：</span>
                    <span class="editors" v-html="resultDom"></span>                 
                </div>
                <div class="paragraph">
                    <span>6&nbsp;&nbsp;原因分析：</span>
                    <span class="editors" v-html="reasonDOM"></span>
                </div>
                <div class="paragraph">
                    <span>7&nbsp;&nbsp;改进措施：</span>
                    <span class="editors" v-html="improveDOM"></span>
                </div>
                <div class="paragraph">
                    <span>8&nbsp;&nbsp;效果分析：</span>
                    <div class="content1" v-if="effectivePics.length == 0 && effectDOM == ''">暂无</div>                  
                    <div class="content1">
                        <img :src="effectivePic" v-for="effectivePic in effectivePics" />
                        <span class="editors" v-html="effectDOM"></span>
                    </div>                                                           
                </div>  
            </div>
        </div>       
    </div>
</template>

<script>
    // import IEcharts from 'vue-echarts-v3';
    // import vSchart from 'vue-schart';
    // import IEcharts from 'vue-echarts-v3/src/full.vue';
    // import html2canvas from 'html2canvas';
    // import jspdf from 'jspdf';
    // import jsPDF from '@/assets/libs/jspdf.min.js';
    import IEcharts from 'vue-echarts-v3/src/lite.js';
    import service from '@/service/service';
    import EchartsBox from '@/components/echartsBox';
    import webExcel from "@/components/webExcel";

    export default {
        props:{
            previewData:{
                type: [Object, Boolean]
            },
            updatedCallBack:{
                type: Function
            }
        },
        components: {
            IEcharts, EchartsBox,webExcel
        },
        data() {          
            return {
                indicatorsInfo: '',
                indicatorsTable: [],
                indicatorsResult: '', 
                charts: [], 
                spreadCharts: [],
                qualityPics: [],
                effectivePics: [],
                resultDom: '',
                reasonDOM: '',
                improveDOM: '',
                effectDOM: ''   

            }
        },
        computed: {
            formula() {
                return `${this.indicatorsInfo.molecular} / ${this.indicatorsInfo.denominator} * ${this.indicatorsInfo.percentage} ${this.indicatorsInfo.formulaUnits}`
            },
        },
        watch:{
            previewData:function(next, prev){
                if(next){
                    ({
                       quotaBaseInfoDOs: [this.indicatorsInfo],
                       quotaTables: this.indicatorsTable,
                       quotaResultAnalysisDOs: [this.indicatorsResult],
                    } = next);
                    this.resultDom = (this.indicatorsResult&&this.indicatorsResult.reasonAnalysis&&JSON.parse(this.indicatorsResult.reasonAnalysis).resultAnalysis) || '暂无';
                    this.reasonDOM = (this.indicatorsResult&&this.indicatorsResult.reasonAnalysis&&JSON.parse(this.indicatorsResult.reasonAnalysis).reasonAnalysis) || '暂无';
                    this.improveDOM =this.indicatorsResult&&this.indicatorsResult.improvementMeasure || '暂无';
                    this.effectDOM = this.indicatorsResult&&this.indicatorsResult.effectiveAnalysis || '暂无文字说明';
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            service.previewData({quotaIds:to.query.quotaId}).then(res => {
                next(vm => {
                    ({
                       quotaBaseInfoDOs: [vm.indicatorsInfo],
                       quotaTables: vm.indicatorsTable,
                       quotaResultAnalysisDOs: [vm.indicatorsResult],
                    } = res.result[0]);
                    vm.resultDom = (vm.indicatorsResult.reasonAnalysis&&JSON.parse(vm.indicatorsResult.reasonAnalysis).resultAnalysis) || '暂无';
                    vm.reasonDOM = (vm.indicatorsResult.reasonAnalysis&&JSON.parse(vm.indicatorsResult.reasonAnalysis).reasonAnalysis) || '暂无';
                    vm.improveDOM = vm.indicatorsResult.improvementMeasure || '暂无';
                    vm.effectDOM = vm.indicatorsResult.effectiveAnalysis || '暂无文字说明';
                })
            })
        },
        methods: {
            htmlToCanvas() {
                this.pagination();
                window.print();
            },
            pagination() {
                let a4 = 1500;
                let pdfPaginations = document.getElementsByClassName('pdf-pagination');
                let presentTop = 0;
                for(let i = 0; i < pdfPaginations.length; i ++){
                   if((a4 - (pdfPaginations[i].offsetTop - presentTop)) <= pdfPaginations[i].offsetHeight){
                        presentTop = pdfPaginations[i].offsetTop;
                        pdfPaginations[i-1].className = `${pdfPaginations[i-1].className} pagination`;
                    } 
                }               
            },
            allChartsFinished(){
                this[Symbol.for('allChartsFinished')] = this[Symbol.for('allChartsFinished')] || 0;
                this[Symbol.for('allChartsFinished')] ++
                if(this[Symbol.for('allChartsFinished')] === this.indicatorsTable.length){
                    if(this.previewData){
                        this.updatedCallBack(document.getElementById('preview'))
                    }
                    this[Symbol.for('allChartsFinished')] = 0
                }
            }
        },
        updated(){
            if(this.previewData&& this.indicatorsTable.length === 0){
                this.updatedCallBack(document.getElementById('preview'))
            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss">
    .gray-wrap {
        width: 100%;
        height: 100%;
        padding: 0px;
        margin: 0px;
        background-color: #f0f0f0;
        .preview {
            width: 1000px;
            margin: 0 auto;
            padding: 0px 50px;
            height: 100%;
            background-color: #fff;
            .header {
                font-size: 22px;
                text-align: center;
                margin-bottom: 30px;
                position: relative;
                .print-btn {
                    position: absolute;
                    right: 0;
                    top: 0;
                    font-size: 16px;
                    text-decoration: underline;
                    cursor: pointer;
                }
            }
            .body {
                font-size: 16px;
                .paragraph {
                    margin-bottom: 20px;
                    .content1 {
                        display: inline-block;
                        width: 888px;
                        vertical-align: text-top;
                    }
                    .nav {
                        padding-left: 19px;
                        margin-top: 20px;
                    }
                    .shen-table {
                        width: 90%;
                        margin: 0px auto;
                        overflow: auto;
                        .table-title {
                            text-align: center;
                            font-weight: normal ;
                            margin-bottom: 20px;
                        }                      
                        .table-header, .table-body {
                            border-collapse: collapse!important;
                            width: 100%;
                            box-sizing: border-box;
                            border: 1px solid rgb(223, 236, 236);
                            th,td {
                                box-sizing: border-box;
                                border: 1px solid rgb(223, 236, 236);
                                padding: 5px;
                                min-width: 80px;
                                text-align: center;
                                font-weight: normal!important;
                            }
                        }
                    }
                    .editors {
                        display: inline-block;
                        width: 890px;
                        vertical-align: text-top;
                        p {
                            margin-top: 0;
                            margin-bottom: 10px;
                            line-height: 1.5;
                        }
                    }
                    .echarts {
                        width: 700px;
                        height: 300px;
                        margin: 0 auto;
                        // margin-top: 20px;
                    }
                    .pdf-pagination {
                        padding-top: 40px;
                    }
                    img {
                        width: 400px;
                        // height: 200px;
                        display: block;
                        margin-bottom: 15px;
                    }
                }               
            }           
        }
    }
    .pagination {
        page-break-after:always;
    }
</style>