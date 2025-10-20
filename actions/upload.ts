"use server";
import { BlobServiceClient } from "@azure/storage-blob";

const storageUrl = process.env.AZURE_STORAGE_URL;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

export async function uploadToStorage(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (!storageUrl || !containerName) {
      console.log(
        "No Azure Blob Storage connection string set, skipping upload."
      );
      return { success: false, error: "Storage configuration missing" };
    }

    // Generate a unique filename to avoid collisions
    const fileName = `${Date.now()}-${file.name}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the file to Azure Blob Storage
    console.log(
      `Uploading file to blob storage: "${containerName}/${fileName}"`
    );

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(storageUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const uploadBlobResponse = await blockBlobClient.upload(
      buffer,
      buffer.length
    );

    // Get the URL of the uploaded blob
    const blobUrl = blockBlobClient.url;

    console.log(`File uploaded successfully. URL: ${blobUrl}`);

    // Optionally revalidate a path if needed
    // revalidatePath('/some-path');

    return {
      success: true,
      fileUrl: blobUrl,
      requestId: uploadBlobResponse.requestId,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
