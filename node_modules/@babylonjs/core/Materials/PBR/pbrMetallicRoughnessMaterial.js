import { __decorate, __extends } from "tslib";
import { serialize, SerializationHelper, serializeAsColor3, expandToProperty, serializeAsTexture } from "../../Misc/decorators.js";
import { PBRBaseSimpleMaterial } from "./pbrBaseSimpleMaterial.js";
import { RegisterClass } from "../../Misc/typeStore.js";
/**
 * The PBR material of BJS following the metal roughness convention.
 *
 * This fits to the PBR convention in the GLTF definition:
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
 */
var PBRMetallicRoughnessMaterial = /** @class */ (function (_super) {
    __extends(PBRMetallicRoughnessMaterial, _super);
    /**
     * Instantiates a new PBRMetalRoughnessMaterial instance.
     *
     * @param name The material name
     * @param scene The scene the material will be use in.
     */
    function PBRMetallicRoughnessMaterial(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._useRoughnessFromMetallicTextureAlpha = false;
        _this._useRoughnessFromMetallicTextureGreen = true;
        _this._useMetallnessFromMetallicTextureBlue = true;
        _this.metallic = 1.0;
        _this.roughness = 1.0;
        return _this;
    }
    /**
     * Return the current class name of the material.
     */
    PBRMetallicRoughnessMaterial.prototype.getClassName = function () {
        return "PBRMetallicRoughnessMaterial";
    };
    /**
     * Makes a duplicate of the current material.
     * @param name - name to use for the new material.
     */
    PBRMetallicRoughnessMaterial.prototype.clone = function (name) {
        var _this = this;
        var clone = SerializationHelper.Clone(function () { return new PBRMetallicRoughnessMaterial(name, _this.getScene()); }, this);
        clone.id = name;
        clone.name = name;
        this.clearCoat.copyTo(clone.clearCoat);
        this.anisotropy.copyTo(clone.anisotropy);
        this.brdf.copyTo(clone.brdf);
        this.sheen.copyTo(clone.sheen);
        this.subSurface.copyTo(clone.subSurface);
        return clone;
    };
    /**
     * Serialize the material to a parsable JSON object.
     */
    PBRMetallicRoughnessMaterial.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.PBRMetallicRoughnessMaterial";
        serializationObject.clearCoat = this.clearCoat.serialize();
        serializationObject.anisotropy = this.anisotropy.serialize();
        serializationObject.brdf = this.brdf.serialize();
        serializationObject.sheen = this.sheen.serialize();
        serializationObject.subSurface = this.subSurface.serialize();
        return serializationObject;
    };
    /**
     * Parses a JSON object corresponding to the serialize function.
     * @param source
     * @param scene
     * @param rootUrl
     */
    PBRMetallicRoughnessMaterial.Parse = function (source, scene, rootUrl) {
        var material = SerializationHelper.Parse(function () { return new PBRMetallicRoughnessMaterial(source.name, scene); }, source, scene, rootUrl);
        if (source.clearCoat) {
            material.clearCoat.parse(source.clearCoat, scene, rootUrl);
        }
        if (source.anisotropy) {
            material.anisotropy.parse(source.anisotropy, scene, rootUrl);
        }
        if (source.brdf) {
            material.brdf.parse(source.brdf, scene, rootUrl);
        }
        if (source.sheen) {
            material.sheen.parse(source.sheen, scene, rootUrl);
        }
        if (source.subSurface) {
            material.subSurface.parse(source.subSurface, scene, rootUrl);
        }
        return material;
    };
    __decorate([
        serializeAsColor3(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty", "_albedoColor")
    ], PBRMetallicRoughnessMaterial.prototype, "baseColor", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty", "_albedoTexture")
    ], PBRMetallicRoughnessMaterial.prototype, "baseTexture", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMetallicRoughnessMaterial.prototype, "metallic", void 0);
    __decorate([
        serialize(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], PBRMetallicRoughnessMaterial.prototype, "roughness", void 0);
    __decorate([
        serializeAsTexture(),
        expandToProperty("_markAllSubMeshesAsTexturesDirty", "_metallicTexture")
    ], PBRMetallicRoughnessMaterial.prototype, "metallicRoughnessTexture", void 0);
    return PBRMetallicRoughnessMaterial;
}(PBRBaseSimpleMaterial));
export { PBRMetallicRoughnessMaterial };
RegisterClass("BABYLON.PBRMetallicRoughnessMaterial", PBRMetallicRoughnessMaterial);
//# sourceMappingURL=pbrMetallicRoughnessMaterial.js.map