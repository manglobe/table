<template>
    <section>   
        <SelectCanvas steps="drawSteps"></SelectCanvas>
        <textarea
            ref='input'
            name=""
            id="" 
            style="positions" 
            v-model="inputValue" 
            @keydown="keydownHandle"
        >
        </textarea>
        <div style="positions" v-html="displayInner"></div>
    </section>
</template>

<script>
import SelectCanvas from './selectCanvas';
export default {
    components: {SelectCanvas},
    props:{value, quitEditor},
    data(){
        return {
            funcStore:{

            },
            inputValue,
            drawSteps:[],
            positionsObj:{},
            displayInner: '',
        }
    },
    computed: {
        positions(){
            return JSON.stringify(this.positionsObj).replace(/[\'\"\{\}]/g,'')
        }
    },
    methods: {
        setData(key, value){
            this[key] = value
        },
        keydownHandle(e){
            // enter
            if (e.keyCode === 13 && !e.altKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            this._props.quitEditor(true, Input.isSelecting);
            }
            // esc
            if (e.keyCode === 27) {
            e.preventDefault();
            this._props.quitEditor(false, true);
            }
        }
    },
    watch:{
        inputValue:function(val, oldVal){
            this.setData(
                'displayInner',
                val.replace(/([a-z]+\d+\:[a-z]+\d+|[a-z]+\d+)/gi,'<span>$1</span>')
            )
            this.setData(
                'positions',
                {...this.positions,...{height:this.refs.input.scrollHeight+4+'px'}}
            )
        }
    },
    created:{

    }
}
</script>
