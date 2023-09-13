import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import MinioUploader from './src/uppy_plugin';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

import S3FileFieldClient from './src/uppy_cli';

// Initialization
console.log('FusionSync is running...');

const uppy = new Uppy({
    // debug: true,
    autoProceed: true,
}).use(Dashboard, {
    inline: true,
    target: '#fusionsync',
    hideUploadButton: true,
});

uppy.use(MinioUploader, {
    baseUrl: 'http://localhost:8000/api/s3-upload/',
    apiConfig: {},
    // onProgress: (file, bytesUploaded, bytesTotal) => onProgress(file, bytesUploaded, bytesTotal),

    // fieldName: 'file',
    // onBeforeUpload: (files) => { },
    // onBeforeSend: (formData, file) => { },
    // onComplete: (result) => { },
    // onError: (error, response, file) => { },
    // onProgress: (bytesUploaded, bytesTotal) => { },
    // onSuccess: (response, file, uppy, updatedFiles) => { },
    // onUpload: (files) => { },
    // onUploadProgress: (file, progress) => { },
    // validateRestrictions: (file) => { },
});

// uppy.on('upload', (data) => {
//     const filesArr = uppy.getFiles();

//     const s3Api = new S3FileFieldClient({
//         baseUrl: 'http://localhost:8000/api/s3-upload/',
//         apiConfig: {},
// onProgress: (e, file, id) => onProgress(e, file, id),
//     });

// [...filesArr].forEach(async (file) => {
//     const fieldValue = await s3Api.uploadFile(file.data, file.id, 'fusion_sync.FusionSync.file');
//     console.log(fieldValue);
// });
// });

function onProgress(file, bytesUploaded, bytesTotal) {
    uppy.setFileState(dataId, {
        e: {
            uploadStarted: e.loaded > 0,
            uploadComplete: e.loaded === e.total,
            percentage: Math.round(e.loaded / e.total * 100),
            bytesUploaded: e.loaded,
            bytesTotal: e.total,
        }
    });
}

// Listen for the upload-progress event and update progress bars in your UI
uppy.on('upload-progress', (file, progress) => {
    console.log('File upload progress:', progress.bytesUploaded, progress.bytesTotal);
    // Update the progress bars in your UI with the progress information
    // For example, if you're using the Uppy Dashboard UI:
    // uppy.getPlugin('Dashboard').info(file.id).setProgress(progress.bytesUploaded, progress.bytesTotal);
});
