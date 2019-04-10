_directives.directive("compile", function ($compile) {
    return {
        restrict: 'A',
        link    : function(scope, el, attrs){
            $compile(el)(scope);
        }
    };
});
_directives.directive('compile', ['$compile', function ($compile) {
      return function(scope, element, attrs) {
            var ensureCompileRunsOnce = scope.$watch(function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the parsed expression changes assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current scope.
                $compile(element.contents())(scope);

                // Use un-watch feature to ensure compilation happens only once.
                ensureCompileRunsOnce();
            });
    };
}]);
_directives.directive('dropdownColors', function($parse) {
    return {
        restrict: 'EA',
        scope: {model: "=ngModel"},
        replace: true,
        require: "ngModel",
        template: '<div class="btn-group">\n\
            <div style="width: 100px; background: [[model]];border: 1px solid #ccc; border-radius: 6px 0 0 6px;"></div>\n\
            <button type="button" class="btn btn-sm btn-default dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\
                <span class="sr-only">Toggle Dropdown</span>\n\
            </button>\n\
            <div class="dropdown-menu default-colors">\n\
                <span ng-repeat="c in colors" ng-click="selColor(c)" class="color-sample" ng-class="{active: c==model}" style="background: [[c]];"></span>\n\
            </div>\n\
            <input type="hidden" name="[[control_name]]" ng-value="model" />\n\
        </div>',
        link: function(scope, element, attrs, ngModel) {
            scope.control_name = attrs.name || "color";
            var default_colors = ['00aced','0275d8','468847','f89406','f1f1f1','CCCCCC', '777A7B', 'F5F6F8', 'FFF9B1', 'F5D128', 'D0E17A', 'D5F692', 'A6CCF5', '67C6C0', '23BFE7', 'FF9D48', 'EA94BB', 'F16C7F', 'B384BB', 'ff0000'];
            scope.colors = scope.colors || default_colors;

            scope.active_color = ngModel.$viewValue || default_colors[0];
            // scope.$apply();
            scope.selColor = function(color){
                ngModel.$viewValue = color;
                ngModel.$commitViewValue();
                ngModel.$render();
            }
        }
    };
});
_directives.directive('csrftoken', function (CSRF_TOKEN) {
    return {
        restrict: 'EA',
        scope: true,
        replace: true,
        template: '<input type="hidden" ng-value="value" name="csrfmiddlewaretoken" />',
        link: function(scope, element, attrs) {
            scope.value = CSRF_TOKEN.csrf_token;
        }
    };
});
_directives.directive('circlifulChart', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).circliful();
        }
    };
});
_directives.directive('maskNumber', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('keypress', function(e){
                var keyCode = e.keyCode || e.which;
                if (keyCode < 48 || keyCode > 57){
                    var integer = attrs.maskNumber == 'integer';
                    if( !integer && keyCode == 46 ) // Detectar punto si no se valida enteros
                        { return true; }
                    if(keyCode == 8) // Detectar backspace (retroceso)
                        { return true; }
                    else
                        { return false; }
                }
                return true;
            });
        }
    };
});
_directives.directive('selectTusuario', function (UsuariosService) {
    return {
        restrict: 'A',
        scope : true,
        require: "ngModel",
        link: function(scope, element, attrs, controller) {
            scope._loading_data = true;
            UsuariosService.tipos('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
                if(attrs.keycode){
                    for (var i = 0; i < scope.availableOptions.length; i++) {
                        if(scope.availableOptions[i].codigo === attrs.keycode){
                            controller.$viewValue = scope.availableOptions[i];
                            controller.$render();
                            break;
                        }
                    };
                }
            });
        }
    };
});
_directives.directive('selectTproveedor', function (ProveedoresService) {
    return {
        restrict: 'A',
        scope : true,
        link: function(scope, element, attrs, controller) {
            scope._loading_data = true;
            ProveedoresService.tipos('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('estadosProyecto', function (ProyectoService) {
    return {
        restrict: 'A',
        scope : true,
        link: function(scope, element, attrs, controller) {
            scope._loading_data = true;
            ProyectoService.estados('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('estadosOrden', function (OrdenTrabajoService) {
    return {
        restrict: 'A',
        scope : true,
        link: function(scope, element, attrs, controller) {
            scope._loading_data = true;
            OrdenTrabajoService.estados('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('estadosTarea', function (TareaService) {
    return {
        restrict: 'A',
        scope : true,
        link: function(scope, element, attrs, controller) {
            scope._loading_data = true;
            TareaService.estados('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('selectLayouts', function (TallerService) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            scope._loading_data = true;
            TallerService.load('all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('selectProyectos', function (ProyectoService) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            scope._loading_data = true;
            ProyectoService.load('?q=all').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('selectElementos', function (TallerService) {
    return {
        restrict: 'A',
        scope: {
            value : '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('value', function(val){
                if (val){
                    scope.$parent._loading_data = true;
                    TallerService.elementos(val).then(function(result){
                        scope.$parent.availableOptions = result.data;
                        scope.$parent._loading_data = false;
                    });
                }else{
                    scope.$parent.availableOptions = [];
                }
            });
        }
    };
});
_directives.directive('selectOrdenes', function (OrdenTrabajoService) {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            scope._loading_data = true;
            OrdenTrabajoService.load('?f=own').then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('selectTareas', function (TareaService) {
    return {
        restrict: 'A',
        scope: {
            value : '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('value', function(val){
                if (val){
                    scope.$parent._loading_data = true;
                    TareaService.load('?q=all&&ord='+val).then(function(result){
                        scope.$parent.availableOptions = result.data;
                        scope.$parent._loading_data = false;
                    });
                }else{
                    scope.$parent.availableOptions = [];
                }
            });
        }
    };
});
_directives.directive('selectUsuarioByType', function (UsuariosService) {
    return {
        restrict: 'A',
        scope : true,
        link: function(scope, element, attrs) {
            scope._loading_data = true;
            UsuariosService.load(attrs.filter).then(function(result){
                scope.availableOptions = result.data;
                scope._loading_data = false;
            });
        }
    };
});
_directives.directive('selectAjax', function ($timeout, $http, CSRF_TOKEN, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            model: "=ngModel"
        },
        replace: true,
        require : "ngModel",
        template: '<div class="select-dropdown">\n\
                    <input type="text" ng-model="_filter" class="form-control [[classes]]" placeholder="[[placeholder]]"/>\n\
                    <input type="hidden" ng-value="model.id" name="[[control_name]]"/>\n\
                    <div class="list-results">\n\
                        <div ng-repeat="result in _results">\n\
                            <div class="list-result-item clearfix" ng-click="_clickResult(result)">\n\
                                <strong>[[result.unidad]]</strong>\n\
                                <div class="font-small">[[result.domicilio]]</div>\n\
                            </div>\n\
                        </div>\n\
                        <div ng-show="_loading" class="loading">Cargando...</div>\n\
                    </div>\n\
                   </div>',
        replace: true,
        restrict: 'E',
        link: function(scope, element, attrs, ngModel) {
            scope.$watch('model', function(value, old){
                if(value && !scope.initialized){
                    $http.get(attrs.route+'?id='+value.id).then(function(result){
                        scope.initialized = true;
                        ngModel.$viewValue = result.data[0];
                        ngModel.$commitViewValue();
                        ngModel.$render();
                        scope._filter = result.data[0].unidad;
                    }, function(result){
                        scope.clearListBox();
                    })
                }
            });
            scope.placeholder = attrs.placeholder;
            scope.control_name = attrs.name || "select";
            scope.classes = attrs.classes;
            var $el = $(element);
            var $input = $el.find('input[type="text"]');
            var $box = $el.find('.list-results');
            var _timeout = null;
            scope._results = {};
            $input.on('blur', function(){
                $timeout(function(){
                    hideBox();
                },300);
            });
            $input.on('focus', function(){
                showBox();
            });
            $input.on('input', function(){
                if(_timeout){
                    clearTimeout(_timeout);
                    _timeout = null;
                    scope.clearListBox();
                }
                _timeout = setTimeout(function(){
                    scope._loading = true;
                    ngModel.$viewValue = "";
                    ngModel.$commitViewValue();
                    ngModel.$render();
                    if(scope._filter){
                        $http.get(attrs.route+'?q='+scope._filter).then(function(result){
                            scope.initialized = true;
                            scope._loading = false;
                            scope._results = result.data;
                        }, function(result){
                            scope.clearListBox();
                        })
                    }
                }, 1000);
            });
            scope._clickResult = function(result){
                ngModel.$viewValue = result;
                ngModel.$commitViewValue();
                ngModel.$render();
                scope._filter = result.unidad;
                hideBox();
            };
            scope.clearListBox = function(data){
                scope._results = [];
                $box.removeClass('loading');
            };
            var showBox = function(data){
                $box.removeClass('hidden');
            };
            var hideBox = function(data){
                $box.addClass('hidden');
            };
        }
    };
});
_directives.directive('listMergeableLotes', function (LotesService) {
    return {
        restrict: 'A',
        scope : { lote: "=" },
        link: function(scope, element, attrs) {
            var id = attrs.listMergeableLotes;
            scope.lote.loading_mergeables = true;
            scope.lote.no_merge_lotes = false;
            LotesService.mergeable(id).then(function(result){
                scope.lote._merges = result.data;
                if(!result.data.length){
                    scope.lote.no_merge_lotes = true;
                }
                scope.lote.loading_mergeables = false;
            }, function(){ scope.lote.loading_mergeables = false; });
        }
    };
});
_directives.directive('unitCosto', function (CostoService) {
    return {
        restrict: 'E',
        replace : true,
        template: '<div class="fixed-costs-nav">\n\
                        <button type="button" ng-disabled="stepping" ng-class="{disabled:stepping}" class="btn btn-link" ng-click="gotoStep(-1)">\n\
                            <i class="fa fa-caret-left"></i>\n\
                        </button>\n\
                        <span>[[unidad.costo.fecha|costMonth]]</span> \n\
                        <button type="button" class="btn btn-link" ng-disabled="actual_step>=0 || stepping" ng-class="{disabled:actual_step>=0 || stepping}" ng-click="gotoStep(1)">\n\
                            <i class="fa fa-caret-right"></i>\n\
                        </button>\n\
                    </div>',
        scope : { unidad: "=" },
        link: function(scope, element, attrs) {
            scope.actual_step = 0;
            var today = new Date();
            if(!scope.unidad.costo){
                scope.unidad.costo = {fecha: today};
            }
            scope.gotoStep = function(step){
                scope.actual_step += step;
                if(scope.actual_step<=0){
                    scope.stepping = true;
                    CostoService.byMonth(scope.unidad.id, scope.actual_step).then(function(result){
                        var date = new Date();
                        scope.stepping = false;
                        date.setMonth(date.getMonth() - Math.abs(scope.actual_step));
                        if(!result.data.id){
                            scope.unidad.costo = {fecha: date};
                        }else{
                            scope.unidad.costo = result.data;
                        }
                    });
                }else{
                    scope.actual_step = 0;
                }
                scope.unidad.step_month = scope.actual_step;
            };
        }
    };
});
_directives.directive('paginator', function ($rootScope, ComunService, $parse) {
    return {
        restrict: 'E',
        require: "^ngModel",
        templateUrl: '/static/mecanica/tpls/paginator/pagination.html',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val){
                $parse(attrs.ngModel).assign(scope.$parent, val);
                return val;
            });
            scope.$watch(
                function(scope) {
                    return ngModel.$modelValue;
                },
                function(value) {
                    if(!value){return false;}
                    var $pagination = value;
                    var $pageCount = parseInt(Math.ceil(parseInt($pagination.count) / parseInt($pagination.items_per_page)));
                    var $current = parseInt($pagination.current_page_number);
                    var $proximity = Math.floor(parseInt($pagination.page_range) / 2);
                    var $startPage  = $current - $proximity;
                    var $endPage    = $current + $proximity;
                    if ($startPage < 1) {
                        $endPage = Math.min($endPage + (1 - $startPage), $pageCount);
                        $startPage = 1;
                    }
                    if ($endPage > $pageCount) {
                        $startPage = Math.max($startPage - ($endPage - $pageCount), 1);
                        $endPage = $pageCount;
                    }

                    var $pages = [];
                    var $delta = Math.ceil($pagination.page_range / 2);

                    if ($current - $delta >= $pageCount - $pagination.page_range) {
                        var ini = $pageCount - $pagination.page_range + 1;
                        for (var i = ini; i <= $pageCount; i++) {
                            if(i>0){
                                $pages.push(i);
                            }
                        }
                    }
                    else {
                        if ($current - $delta < 0) {
                            $delta = $current;
                        }

                        var $offset = $current - $delta;
                        var end = $offset + $pagination.page_range;
                        for (var i = ($offset + 1); i <= end; i++) {
                            if(i>0){
                                $pages.push(i);
                            }
                        }
                    }

                    scope.data = {
                        last              : $pageCount,
                        current           : $current,
                        numItemsPerPage   : $pagination.items_per_page,
                        first             : 1,
                        pageCount         : $pageCount,
                        totalCount        : $pagination.count,
                        pageRange         : $pagination.page_range,
                        startPage         : $startPage,
                        endPage           : $endPage,
                        pagesInRange      : $pages
                    };

                    if ($current > 1) {
                        scope.data.previous = $current - 1;
                    }

                    if ($current < $pageCount) {
                        scope.data.next = $current + 1;
                    }
                    scope.data.firstPageInRange = Math.min.apply(null, $pages);
                    scope.data.lastPageInRange  = Math.max.apply(null, $pages);

                    if ($pagination.items && $pagination.items.length) {
                        scope.data.currentItemCount = $pagination.items.length;
                        scope.data.firstItemNumber = 0;
                        scope.data.lastItemNumber = 0;
                        if (scope.data.totalCount > 0) {
                            scope.data.firstItemNumber = (($current - 1) * $pagination.items_per_page) + 1;
                            scope.data.lastItemNumber = scope.data.firstItemNumber + scope.data.currentItemCount - 1;
                        }
                    }
                }
            );

            function range(start, count) {
                start = start < 1 ? 1 : start;
                return Array.apply(0, Array(count))
                  .map(function (el, index) {
                    return index + start;
                });
            };
            scope.goto_page = function(number){
                if(ngModel.$viewValue.paging){ return false; }
                ngModel.$viewValue.paging = true;
                ComunService.paginate(attrs.route,number,ngModel.$viewValue.params).then(function(result){
                    ngModel.$viewValue = result.data;
                    ngModel.$commitViewValue();
                    ngModel.$render();
                });
            };
            scope.previous_page = function(){
                if(ngModel.$viewValue.paging){ return false; }
                ngModel.$viewValue.paging = true;
                ComunService.paginate(attrs.route,scope.data.current-1,ngModel.$viewValue.params).then(function(result){
                    ngModel.$viewValue = result.data;
                    ngModel.$commitViewValue();
                    ngModel.$render();
                });
            };
            scope.next_page = function(){
                if(ngModel.$viewValue.paging){ return false; }
                ngModel.$viewValue.paging = true;
                ComunService.paginate(attrs.route,scope.data.current+1,ngModel.$viewValue.params).then(function(result){
                    ngModel.$viewValue = result.data;
                    ngModel.$commitViewValue();
                    ngModel.$render();
                });
            };

        }
    };
});
_directives.directive('docsAttachment', function ($rootScope, DocumentosService, $parse) {
    return {
        restrict: 'E',
        require: "ngModel",
        replace: true,
        templateUrl: '/static/mecanica/tpls/documentos/index.html',
        link: function(scope, element, attrs, controller) {
            DocumentosService.load().then(function(result){
                scope.documentos = result.data;
            });
            scope.folder = {};
            scope.folder_routes = [];

            scope._selectFile = function(doc){
                var found = false;
                if(controller.$viewValue.archivos){
                    for (var i = 0; i < controller.$viewValue.archivos.length; i++) {
                        if(controller.$viewValue.archivos[i].id == doc.id){
                            found = true;
                            break;
                        }
                    }
                }else{
                    controller.$viewValue.archivos = new Array();
                }

                if(!found){
                    controller.$viewValue.archivos.push(doc);
                    controller.$render();
                }
            };
            scope._openFolder = function(folder){
                scope.folder_routes.push(folder);
                scope.loading_folder = true;
                folder_id = folder ? folder.id : null;
                DocumentosService.load(folder_id).then(function(result){
                    scope.loading_folder = false;
                    if(result.data){
                        scope.documentos = result.data;
                    }else{
                        Notification.error(result.data.msg || "La carpeta solicitada no ha podido ser abierta.");
                    }
                });
            };
            scope._gotoFolder = function(folder){
                var routes = [];
                if(folder){
                    for (var i = 0; i < scope.folder_routes.length; i++) {
                        routes.push(scope.folder_routes[i]);
                        if(scope.folder_routes[i].id == folder.id){
                            break;
                        }
                    }
                }
                scope.folder_routes = routes;
                scope.loading_folder = true;
                DocumentosService.load(folder ? folder.id : null).then(function(result){
                    scope.loading_folder = false;
                    if(result.data){
                        scope.documentos = result.data;
                    }else{
                        Notification.error(result.data.msg || "La carpeta solicitada no ha podido ser abierta.");
                    }
                });
            };
        }
    };
});
_directives.directive('maxNumber', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('keypress', function(e){
                var num = parseFloat((element.val() || '') + e.key);
                var max = parseFloat(attrs.maxNumber);
                var keyCode = e.keyCode || e.which;
                if (keyCode >= 48 && keyCode <= 57){
                    if( num >= 0 && num <= max)
                        { return true; }
                    else
                        { return false; }
                }
                else if(keyCode == 8){
                    return true;
                }
                return false;
            });
        }
    };
});
_directives.directive('loadUnidades', function(UnidadService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $el = $(element);
            $el.on('show.bs.modal', function (e) {
                UnidadService.load().then(function(result){
                    scope._unidades = result.data;
                });
            });
        }
    };
});
_directives.directive('availableLotes', function(LotesService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var $el = $(element);
            $el.on('show.bs.modal', function (e) {
                LotesService.load().then(function(result){
                    scope._available_lotes = result.data;
                });
            });
            scope.$on('_paginate', function($event,type,data){
                if(type === 'available_lotes'){
                    scope._available_lotes = data;
                }
            });
        }
    };
});
_directives.directive('dropdownAppendToBody', function($timeout) {
    return function(scope, element) {
        var dropdownMenu;
        var $el = $(element);
        // and when you show it, move it to the body
        $el.on('show.bs.dropdown', function (e) {
            scope.isPropagationStopped = false;
            // grab the menu
            dropdownMenu = $(e.target).find('> .dropdown-menu');

            // detach it and append it to the body
            $('body').append(dropdownMenu.detach());

            // grab the new offset position
            var eOffset = $(e.target).offset();

            // make sure to place it where it would normally go (this could be improved)
            dropdownMenu.css({
                'display': 'block',
                'top': eOffset.top + $(e.target).outerHeight(),
                'left': eOffset.left,
                'z-index' : $el.closest('.modal') ? '9999' : ''
            });
        });

        // and when you hide it, reattach the drop down, and hide it normally
        $(element).find('ul li a').bind('click', function (e) {
            $timeout(function(){
                if(!scope.isPropagationStopped){
                    dropdownMenu.remove();
                }
            }, 50);
        });
        // and when you hide it, reattach the drop down, and hide it normally
        $(element).on('hide.bs.dropdown', function (e) {
            scope.isPropagationStopped = true;
            $(e.target).append(dropdownMenu.detach());
            dropdownMenu.hide();
        });
    };
});
_directives.directive('ajaxForm', function (CSRF_TOKEN, $rootScope, $parse) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, el, attrs) {
            var $el = $(el);
            if( !$el.find('input[name="csrfmiddlewaretoken"]').length){
                $el.append('<input type="hidden" name="csrfmiddlewaretoken" value="'+CSRF_TOKEN.csrf_token+'" />');
            }
            function validate(){
                var errors = [];
                $el.find('[validate]').each(function(i, item){
                    var $item = $(item);
                    if($item.attr('required') && !$item.val()){
                        errors.push($item.attr('data-err-msg') || "El campo es obligatorio");
                    }
                });
                return errors;
            }
            $el.on('submit', function(evento){
                if(attrs.hasOwnProperty('validate')){
                    var errors = validate();
                    if(errors && errors.length){
                        $el.data('errors', errors);
                        scope.$apply();
                        return false;
                    }
                }
                $el.data('errors', null);
                $el.addClass('disabled');
                var btn = $el.find('.submit-btn');
                var textBtn = '';
                evento.preventDefault();
                var context = scope;
                var func = null;
                var callback = $el.attr("callback");
                if(callback){
                    var namespaces = callback.split(".");
                    func = namespaces.pop();
                    for(var i = 0; i < namespaces.length; i++) {
                        context = context[namespaces[i]];
                    }
                }

                var fn = $parse(attrs.ngSubmit);
                if(attrs.ngSubmit && typeof context[attrs.ngSubmit] === 'function') {
                    result = context[attrs.ngSubmit].apply(context);
                    if (result == false){
                        return false;
                    }
                }

                if( btn.length && !btn.find('.btn-spinning').length ){
                    btn.addClass('disabled').prop('disabled', 'disabled');
                    if(btn.hasClass('only-spinner')){
                        textBtn = btn.html();
                        btn.html('<i class="fa fa-cog fa-spin btn-spinning"></i>');
                    }
                    else{
                        btn.prepend('<i class="fa fa-cog fa-spin btn-spinning"></i> ');
                    }
                }
                var options = {
                    success:       function(data, statusText, xhr, $form){
                        btn.find('.btn-spinning').remove();
                        if(textBtn){
                            btn.html(textBtn);
                        }
                        if( data.errors && data.errors.fields ){
                            var exists_all = false;
                            for ( var prop in data.errors.fields ) {
                                var exists = false;
                                var id = data.errors.prefix + '_' + prop;
                                var fieldErrors = '';
                                var all_errors = data.errors.fields[prop];
                                $.each(all_errors, function(i, errorText){
                                    exists = true;
                                    exists_all = true;
                                    fieldErrors += '<div class="error">'+errorText+'</div>';
                                });
                                if(exists){
                                    var field = $('#'+id);
                                    if(field.parent('.input-group').length){
                                        $(fieldErrors).insertAfter(field.parent('.input-group'));
                                    }
                                    else{
                                        $(fieldErrors).insertAfter(field);
                                    }
                                }
                            }
                            if(exists_all){
                                return;
                            }
                        }
                        btn.removeClass('disabled').removeAttr('disabled');
                        if(func && typeof context[func] === 'function') {
                            $el.removeClass('disabled');
                            context[func].apply(context,new Array(data,'success',$el));
                        }
                        else{
                            context = $rootScope;
                            if(func && typeof context[func] === 'function') {
                                $el.removeClass('disabled');
                                context[func].apply(context,new Array(data,'success',$el));
                            }

                        }
                        if(!!$el.attr('reset') && $el.attr('reset') != 'false'){
                            var filesWrapper = $el.find('.fileinput');
                            var inputs = $('input[type="text"],textarea');
                            if(filesWrapper.length){
                                $.each(filesWrapper, function(i, item){
                                    var $item = $(item);
                                    if($item.hasClass('fileinput-exists')){
                                        $item.find('img').remove();
                                        $item.removeClass('fileinput-exists').addClass('fileinput-new');
                                        var $input = $item.find('input[type="file"]');
                                        if (window.navigator.appName == 'Microsoft Internet Explorer') {
                                            var inputClone = $input.clone(true);
                                            $input.after(inputClone);
                                            $input.remove();
                                            $input = inputClone;
                                        } else {
                                            $input.val('');
                                        }
                                    }

                                });
                            }
                            if(inputs.length){
                                //ng derty
                                $.each(inputs, function(i, item){
                                    var $item = $(item);
                                    if(!$item.hasClass('no-reset')){
                                        $item.val("");
                                    }
                                });
                            }
                        }
                    },
                    error : function(){
                        $el.removeClass('disabled');
                        console.log('throw error ajax form');
                    },
                    dataType: ( !!$el.attr('datatype') ? $el.attr('datatype') : 'json'),
                    data    : ( !!$el.data('extra') ? $el.data('extra'): '')
                };
                ajax_global_form = $el.ajaxSubmit(options);
                // return false to prevent normal browser submit and page navigation
                return false;
            });
        }
    };
});
_directives.directive( 'compileData', function ( $compile ) {
  return {
    link: function ( scope, element, attrs ) {
      var elmnt;
      attrs.$observe( 'template', function ( myTemplate ) {
        if ( angular.isDefined( myTemplate ) ) {
          elmnt = $compile( myTemplate )( scope );
          element.html(""); // dummy "clear"
          element.replaceWith( elmnt );
        }
      });
    }
  };
});
_directives.directive('autoFocus', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            fval: "="
        },
        link    : function(scope, element, attrs){
            scope.$watch("fval", function(value){
                if( value ){
                    $timeout(function(){
                        element.focus();
                    }, 100);
                }
            })
        }
    };
});
_directives.directive('preventIntro', function ($timeout) {
    return {
        restrict: 'A',
        scope: true,
        link    : function(scope, element, attrs){
            $(element).keydown(function (e) {
                if (e.keyCode == 13) {
                  e.preventDefault();
                }
            });
        }
    };
});
_directives.directive( 'tooltip', function () {
  return {
    restrict : 'A',
    link: function( scope, element, attrs ){
        $(element).tooltip({
            trigger : 'hover',
            container : 'body',
            title : attrs.tooltip,
            placement: attrs.placement || 'bottom'
        });
    }
  };
});
_directives.directive('pover', function ($compile, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            var $body = angular.element("body");
            var $el = $(el);
            var popover = el.next('.pover-content');
            popover.removeClass('hide');
            var first = true;
            $el.popover({
                trigger: 'manual',
                html: true,
                container  : popover.is('[outside-pop]') ? 'body' : '',
                content: popover,
                placement: popover.attr('placement')
            }).click(function(){
                if(first){
                    $compile(popover)(scope);
                    first = false;
                }
            });
            popover.remove();
            var cssClass = popover.attr('class-pop');
            el.on("click", function (event) {
                angular.element('.popover.in').remove();

                $el.popover('toggle');
                angular.element('.popover.in').addClass(cssClass);
                var activePop = angular.element('.popover.in');
                activePop.bind('click', function(e){
                    var $target = $(e.target);
                    if($target.is('.pover-close')){
                        $timeout(function() {
                            $el.popover('hide');
                        }, 10);
                        return false;
                    }
                    else if(!$target.is('a')){
                        return false;
                    }
                });
                $timeout(function() {
                    $body.one('click', function(){
                        $el.popover('hide');
                    });
                }, 10);
            });
        }
    };
});
_directives.directive('compileHtml', ['$compile', function ($compile) {
      return function(scope, element, attrs) {
          scope.$watch(
            function(scope) {
              return attrs.compileHtml;
            },
            function(value) {
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);

              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);

              // Use un-watch feature to ensure compilation happens only once.
              // ensureCompileRunsOnce();
            }
        );
    };
}]);
_directives.directive('datepicker', function ($parse, $timeout, dateFilter) {
    return {
        restrict: 'A',
        scope: {
            datepickermax: "=",
            datepickermin: "="
        },
        require: 'ngModel',
        link: function(scope, element, attrs, controller) {
            var format=attrs.format || 'yyyy-MM-dd';
            controller.$formatters.push(function(input) {
                return dateFilter(input, format);
            });
            var $el = $(element);
            var now = attrs.datepicker === 'today' ? new Date() : '';
            $el.datepicker({
                format: format.toLowerCase(),
                autoclose: true,
                startDate: now
            });
            scope.$watch('datepickermin', function(newVal, oldVal){
                if(newVal){
                    var $date = new Date(newVal);
                    $el.datepicker('setStartDate', new Date($date.getTime()+1000*60*60*24));
                }else{
                    $el.datepicker('setStartDate', "");
                }
            });
            scope.$watch('datepickermax', function(newVal, oldVal){
                if(newVal){
                    $el.datepicker('setEndDate', new Date(newVal));
                }else{
                    $el.datepicker('setEndDate', "");
                }
            });
            if(attrs.target){
                var $target = angular.element(attrs.target);
                $el.on('changeDate', function() {
                    var value = $el.datepicker('getFormattedDate');
                    var fn = $parse(attrs.ngModel).assign;

                    if(fn && (typeof(fn) === 'function')) {
                        fn(scope, value);
                    }else{
                        fn = value;
                    }
                    if( attrs.change ){
                        scope.$apply(function(){
                            var fn = $parse(attrs.change);
                            fn(scope, {});
                        });
                    }
                });
            }
        }
    };
});
_directives.directive('keyIntro', function () {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            element.bind('keyup', function(e){
                var keyCode = e.keyCode || e.which;
                if( keyCode == '13' ){
                    var func = attrs.keyIntro;
                    if(typeof scope[func] === 'function') {
                        scope[func].apply(scope,new Array(element,attrs,e));
                    }
                }
            });
        }
    }
});

_directives.directive('resize', function ($window, $timeout) {
    return function (scope, element, attr) {
        scope.onResizeFunction = function() {
            // scope.safeApply(function(){

            // });
            // scope.safeApply();
            $timeout(function(){
                var w = angular.element($window);
                var editor = angular.element('#board-editor-zone');
                var side = angular.element('#editor-sidebar');
                // scope.windowHeight = w.height() - scope.topPosition;
                // scope.windowWidth = w.width() - side.width();
                scope.windowHeight = w.height() - (editor.length ? editor.offset().top : 0);
                scope.windowWidth = w.width() - (editor.length ? editor.offset().left : 0);
                // scope.safeApply();
            });
          };

          scope.onResizeFunction();

          angular.element($window).bind('resize', function() {
            scope.onResizeFunction();
          });
    }
});

_directives.directive('svgEditor', function ($rootScope, SVGFactory, $templateCache, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        template: $templateCache.get('svg_editor_template'),
        link: function (scope, element, attrs) {
            scope.margin = {top: 0, right: 0, bottom: 0, left: 0};
            scope.transformX = 0;
            scope.transformY = 0;
            // scope.scale = $rootScope._initialObjectsLength ? 0.7 : 1;
            scope.scale = 1;
            scope.scaleRangeMinMap = 1;
            scope.scalePx = 100;
            scope.backgroundScale = 200;
            var selector = d3.select(element[0]);
            scope.SVG = new SVGFactory(scope, selector);
            scope.SVG.init();
            scope.safeApply();
            element.bind('click', function(e){

                var target = angular.element(e.target);
                if(target.is('#main-svg-container')){
                    scope.clearEntitySelection(true);
                }else if(scope.selections && scope.selections.length === 1 && !target.is('.selections-handler')){
                    var id = '#WDG_'+scope.selections[0].id;
                    if(!target.is(id) && !target.closest(id).length){
                        scope.clearEntitySelection(true);
                    }
                }
            });
        }
    }
});
_directives.directive('toolColorpicker', function ($compile) {
    return {
        restrict: 'E',
        scope   : true,
        link: function (scope, element, attrs) {

            scope.config = {inline  : true };
            var html = '<span style="position: relative;top: 3px;" class="btn-menu dropdown dropdown-color" tooltip="[[ttitle]]"><a href="" ng-click="" data-toggle="dropdown" class="dropdown-toggle"><i class="'+attrs.menuIcon+'"></i></a>';
            scope.ttitle = attrs.ttitle;
            if(attrs.menuAction === 'fill'){
                scope.config.defaultValue = scope.$parent.color || '#cccccc';
                html += '<div class="color" ng-style="{\'background-color\':$parent.color}"></div>';
                html += '<div class="dropdown-menu fade"><div minicolors="config" id="color-input" class="form-control" type="text" ng-model="$parent.color"></div></div>';
            }
            html += '</span>';
            element.append($compile(html)(scope));
            $(element).on('click', function(e){
                if($(e.target).is('.minicolors-slider')){
                    return false;
                }
            });
        }
    };
});
_directives.directive('endlessScroll', function ($compile, $document) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var initialMouseX, initialMouseY, startX, startY;
            function getViewBox(){
                var w = scope.widgetsContainerWith.right - scope.widgetsContainerWith.left,
                    h = scope.widgetsContainerWith.bottom - scope.widgetsContainerWith.top;
                    return {
                        w:(w >= scope.windowWidth ? w : scope.windowWidth),
                        h:(h >= scope.windowHeight ? h : scope.windowHeight),
                        l:(scope.widgetsContainerWith.left),
                        t:(scope.widgetsContainerWith.top)
                    };
            };
            var scroll = function(container){

                this.vertical = $('<div class="vertical-scroll-container">\n\
                                    <div class="scroll-area">\n\
                                        <div class="scroll-handle" style="height:[[scroll.height()]]px; [[scroll.vertPos()]]"></div>\n\
                                    </div></div>');
                this.horizontal = $('<div class="horizontal-scroll-container">\n\
                                      <div class="scroll-area">\n\
                                        <div class="scroll-handle" style="width:[[scroll.width()]]px; [[scroll.horizPos()]]"></div>\n\
                                      </div></div>');
                this.container = $(container);
            };
            scroll.prototype.init = function(){
                this.container.append($compile(this.horizontal)(scope));
                this.container.append($compile(this.vertical)(scope));
                angular.element('.scroll-handle').bind('mousedown', function($event) {
                    var t = scope.SVG.setTranslate();
                    startX = t.translate[0];
                    startY = t.translate[1];
                    initialMouseX = $event.clientX;
                    initialMouseY = $event.clientY;
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                    return false;
                });

                function mousemove($event) {
                    var dx = $event.clientX - initialMouseX;
                    var dy = $event.clientY - initialMouseY;
                    var t = scope.SVG.setTranslate();
                    if($($event.target).closest('.horizontal-scroll-container').length){
                        t.translate[0] = -dx + startX;
                    }else if($($event.target).closest('.vertical-scroll-container').length){
                        t.translate[1] = -dy + startY;
                    }
                    scope.SVG.zoomPan(t);
                    scope.$parent.safeApply();
                    return false;
                };

                function mouseup() {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                };
            }
            scroll.prototype.height = function(){
                var vb = getViewBox();
                var s = (vb.h+Math.abs(scope.transformY)*scope.scale)/scope.windowHeight;
                return scope.windowHeight/s;
            };
            scroll.prototype.width = function(){
                var vb = getViewBox();
                var s = (vb.w+Math.abs(scope.transformX)*scope.scale)/scope.windowWidth;
                return scope.windowWidth/s;
            };
            scroll.prototype.vertPos = function(){
                var total = Math.abs(scope.transformY)*scope.scale+this.height();
                if(total<scope.windowHeight && scope.transformY<0){
                    return 'top:'+ -scope.transformY*scope.scale+'px;';
                }else if(scope.transformY>=0){
                    return 'top:0';
                }else{
                    return 'bottom:'+0;
                }
            };
            scroll.prototype.horizPos = function(){
                var total = Math.abs(scope.transformX)*scope.scale+this.width();
                if(total<scope.windowWidth && scope.transformX<0){
                    return 'left:'+ -scope.transformX*scope.scale+'px;';
                }else if(scope.transformX>=0){
                    return 'left:0';
                }else{
                    return 'right:'+0;
                }
            };
            // scroll.prototype.visibleY = function(){
            //     var vb = getViewBox();
            //     var totalHeight = vb.h;
            //     return ((totalHeight+Math.abs(scope.transformY))*scope.scale)>scope.windowHeight;
            // };

            scope.scroll = new scroll(element);
            scope.scroll.init();

            // $(window).scroll(function() {
            //     if ( $(window).scrollTop() >= ($('body').height() - $(window).height()) ) {
            //         $(window).scrollTop(1);
            //     }
            //     else if ( $(window).scrollTop() == 0 ) {
            //         $(window).scrollTop($('body').height() - $(window).height() -1);
            //     }
            // });
        }
    }
});

_directives.directive('svgRect', ['$document', function($document, FigureFactory) {
    return {
        restrict: 'E',
        scope   : {
            figure: '=figure'
        },
        templateNamespace: 'svg',
        replace: true,
        template: '<rect id="WDG_[[figure.id]]" stroke="[[figure.attrs.stroke]]" stroke-width="[[figure.attrs[\'stroke-width\'] ]]" stroke-dasharray="[[figure.attrs[\'stroke-dasharray\'] ]]" fill="[[figure.attrs.fill]]" fill-opacity="[[figure.attrs[\'fill-opacity\'] ]]" width="[[figure.attrs.width]]" height="[[figure.attrs.height]]" x="[[figure.attrs.x]]" y="[[figure.attrs.y]]" />',
        link: function (scope, element, attrs) {
            var entity = scope.$parent.getEntity(scope.figure.id);

            element.bind('click', function(e){
                if(scope.$parent.activeBtn === 'erase'){
                    scope.$parent.delSelection(entity);
                    e.stopPropagation();
                }else{
                    e.stopPropagation();
                    scope.$parent.addEntityToSelection(entity);
                }
            });

            d3.selectAll(element).call(d3.behavior.drag()
                .on("drag", drag)
                .on("dragstart", function(e) {
                    this.initialPos = [entity.getAttr('x'), entity.getAttr('y')];
                    this.triggered = d3.event.sourceEvent.triggered;
                    d3.event.sourceEvent.stopPropagation();
                })
                .on("dragend", function() {
                    if(scope.figure.hasChanges){
                        entity.changeState('unsaved');
                        scope.$parent.save('svg Rect dragend');
                    }
                    scope.figure.hasChanges = false;
                })
            );
            function drag(event){
                var el = d3.select(this);
                var xPos = parseInt(d3.event.dx) + parseInt(el.attr('x'));
                var yPos = parseInt(d3.event.dy) + parseInt(el.attr('y'));
                if(this.initialPos[0] != xPos || this.initialPos[1] != yPos){
                    scope.figure.hasChanges = true;
                    entity.setAttr('x', xPos)
                          .setAttr('y', yPos);
                    scope.$parent.safeApply();
                }
            }
        }
    }
}]);

_directives.directive('svgCircle', function (FigureFactory) {
    return {
        restrict: 'E',
        scope   : {
            figure: '=figure'
        },
        templateNamespace: 'svg',
        replace: true,
        template: '<ellipse id="WDG_[[figure.id]]" stroke="[[figure.attrs.stroke]]" stroke-width="[[figure.attrs[\'stroke-width\'] ]]" stroke-dasharray="[[figure.attrs[\'stroke-dasharray\'] ]]" fill="[[figure.attrs.fill]]" fill-opacity="[[figure.attrs[\'fill-opacity\'] ]]" rx="[[figure.attrs.rx]]" ry="[[figure.attrs.ry]]" cx="[[figure.attrs.cx]]" cy="[[figure.attrs.cy]]" />',
        link: function (scope, element, attrs) {
            var entity = scope.$parent.getEntity(scope.figure.id);

            element.bind('click', function(e){
                if(scope.$parent.activeBtn === 'erase'){
                    scope.$parent.delSelection(entity);
                    e.stopPropagation();
                }else{
                    e.stopPropagation();
                    scope.$parent.addEntityToSelection(entity);
                }
            });
            d3.selectAll(element).call(d3.behavior.drag()
                .on("drag", drag)
                .on("dragstart", function() {
                    this.initialPos = [entity.getAttr('cx'), entity.getAttr('cy')];
                    this.triggered = d3.event.sourceEvent.triggered;
                    d3.event.sourceEvent.stopPropagation();
                })
                .on("dragend", function() {
                    if(scope.figure.hasChanges){
                        entity.changeState('unsaved');
                        scope.$parent.save('svg Ellipse dragend');
                    }
                    scope.figure.hasChanges = false;
                })
            );
            function drag(){
                var el = d3.select(this);
                var xPos = parseInt(d3.event.dx) + parseInt(el.attr('cx'));
                var yPos = parseInt(d3.event.dy) + parseInt(el.attr('cy'));
                if(this.initialPos[0] != xPos || this.initialPos[1] != yPos){
                    scope.figure.hasChanges = true;
                    entity.setAttr('cx', xPos)
                          .setAttr('cy', yPos);
                    scope.$parent.safeApply();
                }
            }
        }
    }
});
_directives.directive('svgText', function (FigureFactory) {
    return {
        restrict: 'E',
        scope   : {
            figure: '=figure'
        },
        templateNamespace: 'svg',
        replace: true,
        template: '<text id="WDG_[[figure.id]]" font-size="20px" fill="[[figure.attrs.fill]]" x="[[figure.attrs.x]]" y="[[figure.attrs.y]]"><tspan x="[[figure.attrs.x]]" dy="[[$index>0 ? \'1.3em\' : 0]]" ng-repeat="line in figure.attrs.txt|txtlines" ng-bind="line"></tspan></text>',
        link: function (scope, element, attrs) {
            var entity = scope.$parent.getEntity(scope.figure.id);

            element.bind('click', function(e){
                if(scope.$parent.activeBtn === 'erase'){
                    scope.$parent.delSelection(entity);
                    e.stopPropagation();
                }else{
                    e.stopPropagation();
                    scope.$parent.addEntityToSelection(entity);
                }
            });

            d3.selectAll(element).call(d3.behavior.drag()
                .on("drag", drag)
                .on("dragstart", function(e) {
                    this.initialPos = [entity.getAttr('x'), entity.getAttr('y')];
                    this.triggered = d3.event.sourceEvent.triggered;
                    d3.event.sourceEvent.stopPropagation();
                })
                .on("dragend", function() {
                    if(scope.figure.hasChanges){
                        entity.changeState('unsaved');
                        scope.$parent.save('svg Text dragend');
                    }
                    scope.figure.hasChanges = false;
                })
            );
            function drag(event){
                var el = d3.select(this);
                var xPos = parseInt(d3.event.dx) + parseInt(el.attr('x'));
                var yPos = parseInt(d3.event.dy) + parseInt(el.attr('y'));
                if(this.initialPos[0] != xPos || this.initialPos[1] != yPos){
                    scope.figure.hasChanges = true;
                    entity.setAttr('x', xPos)
                          .setAttr('y', yPos);
                    scope.$parent.safeApply();
                }
            }
        }
    }
});
_directives.directive('svgPoly', function (FigureFactory, $timeout) {
    return {
        restrict: 'E',
        scope   : {
            figure: '=figure'
        },
        templateNamespace: 'svg',
        replace: true,
        template: '<path id="WDG_[[figure.id]]" fill="[[figure.attrs.fill]]" stroke="[[figure.attrs.stroke]]" stroke-width="[[figure.attrs[\'stroke-width\'] ]]"  d="[[figure.attrs.d]]" transform="translate([[figure.getAttr(\'tx\', 0) ]], [[figure.getAttr(\'ty\', 0) ]])" />',
        link: function (scope, element, attrs) {
            var entity = scope.$parent.getEntity(scope.figure.id);
            element.bind('click', function(e){
                if(scope.$parent.activeBtn === 'erase'){
                    scope.$parent.delSelection(entity);
                    e.stopPropagation();
                }
                else{
                    e.stopPropagation();
                    scope.$parent.addEntityToSelection(entity);
                }
            });
            var object = d3.selectAll(element);
            object.call(d3.behavior.drag()
                .on("drag", drag)
                .on("dragstart", function() {
                    this.initialDatum = object.datum();
                    this.t = d3.transform(scope.$parent.SVG.container.attr("transform"));
                    this.triggered = d3.event.sourceEvent.triggered;
                    d3.event.sourceEvent.stopPropagation();
                })
                .on("dragend", function() {
                    if(scope.figure.hasChanges){
                        entity.changeState('unsaved');
                        scope.$parent.save('svg Ellipse dragend');
                    }
                    scope.figure.hasChanges = false;
                })
            );
            function drag(d){
                scope.figure.hasChanges = true;

                var data = object.node().getBoundingClientRect();
                var x = entity.getAttr('tx',0) + parseInt(d3.event.dx);
                var y = entity.getAttr('ty',0) + parseInt(d3.event.dy);
                entity.setAttr('tx', x)
                      .setAttr('ty', y);
                scope.$parent.safeApply();
            };
            $timeout(function(){
                object.datum(angular.fromJson(entity.getAttr('datum')));
            });
        }
    }
});
_directives.directive('templateTextbox', function () {
    return {
        restrict: 'E',
        replace: true,
        scope   : {
            figure: '='
        },
        templateUrl : '/static/conceptboard/views/board/widgets/textbox.html'
    }
});
_directives.directive('sHandlerDrag',['$document', '$timeout' , function($document, $timeout) {
    return {
        restrict: 'A',
        scope : {
            figures : "=el"
        },
        link: function (scope, element, attrs) {
            var startX, startY, initialMouseX, initialMouseY,fontSize,scale;
            element.bind('mousedown', function($event) {
                if(angular.isArray(scope.figures)){
                    fontSize = scope.$parent.scalePx;
                    scale = scope.$parent.scale;
                    startX = element.prop('offsetLeft');
                    startY = element.prop('offsetTop');
                    initialMouseX = $event.clientX;
                    initialMouseY = $event.clientY;
                    for (var i = 0; i < scope.figures.length; i++) {
                        var entity = scope.figures[i];
                        entity.startData = {
                            x : entity.getAttr('x'),
                            y : entity.getAttr('y'),
                            cx : entity.getAttr('cx'),
                            cy : entity.getAttr('cy'),
                            x1 : entity.getAttr('x1'),
                            y1 : entity.getAttr('y1'),
                            x2 : entity.getAttr('x2'),
                            y2 : entity.getAttr('y2'),
                            tx : entity.getAttr('tx'),
                            ty : entity.getAttr('ty'),
                        };
                    }
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                    return false;
                }
                else{
                    var node = document.getElementById('WDG_'+scope.figures.id);
                    fireEvent(node, 'mousedown', $event);
                }

            });
            function mousemove($event) {

                var dx = ($event.clientX - initialMouseX)/scale;
                var dy = ($event.clientY - initialMouseY)/scale;
                // var startYEM = startY/fontSize;
                // var startXEM = startX/fontSize;
                var dxEM = dx/fontSize*scale;
                var dyEM = dy/fontSize*scale;
                $timeout(function(){
                    for (var i = 0; i < scope.figures.length; i++) {
                        var entity = scope.figures[i];
                        if(entity.isWidget()){
                            entity.setAttr('x', (entity.startData.x + dxEM),true);
                            entity.setAttr('y', (entity.startData.y + dyEM),true);
                            entity.moveWidgetConnected(fontSize, scale);
                        }else{
                            // var el = d3.select('#WDG_'+entity.id);

                            if(entity.isLine()){
                                entity.setAttr('x1', parseInt(dx) + parseInt(entity.startData.x1))
                                      .setAttr('y1', parseInt(dy) + parseInt(entity.startData.y1))
                                      .setAttr('x2', parseInt(dx) + parseInt(entity.startData.x2))
                                      .setAttr('y2', parseInt(dy) + parseInt(entity.startData.y2));
                            }else if(entity.type === 'path'){
                                entity.setAttr('tx', parseInt(dx) + parseInt(entity.startData.tx))
                                      .setAttr('ty', parseInt(dy) + parseInt(entity.startData.ty));
                            }else if(entity.type === 'ellipse'){
                                entity.setAttr('cx', parseInt(dx) + parseInt(entity.startData.cx))
                                      .setAttr('cy', parseInt(dy) + parseInt(entity.startData.cy));
                            }else{
                                entity.setAttr('x', parseInt(dx) + parseInt(entity.startData.x))
                                      .setAttr('y', parseInt(dy) + parseInt(entity.startData.y));
                            }
                            if( entity.type === 'image' ){
                                entity.moveWidgetConnected(fontSize, scale);
                            }
                        }
                        entity.changeState('unsaved');
                    };
                });
            };

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                scope.$parent.save('group mouseup');
            };
            /**
             * Fire an event handler to the specified node. Event handlers can detect that the event was fired programatically
             * by testing for a 'synthetic=true' property on the event object
             * @param {HTMLNode} node The node to fire the event handler on.
             * @param {String} eventName The name of the event without the "on" (e.g., "focus")
             */
            function fireEvent(node, eventName, originalEvent) {
                // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
                var doc;
                if (node.ownerDocument) {
                    doc = node.ownerDocument;
                } else if (node.nodeType == 9){
                    // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
                    doc = node;
                } else {
                    throw new Error("Invalid node passed to fireEvent: " + node.id);
                }

                 if (node.dispatchEvent) {
                    var eventClass = "";
                    switch (eventName) {
                        case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
                        case "mousedown":
                        case "mouseup":
                            eventClass = "MouseEvents";
                            break;
                        case "focus":
                        case "change":
                        case "blur":
                        case "select":
                            eventClass = "HTMLEvents";
                            break;
                        default:
                            throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                            break;
                    }
                    var event = doc.createEvent(eventClass);
                    event.initMouseEvent (eventName, true, true, window, 0,
                            originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY,
                            originalEvent.ctrlKey, originalEvent.altKey, originalEvent.shiftKey, originalEvent.metaKey,
                            0, null);
                    event.triggered = true;
                    event.synthetic = true; // allow detection of synthetic events
                    node.dispatchEvent(event, true);
                } else  if (node.fireEvent) {
                    // IE-old school style
                    var event = doc.createEventObject(originalEvent);
                    event.triggered = true;
                    event.synthetic = true; // allow detection of synthetic events
                    node.fireEvent("on" + eventName, event);
                }
            };
        }
    }
}]);
_directives.directive('minimap',['$document', '$timeout' , function($document, $timeout) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            var editor = angular.element('#board-editor-zone');
            var _svg = scope.SVG;
            function getViewBox(){
                var w = scope.widgetsContainerWith.right - scope.widgetsContainerWith.left,
                    h = scope.widgetsContainerWith.bottom - scope.widgetsContainerWith.top;
                    return {
                        w:(w >= scope.windowWidth ? w : scope.windowWidth),
                        h:(h >= scope.windowHeight ? h : scope.windowHeight),
                        l:(scope.widgetsContainerWith.left),
                        t:(scope.widgetsContainerWith.top)
                    };
            }
            var surface = element.find('.surface'),
                viewer = element.find('.minimap-viewer'),
                handler = element.find('.movable');
            var dragChanges = false;

            // handler.css({left: translateMinimap[0]+'px', top: translateMinimap[1]+'px', width: w*scale+'px', height: h*scale+'px'});
            function surfacePoint(x,y){
                if (x == null) x = scope.windowWidth;
                if (y == null) y = scope.windowHeight;
                var container = _svg._mainG.node();
                var svg = container.ownerSVGElement || container;
                var point = svg.createSVGPoint();
                point.x = x, point.y = y;
                point = point.matrixTransform(container.getScreenCTM().inverse());
                return point;
            };
            handler.bind('mousedown', function($event) {
                startX = handler.prop('offsetLeft');
                startY = handler.prop('offsetTop');
                initialMouseX = $event.clientX;
                initialMouseY = $event.clientY;
                $document.bind('mousemove', mousemove);
                $document.bind('mouseup', mouseup);
                dragChanges = false;
                return false;
            });

            function mousemove($event) {
                // var fontSize = scope.$parent.scalePx;
                var dx = $event.clientX - initialMouseX;
                var dy = $event.clientY - initialMouseY;
                handler.css({
                    top:  startY + dy + 'px',
                    left: startX + dx + 'px'
                });
                handler.data('current', {
                    dx : dx,
                    dy : dy
                });
                dragChanges = true;
                // scope.$broadcast('_positionChangedFinished');
                return false;
            }

            function mouseup($event) {
                var current = handler.data('current');
                handler.removeClass('dragging');
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                if(!dragChanges){
                    return false;
                }
                if(handler.length && current){
                    scope.SVG.panMinimap(current.dx/scope.$parent.minimap.getScale(), current.dy/scope.$parent.minimap.getScale());
                }
            }

            viewer.bind('dblclick', function($event){
                var offset = handler.offset();
                var dx = $event.clientX-offset.left-handler.width()/2;
                var dy = $event.clientY-offset.top-handler.height()/2;
                scope.SVG.panMinimap(dx/scope.$parent.minimap.getScale(), dy/scope.$parent.minimap.getScale());
            });


            var Minimap = function(){
                var self = this;
                this.el  = element;
                this.viewer = {
                    width: function(){return viewer.width() || 230},
                    height: function(){return viewer.height() || 135},
                    offset: function(){return viewer.offset()},
                };

                this.handler = {
                    el:   handler,
                    left: function(){
                        return -scope.transformX*self.getScale();
                    },
                    top: function(){
                        return -scope.transformY*self.getScale();
                    },
                    width: function(){
                        return scope.windowWidth*self.getScale()/self.getFontSize();
                    },
                    height: function(){
                        return self.handler.width() / self.ratio();
                    }
                };
                this.ratio = function(){
                    return scope.windowWidth/scope.windowHeight;
                };
                this.scaleW = function(w){
                    var vb = getViewBox();
                    var sw = self.viewer.width() / (vb.w+Math.abs(scope.transformX+vb.l));
                    return sw;
                };
                this.scaleH = function(){
                    var vb = getViewBox();
                    var sh = self.viewer.height() / (vb.h+Math.abs(scope.transformY+vb.t) * self.ratio());
                    return sh;
                };
                this.objects = [];

                this.Left = function(){
                    var vb = getViewBox();
                    if(scope.transformX+vb.l>0){
                        this.min_left = scope.transformX*self.getScale();
                        return this.min_left;
                    }else if(!this.min_left && scope.transformX>0){
                        return scope.transformX*self.getScale();
                    }
                    return this.min_left;
                };
                this.Top = function(){
                    var vb = getViewBox();
                    if(scope.transformY+vb.t>0){
                        this.min_top = scope.transformY*self.getScale();
                        return this.min_top;
                    }else if(!this.min_top && scope.transformY>0){
                        return scope.transformY*self.getScale();
                    }
                    return this.min_top;
                };
                this.getScale = function(){
                    var vb = getViewBox();
                    // var proportion = Math.min(this.scaleW(), this.scaleH())*scope.scale;
                    var proportion = Math.min(this.scaleW(), this.scaleH());
                    return proportion;
                };
                this.getFontSize = function(){
                    return this.getScale()*100;
                };
                this.getFontSize1 = function(){
                    return this.getScale()*100;
                };

            };
            scope.$parent.minimap = new Minimap();
        }
    }
}]);

_directives.directive('minRect', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[(figure.attrs.x/100 * $parent.scale)]]em; top: [[figure.attrs.y/100 * $parent.scale]]em; width: [[figure.attrs.width/100 * $parent.scale]]em; height: [[figure.attrs.height/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minImage', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[(figure.attrs.x/100 * $parent.scale)]]em; top: [[figure.attrs.y/100 * $parent.scale]]em; width: [[figure.attrs.width/100 * $parent.scale]]em; height: [[figure.attrs.height/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minVideo', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[figure.attrs.x * $parent.scale]]em; top: [[figure.attrs.y * $parent.scale]]em; width: [[figure.attrs.width * $parent.scale/100]]em; height: [[figure.getAttr(\'height\')/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minEllipse', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="border-radius: [[figure.attrs.rx/100 * $parent.scale]]em; left: [[((figure.attrs.cx-figure.attrs.rx)/100 * $parent.scale)]]em; top: [[(figure.attrs.cy-figure.attrs.ry)/100 * $parent.scale]]em; width: [[figure.attrs.rx*2/100 * $parent.scale]]em; height: [[figure.attrs.ry*2/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minLine', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[(figure.attrs.x1|min:figure.attrs.x2)/100 * $parent.scale]]em; top: [[(figure.attrs.y1|min:figure.attrs.y2)/100 * $parent.scale]]em; width: [[(figure.attrs.x1-figure.attrs.x2|abs)/100 * $parent.scale]]em; height: [[(figure.attrs.y1-figure.attrs.y2|abs)/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minPath', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[(figure.attrs.x/100 * $parent.scale)+(figure.getAttr(\'tx\')/100 * $parent.scale)]]em; top: [[(figure.attrs.y/100 * $parent.scale)+(figure.getAttr(\'ty\')/100 * $parent.scale)]]em; width: [[figure.attrs.width/100 * $parent.scale]]em; height: [[figure.attrs.height/100 * $parent.scale]]em;"></div>',
    }
});
_directives.directive('minWidg', function () {
    return {
        restrict: 'E',
        scope   : { figure: '=figure' },
        replace: true,
        template: '<div class="mini-object" style="left: [[figure.attrs.x * $parent.scale]]em; top: [[figure.attrs.y * $parent.scale]]em; width: [[figure.attrs.width * $parent.scale/100]]em; height: [[figure.getRealHeight()/$parent.scale/100 * $parent.scale]]em;"></div>',
    }
});

_directives.directive('onFinishRender', function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if(scope.$last){
                // alert('last');
                scope.$evalAsync(function(){
                    if(!$rootScope._times_initial && $rootScope._initialObjectsLength){
                        $rootScope._times_initial = $timeout(function(){
                            scope.$parent.calculateAreaDimensions();
                            var initialTriggered = false;
                            if(scope.$parent.initialSelectionObject){
                                initialTriggered = true;
                                scope.$parent.SVG.centerElement(scope.$parent.initialSelectionObject);
                            }else{
                                for (var i = 0; i < scope.$parent.board.sections.length; i++) {
                                    bsection = scope.$parent.board.sections[i];
                                    if(bsection.inicial){
                                        scope.$parent.SVG.centerElement(bsection);
                                        initialTriggered = true;
                                        break;
                                    }
                                }
                            }
                            if(!initialTriggered){
                                scope.$parent.SVG._svg.trigger('change-fit');
                                // scope.$parent.SVG.centerDiagram();
                            }
                            $rootScope.loadingEditor = false;
                        }, 50);
                    }
                });
            }
        }
    }
});