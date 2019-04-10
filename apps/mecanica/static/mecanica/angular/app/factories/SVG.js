_factories.factory('SVGFactory', ['$rootScope', 'FigureFactory', function($rootScope, FigureFactory, $timeout){

	var SVG = function(scope, selector){
		this._svg = {};
		this._scope = scope;
		this._selector = selector;
		this._zoom = {};
		this._g = {};
		this._mainG = {};
		this._widgetG = {};
		this.container;
		this._direction = 1;
		this.factor = 0.3;
		this._targetZoom = 0;
		this.savedTranslation = null;
		this.savedScale = null;

		this.real_width = scope.windowWidth;
		this.real_height = scope.windowHeight;
	};

	SVG.prototype.setTargetZoom = function(target){
		this._targetZoom = target;
	};

	SVG.prototype.getEditorOffset = function(){
		var editor = angular.element('#board-editor-zone');
		return editor.offset();
	};
	SVG.prototype.getMouseCoords = function(e){
		var offset = this.getEditorOffset();
		return [e.clientX - offset.left, e.clientY - offset.top];
	};
	SVG.prototype.wheelHandle = function(delta, e){
		var s = parseFloat(this._scope.scale);
		if( this._scope.activeBtn !== 'zoom' ){
			var t = this.setTranslate();
			t.translate[1] = t.translate[1] + (13 * delta );
			return this.zoomPan.call(this, t);
		}
		else{
			var newScale = s + (s * this.factor * delta) ;
			var t = this.setTranslate();
			t.scale = [newScale, newScale];
			t = this.findCenter(t, this.getMouseCoords(e));
			return this.zoomWheel.call(this, t);
		}
	};
	SVG.prototype.scrollHorizontal = function(direction){
		var s = parseFloat(this._scope.scale);
		var t = this.setTranslate();
		t.translate[0] = t.translate[0] + (13 * direction);
		return this.zoomPan.call(this, t);
	};
	SVG.prototype.setTranslate = function(){
		var t = d3.transform(this.container.attr("transform"));
		t.scale = [this._scope.scale, this._scope.scale];
		return t;
	};
	SVG.prototype.wheel = function(event){
		var el = angular.element(event.target);
		var isChild = el.closest('#main-svg-container').length > 0;
		if(el.is('#main-svg-container') || isChild){
	        var delta = 0;
	        if (!event) /* For IE. */
	                event = window.event;
	        if (event.wheelDelta) { /* IE/Opera. */
	                delta = event.wheelDelta/120;
	        } else if (event.detail) { /** Mozilla case. */
	                delta = -event.detail/3;
	        }
	        if (delta)
	                this.wheelHandle(delta, event);
	        if (event.preventDefault)
	                event.preventDefault();
			event.returnValue = false;
		}
	};

	SVG.prototype.doZoomStep = function(direction){
		this._direction = direction;
		var t = this.setTranslate();
    	this.zoomTo.call(this, t);
	};

	SVG.prototype.addEvents = function(){
		var self = this;
		if (window.addEventListener)
	        window.addEventListener('DOMMouseScroll', function(event){ return self.wheel.call(self, event)}, false);
		window.onmousewheel = document.onmousewheel = function(event){ return self.wheel.call(self, event)};

		d3.selectAll("button[data-zoom]").on("click", function(){
			var direction = (this.id === 'range-minus') ? -1 : 1;
			self.doZoomStep(direction);
		});
		d3.selectAll("#scale-range").on("change", function(){
			self.setTargetZoom(this.value);
			var t = self.setTranslate();
    		self.zoomSlide.call(self, t);
		});
		this._svg.on("change-percent", function(){
			var t = self.setTranslate();
			self.zoomPercent.call(self, t);
			// self._svg.call(self._zoom.event);
		});
		this._svg.on("change-fit", function(){
			var t = self.setTranslate();
			self.centerDiagram.call(self, t);
			// self._svg.call(self._zoom.event);
		});
	};

	SVG.prototype.init = function(){
		var self = this;
		//delivers an _svg background with zoom/drag context in the selector element
		//if height or width is NaN, assume it is a valid length but ignore margin
		var margin = this._scope.margin || {top: 0, right: 0, bottom: 0, left: 0};
		var unitW = isNaN(this._scope.windowWidth), unitH = isNaN(this._scope.windowHeight);
	    this.w = this._scope.windowWidth;
		this.h = this._scope.windowHeight;
		var x, y;

        this._drag = d3.behavior.drag()
        .on('dragstart', function() {
        	var t = self.setTranslate(), point = d3.mouse(this);
        	this.initData = {
        		startX : t.translate[0],
	            startY : t.translate[1],
    	        initialMouseX : point[0],
        	    initialMouseY : point[1]
			};
			this.initPoint = [(this.initData.initialMouseX-this.initData.startX)/self._scope.scale,
			                  (this.initData.initialMouseY-this.initData.startY)/self._scope.scale];
			d3.event.sourceEvent.stopPropagation();
			var attrs = self._scope.getFillProperties();
			if( self._scope.activeBtn === 'circle' ){

        		attrs = angular.extend({}, attrs, {
					rx : 50,
        			ry : 50,
        			cx : this.initPoint[0],
        			cy : this.initPoint[1]
    			});
    			var circulo = {
	          		tipo    : 'circle',
	          		attrs   : attrs
	          	};
	          	var fig  = new FigureFactory(circulo, 'new');
	          	self._scope.addEntities([fig]);
	          	setTimeout(function(){
                    self._scope.addEntityToSelection(fig);
                }, 100);
			}
			else if( self._scope.activeBtn === 'rect' || self._scope.activeBtn === 'square' ){
        		attrs = angular.extend({}, attrs, {
					x 		: this.initPoint[0],
	          		y 		: this.initPoint[1],
	          		width	: (self._scope.activeBtn === 'square' ? 100 : 150),
	          		height  : 100
    			});
    			var rect = {
	          		tipo    : (self._scope.activeBtn === 'square' ? 'square' : 'rect'),
	          		attrs   : attrs
	          	};
	          	var fig  = new FigureFactory(rect, 'new');
	          	self._scope.addEntities([fig]);
	          	setTimeout(function(){
                    self._scope.addEntityToSelection(fig);
                }, 100);
			}
			else if( self._scope.activeBtn === 'text' ){
        		attrs = angular.extend({}, attrs, {
					x 		: this.initPoint[0],
	          		y 		: this.initPoint[1],
	          		txt     : "Cuadro de texto"
    			});
    			var text = {
	          		tipo    : 'text',
	          		attrs   : attrs
	          	};
	          	var fig  = new FigureFactory(text, 'new');
	          	self._scope.addEntities([fig]);
	          	setTimeout(function(){
                    self._scope.addEntityToSelection(fig);
                }, 100);
			}
			else if( self._scope.activeBtn === 'star' || self._scope.activeBtn === 'triangle' || self._scope.activeBtn === 'rombo'){
				this.tmpEl = self._mainG.append('path')
							.attr(attrs);
        		var datum = [];
				if(self._scope.activeBtn === 'star'){
					var ratio = Math.abs(Math.sqrt(Math.pow(40, 2)+Math.pow(40, 2)));
					var point1 = [this.initPoint[0], this.initPoint[1]];
					datum.push(point1);
					var longSide = ratio/MathD.sin(18)*MathD.sin(144);

					var hyp = longSide/2/MathD.sin(54)*MathD.sin(90);
					var mediano = MathD.sin(36)*hyp;

					var cateto = hyp/MathD.sin(108)*MathD.sin(36);
					var pequenno = longSide/2-cateto;
					var point2 = [point1[0]+pequenno, point1[1]+mediano];
					datum.push(point2);
					var point3 = [point2[0]+cateto, point2[1]];
					datum.push(point3);

					var abajoY = cateto/MathD.sin(90)*MathD.sin(36);
					var atrasX = MathD.cos(36)*cateto;
					var point4 = [point3[0]-atrasX, point3[1]+abajoY];
					datum.push(point4);
					var longadj = MathD.cos(18)*longSide;
					var point5 = [point1[0]+hyp/2, point1[1]+longadj];
					datum.push(point5);
					var altura = hyp/2/MathD.sin(54)*MathD.sin(36);
					var point6 = [point1[0], point1[1]+longadj-altura];
					datum.push(point6);
					var point7 = [point1[0]-hyp/2, point5[1]];
					datum.push(point7);
					var point8 = [point1[0]-(longSide/2-atrasX), point4[1]];
					datum.push(point8);
					var point9 = [point1[0]-(longSide/2), point3[1]];
					datum.push(point9);
					var point10 = [point1[0]-(pequenno), point2[1]];
					datum.push(point10);

				}
				else if(self._scope.activeBtn === 'triangle'){
					var ratio = Math.abs(Math.sqrt(Math.pow(50, 2)+Math.pow(50, 2)));
					var point1 = [this.initPoint[0], this.initPoint[1]];
					datum.push(point1);
					var mediaHip = ratio*MathD.sin(60);
					var altura = ratio*MathD.sin(30);

					var point2 = [point1[0]+mediaHip, point1[1]+ratio+altura];
					datum.push(point2);
					var point3 = [point2[0]-mediaHip*2, point2[1]];
					datum.push(point3);
				}
				else if(self._scope.activeBtn === 'rombo'){
					var ratio = Math.abs(Math.sqrt(Math.pow(37, 2)+Math.pow(37, 2)));
					var point1 = [this.initPoint[0], this.initPoint[1]];
					var menor = MathD.sin(61)*ratio;
					datum.push(point1);
					if( ratio ){
						var point2 = [point1[0]+menor, point1[1]+ratio];
						datum.push(point2);
						var point3 = [point1[0], point1[1]+2*ratio];
						datum.push(point3);
						var point4 = [point1[0]-menor, point1[1]+ratio];
						datum.push(point4);
			        }
				}

		        this.tmpEl.datum(datum);
				this.tmpEl.call(positionPath);
				var data = this.tmpEl.node().getBoundingClientRect();
        		attrs = angular.extend({}, attrs, {
					x: this.initPoint[0]-(data['width']/self._scope.scale)/2,
          			y: this.initPoint[1],
          			datum : angular.toJson(this.tmpEl.datum()),
          			width: data['width']/self._scope.scale,
          			height: data['height']/self._scope.scale,
          			stroke: this.tmpEl.attr('stroke'),
    				"stroke-width": this.tmpEl.attr('stroke-width'),
    				"stroke-dasharray": this.tmpEl.attr('stroke-dasharray'),
	          		d 		: this.tmpEl.attr('d'),
	          		z 		: 0
    			});
				var poly = {
	          		tipo    : self._scope.activeBtn,
	          		attrs   : attrs
	          	};
	          	this.tmpEl.remove();
	          	var fig  = new FigureFactory(poly, 'new');
	          	self._scope.addEntities([fig]);
	          	setTimeout(function(){
                    self._scope.addEntityToSelection(fig);
                }, 100);
        	}
			else if(self._scope.activeBtn === 'select' && self._scope.shortcut !== 'move'){
				self._scope._sel_wrapper = {
					x  : this.initData.initialMouseX-this.initData.startX,
					y  : this.initData.initialMouseY-this.initData.startY,
					x1 : this.initData.initialMouseX-this.initData.startX,
					y1 : this.initData.initialMouseY-this.initData.startY,
					first: true
				};
			}
		});
		this._drag.on('drag', function() {
			 if( self._scope.activeBtn === 'move' || self._scope.shortcut === 'move' ){
				var t = self.setTranslate();
				var point = d3.mouse(this);
				var dx = point[0] - this.initData.initialMouseX;
            	var dy = point[1] - this.initData.initialMouseY;
				t.translate[0] = dx + this.initData.startX;
				t.translate[1] = dy + this.initData.startY;
				self.zoomPan.call(self, t);
			}
			else if(self._scope.activeBtn === 'select' && self._scope.shortcut !== 'move'){
				if(this.initData === true){
					this.initData.first = false;
					self._scope.clearEntitySelection(true);
				}
				var point = d3.mouse(this);
				var t = self.setTranslate();
				var data = {
					x  : this.initData.initialMouseX-this.initData.startX,
					y  : this.initData.initialMouseY-this.initData.startY,
					x1 : point[0]-this.initData.startX,
					y1 : point[1]-this.initData.startY
				};
				self._scope.watchBoundingEntities(data);
			}
		});
		this._drag.on('dragend', function() {
			if(self._scope.activeBtn === 'select'){
				if(self._scope._sel_wrapper &&
					self._scope._sel_wrapper.x !== self._scope._sel_wrapper.x1 &&
					self._scope._sel_wrapper.y !== self._scope._sel_wrapper.y1){
					self._scope.selecting_wrapper = true;
					setTimeout(function(){
		      			self._scope.selecting_wrapper = false;
			      	}, 100);
				}
				self._scope._sel_wrapper = null;
				self._scope.safeApply();
			}
		});

        this._svg = this._selector.selectAll("svg").data([["transform root"]]);
        this._svg
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(this._drag);

        // this.initBrushEvent();

	    this.addEvents();

	    this._svg.h = this.h;
	    this._svg.w = this.w;

	    this._svg.container = function(selector){
	        var d3_data, d3_datum;
	        if(selector) {
	            self.container = self._svg.selectAll(selector);
	            // temporarily subclass container
	            d3_data = self.container.data;
	            d3_datum = self.container.datum;
	            // need a reference to the update selection
	            // so force data methods back to here
	            self.container.data = function() {
	                delete self.container.data;  // remove the sub-classing
	                return self.container = d3_data.apply(self.container, arguments)
	            }
	        }
	        return self.container;
	    };

	    // d3.rebind(this._svg, this._zoom, "translate");
	    // d3.rebind(this._svg, this._zoom, "scale");

	    var content = this._svg.container("g#nodes-wrapper");
	    var tInit = 'translate(0,0),scale('+this._scope.scale+','+this._scope.scale+')';
	    content.attr("transform", tInit);
	    this._mainG = d3.selectAll("g#nodes-wrapper");

	    return this._svg;

	    function noop(){};

	    function subclass(x, post){
	        // hook a post-processor to all methods of x
	        return Object.keys(x).reduce(function(s, k) {
	            return (s[k] = function() {
	                var ret = x[k].apply(x, arguments);
	                post();
	                return ret;
	            }, s)
	        }, {})
	    }
	};

	SVG.prototype.findCenter = function(t, center0){
		var self = this;
		var center0 = center0 || [this._scope.windowWidth/2, this._scope.windowHeight/2];
		var transform = d3.transform(this.container.attr("transform"));
		var translate0 = transform.translate;
		var coordinates0 = [(center0[0] - translate0[0]) / transform.scale[0], (center0[1] - translate0[1]) / transform.scale[0]];
		  // Translate back to the center.
		var center1 = [coordinates0[0] * t.scale[0] + translate0[0], coordinates0[1] * t.scale[0] + translate0[1]];

		t.translate[0] = translate0[0] + center0[0] - center1[0];
		t.translate[1] = translate0[1] + center0[1] - center1[1];
		return t;
    };

    SVG.prototype.doTransition = function(t, time){
    	var self = this;
    	if( !(!!time)){
    		time = 500;
    	}
    	this.container.transition().duration(time).attrTween("transform", function(){
	    	var tInit = d3.transform(self.container.attr("transform"));
		    var scaleI = d3.interpolate(tInit.scale[0], t.scale[0]);
		    var leftI = d3.interpolate(tInit.translate[0], t.translate[0]);
		    var topI = d3.interpolate(tInit.translate[1], t.translate[1]);
		    var goalT = t;
		      return function(val) {
		      	var l = leftI(val), t = topI(val), s = scaleI(val);
		      	self._scope.updateSVGVars(l,t,s);
		      	var nTrans = 'translate('+l+','+t+'),scale('+s+','+s+')';
		      	// self._scope.$broadcast('_positionChangedUpdate');
		      	if(l == goalT.translate[0] && t == goalT.translate[1] && s == goalT.scale[0]){
		      		setTimeout(function(){
		      			self._scope.$broadcast('_positionChangedUpdate');
		      			// self._scope.$broadcast('_positionChangedFinished');
			      	}, 1);
		      	}
		      	return nTrans;
		      };
        });
        // setTimeout(function(){
        // 	console.log('call reset widths and positions');
        // }, time+50)
    };

	SVG.prototype.panMinimap = function(dx, dy){
		var t = d3.transform(this.container.attr("transform"));
		t.translate[0] += -dx;
		t.translate[1] += -dy;
		this.doTransition(t);
	};

	SVG.prototype.zoomPan = function(t){
		var self = this;
		self.container.attr("transform", t.toString());
        var style = 'left: '+t.translate[0]+'px; top: '+t.translate[1]+'px; font-size: '+t.scale[0]*100+'px;';
        d3.selectAll('#widgets-container').attr('style', style);
        self._scope.updateSVGVars(t.translate[0],t.translate[1]);
        self._scope.$broadcast('_positionChangedUpdate');
	};

    SVG.prototype.zoomTo = function(t){
    	var self = this;
    	this._targetZoom = this._scope.scale * (1 + (this._direction ? (this.factor * this._direction) : 1 ));
    	t.scale = [this._targetZoom,this._targetZoom];
		t = this.findCenter(t);
        this.doTransition(t);
    };

    SVG.prototype.zoomSlide = function(t){
    	var self = this;
    	t.scale = [this._targetZoom,this._targetZoom];
    	t = this.findCenter(t);
    	this.doTransition(t);
    };

    SVG.prototype.zoomPercent = function(t){
    	var self = this;
    	t.scale = [this._targetZoom,this._targetZoom];
    	t = this.findCenter(t);
    	this.doTransition(t);
    };

    SVG.prototype.zoomWheel = function(t){
    	var self = this;
    	this.doTransition(t);
    };

    SVG.prototype.centerDiagram = function(t){
  		var self = this;
    	function getViewBox(){
            var w = self._scope.widgetsContainerWith.right - self._scope.widgetsContainerWith.left,
                h = self._scope.widgetsContainerWith.bottom - self._scope.widgetsContainerWith.top;
                return {
                    w:(w ? w : self._scope.windowWidth),
                    h:(h ? h : self._scope.windowHeight),
                    l:(self._scope.widgetsContainerWith.left),
                    t:(self._scope.widgetsContainerWith.top)
                };
        }
        var scale = 1.00;
        var vb = getViewBox();
        var iterations = 0;
        while ((vb.w*scale > this._scope.windowWidth || vb.h*scale > this._scope.windowHeight)){
			scale -= 0.01;
			iterations++;
		}
		var time = null;
		if(iterations > 50){
			time = 1000;
		}

		t.scale = [scale,scale];
		var center = [this._scope.windowWidth/2, this._scope.windowHeight/2];
		t.translate[0] = -this._scope.transformX*scale;
		t.translate[1] = -this._scope.transformY*scale;
    	this.doTransition(t,time);

    };

    SVG.prototype.centerElement = function(figure, scale){
    	var data={};
    	var contOffset = angular.element('#board-editor-zone').offset();
    	var center = [this._scope.windowWidth/2, this._scope.windowHeight/2];
    	var realBoxArea = {
    		width : this._scope.windowWidth ,
    		height: this._scope.windowHeight
    	};
    	var svgCont = this._mainG.node().getBoundingClientRect();
    	var t = d3.transform(this.container.attr("transform"));
    	scale = scale || 1;
    	var fontSize = scale*100;

    	function getTransformProp(){
    		data.width = figure.getAttr('width');
			data.height = figure.getAttr('height');
    		if(figure.isWidget()){
				data.left = figure.getAttr('x')*fontSize/scale *scale;
				data.top = figure.getAttr('y')*fontSize/scale *scale;
			}else{
				data.left = figure.getAttr('x')*scale;
				data.top = figure.getAttr('y')*scale;
			}

			t.translate[0] = center[0] - (data.left + data.width*scale/2);
			t.translate[1] = center[1] - (data.top + data.height*scale/2);
			t.scale = [scale, scale];
			return t;
    	}

    	do {
		   t = getTransformProp(data, scale);
		   scale = scale - 0.1
		} while ((data.width*(scale)+50 > realBoxArea.width || data.height*(scale)+50 > realBoxArea.height));

    	this.doTransition(t);
    };

    SVG.prototype.freeDraw = function(specific_line){
		if( this._scope.activeBtn !== 'path'){ return; }
		var self = this;
		var lines;
		var g = d3.select("#drawing-group");
	    lines = g.selectAll('.line-stroke').data([specific_line]);
	    lines.enter().append('path').attr(specific_line.attrs)
	    .each(function(d) {
	        return d.elem = d3.select(this);
	    });
	    var t = d3.transform(self.container.attr("transform"));
	    lines.attr({
	        d: function(d) {
	            return d3.svg.line().x(function(d) {
				    return (d[0] - t.translate[0])/self._scope.scale;
				}).y(function(d) {
				    return (d[1] - t.translate[1])/self._scope.scale;
				}).interpolate('basis')(d.points);
	        }
	    });
	    return lines.exit().remove();
    };

	SVG.prototype.updateAxis = function(){
		var svg = this._g;
		var x = d3.scale.linear()
                .domain([-svg.w/2, svg.w/2])
                .range([0, svg.w]),
            y = d3.scale.linear()
                .domain([-svg.h/2, svg.h/2])
                .range([0, svg.h]);
        this.xAxis = d3.svg.axis()
                .scale(x)
                .orient("top")
                .tickSize(svg.h);
        this.yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickSize(-svg.w);

	    svg
	        .xScale(x)
	        .yScale(y)
	        .xAxis(this.xAxis)
	        .yAxis(this.yAxis);
	};

	return SVG;
}]);
function id(d){return d;}
function myName(args) {
    return /function\s+(\w*)\(/.exec(args.callee)[1];
};
positionPath = function(path){
	path.attr("d", function(d){ return "M" + d.join("L") + "Z" });
};
d3.selection.prototype.trigger = function( event ) {
    var e = document.createEvent('Event');
    e.initEvent( event, true, true);
    this.each( function( d ) {
        this.dispatchEvent( e );
    });
   return this;
}

render_line = d3.svg.line().x(function(d) {
    return d[0];
  }).y(function(d) {
    return d[1];
}).interpolate('basis');