import os
import random
import string
from uuid import uuid4

from django.conf import settings
from django.db import connection


def get_schema_name():
    """Get the schema name for the current tenant."""
    try:
        tenant = connection.get_tenant()
        return tenant.schema_name
    except AttributeError:
        return 'public'


class FilenameGenerator:
    """Generate a random filename."""

    def __init__(self, filename: str = None):
        self.filename = filename or self.random_string()

    def get_name_and_extension(self):
        return os.path.splitext(self.filename)

    def create_random_suffix_name(self) -> str:
        name, extension = self.get_name_and_extension()
        random_string = self.random_string()
        return f'{random_string}{extension}'

    @classmethod
    def random_string(cls, length: int = 11) -> str:
        letters_and_digits = string.ascii_letters + string.digits
        return ''.join(random.choice(letters_and_digits) for _ in range(length))


def get_upload_to(instance, filename):
    """Get the upload_to path for the current tenant."""
    random_str = FilenameGenerator(filename).create_random_suffix_name()
    fusion_sync_settings = getattr(settings, 'FUSION_SYNC', {})

    tenant_enabled = fusion_sync_settings.get('TENANT_ENABLED', False)
    schema_name = get_schema_name() if tenant_enabled else ''

    upload_to = fusion_sync_settings.get('UPLOAD_TO', '')
    upload_prefix_name = fusion_sync_settings.get('UPLOAD_RANDOM_PREFIX', '')

    if upload_prefix_name:
        filename = f'{upload_prefix_name}_{random_str}'

    if upload_to:
        return f'{upload_to}/{schema_name}/{filename}'.lstrip('/')

    return f'{upload_to}/{schema_name}/{uuid4()}/{filename}'.lstrip('/')
