_filters.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
_filters.filter('truncate', function() {
    'use strict';
    return function(input, limit) {
        if (input) {
            if (limit > input.length) {
                return input.slice(0, limit);
            } else {
                return input.slice(0, limit) + '...';
            }
        }
    };
});
_filters.filter('txtlines', function() {
    'use strict';
    return function(input) {
        if (input) {
            return input.split('\n');
        }
    };
});
_filters.filter('flt_tipo', function() {
    return function(items, flt) {
        var filtered = [];
        angular.forEach(items, function(el) {
            if(flt == ''){
                filtered.push(el);
            }else if(flt == el.tipo){
                filtered.push(el);
            }
        });
        return filtered;
    };
});
_filters.filter('flt_manufactura', function() {
    return function(items, flt) {
        var filtered = [];
        angular.forEach(items, function(el) {
            if(flt == ''){
                filtered.push(el);
            }else if(flt == el.manufactura){
                filtered.push(el);
            }
        });
        return filtered;
    };
});
_filters.filter('firstLetter', function() {
    return function(input) {
        if(input){
            return input.substr(0,1).toUpperCase();
        }
        return '';
    };
});
_filters.filter('costMonth', function() {
    return function(date) {
        var $today = new Date();
        var $date = new Date(date);
        if($today.getFullYear() !== $date.getFullYear()){
            return $date.getFullYear()+': '+_filters.months[$date.getMonth()];
        }
        return _filters.months[$date.getMonth()];
    };
});
_filters.filter('fontClass', function() {
    return function(fontName) {
        return "w-font-"+fontName.replace(" ", "-");
    };
});
_filters.filter('abs', function() {
    return function(value) {
        return Math.abs(value);
    };
});
_filters.filter('defaultPicture', function($rootScope) {
    return function(image) {
        if(!image){
            return $rootScope.ADMIN_CONFIG.defaults.image;
        }
        return image;
    };
});
_filters.filter('diffDays', function() {
    return function(date, dateStart) {
        var date1 = dateStart ? new Date(dateStart) : new Date();
        var date2 = new Date(date); //less than 1
        var start = Math.floor(date1.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var end = Math.floor(date2.getTime() / (3600 * 24 * 1000)); //days as integer from..
        var daysDiff = end - start; // exact dates
        return daysDiff;
    };
});
_filters.filter('min', function() {
    return function(left, right) {
        return Math.min(left, right);
    };
});
_filters.filter('round', function() {
    return function(num, dec) {
        num = parseFloat(num);
        dec = parseFloat(dec);
        dec = (!dec ? 2 : dec);
        return (Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec);
    };
});
_filters.filter('max', function() {
    return function(left,right) {
        return Math.max(left, right);
    };
});
_filters.filter('verbify', function() {
    return function(input) {
    	if( input == 'created' ){
    		return " ha creado"
    	}
    	if( input == 'deleted' ){
            return "ha eliminado"
        }
        if( input == 'invited' ){
            return "ha invitado a"
        }
        if( input == 'workedOn' ){
            return "ha trabajado en"
        }
        if( input == 'mention' ){
    		return "te ha mencionado en"
    	}
    };
});
_filters.filter('toDate', function() {
    return function (input) {
        return new Date(input);
    };
});
_filters.filter('mentions',['$filter', '$sce',
  function($filter, $sce) {
    return function(text) {
      if (!text) return text;

      var replacedText = text;

      // replace #hashtags
      // var replacePattern1 = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
      // replacedText = replacedText.replace(replacePattern1, '$1<a href="https://twitter.com/search?q=%23$2"' + targetAttr + '>#$2</a>');

      // replace @mentions
      var replacePattern2 = /(^|\s)\@(\w*[a-zA-Z_]+\w*)/gim;
      replacedText = replacedText.replace(replacePattern2, '<span user-mention class="user-mention" mention="$2">@$2</span>');

      $sce.trustAsHtml(replacedText);
      return replacedText;
    };
  }
]);
_filters.filter('split', function() {
    return function(str) {
        if(!str){
            return [];
        }else{
            return str.split(',');
        }
    };
});
_filters.filter('users_flt', function() {
    return function(items, tipo) {
        var filtered = [];
        angular.forEach(items, function(el) {
            if(tipo == '' && el.is_active){
                filtered.push(el);
            }else if(tipo == 'I' || tipo == 'E'){
                if(el.perfil.rol === tipo && el.is_active)
                    filtered.push(el);
            } else if(tipo == 'O'){
                if(!el.is_active)
                    filtered.push(el);
            }
        });
        return filtered;
    };
});
_filters.filter('match', function() {
    return function (stringObject, searchvalue) {
        stringObject = stringObject || "";
        return stringObject.indexOf(searchvalue) >= 0;
    };
});
_filters.filter('isArray', function() {
    return function(el) {
        return Array.isArray(el);
    };
});
_filters.uuid = function(){
    var s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
};
_filters.round = function(num, dec){
    num = parseFloat(num);
    dec = parseFloat(dec);
    dec = (!dec ? 2 : dec);
    return (Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)).toFixed(dec);
};
_filters.extractDomain = function(url){
    var regex = /\w+.(com|co\.kr|be)/ig;
    return url.match(regex);
};
_filters.months = new Array("Enero", "Febrero", "Marzo","Abril", "Mayo", "Junio","Julio", "Agosto", "Septiembre","Octubre", "Noviembre", "Diciembre");
(function ($, undefined) {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    };
})(jQuery);