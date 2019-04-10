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
from mecanica.models import Producto, Flujo
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

class ProductoViewSet(viewsets.ModelViewSet):
    queryset=Producto.objects.all()
    serializer_class=ProductoSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        productos=self.queryset.filter(cuenta_id=cuenta_id, archivado=False)
        page = self.paginate_queryset(productos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(productos, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        instance = None
        if request.POST.get('id'):
            try:
                instance = Producto.objects.get(pk=request.POST.get('id'))
            except Producto.DoesNotExist:
                return Response({'success': False,'msg': 'El Producto no existe.'})
        serializer=ProductoSaveSerializer(data=request.data, context={'request': request}, instance=instance)

        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'El Producto no ha podido ser salvado.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'El Producto no ha podido ser salvado.', 'errors' : serializer.errors})


    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Producto.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'El Producto no existe.'})

    @detail_route(methods=['post'])
    def archivar(self, request, pk=None):
        try:
            instance = Producto.objects.get(pk=pk)
            instance.archivado = True
            instance.save()
            return Response({'success': True})
        except Producto.DoesNotExist:
            return Response({'success': False,'msg': 'El Producto no existe.'})

class FlujoViewSet(viewsets.ModelViewSet):
    queryset=Flujo.objects.all()
    serializer_class=FlujoSerializer
    pagination_class = StandardResultsSetPagination

    def create(self, request):
        instance = None
        request.data['orden'] = 1
        flujo = Flujo.objects.filter(producto_id=request.data['producto']).order_by('-orden').first()
        if flujo:
            request.data['orden'] = flujo.orden+1
        serializer=FlujoSaveSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'La operación no ha podido ser salvada.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'La operación no ha podido ser salvada.', 'errors' : serializer.errors})

    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Flujo.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'La operación del flujo no ha sido encontrada.'})

    @detail_route(methods=['post'])
    def reorder(self, request, pk=None):
        from django.db import transaction
        transaction.set_autocommit(False)
        try:
            producto = Producto.objects.get(pk=pk)
            flujos = producto.flujos.all()
            orden = json.loads(request.POST.get('orden'))
            for el in orden:
                try:
                    flujo = flujos.get(pk=el.get('id'))
                    flujo.orden=el.get('orden')
                    flujo.save()
                except Flujo.DoesNotExist:
                    transaction.rollback()
                    return JsonResponse({'success' : False, 'msg' : 'El orden no ha podido ser cambiado.'})
            transaction.commit()
            transaction.set_autocommit(True)
            return JsonResponse({'success' : True})
        except Producto.DoesNotExist:
            transaction.rollback()
            return JsonResponse({'success' : False, 'msg' : 'El producto no ha sido encontrado.'})

