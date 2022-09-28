import * as WebGPUConstants from "./webgpuConstants.js";
import { WebGPUQuerySet } from "./webgpuQuerySet.js";
/** @hidden */
var WebGPUOcclusionQuery = /** @class */ (function () {
    function WebGPUOcclusionQuery(engine, device, bufferManager, startCount, incrementCount) {
        if (startCount === void 0) { startCount = 50; }
        if (incrementCount === void 0) { incrementCount = 100; }
        this._availableIndices = [];
        this._engine = engine;
        this._device = device;
        this._bufferManager = bufferManager;
        this._frameLastBuffer = -1;
        this._currentTotalIndices = 0;
        this._countIncrement = incrementCount;
        this._allocateNewIndices(startCount);
    }
    Object.defineProperty(WebGPUOcclusionQuery.prototype, "querySet", {
        get: function () {
            return this._querySet.querySet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUOcclusionQuery.prototype, "hasQueries", {
        get: function () {
            return this._currentTotalIndices !== this._availableIndices.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUOcclusionQuery.prototype, "canBeginQuery", {
        get: function () {
            var passIndex = this._engine._getCurrentRenderPassIndex();
            switch (passIndex) {
                case 0: {
                    return this._engine._mainRenderPassWrapper.renderPassDescriptor.occlusionQuerySet !== undefined;
                }
                case 1: {
                    return this._engine._rttRenderPassWrapper.renderPassDescriptor.occlusionQuerySet !== undefined;
                }
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    WebGPUOcclusionQuery.prototype.createQuery = function () {
        if (this._availableIndices.length === 0) {
            this._allocateNewIndices();
        }
        var index = this._availableIndices[this._availableIndices.length - 1];
        this._availableIndices.length--;
        return index;
    };
    WebGPUOcclusionQuery.prototype.deleteQuery = function (index) {
        this._availableIndices[this._availableIndices.length - 1] = index;
    };
    WebGPUOcclusionQuery.prototype.isQueryResultAvailable = function (index) {
        this._retrieveQueryBuffer();
        return !!this._lastBuffer && index < this._lastBuffer.length;
    };
    WebGPUOcclusionQuery.prototype.getQueryResult = function (index) {
        var _a, _b;
        return Number((_b = (_a = this._lastBuffer) === null || _a === void 0 ? void 0 : _a[index]) !== null && _b !== void 0 ? _b : -1);
    };
    WebGPUOcclusionQuery.prototype._retrieveQueryBuffer = function () {
        var _this = this;
        if (this._lastBuffer && this._frameLastBuffer === this._engine.frameId) {
            return;
        }
        if (this._frameLastBuffer !== this._engine.frameId) {
            this._frameLastBuffer = this._engine.frameId;
            this._querySet.readValues(0, this._currentTotalIndices).then(function (arrayBuffer) {
                _this._lastBuffer = arrayBuffer;
            });
        }
    };
    WebGPUOcclusionQuery.prototype._allocateNewIndices = function (numIndices) {
        numIndices = numIndices !== null && numIndices !== void 0 ? numIndices : this._countIncrement;
        this._delayQuerySetDispose();
        for (var i = 0; i < numIndices; ++i) {
            this._availableIndices.push(this._currentTotalIndices + i);
        }
        this._currentTotalIndices += numIndices;
        this._querySet = new WebGPUQuerySet(this._currentTotalIndices, WebGPUConstants.QueryType.Occlusion, this._device, this._bufferManager, false);
    };
    WebGPUOcclusionQuery.prototype._delayQuerySetDispose = function () {
        var querySet = this._querySet;
        if (querySet) {
            // Wait a bit before disposing of the queryset, in case some queries are still running for it
            setTimeout(function () { return querySet.dispose; }, 1000);
        }
    };
    WebGPUOcclusionQuery.prototype.dispose = function () {
        var _a;
        (_a = this._querySet) === null || _a === void 0 ? void 0 : _a.dispose();
        this._availableIndices = [];
    };
    return WebGPUOcclusionQuery;
}());
export { WebGPUOcclusionQuery };
//# sourceMappingURL=webgpuOcclusionQuery.js.map