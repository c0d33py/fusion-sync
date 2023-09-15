// FusionSync class to handle file uploads.
// This class is responsible for:
// - Creating the file input.
// - Tracking the files that are being uploaded.
// - Updating the file elements in the DOM.
// - Triggering events.
// - Registering event handlers.
// - Uploading the files to S3.
// - Sending the files to the storage endpoint.

import '../fusion-sync.css';
import { S3FileFieldClient } from './client.js'
import axios from 'axios';

export class FusionSync {
    // Initialize the FusionSync instance with the given divId.
    constructor(divId) {
        this.divId = divId;
        this.files = new Map();
        this.FILE_STATUS = {
            PENDING: 'pending',
            UPLOADING: 'uploading',
            PAUSED: 'paused',
            COMPLETED: 'completed',
            FAILED: 'failed',
        };
        this.progressBox = this.createProgressBox();
        this.eventHandlers = {};
    }
    // Initialize the FusionSync instance.
    init(options = {}) {
        this.options = options;
        this.apiClient = axios.create({
            headers: this.options.setHeaders || {},
        });
        this.section = document.getElementById(this.divId);
        this.createFileInput();
        this.setupFileInputEventListeners();
    }
    // Create the file input.
    createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'id_file';
        input.name = 'file';
        input.style.display = 'none';
        input.setAttribute('accept', this.options.fileAccept || 'image/*');
        if (this.options.multiple) {
            input.multiple = true;
        }
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.id = 'file-target';
        label.className = 'upload-btn';
        label.textContent = this.options.btnTitle || 'Upload File';

        label.appendChild(input);

        const specifiedDiv = this.section;
        specifiedDiv.appendChild(label);

        this.fileInput = input;
    }
    // Setup event listeners for the file input.
    setupFileInputEventListeners() {
        this.fileInput.addEventListener('change', (e) => {
            this.trackUploadedFiles(e);
            this.progressBox.style.display = 'block';
        });
    }
    // Create the progress box.
    createProgressBox() {
        const progressBox = document.createElement('div');
        progressBox.className = 'upload-progress-tracker';
        progressBox.innerHTML = `
                <h3>Uploading</h3>
                <div class="file-progress-wrapper"></div>
            `;
        // progressBox.style.display = 'block';
        return progressBox;
    };
    // Update the file element.
    updateFileElement(fileObject) {
        const fileDetails = fileObject.element.querySelector('.file-details');
        const status = fileDetails.querySelector('.status');
        const progressBar = fileDetails.querySelector('.progress-bar');
        // Update the file element in the DOM.
        requestAnimationFrame(() => {
            status.textContent = fileObject.status === this.FILE_STATUS.COMPLETED
                ? fileObject.status
                : `${Math.round(fileObject.percentage)}%`;
            status.className = `status ${fileObject.status}`;
            progressBar.style.width = fileObject.percentage + '%';
            progressBar.style.background =
                fileObject.status === this.FILE_STATUS.COMPLETED
                    ? 'green'
                    : fileObject.status === this.FILE_STATUS.FAILED
                        ? 'red'
                        : '#222';
        });
    };
    // Create a new file element.
    setFileElement(file) {
        const extIndex = file.name.lastIndexOf('.');
        const fileElement = document.createElement('div');
        fileElement.className = 'file-progress';
        fileElement.dataset.file = file.name;
        fileElement.innerHTML = `
            <div class="file-details" style="position: relative">
                <p>
                    <span class="status">pending</span>
                    <span class="file-name">${file.name.substring(0, extIndex)}</span>
                    <span class="file-ext">${file.name.substring(extIndex)}</span>
                </p>
                <div class="progress-bar" style="width: 0;"></div>
            </div>`;
        this.files.set(file, {
            element: fileElement,
            size: file.size,
            status: this.FILE_STATUS.PENDING,
            percentage: 0,
        });
        this.progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);
    };
    // When a file upload is in progress, update the file element.
    onProgress(e, file) {
        const fileObj = this.files.get(file);
        if (!fileObj) {
            return;
        }
        fileObj.status = this.FILE_STATUS.UPLOADING;
        fileObj.percentage = Math.round((e.loaded / e.total) * 100);
        this.updateFileElement(fileObj);
    };
    // When a file upload fails, update the file element.
    onError(e, file) {
        const fileObj = this.files.get(file);

        fileObj.status = this.FILE_STATUS.FAILED;
        fileObj.percentage = 100;
        this.updateFileElement(fileObj);
    };
    // When a file is uploaded to S3, update the file element.
    onCompleted(file) {
        const fileObj = this.files.get(file);

        fileObj.status = this.FILE_STATUS.COMPLETED;
        fileObj.percentage = 100;
        this.updateFileElement(fileObj);
        this.removeSpecificFile(file);
    };
    // Register an event handler.
    on(eventName, callback) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(callback);
    }
    // Trigger an event.
    triggerEvent(eventName, data) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(callback => callback(data));
        }
    }
    // Remove a file from the list of files to be uploaded.
    removeSpecificFile(file) {
        const selectedFiles = Array.from(this.fileInput.files);

        selectedFiles.splice(selectedFiles.indexOf(file), 1);

        const modifiedFileList = new DataTransfer();
        for (const file of selectedFiles) {
            modifiedFileList.items.add(file);
        }

        this.fileInput.files = modifiedFileList.files;
    }
    // Track the files that are being uploaded.
    trackUploadedFiles(event) {
        const targetSelected = event.target.files;
        // Create a new instance of the S3FileFieldClient.
        this.s3ffClient = new S3FileFieldClient({
            baseUrl: this.options.setSignedUrl,
            onCompleted: (e, file) => this.onCompleted(e, file),
            onError: (e, file) => this.onError(e, file),
            onProgress: (e, file) => this.onProgress(e, file),
            apiConfig: this.apiClient.defaults
        });
        // Upload each file to S3.
        [...targetSelected].forEach(async (file, index) => {
            this.setFileElement(file);
            const fieldValue = await this.s3ffClient.uploadFile(
                file,
                this.options.setModelsName,
            );
            // If the file was uploaded to S3, send the file to the storage endpoint.
            // Otherwise, update the file element to show that the upload failed.
            if (fieldValue) {
                (async () => {
                    try {
                        const res = await this.apiClient.post(this.options.setStorageUrl, {
                            file: fieldValue,
                        });
                        this.onCompleted(file);
                        this.triggerEvent('onCompleted', res.data);
                        // hide main progress box
                        if (index === targetSelected.length - 1) {
                            this.progressBox.style.display = 'none';
                        }
                    } catch (error) {
                        this.onError(error, file);
                        console.error('Error uploading file:', error.message);
                    }
                })();
            }
        });
        document.body.appendChild(this.progressBox);
    };
}
