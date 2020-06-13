// const multer = require("multer");
// const multerS3 = require("multer-s3");
const s3 = require("../../services/s3");
module.exports = ({ id }) => {
  try {
    console.log("DELETE IMAGE: ", id);
    s3.deleteObject(
      {
        Bucket: "remo-image-store",
        Key: `user/${id}`,
      },
      (err, data) => {
        if (err) return err;
        else return true;
      }
    );
  } catch (err) {
    console.log("S3 DELETE ERROR: ", err);
  }
};
