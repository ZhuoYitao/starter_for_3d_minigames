import { ThinEngine } from "../../Engines/thinEngine.js";

/**
 * Allocate a typed array depending on a texture type. Optionally can copy existing data in the buffer.
 * @param type type of the texture
 * @param sizeOrDstBuffer size of the array OR an existing buffer that will be used as the destination of the copy (if copyBuffer is provided)
 * @param sizeInBytes true if the size of the array is given in bytes, false if it is the number of elements of the array
 * @param copyBuffer if provided, buffer to copy into the destination buffer (either a newly allocated buffer if sizeOrDstBuffer is a number or use sizeOrDstBuffer as the destination buffer otherwise)
 * @returns the allocated buffer or sizeOrDstBuffer if the latter is an ArrayBuffer
 */
export function allocateAndCopyTypedBuffer(type, sizeOrDstBuffer, sizeInBytes, copyBuffer) {
    if (sizeInBytes === void 0) { sizeInBytes = false; }
    switch (type) {
        case 3: {
            var buffer_1 = sizeOrDstBuffer instanceof ArrayBuffer ? new Int8Array(sizeOrDstBuffer) : new Int8Array(sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_1.set(new Int8Array(copyBuffer));
            }
            return buffer_1;
        }
        case 0: {
            var buffer_2 = sizeOrDstBuffer instanceof ArrayBuffer ? new Uint8Array(sizeOrDstBuffer) : new Uint8Array(sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_2.set(new Uint8Array(copyBuffer));
            }
            return buffer_2;
        }
        case 4: {
            var buffer_3 = sizeOrDstBuffer instanceof ArrayBuffer ? new Int16Array(sizeOrDstBuffer) : new Int16Array(sizeInBytes ? sizeOrDstBuffer / 2 : sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_3.set(new Int16Array(copyBuffer));
            }
            return buffer_3;
        }
        case 5:
        case 8:
        case 9:
        case 10:
        case 2: {
            var buffer_4 = sizeOrDstBuffer instanceof ArrayBuffer ? new Uint16Array(sizeOrDstBuffer) : new Uint16Array(sizeInBytes ? sizeOrDstBuffer / 2 : sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_4.set(new Uint16Array(copyBuffer));
            }
            return buffer_4;
        }
        case 6: {
            var buffer_5 = sizeOrDstBuffer instanceof ArrayBuffer ? new Int32Array(sizeOrDstBuffer) : new Int32Array(sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_5.set(new Int32Array(copyBuffer));
            }
            return buffer_5;
        }
        case 7:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15: {
            var buffer_6 = sizeOrDstBuffer instanceof ArrayBuffer ? new Uint32Array(sizeOrDstBuffer) : new Uint32Array(sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_6.set(new Uint32Array(copyBuffer));
            }
            return buffer_6;
        }
        case 1: {
            var buffer_7 = sizeOrDstBuffer instanceof ArrayBuffer ? new Float32Array(sizeOrDstBuffer) : new Float32Array(sizeInBytes ? sizeOrDstBuffer / 4 : sizeOrDstBuffer);
            if (copyBuffer) {
                buffer_7.set(new Float32Array(copyBuffer));
            }
            return buffer_7;
        }
    }
    var buffer = sizeOrDstBuffer instanceof ArrayBuffer ? new Uint8Array(sizeOrDstBuffer) : new Uint8Array(sizeOrDstBuffer);
    if (copyBuffer) {
        buffer.set(new Uint8Array(copyBuffer));
    }
    return buffer;
}
ThinEngine.prototype._readTexturePixelsSync = function (texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion, x, y) {
    var _a, _b;
    if (faceIndex === void 0) { faceIndex = -1; }
    if (level === void 0) { level = 0; }
    if (buffer === void 0) { buffer = null; }
    if (flushRenderer === void 0) { flushRenderer = true; }
    if (noDataConversion === void 0) { noDataConversion = false; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    var gl = this._gl;
    if (!gl) {
        throw new Error("Engine does not have gl rendering context.");
    }
    if (!this._dummyFramebuffer) {
        var dummy = gl.createFramebuffer();
        if (!dummy) {
            throw new Error("Unable to create dummy framebuffer");
        }
        this._dummyFramebuffer = dummy;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._dummyFramebuffer);
    if (faceIndex > -1) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex, (_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource, level);
    }
    else {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, (_b = texture._hardwareTexture) === null || _b === void 0 ? void 0 : _b.underlyingResource, level);
    }
    var readType = texture.type !== undefined ? this._getWebGLTextureType(texture.type) : gl.UNSIGNED_BYTE;
    if (!noDataConversion) {
        switch (readType) {
            case gl.UNSIGNED_BYTE:
                if (!buffer) {
                    buffer = new Uint8Array(4 * width * height);
                }
                readType = gl.UNSIGNED_BYTE;
                break;
            default:
                if (!buffer) {
                    buffer = new Float32Array(4 * width * height);
                }
                readType = gl.FLOAT;
                break;
        }
    }
    else if (!buffer) {
        buffer = allocateAndCopyTypedBuffer(texture.type, 4 * width * height);
    }
    if (flushRenderer) {
        this.flushFramebuffer();
    }
    gl.readPixels(x, y, width, height, gl.RGBA, readType, buffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._currentFramebuffer);
    return buffer;
};
ThinEngine.prototype._readTexturePixels = function (texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion, x, y) {
    if (faceIndex === void 0) { faceIndex = -1; }
    if (level === void 0) { level = 0; }
    if (buffer === void 0) { buffer = null; }
    if (flushRenderer === void 0) { flushRenderer = true; }
    if (noDataConversion === void 0) { noDataConversion = false; }
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    return Promise.resolve(this._readTexturePixelsSync(texture, width, height, faceIndex, level, buffer, flushRenderer, noDataConversion, x, y));
};
//# sourceMappingURL=engine.readTexture.js.map