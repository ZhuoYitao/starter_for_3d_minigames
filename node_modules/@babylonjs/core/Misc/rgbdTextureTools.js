
import { PostProcess } from "../PostProcesses/postProcess.js";
import "../Shaders/rgbdDecode.fragment.js";
import "../Engines/Extensions/engine.renderTarget.js";
import { ApplyPostProcess } from "./textureTools.js";
/**
 * Class used to host RGBD texture specific utilities
 */
var RGBDTextureTools = /** @class */ (function () {
    function RGBDTextureTools() {
    }
    /**
     * Expand the RGBD Texture from RGBD to Half Float if possible.
     * @param texture the texture to expand.
     */
    RGBDTextureTools.ExpandRGBDTexture = function (texture) {
        var internalTexture = texture._texture;
        if (!internalTexture || !texture.isRGBD) {
            return;
        }
        // Gets everything ready.
        var engine = internalTexture.getEngine();
        var caps = engine.getCaps();
        var isReady = internalTexture.isReady;
        var expandTexture = false;
        // If half float available we can uncompress the texture
        if (caps.textureHalfFloatRender && caps.textureHalfFloatLinearFiltering) {
            expandTexture = true;
            internalTexture.type = 2;
        }
        // If full float available we can uncompress the texture
        else if (caps.textureFloatRender && caps.textureFloatLinearFiltering) {
            expandTexture = true;
            internalTexture.type = 1;
        }
        if (expandTexture) {
            // Do not use during decode.
            internalTexture.isReady = false;
            internalTexture._isRGBD = false;
            internalTexture.invertY = false;
        }
        var expandRGBDTexture = function () {
            // Expand the texture if possible
            if (expandTexture) {
                // Simply run through the decode PP.
                var rgbdPostProcess_1 = new PostProcess("rgbdDecode", "rgbdDecode", null, null, 1, null, 3, engine, false, undefined, internalTexture.type, undefined, null, false);
                rgbdPostProcess_1.externalTextureSamplerBinding = true;
                // Hold the output of the decoding.
                var expandedTexture_1 = engine.createRenderTargetTexture(internalTexture.width, {
                    generateDepthBuffer: false,
                    generateMipMaps: false,
                    generateStencilBuffer: false,
                    samplingMode: internalTexture.samplingMode,
                    type: internalTexture.type,
                    format: 5,
                });
                rgbdPostProcess_1.getEffect().executeWhenCompiled(function () {
                    // PP Render Pass
                    rgbdPostProcess_1.onApply = function (effect) {
                        effect._bindTexture("textureSampler", internalTexture);
                        effect.setFloat2("scale", 1, 1);
                    };
                    texture.getScene().postProcessManager.directRender([rgbdPostProcess_1], expandedTexture_1, true);
                    // Cleanup
                    engine.restoreDefaultFramebuffer();
                    engine._releaseTexture(internalTexture);
                    if (rgbdPostProcess_1) {
                        rgbdPostProcess_1.dispose();
                    }
                    // Internal Swap
                    expandedTexture_1._swapAndDie(internalTexture);
                    // Ready to get rolling again.
                    internalTexture.isReady = true;
                });
            }
        };
        if (isReady) {
            expandRGBDTexture();
        }
        else {
            texture.onLoadObservable.addOnce(expandRGBDTexture);
        }
    };
    /**
     * Encode the texture to RGBD if possible.
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param outputTextureType type of the texture in which the encoding is performed
     * @return a promise with the internalTexture having its texture replaced by the result of the processing
     */
    RGBDTextureTools.EncodeTextureToRGBD = function (internalTexture, scene, outputTextureType) {
        if (outputTextureType === void 0) { outputTextureType = 0; }
        return ApplyPostProcess("rgbdEncode", internalTexture, scene, outputTextureType, 1, 5);
    };
    return RGBDTextureTools;
}());
export { RGBDTextureTools };
//# sourceMappingURL=rgbdTextureTools.js.map