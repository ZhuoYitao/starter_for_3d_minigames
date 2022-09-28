import { WebGPUDataBuffer } from "../../Meshes/WebGPU/webgpuDataBuffer.js";
import { FromHalfFloat } from "../../Misc/textureTools.js";

import { allocateAndCopyTypedBuffer } from "../Extensions/engine.readTexture.js";
import * as WebGPUConstants from "./webgpuConstants.js";
/** @hidden */
var WebGPUBufferManager = /** @class */ (function () {
    function WebGPUBufferManager(device) {
        this._deferredReleaseBuffers = [];
        this._device = device;
    }
    WebGPUBufferManager._IsGPUBuffer = function (buffer) {
        return buffer.underlyingResource === undefined;
    };
    WebGPUBufferManager.prototype.createRawBuffer = function (viewOrSize, flags, mappedAtCreation) {
        if (mappedAtCreation === void 0) { mappedAtCreation = false; }
        var alignedLength = viewOrSize.byteLength !== undefined ? (viewOrSize.byteLength + 3) & ~3 : (viewOrSize + 3) & ~3; // 4 bytes alignments (because of the upload which requires this)
        var verticesBufferDescriptor = {
            mappedAtCreation: mappedAtCreation,
            size: alignedLength,
            usage: flags,
        };
        return this._device.createBuffer(verticesBufferDescriptor);
    };
    WebGPUBufferManager.prototype.createBuffer = function (viewOrSize, flags) {
        var isView = viewOrSize.byteLength !== undefined;
        var buffer = this.createRawBuffer(viewOrSize, flags);
        var dataBuffer = new WebGPUDataBuffer(buffer);
        dataBuffer.references = 1;
        dataBuffer.capacity = isView ? viewOrSize.byteLength : viewOrSize;
        if (isView) {
            this.setSubData(dataBuffer, 0, viewOrSize);
        }
        return dataBuffer;
    };
    WebGPUBufferManager.prototype.setRawData = function (buffer, dstByteOffset, src, srcByteOffset, byteLength) {
        this._device.queue.writeBuffer(buffer, dstByteOffset, src.buffer, srcByteOffset, byteLength);
    };
    WebGPUBufferManager.prototype.setSubData = function (dataBuffer, dstByteOffset, src, srcByteOffset, byteLength) {
        if (srcByteOffset === void 0) { srcByteOffset = 0; }
        if (byteLength === void 0) { byteLength = 0; }
        var buffer = dataBuffer.underlyingResource;
        byteLength = byteLength || src.byteLength;
        byteLength = Math.min(byteLength, dataBuffer.capacity - dstByteOffset);
        // After Migration to Canary
        var chunkStart = src.byteOffset + srcByteOffset;
        var chunkEnd = chunkStart + byteLength;
        // 4 bytes alignments for upload
        var alignedLength = (byteLength + 3) & ~3;
        if (alignedLength !== byteLength) {
            var tempView = new Uint8Array(src.buffer.slice(chunkStart, chunkEnd));
            src = new Uint8Array(alignedLength);
            src.set(tempView);
            srcByteOffset = 0;
            chunkStart = 0;
            chunkEnd = alignedLength;
            byteLength = alignedLength;
        }
        // Chunk
        var maxChunk = 1024 * 1024 * 15;
        var offset = 0;
        while (chunkEnd - (chunkStart + offset) > maxChunk) {
            this._device.queue.writeBuffer(buffer, dstByteOffset + offset, src.buffer, chunkStart + offset, maxChunk);
            offset += maxChunk;
        }
        this._device.queue.writeBuffer(buffer, dstByteOffset + offset, src.buffer, chunkStart + offset, byteLength - offset);
    };
    WebGPUBufferManager.prototype._getHalfFloatAsFloatRGBAArrayBuffer = function (dataLength, arrayBuffer, destArray) {
        if (!destArray) {
            destArray = new Float32Array(dataLength);
        }
        var srcData = new Uint16Array(arrayBuffer);
        while (dataLength--) {
            destArray[dataLength] = FromHalfFloat(srcData[dataLength]);
        }
        return destArray;
    };
    WebGPUBufferManager.prototype.readDataFromBuffer = function (gpuBuffer, size, width, height, bytesPerRow, bytesPerRowAligned, type, offset, buffer, destroyBuffer, noDataConversion) {
        var _this = this;
        if (type === void 0) { type = 0; }
        if (offset === void 0) { offset = 0; }
        if (buffer === void 0) { buffer = null; }
        if (destroyBuffer === void 0) { destroyBuffer = true; }
        if (noDataConversion === void 0) { noDataConversion = false; }
        var floatFormat = type === 1 ? 2 : type === 2 ? 1 : 0;
        return new Promise(function (resolve, reject) {
            gpuBuffer.mapAsync(WebGPUConstants.MapMode.Read, offset, size).then(function () {
                var copyArrayBuffer = gpuBuffer.getMappedRange(offset, size);
                var data = buffer;
                if (noDataConversion) {
                    if (data === null) {
                        data = allocateAndCopyTypedBuffer(type, size, true, copyArrayBuffer);
                    }
                    else {
                        data = allocateAndCopyTypedBuffer(type, data.buffer, undefined, copyArrayBuffer);
                    }
                }
                else {
                    if (data === null) {
                        switch (floatFormat) {
                            case 0: // byte format
                                data = new Uint8Array(size);
                                data.set(new Uint8Array(copyArrayBuffer));
                                break;
                            case 1: // half float
                                // TODO WEBGPU use computer shaders (or render pass) to make the conversion?
                                data = _this._getHalfFloatAsFloatRGBAArrayBuffer(size / 2, copyArrayBuffer);
                                break;
                            case 2: // float
                                data = new Float32Array(size / 4);
                                data.set(new Float32Array(copyArrayBuffer));
                                break;
                        }
                    }
                    else {
                        switch (floatFormat) {
                            case 0: // byte format
                                data = new Uint8Array(data.buffer);
                                data.set(new Uint8Array(copyArrayBuffer));
                                break;
                            case 1: // half float
                                // TODO WEBGPU use computer shaders (or render pass) to make the conversion?
                                data = _this._getHalfFloatAsFloatRGBAArrayBuffer(size / 2, copyArrayBuffer, buffer);
                                break;
                            case 2: // float
                                data = new Float32Array(data.buffer);
                                data.set(new Float32Array(copyArrayBuffer));
                                break;
                        }
                    }
                }
                if (bytesPerRow !== bytesPerRowAligned) {
                    // TODO WEBGPU use computer shaders (or render pass) to build the final buffer data?
                    if (floatFormat === 1 && !noDataConversion) {
                        // half float have been converted to float above
                        bytesPerRow *= 2;
                        bytesPerRowAligned *= 2;
                    }
                    var data2 = new Uint8Array(data.buffer);
                    var offset_1 = bytesPerRow, offset2 = 0;
                    for (var y = 1; y < height; ++y) {
                        offset2 = y * bytesPerRowAligned;
                        for (var x = 0; x < bytesPerRow; ++x) {
                            data2[offset_1++] = data2[offset2++];
                        }
                    }
                    if (floatFormat !== 0 && !noDataConversion) {
                        data = new Float32Array(data2.buffer, 0, offset_1 / 4);
                    }
                    else {
                        data = new Uint8Array(data2.buffer, 0, offset_1);
                    }
                }
                gpuBuffer.unmap();
                if (destroyBuffer) {
                    _this.releaseBuffer(gpuBuffer);
                }
                resolve(data);
            }, function (reason) { return reject(reason); });
        });
    };
    WebGPUBufferManager.prototype.releaseBuffer = function (buffer) {
        if (WebGPUBufferManager._IsGPUBuffer(buffer)) {
            this._deferredReleaseBuffers.push(buffer);
            return true;
        }
        buffer.references--;
        if (buffer.references === 0) {
            this._deferredReleaseBuffers.push(buffer.underlyingResource);
            return true;
        }
        return false;
    };
    WebGPUBufferManager.prototype.destroyDeferredBuffers = function () {
        for (var i = 0; i < this._deferredReleaseBuffers.length; ++i) {
            this._deferredReleaseBuffers[i].destroy();
        }
        this._deferredReleaseBuffers.length = 0;
    };
    return WebGPUBufferManager;
}());
export { WebGPUBufferManager };
//# sourceMappingURL=webgpuBufferManager.js.map