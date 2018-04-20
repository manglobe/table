<template>
  <canvas ref='canvas'></canvas>
</template>

<script>
export default {
    props:{
        steps
    },
    data(){
        return {
            colorArr :[
                "#71a1e6",
                "#008000",
                "#9900cc",
                "#800000",
                "#00cc33",
                "#c60",
                "#c09"
            ]
        }
    },
    methods: {
        draw(){
            this.clear();
            let Canvas = this.refs.canvas;
            let ctx = Canvas.getContext("2d");
            this.steps.forEach((ele, index) => {
                ele.render(ctx, colorArr[index % 7]);
            });
        },
        clear(){
            let Canvas = this.refs.canvas;
            Canvas.width = Canvas.clientWidth;
            Canvas.height = Canvas.clientHeight;
            let ctx = Canvas.getContext("2d");
            ctx.clearRect(0, 0, Canvas.width, Canvas.height);
        }
    }
}
</script>
