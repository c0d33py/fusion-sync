import axios from 'axios';

export default class S3FileFieldClient {
    constructor(options) {
        const { baseUrl, apiConfig = {} } = options;
        this.api = axios.create(Object.assign({}, apiConfig, {
            baseURL: baseUrl.replace(/\/?$/, '/')
        }));
        this.onProgress = options.onProgress;
    }

    async initializeUpload(file, fieldId) {
        const response = await this.api.post('upload-initialize/', {
            field_id: fieldId,
            file_name: file.name,
            file_size: file.size,
            content_type: file.type,
        });
        return response.data;
    }

    async uploadParts(file, dataId, parts) {
        const uploadedParts = [];
        let fileOffset = 0;
        for (const part of parts) {
            const chunk = file.slice(fileOffset, fileOffset + part.size);
            const response = await this.api.put(part.upload_url, chunk, {
                onUploadProgress: (e) => {
                    // Emit Uppy's 'upload-progress' event with progress information
                    this.onProgress(
                        dataId,
                        e.loaded,
                        e.total,
                    );

                }
            });
            uploadedParts.push({
                part_number: part.part_number,
                size: part.size,
                etag: response.headers.etag
            });
            fileOffset += part.size;
        }
        return uploadedParts;
    }

    async completeUpload(multipartInfo, parts) {
        const response = await this.api.post('upload-complete/', {
            upload_signature: multipartInfo.upload_signature,
            upload_id: multipartInfo.upload_id,
            parts
        });

        const { complete_url: completeUrl, body } = response.data;
        await axios.post(completeUrl, body, {
            headers: { 'Content-Type': null }
        });
    }

    async finalize(multipartInfo) {
        const response = await this.api.post('finalize/', {
            upload_signature: multipartInfo.upload_signature
        });
        return response.data.field_value;
    }

    async uploadFile(file, dataId, fieldId) {
        try {
            const multipartInfo = await this.initializeUpload(file, fieldId);
            const parts = await this.uploadParts(file, dataId, multipartInfo.parts);
            await this.completeUpload(multipartInfo, parts);
            const value = await this.finalize(multipartInfo);
            return value;
        } catch (e) {
            console.error('Error uploading file:', e.message);
        }
    }
}


