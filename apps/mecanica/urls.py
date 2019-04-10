from django.conf.urls import include, url
from django.contrib import admin
from mecanica import views as mmviewsa
from rest_framework import routers
from mecanica.views import *

# admin.autodiscover()
router = routers.SimpleRouter()
router.register(r'usuarios', UsuariosViewSet)
router.register(r'usuarios/(?P<id>[0-9]+)/remove/', UsuariosViewSet)
router.register(r'layout', TallerViewSet)
router.register(r'layout/(?P<id>[0-9]+)/remove/', TallerViewSet)
router.register(r'layout/(?P<id>[0-9]+)/elements/', TallerViewSet)

router.register(r'elemento', ElementoViewSet)
router.register(r'elemento/(?P<id>[0-9]+)/remove/', ElementoViewSet)
router.register(r'producto', ProductoViewSet)
router.register(r'producto/(?P<id>[0-9]+)/remove/', ProductoViewSet)
router.register(r'producto/(?P<id>[0-9]+)/archivar/', ProductoViewSet)
router.register(r'producto/(?P<id>[0-9]+)/reorder/', ProductoViewSet)
router.register(r'flujo', FlujoViewSet)
router.register(r'flujo/(?P<id>[0-9]+)/remove/', FlujoViewSet)
router.register(r'flujo/(?P<id>[0-9]+)/reorder/', FlujoViewSet)
router.register(r'proyecto', ProyectoViewSet)
router.register(r'proyecto/(?P<id>[0-9]+)/remove/', ProyectoViewSet)
router.register(r'proyecto/(?P<id>[0-9]+)/archivar/', ProyectoViewSet)
router.register(r'proyecto/(?P<id>[0-9]+)/estado/', ProyectoViewSet)
router.register(r'orden', OrdenTrabajoViewSet)
router.register(r'orden/(?P<id>[0-9]+)/remove/', OrdenTrabajoViewSet)
router.register(r'orden/(?P<id>[0-9]+)/archivar/', OrdenTrabajoViewSet)
router.register(r'orden/(?P<id>[0-9]+)/comment/', OrdenTrabajoViewSet)
router.register(r'orden/(?P<id>[0-9]+)/estado/', OrdenTrabajoViewSet)
router.register(r'tarea', TareaViewSet)
router.register(r'tarea/(?P<id>[0-9]+)/remove/', TareaViewSet)
router.register(r'tarea/(?P<id>[0-9]+)/archivar/', TareaViewSet)
router.register(r'tarea/(?P<id>[0-9]+)/comment/', TareaViewSet)
router.register(r'tarea/(?P<id>[0-9]+)/estado/', TareaViewSet)
router.register(r'docs', DocumentosViewSet)
router.register(r'docs/(?P<id>[0-9]+)/remove/', DocumentosViewSet)
router.register(r'docs/(?P<id>[0-9]+)/info/', DocumentosViewSet)
router.register(r'docs/(?P<id>[0-9]+)/download/', DocumentosViewSet)
router.register(r'alerta', AlertasViewSet)
router.register(r'alerta/(?P<id>[0-9]+)/remove/', AlertasViewSet)
router.register(r'alerta/(?P<id>[0-9]+)/comment/', AlertasViewSet)

router.register(r'proyecto_estados', ProyectoEstadosViewSet)
router.register(r'orden_estados', OrdenEstadosViewSet)
router.register(r'orden_tareas', TareaEstadosViewSet)


urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^login/$', mmviewsa.login_page, name="login"),
    url(r'^logout/$', mmviewsa.logout_page, name="logout"),
    url(r'^$', mmviewsa.index, name="index"),
]
