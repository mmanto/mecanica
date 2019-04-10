from django.db import models
from decimal import Decimal
from django.utils import timezone
from mecanica.current_user import get_current_user, get_current_account
from django.conf import settings
import shutil, os, pdb

def documento_file(instance,filename):
	if instance.carpeta:
		return 'uploads/{0}/documentos/{1}/{2}'.format(instance.cuenta.id, instance.carpeta.id, filename)
	return 'uploads/{0}/documentos/{1}'.format(instance.cuenta.id, filename)


def profile_image(instance,filename):
    return 'uploads/profiles/{0}/picture/{1}'.format(instance.id, filename)

class Cuenta(models.Model):
	nombre  = models.CharField(max_length = 255, default="Nombre Compañía")
	owner   = models.ForeignKey(settings.AUTH_USER_MODEL)
	imagen  = models.CharField("transparent",max_length = 255, null=True)

	def __str__(self):
		return self.nombre

class Perfil(models.Model):
	usuario = models.OneToOneField(settings.AUTH_USER_MODEL, related_name="perfil")
	tipo  = models.CharField(max_length = 20, default="admin")
	imagen = models.FileField(upload_to=profile_image, null=True)
	domicilio = models.CharField(max_length = 255, null=True)
	codigo_postal = models.CharField(max_length = 255, null=True)
	ciudad = models.CharField(max_length = 255, null=True)
	telefono = models.CharField(max_length = 255, null=True)
	celular = models.CharField(max_length = 255, null=True)
	descripcion = models.TextField(null=True)

	cuenta = models.ForeignKey(Cuenta, related_name="perfiles")
	creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="perfiles", null=True)

	def __str__(self):
		return self.usuario

class Archivo(models.Model):
    ruta = models.FileField(upload_to=documento_file, null=True)
    nombre=models.CharField(max_length=255)
    descripcion = models.CharField(max_length = 255, null=True)
    tipo=models.CharField(max_length=20, default="folder")
    fecha = models.DateTimeField(default=timezone.now)
    fecha_modificacion = models.DateTimeField(default=timezone.now)

    carpeta = models.ForeignKey('Archivo', related_name="contenido", null=True)
    cuenta = models.ForeignKey(Cuenta, related_name="archivos", default=get_current_account)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="archivos", default=get_current_user)
    def __str__(self):
        return self.nombre

class Taller(models.Model):
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="talleres", default=get_current_user)
	usuario_modificacion = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="talleres_modificados", default=get_current_user)
	cuenta  = models.ForeignKey(Cuenta, related_name="talleres", default=get_current_account)
	nombre = models.CharField(max_length = 255)
	descripcion = models.CharField(max_length = 255, null=True)
	fecha = models.DateTimeField(default=timezone.now)
	fecha_modificacion = models.DateTimeField(default=timezone.now)

class Elemento(models.Model):
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="elementos", default=get_current_user)
	usuario_modificacion = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="elementos_modificados", default=get_current_user)
	taller = models.ForeignKey(Taller, related_name="elementos")

	tipo =  models.CharField(max_length = 50)
	nombre = models.CharField(max_length = 150, null=True)
	codigo = models.CharField(max_length = 50, null=True)
	tipo_operacion = models.CharField(max_length = 50, null=True)
	color = models.CharField(max_length = 8, null=True)
	fecha = models.DateTimeField(default=timezone.now)
	fecha_modificacion = models.DateTimeField(default=timezone.now)
	attrs = models.TextField();

	def __str__(self):
		return self.nombre

class Producto(models.Model):
    tipo =  models.CharField(max_length=50)
    nombre = models.CharField(max_length=150)
    codigo = models.CharField(max_length=50)
    manufactura = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=500, null=True)
    fecha = models.DateTimeField(default=timezone.now)
    archivado = models.NullBooleanField(default=False)

    cuenta  = models.ForeignKey(Cuenta, related_name="productos", default=get_current_account)
    usuario   = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="productos", default=get_current_user)

    def __str__(self):
        return self.nombre

class Flujo(models.Model):
    orden = models.IntegerField()
    fecha = models.DateTimeField(default=timezone.now)

    producto  = models.ForeignKey(Producto, related_name="flujos")
    elemento  = models.ForeignKey(Elemento, related_name="flujos")
    usuario   = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="flujos", default=get_current_user)

    def __str__(self):
        return self.elemento.nombre

class Operacion(models.Model):
	nombre = models.CharField(max_length = 150)
	fecha = models.DateTimeField(default=timezone.now)

	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="operaciones", default=get_current_user)
	flujo = models.ForeignKey(Flujo, related_name="operaciones")

	def __str__(self):
		return self.nombre

class EstadoProyecto(models.Model):
    nombre  = models.CharField(max_length = 50)
    color  = models.CharField(max_length = 10)
    codigo  = models.CharField(max_length = 10)
    cuenta   = models.ForeignKey(Cuenta, related_name="estados_proyecto")

class EstadoOrden(models.Model):
    nombre  = models.CharField(max_length = 50)
    color  = models.CharField(max_length = 10)
    codigo  = models.CharField(max_length = 2)
    cuenta   = models.ForeignKey(Cuenta, related_name="estados_orden")

class EstadoTarea(models.Model):
    nombre  = models.CharField(max_length = 50)
    color  = models.CharField(max_length = 10)
    codigo  = models.CharField(max_length = 2)
    cuenta   = models.ForeignKey(Cuenta, related_name="estados_tarea")

class Proyecto(models.Model):
	nombre = models.CharField(max_length = 150)
	responsable = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="proyectos_asignados")
	cliente = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="proyectos")
	orden = models.IntegerField()
	fecha_inicio = models.DateTimeField(null=True)
	fecha_fin = models.DateTimeField(null=True)
	fecha = models.DateTimeField(default=timezone.now)
	fecha_modificacion = models.DateTimeField(default=timezone.now)
	archivado = models.NullBooleanField(default=False)
	observaciones = models.TextField(null=True)

	estado = models.ForeignKey(EstadoProyecto, related_name="proyectos")
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="proyectos_creados", default=get_current_user)
	cuenta = models.ForeignKey(Cuenta, related_name="proyectos", default=get_current_account)

	def __str__(self):
		return self.nombre

class OrdenTrabajo(models.Model):
	fecha = models.DateTimeField(default=timezone.now)
	responsable = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="ordenes_asignadas")
	orden = models.IntegerField()
	archivado = models.NullBooleanField(default=False)
	descripcion = models.TextField(null=True)

	archivos = models.ManyToManyField(Archivo, related_name="ordenes", null=True)
	estado = models.ForeignKey(EstadoOrden, related_name="ordenes")
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="ordenes_trabajo", default=get_current_user)
	proyecto = models.ForeignKey(Proyecto, related_name="ordenes")

	def __str__(self):
		return self.descripcion

class Tarea(models.Model):
	fecha = models.DateTimeField(default=timezone.now)
	nombre = models.CharField(max_length = 250, default="Tarea")
	responsable = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="tareas_asignadas")
	orden = models.IntegerField()
	archivado = models.NullBooleanField(default=False)
	descripcion = models.TextField()

	archivos = models.ManyToManyField(Archivo, related_name="tareas", null=True)
	estado = models.ForeignKey(EstadoTarea, related_name="tareas")
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="tareas", default=get_current_user)
	orden_trabajo = models.ForeignKey(OrdenTrabajo, related_name="tareas")

	def __str__(self):
		return self.descripcion

class Alerta(models.Model):
	fecha = models.DateTimeField(default=timezone.now)
	descripcion = models.TextField()

	orden_trabajo = models.ForeignKey(OrdenTrabajo, related_name="alertas", null=True)
	tarea = models.ForeignKey(Tarea, related_name="alertas", null=True)
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="alertas", default=get_current_user)

	def __str__(self):
		return self.descripcion

class Comentario(models.Model):
	fecha = models.DateTimeField(default=timezone.now)
	texto = models.TextField()

	orden_trabajo = models.ForeignKey(OrdenTrabajo, related_name="comentarios", null=True)
	tarea = models.ForeignKey(Tarea, related_name="comentarios", null=True)
	alerta = models.ForeignKey(Alerta, related_name="comentarios", null=True)
	usuario = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="comentarios", default=get_current_user)

	def __str__(self):
		return self.texto