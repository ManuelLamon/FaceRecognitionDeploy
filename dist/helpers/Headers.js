"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GetHeader = (token, contentType) => {
    let obj = {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
        'Content-Type': contentType
    };
    if (contentType === 'multipart/form-data') {
        obj['Content-Disposition'] = 'form-data';
    }
    return obj;
};
exports.default = GetHeader;
