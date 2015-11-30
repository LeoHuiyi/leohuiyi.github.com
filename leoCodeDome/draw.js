var doc = document,
    canvas = doc.getElementById('canvas'),
    colorDiv = doc.getElementById('canvas-color'),
    brushDiv = doc.getElementById('canvas-brush'),
    controlDiv = doc.getElementById('canvas-control'),
    drawImageDiv = doc.getElementById('canvas-drawImage'),
    imgDiv = doc.getElementById('imgDiv');

function Canvas() {
    this.init.apply(this, arguments);
}
Canvas.prototype = {
    //存储当前表面状态数组-上一步
    preDrawAry: [],
    //存储当前表面状态数组-下一步
    nextDrawAry: [],
    //中间数组
    middleAry: [],
    //配置参数
    confing: {
        lineWidth: 1,
        lineColor: "blue",
        shadowBlur: 2
    },
    init: function(oCanvas, oColor, oBrush, oControl, oDrawImage, imgDiv) {
        this.canvas = oCanvas;
        this.context = oCanvas.getContext('2d');
        this.colorDiv = oColor;
        this.brushDiv = oBrush;
        this.controlDiv = oControl;
        this.drawImageDiv = oDrawImage;
        this.imgDiv = imgDiv;
        this._initDraw();
        this._draw(oCanvas);
        this.setColor();
        this.setBrush();
        this.preClick();
        this.nextClick();
        this.clearClick();
        this.drawImage(oCanvas);
    },
    _initDraw: function() {
        var preData = this.context.getImageData(0, 0, 600, 400);
        //空绘图表面进栈
        this.middleAry.push(preData);
    },
    //涂鸦主程序
    _draw: function(oCanvas, context) {
        var _this = this;
        oCanvas.onmousedown = function(e) {
            var x = e.clientX,
                y = e.clientY,
                left = this.parentNode.offsetLeft,
                top = this.parentNode.offsetTop,
                canvasX = x - left,
                canvasY = y - top;
            _this._setCanvasStyle();
            //清除子路径
            _this.context.beginPath();
            _this.context.moveTo(canvasX, canvasY);
            //当前绘图表面状态
            var preData = _this.context.getImageData(0, 0, 600, 400);
            //当前绘图表面进栈
            _this.preDrawAry.push(preData);
            document.onmousemove = function(e) {
                var x2 = e.clientX,
                    y2 = e.clientY,
                    t = e.target,
                    canvasX2 = x2 - left,
                    canvasY2 = y2 - top;
                if (t == oCanvas) {
                    _this.context.lineTo(canvasX2, canvasY2);
                    _this.context.stroke();
                } else {
                    _this.context.beginPath();
                }
            }
            document.onmouseup = function(e) {
                var t = e.target;
                if (t == oCanvas) {
                    //当前绘图表面状态
                    var preData = _this.context.getImageData(0, 0, 600, 400);
                    if (_this.nextDrawAry.length == 0) {
                        //当前绘图表面进栈
                        _this.middleAry.push(preData);
                    } else {
                        _this.middleAry = [];
                        _this.middleAry = _this.middleAry.concat(_this.preDrawAry);
                        _this.middleAry.push(preData);
                        _this.nextDrawAry = [];
                        $('.js-next-control').addClass('next-control');
                        $('.next-control').removeClass('js-next-control');
                    }

                    _this._isDraw();
                }
                this.onmousemove = null;
            }
        }
    },
    //设置画笔
    _setCanvasStyle: function() {
        this.context.lineWidth = this.confing.lineWidth;
        this.context.shadowBlur = this.confing.shadowBlur;
        this.context.shadowColor = this.confing.lineColor;
        this.context.strokeStyle = this.confing.lineColor;
    },
    //设置颜色
    setColor: function() {
        this.colorDiv.onclick = this.bind(this, this._setColor);
    },
    _setColor: function(e) {
        var t = e.target;
        if (t.nodeName.toLowerCase() == "li") {
            this.confing.lineColor = t.style.backgroundColor;
            $('.js-border-color').removeClass('js-border-color');
            $(t).addClass('js-border-color');
        }
    },
    //设置画笔大小
    setBrush: function() {
        this.brushDiv.onclick = this.bind(this, this._setBrush);
    },
    _setBrush: function(e) {
        var t = e.target;
        if (t.nodeName.toLowerCase() == "span") {
            if (t.className.indexOf("small-brush") >= 0) {
                this.confing.lineWidth = 3;
            } else if (t.className.indexOf("middle-brush") >= 0) {
                this.confing.lineWidth = 6;
            } else if (t.className.indexOf("big-brush") >= 0) {
                this.confing.lineWidth = 12;
            }
            $('.js-bg-color').removeClass('js-bg-color');
            $(t).addClass('js-bg-color');
        }
    },
    //判断是否已涂鸦,修改按钮状态
    _isDraw: function() {
        if (this.preDrawAry.length) {
            $('.return-control').addClass('js-return-control');
            $('.return-control').removeClass('return-control');
            $('.empty-control').addClass('js-empty-control');
            $('.empty-control').removeClass('empty-control');
        } else {
            return false;
        }
    },
    //点击上一步-改变涂鸦当前状态
    preClick: function() {
        var pre = this.controlDiv.getElementsByTagName("span")[0];
        pre.onclick = this.bind(this, this._preClick);
    },
    _preClick: function() {
        if (this.preDrawAry.length > 0) {
            var popData = this.preDrawAry.pop();
            var midData = this.middleAry[this.preDrawAry.length + 1];
            this.nextDrawAry.push(midData);
            this.context.putImageData(popData, 0, 0);
        }
        if (this.nextDrawAry.length) {
            $('.next-control').addClass('js-next-control');
            $('.next-control').removeClass('next-control');
        }
        if (this.preDrawAry.length == 0) {
            $('.js-return-control').addClass('return-control');
            $('.return-control').removeClass('js-return-control');
        }
    },
    //点击下一步-改变涂鸦当前状态
    nextClick: function() {
        var next = this.controlDiv.getElementsByTagName("span")[1];
        next.onclick = this.bind(this, this._nextClick);
    },
    _nextClick: function() {
        if (this.nextDrawAry.length) {
            var popData = this.nextDrawAry.pop();
            var midData = this.middleAry[this.middleAry.length - this.nextDrawAry.length - 2];
            this.preDrawAry.push(midData);
            this.context.putImageData(popData, 0, 0);
        }
        if (this.preDrawAry.length) {
            $('.return-control').addClass('js-return-control');
            $('.return-control').removeClass('return-control');
        }

        if (this.nextDrawAry.length == 0) {
            $('.js-next-control').addClass('next-control');
            $('.next-control').removeClass('js-next-control');
        }
    },
    //清空
    clearClick: function() {
        var clear = this.controlDiv.getElementsByTagName("span")[2];
        clear.onclick = this.bind(this, this._clearClick);
    },
    _clearClick: function() {
        var data = this.middleAry[0];
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.preDrawAry = [];
        this.nextDrawAry = [];
        this.middleAry = [this.middleAry[0]];
        this.controlDiv.getElementsByTagName("span")[0].className = "return-control";
        this.controlDiv.getElementsByTagName("span")[1].className = "next-control";
        this.controlDiv.getElementsByTagName("span")[2].className = "empty-control";
    },
    //生成图像
    drawImage: function() {
        var btn = this.drawImageDiv.getElementsByTagName("button")[0];
        btn.onclick = this.bind(this, this._drawImage);
    },
    _drawImage: function() {
        var url = this.canvas.toDataURL('image/png'),
            img = new Image();
        img.src = url;
        this.imgDiv.innerHTML = "";
        this.imgDiv.appendChild(img);
    },
    bind: function(obj, handler) {
        return function() {
            return handler.apply(obj, arguments);
        }
    }
}
new Canvas(canvas, colorDiv, brushDiv, controlDiv, drawImageDiv, imgDiv);
