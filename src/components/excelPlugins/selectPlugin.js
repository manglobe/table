class Origin {
    _runHandle(handleName, args){
        let obj = this[handleName]
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key](args)
            }
        }
    }
    _removeHandle(handleName, funcName){
        let obj = this[handleName]
        delete obj[funcName]
    }
    _addHandle(handleName, func){
        let obj = this[handleName]
        obj[func.name] = func
    }
}

const colorArr = [
    "#71a1e6",
    "#008000",
    "#9900cc",
    "#800000",
    "#00cc33",
    "#c60",
    "#c09"
];

const Canvas = {
    ctx:{},
    steps:[],
    resize(){
        const canvasNode =  this.node
        canvasNode.width = canvasNode.clientWidth;
        canvasNode.height = canvasNode.clientHeight;
    },
    clear(){
        this.ctx.clearRect(0, 0,  this.node.width,  this.node.height);
    },
    draw(){
        this.steps.forEach((ele, index) => {
            ele.render(this.ctx, colorArr[index % 7]);
        });
    },
    init(node){
        this.node = document.createElement("canvas");
        this.node.appendChild(node);
        this.ctx = this.node.getContext("2d");
        return new Promise(res=>res(node))
    }
}

const Input = {
    keydown:{
        _origin(e){

        }
    },
    input:{

    },
    draw(){

    },

    init(node){
        this.node = document.createElement("textarea");
        this.node.classList.add("layer-input");
        this.node.appendChild(node);
        return new Promise(res=>res(node))
    }
}

const Display = {
    render(){
        
    },
    init(node){
        this.node = document.createElement("div");
        this.node.classList.add("layer-input-display");
        this.node.appendChild(node);
        return new Promise(res=>res(node))
    }
}

class Editor extends Origin{
    constructor(){
        super()
        this.quitHandle={
        }
    }
    quit(shouldSave,args){
        this._runHandle('quitHandle',args)
        return new Promise(res=>res(shouldSave))
    }
    init(){

    }
}

