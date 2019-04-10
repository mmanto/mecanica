from rest_framework import serializers
from mecanica.models import *
from django.contrib.auth.models import User
from django.db import transaction
import pdb

class PerfilSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    nombre = serializers.SerializerMethodField()
    def get_imagen(self, obj):
        return str(obj.imagen)
    def get_nombre(self, obj):
        return '{0} {1}'.format(obj.usuario.first_name, obj.usuario.last_name)

    class Meta:
        model=Perfil

class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer()
    class Meta:
        model=User
        fields=('id','last_login','is_superuser','username','first_name','last_name','email','date_joined','perfil')

class ElementoSerializer(serializers.ModelSerializer):

    class Meta:
        model=Elemento

class TallerSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(required=False)
    usuario_modificacion = UserSerializer(required=False)
    class Meta:
        model=Taller

class ArchivoSerializer(serializers.ModelSerializer):
    ruta = serializers.SerializerMethodField()
    usuario = UserSerializer(required=False, read_only=True)
    def get_ruta(self, obj):
        return str(obj.ruta)
    class Meta:
        model=Archivo

class TallerElementosSerializer(serializers.ModelSerializer):
    elementos = ElementoSerializer(many=True)
    class Meta:
        model=Taller

class FlujoSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model=Flujo

class FlujoSerializer(serializers.ModelSerializer):
    elemento = ElementoSerializer()
    usuario = UserSerializer()
    class Meta:
        model=Flujo

class ProductoSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model=Producto

class ProductoSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(required=False)
    flujos = FlujoSerializer(required=False, many=True)

    class Meta:
        model=Producto

class OperacionSerializer(serializers.ModelSerializer):

    class Meta:
        model=Operacion

class EstadoProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model=EstadoProyecto

class EstadoOrdenSerializer(serializers.ModelSerializer):
    class Meta:
        model=EstadoOrden

class EstadoTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model=EstadoTarea

class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(required=False, read_only=True)
    class Meta:
        model=Comentario

class ProyectoBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model=Proyecto

class OrdenTrabajoProyectoSerializer(serializers.ModelSerializer):
    proyecto = ProyectoBaseSerializer()
    class Meta:
        model=OrdenTrabajo

class OrdenTrabajoBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrdenTrabajo

class TareaSerializer(serializers.ModelSerializer):
    estado = EstadoTareaSerializer(read_only=True)
    responsable = UserSerializer(required=False)
    orden_trabajo = OrdenTrabajoProyectoSerializer(required=False, read_only=True)
    usuario = UserSerializer(required=False, read_only=True)
    comentarios = ComentarioSerializer(many=True, read_only=True)
    archivos = ArchivoSerializer(required=False, many=True, read_only=True)

    def to_internal_value(self, data):
        self.fields['responsable'] = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
        self.fields['estado'] = serializers.PrimaryKeyRelatedField(queryset=EstadoTarea.objects.all())
        self.fields['orden_trabajo'] = serializers.PrimaryKeyRelatedField(queryset=OrdenTrabajo.objects.all())
        return super(TareaSerializer, self).to_internal_value(data)

    def create(self, validated_data):
        transaction.set_autocommit(False)
        try:
            archivos = self.context.get('request').POST.getlist('archivos')
            tarea = Tarea.objects.create(**validated_data)
            for ar in archivos:
                tarea.archivos.add(ar)
            transaction.commit()
            transaction.set_autocommit(True)
            return tarea
        except:
            transaction.rollback()
            return False

    def update(self, instance, validated_data):
        transaction.set_autocommit(False)
        try:
            archivos = self.context.get('request').POST.getlist('archivos')
            instance.nombre = validated_data.get('nombre', instance.nombre)
            instance.descripcion = validated_data.get('descripcion')
            instance.responsable = validated_data.get('responsable', instance.responsable)
            instance.archivos.clear()
            for ar in archivos:
                instance.archivos.add(ar)
            instance.save()
            transaction.commit()
            transaction.set_autocommit(True)
            return instance
        except:
            transaction.rollback()
            return False

    class Meta:
        model=Tarea

class TareaBaseSerializer(serializers.ModelSerializer):
    estado = EstadoTareaSerializer(read_only=True)
    responsable = UserSerializer(required=False)
    usuario = UserSerializer(required=False, read_only=True)
    class Meta:
        model=Tarea

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    estado = EstadoOrdenSerializer(read_only=True)
    responsable = UserSerializer(required=False)
    usuario = UserSerializer(required=False, read_only=True)
    comentarios = ComentarioSerializer(many=True, read_only=True)
    proyecto = ProyectoBaseSerializer(required=False, read_only=True)
    archivos = ArchivoSerializer(required=False, many=True, read_only=True)
    tareas = TareaSerializer(required=False, many=True, read_only=True)

    def to_internal_value(self, data):
        self.fields['responsable'] = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
        self.fields['estado'] = serializers.PrimaryKeyRelatedField(queryset=EstadoOrden.objects.all())
        self.fields['proyecto'] = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all())
        return super(OrdenTrabajoSerializer, self).to_internal_value(data)

    def create(self, validated_data):
        transaction.set_autocommit(False)
        try:
            archivos = self.context.get('request').POST.getlist('archivos')
            orden = OrdenTrabajo.objects.create(**validated_data)
            for ar in archivos:
                orden.archivos.add(ar)
            transaction.commit()
            transaction.set_autocommit(True)
            return orden
        except:
            transaction.rollback()
            return False

    def update(self, instance, validated_data):
        transaction.set_autocommit(False)
        try:
            archivos = self.context.get('request').POST.getlist('archivos')
            instance.proyecto = validated_data.get('proyecto', instance.proyecto)
            instance.descripcion = validated_data.get('descripcion')
            instance.responsable = validated_data.get('responsable', instance.responsable)
            instance.archivos.clear()
            for ar in archivos:
                instance.archivos.add(ar)
            instance.save()
            transaction.commit()
            transaction.set_autocommit(True)
            return instance
        except:
            transaction.rollback()
            return False

    class Meta:
        model=OrdenTrabajo

class ProyectoSerializer(serializers.ModelSerializer):
    estado = EstadoProyectoSerializer(read_only=True)
    # ordenes = OrdenTrabajoSerializer(many=True, read_only=True)
    fecha_inicio = serializers.DateTimeField(input_formats=['%m-%d-%Y','%Y-%m-%d','%d-%m-%Y','%d/%m/%Y',])
    fecha_fin = serializers.DateTimeField(input_formats=['%m-%d-%Y','%Y-%m-%d','%d-%m-%Y','%d/%m/%Y',])
    cliente = UserSerializer(required=False)
    responsable = UserSerializer(required=False)
    usuario = UserSerializer(required=False, read_only=True)
    ordenes = serializers.SerializerMethodField()
    def get_ordenes(self, obj):
        sections = OrdenTrabajo.objects.filter(proyecto__id=obj.id, archivado=False).order_by('orden')
        serializer = OrdenTrabajoSerializer(sections, many=True)
        return serializer.data

    def to_internal_value(self, data):
        self.fields['responsable'] = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
        self.fields['cliente'] = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
        self.fields['estado'] = serializers.PrimaryKeyRelatedField(queryset=EstadoProyecto.objects.all())
        return super(ProyectoSerializer, self).to_internal_value(data)

    class Meta:
        model=Proyecto

class AlertaSerializer(serializers.ModelSerializer):
    orden_trabajo = OrdenTrabajoBaseSerializer(required=False)
    tarea = TareaBaseSerializer()
    usuario = UserSerializer(required=False, read_only=True)
    comentarios = ComentarioSerializer(many=True, read_only=True)

    def to_internal_value(self, data):
        self.fields['tarea'] = serializers.PrimaryKeyRelatedField(queryset=Tarea.objects.all(), required=False)
        self.fields['orden_trabajo'] = serializers.PrimaryKeyRelatedField(queryset=OrdenTrabajo.objects.all())
        return super(AlertaSerializer, self).to_internal_value(data)

    class Meta:
        model=Alerta