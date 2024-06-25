const path = require("path");

const tf = require("@tensorflow/tfjs-node");

import * as faceapi from 'face-api.js';
const modelPathRoot = "./models";

const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let optionsSSDMobileNet:any;

export async function image(file:any) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

export async function detectFapi(tensor:any) {
  console.log(tensor,"Imga");
  const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet);
  return result;
}

export async function faceApiService(file:any) {
  console.log("FaceAPI single-process test");

  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();

  
  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} Backend: ${faceapi.tf?.getBackend()}`
  );
  await faceapi.nets.ssdMobilenetv1.loadFromUri("http://localhost:3000/static/models");
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
  });
  console.log("paso 2");
  const tensor = await image(file);
  const result = await detectFapi(tensor);
  console.log("Detected faces:", result.length);

  tensor.dispose();

  return result;
}