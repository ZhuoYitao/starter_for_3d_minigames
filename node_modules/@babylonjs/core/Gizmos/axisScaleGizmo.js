import { __extends } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Vector3, Matrix } from "../Maths/math.vector.js";
import { Mesh } from "../Meshes/mesh.js";
import { CreateBox } from "../Meshes/Builders/boxBuilder.js";
import { CreateCylinder } from "../Meshes/Builders/cylinderBuilder.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { Color3 } from "../Maths/math.color.js";
/**
 * Single axis scale gizmo
 */
var AxisScaleGizmo = /** @class */ (function (_super) {
    __extends(AxisScaleGizmo, _super);
    /**
     * Creates an AxisScaleGizmo
     * @param dragAxis The axis which the gizmo will be able to scale on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param parent
     * @param thickness display gizmo axis thickness
     */
    function AxisScaleGizmo(dragAxis, color, gizmoLayer, parent, thickness) {
        if (color === void 0) { color = Color3.Gray(); }
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (parent === void 0) { parent = null; }
        if (thickness === void 0) { thickness = 1; }
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g;
        _this = _super.call(this, gizmoLayer) || this;
        _this._pointerObserver = null;
        /**
         * Scale distance in babylon units that the gizmo will snap to when dragged (Default: 0)
         */
        _this.snapDistance = 0;
        /**
         * Event that fires each time the gizmo snaps to a new location.
         * * snapDistance is the the change in distance
         */
        _this.onSnapObservable = new Observable();
        /**
         * If the scaling operation should be done on all axis (default: false)
         */
        _this.uniformScaling = false;
        /**
         * Custom sensitivity value for the drag strength
         */
        _this.sensitivity = 1;
        /**
         * The magnitude of the drag strength (scaling factor)
         */
        _this.dragScale = 1;
        _this._isEnabled = true;
        _this._parent = null;
        _this._dragging = false;
        _this._tmpVector = new Vector3();
        _this._tmpMatrix = new Matrix();
        _this._tmpMatrix2 = new Matrix();
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
        // Build mesh + Collider
        _this._gizmoMesh = new Mesh("axis", gizmoLayer.utilityLayerScene);
        var _h = _this._createGizmoMesh(_this._gizmoMesh, thickness), arrowMesh = _h.arrowMesh, arrowTail = _h.arrowTail;
        var collider = _this._createGizmoMesh(_this._gizmoMesh, thickness + 4, true);
        _this._gizmoMesh.lookAt(_this._rootMesh.position.add(dragAxis));
        _this._rootMesh.addChild(_this._gizmoMesh, Gizmo.PreserveScaling);
        _this._gizmoMesh.scaling.scaleInPlace(1 / 3);
        // Closure of initial prop values for resetting
        var nodePosition = arrowMesh.position.clone();
        var linePosition = arrowTail.position.clone();
        var lineScale = arrowTail.scaling.clone();
        var increaseGizmoMesh = function (dragDistance) {
            var dragStrength = dragDistance * (3 / _this._rootMesh.scaling.length()) * 6;
            arrowMesh.position.z += dragStrength / 3.5;
            arrowTail.scaling.y += dragStrength;
            _this.dragScale = arrowTail.scaling.y;
            arrowTail.position.z = arrowMesh.position.z / 2;
        };
        var resetGizmoMesh = function () {
            arrowMesh.position.set(nodePosition.x, nodePosition.y, nodePosition.z);
            arrowTail.position.set(linePosition.x, linePosition.y, linePosition.z);
            arrowTail.scaling.set(lineScale.x, lineScale.y, lineScale.z);
            _this.dragScale = arrowTail.scaling.y;
            _this._dragging = false;
        };
        // Add drag behavior to handle events when the gizmo is dragged
        _this.dragBehavior = new PointerDragBehavior({ dragAxis: dragAxis });
        _this.dragBehavior.moveAttached = false;
        _this.dragBehavior.updateDragPlane = false;
        _this._rootMesh.addBehavior(_this.dragBehavior);
        var currentSnapDragDistance = 0;
        var tmpVector = new Vector3();
        var tmpSnapEvent = { snapDistance: 0 };
        _this.dragBehavior.onDragObservable.add(function (event) {
            if (_this.attachedNode) {
                _this._handlePivot();
                // Drag strength is modified by the scale of the gizmo (eg. for small objects like boombox the strength will be increased to match the behavior of larger objects)
                var dragStrength = _this.sensitivity * event.dragDistance * ((_this.scaleRatio * 3) / _this._rootMesh.scaling.length());
                // Snapping logic
                var snapped = false;
                var dragSteps = 0;
                if (_this.uniformScaling) {
                    tmpVector.setAll(0.57735); // 1 / sqrt(3)
                }
                else {
                    tmpVector.copyFrom(dragAxis);
                }
                if (_this.snapDistance == 0) {
                    tmpVector.scaleToRef(dragStrength, tmpVector);
                }
                else {
                    currentSnapDragDistance += dragStrength;
                    if (Math.abs(currentSnapDragDistance) > _this.snapDistance) {
                        dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / _this.snapDistance);
                        if (currentSnapDragDistance < 0) {
                            dragSteps *= -1;
                        }
                        currentSnapDragDistance = currentSnapDragDistance % _this.snapDistance;
                        tmpVector.scaleToRef(_this.snapDistance * dragSteps, tmpVector);
                        snapped = true;
                    }
                    else {
                        tmpVector.scaleInPlace(0);
                    }
                }
                Matrix.ScalingToRef(1 + tmpVector.x, 1 + tmpVector.y, 1 + tmpVector.z, _this._tmpMatrix2);
                _this._tmpMatrix2.multiplyToRef(_this.attachedNode.getWorldMatrix(), _this._tmpMatrix);
                var transformNode = _this.attachedNode._isMesh ? _this.attachedNode : undefined;
                _this._tmpMatrix.decompose(_this._tmpVector, undefined, undefined, Gizmo.PreserveScaling ? transformNode : undefined);
                var maxScale = 100000;
                if (Math.abs(_this._tmpVector.x) < maxScale && Math.abs(_this._tmpVector.y) < maxScale && Math.abs(_this._tmpVector.z) < maxScale) {
                    _this.attachedNode.getWorldMatrix().copyFrom(_this._tmpMatrix);
                }
                if (snapped) {
                    tmpSnapEvent.snapDistance = _this.snapDistance * dragSteps;
                    _this.onSnapObservable.notifyObservers(tmpSnapEvent);
                }
                _this._matrixChanged();
            }
        });
        // On Drag Listener: to move gizmo mesh with user action
        _this.dragBehavior.onDragStartObservable.add(function () {
            _this._dragging = true;
        });
        _this.dragBehavior.onDragObservable.add(function (e) { return increaseGizmoMesh(e.dragDistance); });
        _this.dragBehavior.onDragEndObservable.add(resetGizmoMesh);
        // Listeners for Universal Scalar
        (_c = (_b = (_a = parent === null || parent === void 0 ? void 0 : parent.uniformScaleGizmo) === null || _a === void 0 ? void 0 : _a.dragBehavior) === null || _b === void 0 ? void 0 : _b.onDragObservable) === null || _c === void 0 ? void 0 : _c.add(function (e) { return increaseGizmoMesh(e.delta.y); });
        (_f = (_e = (_d = parent === null || parent === void 0 ? void 0 : parent.uniformScaleGizmo) === null || _d === void 0 ? void 0 : _d.dragBehavior) === null || _e === void 0 ? void 0 : _e.onDragEndObservable) === null || _f === void 0 ? void 0 : _f.add(resetGizmoMesh);
        var cache = {
            gizmoMeshes: [arrowMesh, arrowTail],
            colliderMeshes: [collider.arrowMesh, collider.arrowTail],
            material: _this._coloredMaterial,
            hoverMaterial: _this._hoverMaterial,
            disableMaterial: _this._disableMaterial,
            active: false,
            dragBehavior: _this.dragBehavior,
        };
        (_g = _this._parent) === null || _g === void 0 ? void 0 : _g.addToAxisCache(_this._gizmoMesh, cache);
        _this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add(function (pointerInfo) {
            var _a;
            if (_this._customMeshSet) {
                return;
            }
            _this._isHovered = !!(cache.colliderMeshes.indexOf((_a = pointerInfo === null || pointerInfo === void 0 ? void 0 : pointerInfo.pickInfo) === null || _a === void 0 ? void 0 : _a.pickedMesh) != -1);
            if (!_this._parent) {
                var material = _this.dragBehavior.enabled ? (_this._isHovered || _this._dragging ? _this._hoverMaterial : _this._coloredMaterial) : _this._disableMaterial;
                _this._setGizmoMeshMaterial(cache.gizmoMeshes, material);
            }
        });
        _this.dragBehavior.onEnabledObservable.add(function (newState) {
            _this._setGizmoMeshMaterial(cache.gizmoMeshes, newState ? _this._coloredMaterial : _this._disableMaterial);
        });
        var light = gizmoLayer._getSharedGizmoLight();
        light.includedOnlyMeshes = light.includedOnlyMeshes.concat(_this._rootMesh.getChildMeshes());
        return _this;
    }
    /**
     * Create Geometry for Gizmo
     * @param parentMesh
     * @param thickness
     * @param isCollider
     */
    AxisScaleGizmo.prototype._createGizmoMesh = function (parentMesh, thickness, isCollider) {
        if (isCollider === void 0) { isCollider = false; }
        var arrowMesh = CreateBox("yPosMesh", { size: 0.4 * (1 + (thickness - 1) / 4) }, this.gizmoLayer.utilityLayerScene);
        var arrowTail = CreateCylinder("cylinder", { diameterTop: 0.005 * thickness, height: 0.275, diameterBottom: 0.005 * thickness, tessellation: 96 }, this.gizmoLayer.utilityLayerScene);
        // Position arrow pointing in its drag axis
        arrowMesh.scaling.scaleInPlace(0.1);
        arrowMesh.material = this._coloredMaterial;
        arrowMesh.rotation.x = Math.PI / 2;
        arrowMesh.position.z += 0.3;
        arrowTail.material = this._coloredMaterial;
        arrowTail.position.z += 0.275 / 2;
        arrowTail.rotation.x = Math.PI / 2;
        if (isCollider) {
            arrowMesh.visibility = 0;
            arrowTail.visibility = 0;
        }
        parentMesh.addChild(arrowMesh);
        parentMesh.addChild(arrowTail);
        return { arrowMesh: arrowMesh, arrowTail: arrowTail };
    };
    AxisScaleGizmo.prototype._attachedNodeChanged = function (value) {
        if (this.dragBehavior) {
            this.dragBehavior.enabled = value ? true : false;
        }
    };
    Object.defineProperty(AxisScaleGizmo.prototype, "isEnabled", {
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
                this.attachedNode = null;
            }
            else {
                if (this._parent) {
                    this.attachedMesh = this._parent.attachedMesh;
                    this.attachedNode = this._parent.attachedNode;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of the gizmo
     */
    AxisScaleGizmo.prototype.dispose = function () {
        this.onSnapObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.dragBehavior.detach();
        if (this._gizmoMesh) {
            this._gizmoMesh.dispose();
        }
        [this._coloredMaterial, this._hoverMaterial, this._disableMaterial].forEach(function (matl) {
            if (matl) {
                matl.dispose();
            }
        });
        _super.prototype.dispose.call(this);
    };
    /**
     * Disposes and replaces the current meshes in the gizmo with the specified mesh
     * @param mesh The mesh to replace the default mesh of the gizmo
     * @param useGizmoMaterial If the gizmo's default material should be used (default: false)
     */
    AxisScaleGizmo.prototype.setCustomMesh = function (mesh, useGizmoMaterial) {
        var _this = this;
        if (useGizmoMaterial === void 0) { useGizmoMaterial = false; }
        _super.prototype.setCustomMesh.call(this, mesh);
        if (useGizmoMaterial) {
            this._rootMesh.getChildMeshes().forEach(function (m) {
                m.material = _this._coloredMaterial;
                if (m.color) {
                    m.color = _this._coloredMaterial.diffuseColor;
                }
            });
            this._customMeshSet = false;
        }
    };
    return AxisScaleGizmo;
}(Gizmo));
export { AxisScaleGizmo };
//# sourceMappingURL=axisScaleGizmo.js.map