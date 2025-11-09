import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(
      "File uploading to Cloudinary Successfull. URL: ",
      response.url
    );

    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    console.log("Uploading on Cloudinary Error!", err);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", response);
    return response;
  } catch (err) {
    console.log("Error deleting from Cloudinary:", err);
    return null;
  }
};

export { uploadCloudinary, deleteFromCloudinary };
