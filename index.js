const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");

const db = require("./ribbon_db");
const port = 9897;
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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
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
  const filename = Date.now() + "ribbon.png";
  fs.writeFile("public/uploads/" + filename, req.body.ribbon.replace(/^data:image\/png;base64,/, ""), 'base64', function (err) {
    if (err) {
      console.log(err.stack)
      return res.json(
        {
          success: false,
          payload: null,
          message: err
        }
      );
    }
    return res.json(
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
        payload: data.length > 0 ? data[0] : { 'count': 0 },
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
        payload: data.length > 0 ? data[0] : { 'count': 0 },
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
  var ran = Math.floor(Math.random() * 100);
  if (Math.floor(ran / 3) === 2) {
    db.saveLuckyDrawCount().then(data => {
      console.log('data is=>', data);
      if (data[0][0].count > 2) {
        res.json(
          {
            success: true,
            payload: data[0][0],
            message: null,
            lucky: false
          }
        );
      } else {
        res.json(
          {
            success: true,
            payload: data[0][0],
            message: null,
            lucky: true
          }
        );
      }
    }).catch(err => {
      console.log('err is=>', err);
      res.json(
        {
          success: false,
          payload: null,
          message: err,
          lucky: false
        }
      );
    });
  }
  else {
    res.json(
      {
        success: true,
        payload: null,
        message: null,
        lucky: false
      }
    );
  }
})

let transporter = null

const createTransporter = async () => {
  // const testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  transporter = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    host: "mail.ncisribbonchallenge.sg",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "pledgearibbon@ncisribbonchallenge.sg",
      pass: "67WD20~xl&NX",
      // user: "moemingyi991@gmail.com", // generated ethereal user
      // pass: "mkkqrwclunexlccb", // generated ethereal password
    },
  });
}

createTransporter()

app.post("/api/share-email", async (req, res) => {
  try {
    const body = req.body

    const receiveEmail = body.receiveEmail
    const subjectText = body.subjectText
    const contentHtml = body.contentHtml

    console.log({
      receiveEmail, 
      subjectText,
      // contentHtml
    })

    // console.log("transporter: ", transporter)

    let info = await transporter.sendMail({
      from: 'pledgearibbon@ncisribbonchallenge.sg', // sender address
      to: "nayhtet117711@gmail.com", // list of receivers
      subject: subjectText, // Subject line
      // text: "Hello world?", // plain text body
      html: contentHtml
    });
    // console.log("Preview URL: %s", info);

    return res.json({info})  
  } catch(error) {
    console.error(error)
    return res.json({ error: error.toString() })
  }

})

app.listen(port, () => console.log(`server is running on port ${port}`));