from django.contrib import admin

from .models import FusionSync


@admin.register(FusionSync)
class FusionSyncAdmin(admin.ModelAdmin):
    """Admin for FusionSync"""

    list_display = ['resource_id', 'filename', 'length', 'created_at', 'expires_at']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['resource_id', 'filename']
    readonly_fields = ['resource_id', 'filename', 'length', 'tmp_path', 'metadata']
    list_per_page = 20
    fieldsets = (
        ('Details', {'fields': ('file', 'object_id', 'content_type', 'user')}),
        ('Resource', {'fields': ('resource_id', 'filename', 'length', 'tmp_path')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Dates', {'fields': ('expires_at',)}),
    )
