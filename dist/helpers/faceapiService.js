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
Object.defineProperty(exports, "__esModule", { value: true });
exports.image = image;
exports.detectFapi = detectFapi;
exports.faceApiService = faceApiService;
const path = require("path");
const tf = require("@tensorflow/tfjs-node");
const faceapi = __importStar(require("face-api.js"));
const modelPathRoot = "./models";
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
let optionsSSDMobileNet;
function image(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const decoded = tf.node.decodeImage(file);
        const casted = decoded.toFloat();
        const result = casted.expandDims(0);
        decoded.dispose();
        casted.dispose();
        return result;
    });
}
function detectFapi(tensor) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(tensor, "Imga");
        const result = yield faceapi.detectAllFaces(tensor, optionsSSDMobileNet);
        return result;
    });
}
function faceApiService(file) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("FaceAPI single-process test");
        yield faceapi.tf.setBackend("tensorflow");
        yield faceapi.tf.enableProdMode();
        yield faceapi.tf.ENV.set("DEBUG", false);
        yield faceapi.tf.ready();
        console.log(`Version: TensorFlow/JS ${(_a = faceapi.tf) === null || _a === void 0 ? void 0 : _a.version_core} Backend: ${(_b = faceapi.tf) === null || _b === void 0 ? void 0 : _b.getBackend()}`);
        yield faceapi.nets.ssdMobilenetv1.loadFromUri("http://localhost:3000/static/models");
        optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
            minConfidence: 0.5,
        });
        console.log("paso 2");
        const tensor = yield image(file);
        const result = yield detectFapi(tensor);
        console.log("Detected faces:", result.length);
        tensor.dispose();
        return result;
    });
}
