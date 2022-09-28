import { __assign, __extends, __spreadArray } from "tslib";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { WebXRLayerRenderTargetTextureProvider } from "../webXRRenderTargetTextureProvider.js";
import { WebXRLayerWrapper } from "../webXRLayerWrapper.js";
import { WebXRWebGLLayerWrapper } from "../webXRWebGLLayer.js";
/**
 * Wraps xr composition layers.
 * @hidden
 */
var WebXRCompositionLayerWrapper = /** @class */ (function (_super) {
    __extends(WebXRCompositionLayerWrapper, _super);
    function WebXRCompositionLayerWrapper(getWidth, getHeight, layer, layerType, isMultiview, createRTTProvider) {
        var _this = _super.call(this, getWidth, getHeight, layer, layerType, createRTTProvider) || this;
        _this.getWidth = getWidth;
        _this.getHeight = getHeight;
        _this.layer = layer;
        _this.layerType = layerType;
        _this.isMultiview = isMultiview;
        _this.createRTTProvider = createRTTProvider;
        return _this;
    }
    return WebXRCompositionLayerWrapper;
}(WebXRLayerWrapper));
export { WebXRCompositionLayerWrapper };
/**
 * Provides render target textures and other important rendering information for a given XRCompositionLayer.
 * @hidden
 */
var WebXRCompositionLayerRenderTargetTextureProvider = /** @class */ (function (_super) {
    __extends(WebXRCompositionLayerRenderTargetTextureProvider, _super);
    function WebXRCompositionLayerRenderTargetTextureProvider(_xrSessionManager, _xrWebGLBinding, layerWrapper) {
        var _this = _super.call(this, _xrSessionManager.scene, layerWrapper) || this;
        _this._xrSessionManager = _xrSessionManager;
        _this._xrWebGLBinding = _xrWebGLBinding;
        _this.layerWrapper = layerWrapper;
        _this._lastSubImages = new Map();
        _this._compositionLayer = layerWrapper.layer;
        return _this;
    }
    WebXRCompositionLayerRenderTargetTextureProvider.prototype._getRenderTargetForSubImage = function (subImage, eye) {
        var lastSubImage = this._lastSubImages.get(eye);
        var eyeIndex = eye == "left" ? 0 : 1;
        if (!this._renderTargetTextures[eyeIndex] || (lastSubImage === null || lastSubImage === void 0 ? void 0 : lastSubImage.textureWidth) !== subImage.textureWidth || (lastSubImage === null || lastSubImage === void 0 ? void 0 : lastSubImage.textureHeight) != subImage.textureHeight) {
            this._renderTargetTextures[eyeIndex] = this._createRenderTargetTexture(subImage.textureWidth, subImage.textureHeight, null, subImage.colorTexture, subImage.depthStencilTexture, this.layerWrapper.isMultiview);
            this._framebufferDimensions = {
                framebufferWidth: subImage.textureWidth,
                framebufferHeight: subImage.textureHeight,
            };
        }
        this._lastSubImages.set(eye, subImage);
        return this._renderTargetTextures[eyeIndex];
    };
    WebXRCompositionLayerRenderTargetTextureProvider.prototype._getSubImageForEye = function (eye) {
        var currentFrame = this._xrSessionManager.currentFrame;
        if (currentFrame) {
            return this._xrWebGLBinding.getSubImage(this._compositionLayer, currentFrame, eye);
        }
        return null;
    };
    WebXRCompositionLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForEye = function (eye) {
        var subImage = this._getSubImageForEye(eye);
        if (subImage) {
            return this._getRenderTargetForSubImage(subImage, eye);
        }
        return null;
    };
    WebXRCompositionLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForView = function (view) {
        return this.getRenderTargetTextureForEye(view.eye);
    };
    WebXRCompositionLayerRenderTargetTextureProvider.prototype._setViewportForSubImage = function (viewport, subImage) {
        var textureWidth = subImage.textureWidth;
        var textureHeight = subImage.textureHeight;
        var xrViewport = subImage.viewport;
        viewport.x = xrViewport.x / textureWidth;
        viewport.y = xrViewport.y / textureHeight;
        viewport.width = xrViewport.width / textureWidth;
        viewport.height = xrViewport.height / textureHeight;
    };
    WebXRCompositionLayerRenderTargetTextureProvider.prototype.trySetViewportForView = function (viewport, view) {
        var subImage = this._lastSubImages.get(view.eye) || this._getSubImageForEye(view.eye);
        if (subImage) {
            this._setViewportForSubImage(viewport, subImage);
            return true;
        }
        return false;
    };
    return WebXRCompositionLayerRenderTargetTextureProvider;
}(WebXRLayerRenderTargetTextureProvider));
/**
 * Wraps xr projection layers.
 * @hidden
 */
var WebXRProjectionLayerWrapper = /** @class */ (function (_super) {
    __extends(WebXRProjectionLayerWrapper, _super);
    function WebXRProjectionLayerWrapper(layer, isMultiview, xrGLBinding) {
        var _this = _super.call(this, function () { return layer.textureWidth; }, function () { return layer.textureHeight; }, layer, "XRProjectionLayer", isMultiview, function (sessionManager) { return new WebXRProjectionLayerRenderTargetTextureProvider(sessionManager, xrGLBinding, _this); }) || this;
        _this.layer = layer;
        return _this;
    }
    return WebXRProjectionLayerWrapper;
}(WebXRCompositionLayerWrapper));
export { WebXRProjectionLayerWrapper };
/**
 * Provides render target textures and other important rendering information for a given XRProjectionLayer.
 * @hidden
 */
var WebXRProjectionLayerRenderTargetTextureProvider = /** @class */ (function (_super) {
    __extends(WebXRProjectionLayerRenderTargetTextureProvider, _super);
    function WebXRProjectionLayerRenderTargetTextureProvider(_xrSessionManager, _xrWebGLBinding, layerWrapper) {
        var _this = _super.call(this, _xrSessionManager, _xrWebGLBinding, layerWrapper) || this;
        _this.layerWrapper = layerWrapper;
        _this._projectionLayer = layerWrapper.layer;
        return _this;
    }
    WebXRProjectionLayerRenderTargetTextureProvider.prototype._getSubImageForView = function (view) {
        return this._xrWebGLBinding.getViewSubImage(this._projectionLayer, view);
    };
    WebXRProjectionLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForView = function (view) {
        return this._getRenderTargetForSubImage(this._getSubImageForView(view), view.eye);
    };
    WebXRProjectionLayerRenderTargetTextureProvider.prototype.getRenderTargetTextureForEye = function (eye) {
        var lastSubImage = this._lastSubImages.get(eye);
        if (lastSubImage) {
            return this._getRenderTargetForSubImage(lastSubImage, eye);
        }
        return null;
    };
    WebXRProjectionLayerRenderTargetTextureProvider.prototype.trySetViewportForView = function (viewport, view) {
        var subImage = this._lastSubImages.get(view.eye) || this._getSubImageForView(view);
        if (subImage) {
            this._setViewportForSubImage(viewport, subImage);
            return true;
        }
        return false;
    };
    return WebXRProjectionLayerRenderTargetTextureProvider;
}(WebXRCompositionLayerRenderTargetTextureProvider));
var defaultXRWebGLLayerInit = {};
var defaultXRProjectionLayerInit = {
    textureType: "texture",
    colorFormat: 0x1908 /* WebGLRenderingContext.RGBA */,
    depthFormat: 0x88f0 /* WebGLRenderingContext.DEPTH24_STENCIL8 */,
    scaleFactor: 1.0,
};
/**
 * Exposes the WebXR Layers API.
 */
var WebXRLayers = /** @class */ (function (_super) {
    __extends(WebXRLayers, _super);
    function WebXRLayers(_xrSessionManager, _options) {
        if (_options === void 0) { _options = {}; }
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        /**
         * Already-created layers
         */
        _this._existingLayers = [];
        _this.xrNativeFeatureName = "layers";
        return _this;
    }
    /**
     * Attach this feature.
     * Will usually be called by the features manager.
     *
     * @returns true if successful.
     */
    WebXRLayers.prototype.attach = function () {
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        var engine = this._xrSessionManager.scene.getEngine();
        this._glContext = engine._gl;
        this._xrWebGLBinding = new XRWebGLBinding(this._xrSessionManager.session, this._glContext);
        this._existingLayers = [];
        var projectionLayerInit = __assign({}, defaultXRProjectionLayerInit);
        var projectionLayerMultiview = this._options.preferMultiviewOnInit && engine.getCaps().multiview;
        if (projectionLayerMultiview) {
            projectionLayerInit.textureType = "texture-array";
        }
        this.addXRSessionLayer(this.createProjectionLayer(projectionLayerInit, projectionLayerMultiview));
        return true;
    };
    WebXRLayers.prototype.detach = function () {
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        this._existingLayers.length = 0;
        return true;
    };
    /**
     * Creates a new XRWebGLLayer.
     * @param params an object providing configuration options for the new XRWebGLLayer
     * @returns the XRWebGLLayer
     */
    WebXRLayers.prototype.createXRWebGLLayer = function (params) {
        if (params === void 0) { params = defaultXRWebGLLayerInit; }
        var layer = new XRWebGLLayer(this._xrSessionManager.session, this._glContext, params);
        return new WebXRWebGLLayerWrapper(layer);
    };
    /**
     * Creates a new XRProjectionLayer.
     * @param params an object providing configuration options for the new XRProjectionLayer.
     * @param multiview whether the projection layer should render with multiview.
     * @returns the projection layer
     */
    WebXRLayers.prototype.createProjectionLayer = function (params, multiview) {
        if (params === void 0) { params = defaultXRProjectionLayerInit; }
        if (multiview === void 0) { multiview = false; }
        if (multiview && params.textureType !== "texture-array") {
            throw new Error("Projection layers can only be made multiview if they use texture arrays. Set the textureType parameter to 'texture-array'.");
        }
        // TODO (rgerd): Support RTT's that are bound to sub-images in the texture array.
        if (!multiview && params.textureType === "texture-array") {
            throw new Error("We currently only support multiview rendering when the textureType parameter is set to 'texture-array'.");
        }
        var projLayer = this._xrWebGLBinding.createProjectionLayer(params);
        return new WebXRProjectionLayerWrapper(projLayer, multiview, this._xrWebGLBinding);
    };
    /**
     * Add a new layer to the already-existing list of layers
     * @param wrappedLayer the new layer to add to the existing ones
     */
    WebXRLayers.prototype.addXRSessionLayer = function (wrappedLayer) {
        this.setXRSessionLayers(__spreadArray(__spreadArray([], this._existingLayers, true), [wrappedLayer], false));
    };
    /**
     * Sets the layers to be used by the XR session.
     * Note that you must call this function with any layers you wish to render to
     * since it adds them to the XR session's render state
     * (replacing any layers that were added in a previous call to setXRSessionLayers or updateRenderState).
     * This method also sets up the session manager's render target texture provider
     * as the first layer in the array, which feeds the WebXR camera(s) attached to the session.
     * @param wrappedLayers An array of WebXRLayerWrapper, usually returned from the WebXRLayers createLayer functions.
     */
    WebXRLayers.prototype.setXRSessionLayers = function (wrappedLayers) {
        this._existingLayers = wrappedLayers;
        var renderStateInit = __assign({}, this._xrSessionManager.session.renderState);
        // Clear out the layer-related fields.
        renderStateInit.baseLayer = undefined;
        renderStateInit.layers = wrappedLayers.map(function (wrappedLayer) { return wrappedLayer.layer; });
        this._xrSessionManager.updateRenderState(renderStateInit);
        this._xrSessionManager._setBaseLayerWrapper(wrappedLayers.length > 0 ? wrappedLayers[0] : null);
    };
    WebXRLayers.prototype.isCompatible = function () {
        // TODO (rgerd): Add native support.
        return !this._xrSessionManager.isNative && typeof XRWebGLBinding !== "undefined" && !!XRWebGLBinding.prototype.createProjectionLayer;
    };
    /**
     * Dispose this feature and all of the resources attached.
     */
    WebXRLayers.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    WebXRLayers.prototype._onXRFrame = function (_xrFrame) {
        /* empty */
    };
    /**
     * The module's name
     */
    WebXRLayers.Name = WebXRFeatureName.LAYERS;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRLayers.Version = 1;
    return WebXRLayers;
}(WebXRAbstractFeature));
export { WebXRLayers };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRLayers.Name, function (xrSessionManager, options) {
    return function () { return new WebXRLayers(xrSessionManager, options); };
}, WebXRLayers.Version, false);
//# sourceMappingURL=WebXRLayers.js.map