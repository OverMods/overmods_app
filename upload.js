import multer from "multer";
import * as path from "node:path";
import * as shortid from "shortid";
import * as mime from "mime-types";

export const UPLOAD_DIR = "uploads";
export const ALLOWED_EXTS = [
    ".png", ".jpg", ".jpeg", ".gif",
    ".zip", ".rar", ".7z", ".tar.gz"
];

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(path.dirname('.'), UPLOAD_DIR));
    },
    filename: function (req, file, cb) {
        const id = shortid.generate();
        let ext = mime.extension(file.mimetype);
        cb(null, `${id}.${ext}`);
    }
});
export const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        let ext = path.extname(file.originalname);
        if (!ALLOWED_EXTS.includes(ext)) {
            return callback(null, false);
        }
        callback(null, true)
    }
});
