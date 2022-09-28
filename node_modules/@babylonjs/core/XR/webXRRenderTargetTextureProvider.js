import { WebGLHardwareTexture } from "../Engines/WebGL/webGLHardwareTexture.js";
import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture.js";
import { MultiviewRenderTarget } from "../Materials/Textures/MultiviewRenderTarget.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
/**
 * Provides render target textures and other important rendering information for a given XRLayer.
 * @hidden
 */
var WebXRLayerRenderTargetTextureProvider = /** @class */ (function () {
    function WebXRLayerRenderTargetTextureProvider(_scene, layerWrapper) {
        this._scene = _scene;
        this.layerWrapper = layerWrapper;
        this._renderTargetTextures = new Array();
        this._engine = _scene.getEngine();
    }
    WebXRLayerRenderTargetTextureProvider.prototype._createInternalTexture = function (textureSize, texture) {
        var internalTexture = new InternalTexture(this._engine, InternalTextureSource.Unknown, true);
        internalTexture.width = textureSize.width;
        internalTexture.height = textureSize.height;
        internalTexture._hardwareTexture = new WebGLHardwareTexture(texture, this._engine._gl);
        internalTexture.isReady = true;
        return internalTexture;
    };
    WebXRLayerRenderTargetTextureProvider.prototype._createRenderTargetTexture = function (width, height, framebuffer, colorTexture, depthStencilTexture, multiview) {
        if (!this._engine) {
            throw new Error("Engine is disposed");
        }
        var textureSize = { width: width, height: height };
        // Create render target texture from the internal texture
        var renderTargetTexture = multiview ? new MultiviewRenderTarget(this._scene, textureSize) : new RenderTargetTexture("XR renderTargetTexture", textureSize, this._scene);
        var renderTargetWrapper = renderTargetTexture.renderTarget;
        // Set the framebuffer, make sure it works in all scenarios - emulator, no layers and layers
        if (framebuffer || !colorTexture) {
            renderTargetWrapper._framebuffer = framebuffer;
        }
        // Create internal texture
        if (colorTexture) {
            if (multiview) {
                renderTargetWrapper._colorTextureArray = colorTexture;
            }
            else {
                var internalTexture = this._createInternalTexture(textureSize, colorTexture);
                renderTargetWrapper.setTexture(internalTexture, 0);
                renderTargetTexture._texture = internalTexture;
            }
        }
        if (depthStencilTexture) {
            if (multiview) {
                renderTargetWrapper._depthStencilTextureArray = depthStencilTexture;
            }
            else {
                renderTargetWrapper._depthStencilTexture = this._createInternalTexture(textureSize, depthStencilTexture);
            }
        }
        renderTargetTexture.disableRescaling();
        // Firefox reality fails if skipInitialClear is set to true, so make sure only modern XR implementations set it.
        if (typeof XRWebGLBinding !== "undefined") {
            // WebXR pre-clears textures
            renderTargetTexture.skipInitialClear = true;
        }
        this._renderTargetTextures.push(renderTargetTexture);
        return renderTargetTexture;
    };
    WebXRLayerRenderTargetTextureProvider.prototype._destroyRenderTargetTexture = function (renderTargetTexture) {
        this._renderTargetTextures.splice(this._renderTargetTextures.indexOf(renderTargetTexture), 1);
        renderTargetTexture.dispose();
    };
    WebXRLayerRenderTargetTextureProvider.prototype.getFramebufferDimensions = function () {
        return this._framebufferDimensions;
    };
    WebXRLayerRenderTargetTextureProvider.prototype.dispose = function () {
        this._renderTargetTextures.forEach(function (rtt) { return rtt.dispose(); });
        this._renderTargetTextures.length = 0;
    };
    return WebXRLayerRenderTargetTextureProvider;
}());
export { WebXRLayerRenderTargetTextureProvider };
//# sourceMappingURL=webXRRenderTargetTextureProvider.js.map