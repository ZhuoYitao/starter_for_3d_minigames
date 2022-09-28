import { __extends } from "tslib";
import { DepthCullingState } from "../../States/depthCullingState.js";
/**
 * @hidden
 **/
var WebGPUDepthCullingState = /** @class */ (function (_super) {
    __extends(WebGPUDepthCullingState, _super);
    /**
     * Initializes the state.
     * @param cache
     */
    function WebGPUDepthCullingState(cache) {
        var _this = _super.call(this, false) || this;
        _this._cache = cache;
        _this.reset();
        return _this;
    }
    Object.defineProperty(WebGPUDepthCullingState.prototype, "zOffset", {
        get: function () {
            return this._zOffset;
        },
        set: function (value) {
            if (this._zOffset === value) {
                return;
            }
            this._zOffset = value;
            this._isZOffsetDirty = true;
            this._cache.setDepthBiasSlopeScale(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "zOffsetUnits", {
        get: function () {
            return this._zOffsetUnits;
        },
        set: function (value) {
            if (this._zOffsetUnits === value) {
                return;
            }
            this._zOffsetUnits = value;
            this._isZOffsetDirty = true;
            this._cache.setDepthBias(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "cullFace", {
        get: function () {
            return this._cullFace;
        },
        set: function (value) {
            if (this._cullFace === value) {
                return;
            }
            this._cullFace = value;
            this._isCullFaceDirty = true;
            this._cache.setCullFace(value !== null && value !== void 0 ? value : 1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "cull", {
        get: function () {
            return this._cull;
        },
        set: function (value) {
            if (this._cull === value) {
                return;
            }
            this._cull = value;
            this._isCullDirty = true;
            this._cache.setCullEnabled(!!value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "depthFunc", {
        get: function () {
            return this._depthFunc;
        },
        set: function (value) {
            if (this._depthFunc === value) {
                return;
            }
            this._depthFunc = value;
            this._isDepthFuncDirty = true;
            this._cache.setDepthCompare(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "depthMask", {
        get: function () {
            return this._depthMask;
        },
        set: function (value) {
            if (this._depthMask === value) {
                return;
            }
            this._depthMask = value;
            this._isDepthMaskDirty = true;
            this._cache.setDepthWriteEnabled(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "depthTest", {
        get: function () {
            return this._depthTest;
        },
        set: function (value) {
            if (this._depthTest === value) {
                return;
            }
            this._depthTest = value;
            this._isDepthTestDirty = true;
            this._cache.setDepthTestEnabled(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUDepthCullingState.prototype, "frontFace", {
        get: function () {
            return this._frontFace;
        },
        set: function (value) {
            if (this._frontFace === value) {
                return;
            }
            this._frontFace = value;
            this._isFrontFaceDirty = true;
            this._cache.setFrontFace(value !== null && value !== void 0 ? value : 2);
        },
        enumerable: false,
        configurable: true
    });
    WebGPUDepthCullingState.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._cache.resetDepthCullingState();
    };
    WebGPUDepthCullingState.prototype.apply = function () {
        // nothing to do
    };
    return WebGPUDepthCullingState;
}(DepthCullingState));
export { WebGPUDepthCullingState };
//# sourceMappingURL=webgpuDepthCullingState.js.map