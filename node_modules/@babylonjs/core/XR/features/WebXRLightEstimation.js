import { __extends } from "tslib";
import { WebGLHardwareTexture } from "../../Engines/WebGL/webGLHardwareTexture.js";
import { InternalTexture, InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { Observable } from "../../Misc/observable.js";
import { Tools } from "../../Misc/tools.js";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";

import { Color3 } from "../../Maths/math.color.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { DirectionalLight } from "../../Lights/directionalLight.js";
import { BaseTexture } from "../../Materials/Textures/baseTexture.js";
import { SphericalHarmonics, SphericalPolynomial } from "../../Maths/sphericalPolynomial.js";
import { LightConstants } from "../../Lights/lightConstants.js";
/**
 * Light Estimation Feature
 *
 * @since 5.0.0
 */
var WebXRLightEstimation = /** @class */ (function (_super) {
    __extends(WebXRLightEstimation, _super);
    /**
     * Creates a new instance of the light estimation feature
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param options options to use when constructing this feature
     */
    function WebXRLightEstimation(_xrSessionManager, 
    /**
     * options to use when constructing this feature
     */
    options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this.options = options;
        _this._canvasContext = null;
        _this._reflectionCubeMap = null;
        _this._xrLightEstimate = null;
        _this._xrLightProbe = null;
        _this._xrWebGLBinding = null;
        _this._lightDirection = Vector3.Up().negateInPlace();
        _this._lightColor = Color3.White();
        _this._intensity = 1;
        _this._sphericalHarmonics = new SphericalHarmonics();
        _this._cubeMapPollTime = Date.now();
        _this._lightEstimationPollTime = Date.now();
        /**
         * ARCore's reflection cube map size is 16x16.
         * Once other systems support this feature we will need to change this to be dynamic.
         * see https://github.com/immersive-web/lighting-estimation/blob/main/lighting-estimation-explainer.md#cube-map-open-questions
         */
        _this._reflectionCubeMapTextureSize = 16;
        /**
         * If createDirectionalLightSource is set to true this light source will be created automatically.
         * Otherwise this can be set with an external directional light source.
         * This light will be updated whenever the light estimation values change.
         */
        _this.directionalLight = null;
        /**
         * This observable will notify when the reflection cube map is updated.
         */
        _this.onReflectionCubeMapUpdatedObservable = new Observable();
        /**
         * Event Listener for "reflectionchange" events.
         */
        _this._updateReflectionCubeMap = function () {
            var _a;
            if (!_this._xrLightProbe) {
                return;
            }
            // check poll time, do not update if it has not been long enough
            if (_this.options.cubeMapPollInterval) {
                var now = Date.now();
                if (now - _this._cubeMapPollTime < _this.options.cubeMapPollInterval) {
                    return;
                }
                _this._cubeMapPollTime = now;
            }
            var lp = _this._getXRGLBinding().getReflectionCubeMap(_this._xrLightProbe);
            if (lp && _this._reflectionCubeMap) {
                if (!_this._reflectionCubeMap._texture) {
                    var internalTexture = new InternalTexture(_this._xrSessionManager.scene.getEngine(), InternalTextureSource.Unknown);
                    internalTexture.isCube = true;
                    internalTexture.invertY = false;
                    internalTexture._useSRGBBuffer = _this.options.reflectionFormat === "srgba8";
                    internalTexture.format = 5;
                    internalTexture.generateMipMaps = true;
                    internalTexture.type = _this.options.reflectionFormat !== "srgba8" ? 2 : 0;
                    internalTexture.samplingMode = 3;
                    internalTexture.width = _this._reflectionCubeMapTextureSize;
                    internalTexture.height = _this._reflectionCubeMapTextureSize;
                    internalTexture._cachedWrapU = 1;
                    internalTexture._cachedWrapV = 1;
                    internalTexture._hardwareTexture = new WebGLHardwareTexture(lp, _this._getCanvasContext());
                    _this._reflectionCubeMap._texture = internalTexture;
                }
                else {
                    (_a = _this._reflectionCubeMap._texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.set(lp);
                    _this._reflectionCubeMap._texture.getEngine().resetTextureCache();
                }
                _this._reflectionCubeMap._texture.isReady = true;
                _this._xrSessionManager.scene.markAllMaterialsAsDirty(1);
                _this.onReflectionCubeMapUpdatedObservable.notifyObservers(_this._reflectionCubeMap);
            }
        };
        _this.xrNativeFeatureName = "light-estimation";
        if (_this.options.createDirectionalLightSource) {
            _this.directionalLight = new DirectionalLight("light estimation directional", _this._lightDirection, _this._xrSessionManager.scene);
            _this.directionalLight.position = new Vector3(0, 8, 0);
            // intensity will be set later
            _this.directionalLight.intensity = 0;
            _this.directionalLight.falloffType = LightConstants.FALLOFF_GLTF;
        }
        // https://immersive-web.github.io/lighting-estimation/
        Tools.Warn("light-estimation is an experimental and unstable feature.");
        return _this;
    }
    Object.defineProperty(WebXRLightEstimation.prototype, "reflectionCubeMapTexture", {
        /**
         * While the estimated cube map is expected to update over time to better reflect the user's environment as they move around those changes are unlikely to happen with every XRFrame.
         * Since creating and processing the cube map is potentially expensive, especially if mip maps are needed, you can listen to the onReflectionCubeMapUpdatedObservable to determine
         * when it has been updated.
         */
        get: function () {
            return this._reflectionCubeMap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRLightEstimation.prototype, "xrLightingEstimate", {
        /**
         * The most recent light estimate.  Available starting on the first frame where the device provides a light probe.
         */
        get: function () {
            if (this._xrLightEstimate) {
                return {
                    lightColor: this._lightColor,
                    lightDirection: this._lightDirection,
                    lightIntensity: this._intensity,
                    sphericalHarmonics: this._sphericalHarmonics,
                };
            }
            return this._xrLightEstimate;
        },
        enumerable: false,
        configurable: true
    });
    WebXRLightEstimation.prototype._getCanvasContext = function () {
        if (this._canvasContext === null) {
            this._canvasContext = this._xrSessionManager.scene.getEngine()._gl;
        }
        return this._canvasContext;
    };
    WebXRLightEstimation.prototype._getXRGLBinding = function () {
        if (this._xrWebGLBinding === null) {
            var context_1 = this._getCanvasContext();
            this._xrWebGLBinding = new XRWebGLBinding(this._xrSessionManager.session, context_1);
        }
        return this._xrWebGLBinding;
    };
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRLightEstimation.prototype.attach = function () {
        var _this = this;
        var _a;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        var reflectionFormat = (_a = this.options.reflectionFormat) !== null && _a !== void 0 ? _a : (this._xrSessionManager.session.preferredReflectionFormat || "srgba8");
        this.options.reflectionFormat = reflectionFormat;
        this._xrSessionManager.session
            .requestLightProbe({
            reflectionFormat: reflectionFormat,
        })
            .then(function (xrLightProbe) {
            _this._xrLightProbe = xrLightProbe;
            if (!_this.options.disableCubeMapReflection) {
                if (!_this._reflectionCubeMap) {
                    _this._reflectionCubeMap = new BaseTexture(_this._xrSessionManager.scene);
                    _this._reflectionCubeMap.isCube = true;
                    _this._reflectionCubeMap.coordinatesMode = 3;
                    if (_this.options.setSceneEnvironmentTexture) {
                        _this._xrSessionManager.scene.environmentTexture = _this._reflectionCubeMap;
                    }
                }
                _this._xrLightProbe.addEventListener("reflectionchange", _this._updateReflectionCubeMap);
            }
        });
        return true;
    };
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRLightEstimation.prototype.detach = function () {
        var detached = _super.prototype.detach.call(this);
        if (this._xrLightProbe !== null && !this.options.disableCubeMapReflection) {
            this._xrLightProbe.removeEventListener("reflectionchange", this._updateReflectionCubeMap);
            this._xrLightProbe = null;
        }
        this._canvasContext = null;
        this._xrLightEstimate = null;
        // When the session ends (on detach) we must clear our XRWebGLBinging instance, which references the ended session.
        this._xrWebGLBinding = null;
        return detached;
    };
    /**
     * Dispose this feature and all of the resources attached
     */
    WebXRLightEstimation.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onReflectionCubeMapUpdatedObservable.clear();
        if (this.directionalLight) {
            this.directionalLight.dispose();
            this.directionalLight = null;
        }
        if (this._reflectionCubeMap !== null) {
            if (this._reflectionCubeMap._texture) {
                this._reflectionCubeMap._texture.dispose();
            }
            this._reflectionCubeMap.dispose();
            this._reflectionCubeMap = null;
        }
    };
    WebXRLightEstimation.prototype._onXRFrame = function (_xrFrame) {
        var _a;
        if (this._xrLightProbe !== null) {
            if (this.options.lightEstimationPollInterval) {
                var now = Date.now();
                if (now - this._lightEstimationPollTime < this.options.lightEstimationPollInterval) {
                    return;
                }
                this._lightEstimationPollTime = now;
            }
            this._xrLightEstimate = _xrFrame.getLightEstimate(this._xrLightProbe);
            if (this._xrLightEstimate) {
                this._intensity = Math.max(1.0, this._xrLightEstimate.primaryLightIntensity.x, this._xrLightEstimate.primaryLightIntensity.y, this._xrLightEstimate.primaryLightIntensity.z);
                var rhsFactor = this._xrSessionManager.scene.useRightHandedSystem ? 1.0 : -1.0;
                // recreate the vector caches, so that the last one provided to the user will persist
                if (this.options.disableVectorReuse) {
                    this._lightDirection = new Vector3();
                    this._lightColor = new Color3();
                    if (this.directionalLight) {
                        this.directionalLight.direction = this._lightDirection;
                        this.directionalLight.diffuse = this._lightColor;
                    }
                }
                this._lightDirection.copyFromFloats(this._xrLightEstimate.primaryLightDirection.x, this._xrLightEstimate.primaryLightDirection.y, this._xrLightEstimate.primaryLightDirection.z * rhsFactor);
                this._lightColor.copyFromFloats(this._xrLightEstimate.primaryLightIntensity.x / this._intensity, this._xrLightEstimate.primaryLightIntensity.y / this._intensity, this._xrLightEstimate.primaryLightIntensity.z / this._intensity);
                this._sphericalHarmonics.updateFromFloatsArray(this._xrLightEstimate.sphericalHarmonicsCoefficients);
                if (this._reflectionCubeMap && !this.options.disableSphericalPolynomial) {
                    this._reflectionCubeMap.sphericalPolynomial = this._reflectionCubeMap.sphericalPolynomial || new SphericalPolynomial();
                    (_a = this._reflectionCubeMap.sphericalPolynomial) === null || _a === void 0 ? void 0 : _a.updateFromHarmonics(this._sphericalHarmonics);
                }
                // direction from instead of direction to
                this._lightDirection.negateInPlace();
                // set the values after calculating them
                if (this.directionalLight) {
                    this.directionalLight.direction.copyFrom(this._lightDirection);
                    this.directionalLight.intensity = Math.min(this._intensity, 1.0);
                    this.directionalLight.diffuse.copyFrom(this._lightColor);
                }
            }
        }
    };
    /**
     * The module's name
     */
    WebXRLightEstimation.Name = WebXRFeatureName.LIGHT_ESTIMATION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRLightEstimation.Version = 1;
    return WebXRLightEstimation;
}(WebXRAbstractFeature));
export { WebXRLightEstimation };
// register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRLightEstimation.Name, function (xrSessionManager, options) {
    return function () { return new WebXRLightEstimation(xrSessionManager, options); };
}, WebXRLightEstimation.Version, false);
//# sourceMappingURL=WebXRLightEstimation.js.map