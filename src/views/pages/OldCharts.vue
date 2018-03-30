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
                    <span>1&nbsp&nbsp指标名称：</span>
                    <div class="content1">{{indicatorsInfo.quotaName || '暂无'}}</div>  
                </div>
                <div class="paragraph">
                    <span>2&nbsp&nbsp指标类型：</span>
                    <div class="content1">{{indicatorsInfo.quotaTypeName || '暂无'}}</div>  
                </div>
                <div class="paragraph">
                    <div>
                        <span>3&nbsp&nbsp指标定义：</span>
                        <div class="content1">
                            <div v-for="definition in indicatorsInfo.quotaDefinitions">{{definition.quotaDefinitionName || '暂无'}}</div> 
                        </div>
                    </div>
                    <div class="nav">
                        <span>3.1&nbsp&nbsp分子：</span>
                        <div class="content1">{{indicatorsInfo.molecular || '暂无'}}</div>
                    </div>
                    <div class="nav">
                        <span>3.2&nbsp&nbsp分母：</span>
                        <div class="content1">{{indicatorsInfo.denominator || '暂无'}}</div>
                    </div> 
                    <div class="nav">
                        <span>3.3&nbsp&nbsp公式：</span>
                        <div class="content1">{{formula}}</div>
                    </div>   
                </div>
                <div class="paragraph">
                    <span>4&nbsp&nbsp检测项目分析报告：</span>
                    <div class="figure-wrapper" 
                      v-for='(indicatorTable, index) in indicatorsTable'>
                        <div class="shen-table pdf-pagination">
                            <div class="table-title">{{indicatorTable.tableName}}</div>
                            <div class="table-body-wrapper">                              
                                <table class="table-body" cellspacing="0" cellpadding="0">
                                    <thead>
                                        <tr>
                                            <th v-for="tableHeader in indicatorTable.columns">{{tableHeader.columnName}}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="tableRow in indicatorTable.rows">
                                            <td v-for="cellList in tableRow.cellList">{{cellList.cellValue}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div  v-if="indicatorTable.isSelected == 'y'">
                            <div class="echarts pdf-pagination" v-if="indicatorTable.imageType != '0'">
                                <IEcharts :option="charts[index]"></IEcharts>
                            </div>
                            <div
                              class="echarts pdf-pagination" 
                              v-for='(spreadChart, index) in spreadCharts[index]'
                              :key='index'>
                                <IEcharts :option="spreadChart"></IEcharts>
                            </div>
                        </div>                            
                    </div>                   
                </div>
                <div class="paragraph">
                    <span>5&nbsp&nbsp质量分析：</span>
                    <span v-if="qualityPics.length == 0">暂无</span>
                    <div v-else class="content1">
                        <img :src="qualityPic" v-for="qualityPic in qualityPics" />
                    </div>                 
                </div>
                <div class="paragraph">
                    <span>6&nbsp&nbsp原因分析：</span>
                    <span class="editors" v-html="reasonDOM"></span>
                </div>
                <div class="paragraph">
                    <span>7&nbsp&nbsp改进措施：</span>
                    <span class="editors" v-html="improveDOM"></span>
                </div>
                <div class="paragraph">
                    <span>8&nbsp&nbsp效果分析：</span>
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

    export default {
        components: {
            IEcharts
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
        beforeRouteEnter(to, from, next) {
            service.previewData(to.query.quotaId).then(res => {
                next(vm => {
                    ({
                       quotaBaseInfoDOs: [vm.indicatorsInfo],
                       quotaTables: vm.indicatorsTable,
                       quotaResultAnalysisDOs: [vm.indicatorsResult],
                    } = res.result);
                    vm.reasonDOM = vm.indicatorsResult.reasonAnalysis || '暂无';
                    vm.improveDOM = vm.indicatorsResult.improvementMeasure || '暂无';
                    vm.effectDOM = vm.indicatorsResult.effectiveAnalysis || '暂无文字说明';
                    if(vm.indicatorsResult){
                        let { qualityAnalysisFbzId, effectiveAnalysisFbzId } = vm.indicatorsResult
                        vm.loadPics(qualityAnalysisFbzId, vm.qualityPics);
                        vm.loadPics(effectiveAnalysisFbzId, vm.effectivePics);
                    };
                    vm.charts = vm.toBaseEChart(vm.indicatorsTable);
                    vm.charts.map(data => {
                        vm.spreadCharts.push(data.spreadType.map(item => {
                            return vm.toSpreadEChart(data, item);
                        }))                       
                    });
                })
            })
        },
        methods: {
            loadPics(str, pics) {
                if(!str){
                    return;
                };
                let arr = str.split(',');
                for(let id of arr) {
                    pics.push(`/getphotobyte?fileId=${id}`);
                }               
            },           
            // htmlToCanvas() {
            //     // let a = document.getElementsByTagName('canvas')[0];
            //     // let b = document.getElementsByTagName('canvas')[1];
            //     // a.style.background = '#fff';
            //     // b.style.background = '#fff';
            //     // let pageData = a.toDataURL('PNG', 1);
            //     // let pageData1 = b.toDataURL('PNG', 1);
            //     let pdf = new jspdf('', 'pt', 'a4');
            //     // pdf.addImage(pageData, 'PNG', 0,0,350,280);
            //     // pdf.addImage(pageData1, 'JPEG', 0,280,350,280);
            //     // pdf.save('test.pdf');
            //     html2canvas(document.getElementById('preview'), {
            //         onrendered: function(canvas) {
            //             // document.body.appendChild(canvas);
            //             let canvasWidth = canvas.width;
            //             let canvasHeight = canvas.height;
            //             console.log(canvasWidth, canvasHeight)
            //             let pageData2 = canvas.toDataURL('image/jpeg', 1);
            //             pdf.addImage(pageData2, 'JPEG', 0,0,595.28,592.28/canvasWidth*canvasHeight);
            //             // pdf.addImage(pageData, 'JPEG', 0,0,595.28,595.28/canvas.width*canvas.height);
            //             pdf.save('test.pdf');
            //         }
            //     });
            // },
            htmlToCanvas() {
                // let printStr = `<html><head><meta http-equiv='content-type' content='text/html; charset=utf-8'></head><body>`;
                // let content = '';
                // let str = document.getElementsByClassName('echarts')[0].innerHTML;
                // content = content + str;
                // str = document.getElementsByClassName('echarts')[1].innerHTML;
                // content = content + str;
                // printStr = printStr + content + "</body></html>";
                // let pwin = window.open("Print.htm", "print");
                // pwin.document.write(printStr);
                // pwin.document.close();
                this.pagination();
                // let a = document.getElementsByClassName('paragraph')[1];
                // a.setAttribute('class', 'paragraph pagination');
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