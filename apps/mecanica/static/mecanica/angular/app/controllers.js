_controllers.controller('MainController', function ($scope, $rootScope, Notification, CSRF_TOKEN, ProyectoService, OrdenTrabajoService, TareaService, AlertaService) {
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
               fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    $scope.addCommentOrden = function(orden_trabajo){
        orden_trabajo._replaying = true;
        orden_trabajo.new_comment.orden_trabajo = orden_trabajo.id;
        OrdenTrabajoService.comment(orden_trabajo.new_comment, orden_trabajo.id).then(function(result){
            orden_trabajo._replaying = false;
            if(result.data.id){
                orden_trabajo.new_comment = {};
                orden_trabajo.comentarios.push(result.data);
                Notification.success("Su comentario ha sido enviado.");
            }else{
                Notification.success("Su comentario no ha podido ser enviado.");
            }
            $rootScope.safeApply();
        }, function(data){
            orden_trabajo._replaying = false;
            $rootScope.safeApply();
            Notification.success("Su comentario no ha podido ser enviado.");
        });
    };
    $scope.addCommentTarea = function(tarea){
        tarea._replaying = true;
        tarea.new_comment.tarea = tarea.id;
        TareaService.comment(tarea.new_comment, tarea.id).then(function(result){
            tarea._replaying = false;
            if(result.data.id){
                tarea.new_comment = {};
                tarea.comentarios.push(result.data);
                Notification.success("Su comentario ha sido enviado.");
            }else{
                Notification.success("Su comentario no ha podido ser enviado.");
            }
            $rootScope.safeApply();
        }, function(data){
            tarea._replaying = false;
            $rootScope.safeApply();
            Notification.success("Su comentario no ha podido ser enviado.");
        });
    };
    $scope.addCommentAlerta = function(alerta){
        alerta._replaying = true;
        alerta.new_comment.alerta = alerta.id;
        AlertaService.comment(alerta.new_comment, alerta.id).then(function(result){
            alerta._replaying = false;
            if(result.data.id){
                alerta.new_comment = {};
                alerta.comentarios.push(result.data);
                Notification.success("Su comentario ha sido enviado.");
            }else{
                Notification.success("Su comentario no ha podido ser enviado.");
            }
            $rootScope.safeApply();
        }, function(data){
            alerta._replaying = false;
            $rootScope.safeApply();
            Notification.success("Su comentario no ha podido ser enviado.");
        });
    };
    $scope.changeEstadoProy = function(proyecto, estado){
        ProyectoService.changeEstado(proyecto.id, estado.id).then(function(result){
            if (result.data.success) {
                proyecto.estado = estado;
                $rootScope.safeApply();
                Notification.success("El estado del proyecto ha sido cambiado.");
            } else {
                Notification.error(data.msg ? data.msg : "El estado del proyecto no pudo ser cambiado.");
            };
        });
    };
    $scope.changeEstadoOrden = function(orden, estado){
        OrdenTrabajoService.changeEstado(orden.id, estado.id).then(function(result){
            if (result.data.success) {
                orden.estado = estado;
                $rootScope.safeApply();
                Notification.success("El estado de la órden de trabajo ha sido cambiado.");
            } else {
                Notification.error(data.msg ? data.msg : "El estado la órden de trabajo no pudo ser cambiado.");
            };
        });
    };
    $scope.changeEstadoTarea = function(orden, estado){
        TareaService.changeEstado(orden.id, estado.id).then(function(result){
            if (result.data.success) {
                orden.estado = estado;
                $rootScope.safeApply();
                Notification.success("El estado de la tarea ha sido cambiado.");
            } else {
                Notification.error(data.msg ? data.msg : "El estado la tarea no pudo ser cambiado.");
            };
        });
    };
    $rootScope.closeModal = function(){
        angular.element('.modal.show').modal('hide');
        angular.element('body').removeClass('modal-open');
        angular.element('.modal-backdrop.show').remove();
    };
    $rootScope.uploadFile = function(array_files, file, folder) {
        var xhr;
        var fileData = {
            id: _uuid(),
            el : file,
            percent: 0
        };
        if(!$rootScope.uploading_list){
            $rootScope.uploading_list = [];
        }
        $rootScope.uploading_list.push(fileData);
        $rootScope.safeApply();
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (evt) {
                xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentVal = parseInt((evt.loaded / evt.total) * 100);
                        fileData.percent = percentVal;
                        $rootScope.safeApply();
                    }
                }, false);

                xhr.addEventListener("load", function (data) {
                    var rsp = JSON.parse(xhr.responseText);
                    if(rsp.id){
                        angular.extend(fileData, rsp);
                        array_files.push(fileData);
                        for (var i = 0; i < $rootScope.uploading_list.length; i++) {
                            if($rootScope.uploading_list[i].id = fileData.id){
                                $rootScope.uploading_list.splice(i,1);
                            }
                        };
                        $rootScope.safeApply();
                    }
                }, false);
                xhr.open("post", '/app/api/docs/', true);
                var fd = new FormData();
                fd.append("file", file);
                if(!!folder){
                    fd.append("folder", folder);
                }
                fd.append("csrfmiddlewaretoken", CSRF_TOKEN.csrf_token);
                xhr.onload = function () {};
                xhr.send(fd);
            };
        }(file));
        reader.readAsDataURL(file);
    };
    $rootScope.traverseFiles = function(array_files, upload_files, folder) {
        if (typeof upload_files !== "undefined") {
            for (var i=0, l=upload_files.length; i<l; i++) {
                $rootScope.uploadFile(array_files, upload_files[i], folder);
            }
        }
        else {
            fileList.innerHTML = "No support for the File API in this web browser";
        }
    };
    $rootScope.showErrors = function(form, errors){
        if(errors){
            angular.forEach(errors, function(value, key) {
                var input = form.find('[name="'+key+'"]');
                var group = input.closest('form-group');
                if(group.length){
                    var err_html = $('<div class="error custom-error">'+value.join('.')+'</div>');
                    group.append(err_html);
                    group.addClass('has-error');
                }else{
                    $('<div class="error custom-error">'+value.join('.')+'</div>').insertAfter(input);
                    input.parent().addClass('has-error');
                }
            });
        }
    };
    $scope.isImage=function(file){
        return file.tipo.toLowerCase() == 'jpg' || file.tipo.toLowerCase() == 'jpeg' ||
            file.tipo.toLowerCase() == 'gif' || file.tipo.toLowerCase() == 'bmp' ||
            file.tipo.toLowerCase() == 'png';
    };
    $scope.isHtml=function(file){
        return file.tipo.toLowerCase() == 'html' || file.tipo.toLowerCase() == 'xml' || file.tipo.toLowerCase() == 'htm';
    };
    $scope.isPdf=function(file){
        return file.tipo.toLowerCase() == 'pdf';
    };
    $scope.isWord=function(file){
        return file.tipo.toLowerCase() == 'doc' || file.tipo.toLowerCase() == 'docx';
    };
    $scope.isText=function(file){
        return file.tipo.toLowerCase() == 'txt';
    };
    $scope.isExcel=function(file){
        return file.tipo.toLowerCase() == 'xls' || file.tipo.toLowerCase() == 'xlst';
    };
    $scope.isAudio=function(file){
        return file.tipo.toLowerCase() == 'mp3' || file.tipo.toLowerCase() == 'ogg' || file.tipo.toLowerCase() == 'wma';
    };
    $scope.isPpt=function(file){
        return file.tipo.toLowerCase() == 'ppt' || file.tipo.toLowerCase() == 'pptx';
    };
    $scope.isVideo=function(file){
        return file.tipo.toLowerCase() == 'mp4' || file.tipo.toLowerCase() == 'mpg' ||
        file.tipo.toLowerCase() == 'avi' || file.tipo.toLowerCase() == 'flv' || file.tipo.toLowerCase() == 'mkv';
    };
    $scope.isZip=function(file){
        return file.tipo.toLowerCase() == '7z' || file.tipo.toLowerCase() == 'zio' || file.tipo.toLowerCase() == 'rar';
    };
    $scope.isFile=function(file){
        return file.tipo!='folder' && !$scope.isImage(file) && !$scope.isPdf(file) && !$scope.isWord(file) &&
            !$scope.isAudio(file) && !$scope.isPpt(file) && !$scope.isVideo(file) &&
            !$scope.isExcel(file) && !$scope.isHtml(file) && !$scope.isText(file) && !$scope.isZip(file);
    };
});

_controllers.controller('InicioController', function ($scope, $rootScope, Notification) {

});
_controllers.controller('TallerController', function ($scope, $rootScope, Notification, Layouts) {
    $scope.layouts = Layouts.data;
    $scope.layoutCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.layouts.results.length; i++) {
                if($scope.layouts.results[i].id == data.id){
                    $scope.layouts.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.layouts.results.push(data);
            }
            $rootScope.safeApply();
            Notification.success("El layout ha sido salvado.");
        } else {
            Notification.error(data.msg ? data.msg : "El layout no pudo ser salvado.")
        };
        $rootScope.closeModal();
    };
    $scope.layoutDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.layouts.results.length; i++) {
                if($scope.layouts.results[i].id == data.id){
                    $scope.layouts.results.splice(i,1);
                    break;
                }
            };
            $rootScope.closeModal();
            Notification.success("El layout ha sido eliminado.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El layout no pudo ser eliminado.")
        };
    };
});

_controllers.controller('TallerEditorController', function ($scope, $rootScope, Notification, Layout, TallerService) {
    $scope.layout = TallerService.init(Layout.data);
    var wrapper = angular.element('.main-editor');
    $scope.windowHeight = wrapper.height();
    $scope.windowWidth = wrapper.width();
    $scope.widgetsContainerWith = {
        left : 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    $scope.selections = [];
    $scope.color = '#cccccc';
    $scope.activeBtnFn = function(type){
        if($scope.activeBtn == type){
            $scope.activeBtn = '';
        }else{
            $scope.activeBtn = type;
        }
    };
    $scope.save = function(trace){
        var objects = new Array();
        for(var i = 0; i < $scope.layout.elementos.length; i++) {
            if($scope.layout.elementos[i].needSave()){
                var temp = $scope.layout.elementos[i];
                objects.push(temp.toJson());
                temp.saving = true;
            }
        }
        // $scope.calculateAreaDimensions();
        if(objects.length){
            $scope.saving_board = true;
            TallerService.saveEl($scope.layout.id,objects).then(function(result){
                $scope.saving_board = false;
                if(result.data.success){
                    for (var i = 0; i < result.data.elements.length; i++) {
                        var tmpid = result.data.elements[i].oid || result.data.elements[i].id;
                        var entity = $scope.getEntity(tmpid);
                        entity.setId(result.data.elements[i].id);
                        entity.changeState('saved');
                        entity.saving = false;
                    };
                    $rootScope.safeApply();
                }else{
                    Notification.error(result.data.msg || "El elemento no ha podido ser salvado.");
                }
            });
        }
        return false;
    };
    $scope.delSelection = function(selected){
        var entities = [], ids = [];
        if(!!selected){
            if(!angular.isArray(selected)){
                selected = [selected];
            }
            for (var j = 0; j < selected.length; j++) {
                entities.push(selected[j]);
                ids.push({id:selected[j].id});
                selected[j].deleting = true;
                for (var i = 0; i < $scope.selections.length; i++) {
                    if($scope.selections[i].id === selected[j].id && $scope.selections[i].isSection() === selected[j].isSection()){
                        $scope.selections.splice(i,1);
                        break;
                    }
                };
            };
        }
        else{
            for(var i = 0; i < $scope.selections.length; i++) {
                entities.push($scope.selections[i]);
                $scope.selections[i].deleting = true;
                ids.push({id:$scope.selections[i].id});
            }
            $scope.selections = [];
        }
        $rootScope.safeApply();
        TallerService.delEl($scope.layout.id,ids).then(function(result){
            $scope.saving_board = false;
            if(result.data.success){
                for (var i = 0; i < ids.length; i++) {
                    $scope.delEntity(ids[i].id);
                };
                $rootScope.safeApply();
            }else{
                Notification.error(result.data.msg || "El elemento no ha podido ser salvado.");
            }
        });
    };
    $scope.zoom = function(operation){
        if($scope.scaleRangeMinMap > 0.15 && $scope.scaleRangeMinMap < 10){
            if(operation=='+'){
                $scope.scaleRangeMinMap += 0.1;
            }else{
                $scope.scaleRangeMinMap -= 0.1;
            }
            $rootScope.safeApply();
            $scope.SVG.setTargetZoom($scope.scaleRangeMinMap);
            $scope.SVG._svg.trigger('change-percent');

        }
    };
    $scope.fit = function(){
        $scope.SVG._svg.trigger('change-fit');
    };
    $scope.clearEntitySelection = function(force){
        var upd = false;
        for( var i = 0; i < $scope.selections.length; i++ ){
           if($scope.selections[i].editing){
                upd = true;
                $scope.selections[i].editing = false;
            }
            else if($scope.selections[i].pre_selected){
                $scope.selections[i].pre_selected = false;
                $scope.selections[i].editing = false;
            }
            $scope.selections[i].selected = false;
        }
        if(upd){
            $scope.save('clearEntitySelection');
        }
        $scope.selections = [];
        if(force) $rootScope.safeApply();

    };
    $scope.updateSVGVars = function(left,top,scale){
        if( scale ){
            $scope.scale = scale;
            $scope.scaleRangeMinMap = $scope.scale;
            $scope.scalePx = $scope.scale*100;
            $scope.backgroundScale = $scope.scale*200;
        }
        if( left ){
            $scope.transformX = left;
        }
        if( top ){
            $scope.transformY = top;
        }
        $rootScope.safeApply();
    };
    $scope.$watchCollection('selections', function(value,old){
        if(value.length === 1){
            var sel = value[0];
            $scope.color = sel.getAttr('fill');
            $scope.color_stroke = sel.getAttr('stroke') || '#90c8db';
            // $scope.safeApply();
        }
    });
    $scope.calculateAreaDimensions = function(){
        var z = $scope.scale;
        var x,y,right,bottom;
        var newContainerDim = {
            left : 0,
            right: !$scope.layout.elementos.length && !$scope.board.sections.length ? $scope.windowWidth : 0,
            top: 0,
            bottom: !$scope.layout.elementos.length && !$scope.board.sections.length ? $scope.windowHeight : 0
        };
        for (var i = 0; i < $scope.layout.elementos.length; i++) {
            var el = $scope.layout.elementos[i];
            var x = parseFloat(el.getAttr('x'))+parseFloat(el.getAttr('tx',0));
            var y = parseFloat(el.getAttr('y'))+parseFloat(el.getAttr('ty',0));
            if( el.isWidget() || el.isMedia() ){
                x = (x * parseFloat($scope.scalePx))/z;
                y = (y * parseFloat($scope.scalePx))/z;
                right = x + parseFloat(el.getRealWidth());
                bottom = y + parseFloat(el.getRealHeight());
            }
            else{
                right = x + parseFloat(el.getAttr('width'));
                bottom = y + parseFloat(el.getAttr('height'));
            }
            //left
            if(x < newContainerDim.left){
                newContainerDim.left = x;
            }
            //right
            if(right > newContainerDim.right){
                newContainerDim.right = right;
            }
            //top
            if(y < newContainerDim.top){
                newContainerDim.top = y;
            }
            //bottom
            if(bottom > newContainerDim.bottom){
                newContainerDim.bottom = bottom;
            }
        };

        $scope.widgetsContainerWith = newContainerDim;

    };
    $scope.inSelections = function(entity){
        for( var i = 0; i < $scope.selections.length; i++ ){
            if($scope.selections[i].id === entity.id){
                return true;
            }
        }
        return false;
    };
    $scope.removeFromSelection = function(id){
        for( var i = 0; i < $scope.selections.length; i++ ){
            if($scope.selections[i].id === id){
                $scope.selections.splice(i,1);
                break;
            }
        }
    };
    $scope.addEntityToSelection = function(entity){
        $scope.clearEntitySelection();
        if(!$scope.inSelections(entity)){
            entity.selected = true;
            $scope.selections.push(entity);
            $scope.activeBtn = '';
        }else if($scope.selections.length > 1){
            $scope.removeFromSelection(entity.id);
            entity.selected = false;
        }
        $rootScope.safeApply();
    };

    $scope.getFillProperties = function() {
        return {
            "stroke" : "#333",
            "stroke-width" : 1,
            "stroke-opacity" : 0.5,
            "fill" : $scope.color
        }
    };
    $scope.getEntity = function(id){
        var returned = false;
        for(var i = 0; i < $scope.layout.elementos.length; i++) {
            if($scope.layout.elementos[i].id == id){
                returned = $scope.layout.elementos[i];
                break;
            }
        }
        return returned;
    };
    $scope.delEntity = function(id){
        var returned = false;
        for(var i = 0; i < $scope.layout.elementos.length; i++) {
            if($scope.layout.elementos[i].id === id){
                $scope.layout.elementos.splice(i,1);
                returned = true;
                break;
            }
        }
        return returned;
    }
    $scope.addEntities = function(objects){
        if(angular.isArray(objects)){
            for(var i = 0; i < objects.length; i++) {
                $scope.layout.elementos.push(objects[i]);
            }
        }
        $rootScope.safeApply();
        $scope.save('addEntities');
    }
    $scope.changeSelectionAttr = function(key, value){
        if($scope.selections && $scope.selections.length){
            for( var i = 0; i < $scope.selections.length; i++ ){
                $scope.selections[i].setAttr(key, value);
            }
        }
    }
    $scope.$watch('color', function(value, old){
        $scope.changeSelectionAttr('fill', value);
    });
});

_controllers.controller('FlujoController', function ($scope, $rootScope, Notification, Productos, ProductosService, FlujoService) {
    $scope.productos = Productos.data;
    $scope.nueva_operacion = {};
    $scope.selectProduct = function(prod, mode, e){
        if(!!e) e.stopPropagation();
        $scope._selected=prod;
        $scope._selected.mode = (mode || null);
    };
    $scope.sections_sortable_option = {
        //Only allow draggable when click on handle element
        handle:'.reorder-button',
        //Construct method before sortable code
        construct:function(model){

        },
        //Callback after item is dropped
        stop:function(objetos, dropped_index){
            var toUpdate = [];
            // var i = 1;
            angular.forEach(objetos, function(object, index){
                object.orden = i+index;
                toUpdate.push({id: object.id, orden : object.orden});
            });
            $rootScope.safeApply();
            FlujoService.reorder(toUpdate, $scope._selected.id);
        }
    };
    $scope.productoCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.productos.results.length; i++) {
                if($scope.productos.results[i].id == data.id){
                    $scope.productos.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.productos.results.push(data);
            }
            $scope.selectProduct(data);
            $rootScope.safeApply();
            Notification.success("El producto ha sido salvado.");
        } else {
            Notification.error(data.msg ? data.msg : "El producto no pudo ser salvado.");
            $rootScope.showErrors(form, data.errors);
        };
    };
    $scope.agregarOperacion = function(elemento){
        if($scope._selected.id){
            var tmpid = _uuid();
            var tmp = {
                tmpid : tmpid,
                elemento: elemento
            };
            $scope._selected.flujos.push(tmp);
            FlujoService.create(elemento.id, $scope._selected.id).then(function(result){
                for (var i = 0; i < $scope._selected.flujos.length; i++) {
                    if($scope._selected.flujos[i].tmpid === tmpid){
                        $scope._selected.flujos.splice(i,1);
                        break;
                    }
                };
                if(result.data.id){
                    $scope._selected.flujos.push(result.data);
                }
                else{
                    Notification.error(result.data.msg || "La operación no ha podido ser salvada");
                }
            });
            $scope.nueva_operacion.layout_selected = '';
        }
    };
    $scope.deleteFlujo = function(elemento){
        elemento.deleting = true;
        FlujoService.remove(elemento.id).then(function(result){
            if(result.data.success){
                for (var i = 0; i < $scope._selected.flujos.length; i++) {
                    if($scope._selected.flujos[i].id === elemento.id){
                        $scope._selected.flujos.splice(i,1);
                        break;
                    }
                };
            }
            else{
                elemento.deleting = false;
                Notification.error(result.data.msg || "La operación no ha podido ser eliminada.");
            }
        });
    };
    $scope.archivar = function(producto){
        ProductosService.archivar(producto.id).then(function(result){
            if (result.data.success) {
                for (var i = 0; i < $scope.productos.results.length; i++) {
                    if($scope.productos.results[i].id == tarea.id){
                        $scope.productos.results.splice(i,1);
                        break;
                    }
                };
                $rootScope.safeApply();
                Notification.success("El producto ha sido archivado.");
            } else {
                Notification.error(data.msg ? data.msg : "El producto no pudo ser archivado.");
            };
        });
    };
    $scope.productoDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.productos.results.length; i++) {
                if($scope.productos.results[i].id == data.id){
                    $scope.productos.results.splice(i,1);
                    break;
                }
            };
            $rootScope.closeModal();
            Notification.success("El producto ha sido eliminado.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El producto no pudo ser eliminado.")
        };
    };
});

_controllers.controller('ProyectoController', function ($scope, $rootScope, Notification, Proyectos, ProyectoService, OrdenTrabajoService) {
    $scope.proyectos = Proyectos.data;
    $scope.orden = {};
    $scope.proyecto = {};
    $scope.dragularOptions = {
        scope: $scope,
        classes: {
          mirror: 'gu-mirror'
        },
        nameSpace: 'proyectos.results'
    };
    $scope.$on('dragulardrop', function(e, el, target, source, model){
        var toUpdate = new Array();
        $scope.proyectos.results.forEach(function(object, index){
            object.orden = index + 1;
            toUpdate.push({id: object.id, orden : object.orden});
        });
        ProyectoService.reorder(toUpdate, $rootScope.LOGGED_USER.id);
    });

    $scope.sections_sortable_option = {
        handle:'.card.block',
        //Callback after item is dropped
        stop:function(objetos, dropped_index){
            var toUpdate = [];
            // var i = 1;
            angular.forEach(objetos, function(object, index){
                object.orden = i+index;
                toUpdate.push({id: object.id, orden : object.orden});
            });
            $rootScope.safeApply();
            ProyectoService.reorder(toUpdate, $rootScope.LOGGED_USER.id);
        }
    };

    $scope.proyectoCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.proyectos.results.length; i++) {
                if($scope.proyectos.results[i].id == data.id){
                    $scope.proyectos.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.proyectos.results.push(data);
            }
            $scope.proyecto = {};
            $rootScope.safeApply();
            Notification.success("El proyecto ha sido salvado.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "El proyecto no pudo ser salvado.");
            $rootScope.showErrors(form, data.errors);
        };
    };

    $scope.ordenCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            var proyecto_id = data.proyecto.id || data.proyecto;
            for (var i = 0; i < $scope.proyectos.results.length; i++) {
                if($scope.proyectos.results[i].id == proyecto_id){
                    for (var j = 0; j < $scope.proyectos.results[i].ordenes.length; j++) {
                        if($scope.proyectos.results[i].ordenes[j].id == data.id){
                            $scope.proyectos.results[i].ordenes[j] = data;
                            existe = true;
                            break;
                        }
                    };
                    if(!existe){
                        $scope.proyectos.results[i].ordenes.push(data);
                    }
                    break;
                }
            };
            $scope.orden = {};
            $rootScope.safeApply();
            Notification.success("La órden de trabajo ha sido salvada.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser salvada.");
            $rootScope.showErrors(form, data.errors);
        };
    };


    $scope.archivar = function(proyecto){
        ProyectoService.archivar(proyecto.id).then(function(result){
            if (result.data.success) {
                for (var i = 0; i < $scope.proyectos.results.length; i++) {
                    if($scope.proyectos.results[i].id == proyecto.id){
                        $scope.proyectos.results.splice(i,1);
                        break;
                    }
                };
                $rootScope.safeApply();
                Notification.success("El proyecto ha sido archivado.");
            } else {
                Notification.error(data.msg ? data.msg : "El proyecto no pudo ser archivado.");
            };
        });

    };
    $scope.proyectoDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.proyectos.results.length; i++) {
                if($scope.proyectos.results[i].id == data.id){
                    $scope.proyectos.results.splice(i,1);
                    break;
                }
            };
            Notification.success("El proyecto ha sido eliminado.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El proyecto no pudo ser eliminado.")
        };
    };

});

_controllers.controller('ProduccionController', function ($scope, $rootScope, Notification, Proyectos, ProyectoService, OrdenTrabajoService) {
    $scope.proyectos = Proyectos.data;
    $scope.orden = {};
    $scope.selectProyecto = function(proy){
        if($scope._selected && $scope._selected.id === proy.id){
            $scope._selected = {};
        }else{
            $scope._selected=proy;
        }
    };
    $scope.sections_sortable_option = {
        handle:'.card.block',
        //Callback after item is dropped
        stop:function(objetos, dropped_index){
            var toUpdate = [];
            angular.forEach(objetos, function(object, index){
                objetos[index].orden = i+index;
                toUpdate.push({id: object.id, orden : object.orden});
            });
            $rootScope.safeApply();
            OrdenTrabajoService.reorder(toUpdate, $scope._selected.id);
        }
    };
    $scope.ordenCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            var proyecto_id = data.proyecto.id || data.proyecto;
            for (var i = 0; i < $scope.proyectos.results.length; i++) {
                if($scope.proyectos.results[i].id == proyecto_id){
                    for (var j = 0; j < $scope.proyectos.results[i].ordenes.length; j++) {
                        if($scope.proyectos.results[i].ordenes[j].id == data.id){
                            $scope.proyectos.results[i].ordenes[j] = data;
                            existe = true;
                            break;
                        }
                    };
                    if(!existe){
                        $scope.proyectos.results[i].ordenes.push(data);
                    }
                    break;
                }
            };
            $scope.orden = {};
            $rootScope.safeApply();
            Notification.success("La órden de trabajo ha sido salvada.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser salvada.");
            $rootScope.showErrors(form, data.errors);
        };
    };
    $scope.ordenDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            var proyecto_id = data.proyecto.id || data.proyecto;
            for (var i = 0; i < $scope.proyectos.results.length; i++) {
                if($scope.proyectos.results[i].id == proyecto_id){
                    for (var j = 0; j < $scope.proyectos.results[i].ordenes.length; j++) {
                        if($scope.proyectos.results[i].ordenes[j].id == data.id){
                            $scope.proyectos.results[i].ordenes[j] = data;
                            $scope.proyectos.results[i].ordenes.splice(j,1);
                            break;
                        }
                    };
                    break;
                }
            };
            Notification.success("La órden de trabajo ha sido eliminada.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser eliminada.")
        };
    };

    $scope.archivar = function(orden){
        OrdenTrabajoService.archivar(orden.id).then(function(result){
            if (result.data.success) {
                var proyecto_id = data.proyecto.id || data.proyecto;
                for (var i = 0; i < $scope.proyectos.results.length; i++) {
                    if($scope.proyectos.results[i].id == proyecto_id){
                        for (var j = 0; j < $scope.proyectos.results[i].ordenes.length; j++) {
                            if($scope.proyectos.results[i].ordenes[j].id == data.id){
                                $scope.proyectos.results[i].ordenes.splice(j,1);
                                break;
                            }
                        };
                        break;
                    }
                };
                $rootScope.safeApply();
                Notification.success("La órden de trabajo ha sido archivada.");
            } else {
                Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser archivada.");
            };
        });

    };

});

_controllers.controller('ControlDocumentosController', function ($scope, $rootScope, Notification, Documentos, DocumentosService) {
    $scope.documentos = Documentos.data;
    $scope.folder = {};
    $scope.folder_routes = [];

    $scope.openFolder = function(folder){
        $scope.folder_routes.push(folder);
        $scope.loading_folder = true;
        folder_id = folder ? folder.id : null;
        DocumentosService.load(folder_id).then(function(result){
            $scope.loading_folder = false;
            if(result.data){
                $scope.documentos = result.data;
                $rootScope.safeApply();
            }else{
                Notification.error(result.data.msg || "La carpeta solicitada no ha podido ser abierta.");
            }
        });
    };
    $scope.gotoFolder = function(folder){
        var routes = [];
        if(folder){
            for (var i = 0; i < $scope.folder_routes.length; i++) {
                routes.push($scope.folder_routes[i]);
                if($scope.folder_routes[i].id == folder.id){
                    break;
                }
            }
        }
        $scope.folder_routes = routes;
        $scope.loading_folder = true;
        DocumentosService.load(folder ? folder.id : null).then(function(result){
            $scope.loading_folder = false;
            if(result.data){
                $scope.documentos = result.data;
                $rootScope.safeApply();
            }else{
                Notification.error(result.data.msg || "La carpeta solicitada no ha podido ser abierta.");
            }
        });
    };
    $scope.getOpenedFolder = function(){
        return $scope.folder_routes.length ? $scope.folder_routes[$scope.folder_routes.length-1].id : null;
    };
    $scope.folderCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.documentos.length; i++) {
                if($scope.documentos[i].id == data.id){
                    $scope.documentos[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.documentos.push(data);
            }
            $scope.folder = {};
            $rootScope.safeApply();
            Notification.success("La carpeta ha sido creada.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "La carpeta no pudo ser salvada.");
            $rootScope.showErrors(form, data.errors);
        };
    };

    $scope.archivoDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.documentos.length; i++) {
                if($scope.documentos[i].id == data.id){
                    $scope.documentos.splice(i,1);
                    break;
                }
            };
            Notification.success("El archivo ha sido eliminado.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El archivo no pudo ser eliminado.")
        };
    };
    $scope.getFileDetails = function (documentos, e) {
        $scope.$apply(function () {
            $rootScope.traverseFiles(documentos, e.files, $scope.getOpenedFolder());
        });
    };
});

_controllers.controller('ControlEspacioController', function ($scope, $rootScope, Notification, Proyectos, Tareas, TareaService) {
    $scope.proyectos = Proyectos.data;
    $scope.tareas = Tareas.data;

    $scope.archivar = function(tarea){
        TareaService.archivar(tarea.id).then(function(result){
            if (result.data.success) {
                for (var i = 0; i < $scope.tareas.results.length; i++) {
                    if($scope.tareas.results[i].id == tarea.id){
                        $scope.tareas.results.splice(i,1);
                        break;
                    }
                };
                $rootScope.safeApply();
                Notification.success("La tarea ha sido archivada.");
            } else {
                Notification.error(data.msg ? data.msg : "La tarea no pudo ser archivada.");
            };
        });
    };
});

_controllers.controller('ControlAlertasController', function ($scope, $rootScope, Notification, Alertas) {
    $scope.alertas = Alertas.data;
    $scope.alerta = {};

    $scope.alertaCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.alertas.results.length; i++) {
                if($scope.alertas.results[i].id == data.id){
                    $scope.alertas.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.alertas.results.push(data);
            }
            $scope.alerta = {};
            $rootScope.safeApply();
            Notification.success("El evento o alerta ha sido salvado.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "El evento o alerta no pudo ser salvado.");
            $rootScope.showErrors(form, data.errors);
        };
    };
    $scope.alertaDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.alertas.results.length; i++) {
                if($scope.alertas.results[i].id == data.id){
                    $scope.alertas.results.splice(i,1);
                    break;
                }
            };
            Notification.success("El evento o alerta ha sido eliminada.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El evento o alerta no pudo ser eliminada.")
        };
    };
});

_controllers.controller('ControlTareasController', function ($scope, $rootScope, Notification, Ordenes) {
    $scope.ordenes = Ordenes.data;
    $scope.orden = {};
    $scope.tarea = {};

    $scope.removeArchivo = function(archivos, doc){
        if(archivos && archivos.length){
            for (var i = 0; i < archivos.length; i++) {
                if(archivos[i].id == doc.id){
                    archivos.splice(i,1);
                    break;
                }
            }
        }
    };

    $scope.selectOrden = function(orden){
        if($scope._selected && $scope._selected.id === orden.id){
            $scope._selected = {};
        }else{
            $scope._selected=orden;
        }
    };

    $scope.alertaCreated = function(data, success, form){
        if (data && data.id) {
            Notification.success("El evento o alerta ha sido creado correctament.");
            $rootScope.closeModal();

        } else {
            Notification.error(data.msg ? data.msg : "El evento o alerta no pudo ser salvado.");
        };
    };
    $scope.ordenCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.ordenes.results.length; i++) {
                if($scope.ordenes.results[i].id == data.id){
                    $scope.ordenes.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.ordenes.results.push(data);
            }
            $scope.orden = {};
            $rootScope.safeApply();
            Notification.success("La órden de trabajo ha sido salvada.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser salvada.");
            $rootScope.showErrors(form, data.errors);
        };
    };
    $scope.tareaCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            var orden_id = data.orden_trabajo.id || data.orden_trabajo;
            for (var i = 0; i < $scope.ordenes.results.length; i++) {
                if($scope.ordenes.results[i].id == orden_id){
                    for (var j = 0; j < $scope.ordenes.results[i].tareas.length; j++) {
                        if($scope.ordenes.results[i].tareas[j].id == data.id){
                            $scope.ordenes.results[i].tareas[j] = data;
                            existe = true;
                            break;
                        }
                    };
                    if(!existe){
                        $scope.ordenes.results[i].tareas.push(data);
                    }
                    break;
                }
            };
            $scope.tarea = {};
            $rootScope.safeApply();
            Notification.success("La tarea ha sido salvada.");
            $rootScope.closeModal();
        } else {
            Notification.error(data.msg ? data.msg : "La tarea no pudo ser salvada.");
            $rootScope.showErrors(form, data.errors);
        };
    };
    $scope.ordenDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            var proyecto_id = data.proyecto.id || data.proyecto;
            for (var i = 0; i < $scope.ordenes.results.length; i++) {
                if($scope.ordenes.results[i].id == data.id){
                    $scope.ordenes.results.splice(i,1);
                    break;
                }
            };
            Notification.success("La órden de trabajo ha sido eliminada.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser eliminada.")
        };
    };
    $scope.tareaDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            var orden_id = data.orden_trabajo.id || data.orden_trabajo;
            for (var i = 0; i < $scope.ordenes.results.length; i++) {
                if($scope.ordenes.results[i].id == orden_id){
                    for (var j = 0; j < $scope.ordenes.results[i].tareas.length; j++) {
                        if($scope.ordenes.results[i].tareas[j].id == data.id){
                            $scope.ordenes.results[i].tareas[j] = data;
                            $scope.ordenes.results[i].tareas.splice(j,1);
                            break;
                        }
                    };
                    break;
                }
            };
            Notification.success("La tarea ha sido eliminada.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "La tarea no pudo ser eliminada.")
        };
    };
    $scope.archivar = function(orden){
        OrdenTrabajoService.archivar(orden.id).then(function(result){
            if (result.data.success) {
                for (var i = 0; i < $scope.proyectos.results.length; i++) {
                    if($scope.proyectos.results[i].id == data.proyecto){
                        for (var j = 0; j < $scope.proyectos.results[i].ordenes.length; j++) {
                            if($scope.proyectos.results[i].ordenes[j].id == data.id){
                                $scope.proyectos.results[i].ordenes.splice(j,1);
                                break;
                            }
                        };
                        break;
                    }
                };
                $rootScope.safeApply();
                Notification.success("La órden de trabajo ha sido archivada.");
            } else {
                Notification.error(data.msg ? data.msg : "La órden de trabajo no pudo ser archivada.");
            };
        });

    };

});

_controllers.controller('UsuariosController', function ($scope, $rootScope, Notification, Usuarios) {
    $scope.usuarios = Usuarios.data;
    $scope.showUserList = function(value){
        $scope.user = value;
    };
    $scope.userCreated = function(data, success, form){
        if (data && data.id) {
            var existe = false;
            for (var i = 0; i < $scope.usuarios.results.length; i++) {
                if($scope.usuarios.results[i].id == data.id){
                    $scope.usuarios.results[i] = data;
                    existe = true;
                    break;
                }
            };
            if(!existe){
                $scope.usuarios.results.push(data);
            }
            $rootScope.safeApply();
            var err = form.find(".has-error");
            err.removeClass("has-error").find('.custom-error').remove();
            $scope.showUserList(false);
            Notification.success("El usuario <b>"+data.perfil.nombre+"</b> ha sido salvado correctamente.");
        } else {
            Notification.error(data.msg ? data.msg : "El usuario no pudo ser salvado.")
            if(data.errors){
                angular.forEach(data.errors, function(value, key) {
                    var input = form.find('[name="'+key+'"]');
                    $('<div class="error custom-error">'+value.join('.')+'</div>').insertAfter(input);
                    input.parent().addClass('has-error');
                });
            }
        };
    };
    $scope.userDeleted = function(data, success, form){
        $rootScope.closeModal();
        if (data && data.id) {
            for (var i = 0; i < $scope.usuarios.results.length; i++) {
                if($scope.usuarios.results[i].id == data.id){
                    $scope.usuarios.results.splice(i,1);
                    break;
                }
            };
            $rootScope.closeModal();
            Notification.success("El usuario ha sido eliminado.");
            $rootScope.safeApply();
        } else {
            Notification.error(data.msg ? data.msg : "El usuario no pudo ser eliminado.")
        };
    };
});