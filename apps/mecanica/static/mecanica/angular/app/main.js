var _controllers = angular.module('_controllers', []);
var _services = angular.module('_services',[]);
var _filters = angular.module('_filters',[]);
var _factories = angular.module('_factories',[]);
var _directives = angular.module('_directives',[]);
app.mecanica = angular.module('mmApp',
    [
        'ngRoute',
        '_filters',
        '_factories',
        '_directives',
        '_controllers',
        '_services',
        'minicolors',
        'ui-notification',
        'html5.sortable',
        'dragularModule',
        'yaru22.angular-timeago'
        //'ui.bootstrap',
        //'ui.sortable'
    ]
);

app.mecanica.config(function($interpolateProvider, $routeProvider, $httpProvider, CSRF_TOKEN){
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.common['X-CSRF-TOKEN'] = CSRF_TOKEN.csrf_token;
    /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];

    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

    $routeProvider
        .when('/',
        {
            controller  : 'InicioController',
            templateUrl : '/static/mecanica/tpls/inicio/index.html',
            title       : "Inicio"
        })
        .when('/layout',
        {
            controller  : 'TallerController',
            templateUrl : '/static/mecanica/tpls/taller/index.html',
            resolve     : {
                Layouts: function(TallerService){
                    return TallerService.load();
                }
            },
            title       : "Layout"
        })
        .when('/layout/:id',
        {
            controller  : 'TallerEditorController',
            templateUrl : '/static/mecanica/tpls/taller/editor.html',
            resolve     : {
                Layout: function($route,TallerService){
                    return TallerService.get($route.current.params.id);
                }
            },
            title       : "Editor de Layout"
        })
        .when('/flujo',
        {
            controller  : 'FlujoController',
            templateUrl : '/static/mecanica/tpls/flujo/index.html',
            resolve     : {
                Productos: function(ProductosService){
                    return ProductosService.load();
                }
            },
            title       : "Tipos de Usuarios"
        })
        .when('/proyectos',
        {
            controller  : 'ProyectoController',
            templateUrl : '/static/mecanica/tpls/proyectos/index.html',
            resolve     : {
                Proyectos: function(ProyectoService){
                    return ProyectoService.load();
                }
            },
            title       : "Gestión de proyectos"
        })
        .when('/produccion',
        {
            controller  : 'ProduccionController',
            templateUrl : '/static/mecanica/tpls/proyectos/ordenes.html',
            resolve     : {
                Proyectos: function(ProyectoService){
                    return ProyectoService.load();
                }
            },
            title       : "Módulo Producción"
        })
        .when('/control/espacio',
        {
            controller  : 'ControlEspacioController',
            templateUrl : '/static/mecanica/tpls/control/espacio.html',
            resolve     : {
                Proyectos: function(ProyectoService){
                    return ProyectoService.load('?f=own');
                },
                Tareas: function(TareaService){
                    return TareaService.load('?f=own');
                },
                Ordenes: function(OrdenTrabajoService){
                    return OrdenTrabajoService.load('?f=own');
                }
            },
            title       : "Control de órdenes de trabajo"
        })
        .when('/control/documentos',
        {
            controller  : 'ControlDocumentosController',
            templateUrl : '/static/mecanica/tpls/control/documentos.html',
            resolve     : {
                Documentos: function(DocumentosService){
                    return DocumentosService.load();
                }
            },
            title       : "Gestión de documentos"
        })
        .when('/control/alertas',
        {
            controller  : 'ControlAlertasController',
            templateUrl : '/static/mecanica/tpls/control/alertas.html',
            resolve     : {
                Alertas: function(AlertaService){
                    return AlertaService.load('?f=own');
                }
            },
            title       : "Alertas y eventos"
        })
        .when('/control/tareas',
        {
            controller  : 'ControlTareasController',
            templateUrl : '/static/mecanica/tpls/control/tareas.html',
            resolve     : {
                Ordenes: function(TareaService){
                    return TareaService.ordenes();
                }
            },
            title       : "Gestión de Órdenes y Tareas"
        })
        .when('/usuarios',
        {
            controller  : 'UsuariosController',
            templateUrl : '/static/mecanica/tpls/usuarios/index.html',
            resolve     : {
                Usuarios: function(UsuariosService){
                    return UsuariosService.load();
                }
            },
            title       : "Usuarios"
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.mecanica.run(['$rootScope', '$templateCache', '$http', function($root, $templateCache, $http) {
  $root.LOGGED_USER = app.LOGGED_USER;
  $root.ADMIN_CONFIG = app.ADMIN_CONFIG;
  $root.BASE_URL = app.BASE_URL;
  $http.get('/static/mecanica/tpls/taller/svg_editor.html').then(function(response) {
      $templateCache.put('svg_editor_template', response.data);
  });
  $root.$on('$routeChangeStart', function(e, curr, prev) {
    if (curr.$$route && curr.$$route.resolve) {
      $root.loadingView = true;
    }
  });
  $root.$on('$routeChangeSuccess', function(e, curr, prev) {
    if(curr.$$route){
        $root.page_title = 'Mecánica | '+ curr.$$route.title;
        var current_route = curr.$$route.originalPath;
        if(curr.keys){
            for (var i = 0; i < curr.keys.length; i++) {
                if(curr.params.hasOwnProperty(curr.keys[i].name)){
                    current_route = current_route.replace(':'+curr.keys[i].name, curr.params[curr.keys[i].name] );
                }
            }
        }
        $root.active_route = current_route;
        $root.original_route = curr.$$route.originalPath;
        $root.loadingView = false;
        $('.tooltip').remove();
    }
  });
}]);
