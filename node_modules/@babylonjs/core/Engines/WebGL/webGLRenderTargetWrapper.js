import { __extends } from "tslib";
import { RenderTargetWrapper } from "../renderTargetWrapper.js";
/** @hidden */
var WebGLRenderTargetWrapper = /** @class */ (function (_super) {
    __extends(WebGLRenderTargetWrapper, _super);
    function WebGLRenderTargetWrapper(isMulti, isCube, size, engine, context) {
        var _this = _super.call(this, isMulti, isCube, size, engine) || this;
        _this._framebuffer = null;
        _this._depthStencilBuffer = null;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _this._MSAAFramebuffer = null;
        // Multiview
        _this._colorTextureArray = null;
        _this._depthStencilTextureArray = null;
        _this._context = context;
        return _this;
    }
    WebGLRenderTargetWrapper.prototype._cloneRenderTargetWrapper = function () {
        var rtw = null;
        if (this._colorTextureArray && this._depthStencilTextureArray) {
            rtw = this._engine.createMultiviewRenderTargetTexture(this.width, this.height);
            rtw.texture.isReady = true;
        }
        else {
            rtw = _super.prototype._cloneRenderTargetWrapper.call(this);
        }
        return rtw;
    };
    WebGLRenderTargetWrapper.prototype._swapRenderTargetWrapper = function (target) {
        _super.prototype._swapRenderTargetWrapper.call(this, target);
        target._framebuffer = this._framebuffer;
        target._depthStencilBuffer = this._depthStencilBuffer;
        target._MSAAFramebuffer = this._MSAAFramebuffer;
        target._colorTextureArray = this._colorTextureArray;
        target._depthStencilTextureArray = this._depthStencilTextureArray;
        this._framebuffer = this._depthStencilBuffer = this._MSAAFramebuffer = this._colorTextureArray = this._depthStencilTextureArray = null;
    };
    /**
     * Shares the depth buffer of this render target with another render target.
     * @hidden
     * @param renderTarget Destination renderTarget
     */
    WebGLRenderTargetWrapper.prototype._shareDepth = function (renderTarget) {
        _super.prototype._shareDepth.call(this, renderTarget);
        var gl = this._context;
        var depthbuffer = this._depthStencilBuffer;
        var framebuffer = renderTarget._framebuffer;
        if (renderTarget._depthStencilBuffer) {
            gl.deleteRenderbuffer(renderTarget._depthStencilBuffer);
        }
        renderTarget._depthStencilBuffer = this._depthStencilBuffer;
        this._engine._bindUnboundFramebuffer(framebuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer);
        this._engine._bindUnboundFramebuffer(null);
    };
    /**
     * Binds a texture to this render target on a specific attachment
     * @param texture The texture to bind to the framebuffer
     * @param attachmentIndex Index of the attachment
     * @param faceIndex The face of the texture to render to in case of cube texture
     * @param lodLevel defines the lod level to bind to the frame buffer
     */
    WebGLRenderTargetWrapper.prototype._bindTextureRenderTarget = function (texture, attachmentIndex, faceIndex, lodLevel) {
        if (attachmentIndex === void 0) { attachmentIndex = 0; }
        if (faceIndex === void 0) { faceIndex = -1; }
        if (lodLevel === void 0) { lodLevel = 0; }
        if (!texture._hardwareTexture) {
            return;
        }
        var gl = this._context;
        var framebuffer = this._framebuffer;
        var currentFB = this._engine._currentFramebuffer;
        this._engine._bindUnboundFramebuffer(framebuffer);
        var attachment = gl[this._engine.webGLVersion > 1 ? "COLOR_ATTACHMENT" + attachmentIndex : "COLOR_ATTACHMENT" + attachmentIndex + "_WEBGL"];
        var target = faceIndex !== -1 ? gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex : gl.TEXTURE_2D;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, target, texture._hardwareTexture.underlyingResource, lodLevel);
        this._engine._bindUnboundFramebuffer(currentFB);
    };
    /**
     * Set a texture in the textures array
     * @param texture the texture to set
     * @param index the index in the textures array to set
     * @param disposePrevious If this function should dispose the previous texture
     */
    WebGLRenderTargetWrapper.prototype.setTexture = function (texture, index, disposePrevious) {
        if (index === void 0) { index = 0; }
        if (disposePrevious === void 0) { disposePrevious = true; }
        _super.prototype.setTexture.call(this, texture, index, disposePrevious);
        this._bindTextureRenderTarget(texture, index);
    };
    WebGLRenderTargetWrapper.prototype.dispose = function (disposeOnlyFramebuffers) {
        if (disposeOnlyFramebuffers === void 0) { disposeOnlyFramebuffers = false; }
        var gl = this._context;
        if (!disposeOnlyFramebuffers) {
            if (this._colorTextureArray) {
                this._context.deleteTexture(this._colorTextureArray);
                this._colorTextureArray = null;
            }
            if (this._depthStencilTextureArray) {
                this._context.deleteTexture(this._depthStencilTextureArray);
                this._depthStencilTextureArray = null;
            }
        }
        if (this._framebuffer) {
            gl.deleteFramebuffer(this._framebuffer);
            this._framebuffer = null;
        }
        if (this._depthStencilBuffer) {
            gl.deleteRenderbuffer(this._depthStencilBuffer);
            this._depthStencilBuffer = null;
        }
        if (this._MSAAFramebuffer) {
            gl.deleteFramebuffer(this._MSAAFramebuffer);
            this._MSAAFramebuffer = null;
        }
        _super.prototype.dispose.call(this, disposeOnlyFramebuffers);
    };
    return WebGLRenderTargetWrapper;
}(RenderTargetWrapper));
export { WebGLRenderTargetWrapper };
//# sourceMappingURL=webGLRenderTargetWrapper.js.map