

<template>
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <td v-for="(tr,key) in Array(10)" :key="key">
          <!-- {{key}} -->
          {{String.fromCharCode(+key+65)}}
        </td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(tr, key) in data" :key="key">
        <th>{{key+1}}</th>
        <child
          v-for="(td, keyTr) in tr" :key="keyTr"
          v-bind:x='td.x'
          v-bind:y='td.y'
          v-bind:content='td.content'>
        </child>
      </tr>
    </tbody>
  </table>
</template>
 <script>
import child from "./td.vue";
export default {
  components: {
    child
  },
  props: ["data"]
};
</script>
 <style>
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0;
  border-width: 0;
  table-layout: fixed;
  outline-width: 0;
  max-width: none;
  max-height: none;
}
.table td{
    border-top-width: 0;
    border-left-width: 0;
    border-right: 1px solid #CCC;
    border-bottom: 1px solid #CCC;
    height: 22px;
    empty-cells: show;
    line-height: 21px;
    padding: 0 4px 0 4px;
    background-color: #FFF;
    vertical-align: top;
    overflow: visible;
    outline-width: 0;
    white-space: pre-line;
    background-clip: padding-box;
}
</style>
 