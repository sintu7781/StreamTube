import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(8).toString("hex"); // 16-character random string
    const ext = path.extname(file.originalname); // preserve file extension
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_"); // clean base name
    const newFileName = `${baseName}_${uniqueSuffix}${ext}`;
    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export { upload };
