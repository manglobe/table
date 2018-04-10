<template>
  <div class="fake-select" v-bind:class="{active:showOptions}" @click="toggleOptions()" ref="mySelect">
    <span>{{name}}</span>
    <i class="el-icon-arrow-down" ></i>
    <ul v-if="showOptions">
      <li v-for="item in options" :key="item.index" @click="changeHandle(item.value)">
        {{item.label}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["changeHandle", "options", "name"],
  data() {
    return {
      showOptions: false
    };
  },
  methods: {
    toggleOptions(bool) {
      if (bool !== undefined) {
        this.showOptions = bool;
        return;
      }
      this.showOptions = !this.showOptions;
    }
  },
  mounted() {
    const _this = this;
    const thisNode = _this.$refs.mySelect;
    window.addEventListener("click", function(e) {
      if (!thisNode.contains(e.target)) {
        _this.toggleOptions(false);
      }
    });
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.fake-select {
  display: inline-block;
  position: relative;
  padding-right: 20px;
  padding-left: 22px;
  height: 20px;
  line-height: 20px;
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #333333;
  margin: 0 15px; 
  cursor: pointer;
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
    box-sizing: border-box;
  }
  &.active {
    &::before {
      border: 4px solid #06aea6;
    }
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
      white-space: nowrap;
      &:hover {
        background: #fffbe0;
      }
    }
  }
}
</style>
