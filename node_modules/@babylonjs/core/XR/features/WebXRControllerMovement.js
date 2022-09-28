import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { WebXRControllerComponent } from "../motionController/webXRControllerComponent.js";
import { Matrix, Quaternion, Vector3 } from "../../Maths/math.vector.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Tools } from "../../Misc/tools.js";
/**
 * This is a movement feature to be used with WebXR-enabled motion controllers.
 * When enabled and attached, the feature will allow a user to move around and rotate in the scene using
 * the input of the attached controllers.
 */
var WebXRControllerMovement = /** @class */ (function (_super) {
    __extends(WebXRControllerMovement, _super);
    /**
     * constructs a new movement controller system
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param options configuration object for this feature
     */
    function WebXRControllerMovement(_xrSessionManager, options) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        _this = _super.call(this, _xrSessionManager) || this;
        _this._controllers = {};
        _this._currentRegistrationConfigurations = [];
        // forward direction for movement, which may differ from viewer pose.
        _this._movementDirection = null;
        // unused
        _this._tmpRotationMatrix = Matrix.Identity();
        _this._tmpTranslationDirection = new Vector3();
        _this._tmpMovementTranslation = new Vector3();
        _this._attachController = function (xrController) {
            if (_this._controllers[xrController.uniqueId]) {
                // already attached
                return;
            }
            _this._controllers[xrController.uniqueId] = {
                xrController: xrController,
                registeredComponents: [],
            };
            var controllerData = _this._controllers[xrController.uniqueId];
            // movement controller only available to gamepad-enabled input sources.
            if (controllerData.xrController.inputSource.targetRayMode === "tracked-pointer" && controllerData.xrController.inputSource.gamepad) {
                // motion controller support
                var initController_1 = function () {
                    if (xrController.motionController) {
                        var _loop_1 = function (registration) {
                            var component = null;
                            if (registration.allowedComponentTypes) {
                                for (var _b = 0, _c = registration.allowedComponentTypes; _b < _c.length; _b++) {
                                    var componentType = _c[_b];
                                    var componentOfType = xrController.motionController.getComponentOfType(componentType);
                                    if (componentOfType !== null) {
                                        component = componentOfType;
                                        break;
                                    }
                                }
                            }
                            if (registration.mainComponentOnly) {
                                var mainComponent = xrController.motionController.getMainComponent();
                                if (mainComponent === null) {
                                    return "continue";
                                }
                                component = mainComponent;
                            }
                            if (typeof registration.componentSelectionPredicate === "function") {
                                // if does not match we do want to ignore a previously found component
                                component = registration.componentSelectionPredicate(xrController);
                            }
                            if (component && registration.forceHandedness) {
                                if (xrController.inputSource.handedness !== registration.forceHandedness) {
                                    return "continue";
                                }
                            }
                            if (component === null) {
                                return "continue";
                            }
                            var registeredComponent = {
                                registrationConfiguration: registration,
                                component: component,
                            };
                            controllerData.registeredComponents.push(registeredComponent);
                            if ("axisChangedHandler" in registration) {
                                registeredComponent.onAxisChangedObserver = component.onAxisValueChangedObservable.add(function (axesData) {
                                    registration.axisChangedHandler(axesData, _this._movementState, _this._featureContext, _this._xrInput);
                                });
                            }
                            if ("buttonChangedhandler" in registration) {
                                registeredComponent.onButtonChangedObserver = component.onButtonStateChangedObservable.add(function () {
                                    if (component.changes.pressed) {
                                        registration.buttonChangedhandler(component.changes.pressed, _this._movementState, _this._featureContext, _this._xrInput);
                                    }
                                });
                            }
                        };
                        for (var _i = 0, _a = _this._currentRegistrationConfigurations; _i < _a.length; _i++) {
                            var registration = _a[_i];
                            _loop_1(registration);
                        }
                    }
                };
                if (xrController.motionController) {
                    initController_1();
                }
                else {
                    xrController.onMotionControllerInitObservable.addOnce(function () {
                        initController_1();
                    });
                }
            }
        };
        if (!options || options.xrInput === undefined) {
            Tools.Error('WebXRControllerMovement feature requires "xrInput" option.');
            return _this;
        }
        if (Array.isArray(options.customRegistrationConfigurations)) {
            _this._currentRegistrationConfigurations = options.customRegistrationConfigurations;
        }
        else {
            _this._currentRegistrationConfigurations = WebXRControllerMovement.REGISTRATIONS.default;
        }
        // synchronized from feature setter properties
        _this._featureContext = {
            movementEnabled: options.movementEnabled || true,
            movementOrientationFollowsViewerPose: (_a = options.movementOrientationFollowsViewerPose) !== null && _a !== void 0 ? _a : true,
            movementSpeed: (_b = options.movementSpeed) !== null && _b !== void 0 ? _b : 1,
            movementThreshold: (_c = options.movementThreshold) !== null && _c !== void 0 ? _c : 0.25,
            rotationEnabled: (_d = options.rotationEnabled) !== null && _d !== void 0 ? _d : true,
            rotationSpeed: (_e = options.rotationSpeed) !== null && _e !== void 0 ? _e : 1.0,
            rotationThreshold: (_f = options.rotationThreshold) !== null && _f !== void 0 ? _f : 0.25,
        };
        _this._movementState = {
            moveX: 0,
            moveY: 0,
            rotateX: 0,
            rotateY: 0,
        };
        _this._xrInput = options.xrInput;
        return _this;
    }
    Object.defineProperty(WebXRControllerMovement.prototype, "movementDirection", {
        /**
         * Current movement direction.  Will be null before XR Frames have been processed.
         */
        get: function () {
            return this._movementDirection;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "movementEnabled", {
        /**
         * Is movement enabled
         */
        get: function () {
            return this._featureContext.movementEnabled;
        },
        /**
         * Sets whether movement is enabled or not
         * @param enabled is movement enabled
         */
        set: function (enabled) {
            this._featureContext.movementEnabled = enabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "movementOrientationFollowsViewerPose", {
        /**
         * If movement follows viewer pose
         */
        get: function () {
            return this._featureContext.movementOrientationFollowsViewerPose;
        },
        /**
         * Sets whether movement follows viewer pose
         * @param followsPose is movement should follow viewer pose
         */
        set: function (followsPose) {
            this._featureContext.movementOrientationFollowsViewerPose = followsPose;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "movementSpeed", {
        /**
         * Gets movement speed
         */
        get: function () {
            return this._featureContext.movementSpeed;
        },
        /**
         * Sets movement speed
         * @param movementSpeed movement speed
         */
        set: function (movementSpeed) {
            this._featureContext.movementSpeed = movementSpeed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "movementThreshold", {
        /**
         * Gets minimum threshold the controller's thumbstick/touchpad must pass before being recognized for movement (avoids jitter/unintentional movement)
         */
        get: function () {
            return this._featureContext.movementThreshold;
        },
        /**
         * Sets minimum threshold the controller's thumbstick/touchpad must pass before being recognized for movement (avoids jitter/unintentional movement)
         * @param movementThreshold new threshold
         */
        set: function (movementThreshold) {
            this._featureContext.movementThreshold = movementThreshold;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "rotationEnabled", {
        /**
         * Is rotation enabled
         */
        get: function () {
            return this._featureContext.rotationEnabled;
        },
        /**
         * Sets whether rotation is enabled or not
         * @param enabled is rotation enabled
         */
        set: function (enabled) {
            this._featureContext.rotationEnabled = enabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "rotationSpeed", {
        /**
         * Gets rotation speed factor
         */
        get: function () {
            return this._featureContext.rotationSpeed;
        },
        /**
         * Sets rotation speed factor (1.0 is default)
         * @param rotationSpeed new rotation speed factor
         */
        set: function (rotationSpeed) {
            this._featureContext.rotationSpeed = rotationSpeed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRControllerMovement.prototype, "rotationThreshold", {
        /**
         * Gets minimum threshold the controller's thumbstick/touchpad must pass before being recognized for rotation (avoids jitter/unintentional rotation)
         */
        get: function () {
            return this._featureContext.rotationThreshold;
        },
        /**
         * Sets minimum threshold the controller's thumbstick/touchpad must pass before being recognized for rotation (avoids jitter/unintentional rotation)
         * @param threshold new threshold
         */
        set: function (threshold) {
            this._featureContext.rotationThreshold = threshold;
        },
        enumerable: false,
        configurable: true
    });
    WebXRControllerMovement.prototype.attach = function () {
        var _this = this;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        this._xrInput.controllers.forEach(this._attachController);
        this._addNewAttachObserver(this._xrInput.onControllerAddedObservable, this._attachController);
        this._addNewAttachObserver(this._xrInput.onControllerRemovedObservable, function (controller) {
            // REMOVE the controller
            _this._detachController(controller.uniqueId);
        });
        return true;
    };
    WebXRControllerMovement.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        Object.keys(this._controllers).forEach(function (controllerId) {
            _this._detachController(controllerId);
        });
        this._controllers = {};
        return true;
    };
    /**
     * Occurs on every XR frame.
     * @param _xrFrame
     */
    WebXRControllerMovement.prototype._onXRFrame = function (_xrFrame) {
        if (!this.attach) {
            return;
        }
        if (this._movementDirection === null) {
            this._movementDirection = this._xrInput.xrCamera.rotationQuaternion.clone();
        }
        if (this._movementState.rotateX !== 0 && this._featureContext.rotationEnabled) {
            // smooth rotation
            var deltaMillis = this._xrSessionManager.scene.getEngine().getDeltaTime();
            var rotationY = deltaMillis * 0.001 * this._featureContext.rotationSpeed * this._movementState.rotateX * (this._xrSessionManager.scene.useRightHandedSystem ? -1 : 1);
            if (this._featureContext.movementOrientationFollowsViewerPose === true) {
                this._xrInput.xrCamera.cameraRotation.y += rotationY;
                this._movementDirection = this._xrInput.xrCamera.rotationQuaternion.multiply(Quaternion.RotationYawPitchRoll(rotationY, 0, 0));
            }
            else {
                // movement orientation direction does not affect camera.  We use rotation speed multiplier
                // otherwise need to implement inertia and constraints for same feel as TargetCamera.
                this._movementDirection.multiplyInPlace(Quaternion.RotationYawPitchRoll(rotationY * 3.0, 0, 0));
            }
        }
        else if (this._featureContext.movementOrientationFollowsViewerPose === true) {
            this._movementDirection.copyFrom(this._xrInput.xrCamera.rotationQuaternion);
        }
        if ((this._movementState.moveX !== 0 || this._movementState.moveY !== 0) && this._featureContext.movementEnabled) {
            Matrix.FromQuaternionToRef(this._movementDirection, this._tmpRotationMatrix);
            this._tmpTranslationDirection.set(this._movementState.moveX, 0, this._movementState.moveY * (this._xrSessionManager.scene.useRightHandedSystem ? 1.0 : -1.0));
            // move according to forward direction based on camera speed
            Vector3.TransformCoordinatesToRef(this._tmpTranslationDirection, this._tmpRotationMatrix, this._tmpMovementTranslation);
            this._tmpMovementTranslation.scaleInPlace(this._xrInput.xrCamera._computeLocalCameraSpeed() * this._featureContext.movementSpeed);
            this._xrInput.xrCamera.cameraDirection.addInPlace(this._tmpMovementTranslation);
        }
    };
    WebXRControllerMovement.prototype._detachController = function (xrControllerUniqueId) {
        var controllerData = this._controllers[xrControllerUniqueId];
        if (!controllerData) {
            return;
        }
        for (var _i = 0, _a = controllerData.registeredComponents; _i < _a.length; _i++) {
            var registeredComponent = _a[_i];
            if (registeredComponent.onAxisChangedObserver) {
                registeredComponent.component.onAxisValueChangedObservable.remove(registeredComponent.onAxisChangedObserver);
            }
            if (registeredComponent.onButtonChangedObserver) {
                registeredComponent.component.onButtonStateChangedObservable.remove(registeredComponent.onButtonChangedObserver);
            }
        }
        // remove from the map
        delete this._controllers[xrControllerUniqueId];
    };
    /**
     * The module's name
     */
    WebXRControllerMovement.Name = WebXRFeatureName.MOVEMENT;
    /**
     * Standard controller configurations.
     */
    WebXRControllerMovement.REGISTRATIONS = {
        default: [
            {
                allowedComponentTypes: [WebXRControllerComponent.THUMBSTICK_TYPE, WebXRControllerComponent.TOUCHPAD_TYPE],
                forceHandedness: "left",
                axisChangedHandler: function (axes, movementState, featureContext) {
                    movementState.rotateX = Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0;
                    movementState.rotateY = Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0;
                },
            },
            {
                allowedComponentTypes: [WebXRControllerComponent.THUMBSTICK_TYPE, WebXRControllerComponent.TOUCHPAD_TYPE],
                forceHandedness: "right",
                axisChangedHandler: function (axes, movementState, featureContext) {
                    movementState.moveX = Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0;
                    movementState.moveY = Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0;
                },
            },
        ],
    };
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the webxr specs version
     */
    WebXRControllerMovement.Version = 1;
    return WebXRControllerMovement;
}(WebXRAbstractFeature));
export { WebXRControllerMovement };
WebXRFeaturesManager.AddWebXRFeature(WebXRControllerMovement.Name, function (xrSessionManager, options) {
    return function () { return new WebXRControllerMovement(xrSessionManager, options); };
}, WebXRControllerMovement.Version, true);
//# sourceMappingURL=WebXRControllerMovement.js.map