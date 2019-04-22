from django.conf import settings
from django.conf.urls import patterns, include, url

from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from mecanica.views import home as home_views

from django.contrib import admin

urlpatterns = [
                url(r'^admin/', include(admin.site.urls)),
                url(r'^$', home_views.index, name="index"),
                url(r'^backend/admin-register/(?P<key>[a-zA-Z0-9\-]+)/$',home_views.registro, name="registro"),
                url(r'^app/', include('mecanica.urls', namespace="mecanica")),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += staticfiles_urlpatterns()