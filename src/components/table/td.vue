
<template>
  <td
    class="td"
    v-bind:colspan="x"
    v-bind:rowspan="y">
      {{ content }}
      <td-input>
      </td-input>
  </td>
</template>
 <script>
import tdInput from "./input";
export default {
  components: {
    tdInput
  },
  props: ["x", "y", "content"]
};
</script>
 <style>
td {
  position: relative;
}
</style>
 