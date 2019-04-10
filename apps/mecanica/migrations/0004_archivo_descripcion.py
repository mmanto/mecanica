# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mecanica', '0003_tarea_nombre'),
    ]

    operations = [
        migrations.AddField(
            model_name='archivo',
            name='descripcion',
            field=models.CharField(null=True, max_length=255),
        ),
    ]
