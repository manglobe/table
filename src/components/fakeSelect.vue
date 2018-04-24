<template>
  <div class="fake-select"  ref="mySelect">
    <svg v-if="svg" class="svg" aria-hidden="true">
      <use :xlink:href="svg"></use>
    </svg>
    <span>{{name}}</span>
    <i class="el-icon-arrow-down" ></i>
    <ul>
      <li v-for="item in options" :key="item.index" @click="changeHandle(item.value)">
        {{item.label}}
      </li>
    </ul>
  </div>
</template>

<script>


export default {
  props: ["changeHandle", "options", "name", "svg"],
  data() {
    return {
    };
  },
  methods: {
  },
};
</script>
<style rel="stylesheet/scss" lang="scss">
.fake-select {
  display: inline-block;
  position: relative;
  padding: 10px 20px;
  height: 40px;
  box-sizing: border-box;
  line-height: 20px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #333333;
  margin: 0 15px; 
  cursor: pointer;
  svg{
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
  }
  .el-icon-arrow-down {
    position: absolute;
    font-size: 10px;
    color: #999999;
    height: 20px;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 0;
    display: inline-block;
    line-height: 20px;
    font-weight: bold;
  }
  &:hover{
    ul{
      display: inline-block;
    }
  }
  ul {
    display: none;
    position: absolute;
    top: 38px;
    background: #fff;
    border: 1px solid #e8e8e8;
    box-shadow: 0 0 3px 0 #ccc;
    border-radius: 2px;
    margin: 0;
    min-width: 100%;
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
      z-index: 1;
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
      white-space: nowrap;
      background: #fff;
      position: relative;
      z-index: 2;
      &:hover {
        background: #fffbe0;
      }
    }
  }
}
</style>
