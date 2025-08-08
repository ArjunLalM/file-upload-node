// routes/uploadRoutes.js
import express from "express";
import { uploadFiles,getUserFiles, deleteFileById ,downloadFile } from "../Controller/uploadController.js";
import uploadS3 from "../middlewares/s3Upload.js";
import checkAuth from "../middlewares/authcheck.js"; // to get req.userData

const router = express.Router();

router.post("/upload", checkAuth, uploadS3, uploadFiles);
router.post("/myfiles", checkAuth, getUserFiles);
router.delete("/delete/:id", checkAuth, deleteFileById);
router.get("/download/:key",checkAuth, downloadFile );
export default router;
