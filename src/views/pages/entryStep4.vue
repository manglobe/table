<template>
	<div>
		<div class="steps">
			<span class="step stepActive" @click="gotoStep(1)">1、定义指标</span>
			<span class="step stepActive" @click="gotoStep(2)"><span class="arrow arrowActive"></span>2、新增查检表</span>
			<span class="step stepActive" @click="gotoStep(3)"><span class="arrow arrowActive"></span>3、生成报表</span>
			<span class="step stepActive"><span class="arrow arrowActive"></span>4、分析结果</span>
		</div>				
		<div class="button-wrapper">
		    <el-button
			  size="large"
			  :disabled="loading"
			  @click="gotoStep(3)">上一步</el-button>
	    	<el-button
	    	  type="primary" 
	    	  size="large"
	    	  :disabled="loading"
	    	  @click="save">保 存</el-button>
	    </div>
	    <div class="entry-step entry-step-4">
	    	<div 
	    	  v-loading="loading" 
	    	  element-loading-text="拼命保存中"
	    	  style='width: 100%;height: 100%;'></div>
	        <div class="entry-step-inner">
		    	<div class="part">
		    		<div class="title">质量分析：</div>
		    		<el-upload
		    		  action='/file/upload'
		    		  :headers='headers'
		    		  :before-upload='beforeAvatarUpload'
		    		  :on-success='qualityAnalysisUploaded'
		    		  :on-remove="removeQualityAnalysisPic"
		    		  :file-list="filelist1"
		    		  list-type='picture'
		    		  multiple>
		    			<el-button type="primary">从文件中导入图片</el-button>
		    			<span slot='tip' class='el-upload_tip'>只支持jpg/png格式，最张不超过1MB，最多上传10张</span>
		    		</el-upload>
		    	</div>
		    	<div class="part">
		    		<div class="title">原因分析：</div>
		    		<quill-editor		    		 
		    		 v-model='oldResult.reasonAnalysis'
		    		 :options="editorOption"></quill-editor>
		    	</div>
		    	<div class="part">
		    		<div class="title">改进措施：</div>
		    		<quill-editor		    		 
		    		 v-model='oldResult.improvementMeasure'
		    		 :options="editorOption"></quill-editor>
		    	</div>
		    	<div class="part">
		    		<div class="title">效果分析：</div>
		    		<el-upload
		    		  action='/file/upload'
		    		  :headers='headers'
		    		  :before-upload='beforeAvatarUpload'
		    		  :on-success='effectiveAnalysisUploaded'
		    		  :on-remove="removeEffectiveAnalysisPic"
		    		  :file-list="filelist2"
		    		  list-type='picture'
		    		  multiple>
		    			<el-button type="primary">从文件中导入图片</el-button>
		    			<span slot='tip' class='el-upload_tip'>只支持jpg/png格式，最张不超过1MB，最多上传10张</span>
		    		</el-upload>
		    		<quill-editor
		    		 style="margin-top: 20px;"		    		 
		    		 v-model='oldResult.effectiveAnalysis'
		    		 :options="editorOption"></quill-editor>
		    	</div>
	    	</div>
	    </div>
	</div>
</template>

<script>
    import { quillEditor } from 'vue-quill-editor';
    import service from '@/service/service';
	import handleObject from '@/util/handleObject';

	export default {
		data() {
			return {
				tempData: {},
				reason: '',
				improve: '',
				result: '',
				loading: false,
				qualityAnalysisUid: [],
				effectiveAnalysisUid: [],
				qualityIsClicked: false,
				effectIsClicked: false,
				filelist1: [],
				filelist2: [],
				oldResult: {
					effectiveAnalysis: '',
					effectiveAnalysisFbzId: '',
					improvementMeasure: '',
					qualityAnalysisFbzId: '',
					reasonAnalysis: '',
				},
				editorOption: {
					// theme: 'bubble',
					placeholder: '请输入内容',
					modules: {
						toolbar: [
							['bold','italic','underline','strike'],
							['blockquote', 'code-block'],
							[{'header': 1}, {'header': 2}],
							[{'list':'ordered'},{'list':'bullet'}],
							[{'script': 'sub'}, {'script': 'super'}],
							[{'indent': '-1'},{'indent': '+1'}],
							[{'direction': 'rtl'}],
							[{'size': ['small', false, 'large', 'huge']}],
							[{'header':[1,2,3,4,5,6,false]}],
							[{'color':[]},{'background':[]}],
							[{'font':[]}],
							[{'align':[]}],
						]
					}				
				},
				headers: {
					'Accept': 'application/json, text/plain, */*',
					// 'X-XSRF-TOKEN': 'f2f4ccc2-04bd-48c4-b575-2e63bab47dea',
					'X-XSRF-TOKEN': this.$store.state.csrf['X-XSRF-TOKEN'],
				},							
			}	
		},
		computed: {
			qualityAnalysisFbzId() {
				return this.oldResult.qualityAnalysisFbzId ? this.oldResult.qualityAnalysisFbzId.split(',') : [];
			},
			effectiveAnalysisFbzId() {
				return this.oldResult.effectiveAnalysisFbzId ? this.oldResult.effectiveAnalysisFbzId.split(',') : [];
			},
		},
		beforeRouteEnter(to, from, next) {
			if(to.query.isEdit) {
				service.getOldResult(to.query.quotaId).then(res => {
					next(vm => {
						if(res.responseData){
							vm.oldResult = handleObject.deepClone(res.responseData);
							if(vm.oldResult.qualityAnalysisFbzId != '') {
								vm.filelist1 = vm.oldResult.qualityAnalysisFbzId.split(',').map(data => {
									return {
										url: `/getphotobyte?fileId=${data}`,
									}
								});
							}
							if(vm.oldResult.effectiveAnalysisFbzId != '') {
								vm.filelist2 = vm.oldResult.effectiveAnalysisFbzId.split(',').map(data => {
									return {
										url: `/getphotobyte?fileId=${data}`,
									}
								});
							}
						}
					})
				})
			}else {
				next();
			}		
		},
		methods: {
			gotoStep(num) {
				let query = this.$route.query.isEdit ? Object.assign({quotaId: this.$route.query.quotaId},{isEdit:this.$route.query.isEdit}) : {quotaId: this.$route.query.quotaId};
				this.$router.push({
					name: `entryStep${num}`,
					query,
				});
			},
			save() {
				let params = {
					effectiveAnalysis: this.oldResult.effectiveAnalysis,
                    effectiveAnalysisFbzId: this.effectiveAnalysisFbzId.join(','),
					improvementMeasure: this.oldResult.improvementMeasure,
					qualityAnalysisFbzId: this.qualityAnalysisFbzId.join(','),
					quotaId: this.$route.query.quotaId,
					reasonAnalysis: this.oldResult.reasonAnalysis,
				}
				this.loading = true;
				if(this.$route.query.isEdit) {
					this.$service.saveOldEntryInfo(params).then(res => {
						if(res.responseCode == '0') {
							this.$message.success('保存成功！')
							this.$router.push({
								path: '/indicator/libs',
							});
						}
						this.loading = false;
					})
				}else {
					this.$service.saveNewEntryInfo(params).then(res => {
						if(res.responseCode == '0') {
							this.$message.success('保存成功！')
							this.$router.push({
								path: '/indicator/libs',
							});
						}
						this.loading = false;
					})
				}				
			},
			//质量分析图片上传成功回掉函数
			qualityAnalysisUploaded(res, file, fileList) {
				if(res.responseCode == 0 && res.code == 0) {
					this.$message.success(res.responseMessage);				
				}else {
					this.$message.error(res.responseMessage);
					return;
				}
				fileList.map(data => {
					if(!this.qualityAnalysisUid.includes(data.uid)) {
						this.qualityAnalysisUid.push(data.uid);
					}					
				})
				this.qualityAnalysisFbzId.push(res.results.fileId);	
				this.qualityIsClicked = true;
			},
			removeQualityAnalysisPic(file, fileList) {
				if(this.qualityIsClicked) {
					let index = this.qualityAnalysisUid.indexOf(file.uid);
					this.qualityAnalysisFbzId.splice(index, 1);
					this.qualityAnalysisUid.splice(index, 1);
				}else {
					for(let i = 0; i < this.qualityAnalysisFbzId.length; i ++) {
						if(this.qualityAnalysisFbzId[i] == file.url.substr(-32)) {
							this.qualityAnalysisFbzId.splice(i ,1);
						}			
					}
				}					
			},
			beforeAvatarUpload(file) {
				const isPIC = file.type == 'image/jpeg' || file.type == 'image/png';
				const isLt1M = file.size/1024/1024 < 1;
				if(!isPIC) {
					this.$message.error('上传图片只能是jpg/jpeg/png格式！');
				}
				if(!isLt1M) {
					this.$message.error('上传图片大小不能超过1MB！');
				}
				return isPIC && isLt1M;
			},
			//效果分析图片上传成功回掉函数
			effectiveAnalysisUploaded(res, file, fileList) {
				if(res.responseCode == 0 && res.code == 0) {
					this.$message.success(res.responseMessage);					
				}else {
					this.$message.error(res.responseMessage);
					return;
				};
			    fileList.map(data => {
					if(!this.effectiveAnalysisUid.includes(data.uid)) {
						this.effectiveAnalysisUid.push(data.uid);
					}					
				})
				this.effectiveAnalysisFbzId.push(res.results.fileId);
				this.effectIsClicked = true;	
			},
			removeEffectiveAnalysisPic(file) {
				if(this.effectIsClicked) {
					let index = this.qualityAnalysisUid.indexOf(file.uid);
					this.effectiveAnalysisFbzId.splice(index, 1);
					this.effectiveAnalysisUid.splice(index, 1);
				}else {
					for(let i = 0; i < this.effectiveAnalysisFbzId.length; i ++) {
						if(this.effectiveAnalysisFbzId[i] == file.url.substr(-32)) {
							this.effectiveAnalysisFbzId.splice(i ,1);
						}			
					}
				}				
			},
		},
		components: {
			quillEditor,
		}
	}
</script>

<style rel="stylesheet/scss" lang="scss">
    .entry-step-4 {
	    top: 90px;
	    bottom: 85px;
	    .entry-step-inner {
	    	position: absolute;
		    top: 0;
		    bottom: 0;
		    overflow: auto;
		    left: 0;
		    right: 0;
		    background: #fff;
		    padding: 0 45px;
		    padding-top: 30px;
	    }
	    .part {
	    	margin-bottom: 25px;
	    	.title {
	    		font-size: 16px;
			    margin-bottom: 15px;
	    	}
	    	.el-upload_tip {
	    		margin-left: 15px;
	    	}
	    }
	    .el-upload-list__item {
	    	display: inline-block;
		    width: 300px;
		    margin-right: 20px;
	    }
	    .ql-container {
	    	min-height: 150px;
	    	.ql-editor {
	    		min-height: 150px;
    		    font-family: Microsoft YaHei!important;
    		    font-size: 14px!important;
	    	}
	    }
	    .el-upload-list--picture .el-upload-list__item-thumbnail	 {
	    	width: 270px!important;
	    }
    }
</style>