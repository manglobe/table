
<template>
  <div
    class="td-box"
    v-bind:class=" { active: click, editor: dblclick, choosed: choosed}"
    @click="clickHandle()"
    @dblclick="dblclickHandle"
   >
    <textarea
        type="text"
        @input="inputHandle"
        @blur="blurHandle" 
        @keyup="keyupHandle" 
        v-model="value"
    />
    </div>
</template>

 <script>
export default {
  props: ["choosed"],
  data() {
    return {
      click: false,
      dblclick: false,
      value: ""
    };
  },
  methods: {
    clickHandle: function() {
      this.click = true;
    },
    dblclickHandle: function(e) {
      this.dblclick = true;
      setTimeout(() => e.target.firstChild.focus());
    },
    // textarea
    inputHandle: function(e) {
      console.log(e.target.scrollHeight)
      // console.log(e.target.scrollTop )
      console.log(e.target.parentNode.scrollHeight)
      e.target.parentNode.scrollHeight = e.target.scrollHeight + "px";
    },
    blurHandle: function() {
      this.click = false;
      this.dblclick = false;
    },
    keyupHandle: function(e) {
      //   console.log(e.keyCode);
      if (e.altKey && e.keyCode === 13) {
        // alt+enter
        this.value += "\n";
        return;
      }
      switch (e.keyCode) {
        case 13:
          // TODO: input goto next line
          break;
      }
    }
  }
};
</script>

<style lang='scss'>
.td-box {
  position: absolute;
  width: 100%;
  min-height: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  opacity: 0;
  background: transparent;
  textarea {
    display: none;
    color: #000;
    border: none;
    outline: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    resize: none;
  }
}
.active {
  opacity: 1;
  border: 1px solid #06aea6;
}
.editor {
  textarea {
    display: block;
  }
  z-index: 2;
  background: #fff;
  opacity: 1;
  border: 1px solid #06aea6;
  box-shadow: inset 0 0 3px #06aea6;
}
</style>
 