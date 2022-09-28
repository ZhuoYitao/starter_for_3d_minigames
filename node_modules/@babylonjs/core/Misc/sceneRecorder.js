import { SceneSerializer } from "./sceneSerializer.js";
import { Mesh } from "../Meshes/mesh.js";
import { Light } from "../Lights/light.js";
import { Camera } from "../Cameras/camera.js";
import { Skeleton } from "../Bones/skeleton.js";
import { Material } from "../Materials/material.js";
import { MultiMaterial } from "../Materials/multiMaterial.js";
import { TransformNode } from "../Meshes/transformNode.js";
import { ParticleSystem } from "../Particles/particleSystem.js";
import { MorphTargetManager } from "../Morph/morphTargetManager.js";
import { ShadowGenerator } from "../Lights/Shadows/shadowGenerator.js";
import { PostProcess } from "../PostProcesses/postProcess.js";
import { Texture } from "../Materials/Textures/texture.js";
import { SerializationHelper } from "./decorators.js";
/**
 * Class used to record delta files between 2 scene states
 */
var SceneRecorder = /** @class */ (function () {
    function SceneRecorder() {
        this._trackedScene = null;
    }
    /**
     * Track a given scene. This means the current scene state will be considered the original state
     * @param scene defines the scene to track
     */
    SceneRecorder.prototype.track = function (scene) {
        this._trackedScene = scene;
        SerializationHelper.AllowLoadingUniqueId = true;
        this._savedJSON = SceneSerializer.Serialize(scene);
        SerializationHelper.AllowLoadingUniqueId = false;
    };
    /**
     * Get the delta between current state and original state
     * @returns a any containing the delta
     */
    SceneRecorder.prototype.getDelta = function () {
        if (!this._trackedScene) {
            return null;
        }
        var currentForceSerializeBuffers = Texture.ForceSerializeBuffers;
        Texture.ForceSerializeBuffers = false;
        SerializationHelper.AllowLoadingUniqueId = true;
        var newJSON = SceneSerializer.Serialize(this._trackedScene);
        SerializationHelper.AllowLoadingUniqueId = false;
        var deltaJSON = {};
        for (var node in newJSON) {
            this._compareCollections(node, this._savedJSON[node], newJSON[node], deltaJSON);
        }
        Texture.ForceSerializeBuffers = currentForceSerializeBuffers;
        return deltaJSON;
    };
    SceneRecorder.prototype._compareArray = function (key, original, current, deltaJSON) {
        if (original.length === 0 && current.length === 0) {
            return true;
        }
        // Numbers?
        if ((original.length && !isNaN(original[0])) || (current.length && !isNaN(current[0]))) {
            if (original.length !== current.length) {
                return false;
            }
            if (original.length === 0) {
                return true;
            }
            for (var index = 0; index < original.length; index++) {
                if (original[index] !== current[index]) {
                    deltaJSON[key] = current;
                    return false;
                }
            }
            return true;
        }
        // let's use uniqueId to find similar objects
        var originalUniqueIds = [];
        var _loop_1 = function (index) {
            var originalObject = original[index];
            var originalUniqueId = originalObject.uniqueId;
            originalUniqueIds.push(originalUniqueId);
            // Look for that object in current state
            var currentObjects = current.filter(function (c) { return c.uniqueId === originalUniqueId; });
            if (currentObjects.length) {
                // We have a candidate
                var currentObject = currentObjects[0];
                var newObject = {};
                if (!this_1._compareObjects(originalObject, currentObject, newObject)) {
                    if (!deltaJSON[key]) {
                        deltaJSON[key] = [];
                    }
                    newObject.__state = {
                        id: currentObject.id || currentObject.name,
                    };
                    deltaJSON[key].push(newObject);
                }
            }
            else {
                // We need to delete
                var newObject = {
                    __state: {
                        deleteId: originalObject.id || originalObject.name,
                    },
                };
                deltaJSON[key].push(newObject);
            }
        };
        var this_1 = this;
        for (var index = 0; index < original.length; index++) {
            _loop_1(index);
        }
        // Checking for new objects
        for (var index = 0; index < current.length; index++) {
            var currentObject = current[index];
            var currentUniqueId = currentObject.uniqueId;
            // Object was added
            if (originalUniqueIds.indexOf(currentUniqueId) === -1) {
                if (!deltaJSON[key]) {
                    deltaJSON[key] = [];
                }
                deltaJSON[key].push(currentObject);
            }
        }
        return true;
    };
    SceneRecorder.prototype._compareObjects = function (originalObjet, currentObject, deltaJSON) {
        var aDifferenceWasFound = false;
        for (var prop in originalObjet) {
            if (!Object.prototype.hasOwnProperty.call(originalObjet, prop)) {
                continue;
            }
            var originalValue = originalObjet[prop];
            var currentValue = currentObject[prop];
            var diffFound = false;
            if (Array.isArray(originalValue)) {
                diffFound = JSON.stringify(originalValue) !== JSON.stringify(currentValue);
            }
            else if (!isNaN(originalValue) || Object.prototype.toString.call(originalValue) == "[object String]") {
                diffFound = originalValue !== currentValue;
            }
            else if (typeof originalValue === "object" && typeof currentValue === "object") {
                var newObject = {};
                if (!this._compareObjects(originalValue, currentValue, newObject)) {
                    deltaJSON[prop] = newObject;
                    aDifferenceWasFound = true;
                }
            }
            if (diffFound) {
                aDifferenceWasFound = true;
                deltaJSON[prop] = currentValue;
            }
        }
        return !aDifferenceWasFound;
    };
    SceneRecorder.prototype._compareCollections = function (key, original, current, deltaJSON) {
        // Same ?
        if (original === current) {
            return;
        }
        if (original && current) {
            // Array?
            if (Array.isArray(original) && Array.isArray(current)) {
                if (this._compareArray(key, original, current, deltaJSON)) {
                    return;
                }
            }
            else if (typeof original === "object" && typeof current === "object") {
                // Object
                var newObject = {};
                if (!this._compareObjects(original, current, newObject)) {
                    deltaJSON[key] = newObject;
                }
                return;
            }
        }
    };
    SceneRecorder.GetShadowGeneratorById = function (scene, id) {
        var generators = scene.lights.map(function (l) { return l.getShadowGenerator(); });
        for (var _i = 0, generators_1 = generators; _i < generators_1.length; _i++) {
            var generator = generators_1[_i];
            if (generator && generator.id === id) {
                return generator;
            }
        }
        return null;
    };
    /**
     * Apply a given delta to a given scene
     * @param deltaJSON defines the JSON containing the delta
     * @param scene defines the scene to apply the delta to
     */
    SceneRecorder.ApplyDelta = function (deltaJSON, scene) {
        var _this = this;
        if (typeof deltaJSON === "string") {
            deltaJSON = JSON.parse(deltaJSON);
        }
        // Scene
        var anyScene = scene;
        for (var prop in deltaJSON) {
            var source = deltaJSON[prop];
            var property = anyScene[prop];
            if (Array.isArray(property) || prop === "shadowGenerators") {
                // Restore array
                switch (prop) {
                    case "cameras":
                        this._ApplyDeltaForEntity(source, scene, scene.getCameraById.bind(scene), function (data) { return Camera.Parse(data, scene); });
                        break;
                    case "lights":
                        this._ApplyDeltaForEntity(source, scene, scene.getLightById.bind(scene), function (data) { return Light.Parse(data, scene); });
                        break;
                    case "shadowGenerators":
                        this._ApplyDeltaForEntity(source, scene, function (id) { return _this.GetShadowGeneratorById(scene, id); }, function (data) { return ShadowGenerator.Parse(data, scene); });
                        break;
                    case "meshes":
                        this._ApplyDeltaForEntity(source, scene, scene.getMeshById.bind(scene), function (data) { return Mesh.Parse(data, scene, ""); });
                        break;
                    case "skeletons":
                        this._ApplyDeltaForEntity(source, scene, scene.getSkeletonById.bind(scene), function (data) { return Skeleton.Parse(data, scene); });
                        break;
                    case "materials":
                        this._ApplyDeltaForEntity(source, scene, scene.getMaterialById.bind(scene), function (data) { return Material.Parse(data, scene, ""); });
                        break;
                    case "multiMaterials":
                        this._ApplyDeltaForEntity(source, scene, scene.getMaterialById.bind(scene), function (data) { return MultiMaterial.Parse(data, scene, ""); });
                        break;
                    case "transformNodes":
                        this._ApplyDeltaForEntity(source, scene, scene.getTransformNodeById.bind(scene), function (data) { return TransformNode.Parse(data, scene, ""); });
                        break;
                    case "particleSystems":
                        this._ApplyDeltaForEntity(source, scene, scene.getParticleSystemById.bind(scene), function (data) { return ParticleSystem.Parse(data, scene, ""); });
                        break;
                    case "morphTargetManagers":
                        this._ApplyDeltaForEntity(source, scene, scene.getMorphTargetById.bind(scene), function (data) { return MorphTargetManager.Parse(data, scene); });
                        break;
                    case "postProcesses":
                        this._ApplyDeltaForEntity(source, scene, scene.getPostProcessByName.bind(scene), function (data) { return PostProcess.Parse(data, scene, ""); });
                        break;
                }
            }
            else if (!isNaN(property)) {
                anyScene[prop] = source;
            }
            else if (property.fromArray) {
                property.fromArray(source);
            }
        }
    };
    SceneRecorder._ApplyPropertiesToEntity = function (deltaJSON, entity) {
        for (var prop in deltaJSON) {
            var source = deltaJSON[prop];
            var property = entity[prop];
            if (property === undefined) {
                continue;
            }
            if (!isNaN(property) || Array.isArray(property)) {
                entity[prop] = source;
            }
            else if (property.fromArray) {
                property.fromArray(source);
            }
            else if (typeof property === "object" && property !== null) {
                this._ApplyPropertiesToEntity(source, property);
            }
        }
    };
    SceneRecorder._ApplyDeltaForEntity = function (sources, scene, finder, addNew) {
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            // Update
            if (source.__state && source.__state.id !== undefined) {
                var targetEntity = finder(source.__state.id);
                if (targetEntity) {
                    this._ApplyPropertiesToEntity(source, targetEntity);
                }
            }
            else if (source.__state && source.__state.deleteId !== undefined) {
                var target = finder(source.__state.deleteId);
                target === null || target === void 0 ? void 0 : target.dispose();
            }
            else {
                // New
                addNew(source);
            }
        }
    };
    return SceneRecorder;
}());
export { SceneRecorder };
//# sourceMappingURL=sceneRecorder.js.map