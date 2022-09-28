import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { Observable } from "../../Misc/observable.js";
import { WebXRControllerComponent } from "../motionController/webXRControllerComponent.js";
import { Vector3, Quaternion } from "../../Maths/math.vector.js";
import { Ray } from "../../Culling/ray.js";
import { DynamicTexture } from "../../Materials/Textures/dynamicTexture.js";
import { CreateCylinder } from "../../Meshes/Builders/cylinderBuilder.js";
import { SineEase, EasingFunction } from "../../Animations/easing.js";
import { Animation } from "../../Animations/animation.js";
import { Axis } from "../../Maths/math.axis.js";
import { StandardMaterial } from "../../Materials/standardMaterial.js";
import { CreateGround } from "../../Meshes/Builders/groundBuilder.js";
import { CreateTorus } from "../../Meshes/Builders/torusBuilder.js";
import { Curve3 } from "../../Maths/math.path.js";
import { CreateLines } from "../../Meshes/Builders/linesBuilder.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { Color3 } from "../../Maths/math.color.js";
import { UtilityLayerRenderer } from "../../Rendering/utilityLayerRenderer.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { setAndStartTimer } from "../../Misc/timer.js";
/**
 * This is a teleportation feature to be used with WebXR-enabled motion controllers.
 * When enabled and attached, the feature will allow a user to move around and rotate in the scene using
 * the input of the attached controllers.
 */
var WebXRMotionControllerTeleportation = /** @class */ (function (_super) {
    __extends(WebXRMotionControllerTeleportation, _super);
    /**
     * constructs a new teleportation system
     * @param _xrSessionManager an instance of WebXRSessionManager
     * @param _options configuration object for this feature
     */
    function WebXRMotionControllerTeleportation(_xrSessionManager, _options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._controllers = {};
        _this._snappedToPoint = false;
        _this._tmpRay = new Ray(new Vector3(), new Vector3());
        _this._tmpVector = new Vector3();
        _this._tmpQuaternion = new Quaternion();
        /**
         * Skip the next teleportation. This can be controlled by the user to prevent the user from teleportation
         * to sections that are not yet "unlocked", but should still show the teleportation mesh.
         */
        _this.skipNextTeleportation = false;
        /**
         * Is movement backwards enabled
         */
        _this.backwardsMovementEnabled = true;
        /**
         * Distance to travel when moving backwards
         */
        _this.backwardsTeleportationDistance = 0.7;
        /**
         * The distance from the user to the inspection point in the direction of the controller
         * A higher number will allow the user to move further
         * defaults to 5 (meters, in xr units)
         */
        _this.parabolicCheckRadius = 5;
        /**
         * Should the module support parabolic ray on top of direct ray
         * If enabled, the user will be able to point "at the sky" and move according to predefined radius distance
         * Very helpful when moving between floors / different heights
         */
        _this.parabolicRayEnabled = true;
        /**
         * The second type of ray - straight line.
         * Should it be enabled or should the parabolic line be the only one.
         */
        _this.straightRayEnabled = true;
        /**
         * How much rotation should be applied when rotating right and left
         */
        _this.rotationAngle = Math.PI / 8;
        /**
         * This observable will notify when the target mesh position was updated.
         * The picking info it provides contains the point to which the target mesh will move ()
         */
        _this.onTargetMeshPositionUpdatedObservable = new Observable();
        /**
         * Is teleportation enabled. Can be used to allow rotation only.
         */
        _this.teleportationEnabled = true;
        _this._rotationEnabled = true;
        _this._attachController = function (xrController) {
            if (_this._controllers[xrController.uniqueId] || (_this._options.forceHandedness && xrController.inputSource.handedness !== _this._options.forceHandedness)) {
                // already attached
                return;
            }
            _this._controllers[xrController.uniqueId] = {
                xrController: xrController,
                teleportationState: {
                    forward: false,
                    backwards: false,
                    rotating: false,
                    currentRotation: 0,
                    baseRotation: 0,
                },
            };
            var controllerData = _this._controllers[xrController.uniqueId];
            // motion controller only available to gamepad-enabled input sources.
            if (controllerData.xrController.inputSource.targetRayMode === "tracked-pointer" && controllerData.xrController.inputSource.gamepad) {
                // motion controller support
                var initMotionController_1 = function () {
                    if (xrController.motionController) {
                        var movementController = xrController.motionController.getComponentOfType(WebXRControllerComponent.THUMBSTICK_TYPE) ||
                            xrController.motionController.getComponentOfType(WebXRControllerComponent.TOUCHPAD_TYPE);
                        if (!movementController || _this._options.useMainComponentOnly) {
                            // use trigger to move on long press
                            var mainComponent_1 = xrController.motionController.getMainComponent();
                            if (!mainComponent_1) {
                                return;
                            }
                            controllerData.teleportationComponent = mainComponent_1;
                            controllerData.onButtonChangedObserver = mainComponent_1.onButtonStateChangedObservable.add(function () {
                                if (!_this.teleportationEnabled) {
                                    return;
                                }
                                // did "pressed" changed?
                                if (mainComponent_1.changes.pressed) {
                                    if (mainComponent_1.changes.pressed.current) {
                                        // simulate "forward" thumbstick push
                                        controllerData.teleportationState.forward = true;
                                        _this._currentTeleportationControllerId = controllerData.xrController.uniqueId;
                                        controllerData.teleportationState.baseRotation = _this._options.xrInput.xrCamera.rotationQuaternion.toEulerAngles().y;
                                        controllerData.teleportationState.currentRotation = 0;
                                        var timeToSelect = _this._options.timeToTeleport || 3000;
                                        setAndStartTimer({
                                            timeout: timeToSelect,
                                            contextObservable: _this._xrSessionManager.onXRFrameObservable,
                                            breakCondition: function () { return !mainComponent_1.pressed; },
                                            onEnded: function () {
                                                if (_this._currentTeleportationControllerId === controllerData.xrController.uniqueId && controllerData.teleportationState.forward) {
                                                    _this._teleportForward(xrController.uniqueId);
                                                }
                                            },
                                        });
                                    }
                                    else {
                                        controllerData.teleportationState.forward = false;
                                        _this._currentTeleportationControllerId = "";
                                    }
                                }
                            });
                        }
                        else {
                            controllerData.teleportationComponent = movementController;
                            // use thumbstick (or touchpad if thumbstick not available)
                            controllerData.onAxisChangedObserver = movementController.onAxisValueChangedObservable.add(function (axesData) {
                                if (axesData.y <= 0.7 && controllerData.teleportationState.backwards) {
                                    controllerData.teleportationState.backwards = false;
                                }
                                if (axesData.y > 0.7 && !controllerData.teleportationState.forward && _this.backwardsMovementEnabled && !_this.snapPointsOnly) {
                                    // teleport backwards
                                    // General gist: Go Back N units, cast a ray towards the floor. If collided, move.
                                    if (!controllerData.teleportationState.backwards) {
                                        controllerData.teleportationState.backwards = true;
                                        // teleport backwards ONCE
                                        _this._tmpQuaternion.copyFrom(_this._options.xrInput.xrCamera.rotationQuaternion);
                                        _this._tmpQuaternion.toEulerAnglesToRef(_this._tmpVector);
                                        // get only the y rotation
                                        _this._tmpVector.x = 0;
                                        _this._tmpVector.z = 0;
                                        // get the quaternion
                                        Quaternion.FromEulerVectorToRef(_this._tmpVector, _this._tmpQuaternion);
                                        _this._tmpVector.set(0, 0, _this.backwardsTeleportationDistance * (_this._xrSessionManager.scene.useRightHandedSystem ? 1.0 : -1.0));
                                        _this._tmpVector.rotateByQuaternionToRef(_this._tmpQuaternion, _this._tmpVector);
                                        _this._tmpVector.addInPlace(_this._options.xrInput.xrCamera.position);
                                        _this._tmpRay.origin.copyFrom(_this._tmpVector);
                                        // This will prevent the user from "falling" to a lower platform!
                                        // TODO - should this be a flag? 'allow falling to lower platforms'?
                                        _this._tmpRay.length = _this._options.xrInput.xrCamera.realWorldHeight + 0.1;
                                        // Right handed system had here "1" instead of -1. This is unneeded.
                                        _this._tmpRay.direction.set(0, -1, 0);
                                        var pick = _this._xrSessionManager.scene.pickWithRay(_this._tmpRay, function (o) {
                                            return _this._floorMeshes.indexOf(o) !== -1;
                                        });
                                        // pick must exist, but stay safe
                                        if (pick && pick.pickedPoint) {
                                            // Teleport the users feet to where they targeted. Ignore the Y axis.
                                            // If the "falling to lower platforms" feature is implemented the Y axis should be set here as well
                                            _this._options.xrInput.xrCamera.position.x = pick.pickedPoint.x;
                                            _this._options.xrInput.xrCamera.position.z = pick.pickedPoint.z;
                                        }
                                    }
                                }
                                if (axesData.y < -0.7 && !_this._currentTeleportationControllerId && !controllerData.teleportationState.rotating && _this.teleportationEnabled) {
                                    controllerData.teleportationState.forward = true;
                                    _this._currentTeleportationControllerId = controllerData.xrController.uniqueId;
                                    controllerData.teleportationState.baseRotation = _this._options.xrInput.xrCamera.rotationQuaternion.toEulerAngles().y;
                                }
                                if (axesData.x) {
                                    if (!controllerData.teleportationState.forward) {
                                        if (!controllerData.teleportationState.rotating && Math.abs(axesData.x) > 0.7) {
                                            // rotate in the right direction positive is right
                                            controllerData.teleportationState.rotating = true;
                                            var rotation = _this.rotationAngle * (axesData.x > 0 ? 1 : -1) * (_this._xrSessionManager.scene.useRightHandedSystem ? -1 : 1);
                                            Quaternion.FromEulerAngles(0, rotation, 0).multiplyToRef(_this._options.xrInput.xrCamera.rotationQuaternion, _this._options.xrInput.xrCamera.rotationQuaternion);
                                        }
                                    }
                                    else {
                                        if (_this._currentTeleportationControllerId === controllerData.xrController.uniqueId) {
                                            // set the rotation of the forward movement
                                            if (_this.rotationEnabled) {
                                                setTimeout(function () {
                                                    controllerData.teleportationState.currentRotation = Math.atan2(axesData.x, axesData.y * (_this._xrSessionManager.scene.useRightHandedSystem ? 1 : -1));
                                                });
                                            }
                                            else {
                                                controllerData.teleportationState.currentRotation = 0;
                                            }
                                        }
                                    }
                                }
                                else {
                                    controllerData.teleportationState.rotating = false;
                                }
                                if (axesData.x === 0 && axesData.y === 0) {
                                    if (controllerData.teleportationState.forward) {
                                        _this._teleportForward(xrController.uniqueId);
                                    }
                                }
                            });
                        }
                    }
                };
                if (xrController.motionController) {
                    initMotionController_1();
                }
                else {
                    xrController.onMotionControllerInitObservable.addOnce(function () {
                        initMotionController_1();
                    });
                }
            }
            else {
                _this._xrSessionManager.scene.onPointerObservable.add(function (pointerInfo) {
                    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                        controllerData.teleportationState.forward = true;
                        _this._currentTeleportationControllerId = controllerData.xrController.uniqueId;
                        controllerData.teleportationState.baseRotation = _this._options.xrInput.xrCamera.rotationQuaternion.toEulerAngles().y;
                        controllerData.teleportationState.currentRotation = 0;
                        var timeToSelect = _this._options.timeToTeleport || 3000;
                        setAndStartTimer({
                            timeout: timeToSelect,
                            contextObservable: _this._xrSessionManager.onXRFrameObservable,
                            onEnded: function () {
                                if (_this._currentTeleportationControllerId === controllerData.xrController.uniqueId && controllerData.teleportationState.forward) {
                                    _this._teleportForward(xrController.uniqueId);
                                }
                            },
                        });
                    }
                    else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                        controllerData.teleportationState.forward = false;
                        _this._currentTeleportationControllerId = "";
                    }
                });
            }
        };
        // create default mesh if not provided
        if (!_this._options.teleportationTargetMesh) {
            _this._createDefaultTargetMesh();
        }
        _this._floorMeshes = _this._options.floorMeshes || [];
        _this._snapToPositions = _this._options.snapPositions || [];
        _this._setTargetMeshVisibility(false);
        return _this;
    }
    Object.defineProperty(WebXRMotionControllerTeleportation.prototype, "rotationEnabled", {
        /**
         * Is rotation enabled when moving forward?
         * Disabling this feature will prevent the user from deciding the direction when teleporting
         */
        get: function () {
            return this._rotationEnabled;
        },
        /**
         * Sets whether rotation is enabled or not
         * @param enabled is rotation enabled when teleportation is shown
         */
        set: function (enabled) {
            this._rotationEnabled = enabled;
            if (this._options.teleportationTargetMesh) {
                var children = this._options.teleportationTargetMesh.getChildMeshes(false, function (node) { return node.name === "rotationCone"; });
                if (children[0]) {
                    children[0].setEnabled(enabled);
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRMotionControllerTeleportation.prototype, "teleportationTargetMesh", {
        /**
         * Exposes the currently set teleportation target mesh.
         */
        get: function () {
            return this._options.teleportationTargetMesh || null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebXRMotionControllerTeleportation.prototype, "snapPointsOnly", {
        /**
         * Get the snapPointsOnly flag
         */
        get: function () {
            return !!this._options.snapPointsOnly;
        },
        /**
         * Sets the snapPointsOnly flag
         * @param snapToPoints should teleportation be exclusively to snap points
         */
        set: function (snapToPoints) {
            this._options.snapPointsOnly = snapToPoints;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a new mesh to the floor meshes array
     * @param mesh the mesh to use as floor mesh
     */
    WebXRMotionControllerTeleportation.prototype.addFloorMesh = function (mesh) {
        this._floorMeshes.push(mesh);
    };
    /**
     * Add a mesh to the list of meshes blocking the teleportation ray
     * @param mesh The mesh to add to the teleportation-blocking meshes
     */
    WebXRMotionControllerTeleportation.prototype.addBlockerMesh = function (mesh) {
        this._options.pickBlockerMeshes = this._options.pickBlockerMeshes || [];
        this._options.pickBlockerMeshes.push(mesh);
    };
    /**
     * Add a new snap-to point to fix teleportation to this position
     * @param newSnapPoint The new Snap-To point
     */
    WebXRMotionControllerTeleportation.prototype.addSnapPoint = function (newSnapPoint) {
        this._snapToPositions.push(newSnapPoint);
    };
    WebXRMotionControllerTeleportation.prototype.attach = function () {
        var _this = this;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        // Safety reset
        this._currentTeleportationControllerId = "";
        this._options.xrInput.controllers.forEach(this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerAddedObservable, this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerRemovedObservable, function (controller) {
            // REMOVE the controller
            _this._detachController(controller.uniqueId);
        });
        return true;
    };
    WebXRMotionControllerTeleportation.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        Object.keys(this._controllers).forEach(function (controllerId) {
            _this._detachController(controllerId);
        });
        this._setTargetMeshVisibility(false);
        this._currentTeleportationControllerId = "";
        this._controllers = {};
        return true;
    };
    WebXRMotionControllerTeleportation.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._options.teleportationTargetMesh && this._options.teleportationTargetMesh.dispose(false, true);
    };
    /**
     * Remove a mesh from the floor meshes array
     * @param mesh the mesh to remove
     */
    WebXRMotionControllerTeleportation.prototype.removeFloorMesh = function (mesh) {
        var index = this._floorMeshes.indexOf(mesh);
        if (index !== -1) {
            this._floorMeshes.splice(index, 1);
        }
    };
    /**
     * Remove a mesh from the blocker meshes array
     * @param mesh the mesh to remove
     */
    WebXRMotionControllerTeleportation.prototype.removeBlockerMesh = function (mesh) {
        this._options.pickBlockerMeshes = this._options.pickBlockerMeshes || [];
        var index = this._options.pickBlockerMeshes.indexOf(mesh);
        if (index !== -1) {
            this._options.pickBlockerMeshes.splice(index, 1);
        }
    };
    /**
     * Remove a mesh from the floor meshes array using its name
     * @param name the mesh name to remove
     */
    WebXRMotionControllerTeleportation.prototype.removeFloorMeshByName = function (name) {
        var mesh = this._xrSessionManager.scene.getMeshByName(name);
        if (mesh) {
            this.removeFloorMesh(mesh);
        }
    };
    /**
     * This function will iterate through the array, searching for this point or equal to it. It will then remove it from the snap-to array
     * @param snapPointToRemove the point (or a clone of it) to be removed from the array
     * @returns was the point found and removed or not
     */
    WebXRMotionControllerTeleportation.prototype.removeSnapPoint = function (snapPointToRemove) {
        // check if the object is in the array
        var index = this._snapToPositions.indexOf(snapPointToRemove);
        // if not found as an object, compare to the points
        if (index === -1) {
            for (var i = 0; i < this._snapToPositions.length; ++i) {
                // equals? index is i, break the loop
                if (this._snapToPositions[i].equals(snapPointToRemove)) {
                    index = i;
                    break;
                }
            }
        }
        // index is not -1? remove the object
        if (index !== -1) {
            this._snapToPositions.splice(index, 1);
            return true;
        }
        return false;
    };
    /**
     * This function sets a selection feature that will be disabled when
     * the forward ray is shown and will be reattached when hidden.
     * This is used to remove the selection rays when moving.
     * @param selectionFeature the feature to disable when forward movement is enabled
     */
    WebXRMotionControllerTeleportation.prototype.setSelectionFeature = function (selectionFeature) {
        this._selectionFeature = selectionFeature;
    };
    WebXRMotionControllerTeleportation.prototype._onXRFrame = function (_xrFrame) {
        var _this = this;
        var frame = this._xrSessionManager.currentFrame;
        var scene = this._xrSessionManager.scene;
        if (!this.attach || !frame) {
            return;
        }
        // render target if needed
        var targetMesh = this._options.teleportationTargetMesh;
        if (this._currentTeleportationControllerId) {
            if (!targetMesh) {
                return;
            }
            targetMesh.rotationQuaternion = targetMesh.rotationQuaternion || new Quaternion();
            var controllerData = this._controllers[this._currentTeleportationControllerId];
            if (controllerData && controllerData.teleportationState.forward) {
                // set the rotation
                Quaternion.RotationYawPitchRollToRef(controllerData.teleportationState.currentRotation + controllerData.teleportationState.baseRotation, 0, 0, targetMesh.rotationQuaternion);
                // set the ray and position
                var hitPossible = false;
                controllerData.xrController.getWorldPointerRayToRef(this._tmpRay);
                if (this.straightRayEnabled) {
                    // first check if direct ray possible
                    // pick grounds that are LOWER only. upper will use parabolic path
                    var pick = scene.pickWithRay(this._tmpRay, function (o) {
                        // check for mesh-blockers
                        if (_this._options.pickBlockerMeshes && _this._options.pickBlockerMeshes.indexOf(o) !== -1) {
                            return true;
                        }
                        var index = _this._floorMeshes.indexOf(o);
                        if (index === -1) {
                            return false;
                        }
                        return _this._floorMeshes[index].absolutePosition.y < _this._options.xrInput.xrCamera.globalPosition.y;
                    });
                    if (pick && pick.pickedMesh && this._options.pickBlockerMeshes && this._options.pickBlockerMeshes.indexOf(pick.pickedMesh) !== -1) {
                        return;
                    }
                    else if (pick && pick.pickedPoint) {
                        hitPossible = true;
                        this._setTargetMeshPosition(pick);
                        this._setTargetMeshVisibility(true);
                        this._showParabolicPath(pick);
                    }
                }
                // straight ray is still the main ray, but disabling the straight line will force parabolic line.
                if (this.parabolicRayEnabled && !hitPossible) {
                    // radius compensation according to pointer rotation around X
                    var xRotation = controllerData.xrController.pointer.rotationQuaternion.toEulerAngles().x;
                    var compensation = 1 + (Math.PI / 2 - Math.abs(xRotation));
                    // check parabolic ray
                    var radius = this.parabolicCheckRadius * compensation;
                    this._tmpRay.origin.addToRef(this._tmpRay.direction.scale(radius * 2), this._tmpVector);
                    this._tmpVector.y = this._tmpRay.origin.y;
                    this._tmpRay.origin.addInPlace(this._tmpRay.direction.scale(radius));
                    this._tmpVector.subtractToRef(this._tmpRay.origin, this._tmpRay.direction);
                    this._tmpRay.direction.normalize();
                    var pick = scene.pickWithRay(this._tmpRay, function (o) {
                        // check for mesh-blockers
                        if (_this._options.pickBlockerMeshes && _this._options.pickBlockerMeshes.indexOf(o) !== -1) {
                            return true;
                        }
                        return _this._floorMeshes.indexOf(o) !== -1;
                    });
                    if (pick && pick.pickedMesh && this._options.pickBlockerMeshes && this._options.pickBlockerMeshes.indexOf(pick.pickedMesh) !== -1) {
                        return;
                    }
                    else if (pick && pick.pickedPoint) {
                        hitPossible = true;
                        this._setTargetMeshPosition(pick);
                        this._setTargetMeshVisibility(true);
                        this._showParabolicPath(pick);
                    }
                }
                // if needed, set visible:
                this._setTargetMeshVisibility(hitPossible);
            }
            else {
                this._setTargetMeshVisibility(false);
            }
        }
        else {
            this._setTargetMeshVisibility(false);
        }
    };
    WebXRMotionControllerTeleportation.prototype._createDefaultTargetMesh = function () {
        // set defaults
        this._options.defaultTargetMeshOptions = this._options.defaultTargetMeshOptions || {};
        var sceneToRenderTo = this._options.useUtilityLayer
            ? this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene
            : this._xrSessionManager.scene;
        var teleportationTarget = CreateGround("teleportationTarget", { width: 2, height: 2, subdivisions: 2 }, sceneToRenderTo);
        teleportationTarget.isPickable = false;
        var length = 512;
        var dynamicTexture = new DynamicTexture("teleportationPlaneDynamicTexture", length, sceneToRenderTo, true);
        dynamicTexture.hasAlpha = true;
        var context = dynamicTexture.getContext();
        var centerX = length / 2;
        var centerY = length / 2;
        var radius = 200;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = this._options.defaultTargetMeshOptions.teleportationFillColor || "#444444";
        context.fill();
        context.lineWidth = 10;
        context.strokeStyle = this._options.defaultTargetMeshOptions.teleportationBorderColor || "#FFFFFF";
        context.stroke();
        context.closePath();
        dynamicTexture.update();
        var teleportationCircleMaterial = new StandardMaterial("teleportationPlaneMaterial", sceneToRenderTo);
        teleportationCircleMaterial.diffuseTexture = dynamicTexture;
        teleportationTarget.material = teleportationCircleMaterial;
        var torus = CreateTorus("torusTeleportation", {
            diameter: 0.75,
            thickness: 0.1,
            tessellation: 20,
        }, sceneToRenderTo);
        torus.isPickable = false;
        torus.parent = teleportationTarget;
        if (!this._options.defaultTargetMeshOptions.disableAnimation) {
            var animationInnerCircle = new Animation("animationInnerCircle", "position.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
            var keys = [];
            keys.push({
                frame: 0,
                value: 0,
            });
            keys.push({
                frame: 30,
                value: 0.4,
            });
            keys.push({
                frame: 60,
                value: 0,
            });
            animationInnerCircle.setKeys(keys);
            var easingFunction = new SineEase();
            easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
            animationInnerCircle.setEasingFunction(easingFunction);
            torus.animations = [];
            torus.animations.push(animationInnerCircle);
            sceneToRenderTo.beginAnimation(torus, 0, 60, true);
        }
        var cone = CreateCylinder("rotationCone", { diameterTop: 0, tessellation: 4 }, sceneToRenderTo);
        cone.isPickable = false;
        cone.scaling.set(0.5, 0.12, 0.2);
        cone.rotate(Axis.X, Math.PI / 2);
        cone.position.z = 0.6;
        cone.parent = torus;
        if (this._options.defaultTargetMeshOptions.torusArrowMaterial) {
            torus.material = this._options.defaultTargetMeshOptions.torusArrowMaterial;
            cone.material = this._options.defaultTargetMeshOptions.torusArrowMaterial;
        }
        else {
            var torusConeMaterial = new StandardMaterial("torusConsMat", sceneToRenderTo);
            torusConeMaterial.disableLighting = !!this._options.defaultTargetMeshOptions.disableLighting;
            if (torusConeMaterial.disableLighting) {
                torusConeMaterial.emissiveColor = new Color3(0.3, 0.3, 1.0);
            }
            else {
                torusConeMaterial.diffuseColor = new Color3(0.3, 0.3, 1.0);
            }
            torusConeMaterial.alpha = 0.9;
            torus.material = torusConeMaterial;
            cone.material = torusConeMaterial;
            this._teleportationRingMaterial = torusConeMaterial;
        }
        if (this._options.renderingGroupId !== undefined) {
            teleportationTarget.renderingGroupId = this._options.renderingGroupId;
            torus.renderingGroupId = this._options.renderingGroupId;
            cone.renderingGroupId = this._options.renderingGroupId;
        }
        this._options.teleportationTargetMesh = teleportationTarget;
    };
    WebXRMotionControllerTeleportation.prototype._detachController = function (xrControllerUniqueId) {
        var controllerData = this._controllers[xrControllerUniqueId];
        if (!controllerData) {
            return;
        }
        if (controllerData.teleportationComponent) {
            if (controllerData.onAxisChangedObserver) {
                controllerData.teleportationComponent.onAxisValueChangedObservable.remove(controllerData.onAxisChangedObserver);
            }
            if (controllerData.onButtonChangedObserver) {
                controllerData.teleportationComponent.onButtonStateChangedObservable.remove(controllerData.onButtonChangedObserver);
            }
        }
        // remove from the map
        delete this._controllers[xrControllerUniqueId];
    };
    WebXRMotionControllerTeleportation.prototype._findClosestSnapPointWithRadius = function (realPosition, radius) {
        if (radius === void 0) { radius = this._options.snapToPositionRadius || 0.8; }
        var closestPoint = null;
        var closestDistance = Number.MAX_VALUE;
        if (this._snapToPositions.length) {
            var radiusSquared_1 = radius * radius;
            this._snapToPositions.forEach(function (position) {
                var dist = Vector3.DistanceSquared(position, realPosition);
                if (dist <= radiusSquared_1 && dist < closestDistance) {
                    closestDistance = dist;
                    closestPoint = position;
                }
            });
        }
        return closestPoint;
    };
    WebXRMotionControllerTeleportation.prototype._setTargetMeshPosition = function (pickInfo) {
        var newPosition = pickInfo.pickedPoint;
        if (!this._options.teleportationTargetMesh || !newPosition) {
            return;
        }
        var snapPosition = this._findClosestSnapPointWithRadius(newPosition);
        this._snappedToPoint = !!snapPosition;
        if (this.snapPointsOnly && !this._snappedToPoint && this._teleportationRingMaterial) {
            this._teleportationRingMaterial.diffuseColor.set(1.0, 0.3, 0.3);
        }
        else if (this.snapPointsOnly && this._snappedToPoint && this._teleportationRingMaterial) {
            this._teleportationRingMaterial.diffuseColor.set(0.3, 0.3, 1.0);
        }
        this._options.teleportationTargetMesh.position.copyFrom(snapPosition || newPosition);
        this._options.teleportationTargetMesh.position.y += 0.01;
        this.onTargetMeshPositionUpdatedObservable.notifyObservers(pickInfo);
    };
    WebXRMotionControllerTeleportation.prototype._setTargetMeshVisibility = function (visible) {
        if (!this._options.teleportationTargetMesh) {
            return;
        }
        if (this._options.teleportationTargetMesh.isVisible === visible) {
            return;
        }
        this._options.teleportationTargetMesh.isVisible = visible;
        this._options.teleportationTargetMesh.getChildren(undefined, false).forEach(function (m) {
            m.isVisible = visible;
        });
        if (!visible) {
            if (this._quadraticBezierCurve) {
                this._quadraticBezierCurve.dispose();
                this._quadraticBezierCurve = null;
            }
            if (this._selectionFeature) {
                this._selectionFeature.attach();
            }
        }
        else {
            if (this._selectionFeature) {
                this._selectionFeature.detach();
            }
        }
    };
    WebXRMotionControllerTeleportation.prototype._showParabolicPath = function (pickInfo) {
        if (!pickInfo.pickedPoint) {
            return;
        }
        var sceneToRenderTo = this._options.useUtilityLayer
            ? this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene
            : this._xrSessionManager.scene;
        var controllerData = this._controllers[this._currentTeleportationControllerId];
        var quadraticBezierVectors = Curve3.CreateQuadraticBezier(controllerData.xrController.pointer.absolutePosition, pickInfo.ray.origin, pickInfo.pickedPoint, 25);
        if (!this._options.generateRayPathMesh) {
            this._quadraticBezierCurve = CreateLines("teleportation path line", { points: quadraticBezierVectors.getPoints(), instance: this._quadraticBezierCurve, updatable: true }, sceneToRenderTo);
        }
        else {
            this._quadraticBezierCurve = this._options.generateRayPathMesh(quadraticBezierVectors.getPoints(), pickInfo);
        }
        this._quadraticBezierCurve.isPickable = false;
        if (this._options.renderingGroupId !== undefined) {
            this._quadraticBezierCurve.renderingGroupId = this._options.renderingGroupId;
        }
    };
    WebXRMotionControllerTeleportation.prototype._teleportForward = function (controllerId) {
        var controllerData = this._controllers[controllerId];
        if (!controllerData || !controllerData.teleportationState.forward || !this.teleportationEnabled) {
            return;
        }
        controllerData.teleportationState.forward = false;
        this._currentTeleportationControllerId = "";
        if (this.snapPointsOnly && !this._snappedToPoint) {
            return;
        }
        if (this.skipNextTeleportation) {
            this.skipNextTeleportation = false;
            return;
        }
        // do the movement forward here
        if (this._options.teleportationTargetMesh && this._options.teleportationTargetMesh.isVisible) {
            var height = this._options.xrInput.xrCamera.realWorldHeight;
            this._options.xrInput.xrCamera.onBeforeCameraTeleport.notifyObservers(this._options.xrInput.xrCamera.position);
            this._options.xrInput.xrCamera.position.copyFrom(this._options.teleportationTargetMesh.position);
            this._options.xrInput.xrCamera.position.y += height;
            Quaternion.FromEulerAngles(0, controllerData.teleportationState.currentRotation - (this._xrSessionManager.scene.useRightHandedSystem ? Math.PI : 0), 0).multiplyToRef(this._options.xrInput.xrCamera.rotationQuaternion, this._options.xrInput.xrCamera.rotationQuaternion);
            this._options.xrInput.xrCamera.onAfterCameraTeleport.notifyObservers(this._options.xrInput.xrCamera.position);
        }
    };
    /**
     * The module's name
     */
    WebXRMotionControllerTeleportation.Name = WebXRFeatureName.TELEPORTATION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the webxr specs version
     */
    WebXRMotionControllerTeleportation.Version = 1;
    return WebXRMotionControllerTeleportation;
}(WebXRAbstractFeature));
export { WebXRMotionControllerTeleportation };
WebXRFeaturesManager.AddWebXRFeature(WebXRMotionControllerTeleportation.Name, function (xrSessionManager, options) {
    return function () { return new WebXRMotionControllerTeleportation(xrSessionManager, options); };
}, WebXRMotionControllerTeleportation.Version, true);
//# sourceMappingURL=WebXRControllerTeleportation.js.map