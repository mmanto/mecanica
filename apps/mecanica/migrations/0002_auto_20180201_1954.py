# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mecanica', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ordentrabajo',
            name='archivos',
            field=models.ManyToManyField(to='mecanica.Archivo', null=True, related_name='ordenes'),
        ),
        migrations.AlterField(
            model_name='tarea',
            name='archivos',
            field=models.ManyToManyField(to='mecanica.Archivo', null=True, related_name='tareas'),
        ),
    ]
