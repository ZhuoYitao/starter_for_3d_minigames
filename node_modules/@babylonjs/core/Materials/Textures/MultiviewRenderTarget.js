import { __extends } from "tslib";
import { RenderTargetTexture } from "../Textures/renderTargetTexture.js";

/**
 * Renders to multiple views with a single draw call
 * @see https://www.khronos.org/registry/webgl/extensions/OVR_multiview2/
 */
var MultiviewRenderTarget = /** @class */ (function (_super) {
    __extends(MultiviewRenderTarget, _super);
    /**
     * Creates a multiview render target
     * @param scene scene used with the render target
     * @param size the size of the render target (used for each view)
     */
    function MultiviewRenderTarget(scene, size) {
        if (size === void 0) { size = 512; }
        var _this = _super.call(this, "multiview rtt", size, scene, false, true, 0, false, undefined, false, false, true, undefined, true) || this;
        _this._renderTarget = _this.getScene().getEngine().createMultiviewRenderTargetTexture(_this.getRenderWidth(), _this.getRenderHeight());
        _this._texture = _this._renderTarget.texture;
        _this._texture.isMultiview = true;
        _this._texture.format = 5;
        _this.samples = _this._getEngine().getCaps().maxSamples || _this.samples;
        _this._texture.samples = _this._samples;
        return _this;
    }
    Object.defineProperty(MultiviewRenderTarget.prototype, "samples", {
        set: function (value) {
            // We override this setter because multisampling is handled by framebufferTextureMultisampleMultiviewOVR
            this._samples = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @hidden
     */
    MultiviewRenderTarget.prototype._bindFrameBuffer = function () {
        if (!this._renderTarget) {
            return;
        }
        this.getScene().getEngine().bindMultiviewFramebuffer(this._renderTarget);
    };
    /**
     * Gets the number of views the corresponding to the texture (eg. a MultiviewRenderTarget will have > 1)
     * @returns the view count
     */
    MultiviewRenderTarget.prototype.getViewCount = function () {
        return 2;
    };
    return MultiviewRenderTarget;
}(RenderTargetTexture));
export { MultiviewRenderTarget };
//# sourceMappingURL=MultiviewRenderTarget.js.map