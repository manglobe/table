
<template>
  <td v-bind:colspan="x"  v-bind:rowspan="y">
      {{ content }}
  </td>
</template>
 <script>
export default {
  props: ["x", "y", "content"]
};
</script>
 