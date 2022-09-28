import { __extends } from "tslib";
import { WebXRLayerWrapper } from "./webXRLayerWrapper.js";
import { WebXRLayerRenderTargetTextureProvider } from "./webXRRenderTargetTextureProvider.js";
/**
 * Wraps xr webgl layers.
 * @hidden
 */
var WebXRWebGLLayerWrapper = /** @class */ (function (_super) {
    __extends(WebXRWebGLLayerWrapper, _super);
    /**
     * @param layer is the layer to be wrapped.
     * @returns a new WebXRLayerWrapper wrapping the provided XRWebGLLayer.
     */
    function WebXRWebGLLayerWrapper(layer) {
        var _this = _super.call(this, function () { return layer.framebufferWidth; }, function () { return layer.framebufferHeight; }, layer, "XRWebGLLayer", function (sessionManager) { return new WebXRWebGLLayerRenderTargetTextureProvider(sessionManager.scene, _this); }) || this;
        _this.layer = layer;
        return _this;
    }
    return WebXRWebGLLayerWrapper;
}(WebXRLayerWrapper));
export { WebXRWebGLLayerWrapper };
/**
 * Provides render target textures and other important rendering information for a given XRWebGLLayer.
 * @hidden
 */
var WebXRWebGLLayerRenderTargetTextureProvider = /** @class */ (function (_super) {
    __extends(WebXRWebGLLayerRenderTargetTextureProvider, _super);
    function WebXRWebGLLayerRenderTargetTextureProvider(scene, layerWrapper) {
        var _this = _super.call(this, scene, layerWrapper) || this;
        _this.layerWrapper = layerWrapper;
        _this._layer = layerWrapper.layer;
        _this._framebufferDimensions = {
            framebufferWidth: _this._layer.framebufferWidth,
            framebufferHeight: _this._layer.framebufferHeight,
        };
        return _this;
    }
    WebXRWebGLLayerRenderTargetTextureProvider.prototype.trySetViewportForView = function (viewport, view) {
        var xrViewport = this._layer.getViewport(view);
        var framebufferWidth = this._framebufferDimensions.framebufferWidth;
        var framebufferHeight = this._framebufferDimensions.framebufferHeight;
        viewport.x = xrViewport.x / framebufferWidth;
        viewport.y = xrViewport.y / framebufferHeight;
        viewport.width = xrViewport.width / framebufferWidth;
        viewport.height = xrViewport.height / framebufferHeight;
        return true;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebXRWebGLLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForEye = function (eye) {
        var layerWidth = this._layer.framebufferWidth;
        var layerHeight = this._layer.framebufferHeight;
        var framebuffer = this._layer.framebuffer;
        if (!this._rtt ||
            layerWidth !== this._framebufferDimensions.framebufferWidth ||
            layerHeight !== this._framebufferDimensions.framebufferHeight ||
            framebuffer !== this._framebuffer) {
            this._rtt = this._createRenderTargetTexture(layerWidth, layerHeight, framebuffer);
            this._framebufferDimensions.framebufferWidth = layerWidth;
            this._framebufferDimensions.framebufferHeight = layerHeight;
            this._framebuffer = framebuffer;
        }
        return this._rtt;
    };
    WebXRWebGLLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForView = function (view) {
        return this.getRenderTargetTextureForEye(view.eye);
    };
    return WebXRWebGLLayerRenderTargetTextureProvider;
}(WebXRLayerRenderTargetTextureProvider));
export { WebXRWebGLLayerRenderTargetTextureProvider };
//# sourceMappingURL=webXRWebGLLayer.js.map