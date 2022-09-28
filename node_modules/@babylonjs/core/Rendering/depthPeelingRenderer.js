/**
 * Implementation based on https://medium.com/@shrekshao_71662/dual-depth-peeling-implementation-in-webgl-11baa061ba4b
 */

import { MultiRenderTarget } from "../Materials/Textures/multiRenderTarget.js";
import { Color4 } from "../Maths/math.color.js";
import { SmartArray } from "../Misc/smartArray.js";
import { ThinTexture } from "../Materials/Textures/thinTexture.js";
import { EffectRenderer, EffectWrapper } from "../Materials/effectRenderer.js";
import { Logger } from "../Misc/logger.js";
import { Material } from "../Materials/material.js";
import "../Shaders/postprocess.vertex.js";
import "../Shaders/oitFinal.fragment.js";
import "../Shaders/oitBackBlend.fragment.js";
var DepthPeelingEffectConfiguration = /** @class */ (function () {
    function DepthPeelingEffectConfiguration() {
        /**
         * Is this effect enabled
         */
        this.enabled = true;
        /**
         * Name of the configuration
         */
        this.name = "depthPeeling";
        /**
         * Textures that should be present in the MRT for this effect to work
         */
        this.texturesRequired = [4];
    }
    return DepthPeelingEffectConfiguration;
}());
/**
 * The depth peeling renderer that performs
 * Order independant transparency (OIT).
 * This should not be instanciated directly, as it is part of a scene component
 */
var DepthPeelingRenderer = /** @class */ (function () {
    /**
     * Instanciates the depth peeling renderer
     * @param scene Scene to attach to
     * @param passCount Number of depth layers to peel
     * @returns The depth peeling renderer
     */
    function DepthPeelingRenderer(scene, passCount) {
        if (passCount === void 0) { passCount = 5; }
        this._thinTextures = [];
        this._currentPingPongState = 0;
        this._layoutCacheFormat = [[true], [true, true], [true, true, true]];
        this._layoutCache = [];
        this._candidateSubMeshes = new SmartArray(10);
        this._excludedSubMeshes = new SmartArray(10);
        this._colorCache = [
            new Color4(DepthPeelingRenderer._DEPTH_CLEAR_VALUE, DepthPeelingRenderer._DEPTH_CLEAR_VALUE, 0, 0),
            new Color4(-DepthPeelingRenderer._MIN_DEPTH, DepthPeelingRenderer._MAX_DEPTH, 0, 0),
            new Color4(0, 0, 0, 0),
        ];
        this._scene = scene;
        this._engine = scene.getEngine();
        this._passCount = passCount;
        //  We need a depth texture for opaque
        if (!scene.enablePrePassRenderer()) {
            Logger.Warn("Depth peeling for order independant transparency could not enable PrePass, aborting.");
            return;
        }
        for (var i = 0; i < this._layoutCacheFormat.length; ++i) {
            this._layoutCache[i] = this._engine.buildTextureLayout(this._layoutCacheFormat[i]);
        }
        this._renderPassIds = [];
        this.useRenderPasses = false;
        this._prePassEffectConfiguration = new DepthPeelingEffectConfiguration();
        this._createTextures();
        this._createEffects();
    }
    Object.defineProperty(DepthPeelingRenderer.prototype, "passCount", {
        /**
         * Number of depth peeling passes. As we are using dual depth peeling, each pass two levels of transparency are processed.
         */
        get: function () {
            return this._passCount;
        },
        set: function (count) {
            if (this._passCount === count) {
                return;
            }
            this._passCount = count;
            this._createRenderPassIds();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DepthPeelingRenderer.prototype, "useRenderPasses", {
        /**
         * Instructs the renderer to use render passes. It is an optimization that makes the rendering faster for some engines (like WebGPU) but that consumes more memory, so it is disabled by default.
         */
        get: function () {
            return this._useRenderPasses;
        },
        set: function (usePasses) {
            if (this._useRenderPasses === usePasses) {
                return;
            }
            this._useRenderPasses = usePasses;
            this._createRenderPassIds();
        },
        enumerable: false,
        configurable: true
    });
    DepthPeelingRenderer.prototype._createRenderPassIds = function () {
        this._releaseRenderPassIds();
        if (this._useRenderPasses) {
            for (var i = 0; i < this._passCount + 1; ++i) {
                if (!this._renderPassIds[i]) {
                    this._renderPassIds[i] = this._engine.createRenderPassId("DepthPeelingRenderer - pass #".concat(i));
                }
            }
        }
    };
    DepthPeelingRenderer.prototype._releaseRenderPassIds = function () {
        for (var i = 0; i < this._renderPassIds.length; ++i) {
            this._engine.releaseRenderPassId(this._renderPassIds[i]);
        }
        this._renderPassIds = [];
    };
    DepthPeelingRenderer.prototype._createTextures = function () {
        var size = {
            width: this._engine.getRenderWidth(),
            height: this._engine.getRenderHeight(),
        };
        // 2 for ping pong
        this._depthMrts = [new MultiRenderTarget("depthPeelingDepth0", size, 1, this._scene), new MultiRenderTarget("depthPeelingDepth1", size, 1, this._scene)];
        this._colorMrts = [
            new MultiRenderTarget("depthPeelingColor0", size, 1, this._scene, { generateDepthBuffer: false }),
            new MultiRenderTarget("depthPeelingColor1", size, 1, this._scene, { generateDepthBuffer: false }),
        ];
        this._blendBackMrt = new MultiRenderTarget("depthPeelingBack", size, 1, this._scene, { generateDepthBuffer: false });
        // 0 is a depth texture
        // 1 is a color texture
        var optionsArray = [
            {
                format: 7,
                samplingMode: 1,
                type: this._engine.getCaps().textureFloatLinearFiltering ? 1 : 2,
            },
            {
                format: 5,
                samplingMode: 1,
                type: 2,
            },
        ];
        for (var i = 0; i < 2; i++) {
            var depthTexture = this._engine._createInternalTexture(size, optionsArray[0], false);
            var frontColorTexture = this._engine._createInternalTexture(size, optionsArray[1], false);
            var backColorTexture = this._engine._createInternalTexture(size, optionsArray[1], false);
            this._depthMrts[i].setInternalTexture(depthTexture, 0);
            this._depthMrts[i].setInternalTexture(frontColorTexture, 1);
            this._depthMrts[i].setInternalTexture(backColorTexture, 2);
            this._colorMrts[i].setInternalTexture(frontColorTexture, 0);
            this._colorMrts[i].setInternalTexture(backColorTexture, 1);
            this._thinTextures.push(new ThinTexture(depthTexture), new ThinTexture(frontColorTexture), new ThinTexture(backColorTexture));
        }
    };
    DepthPeelingRenderer.prototype._disposeTextures = function () {
        for (var i = 0; i < this._thinTextures.length; i++) {
            if (i === 6) {
                // Do not dispose the shared texture with the prepass
                continue;
            }
            this._thinTextures[i].dispose();
        }
        for (var i = 0; i < 2; i++) {
            this._depthMrts[i].dispose(true);
            this._colorMrts[i].dispose(true);
            this._blendBackMrt.dispose(true);
        }
        this._thinTextures = [];
        this._colorMrts = [];
        this._depthMrts = [];
    };
    DepthPeelingRenderer.prototype._updateTextures = function () {
        if (this._depthMrts[0].getSize().width !== this._engine.getRenderWidth() || this._depthMrts[0].getSize().height !== this._engine.getRenderHeight()) {
            this._disposeTextures();
            this._createTextures();
        }
        return this._updateTextureReferences();
    };
    DepthPeelingRenderer.prototype._updateTextureReferences = function () {
        var _a;
        var prePassRenderer = this._scene.prePassRenderer;
        if (!prePassRenderer) {
            return false;
        }
        // Retrieve opaque color texture
        var textureIndex = prePassRenderer.getIndex(4);
        var prePassTexture = ((_a = prePassRenderer.defaultRT.textures) === null || _a === void 0 ? void 0 : _a.length) ? prePassRenderer.defaultRT.textures[textureIndex].getInternalTexture() : null;
        if (!prePassTexture) {
            return false;
        }
        if (this._blendBackTexture !== prePassTexture) {
            this._blendBackTexture = prePassTexture;
            this._blendBackMrt.setInternalTexture(this._blendBackTexture, 0);
            if (this._thinTextures[6]) {
                this._thinTextures[6].dispose();
            }
            this._thinTextures[6] = new ThinTexture(this._blendBackTexture);
            prePassRenderer.defaultRT.renderTarget._shareDepth(this._depthMrts[0].renderTarget);
        }
        return true;
    };
    DepthPeelingRenderer.prototype._createEffects = function () {
        this._blendBackEffectWrapper = new EffectWrapper({
            fragmentShader: "oitBackBlend",
            useShaderStore: true,
            engine: this._engine,
            samplerNames: ["uBackColor"],
            uniformNames: [],
        });
        this._blendBackEffectWrapperPingPong = new EffectWrapper({
            fragmentShader: "oitBackBlend",
            useShaderStore: true,
            engine: this._engine,
            samplerNames: ["uBackColor"],
            uniformNames: [],
        });
        this._finalEffectWrapper = new EffectWrapper({
            fragmentShader: "oitFinal",
            useShaderStore: true,
            engine: this._engine,
            samplerNames: ["uFrontColor", "uBackColor"],
            uniformNames: [],
        });
        this._effectRenderer = new EffectRenderer(this._engine);
    };
    /**
     * Links to the prepass renderer
     * @param prePassRenderer The scene PrePassRenderer
     */
    DepthPeelingRenderer.prototype.setPrePassRenderer = function (prePassRenderer) {
        prePassRenderer.addEffectConfiguration(this._prePassEffectConfiguration);
    };
    /**
     * Binds depth peeling textures on an effect
     * @param effect The effect to bind textures on
     */
    DepthPeelingRenderer.prototype.bind = function (effect) {
        effect.setTexture("oitDepthSampler", this._thinTextures[this._currentPingPongState * 3]);
        effect.setTexture("oitFrontColorSampler", this._thinTextures[this._currentPingPongState * 3 + 1]);
    };
    DepthPeelingRenderer.prototype._renderSubMeshes = function (transparentSubMeshes) {
        var mapMaterialContext;
        if (this._useRenderPasses) {
            mapMaterialContext = {};
        }
        for (var j = 0; j < transparentSubMeshes.length; j++) {
            var material = transparentSubMeshes.data[j].getMaterial();
            var previousShaderHotSwapping = true;
            var previousBFC = false;
            var subMesh = transparentSubMeshes.data[j];
            var drawWrapper = void 0;
            var firstDraw = false;
            if (this._useRenderPasses) {
                drawWrapper = subMesh._getDrawWrapper();
                firstDraw = !drawWrapper;
            }
            if (material) {
                previousShaderHotSwapping = material.allowShaderHotSwapping;
                previousBFC = material.backFaceCulling;
                material.allowShaderHotSwapping = false;
                material.backFaceCulling = false;
            }
            subMesh.render(false);
            if (firstDraw) {
                // first time we draw this submesh: we replace the material context
                drawWrapper = subMesh._getDrawWrapper(); // we are sure it is now non empty as we just rendered the submesh
                if (drawWrapper.materialContext) {
                    var newMaterialContext = mapMaterialContext[drawWrapper.materialContext.uniqueId];
                    if (!newMaterialContext) {
                        newMaterialContext = mapMaterialContext[drawWrapper.materialContext.uniqueId] = this._engine.createMaterialContext();
                    }
                    subMesh._getDrawWrapper().materialContext = newMaterialContext;
                }
            }
            if (material) {
                material.allowShaderHotSwapping = previousShaderHotSwapping;
                material.backFaceCulling = previousBFC;
            }
        }
    };
    DepthPeelingRenderer.prototype._finalCompose = function (writeId) {
        this._engine.restoreDefaultFramebuffer();
        this._engine.setAlphaMode(0);
        this._engine.applyStates();
        this._engine.enableEffect(this._finalEffectWrapper._drawWrapper);
        this._finalEffectWrapper.effect.setTexture("uFrontColor", this._thinTextures[writeId * 3 + 1]);
        this._finalEffectWrapper.effect.setTexture("uBackColor", this._thinTextures[6]);
        this._effectRenderer.render(this._finalEffectWrapper);
    };
    /**
     * Renders transparent submeshes with depth peeling
     * @param transparentSubMeshes List of transparent meshes to render
     * @returns The array of submeshes that could not be handled by this renderer
     */
    DepthPeelingRenderer.prototype.render = function (transparentSubMeshes) {
        this._candidateSubMeshes.length = 0;
        this._excludedSubMeshes.length = 0;
        if (!this._blendBackEffectWrapper.effect.isReady() ||
            !this._blendBackEffectWrapperPingPong.effect.isReady() ||
            !this._finalEffectWrapper.effect.isReady() ||
            !this._updateTextures()) {
            return this._excludedSubMeshes;
        }
        for (var i = 0; i < transparentSubMeshes.length; i++) {
            var material = transparentSubMeshes.data[i].getMaterial();
            if (material &&
                (material.fillMode === Material.TriangleFanDrawMode || material.fillMode === Material.TriangleFillMode || material.fillMode === Material.TriangleStripDrawMode)) {
                this._candidateSubMeshes.push(transparentSubMeshes.data[i]);
            }
            else {
                this._excludedSubMeshes.push(transparentSubMeshes.data[i]);
            }
        }
        if (!this._candidateSubMeshes.length) {
            this._finalCompose(1);
            return this._excludedSubMeshes;
        }
        var currentRenderPassId = this._engine.currentRenderPassId;
        this._scene.prePassRenderer._enabled = false;
        if (this._useRenderPasses) {
            this._engine.currentRenderPassId = this._renderPassIds[0];
        }
        // Clears
        this._engine.bindFramebuffer(this._depthMrts[0].renderTarget);
        this._engine.bindAttachments(this._layoutCache[0]);
        this._engine.clear(this._colorCache[0], true, false, false);
        this._engine.bindFramebuffer(this._depthMrts[1].renderTarget);
        this._engine.bindAttachments(this._layoutCache[0]);
        this._engine.clear(this._colorCache[1], true, false, false);
        this._engine.bindFramebuffer(this._colorMrts[0].renderTarget);
        this._engine.bindAttachments(this._layoutCache[1]);
        this._engine.clear(this._colorCache[2], true, false, false);
        this._engine.bindFramebuffer(this._colorMrts[1].renderTarget);
        this._engine.bindAttachments(this._layoutCache[1]);
        this._engine.clear(this._colorCache[2], true, false, false);
        // Draw depth for first pass
        this._engine.bindFramebuffer(this._depthMrts[0].renderTarget);
        this._engine.bindAttachments(this._layoutCache[0]);
        this._engine.setAlphaMode(11); // in WebGPU, when using MIN or MAX equation, the src / dst color factors should not use SRC_ALPHA and the src / dst alpha factors must be 1 else WebGPU will throw a validation error
        this._engine.setAlphaEquation(3);
        this._engine.depthCullingState.depthMask = false;
        this._engine.depthCullingState.depthTest = true;
        this._engine.applyStates();
        this._currentPingPongState = 1;
        // Render
        this._renderSubMeshes(this._candidateSubMeshes);
        this._scene.resetCachedMaterial();
        // depth peeling ping-pong
        var readId = 0;
        var writeId = 0;
        for (var i = 0; i < this._passCount; i++) {
            readId = i % 2;
            writeId = 1 - readId;
            this._currentPingPongState = readId;
            if (this._useRenderPasses) {
                this._engine.currentRenderPassId = this._renderPassIds[i + 1];
            }
            // Clears
            this._engine.bindFramebuffer(this._depthMrts[writeId].renderTarget);
            this._engine.bindAttachments(this._layoutCache[0]);
            this._engine.clear(this._colorCache[0], true, false, false);
            this._engine.bindFramebuffer(this._colorMrts[writeId].renderTarget);
            this._engine.bindAttachments(this._layoutCache[1]);
            this._engine.clear(this._colorCache[2], true, false, false);
            this._engine.bindFramebuffer(this._depthMrts[writeId].renderTarget);
            this._engine.bindAttachments(this._layoutCache[2]);
            this._engine.setAlphaMode(11); // the value does not matter (as MAX operation does not use them) but the src and dst color factors should not use SRC_ALPHA else WebGPU will throw a validation error
            this._engine.setAlphaEquation(3);
            this._engine.depthCullingState.depthTest = false;
            this._engine.applyStates();
            // Render
            this._renderSubMeshes(this._candidateSubMeshes);
            this._scene.resetCachedMaterial();
            // Back color
            this._engine.bindFramebuffer(this._blendBackMrt.renderTarget);
            this._engine.bindAttachments(this._layoutCache[0]);
            this._engine.setAlphaEquation(0);
            this._engine.setAlphaMode(17);
            this._engine.applyStates();
            var blendBackEffectWrapper = writeId === 0 || !this._useRenderPasses ? this._blendBackEffectWrapper : this._blendBackEffectWrapperPingPong;
            this._engine.enableEffect(blendBackEffectWrapper._drawWrapper);
            blendBackEffectWrapper.effect.setTexture("uBackColor", this._thinTextures[writeId * 3 + 2]);
            this._effectRenderer.render(blendBackEffectWrapper);
        }
        this._engine.currentRenderPassId = currentRenderPassId;
        // Final composition on default FB
        this._finalCompose(writeId);
        this._scene.prePassRenderer._enabled = true;
        this._engine.depthCullingState.depthMask = true;
        this._engine.depthCullingState.depthTest = true;
        return this._excludedSubMeshes;
    };
    /**
     * Disposes the depth peeling renderer and associated ressources
     */
    DepthPeelingRenderer.prototype.dispose = function () {
        this._disposeTextures();
        this._blendBackEffectWrapper.dispose();
        this._finalEffectWrapper.dispose();
        this._effectRenderer.dispose();
        this._releaseRenderPassIds();
    };
    DepthPeelingRenderer._DEPTH_CLEAR_VALUE = -99999.0;
    DepthPeelingRenderer._MIN_DEPTH = 0;
    DepthPeelingRenderer._MAX_DEPTH = 1;
    return DepthPeelingRenderer;
}());
export { DepthPeelingRenderer };
//# sourceMappingURL=depthPeelingRenderer.js.map