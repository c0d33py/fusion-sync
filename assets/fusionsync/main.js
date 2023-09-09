import { FusionSync } from './src/sync'

// Initialization
console.log('FusionSync is running...');
console.log('csrftoken: ', csrftoken);

// Credentials
const username = 'c0d3'; // Replace with your username
const password = 'testing123@'; // Replace with your password

// Encode the credentials in Base64 format
const credentials = btoa(`${username}:${password}`);

// Initialization
const headers = {
    'Authorization': `Basic ${credentials}`
};

// Initialize FusionSync
const upload = new FusionSync('fusionsync');
upload.init({
    setSignedUrl: 'http://localhost:8000/api/s3-upload/',
    setStorageUrl: 'http://localhost:8000/api/fusion_sync/list/',
    setModelsName: 'fusion_sync.FusionSync.file',
    setHeaders: headers,
    fileAccept: '*/*',
    multiple: true,
    btnTitle: 'Upload Files',
});