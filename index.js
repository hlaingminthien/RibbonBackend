const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");

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
    db.saveLuckyDrawCount().then(data => {
      //Winning numbers: 3, 9, 11, 15, 29, 41, 57, 65, 83, 111
      //if(data[0][0].count == 3 || data[0][0].count == 9 || data[0][0].count == 11 || data[0][0].count == 15 || data[0][0].count == 29 || data[0][0].count == 41 || data[0][0].count == 57 || data[0][0].count == 65 || data[0][0].count == 83 || data[0][0].count == 111){
      if(data[0][0].count == 3 || data[0][0].count == 11 || data[0][0].count == 15 || data[0][0].count == 29 || data[0][0].count == 41){
        res.json(
          {
            success: true,
            payload: data[0][0],
            message: null,
            lucky: true
          }
        );
      } else {
        res.json(
          {
            success: true,
            payload: data[0][0],
            message: null,
            lucky: false
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
})

let transporter = null

const createTransporter = async () => {
  try {
    transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      host: "mail.ncisribbonchallenge.sg",
      // host: "business100.web-hosting.com",
      port: 465,
      // port: 587,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "pledgearibbon@ncisribbonchallenge.sg",
        pass: "t^lHU6]lO7Fv",
        // user: "moemingyi991@gmail.com", // generated ethereal user
        // pass: "mkkqrwclunexlccb", // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false
      },
      // ignoreTLS: true
    });
  } catch(err) {
    console.log(err.stack)
  }

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
      // from: 'NCIS Ribbon Challenge 2021',
      from: 'NCIS Ribbon Challenge 2021 <pledgearibbon@ncisribbonchallenge.sg>', // sender address
      to: receiveEmail, // list of receivers
      subject: subjectText, // Subject line
      // text: "Hello world?", // plain text body
      html: contentHtml
    });
    console.log("Preview URL: %s", info);

    return res.json({info})  
  } catch(error) {
    console.error(error)
    return res.json({ error: error.toString() })
  }

})

app.listen(port, () => console.log(`server is running on port ${port}`));