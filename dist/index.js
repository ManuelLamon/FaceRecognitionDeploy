"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const multer_1 = __importDefault(require("multer"));
const faceapi = __importStar(require("face-api.js"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const GetKeyAuth_1 = require("./helpers/GetKeyAuth");
const { loadImage, Canvas, Image, ImageData } = require("canvas");
const dotenv = __importStar(require("dotenv"));
const Headers_1 = __importDefault(require("./helpers/Headers"));
const HttpService_1 = __importDefault(require("./helpers/HttpService"));
const sendNotification_1 = require("./helpers/sendNotification");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
dotenv.config();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Configura las credenciales y la región de S3
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.ACCESSKEYID, // Reemplaza con tu accessKeyId
    secretAccessKey: process.env.SECRETACCESSKEY, // Reemplaza con tu secretAccessKey
    region: process.env.REGION, // La región donde está tu bucket
});
const options = {
    key: fs_1.default.readFileSync(`/etc/letsencrypt/live/${process.env.BASE_API}/privkey.pem`),
    cert: fs_1.default.readFileSync(`/etc/letsencrypt/live/${process.env.BASE_API}/fullchain.pem`),
};
let key = "";
// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const app = (0, express_1.default)();
const router = express_1.default.Router();
const port = process.env.PORT || 4055;
router.get("/", function (req, res) {
    res.send("All systems operational");
});
router.post('/ThereIsFace', upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const imageBuffer = req.file.buffer;
        const info = yield (0, sharp_1.default)(imageBuffer).toFormat("png").toBuffer();
        const image1 = yield loadImage(info);
        const idCardFacedetection = yield faceapi
            .detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions());
        if (idCardFacedetection) {
            res.json({ message: "File uploaded successfully", code: "00" });
            return;
        }
        else {
            res.json({ message: "Este archivo no posee rostro.", code: "01" });
            return;
        }
    }
    else {
        res.status(400).send('No se ha recibido ninguna imagen');
    }
}));
router.post("/FaceRecgnition", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let imgDenegadas = [];
        const { customerId, customerImages, imagePrincipalToValidate, deviceId } = req.body;
        res.json({ message: "File uploaded successfully" });
        try {
            key = yield (0, GetKeyAuth_1.GetTokenAPI)();
            const ImagePrincipal = yield processImage(imagePrincipalToValidate.urlResource);
            const ImagesCustomer = yield Promise.all(customerImages.map((e) => processImage(e.link)));
            const ValidateDiference = ImagesCustomer.map((e) => {
                if (e && ImagePrincipal) {
                    return validateDiference(ImagePrincipal, e);
                }
                return false;
            });
            console.log(ValidateDiference);
            for (const [index, validate] of ValidateDiference.entries()) {
                if (!validate) {
                    imgDenegadas.push(customerImages[index]);
                }
            }
            if (imgDenegadas.length) {
                (0, sendNotification_1.sendNotification)("Validación de Identidad", "Tu Validación de identidad fue denegada porque una de tus fotos no eres tu.", deviceId, {
                    code: "97",
                    customerImages: JSON.stringify(imgDenegadas.map(e => ({ link: e.link }))),
                });
                return;
            }
            const host = process.env.APP_BASE_API;
            const url = `/api/appchancea/customers/verified/${customerId}`;
            const header = yield (0, Headers_1.default)(key, "application/json");
            console.log(host + url);
            const res = yield (0, HttpService_1.default)("get", host, url, {}, header);
            (0, sendNotification_1.sendNotification)("Validación de Identidad", "Tu Validación de identidad fue completada con éxito!.", deviceId, {
                code: "98",
            });
            return;
        }
        catch (error) {
            console.log(error);
        }
    });
});
app.use("/static", express_1.default.static(__dirname + "/static"));
app.use((req, res, next) => {
    console.log(`
      ${req.method} 
      ${req.url} 
      ${req.ip}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(router);
https_1.default.createServer(options, app).listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    // key = await GetTokenAPI();
    // cron.schedule('0 */3 * * *', () => {
    //   GetTokenAPI();
    // });
    yield faceapi.nets.ssdMobilenetv1.loadFromDisk("./static/models");
    yield faceapi.nets.tinyFaceDetector.loadFromDisk("./static/models");
    yield faceapi.nets.faceLandmark68Net.loadFromDisk("./static/models");
    yield faceapi.nets.faceRecognitionNet.loadFromDisk("./static/models");
    yield faceapi.nets.faceExpressionNet.loadFromDisk("./static/models");
    console.log(`Listening on port ${port}`);
    console.log(`Servidor HTTPS escuchando en el puerto ${port}`);
}));
// Procesar una imagen para obtener su descriptor facial
function processImage(imageURL) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let buffer;
            // Verifica si la imagen proviene de S3
            if (imageURL.includes(process.env.BUCKETNAME + '.s3.amazonaws.com')) {
                // Extrae el nombre del archivo de la URL
                const fileName = imageURL.split('.com/')[1];
                // Obtén la imagen desde S3
                buffer = yield getImageFromS3(fileName);
            }
            else {
                // Si no es de S3, usa axios para obtener la imagen
                const response = yield (0, axios_1.default)(imageURL, {
                    responseType: 'arraybuffer',
                });
                buffer = Buffer.from(response.data, 'binary');
            }
            // Procesa la imagen con sharp
            const info = yield (0, sharp_1.default)(buffer).toFormat('png').toBuffer();
            // Carga la imagen para detección facial
            const image1 = yield loadImage(info);
            // Realiza la detección facial
            const idCardFacedetection = yield faceapi
                .detectSingleFace(image1, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (idCardFacedetection) {
                return idCardFacedetection;
            }
            else {
                return false;
            }
        }
        catch (error) {
            console.error('Error procesando la imagen:', error);
        }
    });
}
function validateDiference(image1, image2) {
    // Using Euclidean distance to comapare face descriptions
    const distance = faceapi.euclideanDistance(image1.descriptor, image2.descriptor);
    console.log((distance * 100 - 100) * -1);
    const dataNumber = (distance * 100 - 100) * -1;
    return dataNumber > 35;
}
function getImageFromS3(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            Bucket: process.env.BUCKETNAME, // El nombre de tu bucket
            Key: fileName.replace("%20", " "), // El nombre del archivo en el bucket
        };
        try {
            const data = yield s3.getObject(params).promise();
            return data.Body; // Devuelve el buffer de la imagen
        }
        catch (error) {
            console.log(params);
            if (error.code === 'NoSuchKey') {
                console.error(`La clave especificada no existe: ${params.Key}`);
            }
            console.error('Error al obtener la imagen de S3:', error);
            throw error;
        }
    });
}
