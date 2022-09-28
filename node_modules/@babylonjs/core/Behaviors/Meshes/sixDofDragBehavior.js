import { __extends } from "tslib";
import { Vector3, Quaternion, Matrix, TmpVectors } from "../../Maths/math.vector.js";
import { Observable } from "../../Misc/observable.js";
import { BaseSixDofDragBehavior } from "./baseSixDofDragBehavior.js";
import { TransformNode } from "../../Meshes/transformNode.js";
import { Space } from "../../Maths/math.axis.js";
/**
 * A behavior that when attached to a mesh will allow the mesh to be dragged around based on directions and origin of the pointer's ray
 */
var SixDofDragBehavior = /** @class */ (function (_super) {
    __extends(SixDofDragBehavior, _super);
    function SixDofDragBehavior() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._sceneRenderObserver = null;
        _this._targetPosition = new Vector3(0, 0, 0);
        _this._targetOrientation = new Quaternion();
        _this._targetScaling = new Vector3(1, 1, 1);
        _this._startingPosition = new Vector3(0, 0, 0);
        _this._startingOrientation = new Quaternion();
        _this._startingScaling = new Vector3(1, 1, 1);
        /**
         * Fires when position is updated
         */
        _this.onPositionChangedObservable = new Observable();
        /**
         * The distance towards the target drag position to move each frame. This can be useful to avoid jitter. Set this to 1 for no delay. (Default: 0.2)
         */
        _this.dragDeltaRatio = 0.2;
        /**
         * If the object should rotate to face the drag origin
         */
        _this.rotateDraggedObject = true;
        /**
         * If `rotateDraggedObject` is set to `true`, this parameter determines if we are only rotating around the y axis (yaw)
         */
        _this.rotateAroundYOnly = false;
        /**
         * Should the behavior rotate 1:1 with the motion controller, when one is used.
         */
        _this.rotateWithMotionController = true;
        /**
         * Use this flag to update the target but not move the owner node towards the target
         */
        _this.disableMovement = false;
        /**
         * Should the object rotate towards the camera when we start dragging it
         */
        _this.faceCameraOnDragStart = false;
        return _this;
    }
    Object.defineProperty(SixDofDragBehavior.prototype, "name", {
        /**
         *  The name of the behavior
         */
        get: function () {
            return "SixDofDrag";
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Attaches the six DoF drag behavior
     * @param ownerNode The mesh that will be dragged around once attached
     */
    SixDofDragBehavior.prototype.attach = function (ownerNode) {
        var _this = this;
        _super.prototype.attach.call(this, ownerNode);
        ownerNode.isNearGrabbable = true;
        // Node that will save the owner's transform
        this._virtualTransformNode = new TransformNode("virtual_sixDof", BaseSixDofDragBehavior._virtualScene);
        this._virtualTransformNode.rotationQuaternion = Quaternion.Identity();
        // On every frame move towards target scaling to avoid jitter caused by vr controllers
        this._sceneRenderObserver = ownerNode.getScene().onBeforeRenderObservable.add(function () {
            if (_this.currentDraggingPointerIds.length === 1 && _this._moving && !_this.disableMovement) {
                // 1 pointer only drags mesh
                var oldParent = ownerNode.parent;
                ownerNode.setParent(null);
                ownerNode.position.addInPlace(_this._targetPosition.subtract(ownerNode.position).scale(_this.dragDeltaRatio));
                _this.onPositionChangedObservable.notifyObservers({ position: ownerNode.absolutePosition });
                // Only rotate the mesh if it's parent has uniform scaling
                if (!oldParent || (oldParent.scaling && !oldParent.scaling.isNonUniformWithinEpsilon(0.001))) {
                    Quaternion.SlerpToRef(ownerNode.rotationQuaternion, _this._targetOrientation, _this.dragDeltaRatio, ownerNode.rotationQuaternion);
                }
                ownerNode.setParent(oldParent);
            }
        });
    };
    SixDofDragBehavior.prototype._getPositionOffsetAround = function (transformationLocalOrigin, scaling, rotation) {
        var translationMatrix = TmpVectors.Matrix[0]; // T
        var translationMatrixInv = TmpVectors.Matrix[1]; // T'
        var rotationMatrix = TmpVectors.Matrix[2]; // R
        var scaleMatrix = TmpVectors.Matrix[3]; // S
        var finalMatrix = TmpVectors.Matrix[4]; // T' x R x S x T
        Matrix.TranslationToRef(transformationLocalOrigin.x, transformationLocalOrigin.y, transformationLocalOrigin.z, translationMatrix); // T
        Matrix.TranslationToRef(-transformationLocalOrigin.x, -transformationLocalOrigin.y, -transformationLocalOrigin.z, translationMatrixInv); // T'
        Matrix.FromQuaternionToRef(rotation, rotationMatrix); // R
        Matrix.ScalingToRef(scaling, scaling, scaling, scaleMatrix);
        translationMatrixInv.multiplyToRef(rotationMatrix, finalMatrix); // T' x R
        finalMatrix.multiplyToRef(scaleMatrix, finalMatrix); // T' x R x S
        finalMatrix.multiplyToRef(translationMatrix, finalMatrix); // T' x R x S x T
        return finalMatrix.getTranslation();
    };
    SixDofDragBehavior.prototype._onePointerPositionUpdated = function (worldDeltaPosition, worldDeltaRotation) {
        var pointerDelta = TmpVectors.Vector3[0];
        pointerDelta.setAll(0);
        if (this._dragging === this._dragType.DRAG) {
            if (this.rotateDraggedObject) {
                if (this.rotateAroundYOnly) {
                    // Convert change in rotation to only y axis rotation
                    Quaternion.RotationYawPitchRollToRef(worldDeltaRotation.toEulerAngles().y, 0, 0, TmpVectors.Quaternion[0]);
                }
                else {
                    TmpVectors.Quaternion[0].copyFrom(worldDeltaRotation);
                }
                TmpVectors.Quaternion[0].multiplyToRef(this._startingOrientation, this._targetOrientation);
            }
        }
        else if (this._dragging === this._dragType.NEAR_DRAG || (this._dragging === this._dragType.DRAG_WITH_CONTROLLER && this.rotateWithMotionController)) {
            worldDeltaRotation.multiplyToRef(this._startingOrientation, this._targetOrientation);
        }
        this._targetPosition.copyFrom(this._startingPosition).addInPlace(worldDeltaPosition);
    };
    SixDofDragBehavior.prototype._twoPointersPositionUpdated = function () {
        var startingPosition0 = this._virtualMeshesInfo[this.currentDraggingPointerIds[0]].startingPosition;
        var startingPosition1 = this._virtualMeshesInfo[this.currentDraggingPointerIds[1]].startingPosition;
        var startingCenter = TmpVectors.Vector3[0];
        startingPosition0.addToRef(startingPosition1, startingCenter);
        startingCenter.scaleInPlace(0.5);
        var startingVector = TmpVectors.Vector3[1];
        startingPosition1.subtractToRef(startingPosition0, startingVector);
        var currentPosition0 = this._virtualMeshesInfo[this.currentDraggingPointerIds[0]].dragMesh.absolutePosition;
        var currentPosition1 = this._virtualMeshesInfo[this.currentDraggingPointerIds[1]].dragMesh.absolutePosition;
        var currentCenter = TmpVectors.Vector3[2];
        currentPosition0.addToRef(currentPosition1, currentCenter);
        currentCenter.scaleInPlace(0.5);
        var currentVector = TmpVectors.Vector3[3];
        currentPosition1.subtractToRef(currentPosition0, currentVector);
        var scaling = currentVector.length() / startingVector.length();
        var translation = currentCenter.subtract(startingCenter);
        var rotationQuaternion = Quaternion.FromEulerAngles(0, Vector3.GetAngleBetweenVectorsOnPlane(startingVector.normalize(), currentVector.normalize(), Vector3.UpReadOnly), 0);
        var oldParent = this._ownerNode.parent;
        this._ownerNode.setParent(null);
        var positionOffset = this._getPositionOffsetAround(startingCenter.subtract(this._virtualTransformNode.getAbsolutePivotPoint()), scaling, rotationQuaternion);
        this._virtualTransformNode.rotationQuaternion.multiplyToRef(rotationQuaternion, this._ownerNode.rotationQuaternion);
        this._virtualTransformNode.scaling.scaleToRef(scaling, this._ownerNode.scaling);
        this._virtualTransformNode.position.addToRef(translation.addInPlace(positionOffset), this._ownerNode.position);
        this.onPositionChangedObservable.notifyObservers({ position: this._ownerNode.position });
        this._ownerNode.setParent(oldParent);
    };
    SixDofDragBehavior.prototype._targetDragStart = function () {
        var pointerCount = this.currentDraggingPointerIds.length;
        var oldParent = this._ownerNode.parent;
        if (!this._ownerNode.rotationQuaternion) {
            this._ownerNode.rotationQuaternion = Quaternion.RotationYawPitchRoll(this._ownerNode.rotation.y, this._ownerNode.rotation.x, this._ownerNode.rotation.z);
        }
        var worldPivot = this._ownerNode.getAbsolutePivotPoint();
        this._ownerNode.setParent(null);
        if (pointerCount === 1) {
            this._targetPosition.copyFrom(this._ownerNode.position);
            this._targetOrientation.copyFrom(this._ownerNode.rotationQuaternion);
            this._targetScaling.copyFrom(this._ownerNode.scaling);
            if (this.faceCameraOnDragStart && this._scene.activeCamera) {
                var toCamera = TmpVectors.Vector3[0];
                this._scene.activeCamera.position.subtractToRef(worldPivot, toCamera);
                toCamera.normalize();
                var quat = TmpVectors.Quaternion[0];
                if (this._scene.useRightHandedSystem) {
                    Quaternion.FromLookDirectionRHToRef(toCamera, new Vector3(0, 1, 0), quat);
                }
                else {
                    Quaternion.FromLookDirectionLHToRef(toCamera, new Vector3(0, 1, 0), quat);
                }
                quat.normalize();
                Quaternion.RotationYawPitchRollToRef(quat.toEulerAngles().y, 0, 0, TmpVectors.Quaternion[0]);
                this._targetOrientation.copyFrom(TmpVectors.Quaternion[0]);
            }
            this._startingPosition.copyFrom(this._targetPosition);
            this._startingOrientation.copyFrom(this._targetOrientation);
            this._startingScaling.copyFrom(this._targetScaling);
        }
        else if (pointerCount === 2) {
            this._virtualTransformNode.setPivotPoint(new Vector3(0, 0, 0), Space.LOCAL);
            this._virtualTransformNode.position.copyFrom(this._ownerNode.position);
            this._virtualTransformNode.scaling.copyFrom(this._ownerNode.scaling);
            this._virtualTransformNode.rotationQuaternion.copyFrom(this._ownerNode.rotationQuaternion);
            this._virtualTransformNode.setPivotPoint(worldPivot, Space.WORLD);
            this._resetVirtualMeshesPosition();
        }
        this._ownerNode.setParent(oldParent);
    };
    SixDofDragBehavior.prototype._targetDrag = function (worldDeltaPosition, worldDeltaRotation) {
        if (this.currentDraggingPointerIds.length === 1) {
            this._onePointerPositionUpdated(worldDeltaPosition, worldDeltaRotation);
        }
        else if (this.currentDraggingPointerIds.length === 2) {
            this._twoPointersPositionUpdated();
        }
    };
    SixDofDragBehavior.prototype._targetDragEnd = function () {
        if (this.currentDraggingPointerIds.length === 1) {
            // We still have 1 active pointer, we must simulate a dragstart with a reseted position/orientation
            this._resetVirtualMeshesPosition();
            var previousFaceCameraFlag = this.faceCameraOnDragStart;
            this.faceCameraOnDragStart = false;
            this._targetDragStart();
            this.faceCameraOnDragStart = previousFaceCameraFlag;
        }
    };
    /**
     *  Detaches the behavior from the mesh
     */
    SixDofDragBehavior.prototype.detach = function () {
        _super.prototype.detach.call(this);
        if (this._ownerNode) {
            this._ownerNode.isNearGrabbable = false;
            this._ownerNode.getScene().onBeforeRenderObservable.remove(this._sceneRenderObserver);
        }
        if (this._virtualTransformNode) {
            this._virtualTransformNode.dispose();
        }
    };
    return SixDofDragBehavior;
}(BaseSixDofDragBehavior));
export { SixDofDragBehavior };
//# sourceMappingURL=sixDofDragBehavior.js.map