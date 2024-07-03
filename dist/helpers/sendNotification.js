"use strict";
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
exports.sendNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const sendNotification = (title, body, deviceId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
    const serverKey = process.env.FCM_TOKEN; // Reemplaza con tu clave del servidor FCM
    const notification = {
        title,
        body,
    };
    const req = {
        to: deviceId, // Reemplaza con el token del dispositivo
        notification: notification,
        data: data
    };
    try {
        const response = yield axios_1.default.post(fcmUrl, req, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${serverKey}`
            }
        });
        console.log('Notificación enviada:', response.data);
    }
    catch (error) {
        console.error('Error al enviar la notificación:', error.response ? error.response.data : error.message);
    }
});
exports.sendNotification = sendNotification;
