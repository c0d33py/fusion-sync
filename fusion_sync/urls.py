from django.urls import path

from .api.viewset import FusionSyncViewSet

urlpatterns = [
    # List and Create
    path(
        'list/',
        FusionSyncViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='fusion_sync_list',
    ),
    # Retrieve, Update, Partial Update, and Delete
    path(
        'detail/<int:pk>/',
        FusionSyncViewSet.as_view(
            {
                'get': 'retrieve',
                'put': 'update',
                'patch': 'partial_update',
                'delete': 'destroy',
            }
        ),
        name='fusion_sync_detail',
    ),
]
