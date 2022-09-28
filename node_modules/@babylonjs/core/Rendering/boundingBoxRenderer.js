import { Scene } from "../scene.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { Matrix } from "../Maths/math.vector.js";
import { SmartArray } from "../Misc/smartArray.js";
import { SceneComponentConstants } from "../sceneComponent.js";
import { Material } from "../Materials/material.js";
import { ShaderMaterial } from "../Materials/shaderMaterial.js";
import { Color3 } from "../Maths/math.color.js";
import { Observable } from "../Misc/observable.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import { UniformBuffer } from "../Materials/uniformBuffer.js";
import { CreateBoxVertexData } from "../Meshes/Builders/boxBuilder.js";
import "../Shaders/boundingBoxRenderer.fragment.js";
import "../Shaders/boundingBoxRenderer.vertex.js";
Object.defineProperty(Scene.prototype, "forceShowBoundingBoxes", {
    get: function () {
        return this._forceShowBoundingBoxes || false;
    },
    set: function (value) {
        this._forceShowBoundingBoxes = value;
        // Lazyly creates a BB renderer if needed.
        if (value) {
            this.getBoundingBoxRenderer();
        }
    },
    enumerable: true,
    configurable: true,
});
Scene.prototype.getBoundingBoxRenderer = function () {
    if (!this._boundingBoxRenderer) {
        this._boundingBoxRenderer = new BoundingBoxRenderer(this);
    }
    return this._boundingBoxRenderer;
};
Object.defineProperty(AbstractMesh.prototype, "showBoundingBox", {
    get: function () {
        return this._showBoundingBox || false;
    },
    set: function (value) {
        this._showBoundingBox = value;
        // Lazyly creates a BB renderer if needed.
        if (value) {
            this.getScene().getBoundingBoxRenderer();
        }
    },
    enumerable: true,
    configurable: true,
});
/**
 * Component responsible of rendering the bounding box of the meshes in a scene.
 * This is usually used through the mesh.showBoundingBox or the scene.forceShowBoundingBoxes properties
 */
var BoundingBoxRenderer = /** @class */ (function () {
    /**
     * Instantiates a new bounding box renderer in a scene.
     * @param scene the scene the  renderer renders in
     */
    function BoundingBoxRenderer(scene) {
        /**
         * The component name helpful to identify the component in the list of scene components.
         */
        this.name = SceneComponentConstants.NAME_BOUNDINGBOXRENDERER;
        /**
         * Color of the bounding box lines placed in front of an object
         */
        this.frontColor = new Color3(1, 1, 1);
        /**
         * Color of the bounding box lines placed behind an object
         */
        this.backColor = new Color3(0.1, 0.1, 0.1);
        /**
         * Defines if the renderer should show the back lines or not
         */
        this.showBackLines = true;
        /**
         * Observable raised before rendering a bounding box
         */
        this.onBeforeBoxRenderingObservable = new Observable();
        /**
         * Observable raised after rendering a bounding box
         */
        this.onAfterBoxRenderingObservable = new Observable();
        /**
         * Observable raised after resources are created
         */
        this.onResourcesReadyObservable = new Observable();
        /**
         * When false, no bounding boxes will be rendered
         */
        this.enabled = true;
        /**
         * @hidden
         */
        this.renderList = new SmartArray(32);
        this._vertexBuffers = {};
        this._fillIndexBuffer = null;
        this._fillIndexData = null;
        this.scene = scene;
        scene._addComponent(this);
        this._uniformBufferFront = new UniformBuffer(this.scene.getEngine(), undefined, undefined, "BoundingBoxRendererFront", !this.scene.getEngine().isWebGPU);
        this._buildUniformLayout(this._uniformBufferFront);
        this._uniformBufferBack = new UniformBuffer(this.scene.getEngine(), undefined, undefined, "BoundingBoxRendererBack", !this.scene.getEngine().isWebGPU);
        this._buildUniformLayout(this._uniformBufferBack);
    }
    BoundingBoxRenderer.prototype._buildUniformLayout = function (ubo) {
        ubo.addUniform("color", 4);
        ubo.addUniform("world", 16);
        ubo.addUniform("viewProjection", 16);
        ubo.addUniform("viewProjectionR", 16);
        ubo.create();
    };
    /**
     * Registers the component in a given scene
     */
    BoundingBoxRenderer.prototype.register = function () {
        this.scene._beforeEvaluateActiveMeshStage.registerStep(SceneComponentConstants.STEP_BEFOREEVALUATEACTIVEMESH_BOUNDINGBOXRENDERER, this, this.reset);
        this.scene._preActiveMeshStage.registerStep(SceneComponentConstants.STEP_PREACTIVEMESH_BOUNDINGBOXRENDERER, this, this._preActiveMesh);
        this.scene._evaluateSubMeshStage.registerStep(SceneComponentConstants.STEP_EVALUATESUBMESH_BOUNDINGBOXRENDERER, this, this._evaluateSubMesh);
        this.scene._afterRenderingGroupDrawStage.registerStep(SceneComponentConstants.STEP_AFTERRENDERINGGROUPDRAW_BOUNDINGBOXRENDERER, this, this.render);
    };
    BoundingBoxRenderer.prototype._evaluateSubMesh = function (mesh, subMesh) {
        if (mesh.showSubMeshesBoundingBox) {
            var boundingInfo = subMesh.getBoundingInfo();
            if (boundingInfo !== null && boundingInfo !== undefined) {
                boundingInfo.boundingBox._tag = mesh.renderingGroupId;
                this.renderList.push(boundingInfo.boundingBox);
            }
        }
    };
    BoundingBoxRenderer.prototype._preActiveMesh = function (mesh) {
        if (mesh.showBoundingBox || this.scene.forceShowBoundingBoxes) {
            var boundingInfo = mesh.getBoundingInfo();
            boundingInfo.boundingBox._tag = mesh.renderingGroupId;
            this.renderList.push(boundingInfo.boundingBox);
        }
    };
    BoundingBoxRenderer.prototype._prepareResources = function () {
        if (this._colorShader) {
            return;
        }
        this._colorShader = new ShaderMaterial("colorShader", this.scene, "boundingBoxRenderer", {
            attributes: [VertexBuffer.PositionKind],
            uniforms: ["world", "viewProjection", "viewProjectionR", "color"],
            uniformBuffers: ["BoundingBoxRenderer"],
        }, false);
        this._colorShader.reservedDataStore = {
            hidden: true,
        };
        this._colorShaderForOcclusionQuery = new ShaderMaterial("colorShaderOccQuery", this.scene, "boundingBoxRenderer", {
            attributes: [VertexBuffer.PositionKind],
            uniforms: ["world", "viewProjection", "viewProjectionR", "color"],
            uniformBuffers: ["BoundingBoxRenderer"],
        }, true);
        this._colorShaderForOcclusionQuery.reservedDataStore = {
            hidden: true,
        };
        var engine = this.scene.getEngine();
        var boxdata = CreateBoxVertexData({ size: 1.0 });
        this._vertexBuffers[VertexBuffer.PositionKind] = new VertexBuffer(engine, boxdata.positions, VertexBuffer.PositionKind, false);
        this._createIndexBuffer();
        this._fillIndexData = boxdata.indices;
        this.onResourcesReadyObservable.notifyObservers(this);
    };
    BoundingBoxRenderer.prototype._createIndexBuffer = function () {
        var engine = this.scene.getEngine();
        this._indexBuffer = engine.createIndexBuffer([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 7, 1, 6, 2, 5, 3, 4]);
    };
    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    BoundingBoxRenderer.prototype.rebuild = function () {
        var vb = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vb) {
            vb._rebuild();
        }
        this._createIndexBuffer();
    };
    /**
     * @hidden
     */
    BoundingBoxRenderer.prototype.reset = function () {
        this.renderList.reset();
    };
    /**
     * Render the bounding boxes of a specific rendering group
     * @param renderingGroupId defines the rendering group to render
     */
    BoundingBoxRenderer.prototype.render = function (renderingGroupId) {
        var _a, _b;
        if (this.renderList.length === 0 || !this.enabled) {
            return;
        }
        this._prepareResources();
        if (!this._colorShader.isReady()) {
            return;
        }
        var engine = this.scene.getEngine();
        engine.setDepthWrite(false);
        var frontColor = this.frontColor.toColor4();
        var backColor = this.backColor.toColor4();
        var transformMatrix = this.scene.getTransformMatrix();
        for (var boundingBoxIndex = 0; boundingBoxIndex < this.renderList.length; boundingBoxIndex++) {
            var boundingBox = this.renderList.data[boundingBoxIndex];
            if (boundingBox._tag !== renderingGroupId) {
                continue;
            }
            this._createWrappersForBoundingBox(boundingBox);
            this.onBeforeBoxRenderingObservable.notifyObservers(boundingBox);
            var min = boundingBox.minimum;
            var max = boundingBox.maximum;
            var diff = max.subtract(min);
            var median = min.add(diff.scale(0.5));
            var worldMatrix = Matrix.Scaling(diff.x, diff.y, diff.z).multiply(Matrix.Translation(median.x, median.y, median.z)).multiply(boundingBox.getWorldMatrix());
            var useReverseDepthBuffer = engine.useReverseDepthBuffer;
            if (this.showBackLines) {
                var drawWrapperBack = (_a = boundingBox._drawWrapperBack) !== null && _a !== void 0 ? _a : this._colorShader._getDrawWrapper();
                this._colorShader._preBind(drawWrapperBack);
                engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._colorShader.getEffect());
                // Back
                if (useReverseDepthBuffer) {
                    engine.setDepthFunctionToLessOrEqual();
                }
                else {
                    engine.setDepthFunctionToGreaterOrEqual();
                }
                this._uniformBufferBack.bindToEffect(drawWrapperBack.effect, "BoundingBoxRenderer");
                this._uniformBufferBack.updateDirectColor4("color", backColor);
                this._uniformBufferBack.updateMatrix("world", worldMatrix);
                this._uniformBufferBack.updateMatrix("viewProjection", transformMatrix);
                this._uniformBufferBack.update();
                // Draw order
                engine.drawElementsType(Material.LineListDrawMode, 0, 24);
            }
            var drawWrapperFront = (_b = boundingBox._drawWrapperFront) !== null && _b !== void 0 ? _b : this._colorShader._getDrawWrapper();
            this._colorShader._preBind(drawWrapperFront);
            engine.bindBuffers(this._vertexBuffers, this._indexBuffer, this._colorShader.getEffect());
            // Front
            if (useReverseDepthBuffer) {
                engine.setDepthFunctionToGreater();
            }
            else {
                engine.setDepthFunctionToLess();
            }
            this._uniformBufferFront.bindToEffect(drawWrapperFront.effect, "BoundingBoxRenderer");
            this._uniformBufferFront.updateDirectColor4("color", frontColor);
            this._uniformBufferFront.updateMatrix("world", worldMatrix);
            this._uniformBufferFront.updateMatrix("viewProjection", transformMatrix);
            this._uniformBufferFront.update();
            // Draw order
            engine.drawElementsType(Material.LineListDrawMode, 0, 24);
            this.onAfterBoxRenderingObservable.notifyObservers(boundingBox);
        }
        this._colorShader.unbind();
        engine.setDepthFunctionToLessOrEqual();
        engine.setDepthWrite(true);
    };
    BoundingBoxRenderer.prototype._createWrappersForBoundingBox = function (boundingBox) {
        if (!boundingBox._drawWrapperFront) {
            var engine = this.scene.getEngine();
            boundingBox._drawWrapperFront = new DrawWrapper(engine);
            boundingBox._drawWrapperBack = new DrawWrapper(engine);
            boundingBox._drawWrapperFront.setEffect(this._colorShader.getEffect());
            boundingBox._drawWrapperBack.setEffect(this._colorShader.getEffect());
        }
    };
    /**
     * In case of occlusion queries, we can render the occlusion bounding box through this method
     * @param mesh Define the mesh to render the occlusion bounding box for
     */
    BoundingBoxRenderer.prototype.renderOcclusionBoundingBox = function (mesh) {
        var engine = this.scene.getEngine();
        if (this._renderPassIdForOcclusionQuery === undefined) {
            this._renderPassIdForOcclusionQuery = engine.createRenderPassId("Render pass for occlusion query");
        }
        var currentRenderPassId = engine.currentRenderPassId;
        engine.currentRenderPassId = this._renderPassIdForOcclusionQuery;
        this._prepareResources();
        var subMesh = mesh.subMeshes[0];
        if (!this._colorShaderForOcclusionQuery.isReady(mesh, undefined, subMesh) || !mesh.hasBoundingInfo) {
            engine.currentRenderPassId = currentRenderPassId;
            return;
        }
        if (!this._fillIndexBuffer) {
            this._fillIndexBuffer = engine.createIndexBuffer(this._fillIndexData);
        }
        var useReverseDepthBuffer = engine.useReverseDepthBuffer;
        engine.setDepthWrite(false);
        engine.setColorWrite(false);
        var boundingBox = mesh.getBoundingInfo().boundingBox;
        var min = boundingBox.minimum;
        var max = boundingBox.maximum;
        var diff = max.subtract(min);
        var median = min.add(diff.scale(0.5));
        var worldMatrix = Matrix.Scaling(diff.x, diff.y, diff.z).multiply(Matrix.Translation(median.x, median.y, median.z)).multiply(boundingBox.getWorldMatrix());
        var drawWrapper = subMesh._drawWrapper;
        this._colorShaderForOcclusionQuery._preBind(drawWrapper);
        engine.bindBuffers(this._vertexBuffers, this._fillIndexBuffer, drawWrapper.effect);
        if (useReverseDepthBuffer) {
            engine.setDepthFunctionToGreater();
        }
        else {
            engine.setDepthFunctionToLess();
        }
        this.scene.resetCachedMaterial();
        this._uniformBufferFront.bindToEffect(drawWrapper.effect, "BoundingBoxRenderer");
        this._uniformBufferFront.updateMatrix("world", worldMatrix);
        this._uniformBufferFront.updateMatrix("viewProjection", this.scene.getTransformMatrix());
        this._uniformBufferFront.update();
        engine.drawElementsType(Material.TriangleFillMode, 0, 36);
        this._colorShaderForOcclusionQuery.unbind();
        engine.setDepthFunctionToLessOrEqual();
        engine.setDepthWrite(true);
        engine.setColorWrite(true);
        engine.currentRenderPassId = currentRenderPassId;
    };
    /**
     * Dispose and release the resources attached to this renderer.
     */
    BoundingBoxRenderer.prototype.dispose = function () {
        if (this._renderPassIdForOcclusionQuery !== undefined) {
            this.scene.getEngine().releaseRenderPassId(this._renderPassIdForOcclusionQuery);
            this._renderPassIdForOcclusionQuery = undefined;
        }
        if (!this._colorShader) {
            return;
        }
        this.onBeforeBoxRenderingObservable.clear();
        this.onAfterBoxRenderingObservable.clear();
        this.onResourcesReadyObservable.clear();
        this.renderList.dispose();
        this._colorShader.dispose();
        this._colorShaderForOcclusionQuery.dispose();
        this._uniformBufferFront.dispose();
        this._uniformBufferBack.dispose();
        var buffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (buffer) {
            buffer.dispose();
            this._vertexBuffers[VertexBuffer.PositionKind] = null;
        }
        this.scene.getEngine()._releaseBuffer(this._indexBuffer);
        if (this._fillIndexBuffer) {
            this.scene.getEngine()._releaseBuffer(this._fillIndexBuffer);
            this._fillIndexBuffer = null;
        }
    };
    return BoundingBoxRenderer;
}());
export { BoundingBoxRenderer };
//# sourceMappingURL=boundingBoxRenderer.js.map