

<template>
  <table id='x'>
    <tr v-for="item in data">
      <child   v-bind:x='1' v-bind:y='2' content="hellow">
      </child>
    </tr>
  </table>
</template>
 <script>
import child from "./td.vue";
export default {
  components: {
    child
  },
  props:['data','states']
};
</script>
 