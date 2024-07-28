# Fusion Sync

Fusion Sync is a Django library for advanced file uploading, supporting integration with various storage backends like MinIO, S3, and TUS.

## Features

-   Easy integration with Django projects
-   Supports multiple storage backends:
    -   MinIO (via `django-minio-storage`)
    -   S3 (via `django-s3-file-field`)
    -   TUS (via `django-tus`)
-   Simplified file upload and management

## Installation

You can install Fusion Sync via pip:

```bash
pip install fusion-sync
```

## Usage

1. Add **fusion_sync** to your Django **INSTALLED_APPS**:

    ```py
    INSTALLED_APPS = [
        ...
        'fusion_sync',
        ...
    ]
    ```

2. Configure your preferred storage backend in **settings.py**:

    ```py
    # Example for MinIO
    DEFAULT_FILE_STORAGE = 'django_minio_storage.storage.MinioMediaStorage'

    MINIO_STORAGE_ENDPOINT = 'minio.example.com'
    MINIO_STORAGE_ACCESS_KEY = 'your-access-key'
    MINIO_STORAGE_SECRET_KEY = 'your-secret-key'
    MINIO_STORAGE_USE_HTTPS = True
    MINIO_STORAGE_MEDIA_BUCKET_NAME = 'media'
    MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
    MINIO_STORAGE_BUCKET_NAME = 'media'
    ```

3. Use the uploader in your Django views or models:

```py
# Views.py
from fusion_sync.uploader import upload_file

def my_view(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['file']
        file_url = upload_file(uploaded_file)
        return JsonResponse({'file_url': file_url})
```

## License

This project is licensed under the Apache License 2.0 - see the [MIT License](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Acknowledgements

Special thanks to the developers of [**django-minio-storage**](https://github.com/py-pa/django-minio-storage), [**django-s3-file-field**](https://github.com/kitware-resonant/django-s3-file-field/) and [**django-tus**](<(https://github.com/alican/django-tus)>) for their excellent libraries.
