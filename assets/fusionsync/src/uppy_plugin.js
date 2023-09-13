import BasePlugin from '@uppy/core/lib/BasePlugin.js';
import locale from './locale.js';
import S3FileFieldClient from './uppy_cli';

// Define your custom MinioUploader plugin
export default class MinioUploader extends BasePlugin {
    constructor(uppy, opts) {
        super(uppy, opts);
        this.id = 'minioUploader';
        this.type = 'uploader';
        this.title = 'Minio Uploader';

        this.defaultLocale = locale
        this.i18nInit();

        this.uploadFile = this.uploadFile.bind(this);
        // Set default options and merge with provided options
        this.opts = Object.assign({
            onProgress: this.onProgress.bind(this),
        }, opts);
        this.client = new S3FileFieldClient(this.opts);
    }

    // Function to upload a file
    async uploadFile(fileIDs) {
        const filesArr = this.uppy.getFiles(); // Access uppy object using this.uppy
        for (const file of filesArr) {
            try {
                const fieldValue = await this.client.uploadFile(
                    file.data,
                    file.id,
                    'fusion_sync.FusionSync.file'
                );
                console.log('Uploaded:', fieldValue);
                // Handle the uploaded file or fieldValue as needed
            } catch (error) {
                console.error('Error uploading file:', error);
                // Handle the upload error
            }
        }
    }

    onProgress(file, bytesUploaded, bytesTotal) {
        this.uppy.log(`[MinioUploader] ${bytesUploaded} / ${bytesTotal} bytes`);
        this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded,
            bytesTotal,
        });
    }

    install() {
        this.uppy.addUploader(this.uploadFile);
    }

    uninstall() {
        this.uppy.removeUploader(this.uploadFile);
    }
}



