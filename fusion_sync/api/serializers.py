from rest_framework import serializers

from fusion_sync.models import FusionSync


class FusionSyncSerializer(serializers.ModelSerializer):
    """FusionSync serializer"""

    class Meta:
        model = FusionSync
        fields = '__all__'
        read_only_fields = [
            'resource_id',
            'filename',
            'length',
            'offset',
            'metadata',
            'tmp_path',
            'user',
        ]
