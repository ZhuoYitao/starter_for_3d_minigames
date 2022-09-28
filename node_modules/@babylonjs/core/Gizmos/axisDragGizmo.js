import { __extends } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Vector3 } from "../Maths/math.vector.js";
import { TransformNode } from "../Meshes/transformNode.js";
import { Mesh } from "../Meshes/mesh.js";
import { CreateCylinder } from "../Meshes/Builders/cylinderBuilder.js";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { Color3 } from "../Maths/math.color.js";
/**
 * Single axis drag gizmo
 */
var AxisDragGizmo = /** @class */ (function (_super) {
    __extends(AxisDragGizmo, _super);
    /**
     * Creates an AxisDragGizmo
     * @param dragAxis The axis which the gizmo will be able to drag on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param parent
     * @param thickness display gizmo axis thickness
     */
    function AxisDragGizmo(dragAxis, color, gizmoLayer, parent, thickness) {
        if (color === void 0) { color = Color3.Gray(); }
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        if (parent === void 0) { parent = null; }
        if (thickness === void 0) { thickness = 1; }
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
        _this._isEnabled = true;
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
        // Build Mesh + Collider
        var arrow = AxisDragGizmo._CreateArrow(gizmoLayer.utilityLayerScene, _this._coloredMaterial, thickness);
        var collider = AxisDragGizmo._CreateArrow(gizmoLayer.utilityLayerScene, _this._coloredMaterial, thickness + 4, true);
        // Add to Root Node
        _this._gizmoMesh = new Mesh("", gizmoLayer.utilityLayerScene);
        _this._gizmoMesh.addChild(arrow);
        _this._gizmoMesh.addChild(collider);
        _this._gizmoMesh.lookAt(_this._rootMesh.position.add(dragAxis));
        _this._gizmoMesh.scaling.scaleInPlace(1 / 3);
        _this._gizmoMesh.parent = _this._rootMesh;
        var currentSnapDragDistance = 0;
        var tmpVector = new Vector3();
        var tmpVector2 = new Vector3();
        var tmpSnapEvent = { snapDistance: 0 };
        // Add drag behavior to handle events when the gizmo is dragged
        _this.dragBehavior = new PointerDragBehavior({ dragAxis: dragAxis });
        _this.dragBehavior.moveAttached = false;
        _this.dragBehavior.updateDragPlane = false;
        _this._rootMesh.addBehavior(_this.dragBehavior);
        _this.dragBehavior.onDragObservable.add(function (event) {
            if (_this.attachedNode) {
                _this._handlePivot();
                // Keep world translation and use it to update world transform
                // if the node has parent, the local transform properties (position, rotation, scale)
                // will be recomputed in _matrixChanged function
                var matrixChanged = false;
                // Snapping logic
                if (_this.snapDistance == 0) {
                    _this.attachedNode.getWorldMatrix().getTranslationToRef(tmpVector2);
                    tmpVector2.addInPlace(event.delta);
                    if (_this.dragBehavior.validateDrag(tmpVector2)) {
                        if (_this.attachedNode.position) {
                            // Required for nodes like lights
                            _this.attachedNode.position.addInPlaceFromFloats(event.delta.x, event.delta.y, event.delta.z);
                        }
                        // use _worldMatrix to not force a matrix update when calling GetWorldMatrix especially with Cameras
                        _this.attachedNode.getWorldMatrix().addTranslationFromFloats(event.delta.x, event.delta.y, event.delta.z);
                        _this.attachedNode.updateCache();
                        matrixChanged = true;
                    }
                }
                else {
                    currentSnapDragDistance += event.dragDistance;
                    if (Math.abs(currentSnapDragDistance) > _this.snapDistance) {
                        var dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / _this.snapDistance);
                        currentSnapDragDistance = currentSnapDragDistance % _this.snapDistance;
                        event.delta.normalizeToRef(tmpVector);
                        tmpVector.scaleInPlace(_this.snapDistance * dragSteps);
                        _this.attachedNode.getWorldMatrix().getTranslationToRef(tmpVector2);
                        tmpVector2.addInPlace(tmpVector);
                        if (_this.dragBehavior.validateDrag(tmpVector2)) {
                            _this.attachedNode.getWorldMatrix().addTranslationFromFloats(tmpVector.x, tmpVector.y, tmpVector.z);
                            _this.attachedNode.updateCache();
                            tmpSnapEvent.snapDistance = _this.snapDistance * dragSteps;
                            _this.onSnapObservable.notifyObservers(tmpSnapEvent);
                            matrixChanged = true;
                        }
                    }
                }
                if (matrixChanged) {
                    _this._matrixChanged();
                }
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
            gizmoMeshes: arrow.getChildMeshes(),
            colliderMeshes: collider.getChildMeshes(),
            material: _this._coloredMaterial,
            hoverMaterial: _this._hoverMaterial,
            disableMaterial: _this._disableMaterial,
            active: false,
            dragBehavior: _this.dragBehavior,
        };
        (_a = _this._parent) === null || _a === void 0 ? void 0 : _a.addToAxisCache(collider, cache);
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
            _this._setGizmoMeshMaterial(cache.gizmoMeshes, newState ? cache.material : cache.disableMaterial);
        });
        return _this;
    }
    /**
     * @param scene
     * @param material
     * @param thickness
     * @param isCollider
     * @hidden
     */
    AxisDragGizmo._CreateArrow = function (scene, material, thickness, isCollider) {
        if (thickness === void 0) { thickness = 1; }
        if (isCollider === void 0) { isCollider = false; }
        var arrow = new TransformNode("arrow", scene);
        var cylinder = CreateCylinder("cylinder", { diameterTop: 0, height: 0.075, diameterBottom: 0.0375 * (1 + (thickness - 1) / 4), tessellation: 96 }, scene);
        var line = CreateCylinder("cylinder", { diameterTop: 0.005 * thickness, height: 0.275, diameterBottom: 0.005 * thickness, tessellation: 96 }, scene);
        // Position arrow pointing in its drag axis
        cylinder.parent = arrow;
        cylinder.material = material;
        cylinder.rotation.x = Math.PI / 2;
        cylinder.position.z += 0.3;
        line.parent = arrow;
        line.material = material;
        line.position.z += 0.275 / 2;
        line.rotation.x = Math.PI / 2;
        if (isCollider) {
            line.visibility = 0;
            cylinder.visibility = 0;
        }
        return arrow;
    };
    /**
     * @param scene
     * @param arrow
     * @hidden
     */
    AxisDragGizmo._CreateArrowInstance = function (scene, arrow) {
        var instance = new TransformNode("arrow", scene);
        for (var _i = 0, _a = arrow.getChildMeshes(); _i < _a.length; _i++) {
            var mesh = _a[_i];
            var childInstance = mesh.createInstance(mesh.name);
            childInstance.parent = instance;
        }
        return instance;
    };
    AxisDragGizmo.prototype._attachedNodeChanged = function (value) {
        if (this.dragBehavior) {
            this.dragBehavior.enabled = value ? true : false;
        }
    };
    Object.defineProperty(AxisDragGizmo.prototype, "isEnabled", {
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
    AxisDragGizmo.prototype.dispose = function () {
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
    return AxisDragGizmo;
}(Gizmo));
export { AxisDragGizmo };
//# sourceMappingURL=axisDragGizmo.js.map