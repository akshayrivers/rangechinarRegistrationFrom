import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<{ url: string } | null> => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete temp file only if it exists
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    console.log("Image uploaded on Cloudinary:", response.secure_url);
    return { url: response.secure_url }; // <-- use secure_url
  } catch (error) {
    // Remove temp file if it exists
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};
