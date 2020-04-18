const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const s3 = new aws.S3();  // se no .env ja estiver declarado as coisa, nao precisa passar os parametros

const PostSchema = new mongoose.Schema({
  name: String, //original name
  size: Number,
  key: String,  //hash
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre('save', function () {
  if (!this.url)
    this.url = `${process.env.APP_URL}/files/${this.key}`;
});

PostSchema.pre('remove', function () {
  if (process.env.STORAGE_TYPE === 's3')
    return s3.deleteObject({
      Bucket: process.env.BUCKET_NAME,
      Key: this.key
    }).promise();
  else
    return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)); //deletar arquivo local
});

module.exports = mongoose.model('Post', PostSchema);