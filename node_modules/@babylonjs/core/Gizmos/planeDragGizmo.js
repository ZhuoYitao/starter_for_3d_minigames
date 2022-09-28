import { __extends } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { TransformNode } from "../Meshes/transformNode.js";
import { CreatePlane } from "../Meshes/Builders/planeBuilder.js";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
/**
 * Single plane drag gizmo
 */
var PlaneDragGizmo = /** @class */ (function (_super) {
    __extends(PlaneDragGizmo, _super);
    /**
     * Creates a PlaneDragGizmo
     * @param dragPlaneNormal The axis normal to which the gizmo will be able to drag on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param parent
     */
    function PlaneDragGizmo(dragPlaneNormal, color, gizmoLayer, parent) {
        if (color === void 0) { color = Color3.Gray(); }
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (parent === void 0) { parent = null; }
        var _this = this;
        var _a;
        _this = _super.call(this, gizmoLayer) || this;
        _this._pointerObserver = null;
        /**
         * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
         */
        _this.snapDistance = 0;
        /**
         * Event that fires each time the gizmo snaps to a new location.
         * * snapDistance is the the change in distance
         */
        _this.onSnapObservable = new Observable();
        _this._isEnabled = false;
        _this._parent = null;
        _this._dragging = false;
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
        // Build plane mesh on root node
        _this._gizmoMesh = PlaneDragGizmo._CreatePlane(gizmoLayer.utilityLayerScene, _this._coloredMaterial);
        _this._gizmoMesh.lookAt(_this._rootMesh.position.add(dragPlaneNormal));
        _this._gizmoMesh.scaling.scaleInPlace(1 / 3);
        _this._gizmoMesh.parent = _this._rootMesh;
        var currentSnapDragDistance = 0;
        var tmpVector = new Vector3();
        var tmpSnapEvent = { snapDistance: 0 };
        // Add dragPlaneNormal drag behavior to handle events when the gizmo is dragged
        _this.dragBehavior = new PointerDragBehavior({ dragPlaneNormal: dragPlaneNormal });
        _this.dragBehavior.moveAttached = false;
        _this._rootMesh.addBehavior(_this.dragBehavior);
        _this.dragBehavior.onDragObservable.add(function (event) {
            if (_this.attachedNode) {
                _this._handlePivot();
                // Keep world translation and use it to update world transform
                // if the node has parent, the local transform properties (position, rotation, scale)
                // will be recomputed in _matrixChanged function
                // Snapping logic
                if (_this.snapDistance == 0) {
                    _this.attachedNode.getWorldMatrix().addTranslationFromFloats(event.delta.x, event.delta.y, event.delta.z);
                }
                else {
                    currentSnapDragDistance += event.dragDistance;
                    if (Math.abs(currentSnapDragDistance) > _this.snapDistance) {
                        var dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / _this.snapDistance);
                        currentSnapDragDistance = currentSnapDragDistance % _this.snapDistance;
                        event.delta.normalizeToRef(tmpVector);
                        tmpVector.scaleInPlace(_this.snapDistance * dragSteps);
                        _this.attachedNode.getWorldMatrix().addTranslationFromFloats(tmpVector.x, tmpVector.y, tmpVector.z);
                        tmpSnapEvent.snapDistance = _this.snapDistance * dragSteps;
                        _this.onSnapObservable.notifyObservers(tmpSnapEvent);
                    }
                }
                _this._matrixChanged();
            }
        });
        _this.dragBehavior.onDragStartObservable.add(function () {
            _this._dragging = true;
        });
        _this.dragBehavior.onDragEndObservable.add(function () {
            _this._dragging = false;
        });
        var light = gizmoLayer._getSharedGizmoLight();
        light.includedOnlyMeshes = light.includedOnlyMeshes.concat(_this._rootMesh.getChildMeshes(false));
        var cache = {
            gizmoMeshes: _this._gizmoMesh.getChildMeshes(),
            colliderMeshes: _this._gizmoMesh.getChildMeshes(),
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
     * @param scene
     * @param material
     * @hidden
     */
    PlaneDragGizmo._CreatePlane = function (scene, material) {
        var plane = new TransformNode("plane", scene);
        //make sure plane is double sided
        var dragPlane = CreatePlane("dragPlane", { width: 0.1375, height: 0.1375, sideOrientation: 2 }, scene);
        dragPlane.material = material;
        dragPlane.parent = plane;
        return plane;
    };
    PlaneDragGizmo.prototype._attachedNodeChanged = function (value) {
        if (this.dragBehavior) {
            this.dragBehavior.enabled = value ? true : false;
        }
    };
    Object.defineProperty(PlaneDragGizmo.prototype, "isEnabled", {
        get: function () {
            return this._isEnabled;
        },
        /**
         * If the gizmo is enabled
         */
        set: function (value) {
            this._isEnabled = value;
            if (!value) {
                this.attachedNode = null;
            }
            else {
                if (this._parent) {
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
    PlaneDragGizmo.prototype.dispose = function () {
        this.onSnapObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.dragBehavior.detach();
        _super.prototype.dispose.call(this);
        if (this._gizmoMesh) {
            this._gizmoMesh.dispose();
        }
        [this._coloredMaterial, this._hoverMaterial, this._disableMaterial].forEach(function (matl) {
            if (matl) {
                matl.dispose();
            }
        });
    };
    return PlaneDragGizmo;
}(Gizmo));
export { PlaneDragGizmo };
//# sourceMappingURL=planeDragGizmo.js.map