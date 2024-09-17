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
const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "chanceaappp-23758-bee0cafd0444.json");
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const auth = new GoogleAuth({
                keyFile: SERVICE_ACCOUNT_PATH,
                scopes: ["https://www.googleapis.com/auth/cloud-platform"], // Cambia este scope según tu caso
            });
            const client = yield auth.getClient();
            const token = yield client.getAccessToken();
            return token;
        }
        catch (error) {
            console.log(error);
        }
    });
}
const sendNotification = (title, body, deviceId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const fcmUrl = "https://fcm.googleapis.com/v1/projects/chanceaappp-23758/messages:send";
    const token = yield getAccessToken();
    const notification = {
        title,
        body,
    };
    console.log(data, "data");
    const req = {
        message: {
            token: deviceId,
            notification: notification,
            data: data,
        },
    };
    try {
        const response = yield axios_1.default.post(fcmUrl, req, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.token}`,
            },
        });
        console.log("Notificación enviada:", response.data);
    }
    catch (error) {
        console.error("Error al enviar la notificación:", error.response ? error.response.data : error.message);
    }
});
exports.sendNotification = sendNotification;
