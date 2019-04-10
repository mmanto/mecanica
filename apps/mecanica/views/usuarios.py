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
from mecanica.forms import UsuarioForm
import pdb

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

class UsuariosViewSet(viewsets.ModelViewSet):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    pagination_class = StandardResultsSetPagination

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        users=self.queryset.select_related('perfil').filter(perfil__cuenta_id=cuenta_id)
        if request.GET.get('q'):
            if request.GET.get('q') != 'all':
                users = users.filter(perfil__tipo=request.GET.get('q'))
            serializer_element = self.serializer_class(users, many=True)
            return Response(serializer_element.data)
        else:
            page = self.paginate_queryset(users)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        serializer_element = self.serializer_class(users, many=True)
        return Response(serializer_element.data)

    def create(self, request):
        id = request.POST.get('id')
        if id:
            # pdb.set_trace()
            instance = User.objects.get(pk=id);
            form = UsuarioForm(request.POST, instance=instance, initial={'request': request})
        else:
            form = UsuarioForm(request.POST, initial={'request': request})
        if form.is_valid():
            usuario = form.save()
            response_serialized = self.serializer_class(usuario)
            return Response(response_serialized.data)
        return Response({
                'success': False,
                'msg': 'El usuario no ha podido ser creado.',
                'errors' : form.errors
            })


    @detail_route(methods=['post'])
    def remove(self, request, pk=None):
        try:
            instance = User.objects.get(pk=pk)
            instance.delete()
            return Response({'success': True, 'id' : pk})
        except User.DoesNotExist:
            return Response({'success': False,'msg': 'El usuario no existe.'})