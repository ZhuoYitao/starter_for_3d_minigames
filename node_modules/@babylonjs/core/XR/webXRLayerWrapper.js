/**
 * Wrapper over subclasses of XRLayer.
 * @hidden
 */
var WebXRLayerWrapper = /** @class */ (function () {
    function WebXRLayerWrapper(
    /** The width of the layer's framebuffer. */
    getWidth, 
    /** The height of the layer's framebuffer. */
    getHeight, 
    /** The XR layer that this WebXRLayerWrapper wraps. */
    layer, 
    /** The type of XR layer that is being wrapped. */
    layerType, 
    /** Create a render target provider for the wrapped layer. */
    createRenderTargetTextureProvider) {
        this.getWidth = getWidth;
        this.getHeight = getHeight;
        this.layer = layer;
        this.layerType = layerType;
        this.createRenderTargetTextureProvider = createRenderTargetTextureProvider;
    }
    Object.defineProperty(WebXRLayerWrapper.prototype, "isFixedFoveationSupported", {
        /**
         * Check if fixed foveation is supported on this device
         */
        get: function () {
            return this.layerType == "XRWebGLLayer" && typeof this.layer.fixedFoveation == "number";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRLayerWrapper.prototype, "fixedFoveation", {
        /**
         * Get the fixed foveation currently set, as specified by the webxr specs
         * If this returns null, then fixed foveation is not supported
         */
        get: function () {
            if (this.isFixedFoveationSupported) {
                return this.layer.fixedFoveation;
            }
            return null;
        },
        /**
         * Set the fixed foveation to the specified value, as specified by the webxr specs
         * This value will be normalized to be between 0 and 1, 1 being max foveation, 0 being no foveation
         */
        set: function (value) {
            if (this.isFixedFoveationSupported) {
                var val = Math.max(0, Math.min(1, value || 0));
                this.layer.fixedFoveation = val;
            }
        },
        enumerable: false,
        configurable: true
    });
    return WebXRLayerWrapper;
}());
export { WebXRLayerWrapper };
//# sourceMappingURL=webXRLayerWrapper.js.map