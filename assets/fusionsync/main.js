import { FusionSync } from "./src/sync";

// Initialization
console.log("FusionSync is running...");

// Credentials
const username = "admin"; // Replace with your username
const password = "Anon@ha4er"; // Replace with your password

// Encode the credentials in Base64 format
const credentials = btoa(`${username}:${password}`);

// Initialization
const headers = {
	Authorization: `Basic ${credentials}`,
};

// Initialize FusionSync
const upload = new FusionSync("fusionsync");
upload.init({
	setSignedUrl: "http://localhost:8000/api/s3-upload/",
	setStorageUrl: "http://localhost:8000/api/fusion_sync/",
	setModelsName: "fusion_sync.FusionSync.file",
	setHeaders: headers,
	fileAccept: "*/*",
	multiple: true,
	btnTitle: "Upload Files",
});
