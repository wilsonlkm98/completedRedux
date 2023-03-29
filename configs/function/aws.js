/* eslint-disable no-console */
const AWS = require('aws-sdk');
require('dotenv').config();

const region = 'ap-southeast-1';
const accessKeyId = process.env.ACCESS_KEYID;
const secretAccessKey = process.env.SECRET_ACCESSKEY;
const bucketName = process.env.BUCKETNAME;
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});

const s3 = new AWS.S3();
//upload to s3
const s3Upload = async (param, callback) => {
  const s3 = new AWS.S3();

  s3.putObject(param, (err, data) => {
    if (err) {
      console.error("Error when uploading to AWS S3 : \n", err);
      callback(err);
    } else {
      console.log(data);
      callback();
    }
  });
};


const getSignedUrl = (key, callback) => {
  // 	console.log(key)
  // const s3 = new AWS.S3();
  const s3Param = {
    Bucket: bucketName,
    Key: key,
    Expires: 7200,
  };
  s3.getSignedUrl('getObject', s3Param, (err, url) => {
    if (err) {
      console.log('Error when get signed url in validations list : ');
      console.log(err);
      callback('failed');
    }
    callback('success', url);
  });
};

module.exports = {
  s3Upload,
  getSignedUrl,
};