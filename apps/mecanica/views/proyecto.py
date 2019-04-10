from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, detail_route
from mecanica.serializers import *
from mecanica.utils import get_cuenta_session
from rest_framework import permissions, viewsets, generics, mixins
from rest_framework.pagination import PageNumberPagination
from mecanica.models import Proyecto, OrdenTrabajo, EstadoProyecto, EstadoOrden, Comentario
from django.db.models import Q
from django.utils import timezone
import json, pdb

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset=Proyecto.objects.all().order_by('orden')
    serializer_class=ProyectoSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        proyectos=self.queryset.filter(cuenta_id=cuenta_id, archivado=False)
        if request.GET.get('q'):
            serializer_element = self.serializer_class(proyectos, many=True)
            return Response(serializer_element.data)
        if request.GET.get('f') == 'own':
            proyectos = proyectos.filter(Q(responsable=request.user) |
                                        Q(ordenes__responsable=request.user) |
                                        Q(ordenes__tareas__responsable=request.user))
        page = self.paginate_queryset(proyectos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(proyectos, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        instance = None
        cuenta_id = request.session.get('cuenta_id', '')
        request.data['orden'] = 1
        proyecto = Proyecto.objects.filter(cuenta_id=cuenta_id).order_by('-orden').first()
        if proyecto:
            request.data['orden'] = proyecto.orden+1
        if request.POST.get('id'):
            try:
                instance = Proyecto.objects.get(pk=request.POST.get('id'))
                request.data['estado'] = instance.estado.id
            except Proyecto.DoesNotExist:
                return Response({'success': False,'msg': 'El Proyecto no existe.'})
        else:
            request.data['estado'] = EstadoProyecto.objects.get(codigo=2, cuenta_id=cuenta_id).id
        serializer=ProyectoSerializer(data=request.data, context={'request': request}, instance=instance)

        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'El Proyecto no ha podido ser salvado.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'El Proyecto no ha podido ser salvado.', 'errors' : serializer.errors})


    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Proyecto.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'El Proyecto no existe.'})

    @detail_route(methods=['post'])
    def archivar(self, request, pk=None):
        try:
            instance = Proyecto.objects.get(pk=pk)
            instance.archivado = True
            instance.save()
            return Response({'success': True})
        except Proyecto.DoesNotExist:
            return Response({'success': False,'msg': 'El Proyecto no existe.'})

    @detail_route(methods=['POST'])
    def estado(self, request, pk=None):
        try:
            instance = Proyecto.objects.get(pk=pk)
            instance.estado_id = request.POST.get('state')
            # pdb.set_trace()
            instance.save()
            return Response({'success': True, 'id' : pk})
        except Proyecto.DoesNotExist:
            return Response({'success': False,'msg': 'No se ha podido cambiar el estado del proyecto.'})

    @detail_route(methods=['post'])
    def reorder(self, request, pk=None):
        from django.db import transaction
        transaction.set_autocommit(False)
        try:
            proyectos = self.queryset
            # pk id del usuario logueado
            orden = json.loads(request.POST.get('orden'))
            for el in orden:
                try:
                    proyecto = proyectos.get(pk=el.get('id'))
                    proyecto.orden=el.get('orden')
                    proyecto.save()
                except Proyecto.DoesNotExist:
                    transaction.rollback()
                    return JsonResponse({'success' : False, 'msg' : 'El orden no ha podido ser cambiado.'})
            transaction.commit()
            transaction.set_autocommit(True)
            return JsonResponse({'success' : True})
        except Proyecto.DoesNotExist:
            transaction.rollback()
            return JsonResponse({'success' : False, 'msg' : 'El proyecto no ha sido encontrado.'})

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset=OrdenTrabajo.objects.all()
    serializer_class=OrdenTrabajoSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        elementos=self.queryset.filter(archivado=False,proyecto__cuenta_id=cuenta_id)
        if request.GET.get('q'):
            elementos = elementos.filter(proyecto_id=request.GET.get('q'))
            serializer_element = self.serializer_class(elementos, many=True)
            return Response(serializer_element.data)
        elif request.GET.get('proy') or request.GET.get('f') == 'own':
            if request.GET.get('proy'):
                elementos = elementos.filter(proyecto_id=request.GET.get('proy'))
            if request.GET.get('f') == 'own':
                elementos = elementos.filter(responsable=request.user)
            serializer_element = self.serializer_class(elementos, many=True)
            return Response(serializer_element.data)
        else:
            page = self.paginate_queryset(elementos)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(elementos, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        instance = None
        cuenta_id = request.session.get('cuenta_id', '')
        request.data['orden'] = 1
        orden = OrdenTrabajo.objects.filter(proyecto_id=request.data.get('proyecto')).order_by('-orden').first()
        if orden:
            request.data['orden'] = orden.orden+1
        if request.POST.get('id'):
            try:
                instance = OrdenTrabajo.objects.get(pk=request.POST.get('id'))
                request.data['estado'] = instance.estado.id
            except OrdenTrabajo.DoesNotExist:
                return Response({'success': False,'msg': 'La órden de trabajo no existe.'})
        else:
            request.data['estado'] = EstadoOrden.objects.get(codigo=3, cuenta_id=cuenta_id).id
        serializer=self.serializer_class(data=request.data, context={'request': request}, instance=instance)
        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'La órden de trabajo no ha podido ser salvada.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'La órden de trabajo no ha podido ser salvada.', 'errors' : serializer.errors})

    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = OrdenTrabajo.objects.get(pk=pk)
            response_serialized = self.serializer_class(instance)
            data = response_serialized.data
            instance.delete()
            return Response(data)
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'La órden de trabajo no ha sido encontrada.'})

    @detail_route(methods=['post'])
    def archivar(self, request, pk=None):
        try:
            instance = OrdenTrabajo.objects.get(pk=pk)
            instance.archivado = True
            instance.save()
            return Response({'success': True})
        except OrdenTrabajo.DoesNotExist:
            return Response({'success': False,'msg': 'La órden de trabajo no existe.'})

    @detail_route(methods=['POST'])
    def estado(self, request, pk=None):
        try:
            instance = OrdenTrabajo.objects.get(pk=pk)
            instance.estado_id = request.POST.get('state')
            instance.save()
            return Response({'success': True, 'id' : pk})
        except OrdenTrabajo.DoesNotExist:
            return Response({'success': False,'msg': 'No se ha podido cambiar el estado de la órden de trabajo.'})

    @detail_route(methods=['post'])
    def comment(self, request, pk=None):
        serializer=ComentarioSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            data=serializer.save()
            response_serialized = ComentarioSerializer(data)
            return Response(response_serialized.data)
        else:
            return Response({'success': False,'msg': 'El comentario no pudo ser salvado.', 'errors' : serializer.errors})

    @detail_route(methods=['post'])
    def reorder(self, request, pk=None):
        from django.db import transaction
        transaction.set_autocommit(False)
        try:
            ordenes = OrdenTrabajo.objects.filter(proyecto_id=pk)
            # pk id del usuario logueado
            orden = json.loads(request.POST.get('orden'))
            for el in orden:
                try:
                    orden_trabajo = ordenes.get(pk=el.get('id'))
                    orden_trabajo.orden=el.get('orden')
                    orden_trabajo.save()
                except OrdenTrabajo.DoesNotExist:
                    transaction.rollback()
                    return JsonResponse({'success' : False, 'msg' : 'El órden no ha podido ser cambiado.'})
            transaction.commit()
            transaction.set_autocommit(True)
            return JsonResponse({'success' : True})
        except Proyecto.DoesNotExist:
            transaction.rollback()
            return JsonResponse({'success' : False, 'msg' : 'El proyecto no ha sido encontrado.'})

class ProyectoEstadosViewSet(viewsets.ModelViewSet):
    queryset=EstadoProyecto.objects.all()
    serializer_class=EstadoProyectoSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        estados=self.queryset.filter(cuenta_id=cuenta_id)
        if not request.GET.get('q'):
            page = self.paginate_queryset(estados)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(estados, many=True)
        return Response(serializer_element.data)

class OrdenEstadosViewSet(viewsets.ModelViewSet):
    queryset=EstadoOrden.objects.all()
    serializer_class=EstadoOrdenSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        estados=self.queryset.filter(cuenta_id=cuenta_id)
        if not request.GET.get('q'):
            page = self.paginate_queryset(estados)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(estados, many=True)
        return Response(serializer_element.data)