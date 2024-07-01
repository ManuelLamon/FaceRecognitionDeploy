"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const HttpService = (method, host, url, req, headers, setLoader) => {
    return new Promise((resolve, reject) => {
        if (setLoader) {
            setLoader(true);
        }
        let response;
        if (method === 'get') {
            response = axios_1.default[method](`${host}${url}`, { headers });
        }
        else {
            response = axios_1.default[method](`${host}${url}`, req, { headers, timeout: 6000 });
        }
        response
            .then((res) => {
            resolve(res.data);
        })
            .catch((err) => {
            reject(err);
        })
            .finally(() => {
            if (setLoader) {
                setLoader(false);
            }
        });
    });
};
exports.default = HttpService;
