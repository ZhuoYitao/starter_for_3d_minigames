import { __decorate } from "tslib";
import { serializeAsMeshReference, serializeAsVector3, SerializationHelper } from "../Misc/decorators.js";
import { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture.js";
import { Matrix, Vector3 } from "../Maths/math.vector.js";
import { AbstractScene } from "../abstractScene.js";

AbstractScene.prototype.removeReflectionProbe = function (toRemove) {
    if (!this.reflectionProbes) {
        return -1;
    }
    var index = this.reflectionProbes.indexOf(toRemove);
    if (index !== -1) {
        this.reflectionProbes.splice(index, 1);
    }
    return index;
};
AbstractScene.prototype.addReflectionProbe = function (newReflectionProbe) {
    if (!this.reflectionProbes) {
        this.reflectionProbes = [];
    }
    this.reflectionProbes.push(newReflectionProbe);
};
/**
 * Class used to generate realtime reflection / refraction cube textures
 * @see https://doc.babylonjs.com/how_to/how_to_use_reflection_probes
 */
var ReflectionProbe = /** @class */ (function () {
    /**
     * Creates a new reflection probe
     * @param name defines the name of the probe
     * @param size defines the texture resolution (for each face)
     * @param scene defines the hosting scene
     * @param generateMipMaps defines if mip maps should be generated automatically (true by default)
     * @param useFloat defines if HDR data (float data) should be used to store colors (false by default)
     * @param linearSpace defines if the probe should be generated in linear space or not (false by default)
     */
    function ReflectionProbe(
    /** defines the name of the probe */
    name, size, scene, generateMipMaps, useFloat, linearSpace) {
        if (generateMipMaps === void 0) { generateMipMaps = true; }
        if (useFloat === void 0) { useFloat = false; }
        if (linearSpace === void 0) { linearSpace = false; }
        var _this = this;
        this.name = name;
        this._viewMatrix = Matrix.Identity();
        this._target = Vector3.Zero();
        this._add = Vector3.Zero();
        this._invertYAxis = false;
        /** Gets or sets probe position (center of the cube map) */
        this.position = Vector3.Zero();
        /** @hidden */
        this._parentContainer = null;
        this._scene = scene;
        if (scene.getEngine().supportsUniformBuffers) {
            this._sceneUBOs = [];
            for (var i = 0; i < 6; ++i) {
                this._sceneUBOs.push(scene.createSceneUniformBuffer("Scene for Reflection Probe (name \"".concat(name, "\") face #").concat(i)));
            }
        }
        // Create the scene field if not exist.
        if (!this._scene.reflectionProbes) {
            this._scene.reflectionProbes = new Array();
        }
        this._scene.reflectionProbes.push(this);
        var textureType = 0;
        if (useFloat) {
            var caps = this._scene.getEngine().getCaps();
            if (caps.textureHalfFloatRender) {
                textureType = 2;
            }
            else if (caps.textureFloatRender) {
                textureType = 1;
            }
        }
        this._renderTargetTexture = new RenderTargetTexture(name, size, scene, generateMipMaps, true, textureType, true);
        this._renderTargetTexture.gammaSpace = !linearSpace;
        var useReverseDepthBuffer = scene.getEngine().useReverseDepthBuffer;
        this._renderTargetTexture.onBeforeRenderObservable.add(function (faceIndex) {
            if (_this._sceneUBOs) {
                scene.setSceneUniformBuffer(_this._sceneUBOs[faceIndex]);
                scene.getSceneUniformBuffer().unbindEffect();
            }
            switch (faceIndex) {
                case 0:
                    _this._add.copyFromFloats(1, 0, 0);
                    break;
                case 1:
                    _this._add.copyFromFloats(-1, 0, 0);
                    break;
                case 2:
                    _this._add.copyFromFloats(0, _this._invertYAxis ? 1 : -1, 0);
                    break;
                case 3:
                    _this._add.copyFromFloats(0, _this._invertYAxis ? -1 : 1, 0);
                    break;
                case 4:
                    _this._add.copyFromFloats(0, 0, scene.useRightHandedSystem ? -1 : 1);
                    break;
                case 5:
                    _this._add.copyFromFloats(0, 0, scene.useRightHandedSystem ? 1 : -1);
                    break;
            }
            if (_this._attachedMesh) {
                _this.position.copyFrom(_this._attachedMesh.getAbsolutePosition());
            }
            _this.position.addToRef(_this._add, _this._target);
            var lookAtFunction = scene.useRightHandedSystem ? Matrix.LookAtRHToRef : Matrix.LookAtLHToRef;
            var perspectiveFunction = scene.useRightHandedSystem ? Matrix.PerspectiveFovRH : Matrix.PerspectiveFovLH;
            lookAtFunction(_this.position, _this._target, Vector3.Up(), _this._viewMatrix);
            if (scene.activeCamera) {
                _this._projectionMatrix = perspectiveFunction(Math.PI / 2, 1, useReverseDepthBuffer ? scene.activeCamera.maxZ : scene.activeCamera.minZ, useReverseDepthBuffer ? scene.activeCamera.minZ : scene.activeCamera.maxZ, _this._scene.getEngine().isNDCHalfZRange);
                scene.setTransformMatrix(_this._viewMatrix, _this._projectionMatrix);
                if (scene.activeCamera.isRigCamera && !_this._renderTargetTexture.activeCamera) {
                    _this._renderTargetTexture.activeCamera = scene.activeCamera.rigParent || null;
                }
            }
            scene._forcedViewPosition = _this.position;
        });
        var currentApplyByPostProcess;
        this._renderTargetTexture.onBeforeBindObservable.add(function () {
            var _a, _b;
            _this._currentSceneUBO = scene.getSceneUniformBuffer();
            (_b = (_a = scene.getEngine())._debugPushGroup) === null || _b === void 0 ? void 0 : _b.call(_a, "reflection probe generation for ".concat(name), 1);
            currentApplyByPostProcess = _this._scene.imageProcessingConfiguration.applyByPostProcess;
            if (linearSpace) {
                scene.imageProcessingConfiguration.applyByPostProcess = true;
            }
        });
        this._renderTargetTexture.onAfterUnbindObservable.add(function () {
            var _a, _b;
            scene.imageProcessingConfiguration.applyByPostProcess = currentApplyByPostProcess;
            scene._forcedViewPosition = null;
            if (_this._sceneUBOs) {
                scene.setSceneUniformBuffer(_this._currentSceneUBO);
            }
            scene.updateTransformMatrix(true);
            (_b = (_a = scene.getEngine())._debugPopGroup) === null || _b === void 0 ? void 0 : _b.call(_a, 1);
        });
    }
    Object.defineProperty(ReflectionProbe.prototype, "samples", {
        /** Gets or sets the number of samples to use for multi-sampling (0 by default). Required WebGL2 */
        get: function () {
            return this._renderTargetTexture.samples;
        },
        set: function (value) {
            this._renderTargetTexture.samples = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionProbe.prototype, "refreshRate", {
        /** Gets or sets the refresh rate to use (on every frame by default) */
        get: function () {
            return this._renderTargetTexture.refreshRate;
        },
        set: function (value) {
            this._renderTargetTexture.refreshRate = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the hosting scene
     * @returns a Scene
     */
    ReflectionProbe.prototype.getScene = function () {
        return this._scene;
    };
    Object.defineProperty(ReflectionProbe.prototype, "cubeTexture", {
        /** Gets the internal CubeTexture used to render to */
        get: function () {
            return this._renderTargetTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReflectionProbe.prototype, "renderList", {
        /** Gets the list of meshes to render */
        get: function () {
            return this._renderTargetTexture.renderList;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Attach the probe to a specific mesh (Rendering will be done from attached mesh's position)
     * @param mesh defines the mesh to attach to
     */
    ReflectionProbe.prototype.attachToMesh = function (mesh) {
        this._attachedMesh = mesh;
    };
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     */
    ReflectionProbe.prototype.setRenderingAutoClearDepthStencil = function (renderingGroupId, autoClearDepthStencil) {
        this._renderTargetTexture.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil);
    };
    /**
     * Clean all associated resources
     */
    ReflectionProbe.prototype.dispose = function () {
        var index = this._scene.reflectionProbes.indexOf(this);
        if (index !== -1) {
            // Remove from the scene if found
            this._scene.reflectionProbes.splice(index, 1);
        }
        if (this._parentContainer) {
            var index_1 = this._parentContainer.reflectionProbes.indexOf(this);
            if (index_1 > -1) {
                this._parentContainer.reflectionProbes.splice(index_1, 1);
            }
            this._parentContainer = null;
        }
        if (this._renderTargetTexture) {
            this._renderTargetTexture.dispose();
            this._renderTargetTexture = null;
        }
        if (this._sceneUBOs) {
            for (var _i = 0, _a = this._sceneUBOs; _i < _a.length; _i++) {
                var ubo = _a[_i];
                ubo.dispose();
            }
            this._sceneUBOs = [];
        }
    };
    /**
     * Converts the reflection probe information to a readable string for debug purpose.
     * @param fullDetails Supports for multiple levels of logging within scene loading
     * @returns the human readable reflection probe info
     */
    ReflectionProbe.prototype.toString = function (fullDetails) {
        var ret = "Name: " + this.name;
        if (fullDetails) {
            ret += ", position: " + this.position.toString();
            if (this._attachedMesh) {
                ret += ", attached mesh: " + this._attachedMesh.name;
            }
        }
        return ret;
    };
    /**
     * Get the class name of the refection probe.
     * @returns "ReflectionProbe"
     */
    ReflectionProbe.prototype.getClassName = function () {
        return "ReflectionProbe";
    };
    /**
     * Serialize the reflection probe to a JSON representation we can easily use in the respective Parse function.
     * @returns The JSON representation of the texture
     */
    ReflectionProbe.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this, this._renderTargetTexture.serialize());
        serializationObject.isReflectionProbe = true;
        return serializationObject;
    };
    /**
     * Parse the JSON representation of a reflection probe in order to recreate the reflection probe in the given scene.
     * @param parsedReflectionProbe Define the JSON representation of the reflection probe
     * @param scene Define the scene the parsed reflection probe should be instantiated in
     * @param rootUrl Define the root url of the parsing sequence in the case of relative dependencies
     * @returns The parsed reflection probe if successful
     */
    ReflectionProbe.Parse = function (parsedReflectionProbe, scene, rootUrl) {
        var reflectionProbe = null;
        if (scene.reflectionProbes) {
            for (var index = 0; index < scene.reflectionProbes.length; index++) {
                var rp = scene.reflectionProbes[index];
                if (rp.name === parsedReflectionProbe.name) {
                    reflectionProbe = rp;
                    break;
                }
            }
        }
        reflectionProbe = SerializationHelper.Parse(function () { return reflectionProbe || new ReflectionProbe(parsedReflectionProbe.name, parsedReflectionProbe.renderTargetSize, scene, parsedReflectionProbe._generateMipMaps); }, parsedReflectionProbe, scene, rootUrl);
        reflectionProbe.cubeTexture._waitingRenderList = parsedReflectionProbe.renderList;
        if (parsedReflectionProbe._attachedMesh) {
            reflectionProbe.attachToMesh(scene.getMeshById(parsedReflectionProbe._attachedMesh));
        }
        return reflectionProbe;
    };
    __decorate([
        serializeAsMeshReference()
    ], ReflectionProbe.prototype, "_attachedMesh", void 0);
    __decorate([
        serializeAsVector3()
    ], ReflectionProbe.prototype, "position", void 0);
    return ReflectionProbe;
}());
export { ReflectionProbe };
//# sourceMappingURL=reflectionProbe.js.map