import { __awaiter, __extends, __generator } from "tslib";
import { WebXRLayerWrapper } from "../webXRLayerWrapper.js";
import { WebXRLayerRenderTargetTextureProvider } from "../webXRRenderTargetTextureProvider.js";
/**
 * Wraps XRWebGLLayer's created by Babylon Native.
 * @hidden
 */
var NativeXRLayerWrapper = /** @class */ (function (_super) {
    __extends(NativeXRLayerWrapper, _super);
    function NativeXRLayerWrapper(layer) {
        var _this = _super.call(this, function () { return layer.framebufferWidth; }, function () { return layer.framebufferHeight; }, layer, "XRWebGLLayer", function (sessionManager) { return new NativeXRLayerRenderTargetTextureProvider(sessionManager, _this); }) || this;
        _this.layer = layer;
        return _this;
    }
    return NativeXRLayerWrapper;
}(WebXRLayerWrapper));
export { NativeXRLayerWrapper };
/**
 * Provides render target textures for layers created by Babylon Native.
 * @hidden
 */
var NativeXRLayerRenderTargetTextureProvider = /** @class */ (function (_super) {
    __extends(NativeXRLayerRenderTargetTextureProvider, _super);
    function NativeXRLayerRenderTargetTextureProvider(sessionManager, layerWrapper) {
        var _this = _super.call(this, sessionManager.scene, layerWrapper) || this;
        _this.layerWrapper = layerWrapper;
        _this._nativeRTTProvider = navigator.xr.getNativeRenderTargetProvider(sessionManager.session, _this._createRenderTargetTexture.bind(_this), _this._destroyRenderTargetTexture.bind(_this));
        _this._nativeLayer = layerWrapper.layer;
        return _this;
    }
    NativeXRLayerRenderTargetTextureProvider.prototype.trySetViewportForView = function (viewport) {
        viewport.x = 0;
        viewport.y = 0;
        viewport.width = 1;
        viewport.height = 1;
        return true;
    };
    NativeXRLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForEye = function (eye) {
        // TODO (rgerd): Update the contract on the BabylonNative side to call this "getRenderTargetTextureForEye"
        return this._nativeRTTProvider.getRenderTargetForEye(eye);
    };
    NativeXRLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForView = function (view) {
        return this._nativeRTTProvider.getRenderTargetForEye(view.eye);
    };
    NativeXRLayerRenderTargetTextureProvider.prototype.getFramebufferDimensions = function () {
        return {
            framebufferWidth: this._nativeLayer.framebufferWidth,
            framebufferHeight: this._nativeLayer.framebufferHeight,
        };
    };
    return NativeXRLayerRenderTargetTextureProvider;
}(WebXRLayerRenderTargetTextureProvider));
export { NativeXRLayerRenderTargetTextureProvider };
/**
 * Creates the xr layer that will be used as the xr session's base layer.
 * @hidden
 */
var NativeXRRenderTarget = /** @class */ (function () {
    function NativeXRRenderTarget(_xrSessionManager) {
        this._nativeRenderTarget = navigator.xr.getWebXRRenderTarget(_xrSessionManager.scene.getEngine());
    }
    NativeXRRenderTarget.prototype.initializeXRLayerAsync = function (xrSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._nativeRenderTarget.initializeXRLayerAsync(xrSession)];
                    case 1:
                        _a.sent();
                        this.xrLayer = this._nativeRenderTarget.xrLayer;
                        return [2 /*return*/, this.xrLayer];
                }
            });
        });
    };
    NativeXRRenderTarget.prototype.dispose = function () {
        /* empty */
    };
    return NativeXRRenderTarget;
}());
export { NativeXRRenderTarget };
//# sourceMappingURL=nativeXRRenderTarget.js.map