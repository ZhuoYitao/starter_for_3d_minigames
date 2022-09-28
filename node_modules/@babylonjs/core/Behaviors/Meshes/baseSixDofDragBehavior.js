import { AbstractMesh } from "../../Meshes/abstractMesh.js";
import { Scene } from "../../scene.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Vector3, Quaternion, TmpVectors } from "../../Maths/math.vector.js";
import { Observable } from "../../Misc/observable.js";
import { Camera } from "../../Cameras/camera.js";
/**
 * Base behavior for six degrees of freedom interactions in XR experiences.
 * Creates virtual meshes that are dragged around
 * And observables for position/rotation changes
 */
var BaseSixDofDragBehavior = /** @class */ (function () {
    function BaseSixDofDragBehavior() {
        this._attachedToElement = false;
        this._virtualMeshesInfo = {};
        this._tmpVector = new Vector3();
        this._tmpQuaternion = new Quaternion();
        this._dragType = {
            NONE: 0,
            DRAG: 1,
            DRAG_WITH_CONTROLLER: 2,
            NEAR_DRAG: 3,
        };
        this._moving = false;
        this._dragging = this._dragType.NONE;
        /**
         * The list of child meshes that can receive drag events
         * If `null`, all child meshes will receive drag event
         */
        this.draggableMeshes = null;
        /**
         * How much faster the object should move when the controller is moving towards it. This is useful to bring objects that are far away from the user to them faster. Set this to 0 to avoid any speed increase. (Default: 3)
         */
        this.zDragFactor = 3;
        /**
         * In case of multipointer interaction, all pointer ids currently active are stored here
         */
        this.currentDraggingPointerIds = [];
        /**
        /**
         * If camera controls should be detached during the drag
         */
        this.detachCameraControls = true;
        /**
         * Fires each time a drag starts
         */
        this.onDragStartObservable = new Observable();
        /**
         * Fires each time a drag happens
         */
        this.onDragObservable = new Observable();
        /**
         *  Fires each time a drag ends (eg. mouse release after drag)
         */
        this.onDragEndObservable = new Observable();
        /**
         * Should the behavior allow simultaneous pointers to interact with the owner node.
         */
        this.allowMultiPointer = true;
    }
    Object.defineProperty(BaseSixDofDragBehavior.prototype, "currentDraggingPointerId", {
        /**
         * The id of the pointer that is currently interacting with the behavior (-1 when no pointer is active)
         */
        get: function () {
            if (this.currentDraggingPointerIds[0] !== undefined) {
                return this.currentDraggingPointerIds[0];
            }
            return -1;
        },
        set: function (value) {
            this.currentDraggingPointerIds[0] = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseSixDofDragBehavior.prototype, "currentDraggingPointerID", {
        /**
         * Get or set the currentDraggingPointerId
         * @deprecated Please use currentDraggingPointerId instead
         */
        get: function () {
            return this.currentDraggingPointerId;
        },
        set: function (currentDraggingPointerID) {
            this.currentDraggingPointerId = currentDraggingPointerID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseSixDofDragBehavior.prototype, "name", {
        /**
         *  The name of the behavior
         */
        get: function () {
            return "BaseSixDofDrag";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseSixDofDragBehavior.prototype, "isMoving", {
        /**
         *  Returns true if the attached mesh is currently moving with this behavior
         */
        get: function () {
            return this._moving;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *  Initializes the behavior
     */
    BaseSixDofDragBehavior.prototype.init = function () { };
    Object.defineProperty(BaseSixDofDragBehavior.prototype, "_pointerCamera", {
        /**
         * In the case of multiple active cameras, the cameraToUseForPointers should be used if set instead of active camera
         */
        get: function () {
            if (this._scene.cameraToUseForPointers) {
                return this._scene.cameraToUseForPointers;
            }
            else {
                return this._scene.activeCamera;
            }
        },
        enumerable: false,
        configurable: true
    });
    BaseSixDofDragBehavior.prototype._createVirtualMeshInfo = function () {
        // Setup virtual meshes to be used for dragging without dirtying the existing scene
        var dragMesh = new AbstractMesh("", BaseSixDofDragBehavior._virtualScene);
        dragMesh.rotationQuaternion = new Quaternion();
        var originMesh = new AbstractMesh("", BaseSixDofDragBehavior._virtualScene);
        originMesh.rotationQuaternion = new Quaternion();
        var pivotMesh = new AbstractMesh("", BaseSixDofDragBehavior._virtualScene);
        pivotMesh.rotationQuaternion = new Quaternion();
        return {
            dragging: false,
            moving: false,
            dragMesh: dragMesh,
            originMesh: originMesh,
            pivotMesh: pivotMesh,
            startingPivotPosition: new Vector3(),
            startingPivotOrientation: new Quaternion(),
            startingPosition: new Vector3(),
            startingOrientation: new Quaternion(),
            lastOriginPosition: new Vector3(),
            lastDragPosition: new Vector3(),
        };
    };
    BaseSixDofDragBehavior.prototype._resetVirtualMeshesPosition = function () {
        for (var i = 0; i < this.currentDraggingPointerIds.length; i++) {
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].pivotMesh.position.copyFrom(this._ownerNode.getAbsolutePivotPoint());
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].pivotMesh.rotationQuaternion.copyFrom(this._ownerNode.rotationQuaternion);
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].startingPivotPosition.copyFrom(this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].pivotMesh.position);
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].startingPivotOrientation.copyFrom(this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].pivotMesh.rotationQuaternion);
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].startingPosition.copyFrom(this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].dragMesh.position);
            this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].startingOrientation.copyFrom(this._virtualMeshesInfo[this.currentDraggingPointerIds[i]].dragMesh.rotationQuaternion);
        }
    };
    BaseSixDofDragBehavior.prototype._pointerUpdate2D = function (ray, pointerId, zDragFactor) {
        if (this._pointerCamera && this._pointerCamera.cameraRigMode == Camera.RIG_MODE_NONE && !this._pointerCamera._isLeftCamera && !this._pointerCamera._isRightCamera) {
            ray.origin.copyFrom(this._pointerCamera.globalPosition);
            zDragFactor = 0;
        }
        var virtualMeshesInfo = this._virtualMeshesInfo[pointerId];
        // Calculate controller drag distance in controller space
        var originDragDifference = TmpVectors.Vector3[0];
        ray.origin.subtractToRef(virtualMeshesInfo.lastOriginPosition, originDragDifference);
        virtualMeshesInfo.lastOriginPosition.copyFrom(ray.origin);
        var localOriginDragDifference = -Vector3.Dot(originDragDifference, ray.direction);
        virtualMeshesInfo.originMesh.addChild(virtualMeshesInfo.dragMesh);
        virtualMeshesInfo.originMesh.addChild(virtualMeshesInfo.pivotMesh);
        this._applyZOffset(virtualMeshesInfo.dragMesh, localOriginDragDifference, zDragFactor);
        this._applyZOffset(virtualMeshesInfo.pivotMesh, localOriginDragDifference, zDragFactor);
        // Update the controller position
        virtualMeshesInfo.originMesh.position.copyFrom(ray.origin);
        var lookAt = TmpVectors.Vector3[0];
        ray.origin.addToRef(ray.direction, lookAt);
        virtualMeshesInfo.originMesh.lookAt(lookAt);
        virtualMeshesInfo.originMesh.removeChild(virtualMeshesInfo.dragMesh);
        virtualMeshesInfo.originMesh.removeChild(virtualMeshesInfo.pivotMesh);
    };
    BaseSixDofDragBehavior.prototype._pointerUpdateXR = function (controllerAimTransform, controllerGripTransform, pointerId, zDragFactor) {
        var virtualMeshesInfo = this._virtualMeshesInfo[pointerId];
        virtualMeshesInfo.originMesh.position.copyFrom(controllerAimTransform.position);
        if (this._dragging === this._dragType.NEAR_DRAG && controllerGripTransform) {
            virtualMeshesInfo.originMesh.rotationQuaternion.copyFrom(controllerGripTransform.rotationQuaternion);
        }
        else {
            virtualMeshesInfo.originMesh.rotationQuaternion.copyFrom(controllerAimTransform.rotationQuaternion);
        }
        virtualMeshesInfo.pivotMesh.computeWorldMatrix(true);
        virtualMeshesInfo.dragMesh.computeWorldMatrix(true);
        // Z scaling logic
        if (zDragFactor !== 0) {
            // Camera.getForwardRay modifies TmpVectors.Vector[0-3], so cache it in advance
            var cameraForwardVec = TmpVectors.Vector3[0];
            var originDragDirection = TmpVectors.Vector3[1];
            cameraForwardVec.copyFrom(this._pointerCamera.getForwardRay().direction);
            virtualMeshesInfo.originMesh.position.subtractToRef(virtualMeshesInfo.lastOriginPosition, originDragDirection);
            virtualMeshesInfo.lastOriginPosition.copyFrom(virtualMeshesInfo.originMesh.position);
            var controllerDragDistance = originDragDirection.length();
            originDragDirection.normalize();
            var cameraToDrag = TmpVectors.Vector3[2];
            var controllerToDrag = TmpVectors.Vector3[3];
            virtualMeshesInfo.dragMesh.absolutePosition.subtractToRef(this._pointerCamera.globalPosition, cameraToDrag);
            virtualMeshesInfo.dragMesh.absolutePosition.subtractToRef(virtualMeshesInfo.originMesh.position, controllerToDrag);
            var controllerToDragDistance = controllerToDrag.length();
            cameraToDrag.normalize();
            controllerToDrag.normalize();
            var controllerDragScaling = Math.abs(Vector3.Dot(originDragDirection, controllerToDrag)) * Vector3.Dot(originDragDirection, cameraForwardVec);
            var zOffsetScaling = controllerDragScaling * zDragFactor * controllerDragDistance * controllerToDragDistance;
            // Prevent pulling the mesh through the controller
            var minDistanceFromControllerToDragMesh = 0.01;
            if (zOffsetScaling < 0 && minDistanceFromControllerToDragMesh - controllerToDragDistance > zOffsetScaling) {
                zOffsetScaling = Math.min(minDistanceFromControllerToDragMesh - controllerToDragDistance, 0);
            }
            controllerToDrag.scaleInPlace(zOffsetScaling);
            controllerToDrag.addToRef(virtualMeshesInfo.pivotMesh.absolutePosition, this._tmpVector);
            virtualMeshesInfo.pivotMesh.setAbsolutePosition(this._tmpVector);
            controllerToDrag.addToRef(virtualMeshesInfo.dragMesh.absolutePosition, this._tmpVector);
            virtualMeshesInfo.dragMesh.setAbsolutePosition(this._tmpVector);
        }
    };
    /**
     * Attaches the scale behavior the passed in mesh
     * @param ownerNode The mesh that will be scaled around once attached
     */
    BaseSixDofDragBehavior.prototype.attach = function (ownerNode) {
        var _this = this;
        this._ownerNode = ownerNode;
        this._scene = this._ownerNode.getScene();
        if (!BaseSixDofDragBehavior._virtualScene) {
            BaseSixDofDragBehavior._virtualScene = new Scene(this._scene.getEngine(), { virtual: true });
            BaseSixDofDragBehavior._virtualScene.detachControl();
        }
        var pickPredicate = function (m) {
            return _this._ownerNode === m || (m.isDescendantOf(_this._ownerNode) && (!_this.draggableMeshes || _this.draggableMeshes.indexOf(m) !== -1));
        };
        this._pointerObserver = this._scene.onPointerObservable.add(function (pointerInfo) {
            var pointerId = pointerInfo.event.pointerId;
            if (!_this._virtualMeshesInfo[pointerId]) {
                _this._virtualMeshesInfo[pointerId] = _this._createVirtualMeshInfo();
            }
            var virtualMeshesInfo = _this._virtualMeshesInfo[pointerId];
            var isXRPointer = pointerInfo.event.pointerType === "xr";
            if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
                if (!virtualMeshesInfo.dragging &&
                    pointerInfo.pickInfo &&
                    pointerInfo.pickInfo.hit &&
                    pointerInfo.pickInfo.pickedMesh &&
                    pointerInfo.pickInfo.pickedPoint &&
                    pointerInfo.pickInfo.ray &&
                    (!isXRPointer || pointerInfo.pickInfo.aimTransform) &&
                    pickPredicate(pointerInfo.pickInfo.pickedMesh)) {
                    if (!_this.allowMultiPointer && _this.currentDraggingPointerIds.length > 0) {
                        return;
                    }
                    if (_this._pointerCamera &&
                        _this._pointerCamera.cameraRigMode === Camera.RIG_MODE_NONE &&
                        !_this._pointerCamera._isLeftCamera &&
                        !_this._pointerCamera._isRightCamera) {
                        pointerInfo.pickInfo.ray.origin.copyFrom(_this._pointerCamera.globalPosition);
                    }
                    _this._ownerNode.computeWorldMatrix(true);
                    var virtualMeshesInfo_1 = _this._virtualMeshesInfo[pointerId];
                    if (isXRPointer) {
                        _this._dragging = pointerInfo.pickInfo.originMesh ? _this._dragType.NEAR_DRAG : _this._dragType.DRAG_WITH_CONTROLLER;
                        virtualMeshesInfo_1.originMesh.position.copyFrom(pointerInfo.pickInfo.aimTransform.position);
                        if (_this._dragging === _this._dragType.NEAR_DRAG && pointerInfo.pickInfo.gripTransform) {
                            virtualMeshesInfo_1.originMesh.rotationQuaternion.copyFrom(pointerInfo.pickInfo.gripTransform.rotationQuaternion);
                        }
                        else {
                            virtualMeshesInfo_1.originMesh.rotationQuaternion.copyFrom(pointerInfo.pickInfo.aimTransform.rotationQuaternion);
                        }
                    }
                    else {
                        _this._dragging = _this._dragType.DRAG;
                        virtualMeshesInfo_1.originMesh.position.copyFrom(pointerInfo.pickInfo.ray.origin);
                    }
                    virtualMeshesInfo_1.lastOriginPosition.copyFrom(virtualMeshesInfo_1.originMesh.position);
                    virtualMeshesInfo_1.dragMesh.position.copyFrom(pointerInfo.pickInfo.pickedPoint);
                    virtualMeshesInfo_1.lastDragPosition.copyFrom(pointerInfo.pickInfo.pickedPoint);
                    virtualMeshesInfo_1.pivotMesh.position.copyFrom(_this._ownerNode.getAbsolutePivotPoint());
                    virtualMeshesInfo_1.pivotMesh.rotationQuaternion.copyFrom(_this._ownerNode.absoluteRotationQuaternion);
                    virtualMeshesInfo_1.startingPosition.copyFrom(virtualMeshesInfo_1.dragMesh.position);
                    virtualMeshesInfo_1.startingPivotPosition.copyFrom(virtualMeshesInfo_1.pivotMesh.position);
                    virtualMeshesInfo_1.startingOrientation.copyFrom(virtualMeshesInfo_1.dragMesh.rotationQuaternion);
                    virtualMeshesInfo_1.startingPivotOrientation.copyFrom(virtualMeshesInfo_1.pivotMesh.rotationQuaternion);
                    if (isXRPointer) {
                        virtualMeshesInfo_1.originMesh.addChild(virtualMeshesInfo_1.dragMesh);
                        virtualMeshesInfo_1.originMesh.addChild(virtualMeshesInfo_1.pivotMesh);
                    }
                    else {
                        virtualMeshesInfo_1.originMesh.lookAt(virtualMeshesInfo_1.dragMesh.position);
                    }
                    // Update state
                    virtualMeshesInfo_1.dragging = true;
                    if (_this.currentDraggingPointerIds.indexOf(pointerId) === -1) {
                        _this.currentDraggingPointerIds.push(pointerId);
                    }
                    // Detach camera controls
                    if (_this.detachCameraControls && _this._pointerCamera && !_this._pointerCamera.leftCamera) {
                        if (_this._pointerCamera.inputs && _this._pointerCamera.inputs.attachedToElement) {
                            _this._pointerCamera.detachControl();
                            _this._attachedToElement = true;
                        }
                        else {
                            _this._attachedToElement = false;
                        }
                    }
                    _this._targetDragStart(virtualMeshesInfo_1.pivotMesh.position, virtualMeshesInfo_1.pivotMesh.rotationQuaternion, pointerId);
                    _this.onDragStartObservable.notifyObservers({ position: virtualMeshesInfo_1.pivotMesh.position });
                }
            }
            else if (pointerInfo.type == PointerEventTypes.POINTERUP || pointerInfo.type == PointerEventTypes.POINTERDOUBLETAP) {
                var registeredPointerIndex = _this.currentDraggingPointerIds.indexOf(pointerId);
                // Update state
                virtualMeshesInfo.dragging = false;
                if (registeredPointerIndex !== -1) {
                    _this.currentDraggingPointerIds.splice(registeredPointerIndex, 1);
                    if (_this.currentDraggingPointerIds.length === 0) {
                        _this._moving = false;
                        _this._dragging = _this._dragType.NONE;
                        // Reattach camera controls
                        if (_this.detachCameraControls && _this._attachedToElement && _this._pointerCamera && !_this._pointerCamera.leftCamera) {
                            _this._pointerCamera.attachControl(true);
                            _this._attachedToElement = false;
                        }
                    }
                    virtualMeshesInfo.originMesh.removeChild(virtualMeshesInfo.dragMesh);
                    virtualMeshesInfo.originMesh.removeChild(virtualMeshesInfo.pivotMesh);
                    _this._targetDragEnd(pointerId);
                    _this.onDragEndObservable.notifyObservers({});
                }
            }
            else if (pointerInfo.type == PointerEventTypes.POINTERMOVE) {
                var registeredPointerIndex = _this.currentDraggingPointerIds.indexOf(pointerId);
                if (registeredPointerIndex !== -1 && virtualMeshesInfo.dragging && pointerInfo.pickInfo && (pointerInfo.pickInfo.ray || pointerInfo.pickInfo.aimTransform)) {
                    var zDragFactor = _this.zDragFactor;
                    // 2 pointer interaction should not have a z axis drag factor
                    // as well as near interaction
                    if (_this.currentDraggingPointerIds.length > 1 || pointerInfo.pickInfo.originMesh) {
                        zDragFactor = 0;
                    }
                    _this._ownerNode.computeWorldMatrix(true);
                    if (!isXRPointer) {
                        _this._pointerUpdate2D(pointerInfo.pickInfo.ray, pointerId, zDragFactor);
                    }
                    else {
                        _this._pointerUpdateXR(pointerInfo.pickInfo.aimTransform, pointerInfo.pickInfo.gripTransform, pointerId, zDragFactor);
                    }
                    // Get change in rotation
                    _this._tmpQuaternion.copyFrom(virtualMeshesInfo.startingPivotOrientation);
                    _this._tmpQuaternion.x = -_this._tmpQuaternion.x;
                    _this._tmpQuaternion.y = -_this._tmpQuaternion.y;
                    _this._tmpQuaternion.z = -_this._tmpQuaternion.z;
                    virtualMeshesInfo.pivotMesh.absoluteRotationQuaternion.multiplyToRef(_this._tmpQuaternion, _this._tmpQuaternion);
                    virtualMeshesInfo.pivotMesh.absolutePosition.subtractToRef(virtualMeshesInfo.startingPivotPosition, _this._tmpVector);
                    _this.onDragObservable.notifyObservers({ delta: _this._tmpVector, position: virtualMeshesInfo.pivotMesh.position, pickInfo: pointerInfo.pickInfo });
                    // Notify herited methods and observables
                    _this._targetDrag(_this._tmpVector, _this._tmpQuaternion, pointerId);
                    virtualMeshesInfo.lastDragPosition.copyFrom(virtualMeshesInfo.dragMesh.absolutePosition);
                    _this._moving = true;
                }
            }
        });
    };
    BaseSixDofDragBehavior.prototype._applyZOffset = function (node, localOriginDragDifference, zDragFactor) {
        // Determine how much the controller moved to/away towards the dragged object and use this to move the object further when its further away
        node.position.z -= node.position.z < 1 ? localOriginDragDifference * zDragFactor : localOriginDragDifference * zDragFactor * node.position.z;
        if (node.position.z < 0) {
            node.position.z = 0;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseSixDofDragBehavior.prototype._targetDragStart = function (worldPosition, worldRotation, pointerId) {
        // Herited classes can override that
    };
    BaseSixDofDragBehavior.prototype._targetDrag = function (worldDeltaPosition, worldDeltaRotation, pointerId) {
        // Herited classes can override that
    };
    BaseSixDofDragBehavior.prototype._targetDragEnd = function (pointerId) {
        // Herited classes can override that
    };
    /**
     * Detaches the behavior from the mesh
     */
    BaseSixDofDragBehavior.prototype.detach = function () {
        if (this._scene) {
            if (this.detachCameraControls && this._attachedToElement && this._pointerCamera && !this._pointerCamera.leftCamera) {
                this._pointerCamera.attachControl(true);
                this._attachedToElement = false;
            }
            this._scene.onPointerObservable.remove(this._pointerObserver);
        }
        for (var pointerId in this._virtualMeshesInfo) {
            this._virtualMeshesInfo[pointerId].originMesh.dispose();
            this._virtualMeshesInfo[pointerId].dragMesh.dispose();
        }
        this.onDragEndObservable.clear();
        this.onDragObservable.clear();
        this.onDragStartObservable.clear();
    };
    return BaseSixDofDragBehavior;
}());
export { BaseSixDofDragBehavior };
//# sourceMappingURL=baseSixDofDragBehavior.js.map