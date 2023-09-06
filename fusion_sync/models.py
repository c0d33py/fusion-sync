import uuid

from django.contrib.auth import get_user_model
from django.contrib.contenttypes import models as ctype_models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from s3_file_field import S3FileField

from .utils import get_upload_to

User = get_user_model()


class FusionAbtract(models.Model):
    resource_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        db_index=True,
        verbose_name='Resource ID',
    )
    filename = models.CharField(
        max_length=255, blank=True, verbose_name='Filename (with extension)'
    )
    length = models.BigIntegerField(default=-1, verbose_name='Length (bytes)')
    offset = models.BigIntegerField(default=0, verbose_name='Offset (bytes)')
    metadata = models.JSONField(default=dict, verbose_name='Metadata (JSON)')
    tmp_path = models.TextField(blank=True, verbose_name='Temporary path')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created at')
    expires_at = models.DateTimeField(
        auto_now=False, null=True, blank=True, verbose_name='Expires at'
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']


class FusionSync(FusionAbtract):
    """FusionSync model"""

    file = S3FileField(upload_to=get_upload_to, verbose_name='File (binary)')
    # file = models.FileField(upload_to='fusion/', verbose_name='File (binary)')
    content_type = models.ForeignKey(
        ctype_models.ContentType,
        related_name='fusion_syncs',
        on_delete=models.CASCADE,
        verbose_name='content type',
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(
        null=True, blank=True, verbose_name='object id'
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(
        User,
        related_name='fusion_syncs',
        on_delete=models.SET_NULL,
        verbose_name='User',
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'fusion_sync'
        verbose_name = 'Fusion Sync'
        verbose_name_plural = 'Fusion Syncs'

    def __str__(self):
        return f'{self.filename} ({self.resource_id})'
