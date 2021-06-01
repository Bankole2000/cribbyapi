const mkdirp = require('mkdirp');
const path = require('path');
const {createWriteStream} = require("fs");

const checkOrCreatePath = async (listingUUID, filename) => {
  // console.log(__dirname);
  
  const destination = path.join(__dirname,"..",'/uploads', filename);
  console.log({destination});
  return destination;
}

const storeUpload = async ( stream, filename, mimetype, path ) => {
  console.log(path);
  // (createWriteStream) writes our file to the images directory
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("finish", () => resolve({ id: 1, path, filename, mimetype }))
      .on("error", reject)
  );
};

const processUpload = async (uploadedFile) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const file = await storeUpload({ stream, filename, mimetype });
  return file;
};

module.exports = {checkOrCreatePath, processUpload, storeUpload}