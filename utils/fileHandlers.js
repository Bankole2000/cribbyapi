const mkdirp = require('mkdirp');
require("dotenv").config({ path: __dirname + "/./../.env" });
const path = require('path');
const {createWriteStream} = require("fs");
const Jimp = require('jimp'); 
const fs = require('fs');

const deleteFiles = async (...args) => {
  console.log(args);
  args.forEach(file => {
    if(fs.existsSync(file)){
      fs.unlinkSync(file)
    }
  })
}

const createResizedImage = async(file, size, path) => {
  console.log({file, size, path});
    let image = await Jimp.read(file.path);
    image
     .resize(size, Jimp.AUTO)
     .quality(50)
     .write(path)
}

const checkOrCreateListingImagePath = async (listingUUID, filename) => {
  const destinationFolder = path.join(__dirname, "..", 'uploads','listingImages', `${listingUUID}` );
  console.log({destinationFolder});
  mkdirp.sync(`${destinationFolder}`); 
  mkdirp.sync(`${destinationFolder}/resized/150`);
  mkdirp.sync(`${destinationFolder}/resized/640`);
  mkdirp.sync(`${destinationFolder}/resized/1200`);

  const filePath = path.join(destinationFolder, filename);
  const imageBaseURL = `${process.env.API_SERVER_URL}/uploads/listingImages/${listingUUID}`;
  const fileURL = `${imageBaseURL}/${filename}`;
  const thumbnailPath = path.join(destinationFolder, 'resized', '150', filename);
  const mediumPath = path.join(destinationFolder, 'resized', '640', filename);
  const largePath = path.join(destinationFolder, 'resized', '1200', filename);
  const thumbnailURL = `${imageBaseURL}/resized/150/${filename}`;
  const mediumURL = `${imageBaseURL}/resized/640/${filename}`;
  const largeURL = `${imageBaseURL}/resized/1200/${filename}`;


  const paths = {filePath, thumbnailPath, mediumPath, largePath, thumbnailURL, mediumURL, largeURL, fileURL};
  return paths;
}

const storeUpload = async ( stream, filename, mimetype, path) => {
  // (createWriteStream) writes our file
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("finish", () => resolve({ path, filename, mimetype }))
      .on("error", reject)
  );
};

const processUpload = async (uploadedFile) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const file = await storeUpload({ stream, filename, mimetype });
  return file;
};

module.exports = {checkOrCreateListingImagePath, processUpload, storeUpload, createResizedImage, deleteFiles}