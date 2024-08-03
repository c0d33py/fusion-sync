import io
import zipfile

from django.http import StreamingHttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from fusion_sync.api.serializers import FusionSyncSerializer
from fusion_sync.models import FusionSync


class FusionSyncViewSet(viewsets.ModelViewSet):
    """ViewSet for the FusionSync class"""

    serializer_class = FusionSyncSerializer
    queryset = FusionSync.objects.all()
    filterset_fields = ['resource_id', 'filename', 'length', 'created_at', 'expires_at']
    search_fields = ['resource_id', 'filename', 'length', 'created_at', 'expires_at']
    ordering_fields = ['id', 'length', 'created_at', 'expires_at']

    def perform_create(self, serializer):
        # Save the post data when creating a new FusionSync.
        serializer.save(user=self.request.user)
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        # Save the post data when updating a FusionSync.
        serializer.save(user=self.request.user)
        return super().perform_update(serializer)

    @action(
        detail=False,
        methods=["get"],
        url_path=r'downloads/(?P<content_type>\w+)/(?P<object_id>\d+)',
    )
    def downloads(self, request, content_type=None, object_id=None):
        title = request.query_params.get('title', None)

        if title is None:
            return Response(
                {'detail': 'File title is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = FusionSync.objects.filter(
            content_type__model=content_type, object_id=object_id
        )

        if not queryset.exists():
            return Response(
                {'detail': 'No files found for the given content type and object ID.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zip_file:
            for obj in queryset:
                file = obj.file

                filename = file.name.split('/')[-1]
                zip_file.writestr(filename, file.read())

        buffer.seek(0)

        # Streaming response to keep the buffer open until the response is fully sent
        response = StreamingHttpResponse(buffer, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{title}.zip"'

        return response
