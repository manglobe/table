<template>
  <el-select v-model="value" placeholder="公式" @change="changeHandle">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
import { excelFunctions } from "./excelFunctions";

export default {
  props: ["changeHandle"],
  data() {
    return {
      value: "",
      options: Object.keys(excelFunctions).map(ele => ({
        value: ele,
        label: excelFunctions[ele].name
      }))
    };
  }
};
</script>