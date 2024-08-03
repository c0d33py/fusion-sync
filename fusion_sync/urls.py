from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api.viewset import FusionSyncViewSet
from .views import index

router = DefaultRouter()
router.register('', FusionSyncViewSet, basename='fusion_sync')

urlpatterns = [
    path('', include(router.urls)),
]
