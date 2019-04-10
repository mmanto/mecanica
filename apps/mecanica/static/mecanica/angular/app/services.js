_services.service('ComunService', function($http, $q){
    var service = {};

    service.paginate = function(url, page, params){
        // params = params || "";
        // var data = {page : page};
        // angular.extend(data, q);
        return $http.get(url+'?page='+page);
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});

_services.service('DocumentosService', function($http, $q){
    var service = {};

    service.load = function(folder){
        if(folder){
            return $http.get('/app/api/docs?f='+folder);
        }
        return $http.get('/app/api/docs');
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('TallerService', function($http, $q, $rootScope, CSRF_TOKEN, FigureFactory){
    var service = {};

    service.init = function(layout){
        var elementos = new Array();
        angular.forEach(layout.elementos, function(value, key) {
            var figure = new FigureFactory(value, 'saved');
            elementos.push(figure);
        });
        layout.elementos = elementos;
        return layout;
    };
    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/layout?q='+filter);
        }
        return $http.get('/app/api/layout');
    };
    service.elementos = function(id){
        return $http.get('/app/api/elemento?q='+id);
    };

    service.get = function(id){
        return $http.get('/app/api/layout/'+id+'/');
    };

    service.saveEl  = function(id, objects){
        return $http({
            method  : "post",
            data    : {
                data : angular.toJson(objects),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/layout/'+id+'/elements/'
        });
    };
    service.delEl  = function(id, els){
        return $http({
            method  : "post",
            data    : {
                id : id,
                els : angular.toJson(els),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/elemento/'+id+'/remove/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('FlujoService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.create  = function(elemento, producto){
        return $http({
            method  : "post",
            data    : {
                elemento : elemento,
                producto : producto,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/flujo/'
        });
    };
    service.reorder  = function(orden,id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                orden : angular.toJson(orden),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/flujo/'+id+'/reorder/'
        });
    };
    service.remove  = function(id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/flujo/'+id+'/remove/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('ProductosService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.load = function(){
        return $http.get('/app/api/producto');
    };
    service.archivar  = function(id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/producto/'+id+'/archivar/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('UsuariosService', function($http, $q, $rootScope){
    var service = {};

    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/usuarios?q='+filter);
        }
        return $http.get('/app/api/usuarios');
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('ProyectoService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/proyecto'+filter);
        }
        return $http.get('/app/api/proyecto');
    };

    service.archivar  = function(id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/proyecto/'+id+'/archivar/'
        });
    };

    service.reorder  = function(orden,id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                orden : angular.toJson(orden),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/proyecto/'+id+'/reorder/'
        });
    };

    service.ordenes = function(id){
        return $http.get('/app/api/orden?q='+id);
    };

    service.estados = function(filter){
        if(filter){
            return $http.get('/app/api/proyecto_estados?q='+filter);
        }
        return $http.get('/app/api/proyecto_estados');
    };

    service.changeEstado = function(id, estado){
        return $http({
            method  : "post",
            data    : {
                state : estado,
                "csrfmiddlewaretoken": CSRF_TOKEN.csrf_token,
                id: id
            },
            url     : '/app/api/proyecto/'+id+'/estado/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('OrdenTrabajoService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/orden'+filter);
        }
        return $http.get('/app/api/orden');
    };

    service.archivar  = function(id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/orden/'+id+'/archivar/'
        });
    };

    service.reorder  = function(orden,id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                orden : angular.toJson(orden),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/orden/'+id+'/reorder/'
        });
    };

    service.estados = function(filter){
        if(filter){
            return $http.get('/app/api/orden_estados?q='+filter);
        }
        return $http.get('/app/api/orden_estados');
    };

    service.changeEstado = function(id, estado){
        return $http({
            method  : "post",
            data    : {
                state : estado,
                "csrfmiddlewaretoken": CSRF_TOKEN.csrf_token,
                id: id
            },
            url     : '/app/api/orden/'+id+'/estado/'
        });
    };

    service.comment = function(data, id){
        data.csrfmiddlewaretoken = CSRF_TOKEN.csrf_token;
        return $http({
            method:"post",
            data: data,
            url: '/app/api/orden/'+id+'/comment/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('TareaService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/tarea'+filter);
        }
        return $http.get('/app/api/tarea');
    };

    service.ordenes = function(filter){
        if(filter){
            return $http.get('/app/api/orden'+filter);
        }
        return $http.get('/app/api/orden');
    };

    service.archivar  = function(id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/tarea/'+id+'/archivar/'
        });
    };

    service.reorder  = function(orden,id){
        return $http({
            method  : "post",
            data    : {
                id : id,
                orden : angular.toJson(orden),
                csrfmiddlewaretoken : CSRF_TOKEN.csrf_token
            },
            url     : '/app/api/tarea/'+id+'/reorder/'
        });
    };

    service.estados = function(filter){
        if(filter){
            return $http.get('/app/api/orden_tareas?q='+filter);
        }
        return $http.get('/app/api/orden_tareas');
    };

    service.comment = function(data, id){
        data.csrfmiddlewaretoken = CSRF_TOKEN.csrf_token;
        return $http({
            method:"post",
            data: data,
            url: '/app/api/tarea/'+id+'/comment/'
        });
    };

    service.changeEstado = function(id, estado){
        return $http({
            method  : "post",
            data    : {
                state : estado,
                "csrfmiddlewaretoken": CSRF_TOKEN.csrf_token,
                id: id
            },
            url     : '/app/api/tarea/'+id+'/estado/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});
_services.service('AlertaService', function($http, $q, $rootScope, CSRF_TOKEN){
    var service = {};

    service.load = function(filter){
        if(filter){
            return $http.get('/app/api/alerta'+filter);
        }
        return $http.get('/app/api/alerta');
    };

    service.comment = function(data, id){
        data.csrfmiddlewaretoken = CSRF_TOKEN.csrf_token;
        return $http({
            method:"post",
            data: data,
            url: '/app/api/alerta/'+id+'/comment/'
        });
    };

    function handleError( response ) {
        if (! angular.isObject( response.data ) || ! response.data.success ) {
            $rootScope.loadingView = false;
            return( $q.reject( "An unknown error occurred." ) );
        }
        return( $q.reject( response.data.message ) );
    };
    function handleSuccess( response ) {
        return( response.data );
    };

    return service;
});