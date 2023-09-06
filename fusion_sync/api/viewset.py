from rest_framework import permissions, viewsets

from fusion_sync.api.serializers import FusionSyncSerializer
from fusion_sync.models import FusionSync


class FusionSyncViewSet(viewsets.ModelViewSet):
    """ViewSet for the FusionSync class"""

    queryset = FusionSync.objects.all()
    serializer_class = FusionSyncSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['resource_id', 'filename', 'length', 'created_at', 'expires_at']
    search_fields = ['resource_id', 'filename', 'length', 'created_at', 'expires_at']
    ordering_fields = ['id', 'length', 'created_at', 'expires_at']

    def get_queryset(self):
        """Return the list of items for this view."""
        return super().get_queryset()

    def perform_create(self, serializer):
        """Save the post data when creating a new FusionSync."""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Save the post data when updating a FusionSync."""
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        """Delete the FusionSync."""
        instance.delete()
