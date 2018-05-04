<template>
	<div>
		<div class="steps">
			<span class="step stepActive" @click="gotoStep(1)">1、定义指标</span>
			<span class="step stepActive" @click="gotoStep(2)"><span class="arrow arrowActive"></span>2、新增查检表</span>
			<span class="step stepActive"><span class="arrow arrowActive"></span>3、分析结果</span>
			<!-- <span class="step stepActive" @click="gotoStep(3)"><span class="arrow arrowActive"></span>3、生成报表</span>
			<span class="step stepActive"><span class="arrow arrowActive"></span>4、分析结果</span> -->
		</div>				
		<div class="button-wrapper">
		    <el-button
			  size="large"
			  :disabled="loading"
			  @click="gotoStep(2)">上一步</el-button>
	    	<el-button
	    	  type="primary" 
	    	  size="large"
	    	  :disabled="loading"
	    	  @click="save">保 存</el-button>
	    </div>
	    <div class="entry-step entry-step-4">
			<el-upload
				action='/api/file/upload'
				:headers='headers'
				:before-upload='beforeUpload'
				:on-success='uploadedCallback'
				>
				<el-button ref='imgUpload' type="primary">从文件中导入图片</el-button>
			</el-upload>
	    	<div 
	    	  v-loading="loading" 
	    	  element-loading-text="拼命保存中"
	    	  style='width: 100%;height: 100%;'></div>
	        <div class="entry-step-inner">
		    	<div class="part">
		    		<div class="title">结果分析</div>
					<quill-editor	
						ref='editor' 
						v-model='oldResult.resultAnalysis'
						:options="editorOption"></quill-editor>
		    	</div>
		    	<div class="part">
		    		<div class="title">原因分析：</div>
		    		<quill-editor	
						ref='editor2'  		 
						v-model='oldResult.reasonAnalysis'
						:options="editorOption"></quill-editor>
		    	</div>
		    	<div class="part">
		    		<div class="title">改进措施：</div>
		    		<quill-editor	
						ref='editor3'  		 	    		 
		    		 	v-model='oldResult.improvementMeasure'
		    		 	:options="editorOption"></quill-editor>
		    	</div>
		    	<div class="part">
		    		<div class="title">效果分析：</div>
		    		<quill-editor
						style="margin-top: 20px;"
						ref='editor4'  		 
						v-model='oldResult.effectiveAnalysis'
						:options="editorOption"></quill-editor>
		    	</div>
	    	</div>
	    </div>
	</div>
</template>

<script>
	import 'quill/dist/quill.core.css'
	import 'quill/dist/quill.snow.css'
	import 'quill/dist/quill.bubble.css'
    import def, { quillEditor } from 'vue-quill-editor';
    import service from '@/service/service';
	import handleObject from '@/util/handleObject';
	// https://github.com/quilljs/quill/issues/1857 allow image to show every type urls
	// let Image = def.Quill.import('formats/image');
	// Image.match = function(url) { /* ... */ };
	// Image.sanitize = function(url) {return url }

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
				effectIsClicked: false,
				filelist1: [],
				filelist2: [],
				oldResult: {
					resultAnalysis:'',
					effectiveAnalysis: '',
					// effectiveAnalysisFbzId: '',
					improvementMeasure: '',
					// qualityAnalysisFbzId: '',
					reasonAnalysis: '',
				},
				editorOption: {
					// theme: 'bubble',
					placeholder: '请输入内容',
					modules: {
						toolbar:
						[
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
							['image'],
						],
						
					}				
				},
				headers: {
					'Accept': 'application/json, text/plain, */*',
					'X-XSRF-TOKEN': 'c3a26c4a-6493-443e-a61e-48e92d68d077',
					// 'X-XSRF-TOKEN': this.$store.state.csrf['X-XSRF-TOKEN'],
				},							
			}	
		},
		computed: {
			// qualityAnalysisFbzId() {
			// 	return this.oldResult.qualityAnalysisFbzId ? this.oldResult.qualityAnalysisFbzId.split(',') : [];
			// },
			// effectiveAnalysisFbzId() {
			// 	return this.oldResult.effectiveAnalysisFbzId ? this.oldResult.effectiveAnalysisFbzId.split(',') : [];
			// },
		},
		beforeRouteEnter(to, from, next) {
			console.log(to)
			if(to.query.isEdit) {
				service.getOldResult(to.query.quotaId).then(res => {
					next(vm => {
						if(res.responseData){
							let midObj =  handleObject.deepClone(res.responseData)
							midObj.resultAnalysis = JSON.parse(midObj.reasonAnalysis).resultAnalysis
							midObj.reasonAnalysis = JSON.parse(midObj.reasonAnalysis).reasonAnalysis
							vm.oldResult = midObj;
							// if(vm.oldResult.qualityAnalysisFbzId != '') {
							// 	vm.filelist1 = vm.oldResult.qualityAnalysisFbzId.split(',').map(data => {
							// 		return {
							// 			url: `/getphotobyte?fileId=${data}`,
							// 		}
							// 	});
							// }
							// if(vm.oldResult.effectiveAnalysisFbzId != '') {
							// 	vm.filelist2 = vm.oldResult.effectiveAnalysisFbzId.split(',').map(data => {
							// 		return {
							// 			url: `/getphotobyte?fileId=${data}`,
							// 		}
							// 	});
							// }
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
					// resultAnalysis: this.oldResult.resultAnalysis,
					effectiveAnalysis: this.oldResult.effectiveAnalysis,
                    // effectiveAnalysisFbzId: this.effectiveAnalysisFbzId.join(','),
					improvementMeasure: this.oldResult.improvementMeasure,
					// qualityAnalysisFbzId: this.qualityAnalysisFbzId.join(','),
					quotaId: this.$route.query.quotaId,
					reasonAnalysis: JSON.stringify({
						reasonAnalysis: this.oldResult.reasonAnalysis,
						resultAnalysis: this.oldResult.resultAnalysis,
					})
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
			//图片上传成功回掉函数
			uploadedCallback(res, file, fileList) {
				if(res.responseCode == 0 && res.code == 0) {
					this.$message.success(res.responseMessage);				
				}else {
					this.$message.error(res.responseMessage);
					return;
				}
				this.addImgRange = this.$refs[this.cacheEditorRefName].quill.getSelection()
				console.log(this.$refs)
				console.log(this.cacheEditorRefName)
				this.$refs[this.cacheEditorRefName].quill.insertEmbed(this.addImgRange != null?this.addImgRange.index:0, 'image', `${process.env.NODE_ENV === 'production' ? '' : '/api'}/getphotobyte?fileId=${res.results.fileId}`)

				this.$refs[this.cacheEditorRefName].quill.setSelection(this.addImgRange != null?this.addImgRange.index+1:1,1)
			},
			beforeUpload(file) {
				const isPIC = file.type == 'image/jpeg' || file.type == 'image/png';
				// const isLt1M = file.size/1024/1024 < 1;
				if(!isPIC) {
					this.$message.error('上传图片只能是jpg/jpeg/png格式！');
				}
				// if(!isLt1M) {
				// 	this.$message.error('上传图片大小不能超过1MB！');
				// }
				// return isPIC && isLt1M;
				return isPIC;
			},
		},
		components: {
			quillEditor,
		},
		mounted(){
			const _this = this
			const imgHandler = ref=> async function(image) {
				_this.addImgRange = _this.$refs[ref].quill.getSelection()
				_this.cacheEditorRefName = ref
				if (image) {
					const fileInput = _this.$refs.imgUpload 
					fileInput.$el.click()
				}
			}
			console.log(_this.$refs)
			_this.$refs.editor.quill.getModule('toolbar').addHandler('image', imgHandler('editor'))
			_this.$refs.editor2.quill.getModule('toolbar').addHandler('image', imgHandler('editor2'))
			_this.$refs.editor3.quill.getModule('toolbar').addHandler('image', imgHandler('editor3'))
			_this.$refs.editor4.quill.getModule('toolbar').addHandler('image', imgHandler('editor4'))
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