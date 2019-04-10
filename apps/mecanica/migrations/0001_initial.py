# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import mecanica.current_user
from django.conf import settings
import mecanica.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Alerta',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('descripcion', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Archivo',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('ruta', models.FileField(upload_to=mecanica.models.documento_file, null=True)),
                ('nombre', models.CharField(max_length=255)),
                ('tipo', models.CharField(default='folder', max_length=20)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('fecha_modificacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('carpeta', models.ForeignKey(related_name='contenido', null=True, to='mecanica.Archivo')),
            ],
        ),
        migrations.CreateModel(
            name='Comentario',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('texto', models.TextField()),
                ('alerta', models.ForeignKey(related_name='comentarios', null=True, to='mecanica.Alerta')),
            ],
        ),
        migrations.CreateModel(
            name='Cuenta',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(default='Nombre Compañía', max_length=255)),
                ('imagen', models.CharField(max_length=255, verbose_name='transparent', null=True)),
                ('owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Elemento',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('tipo', models.CharField(max_length=50)),
                ('nombre', models.CharField(max_length=150, null=True)),
                ('codigo', models.CharField(max_length=50, null=True)),
                ('tipo_operacion', models.CharField(max_length=50, null=True)),
                ('color', models.CharField(max_length=8, null=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('fecha_modificacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('attrs', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='EstadoOrden',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=50)),
                ('color', models.CharField(max_length=10)),
                ('codigo', models.CharField(max_length=2)),
                ('cuenta', models.ForeignKey(related_name='estados_orden', to='mecanica.Cuenta')),
            ],
        ),
        migrations.CreateModel(
            name='EstadoProyecto',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=50)),
                ('color', models.CharField(max_length=10)),
                ('codigo', models.CharField(max_length=10)),
                ('cuenta', models.ForeignKey(related_name='estados_proyecto', to='mecanica.Cuenta')),
            ],
        ),
        migrations.CreateModel(
            name='EstadoTarea',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=50)),
                ('color', models.CharField(max_length=10)),
                ('codigo', models.CharField(max_length=2)),
                ('cuenta', models.ForeignKey(related_name='estados_tarea', to='mecanica.Cuenta')),
            ],
        ),
        migrations.CreateModel(
            name='Flujo',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('orden', models.IntegerField()),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('elemento', models.ForeignKey(related_name='flujos', to='mecanica.Elemento')),
            ],
        ),
        migrations.CreateModel(
            name='Operacion',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=150)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('flujo', models.ForeignKey(related_name='operaciones', to='mecanica.Flujo')),
                ('usuario', models.ForeignKey(related_name='operaciones', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
            ],
        ),
        migrations.CreateModel(
            name='OrdenTrabajo',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('orden', models.IntegerField()),
                ('archivado', models.NullBooleanField(default=False)),
                ('descripcion', models.TextField(null=True)),
                ('archivos', models.ManyToManyField(to='mecanica.Archivo', related_name='ordenes')),
                ('estado', models.ForeignKey(related_name='ordenes', to='mecanica.EstadoOrden')),
            ],
        ),
        migrations.CreateModel(
            name='Perfil',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('tipo', models.CharField(default='admin', max_length=20)),
                ('imagen', models.FileField(upload_to=mecanica.models.profile_image, null=True)),
                ('domicilio', models.CharField(max_length=255, null=True)),
                ('codigo_postal', models.CharField(max_length=255, null=True)),
                ('ciudad', models.CharField(max_length=255, null=True)),
                ('telefono', models.CharField(max_length=255, null=True)),
                ('celular', models.CharField(max_length=255, null=True)),
                ('descripcion', models.TextField(null=True)),
                ('creado_por', models.ForeignKey(related_name='perfiles', null=True, to=settings.AUTH_USER_MODEL)),
                ('cuenta', models.ForeignKey(related_name='perfiles', to='mecanica.Cuenta')),
                ('usuario', models.OneToOneField(related_name='perfil', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('tipo', models.CharField(max_length=50)),
                ('nombre', models.CharField(max_length=150)),
                ('codigo', models.CharField(max_length=50)),
                ('manufactura', models.CharField(max_length=50)),
                ('descripcion', models.CharField(max_length=500, null=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('archivado', models.NullBooleanField(default=False)),
                ('cuenta', models.ForeignKey(related_name='productos', to='mecanica.Cuenta', default=mecanica.current_user.get_current_account)),
                ('usuario', models.ForeignKey(related_name='productos', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
            ],
        ),
        migrations.CreateModel(
            name='Proyecto',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=150)),
                ('orden', models.IntegerField()),
                ('fecha_inicio', models.DateTimeField(null=True)),
                ('fecha_fin', models.DateTimeField(null=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('fecha_modificacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('archivado', models.NullBooleanField(default=False)),
                ('observaciones', models.TextField(null=True)),
                ('cliente', models.ForeignKey(related_name='proyectos', to=settings.AUTH_USER_MODEL)),
                ('cuenta', models.ForeignKey(related_name='proyectos', to='mecanica.Cuenta', default=mecanica.current_user.get_current_account)),
                ('estado', models.ForeignKey(related_name='proyectos', to='mecanica.EstadoProyecto')),
                ('responsable', models.ForeignKey(related_name='proyectos_asignados', to=settings.AUTH_USER_MODEL)),
                ('usuario', models.ForeignKey(related_name='proyectos_creados', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
            ],
        ),
        migrations.CreateModel(
            name='Taller',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.CharField(max_length=255, null=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('fecha_modificacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('cuenta', models.ForeignKey(related_name='talleres', to='mecanica.Cuenta', default=mecanica.current_user.get_current_account)),
                ('usuario', models.ForeignKey(related_name='talleres', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
                ('usuario_modificacion', models.ForeignKey(related_name='talleres_modificados', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
            ],
        ),
        migrations.CreateModel(
            name='Tarea',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('orden', models.IntegerField()),
                ('archivado', models.NullBooleanField(default=False)),
                ('descripcion', models.TextField()),
                ('archivos', models.ManyToManyField(to='mecanica.Archivo', related_name='tareas')),
                ('estado', models.ForeignKey(related_name='tareas', to='mecanica.EstadoTarea')),
                ('orden_trabajo', models.ForeignKey(related_name='tareas', to='mecanica.OrdenTrabajo')),
                ('responsable', models.ForeignKey(related_name='tareas_asignadas', to=settings.AUTH_USER_MODEL)),
                ('usuario', models.ForeignKey(related_name='tareas', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user)),
            ],
        ),
        migrations.AddField(
            model_name='ordentrabajo',
            name='proyecto',
            field=models.ForeignKey(related_name='ordenes', to='mecanica.Proyecto'),
        ),
        migrations.AddField(
            model_name='ordentrabajo',
            name='responsable',
            field=models.ForeignKey(related_name='ordenes_asignadas', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ordentrabajo',
            name='usuario',
            field=models.ForeignKey(related_name='ordenes_trabajo', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='flujo',
            name='producto',
            field=models.ForeignKey(related_name='flujos', to='mecanica.Producto'),
        ),
        migrations.AddField(
            model_name='flujo',
            name='usuario',
            field=models.ForeignKey(related_name='flujos', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='elemento',
            name='taller',
            field=models.ForeignKey(related_name='elementos', to='mecanica.Taller'),
        ),
        migrations.AddField(
            model_name='elemento',
            name='usuario',
            field=models.ForeignKey(related_name='elementos', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='elemento',
            name='usuario_modificacion',
            field=models.ForeignKey(related_name='elementos_modificados', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='comentario',
            name='orden_trabajo',
            field=models.ForeignKey(related_name='comentarios', null=True, to='mecanica.OrdenTrabajo'),
        ),
        migrations.AddField(
            model_name='comentario',
            name='tarea',
            field=models.ForeignKey(related_name='comentarios', null=True, to='mecanica.Tarea'),
        ),
        migrations.AddField(
            model_name='comentario',
            name='usuario',
            field=models.ForeignKey(related_name='comentarios', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='archivo',
            name='cuenta',
            field=models.ForeignKey(related_name='archivos', to='mecanica.Cuenta', default=mecanica.current_user.get_current_account),
        ),
        migrations.AddField(
            model_name='archivo',
            name='usuario',
            field=models.ForeignKey(related_name='archivos', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
        migrations.AddField(
            model_name='alerta',
            name='orden_trabajo',
            field=models.ForeignKey(related_name='alertas', null=True, to='mecanica.OrdenTrabajo'),
        ),
        migrations.AddField(
            model_name='alerta',
            name='tarea',
            field=models.ForeignKey(related_name='alertas', null=True, to='mecanica.Tarea'),
        ),
        migrations.AddField(
            model_name='alerta',
            name='usuario',
            field=models.ForeignKey(related_name='alertas', to=settings.AUTH_USER_MODEL, default=mecanica.current_user.get_current_user),
        ),
    ]
