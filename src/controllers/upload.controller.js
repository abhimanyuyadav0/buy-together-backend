import multer from "multer";
import { uploadImageBuffer } from "../utils/cloudinary.js";
import { success, error as sendError } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadSingleImageMiddleware = upload.single("file");

export async function uploadImage(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(res, "No file uploaded", HTTP_STATUS.BAD_REQUEST);
    }

    const { url, publicId } = await uploadImageBuffer(req.file.buffer, "dealsplitr/posts");

    return success(res, { url, publicId }, "Image uploaded", HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

