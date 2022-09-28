var _a;
import { __assign, __awaiter, __generator } from "tslib";
import { Tools } from "../Misc/tools.js";
/**
 * A list of the currently available features without referencing them
 */
var WebXRFeatureName = /** @class */ (function () {
    function WebXRFeatureName() {
    }
    /**
     * The name of the anchor system feature
     */
    WebXRFeatureName.ANCHOR_SYSTEM = "xr-anchor-system";
    /**
     * The name of the background remover feature
     */
    WebXRFeatureName.BACKGROUND_REMOVER = "xr-background-remover";
    /**
     * The name of the hit test feature
     */
    WebXRFeatureName.HIT_TEST = "xr-hit-test";
    /**
     * The name of the mesh detection feature
     */
    WebXRFeatureName.MESH_DETECTION = "xr-mesh-detection";
    /**
     * physics impostors for xr controllers feature
     */
    WebXRFeatureName.PHYSICS_CONTROLLERS = "xr-physics-controller";
    /**
     * The name of the plane detection feature
     */
    WebXRFeatureName.PLANE_DETECTION = "xr-plane-detection";
    /**
     * The name of the pointer selection feature
     */
    WebXRFeatureName.POINTER_SELECTION = "xr-controller-pointer-selection";
    /**
     * The name of the teleportation feature
     */
    WebXRFeatureName.TELEPORTATION = "xr-controller-teleportation";
    /**
     * The name of the feature points feature.
     */
    WebXRFeatureName.FEATURE_POINTS = "xr-feature-points";
    /**
     * The name of the hand tracking feature.
     */
    WebXRFeatureName.HAND_TRACKING = "xr-hand-tracking";
    /**
     * The name of the image tracking feature
     */
    WebXRFeatureName.IMAGE_TRACKING = "xr-image-tracking";
    /**
     * The name of the near interaction feature
     */
    WebXRFeatureName.NEAR_INTERACTION = "xr-near-interaction";
    /**
     * The name of the DOM overlay feature
     */
    WebXRFeatureName.DOM_OVERLAY = "xr-dom-overlay";
    /**
     * The name of the movement feature
     */
    WebXRFeatureName.MOVEMENT = "xr-controller-movement";
    /**
     * The name of the light estimation feature
     */
    WebXRFeatureName.LIGHT_ESTIMATION = "xr-light-estimation";
    /**
     * The name of the eye tracking feature
     */
    WebXRFeatureName.EYE_TRACKING = "xr-eye-tracking";
    /**
     * The name of the walking locomotion feature
     */
    WebXRFeatureName.WALKING_LOCOMOTION = "xr-walking-locomotion";
    /**
     * The name of the composition layers feature
     */
    WebXRFeatureName.LAYERS = "xr-layers";
    return WebXRFeatureName;
}());
export { WebXRFeatureName };
/**
 * The WebXR features manager is responsible of enabling or disabling features required for the current XR session.
 * It is mainly used in AR sessions.
 *
 * A feature can have a version that is defined by Babylon (and does not correspond with the webxr version).
 */
var WebXRFeaturesManager = /** @class */ (function () {
    /**
     * constructs a new features manages.
     *
     * @param _xrSessionManager an instance of WebXRSessionManager
     */
    function WebXRFeaturesManager(_xrSessionManager) {
        var _this = this;
        this._xrSessionManager = _xrSessionManager;
        this._features = {};
        // when session starts / initialized - attach
        this._xrSessionManager.onXRSessionInit.add(function () {
            _this.getEnabledFeatures().forEach(function (featureName) {
                var feature = _this._features[featureName];
                if (feature.enabled && !feature.featureImplementation.attached && !feature.featureImplementation.disableAutoAttach) {
                    _this.attachFeature(featureName);
                }
            });
        });
        // when session ends - detach
        this._xrSessionManager.onXRSessionEnded.add(function () {
            _this.getEnabledFeatures().forEach(function (featureName) {
                var feature = _this._features[featureName];
                if (feature.enabled && feature.featureImplementation.attached) {
                    // detach, but don't disable!
                    _this.detachFeature(featureName);
                }
            });
        });
    }
    /**
     * Used to register a module. After calling this function a developer can use this feature in the scene.
     * Mainly used internally.
     *
     * @param featureName the name of the feature to register
     * @param constructorFunction the function used to construct the module
     * @param version the (babylon) version of the module
     * @param stable is that a stable version of this module
     */
    WebXRFeaturesManager.AddWebXRFeature = function (featureName, constructorFunction, version, stable) {
        if (version === void 0) { version = 1; }
        if (stable === void 0) { stable = false; }
        this._AvailableFeatures[featureName] = this._AvailableFeatures[featureName] || { latest: version };
        if (version > this._AvailableFeatures[featureName].latest) {
            this._AvailableFeatures[featureName].latest = version;
        }
        if (stable) {
            this._AvailableFeatures[featureName].stable = version;
        }
        this._AvailableFeatures[featureName][version] = constructorFunction;
    };
    /**
     * Returns a constructor of a specific feature.
     *
     * @param featureName the name of the feature to construct
     * @param version the version of the feature to load
     * @param xrSessionManager the xrSessionManager. Used to construct the module
     * @param options optional options provided to the module.
     * @returns a function that, when called, will return a new instance of this feature
     */
    WebXRFeaturesManager.ConstructFeature = function (featureName, version, xrSessionManager, options) {
        if (version === void 0) { version = 1; }
        var constructorFunction = this._AvailableFeatures[featureName][version];
        if (!constructorFunction) {
            // throw an error? return nothing?
            throw new Error("feature not found");
        }
        return constructorFunction(xrSessionManager, options);
    };
    /**
     * Can be used to return the list of features currently registered
     *
     * @returns an Array of available features
     */
    WebXRFeaturesManager.GetAvailableFeatures = function () {
        return Object.keys(this._AvailableFeatures);
    };
    /**
     * Gets the versions available for a specific feature
     * @param featureName the name of the feature
     * @returns an array with the available versions
     */
    WebXRFeaturesManager.GetAvailableVersions = function (featureName) {
        return Object.keys(this._AvailableFeatures[featureName]);
    };
    /**
     * Return the latest unstable version of this feature
     * @param featureName the name of the feature to search
     * @returns the version number. if not found will return -1
     */
    WebXRFeaturesManager.GetLatestVersionOfFeature = function (featureName) {
        return (this._AvailableFeatures[featureName] && this._AvailableFeatures[featureName].latest) || -1;
    };
    /**
     * Return the latest stable version of this feature
     * @param featureName the name of the feature to search
     * @returns the version number. if not found will return -1
     */
    WebXRFeaturesManager.GetStableVersionOfFeature = function (featureName) {
        return (this._AvailableFeatures[featureName] && this._AvailableFeatures[featureName].stable) || -1;
    };
    /**
     * Attach a feature to the current session. Mainly used when session started to start the feature effect.
     * Can be used during a session to start a feature
     * @param featureName the name of feature to attach
     */
    WebXRFeaturesManager.prototype.attachFeature = function (featureName) {
        var feature = this._features[featureName];
        if (feature && feature.enabled && !feature.featureImplementation.attached) {
            feature.featureImplementation.attach();
        }
    };
    /**
     * Can be used inside a session or when the session ends to detach a specific feature
     * @param featureName the name of the feature to detach
     */
    WebXRFeaturesManager.prototype.detachFeature = function (featureName) {
        var feature = this._features[featureName];
        if (feature && feature.featureImplementation.attached) {
            feature.featureImplementation.detach();
        }
    };
    /**
     * Used to disable an already-enabled feature
     * The feature will be disposed and will be recreated once enabled.
     * @param featureName the feature to disable
     * @returns true if disable was successful
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    WebXRFeaturesManager.prototype.disableFeature = function (featureName) {
        var name = typeof featureName === "string" ? featureName : featureName.Name;
        var feature = this._features[name];
        if (feature && feature.enabled) {
            feature.enabled = false;
            this.detachFeature(name);
            feature.featureImplementation.dispose();
            delete this._features[name];
            return true;
        }
        return false;
    };
    /**
     * dispose this features manager
     */
    WebXRFeaturesManager.prototype.dispose = function () {
        var _this = this;
        this.getEnabledFeatures().forEach(function (feature) {
            _this.disableFeature(feature);
        });
    };
    /**
     * Enable a feature using its name and a version. This will enable it in the scene, and will be responsible to attach it when the session starts.
     * If used twice, the old version will be disposed and a new one will be constructed. This way you can re-enable with different configuration.
     *
     * @param featureName the name of the feature to load or the class of the feature
     * @param version optional version to load. if not provided the latest version will be enabled
     * @param moduleOptions options provided to the module. Ses the module documentation / constructor
     * @param attachIfPossible if set to true (default) the feature will be automatically attached, if it is currently possible
     * @param required is this feature required to the app. If set to true the session init will fail if the feature is not available.
     * @returns a new constructed feature or throws an error if feature not found or conflicts with another enabled feature.
     */
    WebXRFeaturesManager.prototype.enableFeature = function (
    // eslint-disable-next-line @typescript-eslint/naming-convention
    featureName, version, moduleOptions, attachIfPossible, required) {
        var _this = this;
        if (version === void 0) { version = "latest"; }
        if (moduleOptions === void 0) { moduleOptions = {}; }
        if (attachIfPossible === void 0) { attachIfPossible = true; }
        if (required === void 0) { required = true; }
        var name = typeof featureName === "string" ? featureName : featureName.Name;
        var versionToLoad = 0;
        if (typeof version === "string") {
            if (!version) {
                throw new Error("Error in provided version - ".concat(name, " (").concat(version, ")"));
            }
            if (version === "stable") {
                versionToLoad = WebXRFeaturesManager.GetStableVersionOfFeature(name);
            }
            else if (version === "latest") {
                versionToLoad = WebXRFeaturesManager.GetLatestVersionOfFeature(name);
            }
            else {
                // try loading the number the string represents
                versionToLoad = +version;
            }
            if (versionToLoad === -1 || isNaN(versionToLoad)) {
                throw new Error("feature not found - ".concat(name, " (").concat(version, ")"));
            }
        }
        else {
            versionToLoad = version;
        }
        // check if there is a feature conflict
        var conflictingFeature = WebXRFeaturesManager._ConflictingFeatures[name];
        if (conflictingFeature !== undefined && this.getEnabledFeatures().indexOf(conflictingFeature) !== -1) {
            throw new Error("Feature ".concat(name, " cannot be enabled while ").concat(conflictingFeature, " is enabled."));
        }
        // check if already initialized
        var feature = this._features[name];
        var constructFunction = WebXRFeaturesManager.ConstructFeature(name, versionToLoad, this._xrSessionManager, moduleOptions);
        if (!constructFunction) {
            // report error?
            throw new Error("feature not found - ".concat(name));
        }
        /* If the feature is already enabled, detach and dispose it, and create a new one */
        if (feature) {
            this.disableFeature(name);
        }
        var constructed = constructFunction();
        if (constructed.dependsOn) {
            var dependentsFound = constructed.dependsOn.every(function (featureName) { return !!_this._features[featureName]; });
            if (!dependentsFound) {
                throw new Error("Dependant features missing. Make sure the following features are enabled - ".concat(constructed.dependsOn.join(", ")));
            }
        }
        if (constructed.isCompatible()) {
            this._features[name] = {
                featureImplementation: constructed,
                enabled: true,
                version: versionToLoad,
                required: required,
            };
            if (attachIfPossible) {
                // if session started already, request and enable
                if (this._xrSessionManager.session && !this._features[name].featureImplementation.attached) {
                    // enable feature
                    this.attachFeature(name);
                }
            }
            else {
                // disable auto-attach when session starts
                this._features[name].featureImplementation.disableAutoAttach = true;
            }
            return this._features[name].featureImplementation;
        }
        else {
            if (required) {
                throw new Error("required feature not compatible");
            }
            else {
                Tools.Warn("Feature ".concat(name, " not compatible with the current environment/browser and was not enabled."));
                return constructed;
            }
        }
    };
    /**
     * get the implementation of an enabled feature.
     * @param featureName the name of the feature to load
     * @returns the feature class, if found
     */
    WebXRFeaturesManager.prototype.getEnabledFeature = function (featureName) {
        return this._features[featureName] && this._features[featureName].featureImplementation;
    };
    /**
     * Get the list of enabled features
     * @returns an array of enabled features
     */
    WebXRFeaturesManager.prototype.getEnabledFeatures = function () {
        return Object.keys(this._features);
    };
    /**
     * This function will extend the session creation configuration object with enabled features.
     * If, for example, the anchors feature is enabled, it will be automatically added to the optional or required features list,
     * according to the defined "required" variable, provided during enableFeature call
     * @param xrSessionInit the xr Session init object to extend
     *
     * @returns an extended XRSessionInit object
     */
    WebXRFeaturesManager.prototype._extendXRSessionInitObject = function (xrSessionInit) {
        return __awaiter(this, void 0, void 0, function () {
            var enabledFeatures, _i, enabledFeatures_1, featureName, feature, nativeName, extended;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enabledFeatures = this.getEnabledFeatures();
                        _i = 0, enabledFeatures_1 = enabledFeatures;
                        _a.label = 1;
                    case 1:
                        if (!(_i < enabledFeatures_1.length)) return [3 /*break*/, 4];
                        featureName = enabledFeatures_1[_i];
                        feature = this._features[featureName];
                        nativeName = feature.featureImplementation.xrNativeFeatureName;
                        if (nativeName) {
                            if (feature.required) {
                                xrSessionInit.requiredFeatures = xrSessionInit.requiredFeatures || [];
                                if (xrSessionInit.requiredFeatures.indexOf(nativeName) === -1) {
                                    xrSessionInit.requiredFeatures.push(nativeName);
                                }
                            }
                            else {
                                xrSessionInit.optionalFeatures = xrSessionInit.optionalFeatures || [];
                                if (xrSessionInit.optionalFeatures.indexOf(nativeName) === -1) {
                                    xrSessionInit.optionalFeatures.push(nativeName);
                                }
                            }
                        }
                        if (!feature.featureImplementation.getXRSessionInitExtension) return [3 /*break*/, 3];
                        return [4 /*yield*/, feature.featureImplementation.getXRSessionInitExtension()];
                    case 2:
                        extended = _a.sent();
                        xrSessionInit = __assign(__assign({}, xrSessionInit), extended);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, xrSessionInit];
                }
            });
        });
    };
    WebXRFeaturesManager._AvailableFeatures = {};
    /**
     * The key is the feature to check and the value is the feature that conflicts.
     */
    WebXRFeaturesManager._ConflictingFeatures = (_a = {},
        _a[WebXRFeatureName.TELEPORTATION] = WebXRFeatureName.MOVEMENT,
        _a[WebXRFeatureName.MOVEMENT] = WebXRFeatureName.TELEPORTATION,
        _a);
    return WebXRFeaturesManager;
}());
export { WebXRFeaturesManager };
//# sourceMappingURL=webXRFeaturesManager.js.map