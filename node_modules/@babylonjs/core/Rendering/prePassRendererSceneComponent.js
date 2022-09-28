import { Scene } from "../scene.js";
import { SceneComponentConstants } from "../sceneComponent.js";
import { PrePassRenderer } from "./prePassRenderer.js";
import { Logger } from "../Misc/logger.js";
Object.defineProperty(Scene.prototype, "prePassRenderer", {
    get: function () {
        return this._prePassRenderer;
    },
    set: function (value) {
        if (value && value.isSupported) {
            this._prePassRenderer = value;
        }
    },
    enumerable: true,
    configurable: true,
});
Scene.prototype.enablePrePassRenderer = function () {
    if (this._prePassRenderer) {
        return this._prePassRenderer;
    }
    this._prePassRenderer = new PrePassRenderer(this);
    if (!this._prePassRenderer.isSupported) {
        this._prePassRenderer = null;
        Logger.Error("PrePassRenderer needs WebGL 2 support.\n" + "Maybe you tried to use the following features that need the PrePassRenderer :\n" + " + Subsurface Scattering");
    }
    return this._prePassRenderer;
};
Scene.prototype.disablePrePassRenderer = function () {
    if (!this._prePassRenderer) {
        return;
    }
    this._prePassRenderer.dispose();
    this._prePassRenderer = null;
};
/**
 * Defines the Geometry Buffer scene component responsible to manage a G-Buffer useful
 * in several rendering techniques.
 */
var PrePassRendererSceneComponent = /** @class */ (function () {
    /**
     * Creates a new instance of the component for the given scene
     * @param scene Defines the scene to register the component in
     */
    function PrePassRendererSceneComponent(scene) {
        /**
         * The component name helpful to identify the component in the list of scene components.
         */
        this.name = SceneComponentConstants.NAME_PREPASSRENDERER;
        this.scene = scene;
    }
    /**
     * Registers the component in a given scene
     */
    PrePassRendererSceneComponent.prototype.register = function () {
        this.scene._beforeCameraDrawStage.registerStep(SceneComponentConstants.STEP_BEFORECAMERADRAW_PREPASS, this, this._beforeCameraDraw);
        this.scene._afterCameraDrawStage.registerStep(SceneComponentConstants.STEP_AFTERCAMERADRAW_PREPASS, this, this._afterCameraDraw);
        this.scene._beforeRenderTargetDrawStage.registerStep(SceneComponentConstants.STEP_BEFORERENDERTARGETDRAW_PREPASS, this, this._beforeRenderTargetDraw);
        this.scene._afterRenderTargetDrawStage.registerStep(SceneComponentConstants.STEP_AFTERCAMERADRAW_PREPASS, this, this._afterRenderTargetDraw);
        this.scene._beforeClearStage.registerStep(SceneComponentConstants.STEP_BEFORECLEARSTAGE_PREPASS, this, this._beforeClearStage);
        this.scene._beforeRenderTargetClearStage.registerStep(SceneComponentConstants.STEP_BEFORERENDERTARGETCLEARSTAGE_PREPASS, this, this._beforeRenderTargetClearStage);
        this.scene._beforeRenderingMeshStage.registerStep(SceneComponentConstants.STEP_BEFORERENDERINGMESH_PREPASS, this, this._beforeRenderingMeshStage);
        this.scene._afterRenderingMeshStage.registerStep(SceneComponentConstants.STEP_AFTERRENDERINGMESH_PREPASS, this, this._afterRenderingMeshStage);
    };
    PrePassRendererSceneComponent.prototype._beforeRenderTargetDraw = function (renderTarget, faceIndex, layer) {
        if (this.scene.prePassRenderer) {
            this.scene.prePassRenderer._setRenderTarget(renderTarget._prePassRenderTarget);
            this.scene.prePassRenderer._beforeDraw(undefined, faceIndex, layer);
        }
    };
    PrePassRendererSceneComponent.prototype._afterRenderTargetDraw = function (renderTarget, faceIndex, layer) {
        if (this.scene.prePassRenderer) {
            this.scene.prePassRenderer._afterDraw(faceIndex, layer);
        }
    };
    PrePassRendererSceneComponent.prototype._beforeRenderTargetClearStage = function (renderTarget) {
        if (this.scene.prePassRenderer) {
            if (!renderTarget._prePassRenderTarget) {
                renderTarget._prePassRenderTarget = this.scene.prePassRenderer._createRenderTarget(renderTarget.name + "_prePassRTT", renderTarget);
            }
            this.scene.prePassRenderer._setRenderTarget(renderTarget._prePassRenderTarget);
            this.scene.prePassRenderer._clear();
        }
    };
    PrePassRendererSceneComponent.prototype._beforeCameraDraw = function (camera) {
        if (this.scene.prePassRenderer) {
            this.scene.prePassRenderer._setRenderTarget(null);
            this.scene.prePassRenderer._beforeDraw(camera);
        }
    };
    PrePassRendererSceneComponent.prototype._afterCameraDraw = function () {
        if (this.scene.prePassRenderer) {
            this.scene.prePassRenderer._afterDraw();
        }
    };
    PrePassRendererSceneComponent.prototype._beforeClearStage = function () {
        if (this.scene.prePassRenderer) {
            this.scene.prePassRenderer._setRenderTarget(null);
            this.scene.prePassRenderer._clear();
        }
    };
    PrePassRendererSceneComponent.prototype._beforeRenderingMeshStage = function (mesh, subMesh, batch, effect) {
        if (!effect) {
            return;
        }
        // Render to MRT
        var scene = mesh.getScene();
        if (scene.prePassRenderer) {
            scene.prePassRenderer.bindAttachmentsForEffect(effect, subMesh);
        }
    };
    PrePassRendererSceneComponent.prototype._afterRenderingMeshStage = function (mesh) {
        var scene = mesh.getScene();
        if (scene.prePassRenderer) {
            scene.prePassRenderer.restoreAttachments();
        }
    };
    /**
     * Rebuilds the elements related to this component in case of
     * context lost for instance.
     */
    PrePassRendererSceneComponent.prototype.rebuild = function () {
        // Release textures first
        this.scene.disablePrePassRenderer();
        // Re-enable
        this.scene.enablePrePassRenderer();
    };
    /**
     * Disposes the component and the associated resources
     */
    PrePassRendererSceneComponent.prototype.dispose = function () {
        this.scene.disablePrePassRenderer();
    };
    return PrePassRendererSceneComponent;
}());
export { PrePassRendererSceneComponent };
PrePassRenderer._SceneComponentInitialization = function (scene) {
    // Register the G Buffer component to the scene.
    var component = scene._getComponent(SceneComponentConstants.NAME_PREPASSRENDERER);
    if (!component) {
        component = new PrePassRendererSceneComponent(scene);
        scene._addComponent(component);
    }
};
//# sourceMappingURL=prePassRendererSceneComponent.js.map