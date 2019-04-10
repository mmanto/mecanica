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
from mecanica.models import Proyecto, OrdenTrabajo, EstadoTarea, Tarea, Comentario
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

class TareaViewSet(viewsets.ModelViewSet):
    queryset=Tarea.objects.all().order_by('orden')
    serializer_class=TareaSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        elementos=self.queryset.filter(archivado=False)
        if request.GET.get('f') == 'own':
            elementos = elementos.filter(responsable=request.user)
        elif request.GET.get('ord'):
            elementos = elementos.filter(orden_trabajo_id=request.GET.get('ord'))
        if not request.GET.get('q'):
            page = self.paginate_queryset(elementos)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(elementos, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        instance = None
        request.data['orden'] = 1
        cuenta_id = request.session.get('cuenta_id', '')
        orden = Tarea.objects.filter(orden_trabajo_id=request.data.get('orden')).order_by('-orden').first()
        if orden:
            request.data['orden'] = orden.orden+1
        if request.POST.get('id'):
            try:
                instance = Tarea.objects.get(pk=request.POST.get('id'))
                request.data['estado'] = instance.estado.id
            except Tarea.DoesNotExist:
                return Response({'success': False,'msg': 'La tarea no existe.'})
        else:
            request.data['estado'] = EstadoTarea.objects.get(codigo=3, cuenta_id=cuenta_id).id
        serializer=self.serializer_class(data=request.data, context={'request': request}, instance=instance)
        if serializer.is_valid():
            data=serializer.save()
            if not data:
                return JsonResponse({'success': False,'msg': 'La tarea no ha podido ser salvada.'})
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'La tarea no ha podido ser salvada.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'La tarea no ha podido ser salvada.', 'errors' : serializer.errors})

    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Tarea.objects.get(pk=pk)
            response_serialized = self.serializer_class(instance)
            data = response_serialized.data
            instance.delete()
            return Response(data)
        except Tarea.DoesNotExist:
            return Response({'success': False,'msg': 'La Tarea no ha sido encontrada.'})

    @detail_route(methods=['post'])
    def archivar(self, request, pk=None):
        try:
            instance = Tarea.objects.get(pk=pk)
            instance.archivado = True
            instance.save()
            return Response({'success': True})
        except Tarea.DoesNotExist:
            return Response({'success': False,'msg': 'La Tarea no existe.'})

    @detail_route(methods=['POST'])
    def estado(self, request, pk=None):
        try:
            instance = Tarea.objects.get(pk=pk)
            instance.estado_id = request.POST.get('state')
            # pdb.set_trace()
            instance.save()
            return Response({'success': True, 'id' : pk})
        except Tarea.DoesNotExist:
            return Response({'success': False,'msg': 'No se ha podido cambiar el estado del proyecto.'})

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
            tareas = self.queryset
            # pk id del usuario logueado
            orden = json.loads(request.POST.get('orden'))
            for el in orden:
                try:
                    proyecto = tareas.get(pk=el.get('id'))
                    proyecto.orden=el.get('orden')
                    proyecto.save()
                except Tarea.DoesNotExist:
                    transaction.rollback()
                    return JsonResponse({'success' : False, 'msg' : 'El orden no ha podido ser cambiado.'})
            transaction.commit()
            transaction.set_autocommit(True)
            return JsonResponse({'success' : True})
        except Tarea.DoesNotExist:
            transaction.rollback()
            return JsonResponse({'success' : False, 'msg' : 'El proyecto no ha sido encontrado.'})

class TareaEstadosViewSet(viewsets.ModelViewSet):
    queryset=EstadoTarea.objects.all()
    serializer_class=EstadoTareaSerializer
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
