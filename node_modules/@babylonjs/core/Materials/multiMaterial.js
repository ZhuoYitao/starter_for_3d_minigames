import { __extends } from "tslib";
import { Material } from "../Materials/material.js";
import { Tags } from "../Misc/tags.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * A multi-material is used to apply different materials to different parts of the same object without the need of
 * separate meshes. This can be use to improve performances.
 * @see https://doc.babylonjs.com/how_to/multi_materials
 */
var MultiMaterial = /** @class */ (function (_super) {
    __extends(MultiMaterial, _super);
    /**
     * Instantiates a new Multi Material
     * A multi-material is used to apply different materials to different parts of the same object without the need of
     * separate meshes. This can be use to improve performances.
     * @see https://doc.babylonjs.com/how_to/multi_materials
     * @param name Define the name in the scene
     * @param scene Define the scene the material belongs to
     */
    function MultiMaterial(name, scene) {
        var _this = _super.call(this, name, scene, true) || this;
        /** @hidden */
        _this._waitingSubMaterialsUniqueIds = [];
        _this.getScene().multiMaterials.push(_this);
        _this.subMaterials = new Array();
        _this._storeEffectOnSubMeshes = true; // multimaterial is considered like a push material
        return _this;
    }
    Object.defineProperty(MultiMaterial.prototype, "subMaterials", {
        /**
         * Gets or Sets the list of Materials used within the multi material.
         * They need to be ordered according to the submeshes order in the associated mesh
         */
        get: function () {
            return this._subMaterials;
        },
        set: function (value) {
            this._subMaterials = value;
            this._hookArray(value);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Function used to align with Node.getChildren()
     * @returns the list of Materials used within the multi material
     */
    MultiMaterial.prototype.getChildren = function () {
        return this.subMaterials;
    };
    MultiMaterial.prototype._hookArray = function (array) {
        var _this = this;
        var oldPush = array.push;
        array.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var result = oldPush.apply(array, items);
            _this._markAllSubMeshesAsTexturesDirty();
            return result;
        };
        var oldSplice = array.splice;
        array.splice = function (index, deleteCount) {
            var deleted = oldSplice.apply(array, [index, deleteCount]);
            _this._markAllSubMeshesAsTexturesDirty();
            return deleted;
        };
    };
    /**
     * Get one of the submaterial by its index in the submaterials array
     * @param index The index to look the sub material at
     * @returns The Material if the index has been defined
     */
    MultiMaterial.prototype.getSubMaterial = function (index) {
        if (index < 0 || index >= this.subMaterials.length) {
            return this.getScene().defaultMaterial;
        }
        return this.subMaterials[index];
    };
    /**
     * Get the list of active textures for the whole sub materials list.
     * @returns All the textures that will be used during the rendering
     */
    MultiMaterial.prototype.getActiveTextures = function () {
        var _a;
        return (_a = _super.prototype.getActiveTextures.call(this)).concat.apply(_a, this.subMaterials.map(function (subMaterial) {
            if (subMaterial) {
                return subMaterial.getActiveTextures();
            }
            else {
                return [];
            }
        }));
    };
    /**
     * Specifies if any sub-materials of this multi-material use a given texture.
     * @param texture Defines the texture to check against this multi-material's sub-materials.
     * @returns A boolean specifying if any sub-material of this multi-material uses the texture.
     */
    MultiMaterial.prototype.hasTexture = function (texture) {
        var _a;
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        for (var i = 0; i < this.subMaterials.length; i++) {
            if ((_a = this.subMaterials[i]) === null || _a === void 0 ? void 0 : _a.hasTexture(texture)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Gets the current class name of the material e.g. "MultiMaterial"
     * Mainly use in serialization.
     * @returns the class name
     */
    MultiMaterial.prototype.getClassName = function () {
        return "MultiMaterial";
    };
    /**
     * Checks if the material is ready to render the requested sub mesh
     * @param mesh Define the mesh the submesh belongs to
     * @param subMesh Define the sub mesh to look readiness for
     * @param useInstances Define whether or not the material is used with instances
     * @returns true if ready, otherwise false
     */
    MultiMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        for (var index = 0; index < this.subMaterials.length; index++) {
            var subMaterial = this.subMaterials[index];
            if (subMaterial) {
                if (subMaterial._storeEffectOnSubMeshes) {
                    if (!subMaterial.isReadyForSubMesh(mesh, subMesh, useInstances)) {
                        return false;
                    }
                    continue;
                }
                if (!subMaterial.isReady(mesh)) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Clones the current material and its related sub materials
     * @param name Define the name of the newly cloned material
     * @param cloneChildren Define if submaterial will be cloned or shared with the parent instance
     * @returns the cloned material
     */
    MultiMaterial.prototype.clone = function (name, cloneChildren) {
        var newMultiMaterial = new MultiMaterial(name, this.getScene());
        for (var index = 0; index < this.subMaterials.length; index++) {
            var subMaterial = null;
            var current = this.subMaterials[index];
            if (cloneChildren && current) {
                subMaterial = current.clone(name + "-" + current.name);
            }
            else {
                subMaterial = this.subMaterials[index];
            }
            newMultiMaterial.subMaterials.push(subMaterial);
        }
        return newMultiMaterial;
    };
    /**
     * Serializes the materials into a JSON representation.
     * @returns the JSON representation
     */
    MultiMaterial.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.id = this.id;
        serializationObject.uniqueId = this.uniqueId;
        if (Tags) {
            serializationObject.tags = Tags.GetTags(this);
        }
        serializationObject.materialsUniqueIds = [];
        serializationObject.materials = [];
        for (var matIndex = 0; matIndex < this.subMaterials.length; matIndex++) {
            var subMat = this.subMaterials[matIndex];
            if (subMat) {
                serializationObject.materialsUniqueIds.push(subMat.uniqueId);
                serializationObject.materials.push(subMat.id);
            }
            else {
                serializationObject.materialsUniqueIds.push(null);
                serializationObject.materials.push(null);
            }
        }
        return serializationObject;
    };
    /**
     * Dispose the material and release its associated resources
     * @param forceDisposeEffect Define if we want to force disposing the associated effect (if false the shader is not released and could be reuse later on)
     * @param forceDisposeTextures Define if we want to force disposing the associated textures (if false, they will not be disposed and can still be use elsewhere in the app)
     * @param forceDisposeChildren Define if we want to force disposing the associated submaterials (if false, they will not be disposed and can still be use elsewhere in the app)
     */
    MultiMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures, forceDisposeChildren) {
        var scene = this.getScene();
        if (!scene) {
            return;
        }
        if (forceDisposeChildren) {
            for (var index_1 = 0; index_1 < this.subMaterials.length; index_1++) {
                var subMaterial = this.subMaterials[index_1];
                if (subMaterial) {
                    subMaterial.dispose(forceDisposeEffect, forceDisposeTextures);
                }
            }
        }
        var index = scene.multiMaterials.indexOf(this);
        if (index >= 0) {
            scene.multiMaterials.splice(index, 1);
        }
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures);
    };
    /**
     * Creates a MultiMaterial from parsed MultiMaterial data.
     * @param parsedMultiMaterial defines parsed MultiMaterial data.
     * @param scene defines the hosting scene
     * @returns a new MultiMaterial
     */
    MultiMaterial.ParseMultiMaterial = function (parsedMultiMaterial, scene) {
        var multiMaterial = new MultiMaterial(parsedMultiMaterial.name, scene);
        multiMaterial.id = parsedMultiMaterial.id;
        multiMaterial._loadedUniqueId = parsedMultiMaterial.uniqueId;
        if (Tags) {
            Tags.AddTagsTo(multiMaterial, parsedMultiMaterial.tags);
        }
        if (parsedMultiMaterial.materialsUniqueIds) {
            multiMaterial._waitingSubMaterialsUniqueIds = parsedMultiMaterial.materialsUniqueIds;
        }
        else {
            parsedMultiMaterial.materials.forEach(function (subMatId) { return multiMaterial.subMaterials.push(scene.getLastMaterialById(subMatId)); });
        }
        return multiMaterial;
    };
    return MultiMaterial;
}(Material));
export { MultiMaterial };
RegisterClass("BABYLON.MultiMaterial", MultiMaterial);
//# sourceMappingURL=multiMaterial.js.map