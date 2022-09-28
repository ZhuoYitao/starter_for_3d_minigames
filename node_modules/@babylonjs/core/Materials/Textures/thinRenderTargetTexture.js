import { __extends } from "tslib";
import { ThinTexture } from "./thinTexture.js";
/**
 * This is a tiny helper class to wrap a RenderTargetWrapper in a texture
 * usable as the input of an effect.
 */
var ThinRenderTargetTexture = /** @class */ (function (_super) {
    __extends(ThinRenderTargetTexture, _super);
    /**
     * Instantiates a new ThinRenderTargetTexture.
     * Tiny helper class to wrap a RenderTargetWrapper in a texture.
     * This can be used as an internal texture wrapper in ThinEngine to benefit from the cache and to hold on the associated RTT
     * @param engine Define the internalTexture to wrap
     * @param size Define the size of the RTT to create
     * @param options Define rendertarget options
     */
    function ThinRenderTargetTexture(engine, size, options) {
        var _this = _super.call(this, null) || this;
        _this._renderTarget = null;
        _this._engine = engine;
        _this._renderTargetOptions = options;
        _this.resize(size);
        return _this;
    }
    Object.defineProperty(ThinRenderTargetTexture.prototype, "renderTarget", {
        /**
         * Gets the render target wrapper associated with this render target
         */
        get: function () {
            return this._renderTarget;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Resize the texture to a new desired size.
     * Be careful as it will recreate all the data in the new texture.
     * @param size Define the new size. It can be:
     *   - a number for squared texture,
     *   - an object containing { width: number, height: number }
     */
    ThinRenderTargetTexture.prototype.resize = function (size) {
        var _a;
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.dispose();
        this._renderTarget = null;
        this._texture = null;
        this._size = size;
        if (this._engine) {
            this._renderTarget = this._engine.createRenderTargetTexture(this._size, this._renderTargetOptions);
        }
        this._texture = this.renderTarget.texture;
    };
    /**
     * Get the underlying lower level texture from Babylon.
     * @returns the internal texture
     */
    ThinRenderTargetTexture.prototype.getInternalTexture = function () {
        return this._texture;
    };
    /**
     * Get the class name of the texture.
     * @returns "ThinRenderTargetTexture"
     */
    ThinRenderTargetTexture.prototype.getClassName = function () {
        return "ThinRenderTargetTexture";
    };
    /**
     * Dispose the texture and release its associated resources.
     * @param disposeOnlyFramebuffers
     */
    ThinRenderTargetTexture.prototype.dispose = function (disposeOnlyFramebuffers) {
        var _a;
        if (disposeOnlyFramebuffers === void 0) { disposeOnlyFramebuffers = false; }
        (_a = this._renderTarget) === null || _a === void 0 ? void 0 : _a.dispose(true);
        this._renderTarget = null;
        if (!disposeOnlyFramebuffers) {
            this.dispose();
        }
    };
    return ThinRenderTargetTexture;
}(ThinTexture));
export { ThinRenderTargetTexture };
//# sourceMappingURL=thinRenderTargetTexture.js.map