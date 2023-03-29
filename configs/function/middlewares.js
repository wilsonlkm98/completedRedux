const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const router = express.Router();

const pubKey = fs.readFileSync(path.join(__dirname, '.pubKey.pem'), 'utf-8');
const signOptions = { expiresIn: '10h', algorithm: 'RS256' };

const authenticate = (req, res, next) => {
  const { token } = req.body;

  if (token) {
    // console.log('process.env', process.env);
    jwt.verify(token, pubKey, signOptions, async (err, decoded) => {
      // console.log('decoded', decoded);
      next();
      // if (
      //   decoded.role == 'admin'
      //   // decoded.projectId == process.env.PROJECTID
      // ) {
      //   next();
      // } else {
      //   return res.status(400).json({ error: 'Invalid Credentials' });
      // }
    });
  } else {
    return res.status(400).json({ error: 'Invalid Credentials' });
  }
};

const authenticateStatus = (req, res, next) => {
  const { token } = req.body;
  if (process.env.STATUS === false) {
    return res.status(401).json({ error: 'Program Ended' })
  }
  if (token) {
    // console.log('process.env', process.env);
    jwt.verify(token, pubKey, signOptions, async (err, decoded) => {
      // console.log('decoded', decoded);
      next();
      // if (
      //   decoded.role == 'admin'
      //   // decoded.projectId == process.env.PROJECTID
      // ) {
      //   next();
      // } else {
      //   return res.status(400).json({ error: 'Invalid Credentials' });
      // }
    });
  } else {
    return res.status(400).json({ error: 'Invalid Credentials' });
  }
};

module.exports = {
  authenticate,
  authenticateStatus,
};
