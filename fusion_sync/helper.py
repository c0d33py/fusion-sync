import logging

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from .models import FusionSync

logger = logging.getLogger(__name__)


def get_fusion_sync():
    """Get the fusion sync settings."""
    fusion_sync_settings = getattr(settings, 'FUSION_SYNC', {})

    return fusion_sync_settings


def get_update_uploaded_files(data_str: str, new_object_id: int):
    """Update the uploaded files with the new object ID."""
    resource_ids = data_str.split(',')

    # Collect all matching files in one query
    matching_files = FusionSync.objects.filter(resource_id__in=resource_ids)

    # Create a dictionary for quick lookup by resource_id
    file_dict = {str(file.resource_id): file for file in matching_files}

    for resource_id in resource_ids:
        try:
            uploaded_file = file_dict.get(resource_id)
            if uploaded_file:
                uploaded_file.content_object = new_object_id
                uploaded_file.save()
                logger.info(
                    'Successfully updated file with ID {}'.format(uploaded_file.id)
                )
            else:
                logger.error('File with ID {} does not exist'.format(resource_id))
        except Exception as e:
            logger.error(
                'Error updating file with ID {}: {}'.format(resource_id, str(e))
            )
