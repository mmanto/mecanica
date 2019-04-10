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
from mecanica.models import Alerta, Comentario
from django.db.models import Q
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

class AlertasViewSet(viewsets.ModelViewSet):
    queryset=Alerta.objects.all()
    serializer_class=AlertaSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        elementos=self.queryset.filter(usuario__perfil__cuenta_id=cuenta_id)
        if request.GET.get('ord'):
            elementos = elementos.filter(orden_trabajo_id=request.GET.get('ord'))
            serializer_element = self.serializer_class(elementos, many=True)
            return Response(serializer_element.data)
        if request.GET.get('tar'):
            elementos = elementos.filter(tarea_id=request.GET.get('tar'))
            serializer_element = self.serializer_class(elementos, many=True)
            return Response(serializer_element.data)
        else:
            if request.GET.get('f') == 'own':
                elementos = elementos.filter(Q(orden_trabajo__responsable=request.user) | Q(tarea__responsable=request.user))
            page = self.paginate_queryset(elementos)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(elementos, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        instance = None
        if request.POST.get('id'):
            try:
                instance = Alerta.objects.get(pk=request.POST.get('id'))
            except Alerta.DoesNotExist:
                return Response({'success': False,'msg': 'El evento no existe.'})
        serializer=self.serializer_class(data=request.data, context={'request': request}, instance=instance)
        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'El evento no ha podido ser salvado.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'El evento no ha podido ser salvado.', 'errors' : serializer.errors})

    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Alerta.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'El Evento o Alerta no existe.'})


    @detail_route(methods=['post'])
    def comment(self, request, pk=None):
        serializer=ComentarioSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            data=serializer.save()
            response_serialized = ComentarioSerializer(data)
            return Response(response_serialized.data)
        else:
            return Response({'success': False,'msg': 'El comentario no pudo ser salvado.', 'errors' : serializer.errors})
