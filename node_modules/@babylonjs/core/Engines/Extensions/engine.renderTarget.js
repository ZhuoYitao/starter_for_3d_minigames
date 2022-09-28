import { __assign } from "tslib";
import { InternalTexture, InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { Logger } from "../../Misc/logger.js";
import { ThinEngine } from "../thinEngine.js";
import { WebGLRenderTargetWrapper } from "../WebGL/webGLRenderTargetWrapper.js";

ThinEngine.prototype._createHardwareRenderTargetWrapper = function (isMulti, isCube, size) {
    var rtWrapper = new WebGLRenderTargetWrapper(isMulti, isCube, size, this, this._gl);
    this._renderTargetWrapperCache.push(rtWrapper);
    return rtWrapper;
};
ThinEngine.prototype.createRenderTargetTexture = function (size, options) {
    var rtWrapper = this._createHardwareRenderTargetWrapper(false, false, size);
    var fullOptions = {};
    if (options !== undefined && typeof options === "object") {
        fullOptions.generateDepthBuffer = !!options.generateDepthBuffer;
        fullOptions.generateStencilBuffer = !!options.generateStencilBuffer;
        fullOptions.noColorTarget = !!options.noColorTarget;
    }
    else {
        fullOptions.generateDepthBuffer = true;
        fullOptions.generateStencilBuffer = false;
        fullOptions.noColorTarget = false;
    }
    var texture = fullOptions.noColorTarget ? null : this._createInternalTexture(size, options, true, InternalTextureSource.RenderTarget);
    var width = size.width || size;
    var height = size.height || size;
    var currentFrameBuffer = this._currentFramebuffer;
    var gl = this._gl;
    // Create the framebuffer
    var framebuffer = gl.createFramebuffer();
    this._bindUnboundFramebuffer(framebuffer);
    rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(fullOptions.generateStencilBuffer ? true : false, fullOptions.generateDepthBuffer, width, height);
    // No need to rebind on every frame
    if (texture && !texture.is2DArray) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._hardwareTexture.underlyingResource, 0);
    }
    this._bindUnboundFramebuffer(currentFrameBuffer);
    rtWrapper._framebuffer = framebuffer;
    rtWrapper._generateDepthBuffer = fullOptions.generateDepthBuffer;
    rtWrapper._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;
    rtWrapper.setTextures(texture);
    return rtWrapper;
};
ThinEngine.prototype.createDepthStencilTexture = function (size, options, rtWrapper) {
    if (options.isCube) {
        var width = size.width || size;
        return this._createDepthStencilCubeTexture(width, options, rtWrapper);
    }
    else {
        return this._createDepthStencilTexture(size, options, rtWrapper);
    }
};
ThinEngine.prototype._createDepthStencilTexture = function (size, options, rtWrapper) {
    var gl = this._gl;
    var layers = size.layers || 0;
    var target = layers !== 0 ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
    var internalTexture = new InternalTexture(this, InternalTextureSource.DepthStencil);
    if (!this._caps.depthTextureExtension) {
        Logger.Error("Depth texture is not supported by your browser or hardware.");
        return internalTexture;
    }
    var internalOptions = __assign({ bilinearFiltering: false, comparisonFunction: 0, generateStencil: false }, options);
    this._bindTextureDirectly(target, internalTexture, true);
    this._setupDepthStencilTexture(internalTexture, size, internalOptions.generateStencil, internalOptions.comparisonFunction === 0 ? false : internalOptions.bilinearFiltering, internalOptions.comparisonFunction);
    internalTexture.format = internalOptions.generateStencil ? 13 : 16;
    rtWrapper._depthStencilTexture = internalTexture;
    rtWrapper._depthStencilTextureWithStencil = internalOptions.generateStencil;
    var type = internalOptions.generateStencil ? gl.UNSIGNED_INT_24_8 : gl.UNSIGNED_INT;
    var internalFormat = internalOptions.generateStencil ? gl.DEPTH_STENCIL : gl.DEPTH_COMPONENT;
    var sizedFormat = internalFormat;
    if (this.webGLVersion > 1) {
        sizedFormat = internalOptions.generateStencil ? gl.DEPTH24_STENCIL8 : gl.DEPTH_COMPONENT24;
    }
    if (internalTexture.is2DArray) {
        gl.texImage3D(target, 0, sizedFormat, internalTexture.width, internalTexture.height, layers, 0, internalFormat, type, null);
    }
    else {
        gl.texImage2D(target, 0, sizedFormat, internalTexture.width, internalTexture.height, 0, internalFormat, type, null);
    }
    this._bindTextureDirectly(target, null);
    this._internalTexturesCache.push(internalTexture);
    return internalTexture;
};
ThinEngine.prototype.updateRenderTargetTextureSampleCount = function (rtWrapper, samples) {
    if (this.webGLVersion < 2 || !rtWrapper || !rtWrapper.texture) {
        return 1;
    }
    if (rtWrapper.samples === samples) {
        return samples;
    }
    var gl = this._gl;
    samples = Math.min(samples, this.getCaps().maxMSAASamples);
    // Dispose previous render buffers
    if (rtWrapper._depthStencilBuffer) {
        gl.deleteRenderbuffer(rtWrapper._depthStencilBuffer);
        rtWrapper._depthStencilBuffer = null;
    }
    if (rtWrapper._MSAAFramebuffer) {
        gl.deleteFramebuffer(rtWrapper._MSAAFramebuffer);
        rtWrapper._MSAAFramebuffer = null;
    }
    var hardwareTexture = rtWrapper.texture._hardwareTexture;
    if (hardwareTexture._MSAARenderBuffer) {
        gl.deleteRenderbuffer(hardwareTexture._MSAARenderBuffer);
        hardwareTexture._MSAARenderBuffer = null;
    }
    if (samples > 1 && gl.renderbufferStorageMultisample) {
        var framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            throw new Error("Unable to create multi sampled framebuffer");
        }
        rtWrapper._MSAAFramebuffer = framebuffer;
        this._bindUnboundFramebuffer(rtWrapper._MSAAFramebuffer);
        var colorRenderbuffer = this._createRenderBuffer(rtWrapper.texture.width, rtWrapper.texture.height, samples, -1 /* not used */, this._getRGBAMultiSampleBufferFormat(rtWrapper.texture.type), gl.COLOR_ATTACHMENT0, false);
        if (!colorRenderbuffer) {
            throw new Error("Unable to create multi sampled framebuffer");
        }
        hardwareTexture._MSAARenderBuffer = colorRenderbuffer;
    }
    else {
        this._bindUnboundFramebuffer(rtWrapper._framebuffer);
    }
    rtWrapper.texture.samples = samples;
    rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(rtWrapper._generateStencilBuffer, rtWrapper._generateDepthBuffer, rtWrapper.texture.width, rtWrapper.texture.height, samples);
    this._bindUnboundFramebuffer(null);
    return samples;
};
//# sourceMappingURL=engine.renderTarget.js.map