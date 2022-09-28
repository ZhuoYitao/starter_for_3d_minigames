import { __extends } from "tslib";
import { StencilStateComposer } from "../../States/stencilStateComposer.js";
/**
 * @hidden
 **/
var WebGPUStencilStateComposer = /** @class */ (function (_super) {
    __extends(WebGPUStencilStateComposer, _super);
    function WebGPUStencilStateComposer(cache) {
        var _this = _super.call(this, false) || this;
        _this._cache = cache;
        _this.reset();
        return _this;
    }
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "func", {
        get: function () {
            return this._func;
        },
        set: function (value) {
            if (this._func === value) {
                return;
            }
            this._func = value;
            this._cache.setStencilCompare(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "funcMask", {
        get: function () {
            return this._funcMask;
        },
        set: function (value) {
            if (this._funcMask === value) {
                return;
            }
            this._funcMask = value;
            this._cache.setStencilReadMask(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "opStencilFail", {
        get: function () {
            return this._opStencilFail;
        },
        set: function (value) {
            if (this._opStencilFail === value) {
                return;
            }
            this._opStencilFail = value;
            this._cache.setStencilFailOp(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "opDepthFail", {
        get: function () {
            return this._opDepthFail;
        },
        set: function (value) {
            if (this._opDepthFail === value) {
                return;
            }
            this._opDepthFail = value;
            this._cache.setStencilDepthFailOp(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "opStencilDepthPass", {
        get: function () {
            return this._opStencilDepthPass;
        },
        set: function (value) {
            if (this._opStencilDepthPass === value) {
                return;
            }
            this._opStencilDepthPass = value;
            this._cache.setStencilPassOp(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "mask", {
        get: function () {
            return this._mask;
        },
        set: function (value) {
            if (this._mask === value) {
                return;
            }
            this._mask = value;
            this._cache.setStencilWriteMask(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUStencilStateComposer.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled === value) {
                return;
            }
            this._enabled = value;
            this._cache.setStencilEnabled(value);
        },
        enumerable: false,
        configurable: true
    });
    WebGPUStencilStateComposer.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this._cache.resetStencilState();
    };
    WebGPUStencilStateComposer.prototype.apply = function () {
        var _a;
        var stencilMaterialEnabled = (_a = this.stencilMaterial) === null || _a === void 0 ? void 0 : _a.enabled;
        this.enabled = stencilMaterialEnabled ? this.stencilMaterial.enabled : this.stencilGlobal.enabled;
        if (!this.enabled) {
            return;
        }
        this.func = stencilMaterialEnabled ? this.stencilMaterial.func : this.stencilGlobal.func;
        this.funcRef = stencilMaterialEnabled ? this.stencilMaterial.funcRef : this.stencilGlobal.funcRef;
        this.funcMask = stencilMaterialEnabled ? this.stencilMaterial.funcMask : this.stencilGlobal.funcMask;
        this.opStencilFail = stencilMaterialEnabled ? this.stencilMaterial.opStencilFail : this.stencilGlobal.opStencilFail;
        this.opDepthFail = stencilMaterialEnabled ? this.stencilMaterial.opDepthFail : this.stencilGlobal.opDepthFail;
        this.opStencilDepthPass = stencilMaterialEnabled ? this.stencilMaterial.opStencilDepthPass : this.stencilGlobal.opStencilDepthPass;
        this.mask = stencilMaterialEnabled ? this.stencilMaterial.mask : this.stencilGlobal.mask;
    };
    return WebGPUStencilStateComposer;
}(StencilStateComposer));
export { WebGPUStencilStateComposer };
//# sourceMappingURL=webgpuStencilStateComposer.js.map