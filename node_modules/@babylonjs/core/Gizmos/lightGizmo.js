import { __extends } from "tslib";
import { Vector3, Quaternion } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { Mesh } from "../Meshes/mesh.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { HemisphericLight } from "../Lights/hemisphericLight.js";
import { DirectionalLight } from "../Lights/directionalLight.js";
import { CreateSphere } from "../Meshes/Builders/sphereBuilder.js";
import { CreateHemisphere } from "../Meshes/Builders/hemisphereBuilder.js";
import { SpotLight } from "../Lights/spotLight.js";
import { TransformNode } from "../Meshes/transformNode.js";
import { PointerEventTypes } from "../Events/pointerEvents.js";
import { Observable } from "../Misc/observable.js";
import { CreateCylinder } from "../Meshes/Builders/cylinderBuilder.js";
/**
 * Gizmo that enables viewing a light
 */
var LightGizmo = /** @class */ (function (_super) {
    __extends(LightGizmo, _super);
    /**
     * Creates a LightGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    function LightGizmo(gizmoLayer) {
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer; }
        var _this = _super.call(this, gizmoLayer) || this;
        _this._cachedPosition = new Vector3();
        _this._cachedForward = new Vector3(0, 0, 1);
        _this._pointerObserver = null;
        /**
         * Event that fires each time the gizmo is clicked
         */
        _this.onClickedObservable = new Observable();
        _this._light = null;
        _this.attachedMesh = new AbstractMesh("", _this.gizmoLayer.utilityLayerScene);
        _this._attachedMeshParent = new TransformNode("parent", _this.gizmoLayer.utilityLayerScene);
        _this.attachedMesh.parent = _this._attachedMeshParent;
        _this._material = new StandardMaterial("light", _this.gizmoLayer.utilityLayerScene);
        _this._material.diffuseColor = new Color3(0.5, 0.5, 0.5);
        _this._material.specularColor = new Color3(0.1, 0.1, 0.1);
        _this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add(function (pointerInfo) {
            if (!_this._light) {
                return;
            }
            _this._isHovered = !!(pointerInfo.pickInfo && _this._rootMesh.getChildMeshes().indexOf(pointerInfo.pickInfo.pickedMesh) != -1);
            if (_this._isHovered && pointerInfo.event.button === 0) {
                _this.onClickedObservable.notifyObservers(_this._light);
            }
        }, PointerEventTypes.POINTERDOWN);
        return _this;
    }
    Object.defineProperty(LightGizmo.prototype, "attachedNode", {
        /**
         * Override attachedNode because lightgizmo only support attached mesh
         * It will return the attached mesh (if any) and setting an attached node will log
         * a warning
         */
        get: function () {
            return this.attachedMesh;
        },
        set: function (value) {
            console.warn("Nodes cannot be attached to LightGizmo. Attach to a mesh instead.");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightGizmo.prototype, "light", {
        get: function () {
            return this._light;
        },
        /**
         * The light that the gizmo is attached to
         */
        set: function (light) {
            var _this = this;
            this._light = light;
            if (light) {
                // Create the mesh for the given light type
                if (this._lightMesh) {
                    this._lightMesh.dispose();
                }
                if (light instanceof HemisphericLight) {
                    this._lightMesh = LightGizmo._CreateHemisphericLightMesh(this.gizmoLayer.utilityLayerScene);
                }
                else if (light instanceof DirectionalLight) {
                    this._lightMesh = LightGizmo._CreateDirectionalLightMesh(this.gizmoLayer.utilityLayerScene);
                }
                else if (light instanceof SpotLight) {
                    this._lightMesh = LightGizmo._CreateSpotLightMesh(this.gizmoLayer.utilityLayerScene);
                }
                else {
                    this._lightMesh = LightGizmo._CreatePointLightMesh(this.gizmoLayer.utilityLayerScene);
                }
                this._lightMesh.getChildMeshes(false).forEach(function (m) {
                    m.material = _this._material;
                });
                this._lightMesh.parent = this._rootMesh;
                // Add lighting to the light gizmo
                var gizmoLight = this.gizmoLayer._getSharedGizmoLight();
                gizmoLight.includedOnlyMeshes = gizmoLight.includedOnlyMeshes.concat(this._lightMesh.getChildMeshes(false));
                this._lightMesh.rotationQuaternion = new Quaternion();
                if (!this.attachedMesh.reservedDataStore) {
                    this.attachedMesh.reservedDataStore = {};
                }
                this.attachedMesh.reservedDataStore.lightGizmo = this;
                if (light.parent) {
                    this._attachedMeshParent.freezeWorldMatrix(light.parent.getWorldMatrix());
                }
                // Get update position and direction if the light has it
                if (light.position) {
                    this.attachedMesh.position.copyFrom(light.position);
                    this.attachedMesh.computeWorldMatrix(true);
                    this._cachedPosition.copyFrom(this.attachedMesh.position);
                }
                if (light.direction) {
                    this.attachedMesh.setDirection(light.direction);
                    this.attachedMesh.computeWorldMatrix(true);
                    this._cachedForward.copyFrom(this.attachedMesh.forward);
                }
                this._update();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LightGizmo.prototype, "material", {
        /**
         * Gets the material used to render the light gizmo
         */
        get: function () {
            return this._material;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @hidden
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    LightGizmo.prototype._update = function () {
        _super.prototype._update.call(this);
        if (!this._light) {
            return;
        }
        if (this._light.parent) {
            this._attachedMeshParent.freezeWorldMatrix(this._light.parent.getWorldMatrix());
        }
        // For light position and direction, a dirty flag is set to true in the setter
        // It means setting values individually or copying values will not call setter and
        // dirty flag will not be set to true. Hence creating a new Vector3.
        if (this._light.position) {
            // If the gizmo is moved update the light otherwise update the gizmo to match the light
            if (!this.attachedMesh.position.equals(this._cachedPosition)) {
                // update light to match gizmo
                var position = this.attachedMesh.position;
                this._light.position = new Vector3(position.x, position.y, position.z);
                this._cachedPosition.copyFrom(this.attachedMesh.position);
            }
            else {
                // update gizmo to match light
                this.attachedMesh.position.copyFrom(this._light.position);
                this.attachedMesh.computeWorldMatrix(true);
                this._cachedPosition.copyFrom(this.attachedMesh.position);
            }
        }
        if (this._light.direction) {
            // If the gizmo is moved update the light otherwise update the gizmo to match the light
            if (Vector3.DistanceSquared(this.attachedMesh.forward, this._cachedForward) > 0.0001) {
                // update light to match gizmo
                var direction = this.attachedMesh.forward;
                this._light.direction = new Vector3(direction.x, direction.y, direction.z);
                this._cachedForward.copyFrom(this.attachedMesh.forward);
            }
            else if (Vector3.DistanceSquared(this.attachedMesh.forward, this._light.direction) > 0.0001) {
                // update gizmo to match light
                this.attachedMesh.setDirection(this._light.direction);
                this.attachedMesh.computeWorldMatrix(true);
                this._cachedForward.copyFrom(this.attachedMesh.forward);
            }
        }
    };
    /**
     * Disposes of the light gizmo
     */
    LightGizmo.prototype.dispose = function () {
        this.onClickedObservable.clear();
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this._material.dispose();
        _super.prototype.dispose.call(this);
        this._attachedMeshParent.dispose();
    };
    LightGizmo._CreateHemisphericLightMesh = function (scene) {
        var root = new Mesh("hemisphereLight", scene);
        var hemisphere = CreateHemisphere(root.name, { segments: 10, diameter: 1 }, scene);
        hemisphere.position.z = -0.15;
        hemisphere.rotation.x = Math.PI / 2;
        hemisphere.parent = root;
        var lines = this._CreateLightLines(3, scene);
        lines.parent = root;
        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;
        return root;
    };
    LightGizmo._CreatePointLightMesh = function (scene) {
        var root = new Mesh("pointLight", scene);
        var sphere = CreateSphere(root.name, { segments: 10, diameter: 1 }, scene);
        sphere.rotation.x = Math.PI / 2;
        sphere.parent = root;
        var lines = this._CreateLightLines(5, scene);
        lines.parent = root;
        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;
        return root;
    };
    LightGizmo._CreateSpotLightMesh = function (scene) {
        var root = new Mesh("spotLight", scene);
        var sphere = CreateSphere(root.name, { segments: 10, diameter: 1 }, scene);
        sphere.parent = root;
        var hemisphere = CreateHemisphere(root.name, { segments: 10, diameter: 2 }, scene);
        hemisphere.parent = root;
        hemisphere.rotation.x = -Math.PI / 2;
        var lines = this._CreateLightLines(2, scene);
        lines.parent = root;
        root.scaling.scaleInPlace(LightGizmo._Scale);
        root.rotation.x = Math.PI / 2;
        return root;
    };
    LightGizmo._CreateDirectionalLightMesh = function (scene) {
        var root = new Mesh("directionalLight", scene);
        var mesh = new Mesh(root.name, scene);
        mesh.parent = root;
        var sphere = CreateSphere(root.name, { diameter: 1.2, segments: 10 }, scene);
        sphere.parent = mesh;
        var line = CreateCylinder(root.name, {
            updatable: false,
            height: 6,
            diameterTop: 0.3,
            diameterBottom: 0.3,
            tessellation: 6,
            subdivisions: 1,
        }, scene);
        line.parent = mesh;
        var left = line.clone(root.name);
        left.scaling.y = 0.5;
        left.position.x += 1.25;
        var right = line.clone(root.name);
        right.scaling.y = 0.5;
        right.position.x += -1.25;
        var arrowHead = CreateCylinder(root.name, {
            updatable: false,
            height: 1,
            diameterTop: 0,
            diameterBottom: 0.6,
            tessellation: 6,
            subdivisions: 1,
        }, scene);
        arrowHead.position.y += 3;
        arrowHead.parent = mesh;
        left = arrowHead.clone(root.name);
        left.position.y = 1.5;
        left.position.x += 1.25;
        right = arrowHead.clone(root.name);
        right.position.y = 1.5;
        right.position.x += -1.25;
        mesh.scaling.scaleInPlace(LightGizmo._Scale);
        mesh.rotation.z = Math.PI / 2;
        mesh.rotation.y = Math.PI / 2;
        return root;
    };
    // Static helper methods
    LightGizmo._Scale = 0.007;
    /**
     * Creates the lines for a light mesh
     * @param levels
     * @param scene
     */
    LightGizmo._CreateLightLines = function (levels, scene) {
        var distFromSphere = 1.2;
        var root = new Mesh("root", scene);
        root.rotation.x = Math.PI / 2;
        // Create the top line, this will be cloned for all other lines
        var linePivot = new Mesh("linePivot", scene);
        linePivot.parent = root;
        var line = CreateCylinder("line", {
            updatable: false,
            height: 2,
            diameterTop: 0.2,
            diameterBottom: 0.3,
            tessellation: 6,
            subdivisions: 1,
        }, scene);
        line.position.y = line.scaling.y / 2 + distFromSphere;
        line.parent = linePivot;
        if (levels < 2) {
            return linePivot;
        }
        for (var i = 0; i < 4; i++) {
            var l_1 = linePivot.clone("lineParentClone");
            l_1.rotation.z = Math.PI / 4;
            l_1.rotation.y = Math.PI / 2 + (Math.PI / 2) * i;
            l_1.getChildMeshes()[0].scaling.y = 0.5;
            l_1.getChildMeshes()[0].scaling.x = l_1.getChildMeshes()[0].scaling.z = 0.8;
            l_1.getChildMeshes()[0].position.y = l_1.getChildMeshes()[0].scaling.y / 2 + distFromSphere;
        }
        if (levels < 3) {
            return root;
        }
        for (var i = 0; i < 4; i++) {
            var l_2 = linePivot.clone("linePivotClone");
            l_2.rotation.z = Math.PI / 2;
            l_2.rotation.y = (Math.PI / 2) * i;
        }
        if (levels < 4) {
            return root;
        }
        for (var i = 0; i < 4; i++) {
            var l_3 = linePivot.clone("linePivotClone");
            l_3.rotation.z = Math.PI + Math.PI / 4;
            l_3.rotation.y = Math.PI / 2 + (Math.PI / 2) * i;
            l_3.getChildMeshes()[0].scaling.y = 0.5;
            l_3.getChildMeshes()[0].scaling.x = l_3.getChildMeshes()[0].scaling.z = 0.8;
            l_3.getChildMeshes()[0].position.y = l_3.getChildMeshes()[0].scaling.y / 2 + distFromSphere;
        }
        if (levels < 5) {
            return root;
        }
        var l = linePivot.clone("linePivotClone");
        l.rotation.z = Math.PI;
        return root;
    };
    return LightGizmo;
}(Gizmo));
export { LightGizmo };
//# sourceMappingURL=lightGizmo.js.map