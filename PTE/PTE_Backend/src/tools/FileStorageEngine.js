const multer = require("multer");
module.exports.fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, "./src/static/images");
    } 
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    cb(null, formattedDate + "--" + file.originalname);
  },
});
module.exports.postStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "video/mp4"
    ) {
      cb(null, "./src/static/postImages");
    } 
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;
    cb(null, formattedDate + "--" + file.originalname);
  },
});
module.exports.certStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" 
    ) {
      cb(null, "./src/static/certFiles");
   
    } 
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;
    cb(null, formattedDate + "--" + file.originalname);
  },
});
module.exports.leaveStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" 
    ) {
      cb(null, "./src/static/leaveCert");
   
    } 
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;
    cb(null, formattedDate + "--" + file.originalname);
  },

 
});
module.exports.external_docs = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" 
    ) {
      cb(null, "./src/static/external_docs");
   
    }else if(
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png")
      {
        cb(null, "./src/static/images");
    }
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;
    cb(null,formattedDate + "--" +file.originalname);
  },
});
module.exports.signature = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/png" 
    ) {
      cb(null, "./src/static/signatures");
   
    } 
  },
  filename: (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}`;
    cb(null,formattedDate + "--" +file.originalname);
  },

 
});