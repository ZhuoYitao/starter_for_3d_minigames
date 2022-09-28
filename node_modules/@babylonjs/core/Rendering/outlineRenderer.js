import { VertexBuffer } from "../Buffers/buffer.js";
import { Mesh } from "../Meshes/mesh.js";
import { Scene } from "../scene.js";

import { SceneComponentConstants } from "../sceneComponent.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import { MaterialHelper } from "../Materials/materialHelper.js";
import "../Shaders/outline.fragment.js";
import "../Shaders/outline.vertex.js";
/**
 * Gets the outline renderer associated with the scene
 * @returns a OutlineRenderer
 */
Scene.prototype.getOutlineRenderer = function () {
    if (!this._outlineRenderer) {
        this._outlineRenderer = new OutlineRenderer(this);
    }
    return this._outlineRenderer;
};
Object.defineProperty(Mesh.prototype, "renderOutline", {
    get: function () {
        return this._renderOutline;
    },
    set: function (value) {
        if (value) {
            // Lazy Load the component.
            this.getScene().getOutlineRenderer();
        }
        this._renderOutline = value;
    },
    enumerable: true,
    configurable: true,
});
Object.defineProperty(Mesh.prototype, "renderOverlay", {
    get: function () {
        return this._renderOverlay;
    },
    set: function (value) {
        if (value) {
            // Lazy Load the component.
            this.getScene().getOutlineRenderer();
        }
        this._renderOverlay = value;
    },
    enumerable: true,
    configurable: true,
});
/**
 * This class is responsible to draw the outline/overlay of meshes.
 * It should not be used directly but through the available method on mesh.
 */
var OutlineRenderer = /** @class */ (function () {
    /**
     * Instantiates a new outline renderer. (There could be only one per scene).
     * @param scene Defines the scene it belongs to
     */
    function OutlineRenderer(scene) {
        /**
         * The name of the component. Each component must have a unique name.
         */
        this.name = SceneComponentConstants.NAME_OUTLINERENDERER;
        /**
         * Defines a zOffset default Factor to prevent zFighting between the overlay and the mesh.
         */
        this.zOffset = 1;
        /**
         * Defines a zOffset default Unit to prevent zFighting between the overlay and the mesh.
         */
        this.zOffsetUnits = 4; // 4 to account for projection a bit by default
        this.scene = scene;
        this._engine = scene.getEngine();
        this.scene._addComponent(this);
        this._passIdForDrawWrapper = [];
        for (var i = 0; i < 4; ++i) {
            this._passIdForDrawWrapper[i] = this._engine.createRenderPassId("Outline Renderer (".concat(i, ")"));
        }
    }
    /**
     * Register the component to one instance of a scene.
     */
    OutlineRenderer.prototype.register = function () {
        this.scene._beforeRenderingMeshStage.registerStep(SceneComponentConstants.STEP_BEFORERENDERINGMESH_OUTLINE, this, this._beforeRenderingMesh);
        this.scene._afterRenderingMeshStage.registerStep(SceneComponentConstants.STEP_AFTERRENDERINGMESH_OUTLINE, this, this._afterRenderingMesh);
    };
    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    OutlineRenderer.prototype.rebuild = function () {
        // Nothing to do here.
    };
    /**
     * Disposes the component and the associated resources.
     */
    OutlineRenderer.prototype.dispose = function () {
        for (var i = 0; i < this._passIdForDrawWrapper.length; ++i) {
            this._engine.releaseRenderPassId(this._passIdForDrawWrapper[i]);
        }
    };
    /**
     * Renders the outline in the canvas.
     * @param subMesh Defines the sumesh to render
     * @param batch Defines the batch of meshes in case of instances
     * @param useOverlay Defines if the rendering is for the overlay or the outline
     * @param renderPassId Render pass id to use to render the mesh
     */
    OutlineRenderer.prototype.render = function (subMesh, batch, useOverlay, renderPassId) {
        if (useOverlay === void 0) { useOverlay = false; }
        renderPassId = renderPassId !== null && renderPassId !== void 0 ? renderPassId : this._passIdForDrawWrapper[0];
        var scene = this.scene;
        var engine = scene.getEngine();
        var hardwareInstancedRendering = engine.getCaps().instancedArrays &&
            ((batch.visibleInstances[subMesh._id] !== null && batch.visibleInstances[subMesh._id] !== undefined) || subMesh.getRenderingMesh().hasThinInstances);
        if (!this.isReady(subMesh, hardwareInstancedRendering, renderPassId)) {
            return;
        }
        var ownerMesh = subMesh.getMesh();
        var replacementMesh = ownerMesh._internalAbstractMeshDataInfo._actAsRegularMesh ? ownerMesh : null;
        var renderingMesh = subMesh.getRenderingMesh();
        var effectiveMesh = replacementMesh ? replacementMesh : renderingMesh;
        var material = subMesh.getMaterial();
        if (!material || !scene.activeCamera) {
            return;
        }
        var drawWrapper = subMesh._getDrawWrapper(renderPassId);
        var effect = DrawWrapper.GetEffect(drawWrapper);
        engine.enableEffect(drawWrapper);
        // Logarithmic depth
        if (material.useLogarithmicDepth) {
            effect.setFloat("logarithmicDepthConstant", 2.0 / (Math.log(scene.activeCamera.maxZ + 1.0) / Math.LN2));
        }
        effect.setFloat("offset", useOverlay ? 0 : renderingMesh.outlineWidth);
        effect.setColor4("color", useOverlay ? renderingMesh.overlayColor : renderingMesh.outlineColor, useOverlay ? renderingMesh.overlayAlpha : material.alpha);
        effect.setMatrix("viewProjection", scene.getTransformMatrix());
        effect.setMatrix("world", effectiveMesh.getWorldMatrix());
        // Bones
        if (renderingMesh.useBones && renderingMesh.computeBonesUsingShaders && renderingMesh.skeleton) {
            effect.setMatrices("mBones", renderingMesh.skeleton.getTransformMatrices(renderingMesh));
        }
        if (renderingMesh.morphTargetManager && renderingMesh.morphTargetManager.isUsingTextureForTargets) {
            renderingMesh.morphTargetManager._bind(effect);
        }
        // Morph targets
        MaterialHelper.BindMorphTargetParameters(renderingMesh, effect);
        if (!hardwareInstancedRendering) {
            renderingMesh._bind(subMesh, effect, material.fillMode);
        }
        // Alpha test
        if (material && material.needAlphaTesting()) {
            var alphaTexture = material.getAlphaTestTexture();
            if (alphaTexture) {
                effect.setTexture("diffuseSampler", alphaTexture);
                effect.setMatrix("diffuseMatrix", alphaTexture.getTextureMatrix());
            }
        }
        // Clip plane
        MaterialHelper.BindClipPlane(effect, scene);
        engine.setZOffset(-this.zOffset);
        engine.setZOffsetUnits(-this.zOffsetUnits);
        renderingMesh._processRendering(effectiveMesh, subMesh, effect, material.fillMode, batch, hardwareInstancedRendering, function (isInstance, world) {
            effect.setMatrix("world", world);
        });
        engine.setZOffset(0);
        engine.setZOffsetUnits(0);
    };
    /**
     * Returns whether or not the outline renderer is ready for a given submesh.
     * All the dependencies e.g. submeshes, texture, effect... mus be ready
     * @param subMesh Defines the submesh to check readiness for
     * @param useInstances Defines whether wee are trying to render instances or not
     * @param renderPassId Render pass id to use to render the mesh
     * @returns true if ready otherwise false
     */
    OutlineRenderer.prototype.isReady = function (subMesh, useInstances, renderPassId) {
        renderPassId = renderPassId !== null && renderPassId !== void 0 ? renderPassId : this._passIdForDrawWrapper[0];
        var defines = [];
        var attribs = [VertexBuffer.PositionKind, VertexBuffer.NormalKind];
        var mesh = subMesh.getMesh();
        var material = subMesh.getMaterial();
        var scene = mesh.getScene();
        if (material) {
            // Alpha test
            if (material.needAlphaTesting()) {
                defines.push("#define ALPHATEST");
                if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                    attribs.push(VertexBuffer.UVKind);
                    defines.push("#define UV1");
                }
                if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind)) {
                    attribs.push(VertexBuffer.UV2Kind);
                    defines.push("#define UV2");
                }
            }
            //Logarithmic depth
            if (material.useLogarithmicDepth) {
                defines.push("#define LOGARITHMICDEPTH");
            }
        }
        // Bones
        if (mesh.useBones && mesh.computeBonesUsingShaders) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            defines.push("#define BonesPerMesh " + (mesh.skeleton ? mesh.skeleton.bones.length + 1 : 0));
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Morph targets
        var morphTargetManager = mesh.morphTargetManager;
        var numMorphInfluencers = 0;
        if (morphTargetManager) {
            if (morphTargetManager.numInfluencers > 0) {
                numMorphInfluencers = morphTargetManager.numInfluencers;
                defines.push("#define MORPHTARGETS");
                defines.push("#define NUM_MORPH_INFLUENCERS " + numMorphInfluencers);
                if (morphTargetManager.isUsingTextureForTargets) {
                    defines.push("#define MORPHTARGETS_TEXTURE");
                }
                MaterialHelper.PrepareAttributesForMorphTargetsInfluencers(attribs, mesh, numMorphInfluencers);
            }
        }
        // Instances
        if (useInstances) {
            defines.push("#define INSTANCES");
            MaterialHelper.PushAttributesForInstances(attribs);
            if (subMesh.getRenderingMesh().hasThinInstances) {
                defines.push("#define THIN_INSTANCES");
            }
        }
        // Clip planes
        if (scene.clipPlane) {
            defines.push("#define CLIPPLANE");
        }
        if (scene.clipPlane2) {
            defines.push("#define CLIPPLANE2");
        }
        if (scene.clipPlane3) {
            defines.push("#define CLIPPLANE3");
        }
        if (scene.clipPlane4) {
            defines.push("#define CLIPPLANE4");
        }
        if (scene.clipPlane5) {
            defines.push("#define CLIPPLANE5");
        }
        if (scene.clipPlane6) {
            defines.push("#define CLIPPLANE6");
        }
        // Get correct effect
        var drawWrapper = subMesh._getDrawWrapper(renderPassId, true);
        var cachedDefines = drawWrapper.defines;
        var join = defines.join("\n");
        if (cachedDefines !== join) {
            drawWrapper.setEffect(this.scene
                .getEngine()
                .createEffect("outline", attribs, [
                "world",
                "mBones",
                "viewProjection",
                "diffuseMatrix",
                "offset",
                "color",
                "logarithmicDepthConstant",
                "morphTargetInfluences",
                "morphTargetTextureInfo",
                "morphTargetTextureIndices",
                "vClipPlane",
                "vClipPlane2",
                "vClipPlane3",
                "vClipPlane4",
                "vClipPlane5",
                "vClipPlane6",
            ], ["diffuseSampler", "morphTargets"], join, undefined, undefined, undefined, { maxSimultaneousMorphTargets: numMorphInfluencers }), join);
        }
        return drawWrapper.effect.isReady();
    };
    OutlineRenderer.prototype._beforeRenderingMesh = function (mesh, subMesh, batch) {
        // Outline - step 1
        this._savedDepthWrite = this._engine.getDepthWrite();
        if (mesh.renderOutline) {
            var material = subMesh.getMaterial();
            if (material && material.needAlphaBlendingForMesh(mesh)) {
                this._engine.cacheStencilState();
                // Draw only to stencil buffer for the original mesh
                // The resulting stencil buffer will be used so the outline is not visible inside the mesh when the mesh is transparent
                this._engine.setDepthWrite(false);
                this._engine.setColorWrite(false);
                this._engine.setStencilBuffer(true);
                this._engine.setStencilOperationPass(7681);
                this._engine.setStencilFunction(519);
                this._engine.setStencilMask(OutlineRenderer._StencilReference);
                this._engine.setStencilFunctionReference(OutlineRenderer._StencilReference);
                this._engine.stencilStateComposer.useStencilGlobalOnly = true;
                this.render(subMesh, batch, /* This sets offset to 0 */ true, this._passIdForDrawWrapper[1]);
                this._engine.setColorWrite(true);
                this._engine.setStencilFunction(517);
            }
            // Draw the outline using the above stencil if needed to avoid drawing within the mesh
            this._engine.setDepthWrite(false);
            this.render(subMesh, batch, false, this._passIdForDrawWrapper[0]);
            this._engine.setDepthWrite(this._savedDepthWrite);
            if (material && material.needAlphaBlendingForMesh(mesh)) {
                this._engine.stencilStateComposer.useStencilGlobalOnly = false;
                this._engine.restoreStencilState();
            }
        }
    };
    OutlineRenderer.prototype._afterRenderingMesh = function (mesh, subMesh, batch) {
        // Overlay
        if (mesh.renderOverlay) {
            var currentMode = this._engine.getAlphaMode();
            var alphaBlendState = this._engine.alphaState.alphaBlend;
            this._engine.setAlphaMode(2);
            this.render(subMesh, batch, true, this._passIdForDrawWrapper[3]);
            this._engine.setAlphaMode(currentMode);
            this._engine.setDepthWrite(this._savedDepthWrite);
            this._engine.alphaState.alphaBlend = alphaBlendState;
        }
        // Outline - step 2
        if (mesh.renderOutline && this._savedDepthWrite) {
            this._engine.setDepthWrite(true);
            this._engine.setColorWrite(false);
            this.render(subMesh, batch, false, this._passIdForDrawWrapper[2]);
            this._engine.setColorWrite(true);
        }
    };
    /**
     * Stencil value used to avoid outline being seen within the mesh when the mesh is transparent
     */
    OutlineRenderer._StencilReference = 0x04;
    return OutlineRenderer;
}());
export { OutlineRenderer };
//# sourceMappingURL=outlineRenderer.js.map