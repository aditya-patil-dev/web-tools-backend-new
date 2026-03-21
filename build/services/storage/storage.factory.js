"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageProvider = getStorageProvider;
const imagekit_provider_1 = require("./imagekit.provider");
function getStorageProvider() {
    return new imagekit_provider_1.ImageKitProvider();
}
//# sourceMappingURL=storage.factory.js.map