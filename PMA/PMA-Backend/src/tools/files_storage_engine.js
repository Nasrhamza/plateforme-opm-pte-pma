const multer = require("multer");



const setProjectFilesDestination = (req, file, cb) => {
    cb(null, "./src/uploads/projects");
}

const setImagesDestination = (req, file, cb) => {
    cb(null, "./src/static/images");
}

const setFileName = (req, file, cb) => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    cb(null, formattedDate + "--" + file.originalname);
}


const uploadImages = multer.diskStorage({
    destination: setImagesDestination,
    filename: setFileName,
});
const uploadFiles = multer.diskStorage({
    destination: setProjectFilesDestination,
    filename: setFileName,
});

module.exports.fileStorage = multer({
    storage: uploadFiles
});

module.exports.imageStorage = multer({
    storage: uploadImages
});