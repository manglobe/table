<template>
<!-- todo: radio -->
  <!-- <el-select class="function-select" popper-class="function-option" v-model="value" placeholder="公式" @change="changeHandle">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select> -->
  <div class="function-select" @click="toggleOptions()">
    <span>公式</span>
    <i class="el-icon-arrow-down" ></i>
    <!-- todo: active icon class -->
    <ul v-if="showOptions">
      <li v-for="item in options" :key="item.index" @click="changeHandle(item.value)">
        {{item.label}}
      </li>
    </ul>
  </div>
</template>

<script>
import { excelFunctions } from "./excelFunctions";

export default {
  props: ["changeHandle"],
  data() {
    return {
      showOptions: false,
      value: "",
      options: Object.keys(excelFunctions).map(ele => ({
        value: ele,
        label: excelFunctions[ele].name
      }))
    };
  },
  methods: {
    toggleOptions() {
      this.showOptions = !this.showOptions;
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.function-select {
  display: inline-block;
  position: relative;
  padding-right: 20px;
  padding-left: 22px;
  height: 20px;
  line-height: 20px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #333333;
  &::before {
    content: "";
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid #e8e8e8;
    display: inline-block;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    left: 0;
  }
  .el-icon-arrow-down {
    position: absolute;
    font-size: 10px;
    color: #999999;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 0;
    display: inline-block;
    line-height: 20px;
    font-weight: bold;
  }
  ul {
    position: absolute;
    top: 28px;
    background: #ffffff;
    border: 1px solid #e8e8e8;
    box-shadow: 0 0 3px 0 #cccccc;
    border-radius: 2px;
    margin: 0;
    min-width: 100%;
    display: inline-block;
    box-sizing: border-box;
    z-index: 1000;
    padding: 0;
    right: -10px;
    &::before {
      content: "";
      position: absolute;
      width: 6px;
      height: 6px;
      display: block;
      top: -5px;
      right: 11px;
      border: 1px solid #e8e8e8;
      border-right: none;
      border-bottom: none;
      background: #fff;
      z-index: 2;
      transform: rotate(45deg);
    }
    li {
      padding: 0 12px;
      box-sizing: border-box;
      list-style: none;
      text-align: left;
      width: 100%;
      height: 36px;
      font-size: 12px;
      line-height: 36px;
      &:hover {
        background: #fffbe0;
      }
    }
  }
}
</style>
