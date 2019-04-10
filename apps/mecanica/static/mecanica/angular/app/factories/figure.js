_factories.factory('FigureFactory', function($rootScope){

	var FIGURE = function(config, state, is_section){
		this.type = config.tipo;
		this.widget = undefined;
		this.state = state;
		this.initConfig = config;
		this.saving = false;
		this.resetAttrs = function(attrs){
			this.attrs = angular.fromJson(attrs);
		}
		this.uuid = function(){
			return _uuid();
		};
		this.setOptions = function(){
			var self = this;
			angular.forEach(config, function(value, key) {
				if(key == 'attrs'){
					self[key] = angular.fromJson(value);
				}else{
					self[key] = value;
				}
	        });
			if( !this.id ){
				this.id = this.uuid();
			}
		};
		this.setOptions();
	};

	FIGURE.prototype.getDashArray = function(){
		if(this.getAttr('stroke-width')){
			this.getAttr('stroke-dasharray')
		}
	};
	FIGURE.prototype.cloneDefaultProperties = function(){
		this.id = app.conceptboard.uuid();
        this.state = 'new';
        var plus = 10;
        if(this.attrs.hasOwnProperty('x') && this.attrs.hasOwnProperty('y')){
			this.attrs['x'] += plus;
			this.attrs['y'] += plus;
        }
        if(this.attrs.hasOwnProperty('cx') && this.attrs.hasOwnProperty('cy')){
			this.attrs['cx'] += plus;
			this.attrs['cy'] += plus;
        }
        if(this.attrs.hasOwnProperty('x1') && this.attrs.hasOwnProperty('x2')){
			this.attrs['x1'] += plus;
			this.attrs['x2'] += plus;
			this.attrs['y1'] += plus;
			this.attrs['y2'] += plus;
        }
        this.setAttr('z', this.getAttr('z'));
        this.widget = undefined;
	};
	FIGURE.prototype.setWidget = function(){
		var el = d3.selectAll('#WDG_'+this.id);
		this.widget = el.node();
	};
	FIGURE.prototype.getWidget = function(){
		if(this.widget === undefined || !this.widget){
			this.setWidget();
		}
		return this.widget.getBoundingClientRect() || undefined;
	};
	FIGURE.prototype.getCenter = function(pos, fontSize){
		var center = [this.getAttr('x') + this.getAttr('width')/2, this.getAttr('y') + this.getAttr('height')/2];
		if( pos != undefined )
			return center[pos];
		return center;
	};
	FIGURE.prototype.getRealCenter = function(){
		var data = this.getWidget();
		if( data != undefined ){
			return [data['x'] + data['width']/2, data['y'] + data['height']/2];
		}
		return this.getCenter();
	};
	FIGURE.prototype.setId = function(id){
		this.id = id;
	};
	FIGURE.prototype.setAttr = function(key, value, noChange){
// console.log('old value: '+this.attrs[key]+ ' newValue: '+value + ' setAttr: '+key+' noChange: '+!!noChange);
		if(this.attrs[key] !== value){
			this.attrs[key] = value;
			if(!(!!noChange) && this.state !== 'new'){
				this.changeState('unsaved');
			}
		}
        return this;
	};
	FIGURE.prototype.getAttr = function(key, defVal, scale){
		if( (key === 'x' || key === 'y') && (this.type === 'line' || this.type === 'arrow' || this.type === 'marker') ){
			return Math.min(this.attrs[key+'1'],this.attrs[key+'2']);
		}
		if( (key === 'x' || key === 'y') && (this.type === 'circle') ){
			return this.attrs['c'+key] - this.attrs['r'+key];
		}
		if( (key === 'width') && (this.type === 'line' || this.type === 'arrow' || this.type === 'marker') ){
			return Math.abs(parseFloat(this.attrs['x1'])-parseFloat(this.attrs['x2']));
		}
		if( (key === 'height') && (this.type === 'line' || this.type === 'arrow' || this.type === 'marker') ){
			return Math.abs(parseFloat(this.attrs['y1'])-parseFloat(this.attrs['y2']));
		}
		if( (key === 'width') && (this.type === 'circle') ){
			return parseFloat(this.attrs['rx'])*2;
		}
		if( (key === 'height') && (this.type === 'circle') ){
			return parseFloat(this.attrs['ry'])*2;
		}
		if( key === 'height' && this.type === 'text'){
			return this.getRealHeight()/(scale||1);
		}
		if( key === 'width' && this.type === 'text'){
			return this.getRealWidth()/(scale||1);
		}

		if(this.attrs && this.attrs.hasOwnProperty(key)){
			return this.attrs[key];
		}
		else if(defVal != undefined){
			return defVal;
		}
		return false;
	};
	FIGURE.prototype.left = function(){
		var x = parseFloat(this.getAttr('x'));
		return x;
	};
	FIGURE.prototype.top = function(){
        var y = parseFloat(this.getAttr('y'));
		return y;
	};
	FIGURE.prototype.topHalf = function(s1, s2){
        var y = parseFloat(this.getAttr('y'));
        var half = parseFloat(this.getRealHeight())/2;
		half = half / s2;
		return y+half;
	};
	FIGURE.prototype.getRealWidth = function(){
		return this.getWidget().width;
	};
	FIGURE.prototype.getRealHeight = function(){
		return this.getWidget().height;
	};
	FIGURE.prototype.allowUniformResize = function(){
		return this.type !== 'image' && this.type !== 'video';
	};
	FIGURE.prototype.changeState = function(state){
// console.log('change state from: '+this.state+' TO: '+state);
		this.state = state;
		return this;
	};
	FIGURE.prototype.isSection = function(){
		return this.is_section;
	};
	FIGURE.prototype.getSectionCenter = function(){
		return this.getAttr('x') + this.getAttr('width')/2;
	};
	FIGURE.prototype.needSave = function(){
		return this.state !== 'saved' && !(!!this.saving);
	};
	FIGURE.prototype.toJson = function(){
		var json = {
			id	: this.id,
			tipo: this.type,
			state: this.state,
			nombre: this.nombre,
			codigo: this.codigo,
			tipo_operacion: this.tipo_operacion,
			attrs: angular.toJson(this.attrs)
		};
		if(this.isSection()){
			json.name = this.nombre || "";
			json.show_name = this.show_nombre || false;
		}

        return json;
	};
	FIGURE.prototype.showArrow = function(){
		return this.getAttr('x1') !== this.getAttr('x2') ||  this.getAttr('y1') !== this.getAttr('y2');
	};
	FIGURE.prototype.setPreviousState = function(){
		var state = this.getActualState();
		this.previous_state = angular.copy(state);
	};
	FIGURE.prototype.getPreviousState = function(){
		return this.previous_state;
	};
	FIGURE.prototype.getActualState = function(){
		var obj_state = {
			attrs 		: this.attrs
		};
		return obj_state;
	};
	FIGURE.prototype.goToState = function(state){
		this.attrs = state.attrs;
	};

	return FIGURE;

});