import { __assign, __extends } from "tslib";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Vector3, Quaternion } from "../../Maths/math.vector.js";
import { PhysicsImpostor } from "../../Physics/physicsImpostor.js";
import { CreateSphere } from "../../Meshes/Builders/sphereBuilder.js";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { Logger } from "../../Misc/logger.js";
/**
 * Options for the controller physics feature
 */
var IWebXRControllerPhysicsOptions = /** @class */ (function () {
    function IWebXRControllerPhysicsOptions() {
    }
    return IWebXRControllerPhysicsOptions;
}());
export { IWebXRControllerPhysicsOptions };
/**
 * Add physics impostor to your webxr controllers,
 * including naive calculation of their linear and angular velocity
 */
var WebXRControllerPhysics = /** @class */ (function (_super) {
    __extends(WebXRControllerPhysics, _super);
    /**
     * Construct a new Controller Physics Feature
     * @param _xrSessionManager the corresponding xr session manager
     * @param _options options to create this feature with
     */
    function WebXRControllerPhysics(_xrSessionManager, _options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._attachController = function (xrController) {
            if (_this._controllers[xrController.uniqueId]) {
                // already attached
                return;
            }
            if (!_this._xrSessionManager.scene.isPhysicsEnabled()) {
                Logger.Warn("physics engine not enabled, skipped. Please add this controller manually.");
            }
            // if no motion controller available, create impostors!
            if (_this._options.physicsProperties.useControllerMesh && xrController.inputSource.gamepad) {
                xrController.onMotionControllerInitObservable.addOnce(function (motionController) {
                    if (!motionController._doNotLoadControllerMesh) {
                        motionController.onModelLoadedObservable.addOnce(function () {
                            var impostor = new PhysicsImpostor(motionController.rootMesh, PhysicsImpostor.MeshImpostor, __assign({ mass: 0 }, _this._options.physicsProperties));
                            var controllerMesh = xrController.grip || xrController.pointer;
                            _this._controllers[xrController.uniqueId] = {
                                xrController: xrController,
                                impostor: impostor,
                                oldPos: controllerMesh.position.clone(),
                                oldRotation: controllerMesh.rotationQuaternion.clone(),
                            };
                        });
                    }
                    else {
                        // This controller isn't using a model, create impostors instead
                        _this._createPhysicsImpostor(xrController);
                    }
                });
            }
            else {
                _this._createPhysicsImpostor(xrController);
            }
        };
        _this._controllers = {};
        _this._debugMode = false;
        _this._delta = 0;
        _this._lastTimestamp = 0;
        _this._tmpQuaternion = new Quaternion();
        _this._tmpVector = new Vector3();
        if (!_this._options.physicsProperties) {
            _this._options.physicsProperties = {};
        }
        return _this;
    }
    WebXRControllerPhysics.prototype._createPhysicsImpostor = function (xrController) {
        var impostorType = this._options.physicsProperties.impostorType || PhysicsImpostor.SphereImpostor;
        var impostorSize = this._options.physicsProperties.impostorSize || 0.1;
        var impostorMesh = CreateSphere("impostor-mesh-" + xrController.uniqueId, {
            diameterX: typeof impostorSize === "number" ? impostorSize : impostorSize.width,
            diameterY: typeof impostorSize === "number" ? impostorSize : impostorSize.height,
            diameterZ: typeof impostorSize === "number" ? impostorSize : impostorSize.depth,
        });
        impostorMesh.isVisible = this._debugMode;
        impostorMesh.isPickable = false;
        impostorMesh.rotationQuaternion = new Quaternion();
        var controllerMesh = xrController.grip || xrController.pointer;
        impostorMesh.position.copyFrom(controllerMesh.position);
        impostorMesh.rotationQuaternion.copyFrom(controllerMesh.rotationQuaternion);
        var impostor = new PhysicsImpostor(impostorMesh, impostorType, __assign({ mass: 0 }, this._options.physicsProperties));
        this._controllers[xrController.uniqueId] = {
            xrController: xrController,
            impostor: impostor,
            impostorMesh: impostorMesh,
        };
    };
    /**
     * @hidden
     * enable debugging - will show console outputs and the impostor mesh
     */
    WebXRControllerPhysics.prototype._enablePhysicsDebug = function () {
        var _this = this;
        this._debugMode = true;
        Object.keys(this._controllers).forEach(function (controllerId) {
            var controllerData = _this._controllers[controllerId];
            if (controllerData.impostorMesh) {
                controllerData.impostorMesh.isVisible = true;
            }
        });
    };
    /**
     * Manually add a controller (if no xrInput was provided or physics engine was not enabled)
     * @param xrController the controller to add
     */
    WebXRControllerPhysics.prototype.addController = function (xrController) {
        this._attachController(xrController);
    };
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRControllerPhysics.prototype.attach = function () {
        var _this = this;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        if (!this._options.xrInput) {
            return true;
        }
        this._options.xrInput.controllers.forEach(this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerAddedObservable, this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerRemovedObservable, function (controller) {
            // REMOVE the controller
            _this._detachController(controller.uniqueId);
        });
        if (this._options.enableHeadsetImpostor) {
            var params = this._options.headsetImpostorParams || {
                impostorType: PhysicsImpostor.SphereImpostor,
                restitution: 0.8,
                impostorSize: 0.3,
            };
            var impostorSize = params.impostorSize || 0.3;
            this._headsetMesh = CreateSphere("headset-mesh", {
                diameterX: typeof impostorSize === "number" ? impostorSize : impostorSize.width,
                diameterY: typeof impostorSize === "number" ? impostorSize : impostorSize.height,
                diameterZ: typeof impostorSize === "number" ? impostorSize : impostorSize.depth,
            });
            this._headsetMesh.rotationQuaternion = new Quaternion();
            this._headsetMesh.isVisible = false;
            this._headsetImpostor = new PhysicsImpostor(this._headsetMesh, params.impostorType, __assign({ mass: 0 }, params));
        }
        return true;
    };
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRControllerPhysics.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        Object.keys(this._controllers).forEach(function (controllerId) {
            _this._detachController(controllerId);
        });
        if (this._headsetMesh) {
            this._headsetMesh.dispose();
        }
        return true;
    };
    /**
     * Get the headset impostor, if enabled
     * @returns the impostor
     */
    WebXRControllerPhysics.prototype.getHeadsetImpostor = function () {
        return this._headsetImpostor;
    };
    /**
     * Get the physics impostor of a specific controller.
     * The impostor is not attached to a mesh because a mesh for each controller is not obligatory
     * @param controller the controller or the controller id of which to get the impostor
     * @returns the impostor or null
     */
    WebXRControllerPhysics.prototype.getImpostorForController = function (controller) {
        var id = typeof controller === "string" ? controller : controller.uniqueId;
        if (this._controllers[id]) {
            return this._controllers[id].impostor;
        }
        else {
            return null;
        }
    };
    /**
     * Update the physics properties provided in the constructor
     * @param newProperties the new properties object
     * @param newProperties.impostorType
     * @param newProperties.impostorSize
     * @param newProperties.friction
     * @param newProperties.restitution
     */
    WebXRControllerPhysics.prototype.setPhysicsProperties = function (newProperties) {
        this._options.physicsProperties = __assign(__assign({}, this._options.physicsProperties), newProperties);
    };
    WebXRControllerPhysics.prototype._onXRFrame = function (_xrFrame) {
        var _this = this;
        var _a, _b;
        this._delta = this._xrSessionManager.currentTimestamp - this._lastTimestamp;
        this._lastTimestamp = this._xrSessionManager.currentTimestamp;
        if (this._headsetMesh && this._headsetImpostor) {
            this._headsetMesh.position.copyFrom(this._options.xrInput.xrCamera.globalPosition);
            this._headsetMesh.rotationQuaternion.copyFrom(this._options.xrInput.xrCamera.absoluteRotation);
            if ((_a = this._options.xrInput.xrCamera._lastXRViewerPose) === null || _a === void 0 ? void 0 : _a.linearVelocity) {
                var lv = this._options.xrInput.xrCamera._lastXRViewerPose.linearVelocity;
                this._tmpVector.set(lv.x, lv.y, lv.z);
                this._headsetImpostor.setLinearVelocity(this._tmpVector);
            }
            if ((_b = this._options.xrInput.xrCamera._lastXRViewerPose) === null || _b === void 0 ? void 0 : _b.angularVelocity) {
                var av = this._options.xrInput.xrCamera._lastXRViewerPose.angularVelocity;
                this._tmpVector.set(av.x, av.y, av.z);
                this._headsetImpostor.setAngularVelocity(this._tmpVector);
            }
        }
        Object.keys(this._controllers).forEach(function (controllerId) {
            var _a, _b;
            var controllerData = _this._controllers[controllerId];
            var controllerMesh = controllerData.xrController.grip || controllerData.xrController.pointer;
            var comparedPosition = controllerData.oldPos || controllerData.impostorMesh.position;
            if ((_a = controllerData.xrController._lastXRPose) === null || _a === void 0 ? void 0 : _a.linearVelocity) {
                var lv = controllerData.xrController._lastXRPose.linearVelocity;
                _this._tmpVector.set(lv.x, lv.y, lv.z);
                controllerData.impostor.setLinearVelocity(_this._tmpVector);
            }
            else {
                controllerMesh.position.subtractToRef(comparedPosition, _this._tmpVector);
                _this._tmpVector.scaleInPlace(1000 / _this._delta);
                controllerData.impostor.setLinearVelocity(_this._tmpVector);
            }
            comparedPosition.copyFrom(controllerMesh.position);
            if (_this._debugMode) {
                console.log(_this._tmpVector, "linear");
            }
            var comparedQuaternion = controllerData.oldRotation || controllerData.impostorMesh.rotationQuaternion;
            if ((_b = controllerData.xrController._lastXRPose) === null || _b === void 0 ? void 0 : _b.angularVelocity) {
                var av = controllerData.xrController._lastXRPose.angularVelocity;
                _this._tmpVector.set(av.x, av.y, av.z);
                controllerData.impostor.setAngularVelocity(_this._tmpVector);
            }
            else {
                if (!comparedQuaternion.equalsWithEpsilon(controllerMesh.rotationQuaternion)) {
                    // roughly based on this - https://www.gamedev.net/forums/topic/347752-quaternion-and-angular-velocity/
                    comparedQuaternion.conjugateInPlace().multiplyToRef(controllerMesh.rotationQuaternion, _this._tmpQuaternion);
                    var len = Math.sqrt(_this._tmpQuaternion.x * _this._tmpQuaternion.x + _this._tmpQuaternion.y * _this._tmpQuaternion.y + _this._tmpQuaternion.z * _this._tmpQuaternion.z);
                    _this._tmpVector.set(_this._tmpQuaternion.x, _this._tmpQuaternion.y, _this._tmpQuaternion.z);
                    // define a better epsilon
                    if (len < 0.001) {
                        _this._tmpVector.scaleInPlace(2);
                    }
                    else {
                        var angle = 2 * Math.atan2(len, _this._tmpQuaternion.w);
                        _this._tmpVector.scaleInPlace(angle / (len * (_this._delta / 1000)));
                    }
                    controllerData.impostor.setAngularVelocity(_this._tmpVector);
                }
            }
            comparedQuaternion.copyFrom(controllerMesh.rotationQuaternion);
            if (_this._debugMode) {
                console.log(_this._tmpVector, _this._tmpQuaternion, "angular");
            }
        });
    };
    WebXRControllerPhysics.prototype._detachController = function (xrControllerUniqueId) {
        var controllerData = this._controllers[xrControllerUniqueId];
        if (!controllerData) {
            return;
        }
        if (controllerData.impostorMesh) {
            controllerData.impostorMesh.dispose();
        }
        // remove from the map
        delete this._controllers[xrControllerUniqueId];
    };
    /**
     * The module's name
     */
    WebXRControllerPhysics.Name = WebXRFeatureName.PHYSICS_CONTROLLERS;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the webxr specs version
     */
    WebXRControllerPhysics.Version = 1;
    return WebXRControllerPhysics;
}(WebXRAbstractFeature));
export { WebXRControllerPhysics };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRControllerPhysics.Name, function (xrSessionManager, options) {
    return function () { return new WebXRControllerPhysics(xrSessionManager, options); };
}, WebXRControllerPhysics.Version, true);
//# sourceMappingURL=WebXRControllerPhysics.js.map