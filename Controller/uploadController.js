// controllers/uploadController.js
import Files from "../Models/Files.js";
import dotenv from "dotenv";
dotenv.config();
import HttpError from "../middlewares/httpError.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../Utils/s3.js";
export const uploadFiles = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { userId } = req.userData;

    if (!req.files || req.files.length === 0) {
      return next(new HttpError("No files uploaded", 400));
    }

    const uploadedFiles = req.files.map(file => file.location);
    const uploadedKeys = req.files.map(file => file.key);
    const fileDoc = await Files.create({
      upload_User: userId,
      title,
      files: uploadedFiles,
      s3Key: uploadedKeys, 
    });

    res.status(201).json({
      status: true,
      message: "Files uploaded successfully!",
      data: fileDoc,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return next(new HttpError("File upload failed", 500));
  }
};


//  Get all files uploaded by the logged-in user
export const getUserFiles = async (req, res, next) => {
  try {
    const { userId } = req.userData;

    const files = await Files.find({ upload_User: userId, isDeleted: false, });

    res.status(200).json({
      status: true,
      message: "User files fetched successfully",
      data: files,
    });
  } catch (err) {
    console.error("Fetch files error:", err);
    return next(new HttpError("Failed to fetch files", 500));
  }
};

export const deleteFileById = async (req, res, next) => {
  try {
    const { userId } = req.userData;
    const { id } = req.params;

    const fileDoc = await Files.findById(id);

    if (!fileDoc) {
      return next(new HttpError("File not found", 404));
    }

    if (fileDoc.upload_User.toString() !== userId) {
      return next(new HttpError("Unauthorized to delete this file", 403));
    }

    // Prepare S3 keys for deletion
    const s3Keys = Array.isArray(fileDoc.s3Key) ? fileDoc.s3Key : [fileDoc.s3Key];

    // Log keys for debugging
    console.log("Deleting S3 keys:", s3Keys);

    // Delete files from S3
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: s3Keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    await s3.send(deleteCommand);

     // Soft delete in MongoDB
    fileDoc.isDeleted = true;
    fileDoc.deletedAt = new Date();
    await fileDoc.save(); 

    res.status(200).json({
      status: true,
      message: "File deleted from S3 and marked as deleted in DB",
    });
  } catch (err) {
    console.error("Delete file error:", err);
    return next(new HttpError("Failed to delete file", 500));
  }
};


//download

export const downloadFile = async (req, res) => {
  try {
    const key = req.params.key;

    if (!key) {
      return res.status(400).json({ message: "No file key provided" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });

    const data = await s3.send(command);

    // Set headers to force download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${key}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Pipe the S3 file stream to response
    data.Body.pipe(res);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Error downloading file" });
  }
};