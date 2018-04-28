(function(window){var svgSprite='<svg><symbol id="icon-zhuyi" viewBox="0 0 1024 1024"><path d="M512 0c282.752 0 512 229.248 512 512 0 282.794667-229.248 512-512 512S0 794.794667 0 512C0 229.290667 229.248 0 512 0z m0 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768z m-42.666667-298.538667v-341.333333h85.333334v341.333333h-85.333334z m0 170.666667v-85.333333h85.333334v85.333333h-85.333334z" fill="#FE9901" ></path></symbol><symbol id="icon-charutubiao" viewBox="0 0 1024 1024"><path d="M800 1024C678.4 1024 576 921.6 576 800S678.4 576 800 576s224 102.4 224 224-102.4 224-224 224z m0-384c-89.6 0-160 70.4-160 160s70.4 160 160 160 160-70.4 160-160-70.4-160-160-160zM512 768H384c-38.4 0-64-25.6-64-64V64c0-38.4 25.6-64 64-64h128c38.4 0 64 25.6 64 64v556.8l-6.4 6.4c-25.6 32-44.8 70.4-51.2 115.2L512 768zM384 64v640h76.8c12.8-38.4 25.6-76.8 51.2-108.8V64H384zM192 768H64c-38.4 0-64-25.6-64-64V256c0-38.4 25.6-64 64-64h128c38.4 0 64 25.6 64 64v448c0 38.4-25.6 64-64 64zM64 256v448h128V256H64z m0-32V256v-32z m576 332.8V320c0-38.4 25.6-64 64-64h128c38.4 0 64 25.6 64 64v204.8l-38.4-6.4c-57.6-12.8-121.6-6.4-172.8 19.2l-44.8 19.2zM704 320v140.8c38.4-12.8 83.2-12.8 128-12.8V320h-128z" fill="#CCCCCC" ></path><path d="M704 768h192v64h-192z" fill="#CCCCCC" ></path><path d="M768 704h64v192h-64z" fill="#CCCCCC" ></path></symbol><symbol id="icon-shanchu" viewBox="0 0 1024 1024"><path d="M256 0h512v128H256zM0 128h1024v128H0zM896 1024H128V256h768v768zM256 896h512V384H256v512z" fill="#F36969" ></path><path d="M384 448h64v320H384zM576 448h64v320H576z" fill="#F36969" ></path></symbol><symbol id="icon-hebingxingzhuang" viewBox="0 0 1097 1024"><path d="M928.914286 1024l-14.628572-73.142857c-36.571429-160.914286-168.228571-285.257143-336.457143-307.2V877.714286L0 438.857143l577.828571-438.857143v234.057143c270.628571 0 482.742857 204.8 482.742858 460.8 0 95.085714-29.257143 182.857143-87.771429 263.314286l-43.885714 65.828571zM504.685714 563.2h36.571429c182.857143 14.628571 343.771429 131.657143 409.6 292.571429 21.942857-51.2 36.571429-102.4 36.571428-160.914286 0-219.428571-182.857143-394.971429-416.914285-394.971429h-65.828572V138.971429L109.714286 438.857143l394.971428 299.885714V563.2z" fill="#979797" ></path></symbol><symbol id="icon-gongshi" viewBox="0 0 1024 1024"><path d="M512 1024c-281.6 0-512-230.4-512-512s230.4-512 512-512 512 230.4 512 512-230.4 512-512 512zM512 64C262.4 64 64 262.4 64 512s198.4 448 448 448 448-198.4 448-448-198.4-448-448-448z" fill="#CCCCCC" ></path><path d="M313.6 704V416h-51.2v-44.8h51.2v-32c0-19.2 0-38.4 6.4-51.2 0-12.8 12.8-25.6 25.6-38.4 12.8-6.4 32-12.8 57.6-12.8 12.8 0 32 0 51.2 6.4l-6.4 51.2h-32c-19.2-6.4-32 0-38.4 6.4s-12.8 19.2-12.8 38.4v32h64v44.8h-64V704h-51.2zM441.6 704l121.6-172.8L448 371.2h70.4L569.6 448c6.4 19.2 19.2 32 19.2 38.4 12.8-12.8 19.2-25.6 25.6-38.4l57.6-76.8h64L627.2 531.2l121.6 172.8h-70.4l-64-102.4-19.2-25.6-89.6 128h-64z" fill="#CCCCCC" ></path></symbol><symbol id="icon-shousuolan" viewBox="0 0 1228 1024"><path d="M0 0h1228.8v102.4H0zM409.6 460.8h819.2v102.4H409.6zM0 512l204.8-102.4v204.8zM0 921.6h1228.8v102.4H0z" fill="#bfbfbf" ></path></symbol><symbol id="icon-icon-zengjia" viewBox="0 0 1024 1024"><path d="M448 448V0h128v448h448v128H576v448H448V576H0V448h448z" fill="#06AEA6" ></path></symbol><symbol id="icon-icon-zhibiaoku" viewBox="0 0 1024 1024"><path d="M102.4 0h819.2a102.4 102.4 0 0 1 102.4 102.4v819.2a102.4 102.4 0 0 1-102.4 102.4H102.4a102.4 102.4 0 0 1-102.4-102.4V102.4a102.4 102.4 0 0 1 102.4-102.4z m51.2 409.6v460.8h102.4V409.6H153.6z m204.8-153.6v614.4h102.4V256H358.4z m204.8 256v358.4h102.4v-358.4h-102.4z m204.8 102.4v256h102.4v-256h-102.4z" fill="#06AEA6" ></path></symbol><symbol id="icon-icon-luruzhibiao" viewBox="0 0 1024 1024"><path d="M870.4 972.8l153.6 0 0 51.2-153.6 0 0-51.2Z" fill="#666666" ></path><path d="M665.6 972.8l153.6 0 0 51.2-153.6 0 0-51.2Z" fill="#666666" ></path><path d="M870.4 365.6704L212.0704 1024H102.4a102.4 102.4 0 0 1-102.4-102.4V102.4a102.4 102.4 0 0 1 102.4-102.4h665.6a102.4 102.4 0 0 1 102.4 102.4v263.2704zM204.8 153.6a51.2 51.2 0 1 0 0 102.4h307.2a51.2 51.2 0 0 0 0-102.4H204.8z m0 256a51.2 51.2 0 1 0 0 102.4h204.8a51.2 51.2 0 1 0 0-102.4H204.8z m0 256a51.2 51.2 0 0 0 0 102.4h102.4a51.2 51.2 0 0 0 0-102.4H204.8z" fill="#666666" ></path><path d="M204.8 870.4h153.6v153.6H204.8zM735.4368 635.5968l108.032 108.0832-217.1904 217.2416-108.032-108.0832 217.1904-217.2416z m108.5952-108.5952l108.0832 108.032-72.3968 72.448-108.032-108.032 72.3456-72.448z m-380.416 488.448l18.432-126.4128 108.032 108.032-126.464 18.432z" fill="#666666" ></path></symbol><symbol id="icon-CellCheck" viewBox="0 0 1210 1024"><path d="M139.636364 512L0 651.636364l372.363636 372.363636 837.818182-791.272727L1070.545455 93.090909 372.363636 744.727273z" fill="#06AEA6" ></path></symbol><symbol id="icon-close" viewBox="0 0 1024 1024"><path d="M1024 102.4L921.6 0 512 409.6 102.4 0 0 102.4 409.6 512 0 921.6 102.4 1024 512 614.4l409.6 409.6 102.4-102.4L614.4 512z" fill="#CCCCCC" ></path></symbol></svg>';var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)