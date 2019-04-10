# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mecanica', '0002_auto_20180201_1954'),
    ]

    operations = [
        migrations.AddField(
            model_name='tarea',
            name='nombre',
            field=models.CharField(max_length=250, default='Tarea'),
        ),
    ]
