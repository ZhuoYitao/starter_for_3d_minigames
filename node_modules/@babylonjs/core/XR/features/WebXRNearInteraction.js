import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { CreateSphere } from "../../Meshes/Builders/sphereBuilder.js";
import { Vector3, Quaternion, TmpVectors } from "../../Maths/math.vector.js";
import { Ray } from "../../Culling/ray.js";
import { PickingInfo } from "../../Collisions/pickingInfo.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { UtilityLayerRenderer } from "../../Rendering/utilityLayerRenderer.js";
import { BoundingSphere } from "../../Culling/boundingSphere.js";
import { StandardMaterial } from "../../Materials/standardMaterial.js";
import { Color3 } from "../../Maths/math.color.js";
import { NodeMaterial } from "../../Materials/Node/nodeMaterial.js";
import { Animation } from "../../Animations/animation.js";
import { QuadraticEase, EasingFunction } from "../../Animations/easing.js";
// side effects
import "../../Meshes/subMesh.project.js";
// Tracks the interaction animation state when using a motion controller with a near interaction orb
var ControllerOrbAnimationState;
(function (ControllerOrbAnimationState) {
    /**
     * Orb is invisible
     */
    ControllerOrbAnimationState[ControllerOrbAnimationState["DEHYDRATED"] = 0] = "DEHYDRATED";
    /**
     * Orb is visible and inside the hover range
     */
    ControllerOrbAnimationState[ControllerOrbAnimationState["HOVER"] = 1] = "HOVER";
    /**
     * Orb is visible and touching a near interaction target
     */
    ControllerOrbAnimationState[ControllerOrbAnimationState["TOUCH"] = 2] = "TOUCH";
})(ControllerOrbAnimationState || (ControllerOrbAnimationState = {}));
/**
 * Where should the near interaction mesh be attached to when using a motion controller for near interaction
 */
export var WebXRNearControllerMode;
(function (WebXRNearControllerMode) {
    /**
     * Motion controllers will not support near interaction
     */
    WebXRNearControllerMode[WebXRNearControllerMode["DISABLED"] = 0] = "DISABLED";
    /**
     * The interaction point for motion controllers will be inside of them
     */
    WebXRNearControllerMode[WebXRNearControllerMode["CENTERED_ON_CONTROLLER"] = 1] = "CENTERED_ON_CONTROLLER";
    /**
     * The interaction point for motion controllers will be in front of the controller
     */
    WebXRNearControllerMode[WebXRNearControllerMode["CENTERED_IN_FRONT"] = 2] = "CENTERED_IN_FRONT";
})(WebXRNearControllerMode || (WebXRNearControllerMode = {}));
/**
 * A module that will enable near interaction near interaction for hands and motion controllers of XR Input Sources
 */
var WebXRNearInteraction = /** @class */ (function (_super) {
    __extends(WebXRNearInteraction, _super);
    /**
     * constructs a new background remover module
     * @param _xrSessionManager the session manager for this module
     * @param _options read-only options to be used in this module
     */
    function WebXRNearInteraction(_xrSessionManager, _options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._tmpRay = new Ray(new Vector3(), new Vector3());
        _this._attachController = function (xrController) {
            if (_this._controllers[xrController.uniqueId]) {
                // already attached
                return;
            }
            // get two new meshes
            var _a = _this._generateNewTouchPointMesh(), touchCollisionMesh = _a.touchCollisionMesh, touchCollisionMeshFunction = _a.touchCollisionMeshFunction, hydrateCollisionMeshFunction = _a.hydrateCollisionMeshFunction;
            var selectionMesh = _this._generateVisualCue();
            _this._controllers[xrController.uniqueId] = {
                xrController: xrController,
                meshUnderPointer: null,
                nearInteractionTargetMesh: null,
                pick: null,
                stalePick: null,
                touchCollisionMesh: touchCollisionMesh,
                touchCollisionMeshFunction: touchCollisionMeshFunction,
                hydrateCollisionMeshFunction: hydrateCollisionMeshFunction,
                currentAnimationState: ControllerOrbAnimationState.DEHYDRATED,
                grabRay: new Ray(new Vector3(), new Vector3()),
                hoverInteraction: false,
                nearInteraction: false,
                grabInteraction: false,
                id: WebXRNearInteraction._IdCounter++,
                pickedPointVisualCue: selectionMesh,
            };
            if (_this._attachedController) {
                if (!_this._options.enableNearInteractionOnAllControllers &&
                    _this._options.preferredHandedness &&
                    xrController.inputSource.handedness === _this._options.preferredHandedness) {
                    _this._attachedController = xrController.uniqueId;
                }
            }
            else {
                if (!_this._options.enableNearInteractionOnAllControllers) {
                    _this._attachedController = xrController.uniqueId;
                }
            }
            switch (xrController.inputSource.targetRayMode) {
                case "tracked-pointer":
                    return _this._attachNearInteractionMode(xrController);
                case "gaze":
                    return null;
                case "screen":
                    return null;
            }
        };
        _this._controllers = {};
        _this._farInteractionFeature = null;
        /**
         * default color of the selection ring
         */
        _this.selectionMeshDefaultColor = new Color3(0.8, 0.8, 0.8);
        /**
         * This color will be applied to the selection ring when selection is triggered
         */
        _this.selectionMeshPickedColor = new Color3(0.3, 0.3, 1.0);
        _this._hoverRadius = 0.1;
        _this._pickRadius = 0.02;
        _this._controllerPickRadius = 0.03; // The radius is slightly larger here to make it easier to manipulate since it's not tied to the hand position
        _this._nearGrabLengthScale = 5;
        _this._scene = _this._xrSessionManager.scene;
        if (_this._options.nearInteractionControllerMode === undefined) {
            _this._options.nearInteractionControllerMode = WebXRNearControllerMode.CENTERED_IN_FRONT;
        }
        if (_this._options.farInteractionFeature) {
            _this._farInteractionFeature = _this._options.farInteractionFeature;
        }
        return _this;
    }
    /**
     * Attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRNearInteraction.prototype.attach = function () {
        var _this = this;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        this._options.xrInput.controllers.forEach(this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerAddedObservable, this._attachController);
        this._addNewAttachObserver(this._options.xrInput.onControllerRemovedObservable, function (controller) {
            // REMOVE the controller
            _this._detachController(controller.uniqueId);
        });
        this._scene.constantlyUpdateMeshUnderPointer = true;
        return true;
    };
    /**
     * Detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRNearInteraction.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        Object.keys(this._controllers).forEach(function (controllerId) {
            _this._detachController(controllerId);
        });
        return true;
    };
    /**
     * Will get the mesh under a specific pointer.
     * `scene.meshUnderPointer` will only return one mesh - either left or right.
     * @param controllerId the controllerId to check
     * @returns The mesh under pointer or null if no mesh is under the pointer
     */
    WebXRNearInteraction.prototype.getMeshUnderPointer = function (controllerId) {
        if (this._controllers[controllerId]) {
            return this._controllers[controllerId].meshUnderPointer;
        }
        else {
            return null;
        }
    };
    /**
     * Get the xr controller that correlates to the pointer id in the pointer event
     *
     * @param id the pointer id to search for
     * @returns the controller that correlates to this id or null if not found
     */
    WebXRNearInteraction.prototype.getXRControllerByPointerId = function (id) {
        var keys = Object.keys(this._controllers);
        for (var i = 0; i < keys.length; ++i) {
            if (this._controllers[keys[i]].id === id) {
                return this._controllers[keys[i]].xrController || null;
            }
        }
        return null;
    };
    /**
     * This function sets webXRControllerPointerSelection feature that will be disabled when
     * the hover range is reached for a mesh and will be reattached when not in hover range.
     * This is used to remove the selection rays when moving.
     * @param farInteractionFeature the feature to disable when finger is in hover range for a mesh
     */
    WebXRNearInteraction.prototype.setFarInteractionFeature = function (farInteractionFeature) {
        this._farInteractionFeature = farInteractionFeature;
    };
    /**
     * Filter used for near interaction pick and hover
     * @param mesh
     */
    WebXRNearInteraction.prototype._nearPickPredicate = function (mesh) {
        return mesh.isEnabled() && mesh.isVisible && mesh.isPickable && mesh.isNearPickable;
    };
    /**
     * Filter used for near interaction grab
     * @param mesh
     */
    WebXRNearInteraction.prototype._nearGrabPredicate = function (mesh) {
        return mesh.isEnabled() && mesh.isVisible && mesh.isPickable && mesh.isNearGrabbable;
    };
    /**
     * Filter used for any near interaction
     * @param mesh
     */
    WebXRNearInteraction.prototype._nearInteractionPredicate = function (mesh) {
        return mesh.isEnabled() && mesh.isVisible && mesh.isPickable && (mesh.isNearPickable || mesh.isNearGrabbable);
    };
    WebXRNearInteraction.prototype._controllerAvailablePredicate = function (mesh, controllerId) {
        var parent = mesh;
        while (parent) {
            if (parent.reservedDataStore && parent.reservedDataStore.nearInteraction && parent.reservedDataStore.nearInteraction.excludedControllerId === controllerId) {
                return false;
            }
            parent = parent.parent;
        }
        return true;
    };
    WebXRNearInteraction.prototype._handleTransitionAnimation = function (controllerData, newState) {
        var _a;
        if (controllerData.currentAnimationState === newState ||
            this._options.nearInteractionControllerMode !== WebXRNearControllerMode.CENTERED_IN_FRONT ||
            !!((_a = controllerData.xrController) === null || _a === void 0 ? void 0 : _a.inputSource.hand)) {
            return;
        }
        // Don't always break to allow for animation fallthrough on rare cases of multi-transitions
        if (newState > controllerData.currentAnimationState) {
            switch (controllerData.currentAnimationState) {
                case ControllerOrbAnimationState.DEHYDRATED: {
                    controllerData.hydrateCollisionMeshFunction(true);
                    if (newState === ControllerOrbAnimationState.HOVER) {
                        break;
                    }
                }
                // eslint-disable-next-line no-fallthrough
                case ControllerOrbAnimationState.HOVER: {
                    controllerData.touchCollisionMeshFunction(true);
                    if (newState === ControllerOrbAnimationState.TOUCH) {
                        break;
                    }
                }
            }
        }
        else {
            switch (controllerData.currentAnimationState) {
                case ControllerOrbAnimationState.TOUCH: {
                    controllerData.touchCollisionMeshFunction(false);
                    if (newState === ControllerOrbAnimationState.HOVER) {
                        break;
                    }
                }
                // eslint-disable-next-line no-fallthrough
                case ControllerOrbAnimationState.HOVER: {
                    controllerData.hydrateCollisionMeshFunction(false);
                    if (newState === ControllerOrbAnimationState.DEHYDRATED) {
                        break;
                    }
                }
            }
        }
        controllerData.currentAnimationState = newState;
    };
    WebXRNearInteraction.prototype._processTouchPoint = function (id, position, orientation) {
        var _a;
        var controllerData = this._controllers[id];
        // Position and orientation could be temporary values, se we take care of them before calling any functions that use temporary vectors/quaternions
        controllerData.grabRay.origin.copyFrom(position);
        orientation.toEulerAnglesToRef(TmpVectors.Vector3[0]);
        controllerData.grabRay.direction.copyFrom(TmpVectors.Vector3[0]);
        if (this._options.nearInteractionControllerMode === WebXRNearControllerMode.CENTERED_IN_FRONT && !((_a = controllerData.xrController) === null || _a === void 0 ? void 0 : _a.inputSource.hand)) {
            // offset the touch point in the direction the transform is facing
            controllerData.xrController.getWorldPointerRayToRef(this._tmpRay);
            controllerData.grabRay.origin.addInPlace(this._tmpRay.direction.scale(0.05));
        }
        controllerData.grabRay.length = this._nearGrabLengthScale * this._hoverRadius;
        controllerData.touchCollisionMesh.position.copyFrom(controllerData.grabRay.origin);
    };
    WebXRNearInteraction.prototype._onXRFrame = function (_xrFrame) {
        var _this = this;
        Object.keys(this._controllers).forEach(function (id) {
            var _a;
            // only do this for the selected pointer
            var controllerData = _this._controllers[id];
            var handData = (_a = controllerData.xrController) === null || _a === void 0 ? void 0 : _a.inputSource.hand;
            // If near interaction is not enabled/available for this controller, return early
            if ((!_this._options.enableNearInteractionOnAllControllers && id !== _this._attachedController) ||
                !controllerData.xrController ||
                (!handData && (!_this._options.nearInteractionControllerMode || !controllerData.xrController.inputSource.gamepad))) {
                controllerData.pick = null;
                return;
            }
            controllerData.hoverInteraction = false;
            controllerData.nearInteraction = false;
            // Every frame check collisions/input
            if (controllerData.xrController) {
                if (handData) {
                    var xrIndexTip = handData.get("index-finger-tip");
                    if (xrIndexTip) {
                        var indexTipPose = _xrFrame.getJointPose(xrIndexTip, _this._xrSessionManager.referenceSpace);
                        if (indexTipPose && indexTipPose.transform) {
                            var axisRHSMultiplier = _this._scene.useRightHandedSystem ? 1 : -1;
                            TmpVectors.Vector3[0].set(indexTipPose.transform.position.x, indexTipPose.transform.position.y, indexTipPose.transform.position.z * axisRHSMultiplier);
                            TmpVectors.Quaternion[0].set(indexTipPose.transform.orientation.x, indexTipPose.transform.orientation.y, indexTipPose.transform.orientation.z * axisRHSMultiplier, indexTipPose.transform.orientation.w * axisRHSMultiplier);
                            _this._processTouchPoint(id, TmpVectors.Vector3[0], TmpVectors.Quaternion[0]);
                        }
                    }
                }
                else if (controllerData.xrController.inputSource.gamepad && _this._options.nearInteractionControllerMode !== WebXRNearControllerMode.DISABLED) {
                    var controllerPose = controllerData.xrController.pointer;
                    if (controllerData.xrController.grip && _this._options.nearInteractionControllerMode === WebXRNearControllerMode.CENTERED_ON_CONTROLLER) {
                        controllerPose = controllerData.xrController.grip;
                    }
                    _this._processTouchPoint(id, controllerPose.position, controllerPose.rotationQuaternion);
                }
            }
            else {
                return;
            }
            var accuratePickInfo = function (originalScenePick, utilityScenePick) {
                var pick = null;
                if (!utilityScenePick || !utilityScenePick.hit) {
                    // No hit in utility scene
                    pick = originalScenePick;
                }
                else if (!originalScenePick || !originalScenePick.hit) {
                    // No hit in original scene
                    pick = utilityScenePick;
                }
                else if (utilityScenePick.distance < originalScenePick.distance) {
                    // Hit is closer in utility scene
                    pick = utilityScenePick;
                }
                else {
                    // Hit is closer in original scene
                    pick = originalScenePick;
                }
                return pick;
            };
            var populateNearInteractionInfo = function (nearInteractionInfo) {
                var result = new PickingInfo();
                var nearInteractionAtOrigin = false;
                var nearInteraction = nearInteractionInfo && nearInteractionInfo.pickedPoint && nearInteractionInfo.hit;
                if (nearInteractionInfo === null || nearInteractionInfo === void 0 ? void 0 : nearInteractionInfo.pickedPoint) {
                    nearInteractionAtOrigin = nearInteractionInfo.pickedPoint.x === 0 && nearInteractionInfo.pickedPoint.y === 0 && nearInteractionInfo.pickedPoint.z === 0;
                }
                if (nearInteraction && !nearInteractionAtOrigin) {
                    result = nearInteractionInfo;
                }
                return result;
            };
            // Don't perform touch logic while grabbing, to prevent triggering touch interactions while in the middle of a grab interaction
            // Dont update cursor logic either - the cursor should already be visible for the grab to be in range,
            // and in order to maintain its position on the target mesh it is parented for the duration of the grab.
            if (!controllerData.grabInteraction) {
                var pick = null;
                // near interaction hover
                var utilitySceneHoverPick = null;
                if (_this._options.useUtilityLayer && _this._utilityLayerScene) {
                    utilitySceneHoverPick = _this._pickWithSphere(controllerData, _this._hoverRadius, _this._utilityLayerScene, function (mesh) {
                        return _this._nearInteractionPredicate(mesh);
                    });
                }
                var originalSceneHoverPick = _this._pickWithSphere(controllerData, _this._hoverRadius, _this._scene, function (mesh) { return _this._nearInteractionPredicate(mesh); });
                var hoverPickInfo = accuratePickInfo(originalSceneHoverPick, utilitySceneHoverPick);
                if (hoverPickInfo && hoverPickInfo.hit) {
                    pick = populateNearInteractionInfo(hoverPickInfo);
                    if (pick.hit) {
                        controllerData.hoverInteraction = true;
                    }
                }
                // near interaction pick
                if (controllerData.hoverInteraction) {
                    var utilitySceneNearPick = null;
                    var radius = handData ? _this._pickRadius : _this._controllerPickRadius;
                    if (_this._options.useUtilityLayer && _this._utilityLayerScene) {
                        utilitySceneNearPick = _this._pickWithSphere(controllerData, radius, _this._utilityLayerScene, function (mesh) { return _this._nearPickPredicate(mesh); });
                    }
                    var originalSceneNearPick = _this._pickWithSphere(controllerData, radius, _this._scene, function (mesh) { return _this._nearPickPredicate(mesh); });
                    var pickInfo = accuratePickInfo(originalSceneNearPick, utilitySceneNearPick);
                    var nearPick = populateNearInteractionInfo(pickInfo);
                    if (nearPick.hit) {
                        // Near pick takes precedence over hover interaction
                        pick = nearPick;
                        controllerData.nearInteraction = true;
                    }
                }
                controllerData.stalePick = controllerData.pick;
                controllerData.pick = pick;
                // Update mesh under pointer
                if (controllerData.pick && controllerData.pick.pickedPoint && controllerData.pick.hit) {
                    controllerData.meshUnderPointer = controllerData.pick.pickedMesh;
                    controllerData.pickedPointVisualCue.position.copyFrom(controllerData.pick.pickedPoint);
                    controllerData.pickedPointVisualCue.isVisible = true;
                    if (_this._farInteractionFeature && _this._farInteractionFeature.attached) {
                        _this._farInteractionFeature._setPointerSelectionDisabledByPointerId(controllerData.id, true);
                    }
                }
                else {
                    controllerData.meshUnderPointer = null;
                    controllerData.pickedPointVisualCue.isVisible = false;
                    if (_this._farInteractionFeature && _this._farInteractionFeature.attached) {
                        _this._farInteractionFeature._setPointerSelectionDisabledByPointerId(controllerData.id, false);
                    }
                }
            }
            // Update the interaction animation. Only updates if the visible touch mesh is active
            var state = ControllerOrbAnimationState.DEHYDRATED;
            if (controllerData.grabInteraction || controllerData.nearInteraction) {
                state = ControllerOrbAnimationState.TOUCH;
            }
            else if (controllerData.hoverInteraction) {
                state = ControllerOrbAnimationState.HOVER;
            }
            _this._handleTransitionAnimation(controllerData, state);
        });
    };
    Object.defineProperty(WebXRNearInteraction.prototype, "_utilityLayerScene", {
        get: function () {
            return this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene;
        },
        enumerable: false,
        configurable: true
    });
    WebXRNearInteraction.prototype._generateVisualCue = function () {
        var sceneToRenderTo = this._options.useUtilityLayer ? this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene : this._scene;
        var selectionMesh = CreateSphere("nearInteraction", {
            diameter: 0.0035 * 3,
        }, sceneToRenderTo);
        selectionMesh.bakeCurrentTransformIntoVertices();
        selectionMesh.isPickable = false;
        selectionMesh.isVisible = false;
        selectionMesh.rotationQuaternion = Quaternion.Identity();
        var targetMat = new StandardMaterial("targetMat", sceneToRenderTo);
        targetMat.specularColor = Color3.Black();
        targetMat.emissiveColor = this.selectionMeshDefaultColor;
        targetMat.backFaceCulling = false;
        selectionMesh.material = targetMat;
        return selectionMesh;
    };
    WebXRNearInteraction.prototype._isControllerReadyForNearInteraction = function (id) {
        if (this._farInteractionFeature) {
            return this._farInteractionFeature._getPointerSelectionDisabledByPointerId(id);
        }
        return true;
    };
    WebXRNearInteraction.prototype._attachNearInteractionMode = function (xrController) {
        var _this = this;
        var controllerData = this._controllers[xrController.uniqueId];
        var pointerEventInit = {
            pointerId: controllerData.id,
            pointerType: "xr",
        };
        controllerData.onFrameObserver = this._xrSessionManager.onXRFrameObservable.add(function () {
            if ((!_this._options.enableNearInteractionOnAllControllers && xrController.uniqueId !== _this._attachedController) ||
                !controllerData.xrController ||
                (!controllerData.xrController.inputSource.hand && (!_this._options.nearInteractionControllerMode || !controllerData.xrController.inputSource.gamepad))) {
                return;
            }
            if (controllerData.pick) {
                controllerData.pick.ray = controllerData.grabRay;
            }
            if (controllerData.pick && _this._isControllerReadyForNearInteraction(controllerData.id)) {
                _this._scene.simulatePointerMove(controllerData.pick, pointerEventInit);
            }
            // Near pick pointer event
            if (controllerData.nearInteraction && controllerData.pick && controllerData.pick.hit) {
                if (!controllerData.nearInteractionTargetMesh) {
                    _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                    controllerData.nearInteractionTargetMesh = controllerData.meshUnderPointer;
                }
            }
            else if (controllerData.nearInteractionTargetMesh && controllerData.stalePick) {
                _this._scene.simulatePointerUp(controllerData.stalePick, pointerEventInit);
                controllerData.nearInteractionTargetMesh = null;
            }
        });
        var grabCheck = function (pressed) {
            if (_this._options.enableNearInteractionOnAllControllers ||
                (xrController.uniqueId === _this._attachedController && _this._isControllerReadyForNearInteraction(controllerData.id))) {
                if (controllerData.pick) {
                    controllerData.pick.ray = controllerData.grabRay;
                }
                if (pressed && controllerData.pick && controllerData.meshUnderPointer && _this._nearGrabPredicate(controllerData.meshUnderPointer)) {
                    controllerData.grabInteraction = true;
                    controllerData.pickedPointVisualCue.isVisible = false;
                    _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                }
                else if (!pressed && controllerData.pick && controllerData.grabInteraction) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                    controllerData.grabInteraction = false;
                    controllerData.pickedPointVisualCue.isVisible = true;
                }
            }
            else {
                if (pressed && !_this._options.enableNearInteractionOnAllControllers && !_this._options.disableSwitchOnClick) {
                    _this._attachedController = xrController.uniqueId;
                }
            }
        };
        if (xrController.inputSource.gamepad) {
            var init = function (motionController) {
                controllerData.squeezeComponent = motionController.getComponent("grasp");
                if (controllerData.squeezeComponent) {
                    controllerData.onSqueezeButtonChangedObserver = controllerData.squeezeComponent.onButtonStateChangedObservable.add(function (component) {
                        if (component.changes.pressed) {
                            var pressed = component.changes.pressed.current;
                            grabCheck(pressed);
                        }
                    });
                }
                else {
                    controllerData.selectionComponent = motionController.getMainComponent();
                    controllerData.onButtonChangedObserver = controllerData.selectionComponent.onButtonStateChangedObservable.add(function (component) {
                        if (component.changes.pressed) {
                            var pressed = component.changes.pressed.current;
                            grabCheck(pressed);
                        }
                    });
                }
            };
            if (xrController.motionController) {
                init(xrController.motionController);
            }
            else {
                xrController.onMotionControllerInitObservable.add(init);
            }
        }
        else {
            // use the select and squeeze events
            var selectStartListener = function (event) {
                if (controllerData.xrController &&
                    event.inputSource === controllerData.xrController.inputSource &&
                    controllerData.pick &&
                    _this._isControllerReadyForNearInteraction(controllerData.id) &&
                    controllerData.meshUnderPointer &&
                    _this._nearGrabPredicate(controllerData.meshUnderPointer)) {
                    controllerData.grabInteraction = true;
                    controllerData.pickedPointVisualCue.isVisible = false;
                    _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                }
            };
            var selectEndListener = function (event) {
                if (controllerData.xrController &&
                    event.inputSource === controllerData.xrController.inputSource &&
                    controllerData.pick &&
                    _this._isControllerReadyForNearInteraction(controllerData.id)) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                    controllerData.grabInteraction = false;
                    controllerData.pickedPointVisualCue.isVisible = true;
                }
            };
            controllerData.eventListeners = {
                selectend: selectEndListener,
                selectstart: selectStartListener,
            };
            this._xrSessionManager.session.addEventListener("selectstart", selectStartListener);
            this._xrSessionManager.session.addEventListener("selectend", selectEndListener);
        }
    };
    WebXRNearInteraction.prototype._detachController = function (xrControllerUniqueId) {
        var _this = this;
        var controllerData = this._controllers[xrControllerUniqueId];
        if (!controllerData) {
            return;
        }
        if (controllerData.squeezeComponent) {
            if (controllerData.onSqueezeButtonChangedObserver) {
                controllerData.squeezeComponent.onButtonStateChangedObservable.remove(controllerData.onSqueezeButtonChangedObserver);
            }
        }
        if (controllerData.selectionComponent) {
            if (controllerData.onButtonChangedObserver) {
                controllerData.selectionComponent.onButtonStateChangedObservable.remove(controllerData.onButtonChangedObserver);
            }
        }
        if (controllerData.onFrameObserver) {
            this._xrSessionManager.onXRFrameObservable.remove(controllerData.onFrameObserver);
        }
        if (controllerData.eventListeners) {
            Object.keys(controllerData.eventListeners).forEach(function (eventName) {
                var func = controllerData.eventListeners && controllerData.eventListeners[eventName];
                if (func) {
                    _this._xrSessionManager.session.removeEventListener(eventName, func);
                }
            });
        }
        controllerData.touchCollisionMesh.dispose();
        controllerData.pickedPointVisualCue.dispose();
        this._xrSessionManager.runInXRFrame(function () {
            // Fire a pointerup
            var pointerEventInit = {
                pointerId: controllerData.id,
                pointerType: "xr",
            };
            _this._scene.simulatePointerUp(new PickingInfo(), pointerEventInit);
        });
        // remove from the map
        delete this._controllers[xrControllerUniqueId];
        if (this._attachedController === xrControllerUniqueId) {
            // check for other controllers
            var keys = Object.keys(this._controllers);
            if (keys.length) {
                this._attachedController = keys[0];
            }
            else {
                this._attachedController = "";
            }
        }
    };
    WebXRNearInteraction.prototype._generateNewTouchPointMesh = function () {
        // populate information for near hover, pick and pinch
        var meshCreationScene = this._options.useUtilityLayer ? this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene : this._scene;
        var touchCollisionMesh = CreateSphere("PickSphere", { diameter: 1 }, meshCreationScene);
        touchCollisionMesh.isVisible = false;
        // Generate the material for the touch mesh visuals
        if (this._options.motionControllerOrbMaterial) {
            touchCollisionMesh.material = this._options.motionControllerOrbMaterial;
        }
        else {
            NodeMaterial.ParseFromSnippetAsync("8RUNKL#3", meshCreationScene).then(function (nodeMaterial) {
                touchCollisionMesh.material = nodeMaterial;
            });
        }
        var easingFunction = new QuadraticEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        // Adjust the visual size based off of the size of the touch collision orb.
        // Having the size perfectly match for hover gives a more accurate tell for when the user will start interacting with the target
        // Sizes for other states are somewhat arbitrary, as they are based on what feels nice during an interaction
        var hoverSizeVec = new Vector3(this._controllerPickRadius, this._controllerPickRadius, this._controllerPickRadius);
        var touchSize = this._controllerPickRadius * (4 / 3);
        var touchSizeVec = new Vector3(touchSize, touchSize, touchSize);
        var hydrateTransitionSize = this._controllerPickRadius * (7 / 6);
        var hydrateTransitionSizeVec = new Vector3(hydrateTransitionSize, hydrateTransitionSize, hydrateTransitionSize);
        var touchHoverTransitionSize = this._controllerPickRadius * (4 / 5);
        var touchHoverTransitionSizeVec = new Vector3(touchHoverTransitionSize, touchHoverTransitionSize, touchHoverTransitionSize);
        var hoverTouchTransitionSize = this._controllerPickRadius * (3 / 2);
        var hoverTouchTransitionSizeVec = new Vector3(hoverTouchTransitionSize, hoverTouchTransitionSize, hoverTouchTransitionSize);
        var touchKeys = [
            { frame: 0, value: hoverSizeVec },
            { frame: 10, value: hoverTouchTransitionSizeVec },
            { frame: 18, value: touchSizeVec },
        ];
        var releaseKeys = [
            { frame: 0, value: touchSizeVec },
            { frame: 10, value: touchHoverTransitionSizeVec },
            { frame: 18, value: hoverSizeVec },
        ];
        var hydrateKeys = [
            { frame: 0, value: Vector3.ZeroReadOnly },
            { frame: 12, value: hydrateTransitionSizeVec },
            { frame: 15, value: hoverSizeVec },
        ];
        var dehydrateKeys = [
            { frame: 0, value: hoverSizeVec },
            { frame: 10, value: Vector3.ZeroReadOnly },
            { frame: 15, value: Vector3.ZeroReadOnly },
        ];
        var touchAction = new Animation("touch", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        var releaseAction = new Animation("release", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        var hydrateAction = new Animation("hydrate", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        var dehydrateAction = new Animation("dehydrate", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        touchAction.setEasingFunction(easingFunction);
        releaseAction.setEasingFunction(easingFunction);
        hydrateAction.setEasingFunction(easingFunction);
        dehydrateAction.setEasingFunction(easingFunction);
        touchAction.setKeys(touchKeys);
        releaseAction.setKeys(releaseKeys);
        hydrateAction.setKeys(hydrateKeys);
        dehydrateAction.setKeys(dehydrateKeys);
        var touchCollisionMeshFunction = function (isTouch) {
            var action = isTouch ? touchAction : releaseAction;
            meshCreationScene.beginDirectAnimation(touchCollisionMesh, [action], 0, 18, false, 1);
        };
        var hydrateCollisionMeshFunction = function (isHydration) {
            var action = isHydration ? hydrateAction : dehydrateAction;
            if (isHydration) {
                touchCollisionMesh.isVisible = true;
            }
            meshCreationScene.beginDirectAnimation(touchCollisionMesh, [action], 0, 15, false, 1, function () {
                if (!isHydration) {
                    touchCollisionMesh.isVisible = false;
                }
            });
        };
        return { touchCollisionMesh: touchCollisionMesh, touchCollisionMeshFunction: touchCollisionMeshFunction, hydrateCollisionMeshFunction: hydrateCollisionMeshFunction };
    };
    WebXRNearInteraction.prototype._pickWithSphere = function (controllerData, radius, sceneToUse, predicate) {
        var pickingInfo = new PickingInfo();
        pickingInfo.distance = +Infinity;
        if (controllerData.touchCollisionMesh && controllerData.xrController) {
            var position = controllerData.touchCollisionMesh.position;
            var sphere = BoundingSphere.CreateFromCenterAndRadius(position, radius);
            for (var meshIndex = 0; meshIndex < sceneToUse.meshes.length; meshIndex++) {
                var mesh = sceneToUse.meshes[meshIndex];
                if (!predicate(mesh) || !this._controllerAvailablePredicate(mesh, controllerData.xrController.uniqueId)) {
                    continue;
                }
                var result = WebXRNearInteraction.PickMeshWithSphere(mesh, sphere);
                if (result && result.hit && result.distance < pickingInfo.distance) {
                    pickingInfo.hit = result.hit;
                    pickingInfo.pickedMesh = mesh;
                    pickingInfo.pickedPoint = result.pickedPoint;
                    pickingInfo.aimTransform = controllerData.xrController.pointer;
                    pickingInfo.gripTransform = controllerData.xrController.grip || null;
                    pickingInfo.originMesh = controllerData.touchCollisionMesh;
                    pickingInfo.distance = result.distance;
                }
            }
        }
        return pickingInfo;
    };
    /**
     * Picks a mesh with a sphere
     * @param mesh the mesh to pick
     * @param sphere picking sphere in world coordinates
     * @param skipBoundingInfo a boolean indicating if we should skip the bounding info check
     * @returns the picking info
     */
    WebXRNearInteraction.PickMeshWithSphere = function (mesh, sphere, skipBoundingInfo) {
        if (skipBoundingInfo === void 0) { skipBoundingInfo = false; }
        var subMeshes = mesh.subMeshes;
        var pi = new PickingInfo();
        var boundingInfo = mesh.getBoundingInfo();
        if (!mesh._generatePointsArray()) {
            return pi;
        }
        if (!mesh.subMeshes || !boundingInfo) {
            return pi;
        }
        if (!skipBoundingInfo && !BoundingSphere.Intersects(boundingInfo.boundingSphere, sphere)) {
            return pi;
        }
        var result = TmpVectors.Vector3[0];
        var tmpVec = TmpVectors.Vector3[1];
        var distance = +Infinity;
        var tmp, tmpDistanceSphereToCenter, tmpDistanceSurfaceToCenter;
        var center = TmpVectors.Vector3[2];
        var worldToMesh = TmpVectors.Matrix[0];
        worldToMesh.copyFrom(mesh.getWorldMatrix());
        worldToMesh.invert();
        Vector3.TransformCoordinatesToRef(sphere.center, worldToMesh, center);
        for (var index = 0; index < subMeshes.length; index++) {
            var subMesh = subMeshes[index];
            subMesh.projectToRef(center, mesh._positions, mesh.getIndices(), tmpVec);
            Vector3.TransformCoordinatesToRef(tmpVec, mesh.getWorldMatrix(), tmpVec);
            tmp = Vector3.Distance(tmpVec, sphere.center);
            // Check for finger inside of mesh
            tmpDistanceSurfaceToCenter = Vector3.Distance(tmpVec, mesh.getAbsolutePosition());
            tmpDistanceSphereToCenter = Vector3.Distance(sphere.center, mesh.getAbsolutePosition());
            if (tmpDistanceSphereToCenter !== -1 && tmpDistanceSurfaceToCenter !== -1 && tmpDistanceSurfaceToCenter > tmpDistanceSphereToCenter) {
                tmp = 0;
                tmpVec.copyFrom(sphere.center);
            }
            if (tmp !== -1 && tmp < distance) {
                distance = tmp;
                result.copyFrom(tmpVec);
            }
        }
        if (distance < sphere.radius) {
            pi.hit = true;
            pi.distance = distance;
            pi.pickedMesh = mesh;
            pi.pickedPoint = result.clone();
        }
        return pi;
    };
    WebXRNearInteraction._IdCounter = 200;
    /**
     * The module's name
     */
    WebXRNearInteraction.Name = WebXRFeatureName.NEAR_INTERACTION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRNearInteraction.Version = 1;
    return WebXRNearInteraction;
}(WebXRAbstractFeature));
export { WebXRNearInteraction };
//Register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRNearInteraction.Name, function (xrSessionManager, options) {
    return function () { return new WebXRNearInteraction(xrSessionManager, options); };
}, WebXRNearInteraction.Version, true);
//# sourceMappingURL=WebXRNearInteraction.js.map