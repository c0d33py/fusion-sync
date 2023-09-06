# Generated by Django 4.2.4 on 2023-09-02 02:09

from django.db import migrations
import s3_file_field.fields


class Migration(migrations.Migration):

    dependencies = [
        ('fusion_sync', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fusionsync',
            name='file',
            field=s3_file_field.fields.S3FileField(upload_to='fusion/', verbose_name='File (binary)'),
        ),
    ]
