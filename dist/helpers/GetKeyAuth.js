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
exports.GetTokenAPI = void 0;
const HttpService_1 = __importDefault(require("./HttpService"));
const GetTokenAPI = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = process.env.USER;
        const password = process.env.PASSWORD;
        const host = process.env.APP_BASE_API;
        const url = "/api/authenticate";
        const req = { username, password };
        const response = yield (0, HttpService_1.default)("post", host, url, req);
        if (response) {
            /*         console.log(response.id_token); */
            return response.id_token;
        }
    }
    catch (err) {
        console.error(JSON.stringify(err), "User");
    }
});
exports.GetTokenAPI = GetTokenAPI;
