const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const db = require("./ribbon_db");
const port = 9898;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function (req, file, callback) {
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
  const filename = Date.now() + "ribbon.jpeg";
  fs.writeFile("public/uploads/" + filename, req.body.ribbon.replace(/^data:image\/jpeg;base64,/, ""), 'base64', function (err) {
    if (err) {
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
        payload: filename,
        message: "Image Uploaded!"
      }
    );
  });
});

app.get("/", (req, res) => {
  res.send("<h1 style='text-align: center; color: blue'>Hello, Ribbon APIs is working well!</h1>");
});

app.get("/api/sharecount", (req, res) => {
  db.getShareCount().then(data => {
    res.json(
      {
        success: true,
        payload: data.length > 0 ? data[0] : {'count': 0},
        message: null
      }
    );
  }).catch(err => {
    res.json(
      {
        success: false,
        payload: null,
        message: err
      }
    );
  });
});

app.get("/api/luckydrawcount", (req, res) => {
  db.getLuckyDrawCount().then(data => {
    res.json(
      {
        success: true,
        payload: data.length > 0 ? data[0] : {'count': 0},
        message: null
      }
    );
  }).catch(err => {
    res.json(
      {
        success: false,
        payload: null,
        message: err
      }
    );
  });
});

app.post("/api/sharecount", (req, res) => {
  db.saveShareCount().then(data => {
    res.json(
      {
        success: true,
        payload: data[0][0],
        message: null
      }
    );
  }).catch(err => {
    res.json(
      {
        success: false,
        payload: null,
        message: err
      }
    );
  });
})

app.post("/api/luckydrawcount", (req, res) => {
  db.saveLuckyDrawCount().then(data => {
    res.json(
      {
        success: true,
        payload: data[0][0],
        message: null
      }
    );
  }).catch(err => {
    res.json(
      {
        success: false,
        payload: null,
        message: err
      }
    );
  });
})


app.listen(port, () => console.log(`server is running on port ${port}`));