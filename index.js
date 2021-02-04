const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");

const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const upload = multer({
    storage: storage
  }).single("ribbon");
  app.use(express.static(path.join(__dirname, "public/uploads")));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, "public")));

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

  app.post("/api/uploadImage", (req, res) => {
      
    upload(req, res, function(err) {
        if(err){
            res.json(
                {
                  success: false,
                  payload: null,
                  message: err
                }
              );    
        }
        res.json(
            {
              success: true,
              payload: req.file.filename,
              message: "Image Uploaded!"
            }
          );
    });
  });

  app.listen(port, () => console.log(`server is running on port ${port}`));