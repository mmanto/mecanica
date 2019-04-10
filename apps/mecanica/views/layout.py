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
from mecanica.models import Taller, Elemento
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

class TallerViewSet(viewsets.ModelViewSet):
    queryset=Taller.objects.all()
    serializer_class=TallerSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        talleres=self.queryset.filter(cuenta_id=cuenta_id)
        if not request.GET.get('q'):
            page = self.paginate_queryset(talleres)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(talleres, many=True)
        return Response(serializer_element.data)

    def retrieve(self, request, pk):
        try:
            instance = Taller.objects.get(pk=pk)
            serializer=TallerElementosSerializer(instance)
            return Response(serializer.data)
        except Taller.DoesNotExist:
            return Response({'success': False,'msg': 'El Taller no existe.'})


    def create(self, request):
        instance = None
        if request.POST.get('id'):
            try:
                instance = Taller.objects.get(pk=request.POST.get('id'))
            except Taller.DoesNotExist:
                return Response({'success': False,'msg': 'El Taller no existe.'})
        serializer=TallerSerializer(data=request.data, context={'request': request}, instance=instance)

        if serializer.is_valid():
            data=serializer.save()
            try:
                if data and data.id:
                    response_serialized = self.serializer_class(data)
                    return Response(response_serialized.data)
            except:
                return JsonResponse({'success': False,'msg': 'El Taller no ha podido ser salvado.', 'errors' : serializer.errors})
        else:
            return Response({'success': False,'msg': 'El Taller no ha podido ser salvado.', 'errors' : serializer.errors})


    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = Taller.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except Ticket.DoesNotExist:
            return Response({'success': False,'msg': 'El Taller no existe.'})

    @detail_route(methods=['post'])
    def elements(self, request, pk=None):
        try:
            layout = Taller.objects.get(id=pk)
            objetos = json.loads(request.POST.get('data'))
            returned = []
            for obj in objetos:
                isNew = False
                if obj['state'] == 'new':
                    isNew = True
                    entity = Elemento(taller=layout, tipo=obj.get('tipo', 'circle'))
                else:
                    entity = Elemento.objects.get(id=obj.get('id'))
                if entity:
                    entity.attrs = obj.get('attrs')
                    entity.nombre = obj.get('nombre')
                    entity.codigo = obj.get('codigo')
                    entity.tipo_operacion = obj.get('tipo_operacion')
                    entity.save()

                    returned += [{'oid': obj['id'], 'id': entity.id, 'isNew' : isNew}]
            layout.usuario_modificacion = request.user
            layout.fecha_modificacion = timezone.now()
            layout.save()
            return JsonResponse({'success' : True, 'elements' : returned})
        except Taller.DoesNotExist:
            return JsonResponse({'success' : False, 'msg' : "El layout no existe."})