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

class ElementoViewSet(viewsets.ModelViewSet):
    queryset=Elemento.objects.all()
    serializer_class=ElementoSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        elementos=self.queryset.filter(taller__cuenta_id=cuenta_id)
        if request.GET.get('q'):
            elementos = elementos.filter(taller_id=request.GET.get('q'))
            serializer_element = self.serializer_class(elementos, many=True)
            return Response(serializer_element.data)
        else:
            page = self.paginate_queryset(elementos)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(elementos, many=True)
        return Response(serializer_element.data)


    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            ids = json.loads(request.POST.get('els'))
            layout = Taller.objects.get(id=request.POST.get('id'))
            objs = []
            for obj in ids:
                objs.append(obj['id'])
            Elemento.objects.filter(id__in=objs).delete()

        except Taller.DoesNotExist:
            return JsonResponse({'success' : False, 'msg' : 'No se ha podido eliminar el objeto. El layout ya no existe'})
        return JsonResponse({'success' : True})