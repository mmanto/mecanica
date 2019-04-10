"""Development settings and globals."""

from .base import *


########## DEBUG CONFIGURATION
# See: https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = False

ALLOWED_HOSTS = ['*']
########## END DEBUG CONFIGURATION

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mecanica',
        'USER': 'root',
        'PASSWORD': 'sqlmicry',
        'HOST': '172.31.6.24',
        'PORT': '',
    }
}
########## END DATABASE CONFIGURATION


########## CACHE CONFIGURATION
# See: https://docs.djangoproject.com/en/dev/ref/settings/#caches
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
}
########## END CACHE CONFIGURATION

WKHTMLTOPDF_CMD = '/usr/local/bin'
