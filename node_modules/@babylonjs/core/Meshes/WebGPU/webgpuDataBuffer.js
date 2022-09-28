import { __extends } from "tslib";
import { DataBuffer } from "../../Buffers/dataBuffer.js";
/** @hidden */
var WebGPUDataBuffer = /** @class */ (function (_super) {
    __extends(WebGPUDataBuffer, _super);
    function WebGPUDataBuffer(resource) {
        var _this = _super.call(this) || this;
        _this._buffer = resource;
        return _this;
    }
    Object.defineProperty(WebGPUDataBuffer.prototype, "underlyingResource", {
        get: function () {
            return this._buffer;
        },
        enumerable: false,
        configurable: true
    });
    return WebGPUDataBuffer;
}(DataBuffer));
export { WebGPUDataBuffer };
//# sourceMappingURL=webgpuDataBuffer.js.map