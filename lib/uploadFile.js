import axios from "axios";
import fs from "fs";
import path from "path";

// Define the uploadFile function
async function uploadFile(filePath) {
	try {
		// Check if the file exists and is not empty
		if (!fs.existsSync(filePath)) {
			throw new Error(`File does not exist: ${filePath}`);
		}

		const fileStats = fs.statSync(filePath);
		if (fileStats.size === 0) {
			throw new Error("The file is empty.");
		}

		// Read the file content
		const fileContent = fs.readFileSync(filePath, "base64");

		// Extract the filename from the file path
		const filename = path.basename(filePath);

		// Send the file content to the server
		const response = await axios.post("http://localhost:3000/upload", {
			file: fileContent,
			filename: filename,
		});

		// Log the response from the server
		console.log("File uploaded successfully:", response.data);
	} catch (error) {
		// Log any errors that occur
		console.error("Error in uploadFile function:", error);
		if (error.response) {
			console.error("Server response:", error.response.data);
		}
		console.error("An error occurred while uploading file:", error.message);
	}
}

export default uploadFile;
