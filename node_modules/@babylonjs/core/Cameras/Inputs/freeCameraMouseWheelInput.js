import { __decorate, __extends } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { BaseCameraMouseWheelInput } from "../../Cameras/Inputs/BaseCameraMouseWheelInput.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { Coordinate } from "../../Maths/math.axis.js";
// eslint-disable-next-line @typescript-eslint/naming-convention
var _CameraProperty;
(function (_CameraProperty) {
    _CameraProperty[_CameraProperty["MoveRelative"] = 0] = "MoveRelative";
    _CameraProperty[_CameraProperty["RotateRelative"] = 1] = "RotateRelative";
    _CameraProperty[_CameraProperty["MoveScene"] = 2] = "MoveScene";
})(_CameraProperty || (_CameraProperty = {}));
/**
 * Manage the mouse wheel inputs to control a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraMouseWheelInput = /** @class */ (function (_super) {
    __extends(FreeCameraMouseWheelInput, _super);
    function FreeCameraMouseWheelInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._moveRelative = Vector3.Zero();
        _this._rotateRelative = Vector3.Zero();
        _this._moveScene = Vector3.Zero();
        /**
         * These are set to the desired default behaviour.
         */
        _this._wheelXAction = _CameraProperty.MoveRelative;
        _this._wheelXActionCoordinate = Coordinate.X;
        _this._wheelYAction = _CameraProperty.MoveRelative;
        _this._wheelYActionCoordinate = Coordinate.Z;
        _this._wheelZAction = null;
        _this._wheelZActionCoordinate = null;
        return _this;
    }
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    FreeCameraMouseWheelInput.prototype.getClassName = function () {
        return "FreeCameraMouseWheelInput";
    };
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelXMoveRelative", {
        /**
         * Get the configured movement axis (relative to camera's orientation) the
         * mouse wheel's X axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelXAction !== _CameraProperty.MoveRelative) {
                return null;
            }
            return this._wheelXActionCoordinate;
        },
        /**
         * Set which movement axis (relative to camera's orientation) the mouse
         * wheel's X axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelXAction !== _CameraProperty.MoveRelative) {
                // Attempting to clear different _wheelXAction.
                return;
            }
            this._wheelXAction = _CameraProperty.MoveRelative;
            this._wheelXActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelYMoveRelative", {
        /**
         * Get the configured movement axis (relative to camera's orientation) the
         * mouse wheel's Y axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelYAction !== _CameraProperty.MoveRelative) {
                return null;
            }
            return this._wheelYActionCoordinate;
        },
        /**
         * Set which movement axis (relative to camera's orientation) the mouse
         * wheel's Y axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelYAction !== _CameraProperty.MoveRelative) {
                // Attempting to clear different _wheelYAction.
                return;
            }
            this._wheelYAction = _CameraProperty.MoveRelative;
            this._wheelYActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelZMoveRelative", {
        /**
         * Get the configured movement axis (relative to camera's orientation) the
         * mouse wheel's Z axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelZAction !== _CameraProperty.MoveRelative) {
                return null;
            }
            return this._wheelZActionCoordinate;
        },
        /**
         * Set which movement axis (relative to camera's orientation) the mouse
         * wheel's Z axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelZAction !== _CameraProperty.MoveRelative) {
                // Attempting to clear different _wheelZAction.
                return;
            }
            this._wheelZAction = _CameraProperty.MoveRelative;
            this._wheelZActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelXRotateRelative", {
        /**
         * Get the configured rotation axis (relative to camera's orientation) the
         * mouse wheel's X axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelXAction !== _CameraProperty.RotateRelative) {
                return null;
            }
            return this._wheelXActionCoordinate;
        },
        /**
         * Set which rotation axis (relative to camera's orientation) the mouse
         * wheel's X axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelXAction !== _CameraProperty.RotateRelative) {
                // Attempting to clear different _wheelXAction.
                return;
            }
            this._wheelXAction = _CameraProperty.RotateRelative;
            this._wheelXActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelYRotateRelative", {
        /**
         * Get the configured rotation axis (relative to camera's orientation) the
         * mouse wheel's Y axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelYAction !== _CameraProperty.RotateRelative) {
                return null;
            }
            return this._wheelYActionCoordinate;
        },
        /**
         * Set which rotation axis (relative to camera's orientation) the mouse
         * wheel's Y axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelYAction !== _CameraProperty.RotateRelative) {
                // Attempting to clear different _wheelYAction.
                return;
            }
            this._wheelYAction = _CameraProperty.RotateRelative;
            this._wheelYActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelZRotateRelative", {
        /**
         * Get the configured rotation axis (relative to camera's orientation) the
         * mouse wheel's Z axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelZAction !== _CameraProperty.RotateRelative) {
                return null;
            }
            return this._wheelZActionCoordinate;
        },
        /**
         * Set which rotation axis (relative to camera's orientation) the mouse
         * wheel's Z axis controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelZAction !== _CameraProperty.RotateRelative) {
                // Attempting to clear different _wheelZAction.
                return;
            }
            this._wheelZAction = _CameraProperty.RotateRelative;
            this._wheelZActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelXMoveScene", {
        /**
         * Get the configured movement axis (relative to the scene) the mouse wheel's
         * X axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelXAction !== _CameraProperty.MoveScene) {
                return null;
            }
            return this._wheelXActionCoordinate;
        },
        /**
         * Set which movement axis (relative to the scene) the mouse wheel's X axis
         * controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelXAction !== _CameraProperty.MoveScene) {
                // Attempting to clear different _wheelXAction.
                return;
            }
            this._wheelXAction = _CameraProperty.MoveScene;
            this._wheelXActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelYMoveScene", {
        /**
         * Get the configured movement axis (relative to the scene) the mouse wheel's
         * Y axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelYAction !== _CameraProperty.MoveScene) {
                return null;
            }
            return this._wheelYActionCoordinate;
        },
        /**
         * Set which movement axis (relative to the scene) the mouse wheel's Y axis
         * controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelYAction !== _CameraProperty.MoveScene) {
                // Attempting to clear different _wheelYAction.
                return;
            }
            this._wheelYAction = _CameraProperty.MoveScene;
            this._wheelYActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FreeCameraMouseWheelInput.prototype, "wheelZMoveScene", {
        /**
         * Get the configured movement axis (relative to the scene) the mouse wheel's
         * Z axis controls.
         * @returns The configured axis or null if none.
         */
        get: function () {
            if (this._wheelZAction !== _CameraProperty.MoveScene) {
                return null;
            }
            return this._wheelZActionCoordinate;
        },
        /**
         * Set which movement axis (relative to the scene) the mouse wheel's Z axis
         * controls.
         * @param axis The axis to be moved. Set null to clear.
         */
        set: function (axis) {
            if (axis === null && this._wheelZAction !== _CameraProperty.MoveScene) {
                // Attempting to clear different _wheelZAction.
                return;
            }
            this._wheelZAction = _CameraProperty.MoveScene;
            this._wheelZActionCoordinate = axis;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Called for each rendered frame.
     */
    FreeCameraMouseWheelInput.prototype.checkInputs = function () {
        if (this._wheelDeltaX === 0 && this._wheelDeltaY === 0 && this._wheelDeltaZ == 0) {
            return;
        }
        // Clear the camera properties that we might be updating.
        this._moveRelative.setAll(0);
        this._rotateRelative.setAll(0);
        this._moveScene.setAll(0);
        // Set the camera properties that are to be updated.
        this._updateCamera();
        if (this.camera.getScene().useRightHandedSystem) {
            // TODO: Does this need done for worldUpdate too?
            this._moveRelative.z *= -1;
        }
        // Convert updates relative to camera to world position update.
        var cameraTransformMatrix = Matrix.Zero();
        this.camera.getViewMatrix().invertToRef(cameraTransformMatrix);
        var transformedDirection = Vector3.Zero();
        Vector3.TransformNormalToRef(this._moveRelative, cameraTransformMatrix, transformedDirection);
        // Apply updates to camera position.
        this.camera.cameraRotation.x += this._rotateRelative.x / 200;
        this.camera.cameraRotation.y += this._rotateRelative.y / 200;
        this.camera.cameraDirection.addInPlace(transformedDirection);
        this.camera.cameraDirection.addInPlace(this._moveScene);
        // Call the base class implementation to handle observers and do cleanup.
        _super.prototype.checkInputs.call(this);
    };
    /**
     * Update the camera according to any configured properties for the 3
     * mouse-wheel axis.
     */
    FreeCameraMouseWheelInput.prototype._updateCamera = function () {
        // Do the camera updates for each of the 3 touch-wheel axis.
        this._updateCameraProperty(this._wheelDeltaX, this._wheelXAction, this._wheelXActionCoordinate);
        this._updateCameraProperty(this._wheelDeltaY, this._wheelYAction, this._wheelYActionCoordinate);
        this._updateCameraProperty(this._wheelDeltaZ, this._wheelZAction, this._wheelZActionCoordinate);
    };
    /**
     * Update one property of the camera.
     * @param value
     * @param cameraProperty
     * @param coordinate
     */
    FreeCameraMouseWheelInput.prototype._updateCameraProperty = function (
    /* Mouse-wheel delta. */
    value, 
    /* Camera property to be changed. */
    cameraProperty, 
    /* Axis of Camera property to be changed. */
    coordinate) {
        if (value === 0) {
            // Mouse wheel has not moved.
            return;
        }
        if (cameraProperty === null || coordinate === null) {
            // Mouse wheel axis not configured.
            return;
        }
        var action = null;
        switch (cameraProperty) {
            case _CameraProperty.MoveRelative:
                action = this._moveRelative;
                break;
            case _CameraProperty.RotateRelative:
                action = this._rotateRelative;
                break;
            case _CameraProperty.MoveScene:
                action = this._moveScene;
                break;
        }
        switch (coordinate) {
            case Coordinate.X:
                action.set(value, 0, 0);
                break;
            case Coordinate.Y:
                action.set(0, value, 0);
                break;
            case Coordinate.Z:
                action.set(0, 0, value);
                break;
        }
    };
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelXMoveRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelYMoveRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelZMoveRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelXRotateRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelYRotateRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelZRotateRelative", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelXMoveScene", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelYMoveScene", null);
    __decorate([
        serialize()
    ], FreeCameraMouseWheelInput.prototype, "wheelZMoveScene", null);
    return FreeCameraMouseWheelInput;
}(BaseCameraMouseWheelInput));
export { FreeCameraMouseWheelInput };
CameraInputTypes["FreeCameraMouseWheelInput"] = FreeCameraMouseWheelInput;
//# sourceMappingURL=freeCameraMouseWheelInput.js.map