import { __extends } from "tslib";
import { Matrix } from "../Maths/math.vector.js";
import { Material } from "../Materials/material.js";
/**
 * Base class of materials working in push mode in babylon JS
 * @hidden
 */
var PushMaterial = /** @class */ (function (_super) {
    __extends(PushMaterial, _super);
    function PushMaterial(name, scene, storeEffectOnSubMeshes) {
        if (storeEffectOnSubMeshes === void 0) { storeEffectOnSubMeshes = true; }
        var _this = _super.call(this, name, scene) || this;
        _this._normalMatrix = new Matrix();
        _this._storeEffectOnSubMeshes = storeEffectOnSubMeshes;
        return _this;
    }
    PushMaterial.prototype.getEffect = function () {
        return this._storeEffectOnSubMeshes ? this._activeEffect : _super.prototype.getEffect.call(this);
    };
    PushMaterial.prototype.isReady = function (mesh, useInstances) {
        if (!mesh) {
            return false;
        }
        if (!this._storeEffectOnSubMeshes) {
            return true;
        }
        if (!mesh.subMeshes || mesh.subMeshes.length === 0) {
            return true;
        }
        return this.isReadyForSubMesh(mesh, mesh.subMeshes[0], useInstances);
    };
    PushMaterial.prototype._isReadyForSubMesh = function (subMesh) {
        var defines = subMesh.materialDefines;
        if (!this.checkReadyOnEveryCall && subMesh.effect && defines) {
            if (defines._renderId === this.getScene().getRenderId()) {
                return true;
            }
        }
        return false;
    };
    /**
     * Binds the given world matrix to the active effect
     *
     * @param world the matrix to bind
     */
    PushMaterial.prototype.bindOnlyWorldMatrix = function (world) {
        this._activeEffect.setMatrix("world", world);
    };
    /**
     * Binds the given normal matrix to the active effect
     *
     * @param normalMatrix the matrix to bind
     */
    PushMaterial.prototype.bindOnlyNormalMatrix = function (normalMatrix) {
        this._activeEffect.setMatrix("normalMatrix", normalMatrix);
    };
    PushMaterial.prototype.bind = function (world, mesh) {
        if (!mesh) {
            return;
        }
        this.bindForSubMesh(world, mesh, mesh.subMeshes[0]);
    };
    PushMaterial.prototype._afterBind = function (mesh, effect) {
        if (effect === void 0) { effect = null; }
        _super.prototype._afterBind.call(this, mesh, effect);
        this.getScene()._cachedEffect = effect;
    };
    PushMaterial.prototype._mustRebind = function (scene, effect, visibility) {
        if (visibility === void 0) { visibility = 1; }
        return scene.isCachedMaterialInvalid(this, effect, visibility);
    };
    return PushMaterial;
}(Material));
export { PushMaterial };
//# sourceMappingURL=pushMaterial.js.map