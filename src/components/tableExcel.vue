<template>
    <div style="position: relative;overflow-x: auto;" id="div">
        <table 
          id="tableExcel"
          class="table" 
          cellspacing="0" 
          cellpadding="0" 
          style="width: 1280px;"         
          @mousedown.left='mousedown($event)'>
            <thead>
                <tr>
                    <th style='width: 80px;'></th>
                    <th v-for='(theadUnit, i) in thead' :key='i' >
                        {{theadUnit}}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='(row, j) in tbody' :key='j'>
                    <td style='background: #f5f5f5;width: 80px;'>{{j+1}}</td>
                    <td 

                      v-for='(tbodyUnit, k) in row'
                      :key='k'
                      :class='{highlight: tbody[j][k].highlight}'
                      @contextmenu.prevent="showMenu($event)"
                      @dblclick='editContent($event)'                     
                      >
                      <input v-model="tbodyUnit.value" name="input"></input>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="highlight-border highlight-border-up" id="up"></div>
        <div class="highlight-border highlight-border-down" id="down"></div>
        <div class="highlight-border highlight-border-left" id="left"></div>
        <div class="highlight-border highlight-border-right" id="right"></div>
        <div class="highlight-cover-fillhandle" id="fillhandle"></div>
        <!-- <textarea id="textarea" class="textarea" rows="1"></textarea> -->
        <ul class="rightMenu" id="menu" v-show="isMenuShow">
            <li class="item" @click="copysum()">
                复制
            </li>
              <li class="item" @click="pastesum()">
                粘贴
            </li>
              <li class="item" @click="cutsum()">
                剪切
            </li>
            <li class="item" @click="insertRow('up')">
                向上插入一行
            </li>
            <li class="item" @click="insertRow('down')">
                向下插入一行
            </li>
            <li class="item" @click="insertCol('left')">
                向左插入一列
            </li>
            <li class="item" @click="insertCol('right')">
                向右插入一列
            </li>
            <li class="item" @click="deleteRow">
                删除行
            </li>
            <li class="item" @click="deleteCol">
                删除列
            </li>
             <li class="item" @click="merge" v-show="ok">
                合并单元格
            </li>
            <li class="item" @click="cancel" v-show="OK">
                取消合并单元格
            </li>
        </ul>
        <div id="rongqi" >
            
        </div>
        <div class="mask" style="display:none" id="box">
           <div class="text">
                <div class="top">
                    <span>合并单元格</span> 
                </div>
                <p>合并后的单元格将只保留左/上单元格中的值，确定合并吗？</p>
                <div class="no" @click="back">取消</div><div class="yes" id="ensure" @click="sure">确认</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                thead: ['A','B','C','D','E','F','G','H','I','J','K','L'],
                letters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
                tbody: function(rows, cols) {
                    const result = [];
                    for(let i = 0;i < rows; i ++) {
                        let row = [];
                        for(let j =0;j < cols; j ++) {
                            row.push({
                                value: '',
                                highlight: false,
                            });
                        }
                        result.push(row);
                    }   
                    return result;                   
                }(10,12),
                editable: true,
                table: '',
                fillhandle: '',
                mousedownTop: '',
                mousedownLeft: '',
                mouseupTop: '',
                mouseupLeft: '',
                selectedWidth: '',
                selectedHeight: '',
                selectedTop: '',
                selectedLeft: '',
                menu: '',
                isMenuShow: false,
                firstCellIndex: 0,
                firstRowIndex: 0,
                lastCellIndex: 0,
                lastRowIndex: 0,
                target:'',
                text:0,
                ctext:0,
                cellI:0,
                rowI:0,
                arr1:[],
                arr2:[],
                tbodyfirstRowIndex:null,
                tbodyfirstCellIndex:null,
                tbodylastRowIndex:null,
                tbodylastRowIndex:null,
                rowlength:0,
                celllength:0,
                flag:false,
                entrance:false,
                mergearr:[],
                cspan:0,
                rspan:0,
                targ:null,
                surebutton:false,
                nobutton:false,
                firstnum:0,
                firstR:0,
                lastR:0,
                firstC:0,
                lastC:0,
                ok:true,
                OK:true,
                or:false,
                Marr:[],
                marr:[],
                oneflag:false,
                twoflag:false,
                firstMergeValue: '',
                beforecancelnumber:"",
                mousedowncellIndex:'',
                mousedownrowIndex:'',
                condition:'',
                door:false,
                onecondition:'',
                twocondition:'',
                leftmousedownone:'',
                leftmousedowntwo:'',
                first:'',
                other:'',
                tiaojian1:'',
                tiaojian2:'',
                copyflag:false,
                cutflag:false,

            }
        },
        methods: {
            initTbodyColor() {
                for(let i = 0; i < this.tbody.length; i ++) {
                    for(let j = 0; j < this.tbody[i].length; j ++) {
                        this.tbody[i][j].highlight = false;
                    }
                }
            },
            highlightSingle(target) {
                // console.log(target);
                // console.log('highlightSingle');

                //定义4个坐标
                this.firstCellIndex =target.cellIndex;
                this.firstRowIndex = target.parentNode.rowIndex;
                this.lastCellIndex = this.firstCellIndex;
                this.lastRowIndex = this.firstRowIndex;

                this.selectedTop =target.offsetTop;
                this.selectedLeft = target.offsetLeft;
                this.selectedWidth =target.offsetWidth;
                this.selectedHeight =target.offsetHeight;

                this.up.style.width = `${ this.selectedWidth }px`;
                this.up.style.top = `${ this.selectedTop }px`;
                this.up.style.left = `${ this.selectedLeft }px`;

                this.down.style.width = `${this.selectedWidth}px`;
                this.down.style.top = `${ this.selectedTop + this.selectedHeight }px`;
                this.down.style.left = `${this.selectedLeft}px`;

                this.left.style.height = `${ this.selectedHeight }px`;
                this.left.style.top = `${ this.selectedTop }px`;
                this.left.style.left = `${ this.selectedLeft }px`;

                this.right.style.height = `${ this.selectedHeight }px`;
                this.right.style.top = `${ this.selectedTop }px`;
                this.right.style.left = `${ this.selectedLeft + this.selectedWidth }px`;
               
                this.fillhandle.style.top = `${ this.selectedTop + this.selectedHeight - 2 }px`;
                this.fillhandle.style.left = `${ this.selectedLeft + this.selectedWidth - 2 }px`;
            },
            highlightMulti() {
                if(this.firstRowIndex < this.lastRowIndex) {
                    for(let i = this.firstRowIndex; i <= this.lastRowIndex; i ++) {
                        if(this.firstCellIndex < this.lastCellIndex) {
                            for(let j = this.firstCellIndex; j <= this.lastCellIndex; j ++) {
                                this.tbody[i - 1][j - 1].highlight = true;
                            }                         
                        }else {
                            for(let j = this.lastCellIndex; j <= this.firstCellIndex; j ++) {
                                this.tbody[i - 1][j - 1].highlight = true;
                            }
                        }
                    }                    
                } else {
                    for(let i = this.lastRowIndex; i <= this.firstRowIndex; i ++) {
                        if(this.firstCellIndex < this.lastCellIndex) {
                            for(let j = this.firstCellIndex; j <= this.lastCellIndex; j ++) {
                                this.tbody[i - 1][j - 1].highlight = true;
                            }                         
                        }else {
                            for(let j = this.lastCellIndex; j <= this.firstCellIndex; j ++) {
                                this.tbody[i - 1][j - 1].highlight = true;
                            }
                        }
                    }
                }
            },
            mousedown(event) {

                // console.log(event.target);
                // this.initTbodyColor();
                // this.highlightSingle(event.target.parentNode);               
                // this.table.addEventListener('mousemove', this.mouseMoveInTable);
                // this.isMenuShow = false;
                //没合并
                if(this.door == false){
                    // console.log(this.door);
                    // console.log(event.target.parentNode);
                    this.initTbodyColor();
                    this.highlightSingle(event.target.parentNode);               
                    this.table.addEventListener('mousemove', this.mouseMoveInTable);
                    this.isMenuShow = false;
                }else{
                    //合并后
                    // console.log(this.door);
                    //1.点击的是第一个
                    this.leftmousedownone = (!((event.target.parentNode.rowSpan ==1)&&(event.target.parentNode.colSpan ==1)));
                    this.leftmousedowntwo = (!((event.target.rowSpan ==1)&&(event.target.colSpan ==1)));
                    if((event.target.name) && this.leftmousedownone){
                        this.tiaojian1 = (event.target.name) && this.leftmousedownone;

                        this.initTbodyColor();
                        this.highlightSingle(event.target.parentNode);               
                        this.table.addEventListener('mousemove', this.mouseMoveInTable);
                        this.isMenuShow = false;
                        console.log("点击的是第一个")
                    }
                    if((event.target.rowSpan) && (event.target.colSpan) && this.leftmousedowntwo){
                        this.tiaojian2 = (event.target.rowSpan) && (event.target.colSpan) && this.leftmousedowntwo;
                        this.initTbodyColor();
                        this.highlightSingle(event.target);               
                        this.table.addEventListener('mousemove', this.mouseMoveInTable);
                        this.isMenuShow = false;
                        console.log("点击的是其他")

                    }
                    if(!(this.leftmousedownone&&this.leftmousedowntwo)){

                    console.log("1234567890");
                    // console.log(event.target.parentNode);
                    this.initTbodyColor();
                    this.highlightSingle(event.target.parentNode);               
                    this.table.addEventListener('mousemove', this.mouseMoveInTable);
                    this.isMenuShow = false;
                    }
                }
            },
            mouseMoveInTable(event) {
                this.target = event.target.parentNode;
                //判断点击的是哪一个

                // //没合并
                // if(this.door == false){
                    
                // }else{
                //  //已合并
                //      if(this.tiaojian1){
                //         //点击第一个单元格
                //         this.target = event.target.parentNode;
                //         // console.log(this.target) 
                //      }
                //      if(this.tiaojian2){
                //         //点击区域内其他
                //         this.target = event.target;
                //             // console.log(this.target)
                //      }
                //      if((!(this.tiaojian1 && this.tiaojian2))){
                //         console.log("qita")
                //         this.target = event.target.parentNode;
                //      }      
                // }
                
                      
                this.lastCellIndex = this.target.cellIndex;
                this.lastRowIndex = this.target.parentNode.rowIndex;

                if(this.firstCellIndex == this.lastCellIndex && this.firstRowIndex == this.lastRowIndex) {
                    return ;
                }
                let deltaXIndex = this.lastRowIndex - this.firstRowIndex;
                let deltaYIndex = this.lastCellIndex - this.firstCellIndex;
                
                this.initTbodyColor();
                this.highlightMulti();

                let mousemoveTop = this.target.offsetTop;
                let mousemoveLeft = this.target.offsetLeft;

                let mousemoveWidth = this.target.offsetWidth;
                let mousemoveHeight = this.target.offsetHeight;

                let deltaX = mousemoveLeft - this.selectedLeft;
                let deltaY = mousemoveTop - this.selectedTop;
                
                //向右滑
                if(deltaX >= 0) {
                    //不用变的边框
                    this.up.style.left = `${ this.selectedLeft }px`;                   
                    this.left.style.left = `${ this.selectedLeft }px`;                    
                    this.down.style.left = `${this.selectedLeft}px`;
                    this.up.style.width = `${ mousemoveWidth + deltaX }px`;
                    this.down.style.width = `${ mousemoveWidth + deltaX }px`;
                    this.right.style.left = `${ mousemoveLeft + mousemoveWidth }px`;
                }
                //向左滑
                if(deltaX <= 0){                    
                    this.up.style.width = `${ this.selectedWidth - deltaX }px`;
                    this.up.style.left = `${ mousemoveLeft }px`;                   

                    this.down.style.width = `${ this.selectedWidth - deltaX }px`;
                    this.down.style.left = `${ mousemoveLeft }px`;

                    this.left.style.left = `${ mousemoveLeft }px`;
                    //不用变的边框
                    this.right.style.left = `${ this.selectedLeft + this.selectedWidth }px`;
                }
                //向上滑
                if(deltaY <= 0) {                 
                    this.up.style.top = `${ mousemoveTop }px`;

                    this.left.style.height = `${ mousemoveHeight - deltaY }px`;
                    this.left.style.top = `${ mousemoveTop }px`;

                    this.right.style.height = `${ mousemoveHeight - deltaY }px`;
                    this.right.style.top = `${ mousemoveTop }px`;
                    //不用变的边框
                    this.down.style.top = `${ this.selectedTop + this.selectedHeight }px`;
                }
                //鼠标向下移动
                if(deltaY >= 0) {
                    this.down.style.top = `${ mousemoveTop + mousemoveHeight }px`;
                    this.left.style.height = `${ mousemoveHeight + deltaY }px`;

                    this.right.style.height = `${ mousemoveHeight + deltaY }px`;
                    //不用变的边框
                    this.up.style.top = `${ this.selectedTop }px`;
                    this.left.style.top = `${ this.selectedTop }px`;
                    this.right.style.top = `${ this.selectedTop }px`;
                }
            },

            showMenu(event) {              
                if(this.door == false){
                //没合并 根据单元格的数量 确定合并和取消是否出现
                this.mousedownrowIndex =  event.target.parentNode.parentNode.rowIndex;
                this.mousedowncellIndex =  event.target.parentNode.cellIndex;   
                this.isMenuShow = true;            
                if(this.firstRowIndex === this.lastRowIndex && this.firstCellIndex === this.lastCellIndex){ 
                  //选中一个 合并和取消都不出现
                    this.ok=false;
                    this.OK=false;  
                }else{  
                //选中多个  合并出现，取消不出现               
                    this.ok=true;
                    this.OK=false;                 
                }             
                this.menu.style.left = `${event.target.parentNode.offsetLeft + event.offsetX + 4}px`;
                this.menu.style.top = `${event.target.parentNode.offsetTop + event.offsetY + 4}px`;
                let menuCellIndex = event.target.parentNode.cellIndex;
                let menuRowIndex = event.target.parentNode.parentNode.rowIndex; 
                this.cellI = menuCellIndex;
                this.rowI = menuRowIndex;
                // console.log(menuCellIndex, menuRowIndex);
                //单选或者没有在多选框呢，highlight发生改变
                if((this.firstCellIndex == this.lastCellIndex && this.firstRowIndex == this.lastRowIndex) || this.ifInner(menuRowIndex, menuCellIndex)) {
                    this.highlightSingle(event.target.parentNode);
                    this.initTbodyColor();
                }
                this.door = false;
                //到这结束
                }else{
                //已合并根据点击位置不同有三种情况
                               
                //1.点击第一个 还是原来代码
                this.onecondition = (!((event.target.parentNode.rowSpan ==1)&&(event.target.parentNode.colSpan ==1)));
                this.twocondition = (!((event.target.rowSpan ==1)&&(event.target.colSpan ==1)));
                if((event.target.name) && this.onecondition){
            
                    console.log('是点击的第一个');
                    this.mousedownrowIndex =  event.target.parentNode.parentNode.rowIndex;
                    this.mousedowncellIndex =  event.target.parentNode.cellIndex;   
                    this.isMenuShow = true;            
                    
                    this.ok=false;
                    this.OK=true;
                    this.menu.style.left = `${event.target.parentNode.offsetLeft + event.offsetX + 4}px`;
                    this.menu.style.top = `${event.target.parentNode.offsetTop + event.offsetY + 4}px`;
                    let menuCellIndex = event.target.parentNode.cellIndex;
                    let menuRowIndex = event.target.parentNode.parentNode.rowIndex; 
                    this.cellI = menuCellIndex;
                    this.rowI = menuRowIndex;
                    // console.log(menuCellIndex, menuRowIndex);
                    //单选或者没有在多选框呢，highlight发生改变
                    if((this.firstCellIndex == this.lastCellIndex && this.firstRowIndex == this.lastRowIndex) || this.ifInner(menuRowIndex, menuCellIndex)) {
                        this.highlightSingle(event.target.parentNode);
                        this.initTbodyColor();
                    }
                    this.door = false;

                }
                //点击的是选中区域，但不是第一个单元格
                if((event.target.rowSpan) && (event.target.colSpan) && this.twocondition){ console.log("点击的是选中区域，但不是第一个单元格");
                    this.mousedownrowIndex =  event.target.parentNode.rowIndex;
                    this.mousedowncellIndex =  event.target.cellIndex;   
                    this.isMenuShow = true;            
                    
                    this.ok=false;
                    this.OK=true;
                    this.menu.style.left = `${event.target.offsetLeft + event.offsetX + 4}px`;
                    this.menu.style.top = `${event.target.offsetTop + event.offsetY + 4}px`;
                    let menuCellIndex = event.target.cellIndex;
                    let menuRowIndex = event.target.parentNode.rowIndex; 
                    this.cellI = menuCellIndex;
                    this.rowI = menuRowIndex;
                    // console.log(menuCellIndex, menuRowIndex);
                    //单选或者没有在多选框呢，highlight发生改变
                    if((this.firstCellIndex == this.lastCellIndex && this.firstRowIndex == this.lastRowIndex) || this.ifInner(menuRowIndex, menuCellIndex)) {
                        this.highlightSingle(event.target);
                        this.initTbodyColor();
                    }
                    this.door = false;
                }
                this.first=(event.target.name) && this.onecondition;
                this.other= (event.target.rowSpan) && (event.target.colSpan) && this.twocondition;

                //点击非选中单元格
                if((!this.first)&&(!this.other)){
                    this.arr1=[];
                    console.log('点击非选中单元格')
                    this.mousedownrowIndex =  event.target.parentNode.parentNode.rowIndex;
                    this.mousedowncellIndex =  event.target.parentNode.cellIndex;
                    this.isMenuShow = true;
                    this.initTbodyColor();
                    this.highlightSingle(event.target.parentNode);               
                    this.table.addEventListener('mousemove', this.mouseMoveInTable);
                    this.isMenuShow = false;
                   

                    //定位
                this.menu.style.left = `${event.target.parentNode.offsetLeft + event.offsetX + 4}px`;
                this.menu.style.top = `${event.target.parentNode.offsetTop + event.offsetY + 4}px`;
                let menuCellIndex = event.target.parentNode.cellIndex;
                let menuRowIndex = event.target.parentNode.parentNode.rowIndex; 
                this.cellI = menuCellIndex;
                this.rowI = menuRowIndex;
                // console.log(menuCellIndex, menuRowIndex);
                // //单选或者没有在多选框呢，highlight发生改变
                // if((this.firstCellIndex == this.lastCellIndex && this.firstRowIndex == this.lastRowIndex) || this.ifInner(menuRowIndex, menuCellIndex)) {
                //     this.highlightSingle(event.target.parentNode);
                //     this.initTbodyColor();
                // }
                this.door = false;  
                }
                
                }

                                
            },

           

            // 复制
            copysum(){
                this.copyflag=true;
                this.flag = true;
                this.arr1 = [];
                this.tbodyfirstRowIndex =  this.firstRowIndex-1;
                this.tbodyfirstCellIndex =  this.firstCellIndex-1;
                this.tbodylastRowIndex = this.lastRowIndex-1;
                this.tbodylastCellIndex = this.lastCellIndex-1;
                this.rowlength = this.tbodylastRowIndex -  this.tbodyfirstRowIndex;
                this.celllength = this.tbodylastCellIndex - this.tbodyfirstCellIndex;

                for(let i = this.tbodyfirstRowIndex; i <= this.tbodylastRowIndex; i++){
                    // let arr = [],
                    for(let j = this.tbodyfirstCellIndex; j<= this.tbodylastCellIndex; j++){
                       this.arr1.push(this.tbody[i][j].value);
                       this.isMenuShow = false;
                    }
                }
            },

            
            // 粘贴
            pastesum(){
                if(this.flag == true){
                    //剪切先执行,先取消剪切的值
                    if (this.entrance) {
                        for(let i = this.tbodyfirstRowIndex ; i <= this.tbodylastRowIndex; i++){
                            for(let j = this.tbodyfirstCellIndex; j<= this.tbodylastCellIndex; j++){
                               this.arr1.push(this.tbody[i][j].value);
                               this.tbody[i][j].value = null;
                               this.isMenuShow = false;
                            }
                        }
                        this.entrance = false;
                    }
                    //粘贴的赋值部分
                    this.tbodyfirstRowIndex =  this.firstRowIndex-1;
                    this.tbodyfirstCellIndex =  this.firstCellIndex-1;
                    this.tbodylastRowIndex = this.lastRowIndex-1;
                    this.tbodylastCellIndex = this.lastCellIndex-1;
                    for(let i = this.tbodyfirstRowIndex; i <=this.tbodyfirstRowIndex + this.rowlength; i++){
                        for(let j = this.tbodyfirstCellIndex; j<= this.tbodyfirstCellIndex + this.celllength; j++){
                            if(this.copyflag==true){
                                this.tbody[i][j].value = this.arr1[0];
                                this.firstnum = this.arr1[0];
                                this.arr1.shift();
                                this.arr1.push(this.firstnum);
                                
                            }
                            if(this.cutflag ==true){
                                //剪切不能重复粘贴
                                this.tbody[i][j].value = this.arr1[0];
                                this.arr1.shift();
                            }
                           this.isMenuShow = false;
                        }
                    }                  
                }else{
                    this.isMenuShow = false;
                    return;
                }
            },

            // 剪切
            cutsum(){
                this.cutflag=true;
                this.flag = true;
                this.entrance = true;
                this.arr1 = [];
                this.tbodyfirstRowIndex =  this.firstRowIndex-1;
                this.tbodyfirstCellIndex =  this.firstCellIndex-1;
                this.tbodylastRowIndex = this.lastRowIndex-1;
                this.tbodylastCellIndex = this.lastCellIndex-1;
                this.rowlength = this.tbodylastRowIndex -  this.tbodyfirstRowIndex;
                this.celllength = this.tbodylastCellIndex - this.tbodyfirstCellIndex;
                this.isMenuShow = false;
            },

            insertCol(str) {
                this.isMenuShow = false;
                let tableColLength = this.table.rows[0].cells.length;
                this.thead.push(this.letters[tableColLength - 1]);
                if(str === 'right') {
                    this.firstCellIndex < this.lastCellIndex ? this.insertArrCol(this.tbody, this.lastCellIndex) : this.insertArrCol(this.tbody, this.firstCellIndex);                 
                }else {                  
                    this.firstCellIndex > this.lastCellIndex ? this.insertArrCol(this.tbody, this.lastCellIndex - 1) : this.insertArrCol(this.tbody, this.firstCellIndex - 1); 
                    this.up.style.left = `${parseInt(this.up.style.left) + 100}px`;
                    this.down.style.left = `${parseInt(this.down.style.left) + 100}px`;  
                    this.left.style.left = `${parseInt(this.left.style.left) + 100}px`;  
                    this.right.style.left = `${parseInt(this.right.style.left) + 100}px`; 
                    this.fillhandle.style.left = `${parseInt(this.fillhandle.style.left) + 100}px`;  
                    this.firstCellIndex ++;             
                    this.lastCellIndex ++;
                }
                if(parseInt(this.table.style.width) < 1280 ) {
                    this.table.style.width = `${parseInt(this.table.style.width) + 100}px`;        
                }
            },
            insertArrCol(table, index) {
                table.map(rows => {
                    rows.splice(index, 0, {
                        highlight: false,
                        value: '浩'
                    });
                })
            },
            insertRow(str) {
                this.isMenuShow = false;
                let tableRowLength = this.table.rows.length;
                if(str === 'down') {
                    this.firstRowIndex < this.lastRowIndex ? this.insertArrRow(this.tbody, this.lastRowIndex) : this.insertArrRow(this.tbody, this.firstRowIndex);
                }else {
                    this.firstRowIndex > this.lastRowIndex ? this.insertArrRow(this.tbody, this.lastRowIndex - 1) : this.insertArrRow(this.tbody, this.firstRowIndex - 1); 
                    this.up.style.top = `${parseInt(this.up.style.top) + 37}px`;
                    this.down.style.top = `${parseInt(this.down.style.top) + 37}px`;  
                    this.left.style.top = `${parseInt(this.left.style.top) + 37}px`;  
                    this.right.style.top = `${parseInt(this.right.style.top) + 37}px`; 
                    this.fillhandle.style.top = `${parseInt(this.fillhandle.style.top) + 37}px`;  
                    this.firstRowIndex ++;             
                    this.lastRowIndex ++;
                }
            },
            insertArrRow(table, index) {
                let rowLength = table[1].length;
                let tempRow = [];
                for(let i = 0; i < rowLength; i ++) {
                    tempRow[i] = {
                        highlight: false,
                        value: '沈'
                    };
                }
                table.splice(index, 0 ,tempRow);
            },
            deleteRow() {
                this.isMenuShow = false;
                if(this.firstRowIndex == this.lastRowIndex) {
                    this.tbody.splice(this.firstRowIndex - 1, 1);
                } else if(this.firstRowIndex < this.lastRowIndex){
                    for(let i = this.firstRowIndex; i <= this.lastRowIndex; i ++) {
                        this.tbody.splice(this.firstRowIndex - 1, 1);
                    }
                    this.highlightMulti();
                } else if(this.firstRowIndex > this.lastRowIndex){
                    for(let i = this.lastRowIndex; i <= this.firstRowIndex; i ++) {
                        this.tbody.splice(this.lastRowIndex - 1, 1);
                    }
                    this.highlightMulti();
                }
            },
            deleteCol() {
                this.isMenuShow = false;
                this.deleteThead();               
                if(this.firstCellIndex == this.lastCellIndex) {
                    this.tbody.map(rows => {
                        rows.splice(this.firstCellIndex - 1, 1)
                    });
                } else if (this.firstCellIndex < this.lastCellIndex){
                    this.tbody.map(rows => {
                        for(let i = this.firstCellIndex; i <= this.lastCellIndex; i ++) {
                            rows.splice(this.firstCellIndex - 1, 1);                          
                        }
                    })
                    this.highlightMulti();
                } else if (this.firstCellIndex > this.lastCellIndex){
                    this.tbody.map(rows => {
                        for(let i = this.lastCellIndex; i <= this.firstCellIndex; i ++) {
                            rows.splice(this.lastCellIndex - 1, 1);
                        }
                    })
                    this.highlightMulti();
                }
            },
            deleteThead() {
                for(let i = 0; i <= Math.abs(this.firstCellIndex - this.lastCellIndex); i ++) {
                    this.thead.pop();
                    this.table.style.width = `${parseInt(this.table.style.width) - 100}px`;
                }
            },
            ifInner(x, y) {
                if((y - this.firstCellIndex)*(y - this.lastCellIndex) <= 0 && (x - this.firstRowIndex)*(x - this.lastRowIndex) <= 0) {
                    return false; //不在多选框内 
                }else {
                    return true; //在多选框内
                }
            },
            editContent(event) {
                // this.textarea.style.top = `${event.target.offsetTop}px`;
                // this.textarea.style.left = `${event.target.offsetLeft}px`;
                // this.textarea.autofocus = true;
                // console.log(this.textarea)

            },
            getFirstMergeVal() {
                for(let i = this.firstRowIndex; i <= this.lastRowIndex; i++){
                    for(let j = this.firstCellIndex; j <= this.lastCellIndex; j++){                     
                       if(this.tbody[i - 1][j - 1].value) {
                         // console.log(this.tbody[i - 1][j - 1].value)
                         return this.tbody[i - 1][j - 1].value;                         
                       }
                    }
                }
            },
            classify(){

                for(let i = this.firstRowIndex; i <= this.lastRowIndex; i++){
                    for(let j = this.firstCellIndex; j <= this.lastCellIndex; j++){                     
                       this.mergearr.push(this.table.rows[i].cells[j].childNodes[0].value);
                       // console.log(this.mergearr);                      
                    }   
                }
                //分类
                for(let i=0;i<this.mergearr.length;i++){
                    if(this.mergearr[i]){
                        this.Marr.push(this.mergearr[i]);
                    }else{
                        this.marr.push(this.mergearr[i]);
                    }
                }   
            },
            // 合并单元格
            merge(event){
                this.rowlength =0;
                this.celllength = 0;  
                this.mergearr=[];
                this.Marr=[];
                this.classify();
                //合并的标识
                this.door=true;                              
                this.firstR=this.firstRowIndex;
                this.lastR=this.lastRowIndex;
                this.firstC=this.firstCellIndex;
                this.lastC=this.lastCellIndex;               
                this.rowlength = this.lastRowIndex -  this.firstRowIndex +1;
                this.celllength = this.lastCellIndex - this.firstCellIndex +1;
                if(this.Marr.length == 0){
                    for(let i = this.firstRowIndex; i <= this.lastRowIndex; i++){
                       for(let j = this.firstCellIndex; j<= this.lastCellIndex; j++){
                            if(i == this.firstRowIndex && j == this.firstCellIndex){
                                    this.tbody[i - 1][j - 1].value = "";
                                    this.table.rows[i].cells[j].rowSpan = this.rowlength;
                                    this.table.rows[i].cells[j].colSpan = this.celllength;
                            }else{                                      
                                     this.table.rows[i].cells[j].style.display = "none";       
                            }              

                        }                        
                    }
                    this.isMenuShow = false;
                    this.or=true;                                                               
                }
                if(this.Marr.length == 1){
                    for(let i = this.firstRowIndex; i <= this.lastRowIndex; i++){
                       for(let j = this.firstCellIndex; j<= this.lastCellIndex; j++){
                            if(i == this.firstRowIndex && j == this.firstCellIndex){
                                    // console.log(this.getFirstMergeVal());
                                    this.beforecancelnumber = this.getFirstMergeVal();
                                    this.tbody[i - 1][j - 1].value = this.getFirstMergeVal();
                                    this.table.rows[i].cells[j].rowSpan = this.rowlength;
                                    this.table.rows[i].cells[j].colSpan = this.celllength;        
                            }else{                                      
                                     this.table.rows[i].cells[j].style.display = "none";

                            }              

                        }                        
                    }
                    this.isMenuShow = false;
                    this.or=true;       
                                                                          
                }

                if(this.Marr.length > 1){
                    this.isMenuShow = false;
                    this.box.style.display="block";
                    this.rongqi.style.display="block";
                }
                  
            },
             //确定
            sure(){
                this.box.style.display="none";
                this.rongqi.style.display="none";
                this.box.style.zIndex = "";
                 
                for(let i = this.firstRowIndex; i <= this.lastRowIndex; i++){
                   for(let j = this.firstCellIndex; j<= this.lastCellIndex; j++){
                       if(i == this.firstRowIndex && j == this.firstCellIndex){
                            this.table.rows[i].cells[j].rowSpan = this.rowlength;
                            this.table.rows[i].cells[j].colSpan = this.celllength;
                            this.beforecancelnumber = this.getFirstMergeVal();
                            this.tbody[i - 1][j - 1].value = this.getFirstMergeVal();      
                        }else{                                      
                             this.table.rows[i].cells[j].style.display = "none";       
                        }
                                      
                    }                   
                }
                this.isMenuShow = false;
                this.or=true;                                                                  
            },
            //取消
            back(){
                this.or=false;
                this.box.style.display="none";
                this.rongqi.style.display="none";
                this.door == false;
                                         
            },
            // 取消合并单元格
            cancel(){
            this.or=false;
            this.tbodyfirstRowIndex =  this.firstRowIndex-1;
                    this.tbodyfirstCellIndex =  this.firstCellIndex-1;
                    this.tbodylastRowIndex = this.lastRowIndex-1;
                    this.tbodylastCellIndex = this.lastCellIndex-1;
                    console.log(this.tbodyfirstRowIndex );
                    console.log(this.tbodyfirstCellIndex );
                    console.log(this.tbodylastRowIndex );
                    console.log(this.tbodylastCellIndex );    
                if(this.Marr.length >= 1){

                    // console.log("多个值")
                    for(let i = this.firstR; i <= this.lastR; i++){
                        for(let j = this.firstC; j<= this.lastC; j++){
                            if(i == this.firstR && j == this.firstC){
                                this.table.rows[i].cells[j].rowSpan = 1;                                     
                                this.table.rows[i].cells[j].colSpan = 1;
                                this.tbody[i - 1][j - 1].value = this.beforecancelnumber;
                            }else{    
                               this.table.rows[i].cells[j].style.display = "table-cell"; 
                               this.tbody[i-1][j-1].value = "";
                               // console.log(i);
                               // console.log(j)                 
                            }                                     
                            this.isMenuShow = false;
                            this.door == false                                           
                        }
                    }
                }
                if(this.Marr.length == 0){
                    for(let i = this.firstR; i <= this.lastR; i++){
                        for(let j = this.firstC; j<= this.lastC; j++){
                            if(i == this.firstR && j == this.firstC){
                                this.table.rows[i].cells[j].rowSpan = 1;                                     
                                this.table.rows[i].cells[j].colSpan = 1;
                                // this.table.rows[i].cells[j].childNodes[0].value = "";
                                this.tbody[i - 1][j - 1].value = "";
                            }else{    
                               this.table.rows[i].cells[j].style.display = "table-cell"; 
                               this.tbody[i-1][j-1].value = "";                  
                            }                                     
                            this.isMenuShow = false;
                            this.door == false;           
                        }
                    }
                }
                
            },
           
        },
        mounted() {
            this.table = document.getElementById('tableExcel');
            this.div = document.getElementById('div');
            this.fillhandle = document.getElementById('fillhandle');
            this.up = document.getElementById('up');
            this.down = document.getElementById('down');
            this.left = document.getElementById('left');
            this.right = document.getElementById('right');
            this.menu = document.getElementById('menu');
            this.box = document.getElementById('box');
            this.ensure = document.getElementById('ensure');
            this.rongqi = document.getElementById('rongqi');
            // this.textarea = document.getElementById('textarea');
            document.onselectstart = function() {
                return false;
            }
            document.addEventListener('mouseup', () => {

                this.table.removeEventListener('mousemove', this.mouseMoveInTable, false);
            })
        },
        
    }
</script>

<style scoped>
    #rongqi{
        width: 1281px;
        height: 419px;
        position: absolute;
        top:0;
        left:0;
        background: black;
        opacity: 0.2;
        z-index: 10;
        display:none;
    }
    #box{
        width: 320px;
        height: 170px;
        background:#fff;
        position: absolute;
        top:50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -135px;
        z-index: 1000;  
    }
    #box .text{
        width:300px;
        height:170px;

    }
    #box .text .top{
        margin-top: 20px;
        margin-left: 20px;
    }
    .mask .text span{
        font-size: 16px;
        font-weight: bold;
        color:gray;
    }
    #box .text p{
        font-size: 15px;
        margin-top: 20px;
        margin-left: 20px;
    }
    #box .text .yes{
        width: 70px;
        height: 25px;
        float: right;
        line-height: 25px;
        text-align: center;
        background:#06aea6;
        color:#fff;
        border:1px solid #ccc;
        border-radius: 3px;
        margin-right: 5px;
    }
    #box .text .no{
        width: 70px;
        height: 25px;
        float: right;
        line-height: 25px;
        text-align: center;
        background:white;
        color:gray;
        border:1px solid #ccc;
        border-radius: 3px;

    }
    .table {
        /*position: relative;*/
        border-collapse: collapse;
        border: 1px solid rgb(223, 236, 236);
        box-sizing: border-box;
        overflow: scroll;
        table-layout: fixed;
    }
    td, th {
        border: 1px solid rgb(223, 236, 236);
        font-family: normal;
        text-align: center;
        line-height: 37px;
        outline: none;
        box-sizing:border-box;
        width: 100px;
        height: 37px;
        background: #fff;
        position: relative;
    }
    td input{
        width:98px;
        height:36px;
        position: absolute;
        top: 0;
        left: 0;
        border:none;
        padding:0;
        outline: none;
    }
     th {
        background: #f5f5f5;
    }
    .highlight {
        background-color: #c7c7c7;
    }
    .highlight-cover-fillhandle {
        position: absolute;
        width: 4px;
        height: 4px;
        cursor: crosshair;
        background-color: #06aea6;
        border: solid 1px #FFFFFF;
        z-index: 17;
        /*transition: all .1s; */
    }
    .highlight-border {
        position: absolute;
        background-color: #06aea6;
        display: block;
        font-size: 0;
        box-sizing: border-box;
        /*transition: all .1s; */
    }
    .highlight-border-up, .highlight-border-down {
        height: 2px;
    }
    .highlight-border-left, .highlight-border-right {
        width: 2px;
    }
    .rightMenu {
        position: absolute;
        list-style: none;
        background-color: #fff;
        width: 130px;
       /* height: 252px;*/
        border: 1px solid #ddd;
        background: #eee;
        box-shadow: 0 2px 5px rgba(0,0,0,.5);
        z-index: 20;
        /*transition: all .1s;*/
        padding: 0;
        margin: 0;
    }
    .item {
        padding: 2px 2px 2px 18px;
        cursor: pointer;
    }
    .item:hover {
        background-color: #06aea6;
        color: #fff;
    }
    .context-menu-layer {
        position: fixed;
        z-index: 18;
        top: 0px;
        left: 0px;
        opacity: 0;
        background-color: rgb(0, 0, 0);
        width: 100%;
        height: 100%;
    }
    .textarea {
        position: absolute;
        font-size: 16px;
        padding: 7px 0px;
        outline: none;
        resize: none;
        background-color: #fff;
        border: 2px solid #06aea6;
        width: 102px;
        height: 39px;
        /* overflow-y: hidden; */
        box-sizing: border-box;
        z-index: 30;
        text-align: center;
    }
</style>