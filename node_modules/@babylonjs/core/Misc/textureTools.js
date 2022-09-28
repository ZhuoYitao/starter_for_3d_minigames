import { Texture } from "../Materials/Textures/texture.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { PassPostProcess } from "../PostProcesses/passPostProcess.js";

import { PostProcess } from "../PostProcesses/postProcess.js";
/**
 * Uses the GPU to create a copy texture rescaled at a given size
 * @param texture Texture to copy from
 * @param width defines the desired width
 * @param height defines the desired height
 * @param useBilinearMode defines if bilinear mode has to be used
 * @return the generated texture
 */
export function CreateResizedCopy(texture, width, height, useBilinearMode) {
    if (useBilinearMode === void 0) { useBilinearMode = true; }
    var scene = texture.getScene();
    var engine = scene.getEngine();
    var rtt = new RenderTargetTexture("resized" + texture.name, { width: width, height: height }, scene, !texture.noMipmap, true, texture._texture.type, false, texture.samplingMode, false);
    rtt.wrapU = texture.wrapU;
    rtt.wrapV = texture.wrapV;
    rtt.uOffset = texture.uOffset;
    rtt.vOffset = texture.vOffset;
    rtt.uScale = texture.uScale;
    rtt.vScale = texture.vScale;
    rtt.uAng = texture.uAng;
    rtt.vAng = texture.vAng;
    rtt.wAng = texture.wAng;
    rtt.coordinatesIndex = texture.coordinatesIndex;
    rtt.level = texture.level;
    rtt.anisotropicFilteringLevel = texture.anisotropicFilteringLevel;
    rtt._texture.isReady = false;
    texture.wrapU = Texture.CLAMP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;
    var passPostProcess = new PassPostProcess("pass", 1, null, useBilinearMode ? Texture.BILINEAR_SAMPLINGMODE : Texture.NEAREST_SAMPLINGMODE, engine, false, 0);
    passPostProcess.externalTextureSamplerBinding = true;
    passPostProcess.getEffect().executeWhenCompiled(function () {
        passPostProcess.onApply = function (effect) {
            effect.setTexture("textureSampler", texture);
        };
        var internalTexture = rtt.renderTarget;
        if (internalTexture) {
            scene.postProcessManager.directRender([passPostProcess], internalTexture);
            engine.unBindFramebuffer(internalTexture);
            rtt.disposeFramebufferObjects();
            passPostProcess.dispose();
            rtt.getInternalTexture().isReady = true;
        }
    });
    return rtt;
}
/**
 * Apply a post process to a texture
 * @param postProcessName name of the fragment post process
 * @param internalTexture the texture to encode
 * @param scene the scene hosting the texture
 * @param type type of the output texture. If not provided, use the one from internalTexture
 * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
 * @param format format of the output texture. If not provided, use the one from internalTexture
 * @return a promise with the internalTexture having its texture replaced by the result of the processing
 */
export function ApplyPostProcess(postProcessName, internalTexture, scene, type, samplingMode, format) {
    // Gets everything ready.
    var engine = internalTexture.getEngine();
    internalTexture.isReady = false;
    samplingMode = samplingMode !== null && samplingMode !== void 0 ? samplingMode : internalTexture.samplingMode;
    type = type !== null && type !== void 0 ? type : internalTexture.type;
    format = format !== null && format !== void 0 ? format : internalTexture.format;
    if (type === -1) {
        type = 0;
    }
    return new Promise(function (resolve) {
        // Create the post process
        var postProcess = new PostProcess("postprocess", postProcessName, null, null, 1, null, samplingMode, engine, false, undefined, type, undefined, null, false, format);
        postProcess.externalTextureSamplerBinding = true;
        // Hold the output of the decoding.
        var encodedTexture = engine.createRenderTargetTexture({ width: internalTexture.width, height: internalTexture.height }, {
            generateDepthBuffer: false,
            generateMipMaps: false,
            generateStencilBuffer: false,
            samplingMode: samplingMode,
            type: type,
            format: format,
        });
        postProcess.getEffect().executeWhenCompiled(function () {
            // PP Render Pass
            postProcess.onApply = function (effect) {
                effect._bindTexture("textureSampler", internalTexture);
                effect.setFloat2("scale", 1, 1);
            };
            scene.postProcessManager.directRender([postProcess], encodedTexture, true);
            // Cleanup
            engine.restoreDefaultFramebuffer();
            engine._releaseTexture(internalTexture);
            if (postProcess) {
                postProcess.dispose();
            }
            // Internal Swap
            encodedTexture._swapAndDie(internalTexture);
            // Ready to get rolling again.
            internalTexture.type = type;
            internalTexture.format = 5;
            internalTexture.isReady = true;
            resolve(internalTexture);
        });
    });
}
// ref: http://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript
var floatView;
var int32View;
/**
 * Converts a number to half float
 * @param value number to convert
 * @returns converted number
 */
export function ToHalfFloat(value) {
    if (!floatView) {
        floatView = new Float32Array(1);
        int32View = new Int32Array(floatView.buffer);
    }
    floatView[0] = value;
    var x = int32View[0];
    var bits = (x >> 16) & 0x8000; /* Get the sign */
    var m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
    var e = (x >> 23) & 0xff; /* Using int is faster here */
    /* If zero, or denormal, or exponent underflows too much for a denormal
     * half, return signed zero. */
    if (e < 103) {
        return bits;
    }
    /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
    if (e > 142) {
        bits |= 0x7c00;
        /* If exponent was 0xff and one mantissa bit was set, it means NaN,
         * not Inf, so make sure we set one mantissa bit too. */
        bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
        return bits;
    }
    /* If exponent underflows but not too much, return a denormal */
    if (e < 113) {
        m |= 0x0800;
        /* Extra rounding may overflow and set mantissa to 0 and exponent
         * to 1, which is OK. */
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
        return bits;
    }
    bits |= ((e - 112) << 10) | (m >> 1);
    bits += m & 1;
    return bits;
}
/**
 * Converts a half float to a number
 * @param value half float to convert
 * @returns converted half float
 */
export function FromHalfFloat(value) {
    var s = (value & 0x8000) >> 15;
    var e = (value & 0x7c00) >> 10;
    var f = value & 0x03ff;
    if (e === 0) {
        return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
    }
    else if (e == 0x1f) {
        return f ? NaN : (s ? -1 : 1) * Infinity;
    }
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}
/**
 * Class used to host texture specific utilities
 */
export var TextureTools = {
    /**
     * Uses the GPU to create a copy texture rescaled at a given size
     * @param texture Texture to copy from
     * @param width defines the desired width
     * @param height defines the desired height
     * @param useBilinearMode defines if bilinear mode has to be used
     * @return the generated texture
     */
    CreateResizedCopy: CreateResizedCopy,
    /**
     * Apply a post process to a texture
     * @param postProcessName name of the fragment post process
     * @param internalTexture the texture to encode
     * @param scene the scene hosting the texture
     * @param type type of the output texture. If not provided, use the one from internalTexture
     * @param samplingMode sampling mode to use to sample the source texture. If not provided, use the one from internalTexture
     * @param format format of the output texture. If not provided, use the one from internalTexture
     * @return a promise with the internalTexture having its texture replaced by the result of the processing
     */
    ApplyPostProcess: ApplyPostProcess,
    /**
     * Converts a number to half float
     * @param value number to convert
     * @returns converted number
     */
    ToHalfFloat: ToHalfFloat,
    /**
     * Converts a half float to a number
     * @param value half float to convert
     * @returns converted half float
     */
    FromHalfFloat: FromHalfFloat,
};
//# sourceMappingURL=textureTools.js.map