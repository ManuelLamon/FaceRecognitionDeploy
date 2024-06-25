import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import * as faceapi from "face-api.js";
import fs from "fs"
const { loadImage, Canvas, Image, ImageData } = require("canvas");

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".")[1]
    );
  },
});

const upload = multer({ storage: storage });

router.get("/", function (req, res) {
  res.send("All systems operational");
});


function validateImage(req:Request, res:Response, next:NextFunction) {
  if (!req.files) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  next()
}

router.post(
  "/FaceRecgnition",validateImage,
  upload.fields([
    { name: "foto1" },
    { name: "foto2"},
  ]),
  async function (req, res) {
   

    const { foto1, foto2 } = req.files as any;

    const image1 = await loadImage(
      "http://localhost:3000/static/uploads/" + foto1[0].filename
    );
    const image2 = await loadImage(
      "http://localhost:3000/static/uploads/" + foto2[0].filename
    );


    
    // detect a single face from the ID card image
    const idCardFacedetection = await faceapi
      .detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    // detect a single face from the selfie image
    const selfieFacedetection = await faceapi
      .detectSingleFace(image2, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    console.log(idCardFacedetection);
    console.log(selfieFacedetection);
    if(!idCardFacedetection){
      res.json({ message: "Foto1 no tiene rostro" });
      return;
    }
    if(!selfieFacedetection){
      res.json({ message: "Foto2 no tiene rostro" });
      return;
    }
    /**
     * Do face comparison only when faces were detected
     */
    if (idCardFacedetection && selfieFacedetection) {
      // Using Euclidean distance to comapare face descriptions
      const distance = faceapi.euclideanDistance(
        idCardFacedetection.descriptor,
        selfieFacedetection.descriptor
      );
      console.log(distance);
      res.json({ message: 100 * (-1* (distance - 1)) });
      fs.unlinkSync(__dirname+"/static/uploads/"+ foto1[0].filename)
      fs.unlinkSync(__dirname+"/static/uploads/"+ foto2[0].filename)
      return
    }

    res.json({ message: "File uploaded successfully" });
    return;
  }
);

app.use("/static", express.static(__dirname + "/static"));
app.use((req, res, next) => {
  console.log(`
      ${req.method} 
      ${req.url} 
      ${req.ip}`);
  next();
});
app.use(express.json());
app.use(cors());
app.use(router);
app.listen(3000, async () => {
  console.log("http://localhost:3000/public/models");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./static/models");
  await faceapi.nets.tinyFaceDetector.loadFromDisk("./static/models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./static/models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./static/models");
  await faceapi.nets.faceExpressionNet.loadFromDisk("./static/models")

  console.log("Listening on port 3000");
});
