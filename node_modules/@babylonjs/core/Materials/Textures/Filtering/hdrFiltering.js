import { Vector3 } from "../../../Maths/math.js";
import { Scalar } from "../../../Maths/math.scalar.js";

import { EffectWrapper, EffectRenderer } from "../../../Materials/effectRenderer.js";
import "../../../Shaders/hdrFiltering.vertex.js";
import "../../../Shaders/hdrFiltering.fragment.js";
import { Logger } from "../../../Misc/logger.js";
/**
 * Filters HDR maps to get correct renderings of PBR reflections
 */
var HDRFiltering = /** @class */ (function () {
    /**
     * Instantiates HDR filter for reflection maps
     *
     * @param engine Thin engine
     * @param options Options
     */
    function HDRFiltering(engine, options) {
        if (options === void 0) { options = {}; }
        this._lodGenerationOffset = 0;
        this._lodGenerationScale = 0.8;
        /**
         * Quality switch for prefiltering. Should be set to `4096` unless
         * you care about baking speed.
         */
        this.quality = 4096;
        /**
         * Scales pixel intensity for the input HDR map.
         */
        this.hdrScale = 1;
        // pass
        this._engine = engine;
        this.hdrScale = options.hdrScale || this.hdrScale;
        this.quality = options.quality || this.quality;
    }
    HDRFiltering.prototype._createRenderTarget = function (size) {
        var textureType = 0;
        if (this._engine.getCaps().textureHalfFloatRender) {
            textureType = 2;
        }
        else if (this._engine.getCaps().textureFloatRender) {
            textureType = 1;
        }
        var rtWrapper = this._engine.createRenderTargetCubeTexture(size, {
            format: 5,
            type: textureType,
            createMipMaps: true,
            generateMipMaps: false,
            generateDepthBuffer: false,
            generateStencilBuffer: false,
            samplingMode: 1,
        });
        this._engine.updateTextureWrappingMode(rtWrapper.texture, 0, 0, 0);
        this._engine.updateTextureSamplingMode(3, rtWrapper.texture, true);
        return rtWrapper;
    };
    HDRFiltering.prototype._prefilterInternal = function (texture) {
        var width = texture.getSize().width;
        var mipmapsCount = Scalar.ILog2(width) + 1;
        var effect = this._effectWrapper.effect;
        var outputTexture = this._createRenderTarget(width);
        this._effectRenderer.setViewport();
        var intTexture = texture.getInternalTexture();
        if (intTexture) {
            // Just in case generate fresh clean mips.
            this._engine.updateTextureSamplingMode(3, intTexture, true);
        }
        this._effectRenderer.applyEffectWrapper(this._effectWrapper);
        var directions = [
            [new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(1, 0, 0)],
            [new Vector3(0, 0, 1), new Vector3(0, -1, 0), new Vector3(-1, 0, 0)],
            [new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 1, 0)],
            [new Vector3(1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)],
            [new Vector3(1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1)],
            [new Vector3(-1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 0, -1)], // NegativeZ
        ];
        effect.setFloat("hdrScale", this.hdrScale);
        effect.setFloat2("vFilteringInfo", texture.getSize().width, mipmapsCount);
        effect.setTexture("inputTexture", texture);
        for (var face = 0; face < 6; face++) {
            effect.setVector3("up", directions[face][0]);
            effect.setVector3("right", directions[face][1]);
            effect.setVector3("front", directions[face][2]);
            for (var lod = 0; lod < mipmapsCount; lod++) {
                this._engine.bindFramebuffer(outputTexture, face, undefined, undefined, true, lod);
                this._effectRenderer.applyEffectWrapper(this._effectWrapper);
                var alpha = Math.pow(2, (lod - this._lodGenerationOffset) / this._lodGenerationScale) / width;
                if (lod === 0) {
                    alpha = 0;
                }
                effect.setFloat("alphaG", alpha);
                this._effectRenderer.draw();
            }
        }
        // Cleanup
        this._effectRenderer.restoreStates();
        this._engine.restoreDefaultFramebuffer();
        this._engine._releaseTexture(texture._texture);
        // Internal Swap
        outputTexture._swapAndDie(texture._texture);
        texture._prefiltered = true;
        return texture;
    };
    HDRFiltering.prototype._createEffect = function (texture, onCompiled) {
        var defines = [];
        if (texture.gammaSpace) {
            defines.push("#define GAMMA_INPUT");
        }
        defines.push("#define NUM_SAMPLES " + this.quality + "u"); // unsigned int
        var effectWrapper = new EffectWrapper({
            engine: this._engine,
            name: "hdrFiltering",
            vertexShader: "hdrFiltering",
            fragmentShader: "hdrFiltering",
            samplerNames: ["inputTexture"],
            uniformNames: ["vSampleDirections", "vWeights", "up", "right", "front", "vFilteringInfo", "hdrScale", "alphaG"],
            useShaderStore: true,
            defines: defines,
            onCompiled: onCompiled,
        });
        return effectWrapper;
    };
    /**
     * Get a value indicating if the filter is ready to be used
     * @param texture Texture to filter
     * @returns true if the filter is ready
     */
    HDRFiltering.prototype.isReady = function (texture) {
        return texture.isReady() && this._effectWrapper.effect.isReady();
    };
    /**
     * Prefilters a cube texture to have mipmap levels representing roughness values.
     * Prefiltering will be invoked at the end of next rendering pass.
     * This has to be done once the map is loaded, and has not been prefiltered by a third party software.
     * See http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf for more information
     * @param texture Texture to filter
     * @param onFinished Callback when filtering is done
     * @return Promise called when prefiltering is done
     */
    HDRFiltering.prototype.prefilter = function (texture, onFinished) {
        var _this = this;
        if (onFinished === void 0) { onFinished = null; }
        if (!this._engine._features.allowTexturePrefiltering) {
            Logger.Warn("HDR prefiltering is not available in WebGL 1., you can use real time filtering instead.");
            return Promise.reject("HDR prefiltering is not available in WebGL 1., you can use real time filtering instead.");
        }
        return new Promise(function (resolve) {
            _this._effectRenderer = new EffectRenderer(_this._engine);
            _this._effectWrapper = _this._createEffect(texture);
            _this._effectWrapper.effect.executeWhenCompiled(function () {
                _this._prefilterInternal(texture);
                _this._effectRenderer.dispose();
                _this._effectWrapper.dispose();
                resolve();
                if (onFinished) {
                    onFinished();
                }
            });
        });
    };
    return HDRFiltering;
}());
export { HDRFiltering };
//# sourceMappingURL=hdrFiltering.js.map