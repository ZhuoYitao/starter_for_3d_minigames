import { __extends } from "tslib";
import { WebXRFeaturesManager, WebXRFeatureName } from "../webXRFeaturesManager.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { Color3 } from "../../Maths/math.color.js";
import { Axis } from "../../Maths/math.axis.js";
import { StandardMaterial } from "../../Materials/standardMaterial.js";
import { CreateCylinder } from "../../Meshes/Builders/cylinderBuilder.js";
import { CreateTorus } from "../../Meshes/Builders/torusBuilder.js";
import { Ray } from "../../Culling/ray.js";
import { PickingInfo } from "../../Collisions/pickingInfo.js";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { UtilityLayerRenderer } from "../../Rendering/utilityLayerRenderer.js";
import { Viewport } from "../../Maths/math.viewport.js";
import { Tools } from "../../Misc/tools.js";
/**
 * A module that will enable pointer selection for motion controllers of XR Input Sources
 */
var WebXRControllerPointerSelection = /** @class */ (function (_super) {
    __extends(WebXRControllerPointerSelection, _super);
    /**
     * constructs a new background remover module
     * @param _xrSessionManager the session manager for this module
     * @param _options read-only options to be used in this module
     */
    function WebXRControllerPointerSelection(_xrSessionManager, _options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this._options = _options;
        _this._attachController = function (xrController) {
            if (_this._controllers[xrController.uniqueId]) {
                // already attached
                return;
            }
            var _a = _this._generateNewMeshPair(xrController.pointer), laserPointer = _a.laserPointer, selectionMesh = _a.selectionMesh;
            // get two new meshes
            _this._controllers[xrController.uniqueId] = {
                xrController: xrController,
                laserPointer: laserPointer,
                selectionMesh: selectionMesh,
                meshUnderPointer: null,
                pick: null,
                tmpRay: new Ray(new Vector3(), new Vector3()),
                disabledByNearInteraction: false,
                id: WebXRControllerPointerSelection._IdCounter++,
            };
            if (_this._attachedController) {
                if (!_this._options.enablePointerSelectionOnAllControllers &&
                    _this._options.preferredHandedness &&
                    xrController.inputSource.handedness === _this._options.preferredHandedness) {
                    _this._attachedController = xrController.uniqueId;
                }
            }
            else {
                if (!_this._options.enablePointerSelectionOnAllControllers) {
                    _this._attachedController = xrController.uniqueId;
                }
            }
            switch (xrController.inputSource.targetRayMode) {
                case "tracked-pointer":
                    return _this._attachTrackedPointerRayMode(xrController);
                case "gaze":
                    return _this._attachGazeMode(xrController);
                case "screen":
                    return _this._attachScreenRayMode(xrController);
            }
        };
        _this._controllers = {};
        _this._tmpVectorForPickCompare = new Vector3();
        /**
         * Disable lighting on the laser pointer (so it will always be visible)
         */
        _this.disablePointerLighting = true;
        /**
         * Disable lighting on the selection mesh (so it will always be visible)
         */
        _this.disableSelectionMeshLighting = true;
        /**
         * Should the laser pointer be displayed
         */
        _this.displayLaserPointer = true;
        /**
         * Should the selection mesh be displayed (The ring at the end of the laser pointer)
         */
        _this.displaySelectionMesh = true;
        /**
         * This color will be set to the laser pointer when selection is triggered
         */
        _this.laserPointerPickedColor = new Color3(0.9, 0.9, 0.9);
        /**
         * Default color of the laser pointer
         */
        _this.laserPointerDefaultColor = new Color3(0.7, 0.7, 0.7);
        /**
         * default color of the selection ring
         */
        _this.selectionMeshDefaultColor = new Color3(0.8, 0.8, 0.8);
        /**
         * This color will be applied to the selection ring when selection is triggered
         */
        _this.selectionMeshPickedColor = new Color3(0.3, 0.3, 1.0);
        _this._identityMatrix = Matrix.Identity();
        _this._screenCoordinatesRef = Vector3.Zero();
        _this._viewportRef = new Viewport(0, 0, 0, 0);
        _this._scene = _this._xrSessionManager.scene;
        return _this;
    }
    /**
     * attach this feature
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRControllerPointerSelection.prototype.attach = function () {
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
        if (this._options.gazeCamera) {
            var webXRCamera = this._options.gazeCamera;
            var _a = this._generateNewMeshPair(webXRCamera), laserPointer = _a.laserPointer, selectionMesh = _a.selectionMesh;
            this._controllers["camera"] = {
                webXRCamera: webXRCamera,
                laserPointer: laserPointer,
                selectionMesh: selectionMesh,
                meshUnderPointer: null,
                pick: null,
                tmpRay: new Ray(new Vector3(), new Vector3()),
                disabledByNearInteraction: false,
                id: WebXRControllerPointerSelection._IdCounter++,
            };
            this._attachGazeMode();
        }
        return true;
    };
    /**
     * detach this feature.
     * Will usually be called by the features manager
     *
     * @returns true if successful.
     */
    WebXRControllerPointerSelection.prototype.detach = function () {
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
    WebXRControllerPointerSelection.prototype.getMeshUnderPointer = function (controllerId) {
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
    WebXRControllerPointerSelection.prototype.getXRControllerByPointerId = function (id) {
        var keys = Object.keys(this._controllers);
        for (var i = 0; i < keys.length; ++i) {
            if (this._controllers[keys[i]].id === id) {
                return this._controllers[keys[i]].xrController || null;
            }
        }
        return null;
    };
    /**
     * @param id
     * @hidden
     */
    WebXRControllerPointerSelection.prototype._getPointerSelectionDisabledByPointerId = function (id) {
        var keys = Object.keys(this._controllers);
        for (var i = 0; i < keys.length; ++i) {
            if (this._controllers[keys[i]].id === id) {
                return this._controllers[keys[i]].disabledByNearInteraction;
            }
        }
        return true;
    };
    /**
     * @param id
     * @param state
     * @hidden
     */
    WebXRControllerPointerSelection.prototype._setPointerSelectionDisabledByPointerId = function (id, state) {
        var keys = Object.keys(this._controllers);
        for (var i = 0; i < keys.length; ++i) {
            if (this._controllers[keys[i]].id === id) {
                this._controllers[keys[i]].disabledByNearInteraction = state;
                return;
            }
        }
    };
    WebXRControllerPointerSelection.prototype._onXRFrame = function (_xrFrame) {
        var _this = this;
        Object.keys(this._controllers).forEach(function (id) {
            // only do this for the selected pointer
            var controllerData = _this._controllers[id];
            if ((!_this._options.enablePointerSelectionOnAllControllers && id !== _this._attachedController) || controllerData.disabledByNearInteraction) {
                controllerData.selectionMesh.isVisible = false;
                controllerData.laserPointer.isVisible = false;
                controllerData.pick = null;
                return;
            }
            controllerData.laserPointer.isVisible = _this.displayLaserPointer;
            var controllerGlobalPosition;
            // Every frame check collisions/input
            if (controllerData.xrController) {
                controllerGlobalPosition = controllerData.xrController.pointer.position;
                controllerData.xrController.getWorldPointerRayToRef(controllerData.tmpRay);
            }
            else if (controllerData.webXRCamera) {
                controllerGlobalPosition = controllerData.webXRCamera.position;
                controllerData.webXRCamera.getForwardRayToRef(controllerData.tmpRay);
            }
            else {
                return;
            }
            if (_this._options.maxPointerDistance) {
                controllerData.tmpRay.length = _this._options.maxPointerDistance;
            }
            // update pointerX and pointerY of the scene. Only if the flag is set to true!
            if (!_this._options.disableScenePointerVectorUpdate && controllerGlobalPosition) {
                var scene = _this._xrSessionManager.scene;
                var camera = _this._options.xrInput.xrCamera;
                if (camera) {
                    camera.viewport.toGlobalToRef(scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight(), _this._viewportRef);
                    Vector3.ProjectToRef(controllerGlobalPosition, _this._identityMatrix, scene.getTransformMatrix(), _this._viewportRef, _this._screenCoordinatesRef);
                    // stay safe
                    if (typeof _this._screenCoordinatesRef.x === "number" &&
                        typeof _this._screenCoordinatesRef.y === "number" &&
                        !isNaN(_this._screenCoordinatesRef.x) &&
                        !isNaN(_this._screenCoordinatesRef.y)) {
                        scene.pointerX = _this._screenCoordinatesRef.x;
                        scene.pointerY = _this._screenCoordinatesRef.y;
                        controllerData.screenCoordinates = {
                            x: _this._screenCoordinatesRef.x,
                            y: _this._screenCoordinatesRef.y,
                        };
                    }
                }
            }
            var utilityScenePick = null;
            if (_this._utilityLayerScene) {
                utilityScenePick = _this._utilityLayerScene.pickWithRay(controllerData.tmpRay, _this._utilityLayerScene.pointerMovePredicate || _this.raySelectionPredicate);
            }
            var originalScenePick = _this._scene.pickWithRay(controllerData.tmpRay, _this._scene.pointerMovePredicate || _this.raySelectionPredicate);
            if (!utilityScenePick || !utilityScenePick.hit) {
                // No hit in utility scene
                controllerData.pick = originalScenePick;
            }
            else if (!originalScenePick || !originalScenePick.hit) {
                // No hit in original scene
                controllerData.pick = utilityScenePick;
            }
            else if (utilityScenePick.distance < originalScenePick.distance) {
                // Hit is closer in utility scene
                controllerData.pick = utilityScenePick;
            }
            else {
                // Hit is closer in original scene
                controllerData.pick = originalScenePick;
            }
            if (controllerData.pick && controllerData.xrController) {
                controllerData.pick.aimTransform = controllerData.xrController.pointer;
                controllerData.pick.gripTransform = controllerData.xrController.grip || null;
            }
            var pick = controllerData.pick;
            if (pick && pick.pickedPoint && pick.hit) {
                // Update laser state
                _this._updatePointerDistance(controllerData.laserPointer, pick.distance);
                // Update cursor state
                controllerData.selectionMesh.position.copyFrom(pick.pickedPoint);
                controllerData.selectionMesh.scaling.x = Math.sqrt(pick.distance);
                controllerData.selectionMesh.scaling.y = Math.sqrt(pick.distance);
                controllerData.selectionMesh.scaling.z = Math.sqrt(pick.distance);
                // To avoid z-fighting
                var pickNormal = _this._convertNormalToDirectionOfRay(pick.getNormal(true), controllerData.tmpRay);
                var deltaFighting = 0.001;
                controllerData.selectionMesh.position.copyFrom(pick.pickedPoint);
                if (pickNormal) {
                    var axis1 = Vector3.Cross(Axis.Y, pickNormal);
                    var axis2 = Vector3.Cross(pickNormal, axis1);
                    Vector3.RotationFromAxisToRef(axis2, pickNormal, axis1, controllerData.selectionMesh.rotation);
                    controllerData.selectionMesh.position.addInPlace(pickNormal.scale(deltaFighting));
                }
                controllerData.selectionMesh.isVisible = true && _this.displaySelectionMesh;
                controllerData.meshUnderPointer = pick.pickedMesh;
            }
            else {
                controllerData.selectionMesh.isVisible = false;
                _this._updatePointerDistance(controllerData.laserPointer, 1);
                controllerData.meshUnderPointer = null;
            }
        });
    };
    Object.defineProperty(WebXRControllerPointerSelection.prototype, "_utilityLayerScene", {
        get: function () {
            return this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene;
        },
        enumerable: false,
        configurable: true
    });
    WebXRControllerPointerSelection.prototype._attachGazeMode = function (xrController) {
        var _this = this;
        var controllerData = this._controllers[(xrController && xrController.uniqueId) || "camera"];
        // attached when touched, detaches when raised
        var timeToSelect = this._options.timeToSelect || 3000;
        var sceneToRenderTo = this._options.useUtilityLayer ? this._utilityLayerScene : this._scene;
        var oldPick = new PickingInfo();
        var discMesh = CreateTorus("selection", {
            diameter: 0.0035 * 15,
            thickness: 0.0025 * 6,
            tessellation: 20,
        }, sceneToRenderTo);
        discMesh.isVisible = false;
        discMesh.isPickable = false;
        discMesh.parent = controllerData.selectionMesh;
        var timer = 0;
        var downTriggered = false;
        var pointerEventInit = {
            pointerId: controllerData.id,
            pointerType: "xr",
        };
        controllerData.onFrameObserver = this._xrSessionManager.onXRFrameObservable.add(function () {
            if (!controllerData.pick) {
                return;
            }
            _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
            controllerData.laserPointer.material.alpha = 0;
            discMesh.isVisible = false;
            if (controllerData.pick.hit) {
                if (!_this._pickingMoved(oldPick, controllerData.pick)) {
                    if (timer > timeToSelect / 10) {
                        discMesh.isVisible = true;
                    }
                    timer += _this._scene.getEngine().getDeltaTime();
                    if (timer >= timeToSelect) {
                        _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                        // this pointerdown event is not setting the controllerData.pointerDownTriggered to avoid a pointerUp event when this feature is detached
                        downTriggered = true;
                        // pointer up right after down, if disable on touch out
                        if (_this._options.disablePointerUpOnTouchOut) {
                            _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                        }
                        discMesh.isVisible = false;
                    }
                    else {
                        var scaleFactor = 1 - timer / timeToSelect;
                        discMesh.scaling.set(scaleFactor, scaleFactor, scaleFactor);
                    }
                }
                else {
                    if (downTriggered) {
                        if (!_this._options.disablePointerUpOnTouchOut) {
                            _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                        }
                    }
                    downTriggered = false;
                    timer = 0;
                }
            }
            else {
                downTriggered = false;
                timer = 0;
            }
            _this._scene.simulatePointerMove(controllerData.pick, pointerEventInit);
            oldPick = controllerData.pick;
        });
        if (this._options.renderingGroupId !== undefined) {
            discMesh.renderingGroupId = this._options.renderingGroupId;
        }
        if (xrController) {
            xrController.onDisposeObservable.addOnce(function () {
                if (controllerData.pick && !_this._options.disablePointerUpOnTouchOut && downTriggered) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                    controllerData.finalPointerUpTriggered = true;
                }
                discMesh.dispose();
            });
        }
    };
    WebXRControllerPointerSelection.prototype._attachScreenRayMode = function (xrController) {
        var _this = this;
        var controllerData = this._controllers[xrController.uniqueId];
        var downTriggered = false;
        var pointerEventInit = {
            pointerId: controllerData.id,
            pointerType: "xr",
        };
        controllerData.onFrameObserver = this._xrSessionManager.onXRFrameObservable.add(function () {
            _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
            if (!controllerData.pick || (_this._options.disablePointerUpOnTouchOut && downTriggered)) {
                return;
            }
            if (!downTriggered) {
                _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                controllerData.pointerDownTriggered = true;
                downTriggered = true;
                if (_this._options.disablePointerUpOnTouchOut) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                }
            }
            else {
                _this._scene.simulatePointerMove(controllerData.pick, pointerEventInit);
            }
        });
        xrController.onDisposeObservable.addOnce(function () {
            _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
            _this._xrSessionManager.runInXRFrame(function () {
                if (controllerData.pick && !controllerData.finalPointerUpTriggered && downTriggered && !_this._options.disablePointerUpOnTouchOut) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                    controllerData.finalPointerUpTriggered = true;
                }
            });
        });
    };
    WebXRControllerPointerSelection.prototype._attachTrackedPointerRayMode = function (xrController) {
        var _this = this;
        var controllerData = this._controllers[xrController.uniqueId];
        if (this._options.forceGazeMode) {
            return this._attachGazeMode(xrController);
        }
        var pointerEventInit = {
            pointerId: controllerData.id,
            pointerType: "xr",
        };
        controllerData.onFrameObserver = this._xrSessionManager.onXRFrameObservable.add(function () {
            controllerData.laserPointer.material.disableLighting = _this.disablePointerLighting;
            controllerData.selectionMesh.material.disableLighting = _this.disableSelectionMeshLighting;
            if (controllerData.pick) {
                _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
                _this._scene.simulatePointerMove(controllerData.pick, pointerEventInit);
            }
        });
        if (xrController.inputSource.gamepad) {
            var init = function (motionController) {
                if (_this._options.overrideButtonId) {
                    controllerData.selectionComponent = motionController.getComponent(_this._options.overrideButtonId);
                }
                if (!controllerData.selectionComponent) {
                    controllerData.selectionComponent = motionController.getMainComponent();
                }
                controllerData.onButtonChangedObserver = controllerData.selectionComponent.onButtonStateChangedObservable.add(function (component) {
                    if (component.changes.pressed) {
                        var pressed = component.changes.pressed.current;
                        if (controllerData.pick) {
                            if (_this._options.enablePointerSelectionOnAllControllers || xrController.uniqueId === _this._attachedController) {
                                _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
                                if (pressed) {
                                    _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                                    controllerData.pointerDownTriggered = true;
                                    controllerData.selectionMesh.material.emissiveColor = _this.selectionMeshPickedColor;
                                    controllerData.laserPointer.material.emissiveColor = _this.laserPointerPickedColor;
                                }
                                else {
                                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                                    controllerData.selectionMesh.material.emissiveColor = _this.selectionMeshDefaultColor;
                                    controllerData.laserPointer.material.emissiveColor = _this.laserPointerDefaultColor;
                                }
                            }
                        }
                        else {
                            if (pressed && !_this._options.enablePointerSelectionOnAllControllers && !_this._options.disableSwitchOnClick) {
                                _this._attachedController = xrController.uniqueId;
                            }
                        }
                    }
                });
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
                _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
                if (controllerData.xrController && event.inputSource === controllerData.xrController.inputSource && controllerData.pick) {
                    _this._scene.simulatePointerDown(controllerData.pick, pointerEventInit);
                    controllerData.pointerDownTriggered = true;
                    controllerData.selectionMesh.material.emissiveColor = _this.selectionMeshPickedColor;
                    controllerData.laserPointer.material.emissiveColor = _this.laserPointerPickedColor;
                }
            };
            var selectEndListener = function (event) {
                _this._augmentPointerInit(pointerEventInit, controllerData.id, controllerData.screenCoordinates);
                if (controllerData.xrController && event.inputSource === controllerData.xrController.inputSource && controllerData.pick) {
                    _this._scene.simulatePointerUp(controllerData.pick, pointerEventInit);
                    controllerData.selectionMesh.material.emissiveColor = _this.selectionMeshDefaultColor;
                    controllerData.laserPointer.material.emissiveColor = _this.laserPointerDefaultColor;
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
    WebXRControllerPointerSelection.prototype._convertNormalToDirectionOfRay = function (normal, ray) {
        if (normal) {
            var angle = Math.acos(Vector3.Dot(normal, ray.direction));
            if (angle < Math.PI / 2) {
                normal.scaleInPlace(-1);
            }
        }
        return normal;
    };
    WebXRControllerPointerSelection.prototype._detachController = function (xrControllerUniqueId) {
        var _this = this;
        var controllerData = this._controllers[xrControllerUniqueId];
        if (!controllerData) {
            return;
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
        if (!controllerData.finalPointerUpTriggered && controllerData.pointerDownTriggered) {
            // Stay safe and fire a pointerup, in case it wasn't already triggered
            var pointerEventInit_1 = {
                pointerId: controllerData.id,
                pointerType: "xr",
            };
            this._xrSessionManager.runInXRFrame(function () {
                _this._augmentPointerInit(pointerEventInit_1, controllerData.id, controllerData.screenCoordinates);
                _this._scene.simulatePointerUp(new PickingInfo(), pointerEventInit_1);
                controllerData.finalPointerUpTriggered = true;
            });
        }
        this._xrSessionManager.scene.onBeforeRenderObservable.addOnce(function () {
            try {
                controllerData.selectionMesh.dispose();
                controllerData.laserPointer.dispose();
                // remove from the map
                delete _this._controllers[xrControllerUniqueId];
                if (_this._attachedController === xrControllerUniqueId) {
                    // check for other controllers
                    var keys = Object.keys(_this._controllers);
                    if (keys.length) {
                        _this._attachedController = keys[0];
                    }
                    else {
                        _this._attachedController = "";
                    }
                }
            }
            catch (e) {
                Tools.Warn("controller already detached.");
            }
        });
    };
    WebXRControllerPointerSelection.prototype._generateNewMeshPair = function (meshParent) {
        var sceneToRenderTo = this._options.useUtilityLayer ? this._options.customUtilityLayerScene || UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene : this._scene;
        var laserPointer = this._options.customLasterPointerMeshGenerator
            ? this._options.customLasterPointerMeshGenerator()
            : CreateCylinder("laserPointer", {
                height: 1,
                diameterTop: 0.0002,
                diameterBottom: 0.004,
                tessellation: 20,
                subdivisions: 1,
            }, sceneToRenderTo);
        laserPointer.parent = meshParent;
        var laserPointerMaterial = new StandardMaterial("laserPointerMat", sceneToRenderTo);
        laserPointerMaterial.emissiveColor = this.laserPointerDefaultColor;
        laserPointerMaterial.alpha = 0.7;
        laserPointer.material = laserPointerMaterial;
        laserPointer.rotation.x = Math.PI / 2;
        this._updatePointerDistance(laserPointer, 1);
        laserPointer.isPickable = false;
        laserPointer.isVisible = false;
        // Create a gaze tracker for the  XR controller
        var selectionMesh = this._options.customSelectionMeshGenerator
            ? this._options.customSelectionMeshGenerator()
            : CreateTorus("gazeTracker", {
                diameter: 0.0035 * 3,
                thickness: 0.0025 * 3,
                tessellation: 20,
            }, sceneToRenderTo);
        selectionMesh.bakeCurrentTransformIntoVertices();
        selectionMesh.isPickable = false;
        selectionMesh.isVisible = false;
        var targetMat = new StandardMaterial("targetMat", sceneToRenderTo);
        targetMat.specularColor = Color3.Black();
        targetMat.emissiveColor = this.selectionMeshDefaultColor;
        targetMat.backFaceCulling = false;
        selectionMesh.material = targetMat;
        if (this._options.renderingGroupId !== undefined) {
            laserPointer.renderingGroupId = this._options.renderingGroupId;
            selectionMesh.renderingGroupId = this._options.renderingGroupId;
        }
        return {
            laserPointer: laserPointer,
            selectionMesh: selectionMesh,
        };
    };
    WebXRControllerPointerSelection.prototype._pickingMoved = function (oldPick, newPick) {
        var _a;
        if (!oldPick.hit || !newPick.hit) {
            return true;
        }
        if (!oldPick.pickedMesh || !oldPick.pickedPoint || !newPick.pickedMesh || !newPick.pickedPoint) {
            return true;
        }
        if (oldPick.pickedMesh !== newPick.pickedMesh) {
            return true;
        }
        (_a = oldPick.pickedPoint) === null || _a === void 0 ? void 0 : _a.subtractToRef(newPick.pickedPoint, this._tmpVectorForPickCompare);
        this._tmpVectorForPickCompare.set(Math.abs(this._tmpVectorForPickCompare.x), Math.abs(this._tmpVectorForPickCompare.y), Math.abs(this._tmpVectorForPickCompare.z));
        var delta = (this._options.gazeModePointerMovedFactor || 1) * 0.01 * newPick.distance;
        var length = this._tmpVectorForPickCompare.length();
        if (length > delta) {
            return true;
        }
        return false;
    };
    WebXRControllerPointerSelection.prototype._updatePointerDistance = function (_laserPointer, distance) {
        if (distance === void 0) { distance = 100; }
        _laserPointer.scaling.y = distance;
        // a bit of distance from the controller
        if (this._scene.useRightHandedSystem) {
            distance *= -1;
        }
        _laserPointer.position.z = distance / 2 + 0.05;
    };
    WebXRControllerPointerSelection.prototype._augmentPointerInit = function (pointerEventInit, id, screenCoordinates) {
        pointerEventInit.pointerId = id;
        pointerEventInit.pointerType = "xr";
        if (screenCoordinates) {
            pointerEventInit.screenX = screenCoordinates.x;
            pointerEventInit.screenY = screenCoordinates.y;
        }
    };
    Object.defineProperty(WebXRControllerPointerSelection.prototype, "lasterPointerDefaultColor", {
        /** @hidden */
        get: function () {
            // here due to a typo
            return this.laserPointerDefaultColor;
        },
        enumerable: false,
        configurable: true
    });
    WebXRControllerPointerSelection._IdCounter = 200;
    /**
     * The module's name
     */
    WebXRControllerPointerSelection.Name = WebXRFeatureName.POINTER_SELECTION;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRControllerPointerSelection.Version = 1;
    return WebXRControllerPointerSelection;
}(WebXRAbstractFeature));
export { WebXRControllerPointerSelection };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRControllerPointerSelection.Name, function (xrSessionManager, options) {
    return function () { return new WebXRControllerPointerSelection(xrSessionManager, options); };
}, WebXRControllerPointerSelection.Version, true);
//# sourceMappingURL=WebXRControllerPointerSelection.js.map