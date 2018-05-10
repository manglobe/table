<template>
	<div>
	    <div class="steps">
			<span class="step stepActive" :class="{'stepError': hasError}">1、定义指标</span>
			<span class="step" @click="gotoStep(2)"><span class="arrow arrowActive" :class="{'stepError': hasError}"></span>2、新增图表</span>
			<span class="step" @click="gotoStep(3)"><span class="arrow"></span>3、分析结果</span>
			<!-- <span class="step" @click="gotoStep(3)"><span class="arrow"></span>3、生成报表</span> -->
			<!-- <span class="step" @click="gotoStep(4)"><span class="arrow"></span>4、分析结果</span> -->
		</div>
		<!-- <div class="button-wrapper">
	    	<el-button
	    	  type="primary" 
	    	  size="large"
	    	  @click="gotoStep(2)">下一步</el-button>
	    </div> -->
		<div class="entry-step entry-step-1">
			<div class="qulity-form">
		    	<div class="input-wrap" style="margin-right: 25px;">
					<span class="title2"><span class="required">* </span>楼层：</span>
		    		<el-select 
						class="large-input"
						v-model="oldBaseInfo.floorId" 
						filterable 
						@change="validate.floorId = false"
						:class="{warning: validate.floorId}"
						placeholder="请选择">
					    <el-option
					      v-for="floor in floors"
					      :key="floor.floorId"
					      :label="floor.floorName"
					      :value="floor.floorId">
					    </el-option>
		  
					</el-select>
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.floorId">请选择楼层</div>
					</transition>
				</div>
				<div class="input-wrap">
					<span class="title2"><span class="required">* </span>专科：</span>
		    		<el-select 
							  class="large-input"
					  v-model="oldBaseInfo.departmentId" 
					  filterable 
					  @change="validate.departmentId = false"
					  :class="{warning: validate.departmentId}"
					  placeholder="请选择">
					    <el-option
					      v-for="dept in depts"
					      :key="dept.departmentId"
					      :label="dept.departmentName"
					      :value="dept.departmentId">
					    </el-option>
					</el-select>
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.departmentId">请选择专科</div>
					</transition>
				</div>
				<div class="input-wrap">
					<span class="title2 title-textarea"><span class="required">* </span>指标名称：</span>
					<el-input 
					  class="large-input"
					  type="textarea"
					  :autosize="{minRows:1}"
					  resize="none"
					  v-model="oldBaseInfo.quotaName"
					  @change="validate.quotaName = false"
					  :class="{warning: validate.quotaName}"
					  placeholder="请输入"></el-input>	
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.quotaName">请输入指标名称（不能超过600字）</div>
					</transition>	
				</div>
				<div class="input-wrap">
					<span class="title2"><span class="required">* </span>指标类型：</span>
		    		<el-select 
							  class="large-input"
					  v-model="oldBaseInfo.quotaTypeId" 
					  filterable 
					  @change="validate.quotaTypeId = false"
					  :class="{warning: validate.quotaTypeId}"
					  placeholder="请选择">
					    <el-option
					      v-for="type in types"
					      :key="type.quotaTypeId"
					      :label="type.quotaTypeName"
					      :value="type.quotaTypeId">
					    </el-option>
					</el-select>
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.quotaTypeId">请选择指标类型</div>
					</transition>
				</div>
				<div class="input-wrap">
					<span class="title2 title-textarea" style="margin-top: 5px;">
						<span class="required">* </span>指标定义：
					</span>
				    <div class="definitions-list ">	
<el-row type="flex" class="row-bg" justify="space-around">

						<div
						  class="definition-item"			  
						  v-for="(quotaDefinition, index) in oldBaseInfo.quotaDefinitions" 
						  :key="index">
							<el-input
							  class="large-input"
							  type="textarea"
					  		  :autosize="{minRows:1}"
					  		  resize="none"
							  v-model="oldBaseInfo.quotaDefinitions[index]" 
							  @change="validate.quotaDefinitions[index] = false"
						  	  :class="{warning: validate.quotaDefinitions[index]}"
							  placeholder="请输入"></el-input>
							<i 
							  v-if="index == oldBaseInfo.quotaDefinitions.length -1 " 
							  style="cursor: pointer;margin-left: 10px;vertical-align:top;margin-top:9px;color: #06AEA6;font-size:16px"
							  @click="addQuotaDefinition"
							  class="el-icon-plus"></i>
							<i 
							  v-else
							  style="cursor: pointer;margin-left: 10px;vertical-align:top;margin-top:9px;color: #F36969;font-size:16px"
							  @click="deleteQuotaDefinition(index)" 
							  class="el-icon-delete"></i>	
							<transition name="el-zoom-in-top">
								<div class="tips" v-show="validate.quotaDefinitions[index]">请输入指标定义（不能超过600字）</div>
							</transition>
						</div>
						     </el-row>
					</div>			
				</div>

				<div class="input-wrap">
					<span class="title2 title-textarea"><span class="required">* </span>分子：</span>
					<el-input 
					  class="large-input"
					  type="textarea"
					  :autosize="{minRows:1}"
					  resize="none"
					  v-model="oldBaseInfo.molecular" 
					  @change="validate.molecular = false"
					  :class="{warning: validate.molecular}"
					  placeholder="请输入"></el-input>	
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.molecular">请输入分子（不能超过600字）</div>
					</transition>	
				</div>	
				<div class="input-wrap">
					<span class="title2 title-textarea"><span class="required">* </span>分母：</span>
					<el-input 
					  class="large-input"
					  type="textarea"
					  :autosize="{minRows:1}"
					  resize="none"
					  v-model="oldBaseInfo.denominator" 
					  @change="validate.denominator = false"
					  :class="{warning: validate.denominator}"
					  placeholder="请输入"></el-input>	
					<transition name="el-zoom-in-top">
						<div class="tips" v-show="validate.denominator">请输入分母（不能超过600字）</div>
					</transition>	
				</div>
				<div class="input-wrap" style="display:flex;align-items:center;">
					<span class="title2"><span class="required">* </span>公式：</span>
					<el-row type="flex" class="row-bg" justify="space-around">
					<div class="formula-input">
						<span class="bind-data" style="margin-left:12px;">
						<span v-if='oldBaseInfo.molecular'>{{oldBaseInfo.molecular}}</span>
						<span v-else style='color: #ccc;'>根据分子自动生成</span>
					</span>
					&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp; 
					<span class="bind-data">
						<span v-if='oldBaseInfo.denominator'>{{oldBaseInfo.denominator}}</span>
						<span v-else style='color: #ccc;'>根据分母自动生成</span>
					</span>
					</div>
					<span style="font-size: 20px;vertical-align: middle;line-height:30px;color:#f36969">*</span>
 
					<div style="position: relative; display: inline-block;margin: 0 15px;">
						<el-input
						  style="width: 110px;"
						  placeholder="请输入数字"
						  v-model="oldBaseInfo.percentage"
						  @change="validate.percentage = false"
					      :class="{warning: validate.percentage}"></el-input>
						<transition name="el-zoom-in-top">
							<div 
							  class="tips"
							  style="width: 74px;left: 0px;"
							  v-show="validate.percentage">请输入数字（最多保留2位小数）</div>
						</transition>						
					</div>
					<el-select 
					  v-model="oldBaseInfo.formulaUnits" 
					  class="percentage"
					  placeholder="空">
					    <el-option
					      v-for='sign in signs'
					      :key='sign.key'
					      :label="sign.mark"
					      :value="sign.key">
					    </el-option>
					</el-select>	
					</el-row>	
				</div>
				<el-button
					type="primary" 
					class="primary-btn"
					size="large"
					@click="gotoStep(2)">下一步</el-button>
			</div>							
	    </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import service from "@/service/service";
import NProgress from "nprogress";
import handleObject from "@/util/handleObject";

export default {
  data() {
    return {
      floorId: "",
      deptId: "",
      indicatorDef: "",
      defaultSign: "%",
      signs: [
        {
          key: "%",
          mark: "%"
        },
        {
          key: "‰",
          mark: "‰"
        }
      ],
      validate: {
        floorId: false,
        departmentId: false,
        quotaName: false,
        quotaTypeId: false,
        molecular: false,
        denominator: false,
        percentage: false,
        quotaDefinitions: []
      },
      stepNum: ""
    };
  },
  computed: {
    ...mapState(["floors", "depts", "types"]),
    oldBaseInfo() {
      return this.$store.state.oldBaseInfo;
    },
    hasError(){
      return !/false/.test(JSON.stringify(this.validate))
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.query.quotaId) {
      service.getOldBaseInfo(to.query.quotaId).then(res => {
        next(vm => {
          if (res.responseData) {
            // vm.$store.state.oldBaseInfo = handleObject.deepClone(res.responseData);
            for (let key of Object.keys(vm.$store.state.oldBaseInfo)) {
              vm.$store.state.oldBaseInfo[key] = res.responseData[key];
            }
          }
        });
      });
    } else {
      next();
    }
  },
  methods: {
    addQuotaDefinition() {
      if (this.oldBaseInfo.quotaDefinitions.length >= 10) {
        this.$message.error("指标定义请不要超过10条！");
        return;
      }
      this.oldBaseInfo.quotaDefinitions.push(null);
    },
    deleteQuotaDefinition(index) {
      this.oldBaseInfo.quotaDefinitions.splice(index, 1);
    },
    gotoStep(num) {
      this.validate = {
        floorId: this.$validate.value(this.oldBaseInfo.floorId),
        departmentId: this.$validate.value(this.oldBaseInfo.departmentId),
        quotaName: this.$validate.string(this.oldBaseInfo.quotaName),
        quotaTypeId: this.$validate.value(this.oldBaseInfo.quotaTypeId),
        quotaDefinitions: this.$validate.array(
          this.oldBaseInfo.quotaDefinitions
        ),
        molecular: this.$validate.string(this.oldBaseInfo.molecular),
        denominator: this.$validate.string(this.oldBaseInfo.denominator),
        percentage: this.$validate.number(this.oldBaseInfo.percentage)
      };
      for (let value of Object.values(this.validate)) {
        if (value.constructor == Array) {
          for (let item of value) {
            if (item) {
              return false;
            }
          }
        } else if (value) {
          return false;
        }
      }
      this.stepNum = 2;
      let BaseInfoParams = {
        denominator: this.oldBaseInfo.denominator,
        departmentId: this.oldBaseInfo.departmentId,
        floorId: this.oldBaseInfo.floorId,
        molecular: this.oldBaseInfo.molecular,
        percentage: this.oldBaseInfo.percentage,
        quotaName: this.oldBaseInfo.quotaName,
        quotaTypeId: this.oldBaseInfo.quotaTypeId,
        quotaDefinitions: this.oldBaseInfo.quotaDefinitions,
        quotaId: this.$route.query.quotaId || "",
        formulaUnits: this.oldBaseInfo.formulaUnits
      };
      NProgress.start();
      if (!this.$route.query.quotaId) {
        this.$service.createBaseInfo(BaseInfoParams).then(res => {
          if (res.responseCode == "0") {
            this.$router.push({
              name: `entryStep${num}`,
              query: {
                quotaId: res.responseData.quotaId
              }
            });
          } else {
            NProgress.end();
          }
        });
      } else {
        this.$service.editBaseInfo(BaseInfoParams).then(res => {
          if (res.responseCode == "0") {
            this.$router.push({
              name: `entryStep${num}`,
              query: {
                quotaId: this.$route.query.quotaId,
                isEdit: this.$route.query.isEdit
              }
            });
          } else {
            NProgress.end();
          }
        });
      }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.step.stepError{
  background-color: #FF897D;
}
.steps .step .arrow.stepError:before {
  border-left-color: #FF897D;
  
}
.entry-step-1 {
  top: 90px;
  bottom: 0;
  background-color: #fff;
  padding-top: 32px;
  padding-bottom: 24px;
  overflow: overlay;
  border: 1px solid #e5e9f1;
  box-shadow: 0 0 3px 0 #ced7e8;
  
  .qulity-form {
    margin-left: 92px;
  }
  .title-textarea {
    vertical-align: top;
    margin-top: 4px;
  }
  .input-wrap {
    position: relative;
    margin-top: 25px;
    .el-select {
      width: 216px;
    }
    .large-input {
      width: 717px;
    }
    .bind-data {
      display: inline-block;
      width: 240px;
      word-wrap: break-word;
    }
  }
  .el-input.warning,
  .el-select.warning,
  .el-textarea.warning {
    .el-input__inner,
    .el-textarea__inner {
      border-color: rgb(255, 73, 73) !important;
      box-shadow: 0 0 3px 0 #f36969;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
  }

  .definitions-list {
    display: inline-block;
    width: 600px;
    vertical-align: top;
    .definition-item {
      margin-bottom: 25px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .percentage {
    width: 65px !important;
    display: inline-block;
  }
  .el-input__inner {
    height: 33px !important;
  }
  .row-bg {
    padding: 20px 30px;
    background-color: #f6f8f8;
    width: 717px;
    border-radius: 2px;
    // flex-direction: column;
    justify-content: flex-start !important;
    flex-wrap: wrap;
    .definition-item {
      width: 100%;
    }
    .large-input {
      width: 86.5%;
    }
    .tips {
      left: 0;
    }
  }
  .formula-input {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 3px;
    width: 657px;
    height: 30px;
    line-height: 30px;
    margin-bottom: 10px;
  }
  .tips {
    margin-top: 10px;
    position: relative;
  }
  .primary-btn {
    margin-left: 100px;
    margin-top: 34px;
    background: #06aea6;
    border-color: transparent;
    &:hover {
      background: #68d1be;
    }
  }
}
.el-select-dropdown__list {
  padding: 0;
}
.el-select-dropdown__item.hover {
  background: #fffbe0;
  border-radius: 2px;
}
</style>