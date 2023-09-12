import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ProgressBar from '@uppy/progress-bar';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

import { S3FileFieldClient } from './src/uppy_cli';

// Initialization
console.log('FusionSync is running...');

const uppy = new Uppy({
    debug: true,
    autoProceed: true,
}).use(Dashboard, {
    inline: true,
    target: '#fusionsync',
    hideUploadButton: true,
});

uppy.on('upload', (data) => {
    const filesArr = uppy.getFiles();

    const s3Api = new S3FileFieldClient({
        baseUrl: 'http://localhost:8000/api/s3-upload/',
        apiConfig: {},
        onProgress: (e, file, id) => onProgress(e, file, id),
    });

    [...filesArr].forEach(async (file) => {
        const fieldValue = await s3Api.uploadFile(file.data, file.id, 'fusion_sync.FusionSync.file');
        console.log(fieldValue);
    });
});
function onProgress(progress, file, dataId) {
    uppy.setFileState(dataId, {
        progress: {
            uploadStarted: progress.loaded > 0,
            uploadComplete: progress.loaded === progress.total,
            percentage: Math.round(progress.loaded / progress.total * 100),
            bytesUploaded: progress.loaded,
            bytesTotal: progress.total,
        }
    });
}