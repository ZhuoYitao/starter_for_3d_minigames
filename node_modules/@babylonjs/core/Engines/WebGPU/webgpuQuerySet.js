import { __awaiter, __generator } from "tslib";
import * as WebGPUConstants from "./webgpuConstants.js";
/** @hidden */
var WebGPUQuerySet = /** @class */ (function () {
    function WebGPUQuerySet(count, type, device, bufferManager, canUseMultipleBuffers) {
        if (canUseMultipleBuffers === void 0) { canUseMultipleBuffers = true; }
        this._dstBuffers = [];
        this._device = device;
        this._bufferManager = bufferManager;
        this._count = count;
        this._canUseMultipleBuffers = canUseMultipleBuffers;
        this._querySet = device.createQuerySet({
            type: type,
            count: count,
        });
        this._queryBuffer = bufferManager.createRawBuffer(8 * count, WebGPUConstants.BufferUsage.QueryResolve | WebGPUConstants.BufferUsage.CopySrc);
        if (!canUseMultipleBuffers) {
            this._dstBuffers.push(this._bufferManager.createRawBuffer(8 * this._count, WebGPUConstants.BufferUsage.MapRead | WebGPUConstants.BufferUsage.CopyDst));
        }
    }
    Object.defineProperty(WebGPUQuerySet.prototype, "querySet", {
        get: function () {
            return this._querySet;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUQuerySet.prototype._getBuffer = function (firstQuery, queryCount) {
        if (!this._canUseMultipleBuffers && this._dstBuffers.length === 0) {
            return null;
        }
        var encoderResult = this._device.createCommandEncoder();
        var buffer;
        if (this._dstBuffers.length === 0) {
            buffer = this._bufferManager.createRawBuffer(8 * this._count, WebGPUConstants.BufferUsage.MapRead | WebGPUConstants.BufferUsage.CopyDst);
        }
        else {
            buffer = this._dstBuffers[this._dstBuffers.length - 1];
            this._dstBuffers.length--;
        }
        encoderResult.resolveQuerySet(this._querySet, firstQuery, queryCount, this._queryBuffer, 0);
        encoderResult.copyBufferToBuffer(this._queryBuffer, 0, buffer, 0, 8 * queryCount);
        this._device.queue.submit([encoderResult.finish()]);
        return buffer;
    };
    WebGPUQuerySet.prototype.readValues = function (firstQuery, queryCount) {
        if (firstQuery === void 0) { firstQuery = 0; }
        if (queryCount === void 0) { queryCount = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var buffer, arrayBuf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = this._getBuffer(firstQuery, queryCount);
                        if (buffer === null) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, buffer.mapAsync(WebGPUConstants.MapMode.Read)];
                    case 1:
                        _a.sent();
                        arrayBuf = new BigUint64Array(buffer.getMappedRange()).slice();
                        buffer.unmap();
                        this._dstBuffers[this._dstBuffers.length] = buffer;
                        return [2 /*return*/, arrayBuf];
                }
            });
        });
    };
    WebGPUQuerySet.prototype.readValue = function (firstQuery) {
        if (firstQuery === void 0) { firstQuery = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var buffer, arrayBuf, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = this._getBuffer(firstQuery, 1);
                        if (buffer === null) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, buffer.mapAsync(WebGPUConstants.MapMode.Read)];
                    case 1:
                        _a.sent();
                        arrayBuf = new BigUint64Array(buffer.getMappedRange());
                        value = Number(arrayBuf[0]);
                        buffer.unmap();
                        this._dstBuffers[this._dstBuffers.length] = buffer;
                        return [2 /*return*/, value];
                }
            });
        });
    };
    WebGPUQuerySet.prototype.readTwoValuesAndSubtract = function (firstQuery) {
        if (firstQuery === void 0) { firstQuery = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var buffer, arrayBuf, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = this._getBuffer(firstQuery, 2);
                        if (buffer === null) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, buffer.mapAsync(WebGPUConstants.MapMode.Read)];
                    case 1:
                        _a.sent();
                        arrayBuf = new BigUint64Array(buffer.getMappedRange());
                        value = Number(arrayBuf[1] - arrayBuf[0]);
                        buffer.unmap();
                        this._dstBuffers[this._dstBuffers.length] = buffer;
                        return [2 /*return*/, value];
                }
            });
        });
    };
    WebGPUQuerySet.prototype.dispose = function () {
        this._querySet.destroy();
        this._bufferManager.releaseBuffer(this._queryBuffer);
        for (var i = 0; i < this._dstBuffers.length; ++i) {
            this._bufferManager.releaseBuffer(this._dstBuffers[i]);
        }
    };
    return WebGPUQuerySet;
}());
export { WebGPUQuerySet };
//# sourceMappingURL=webgpuQuerySet.js.map