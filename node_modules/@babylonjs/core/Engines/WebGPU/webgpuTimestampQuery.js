import { __awaiter, __generator } from "tslib";
import * as WebGPUConstants from "./webgpuConstants.js";
import { PerfCounter } from "../../Misc/perfCounter.js";
import { WebGPUQuerySet } from "./webgpuQuerySet.js";
/** @hidden */
var WebGPUTimestampQuery = /** @class */ (function () {
    function WebGPUTimestampQuery(device, bufferManager) {
        this._enabled = false;
        this._gpuFrameTimeCounter = new PerfCounter();
        this._measureDurationState = 0;
        this._device = device;
        this._bufferManager = bufferManager;
    }
    Object.defineProperty(WebGPUTimestampQuery.prototype, "gpuFrameTimeCounter", {
        get: function () {
            return this._gpuFrameTimeCounter;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUTimestampQuery.prototype, "enable", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled === value) {
                return;
            }
            this._enabled = value;
            this._measureDurationState = 0;
            if (value) {
                this._measureDuration = new WebGPUDurationMeasure(this._device, this._bufferManager);
            }
            else {
                this._measureDuration.dispose();
            }
        },
        enumerable: false,
        configurable: true
    });
    WebGPUTimestampQuery.prototype.startFrame = function (commandEncoder) {
        if (this._enabled && this._measureDurationState === 0) {
            this._measureDuration.start(commandEncoder);
            this._measureDurationState = 1;
        }
    };
    WebGPUTimestampQuery.prototype.endFrame = function (commandEncoder) {
        var _this = this;
        if (this._measureDurationState === 1) {
            this._measureDurationState = 2;
            this._measureDuration.stop(commandEncoder).then(function (duration) {
                if (duration !== null && duration >= 0) {
                    _this._gpuFrameTimeCounter.fetchNewFrame();
                    _this._gpuFrameTimeCounter.addCount(duration, true);
                }
                _this._measureDurationState = 0;
            });
        }
    };
    return WebGPUTimestampQuery;
}());
export { WebGPUTimestampQuery };
/** @hidden */
var WebGPUDurationMeasure = /** @class */ (function () {
    function WebGPUDurationMeasure(device, bufferManager) {
        this._querySet = new WebGPUQuerySet(2, WebGPUConstants.QueryType.Timestamp, device, bufferManager);
    }
    WebGPUDurationMeasure.prototype.start = function (encoder) {
        encoder.writeTimestamp(this._querySet.querySet, 0);
    };
    WebGPUDurationMeasure.prototype.stop = function (encoder) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                encoder.writeTimestamp(this._querySet.querySet, 1);
                return [2 /*return*/, this._querySet.readTwoValuesAndSubtract(0)];
            });
        });
    };
    WebGPUDurationMeasure.prototype.dispose = function () {
        this._querySet.dispose();
    };
    return WebGPUDurationMeasure;
}());
export { WebGPUDurationMeasure };
//# sourceMappingURL=webgpuTimestampQuery.js.map