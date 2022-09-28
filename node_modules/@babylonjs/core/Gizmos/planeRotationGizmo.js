import { __extends } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Quaternion, Matrix, Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import "../Meshes/Builders/linesBuilder.js";
import { Mesh } from "../Meshes/mesh.js";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { ShaderMaterial } from "../Materials/shaderMaterial.js";
import { Effect } from "../Materials/effect.js";
import { CreatePlane } from "../Meshes/Builders/planeBuilder.js";
import { CreateTorus } from "../Meshes/Builders/torusBuilder.js";
/**
 * Single plane rotation gizmo
 */
var PlaneRotationGizmo = /** @class */ (function (_super) {
    __extends(PlaneRotationGizmo, _super);
    /**
     * Creates a PlaneRotationGizmo
     * @param planeNormal The normal of the plane which the gizmo will be able to rotate on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param tessellation Amount of tessellation to be used when creating rotation circles
     * @param parent
     * @param useEulerRotation Use and update Euler angle instead of quaternion
     * @param thickness display gizmo axis thickness
     */
    function PlaneRotationGizmo(planeNormal, color, gizmoLayer, tessellation, parent, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useEulerRotation, thickness) {
        if (color === void 0) { color = Color3.Gray(); }
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (tessellation === void 0) { tessellation = 32; }
        if (parent === void 0) { parent = null; }
        if (useEulerRotation === void 0) { useEulerRotation = false; }
        if (thickness === void 0) { thickness = 1; }
        var _this = this;
        var _a;
        _this = _super.call(this, gizmoLayer) || this;
        _this._pointerObserver = null;
        /**
         * Rotation distance in radians that the gizmo will snap to (Default: 0)
         */
        _this.snapDistance = 0;
        /**
         * Event that fires each time the gizmo snaps to a new location.
         * * snapDistance is the the change in distance
         */
        _this.onSnapObservable = new Observable();
        /**
         * Accumulated relative angle value for rotation on the axis. Reset to 0 when a dragStart occurs
         */
        _this.angle = 0;
        _this._isEnabled = true;
        _this._parent = null;
        _this._dragging = false;
        _this._angles = new Vector3();
        _this._parent = parent;
        // Create Material
        _this._coloredMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        _this._coloredMaterial.diffuseColor = color;
        _this._coloredMaterial.specularColor = color.subtract(new Color3(0.1, 0.1, 0.1));
        _this._hoverMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        _this._hoverMaterial.diffuseColor = Color3.Yellow();
        _this._disableMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        _this._disableMaterial.diffuseColor = Color3.Gray();
        _this._disableMaterial.alpha = 0.4;
        // Build mesh on root node
        _this._gizmoMesh = new Mesh("", gizmoLayer.utilityLayerScene);
        var _b = _this._createGizmoMesh(_this._gizmoMesh, thickness, tessellation), rotationMesh = _b.rotationMesh, collider = _b.collider;
        // Setup Rotation Circle
        _this._rotationDisplayPlane = CreatePlane("rotationDisplay", { size: 0.6, updatable: false }, _this.gizmoLayer.utilityLayerScene);
        _this._rotationDisplayPlane.rotation.z = Math.PI * 0.5;
        _this._rotationDisplayPlane.parent = _this._gizmoMesh;
        _this._rotationDisplayPlane.setEnabled(false);
        Effect.ShadersStore["rotationGizmoVertexShader"] = PlaneRotationGizmo._RotationGizmoVertexShader;
        Effect.ShadersStore["rotationGizmoFragmentShader"] = PlaneRotationGizmo._RotationGizmoFragmentShader;
        _this._rotationShaderMaterial = new ShaderMaterial("shader", _this.gizmoLayer.utilityLayerScene, {
            vertex: "rotationGizmo",
            fragment: "rotationGizmo",
        }, {
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection", "angles"],
        });
        _this._rotationShaderMaterial.backFaceCulling = false;
        _this._rotationDisplayPlane.material = _this._rotationShaderMaterial;
        _this._rotationDisplayPlane.visibility = 0.999;
        _this._gizmoMesh.lookAt(_this._rootMesh.position.add(planeNormal));
        _this._rootMesh.addChild(_this._gizmoMesh, Gizmo.PreserveScaling);
        _this._gizmoMesh.scaling.scaleInPlace(1 / 3);
        // Add drag behavior to handle events when the gizmo is dragged
        _this.dragBehavior = new PointerDragBehavior({ dragPlaneNormal: planeNormal });
        _this.dragBehavior.moveAttached = false;
        _this.dragBehavior.maxDragAngle = PlaneRotationGizmo.MaxDragAngle;
        _this.dragBehavior._useAlternatePickedPointAboveMaxDragAngle = true;
        _this._rootMesh.addBehavior(_this.dragBehavior);
        // Closures for drag logic
        var lastDragPosition = new Vector3();
        var rotationMatrix = new Matrix();
        var planeNormalTowardsCamera = new Vector3();
        var localPlaneNormalTowardsCamera = new Vector3();
        _this.dragBehavior.onDragStartObservable.add(function (e) {
            if (_this.attachedNode) {
                lastDragPosition.copyFrom(e.dragPlanePoint);
                _this._rotationDisplayPlane.setEnabled(true);
                _this._rotationDisplayPlane.getWorldMatrix().invertToRef(rotationMatrix);
                Vector3.TransformCoordinatesToRef(e.dragPlanePoint, rotationMatrix, lastDragPosition);
                _this._angles.x = Math.atan2(lastDragPosition.y, lastDragPosition.x) + Math.PI;
                _this._angles.y = 0;
                _this._angles.z = _this.updateGizmoRotationToMatchAttachedMesh ? 1 : 0;
                _this._dragging = true;
                lastDragPosition.copyFrom(e.dragPlanePoint);
                _this._rotationShaderMaterial.setVector3("angles", _this._angles);
                _this.angle = 0;
            }
        });
        _this.dragBehavior.onDragEndObservable.add(function () {
            _this._dragging = false;
            _this._rotationDisplayPlane.setEnabled(false);
        });
        var tmpSnapEvent = { snapDistance: 0 };
        var currentSnapDragDistance = 0;
        var tmpMatrix = new Matrix();
        var amountToRotate = new Quaternion();
        _this.dragBehavior.onDragObservable.add(function (event) {
            if (_this.attachedNode) {
                // Calc angle over full 360 degree (https://stackoverflow.com/questions/43493711/the-angle-between-two-3d-vectors-with-a-result-range-0-360)
                var nodeScale = new Vector3(1, 1, 1);
                var nodeQuaternion = new Quaternion(0, 0, 0, 1);
                var nodeTranslation = new Vector3(0, 0, 0);
                _this._handlePivot();
                _this.attachedNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);
                var newVector = event.dragPlanePoint.subtract(nodeTranslation).normalize();
                var originalVector = lastDragPosition.subtract(nodeTranslation).normalize();
                var cross = Vector3.Cross(newVector, originalVector);
                var dot = Vector3.Dot(newVector, originalVector);
                var angle = Math.atan2(cross.length(), dot);
                planeNormalTowardsCamera.copyFrom(planeNormal);
                localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                if (_this.updateGizmoRotationToMatchAttachedMesh) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
                }
                // Flip up vector depending on which side the camera is on
                var cameraFlipped = false;
                if (gizmoLayer.utilityLayerScene.activeCamera) {
                    var camVec = gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation).normalize();
                    if (Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                        planeNormalTowardsCamera.scaleInPlace(-1);
                        localPlaneNormalTowardsCamera.scaleInPlace(-1);
                        cameraFlipped = true;
                    }
                }
                var halfCircleSide = Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                if (halfCircleSide) {
                    angle = -angle;
                }
                // Snapping logic
                var snapped = false;
                if (_this.snapDistance != 0) {
                    currentSnapDragDistance += angle;
                    if (Math.abs(currentSnapDragDistance) > _this.snapDistance) {
                        var dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / _this.snapDistance);
                        if (currentSnapDragDistance < 0) {
                            dragSteps *= -1;
                        }
                        currentSnapDragDistance = currentSnapDragDistance % _this.snapDistance;
                        angle = _this.snapDistance * dragSteps;
                        snapped = true;
                    }
                    else {
                        angle = 0;
                    }
                }
                // Convert angle and axis to quaternion (http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm)
                var quaternionCoefficient = Math.sin(angle / 2);
                amountToRotate.set(planeNormalTowardsCamera.x * quaternionCoefficient, planeNormalTowardsCamera.y * quaternionCoefficient, planeNormalTowardsCamera.z * quaternionCoefficient, Math.cos(angle / 2));
                // If the meshes local scale is inverted (eg. loaded gltf file parent with z scale of -1) the rotation needs to be inverted on the y axis
                if (tmpMatrix.determinant() > 0) {
                    var tmpVector = new Vector3();
                    amountToRotate.toEulerAnglesToRef(tmpVector);
                    Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
                }
                if (_this.updateGizmoRotationToMatchAttachedMesh) {
                    // Rotate selected mesh quaternion over fixed axis
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                }
                else {
                    // Rotate selected mesh quaternion over rotated axis
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                }
                // recompose matrix
                _this.attachedNode.getWorldMatrix().copyFrom(Matrix.Compose(nodeScale, nodeQuaternion, nodeTranslation));
                lastDragPosition.copyFrom(event.dragPlanePoint);
                if (snapped) {
                    tmpSnapEvent.snapDistance = angle;
                    _this.onSnapObservable.notifyObservers(tmpSnapEvent);
                }
                _this._angles.y += angle;
                _this.angle += cameraFlipped ? -angle : angle;
                _this._rotationShaderMaterial.setVector3("angles", _this._angles);
                _this._matrixChanged();
            }
        });
        var light = gizmoLayer._getSharedGizmoLight();
        light.includedOnlyMeshes = light.includedOnlyMeshes.concat(_this._rootMesh.getChildMeshes(false));
        var cache = {
            colliderMeshes: [collider],
            gizmoMeshes: [rotationMesh],
            material: _this._coloredMaterial,
            hoverMaterial: _this._hoverMaterial,
            disableMaterial: _this._disableMaterial,
            active: false,
            dragBehavior: _this.dragBehavior,
        };
        (_a = _this._parent) === null || _a === void 0 ? void 0 : _a.addToAxisCache(_this._gizmoMesh, cache);
        _this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add(function (pointerInfo) {
            var _a;
            if (_this._customMeshSet) {
                return;
            }
            // updating here the maxangle because ondragstart is too late (value already used) and the updated value is not taken into account
            _this.dragBehavior.maxDragAngle = PlaneRotationGizmo.MaxDragAngle;
            _this._isHovered = !!(cache.colliderMeshes.indexOf((_a = pointerInfo === null || pointerInfo === void 0 ? void 0 : pointerInfo.pickInfo) === null || _a === void 0 ? void 0 : _a.pickedMesh) != -1);
            if (!_this._parent) {
                var material = cache.dragBehavior.enabled ? (_this._isHovered || _this._dragging ? _this._hoverMaterial : _this._coloredMaterial) : _this._disableMaterial;
                _this._setGizmoMeshMaterial(cache.gizmoMeshes, material);
            }
        });
        _this.dragBehavior.onEnabledObservable.add(function (newState) {
            _this._setGizmoMeshMaterial(cache.gizmoMeshes, newState ? _this._coloredMaterial : _this._disableMaterial);
        });
        return _this;
    }
    /**
     * Create Geometry for Gizmo
     * @param parentMesh
     * @param thickness
     * @param tessellation
     */
    PlaneRotationGizmo.prototype._createGizmoMesh = function (parentMesh, thickness, tessellation) {
        var collider = CreateTorus("ignore", {
            diameter: 0.6,
            thickness: 0.03 * thickness,
            tessellation: tessellation,
        }, this.gizmoLayer.utilityLayerScene);
        collider.visibility = 0;
        var rotationMesh = CreateTorus("", {
            diameter: 0.6,
            thickness: 0.005 * thickness,
            tessellation: tessellation,
        }, this.gizmoLayer.utilityLayerScene);
        rotationMesh.material = this._coloredMaterial;
        // Position arrow pointing in its drag axis
        rotationMesh.rotation.x = Math.PI / 2;
        collider.rotation.x = Math.PI / 2;
        parentMesh.addChild(rotationMesh, Gizmo.PreserveScaling);
        parentMesh.addChild(collider, Gizmo.PreserveScaling);
        return { rotationMesh: rotationMesh, collider: collider };
    };
    PlaneRotationGizmo.prototype._attachedNodeChanged = function (value) {
        if (this.dragBehavior) {
            this.dragBehavior.enabled = value ? true : false;
        }
    };
    Object.defineProperty(PlaneRotationGizmo.prototype, "isEnabled", {
        get: function () {
            return this._isEnabled;
        },
        /**
         * If the gizmo is enabled
         */
        set: function (value) {
            this._isEnabled = value;
            if (!value) {
                this.attachedMesh = null;
            }
            else {
                if (this._parent) {
                    this.attachedMesh = this._parent.attachedMesh;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of the gizmo
     */
    PlaneRotationGizmo.prototype.dispose = function () {
        this.onSnapObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.dragBehavior.detach();
        if (this._gizmoMesh) {
            this._gizmoMesh.dispose();
        }
        if (this._rotationDisplayPlane) {
            this._rotationDisplayPlane.dispose();
        }
        if (this._rotationShaderMaterial) {
            this._rotationShaderMaterial.dispose();
        }
        [this._coloredMaterial, this._hoverMaterial, this._disableMaterial].forEach(function (matl) {
            if (matl) {
                matl.dispose();
            }
        });
        _super.prototype.dispose.call(this);
    };
    /**
     * The maximum angle between the camera and the rotation allowed for interaction
     * If a rotation plane appears 'flat', a lower value allows interaction.
     */
    PlaneRotationGizmo.MaxDragAngle = (Math.PI * 9) / 20;
    PlaneRotationGizmo._RotationGizmoVertexShader = "\n        precision highp float;\n        attribute vec3 position;\n        attribute vec2 uv;\n        uniform mat4 worldViewProjection;\n        varying vec3 vPosition;\n        varying vec2 vUV;\n        void main(void) {\n            gl_Position = worldViewProjection * vec4(position, 1.0);\n            vUV = uv;\n        }";
    PlaneRotationGizmo._RotationGizmoFragmentShader = "\n        precision highp float;\n        varying vec2 vUV;\n        varying vec3 vPosition;\n        uniform vec3 angles;\n        #define twopi 6.283185307\n        void main(void) {\n            vec2 uv = vUV - vec2(0.5);\n            float angle = atan(uv.y, uv.x) + 3.141592;\n            float delta = gl_FrontFacing ? angles.y : -angles.y;\n            float begin = angles.x - delta * angles.z;\n            float start = (begin < (begin + delta)) ? begin : (begin + delta);\n            float end = (begin > (begin + delta)) ? begin : (begin + delta);\n            float len = sqrt(dot(uv,uv));\n            float opacity = 1. - step(0.5, len);\n\n            float base = abs(floor(start / twopi)) * twopi;\n            start += base;\n            end += base;\n\n            float intensity = 0.;\n            for (int i = 0; i < 5; i++)\n            {\n                intensity += max(step(start, angle) - step(end, angle), 0.);\n                angle += twopi;\n            }\n            gl_FragColor = vec4(1.,1.,0., min(intensity * 0.25, 0.8)) * opacity;\n        }";
    return PlaneRotationGizmo;
}(Gizmo));
export { PlaneRotationGizmo };
//# sourceMappingURL=planeRotationGizmo.js.map