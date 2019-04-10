from django.shortcuts import render, render_to_response, redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.response import Response
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from mecanica.serializers import *
from mecanica.utils import get_cuenta_session
from mecanica.utils import generic_upload
from rest_framework.decorators import api_view
from rest_framework import permissions, viewsets, generics, mixins
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, detail_route
from django.utils import timezone
import uuid, os, shutil, pdb
from django.conf import settings
from django.core.files import File
from django.core.files.base import ContentFile

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

class DocumentosViewSet(viewsets.ModelViewSet):
    queryset=Archivo.objects.all()
    serializer_class=ArchivoSerializer
    pagination_class = StandardResultsSetPagination

    def create(self, request):
        folder = request.POST.get('folder')
        f = request.FILES.get('file')
        cuenta_id = request.session.get('cuenta_id', '')
        archivo = Archivo(carpeta_id=folder, cuenta_id=cuenta_id)
        if f:
            archivo.ruta = f
            archivo.nombre = f.name
            filename, extension = (archivo.nombre.split('/')[-1].split('.'))
            archivo.tipo = extension
        else:
            archivo.nombre = request.POST.get('nombre')
        archivo.save()
        serializer = self.serializer_class(archivo)
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def remove(self, request, pk):
        id = request.POST.get('id')
        try:
            archivo = Archivo.objects.get(pk=id)
            if archivo.tipo=='folder':
                cuenta_id = request.session.get('cuenta_id', '')
                folder = 'uploads/{0}/documentos/{1}/'.format(cuenta_id, archivo.id)
                ruta=os.path.join(settings.MEDIA_ROOT, folder)
                shutil.rmtree(ruta, ignore_errors=True)
            else:
                ruta=os.path.join(settings.MEDIA_ROOT, str(archivo.ruta))
                os.remove(ruta)
            archivo.delete()
        except Archivo.DoesNotExist:
            return JsonResponse({'success':False, 'msg': 'El archivo no existe.'})
        return JsonResponse({'success':True, 'id' : pk})

    @detail_route(methods=['post'])
    def info(self, request, pk):
        id = request.POST.get('id')
        try:
            archivo = Archivo.objects.get(pk=id)
            archivo.nombre = request.POST.get('nombre')
            archivo.descripcion = request.POST.get('descripcion')
            archivo.fecha_modificacion = timezone.now()
            archivo.save()
        except Archivo.DoesNotExist:
            return JsonResponse({'success':False, 'msg': 'El archivo no existe.'})
        return JsonResponse({'success':True, 'id' : pk})

    @detail_route(methods=['get'])
    def download(self, request, pk):
        from django.core.servers.basehttp import FileWrapper
        import mimetypes
        try:
            entity = Archivo.objects.get(id=pk)
        except Archivo.DoesNotExist:
            return ""

        absPath = str(entity.ruta)
        content_type = entity.tipo
        archivo = FileWrapper(open(os.path.join(settings.MEDIA_ROOT, absPath), 'rb'))
        response = HttpResponse(archivo, content_type=content_type)
        response['Content-Disposition'] = 'attachment; filename="{0}"'.format(entity.nombre)
        return response

    def list(self, request):
        cuenta_id = request.session.get('cuenta_id', '')
        folder = request.GET.get('f')
        elementos=self.queryset.filter(cuenta_id=cuenta_id, carpeta=folder)
        serializer_element = self.serializer_class(elementos, many=True)
        return Response(serializer_element.data)
