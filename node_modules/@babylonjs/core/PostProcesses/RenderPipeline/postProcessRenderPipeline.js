import { __decorate } from "tslib";
import { Tools } from "../../Misc/tools.js";
import { serialize } from "../../Misc/decorators.js";
/**
 * PostProcessRenderPipeline
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocessrenderpipeline
 */
var PostProcessRenderPipeline = /** @class */ (function () {
    /**
     * Initializes a PostProcessRenderPipeline
     * @param _engine engine to add the pipeline to
     * @param name name of the pipeline
     */
    function PostProcessRenderPipeline(_engine, name) {
        this._engine = _engine;
        this._name = name;
        this._renderEffects = {};
        this._renderEffectsForIsolatedPass = new Array();
        this._cameras = [];
    }
    Object.defineProperty(PostProcessRenderPipeline.prototype, "name", {
        /**
         * Gets pipeline name
         */
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PostProcessRenderPipeline.prototype, "cameras", {
        /** Gets the list of attached cameras */
        get: function () {
            return this._cameras;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the class name
     * @returns "PostProcessRenderPipeline"
     */
    PostProcessRenderPipeline.prototype.getClassName = function () {
        return "PostProcessRenderPipeline";
    };
    Object.defineProperty(PostProcessRenderPipeline.prototype, "isSupported", {
        /**
         * If all the render effects in the pipeline are supported
         */
        get: function () {
            for (var renderEffectName in this._renderEffects) {
                if (Object.prototype.hasOwnProperty.call(this._renderEffects, renderEffectName)) {
                    if (!this._renderEffects[renderEffectName].isSupported) {
                        return false;
                    }
                }
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds an effect to the pipeline
     * @param renderEffect the effect to add
     */
    PostProcessRenderPipeline.prototype.addEffect = function (renderEffect) {
        this._renderEffects[renderEffect._name] = renderEffect;
    };
    // private
    /** @hidden */
    PostProcessRenderPipeline.prototype._rebuild = function () { };
    /**
     * @param renderEffectName
     * @param cameras
     * @hidden
     */
    PostProcessRenderPipeline.prototype._enableEffect = function (renderEffectName, cameras) {
        var renderEffects = this._renderEffects[renderEffectName];
        if (!renderEffects) {
            return;
        }
        renderEffects._enable(Tools.MakeArray(cameras || this._cameras));
    };
    /**
     * @param renderEffectName
     * @param cameras
     * @hidden
     */
    PostProcessRenderPipeline.prototype._disableEffect = function (renderEffectName, cameras) {
        var renderEffects = this._renderEffects[renderEffectName];
        if (!renderEffects) {
            return;
        }
        renderEffects._disable(Tools.MakeArray(cameras || this._cameras));
    };
    /**
     * @param cameras
     * @param unique
     * @hidden
     */
    PostProcessRenderPipeline.prototype._attachCameras = function (cameras, unique) {
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        var indicesToDelete = [];
        var i;
        for (i = 0; i < cams.length; i++) {
            var camera = cams[i];
            if (!camera) {
                continue;
            }
            var cameraName = camera.name;
            if (this._cameras.indexOf(camera) === -1) {
                this._cameras[cameraName] = camera;
            }
            else if (unique) {
                indicesToDelete.push(i);
            }
        }
        for (i = 0; i < indicesToDelete.length; i++) {
            cams.splice(indicesToDelete[i], 1);
        }
        for (var renderEffectName in this._renderEffects) {
            if (Object.prototype.hasOwnProperty.call(this._renderEffects, renderEffectName)) {
                this._renderEffects[renderEffectName]._attachCameras(cams);
            }
        }
    };
    /**
     * @param cameras
     * @hidden
     */
    PostProcessRenderPipeline.prototype._detachCameras = function (cameras) {
        var cams = Tools.MakeArray(cameras || this._cameras);
        if (!cams) {
            return;
        }
        for (var renderEffectName in this._renderEffects) {
            if (Object.prototype.hasOwnProperty.call(this._renderEffects, renderEffectName)) {
                this._renderEffects[renderEffectName]._detachCameras(cams);
            }
        }
        for (var i = 0; i < cams.length; i++) {
            this._cameras.splice(this._cameras.indexOf(cams[i]), 1);
        }
    };
    /** @hidden */
    PostProcessRenderPipeline.prototype._update = function () {
        for (var renderEffectName in this._renderEffects) {
            if (Object.prototype.hasOwnProperty.call(this._renderEffects, renderEffectName)) {
                this._renderEffects[renderEffectName]._update();
            }
        }
        for (var i = 0; i < this._cameras.length; i++) {
            if (!this._cameras[i]) {
                continue;
            }
            var cameraName = this._cameras[i].name;
            if (this._renderEffectsForIsolatedPass[cameraName]) {
                this._renderEffectsForIsolatedPass[cameraName]._update();
            }
        }
    };
    /** @hidden */
    PostProcessRenderPipeline.prototype._reset = function () {
        this._renderEffects = {};
        this._renderEffectsForIsolatedPass = new Array();
    };
    PostProcessRenderPipeline.prototype._enableMSAAOnFirstPostProcess = function (sampleCount) {
        if (!this._engine._features.supportMSAA) {
            return false;
        }
        // Set samples of the very first post process to 4 to enable native anti-aliasing in browsers that support webGL 2.0 (See: https://github.com/BabylonJS/Babylon.js/issues/3754)
        var effectKeys = Object.keys(this._renderEffects);
        if (effectKeys.length > 0) {
            var postProcesses = this._renderEffects[effectKeys[0]].getPostProcesses();
            if (postProcesses) {
                postProcesses[0].samples = sampleCount;
            }
        }
        return true;
    };
    /**
     * Sets the required values to the prepass renderer.
     * @param prePassRenderer defines the prepass renderer to setup.
     * @returns true if the pre pass is needed.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    PostProcessRenderPipeline.prototype.setPrePassRenderer = function (prePassRenderer) {
        // Do Nothing by default
        return false;
    };
    /**
     * Disposes of the pipeline
     */
    PostProcessRenderPipeline.prototype.dispose = function () {
        // Must be implemented by children
    };
    __decorate([
        serialize()
    ], PostProcessRenderPipeline.prototype, "_name", void 0);
    return PostProcessRenderPipeline;
}());
export { PostProcessRenderPipeline };
//# sourceMappingURL=postProcessRenderPipeline.js.map