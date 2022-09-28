import { Mesh } from "../Meshes/mesh.js";

import { MultiMaterial } from "../Materials/multiMaterial.js";
import { SerializationHelper } from "./decorators.js";
import { Texture } from "../Materials/Textures/texture.js";
var serializedGeometries = [];
var SerializeGeometry = function (geometry, serializationGeometries) {
    if (geometry.doNotSerialize) {
        return;
    }
    serializationGeometries.vertexData.push(geometry.serializeVerticeData());
    serializedGeometries[geometry.id] = true;
};
var SerializeMesh = function (mesh, serializationScene) {
    var serializationObject = {};
    // Geometry
    var geometry = mesh._geometry;
    if (geometry) {
        if (!mesh.getScene().getGeometryById(geometry.id)) {
            // Geometry was in the memory but not added to the scene, nevertheless it's better to serialize to be able to reload the mesh with its geometry
            SerializeGeometry(geometry, serializationScene.geometries);
        }
    }
    // Custom
    if (mesh.serialize) {
        mesh.serialize(serializationObject);
    }
    return serializationObject;
};
var FinalizeSingleMesh = function (mesh, serializationObject) {
    //only works if the mesh is already loaded
    if (mesh.delayLoadState === 1 || mesh.delayLoadState === 0) {
        var serializeMaterial = function (material) {
            serializationObject.materials = serializationObject.materials || [];
            if (!serializationObject.materials.some(function (mat) { return mat.id === mesh.material.id; })) {
                serializationObject.materials.push(material.serialize());
            }
        };
        //serialize material
        if (mesh.material && !mesh.material.doNotSerialize) {
            if (mesh.material instanceof MultiMaterial) {
                serializationObject.multiMaterials = serializationObject.multiMaterials || [];
                if (!serializationObject.multiMaterials.some(function (mat) { return mat.id === mesh.material.id; })) {
                    serializationObject.multiMaterials.push(mesh.material.serialize());
                    for (var _i = 0, _a = mesh.material.subMaterials; _i < _a.length; _i++) {
                        var submaterial = _a[_i];
                        if (submaterial) {
                            serializeMaterial(submaterial);
                        }
                    }
                }
            }
            else {
                serializeMaterial(mesh.material);
            }
        }
        else if (!mesh.material) {
            serializeMaterial(mesh.getScene().defaultMaterial);
        }
        //serialize geometry
        var geometry = mesh._geometry;
        if (geometry) {
            if (!serializationObject.geometries) {
                serializationObject.geometries = {};
                serializationObject.geometries.boxes = [];
                serializationObject.geometries.spheres = [];
                serializationObject.geometries.cylinders = [];
                serializationObject.geometries.toruses = [];
                serializationObject.geometries.grounds = [];
                serializationObject.geometries.planes = [];
                serializationObject.geometries.torusKnots = [];
                serializationObject.geometries.vertexData = [];
            }
            SerializeGeometry(geometry, serializationObject.geometries);
        }
        // Skeletons
        if (mesh.skeleton && !mesh.skeleton.doNotSerialize) {
            serializationObject.skeletons = serializationObject.skeletons || [];
            serializationObject.skeletons.push(mesh.skeleton.serialize());
        }
        //serialize the actual mesh
        serializationObject.meshes = serializationObject.meshes || [];
        serializationObject.meshes.push(SerializeMesh(mesh, serializationObject));
    }
};
/**
 * Class used to serialize a scene into a string
 */
var SceneSerializer = /** @class */ (function () {
    function SceneSerializer() {
    }
    /**
     * Clear cache used by a previous serialization
     */
    SceneSerializer.ClearCache = function () {
        serializedGeometries = [];
    };
    /**
     * Serialize a scene into a JSON compatible object
     * Note that if the current engine does not support synchronous texture reading (like WebGPU), you should use SerializeAsync instead
     * as else you may not retrieve the proper base64 encoded texture data (when using the Texture.ForceSerializeBuffers flag)
     * @param scene defines the scene to serialize
     * @returns a JSON compatible object
     */
    SceneSerializer.Serialize = function (scene) {
        return SceneSerializer._Serialize(scene);
    };
    SceneSerializer._Serialize = function (scene, checkSyncReadSupported) {
        if (checkSyncReadSupported === void 0) { checkSyncReadSupported = true; }
        var serializationObject = {};
        if (checkSyncReadSupported && !scene.getEngine()._features.supportSyncTextureRead && Texture.ForceSerializeBuffers) {
            console.warn("The serialization object may not contain the proper base64 encoded texture data! You should use the SerializeAsync method instead.");
        }
        SceneSerializer.ClearCache();
        // Scene
        serializationObject.useDelayedTextureLoading = scene.useDelayedTextureLoading;
        serializationObject.autoClear = scene.autoClear;
        serializationObject.clearColor = scene.clearColor.asArray();
        serializationObject.ambientColor = scene.ambientColor.asArray();
        serializationObject.gravity = scene.gravity.asArray();
        serializationObject.collisionsEnabled = scene.collisionsEnabled;
        serializationObject.useRightHandedSystem = scene.useRightHandedSystem;
        // Fog
        if (scene.fogMode && scene.fogMode !== 0) {
            serializationObject.fogMode = scene.fogMode;
            serializationObject.fogColor = scene.fogColor.asArray();
            serializationObject.fogStart = scene.fogStart;
            serializationObject.fogEnd = scene.fogEnd;
            serializationObject.fogDensity = scene.fogDensity;
        }
        //Physics
        if (scene.isPhysicsEnabled()) {
            var physicEngine = scene.getPhysicsEngine();
            if (physicEngine) {
                serializationObject.physicsEnabled = true;
                serializationObject.physicsGravity = physicEngine.gravity.asArray();
                serializationObject.physicsEngine = physicEngine.getPhysicsPluginName();
            }
        }
        // Metadata
        if (scene.metadata) {
            serializationObject.metadata = scene.metadata;
        }
        // Morph targets
        serializationObject.morphTargetManagers = [];
        for (var _i = 0, _a = scene.meshes; _i < _a.length; _i++) {
            var abstractMesh = _a[_i];
            var manager = abstractMesh.morphTargetManager;
            if (manager) {
                serializationObject.morphTargetManagers.push(manager.serialize());
            }
        }
        // Lights
        serializationObject.lights = [];
        var index;
        var light;
        for (index = 0; index < scene.lights.length; index++) {
            light = scene.lights[index];
            if (!light.doNotSerialize) {
                serializationObject.lights.push(light.serialize());
            }
        }
        // Cameras
        serializationObject.cameras = [];
        for (index = 0; index < scene.cameras.length; index++) {
            var camera = scene.cameras[index];
            if (!camera.doNotSerialize) {
                serializationObject.cameras.push(camera.serialize());
            }
        }
        if (scene.activeCamera) {
            serializationObject.activeCameraID = scene.activeCamera.id;
        }
        // Animations
        SerializationHelper.AppendSerializedAnimations(scene, serializationObject);
        // Animation Groups
        if (scene.animationGroups && scene.animationGroups.length > 0) {
            serializationObject.animationGroups = [];
            for (var animationGroupIndex = 0; animationGroupIndex < scene.animationGroups.length; animationGroupIndex++) {
                var animationGroup = scene.animationGroups[animationGroupIndex];
                serializationObject.animationGroups.push(animationGroup.serialize());
            }
        }
        // Reflection probes
        if (scene.reflectionProbes && scene.reflectionProbes.length > 0) {
            serializationObject.reflectionProbes = [];
            for (index = 0; index < scene.reflectionProbes.length; index++) {
                var reflectionProbe = scene.reflectionProbes[index];
                serializationObject.reflectionProbes.push(reflectionProbe.serialize());
            }
        }
        // Materials
        serializationObject.materials = [];
        serializationObject.multiMaterials = [];
        var material;
        for (index = 0; index < scene.materials.length; index++) {
            material = scene.materials[index];
            if (!material.doNotSerialize) {
                serializationObject.materials.push(material.serialize());
            }
        }
        // MultiMaterials
        serializationObject.multiMaterials = [];
        for (index = 0; index < scene.multiMaterials.length; index++) {
            var multiMaterial = scene.multiMaterials[index];
            serializationObject.multiMaterials.push(multiMaterial.serialize());
        }
        // Environment texture
        if (scene.environmentTexture) {
            serializationObject.environmentTexture = scene.environmentTexture.name;
            serializationObject.environmentTextureRotationY = scene.environmentTexture.rotationY;
        }
        // Environment Intensity
        serializationObject.environmentIntensity = scene.environmentIntensity;
        // Skeletons
        serializationObject.skeletons = [];
        for (index = 0; index < scene.skeletons.length; index++) {
            var skeleton = scene.skeletons[index];
            if (!skeleton.doNotSerialize) {
                serializationObject.skeletons.push(skeleton.serialize());
            }
        }
        // Transform nodes
        serializationObject.transformNodes = [];
        for (index = 0; index < scene.transformNodes.length; index++) {
            if (!scene.transformNodes[index].doNotSerialize) {
                serializationObject.transformNodes.push(scene.transformNodes[index].serialize());
            }
        }
        // Geometries
        serializationObject.geometries = {};
        serializationObject.geometries.boxes = [];
        serializationObject.geometries.spheres = [];
        serializationObject.geometries.cylinders = [];
        serializationObject.geometries.toruses = [];
        serializationObject.geometries.grounds = [];
        serializationObject.geometries.planes = [];
        serializationObject.geometries.torusKnots = [];
        serializationObject.geometries.vertexData = [];
        serializedGeometries = [];
        var geometries = scene.getGeometries();
        for (index = 0; index < geometries.length; index++) {
            var geometry = geometries[index];
            if (geometry.isReady()) {
                SerializeGeometry(geometry, serializationObject.geometries);
            }
        }
        // Meshes
        serializationObject.meshes = [];
        for (index = 0; index < scene.meshes.length; index++) {
            var abstractMesh = scene.meshes[index];
            if (abstractMesh instanceof Mesh) {
                var mesh = abstractMesh;
                if (!mesh.doNotSerialize) {
                    if (mesh.delayLoadState === 1 || mesh.delayLoadState === 0) {
                        serializationObject.meshes.push(SerializeMesh(mesh, serializationObject));
                    }
                }
            }
        }
        // Particles Systems
        serializationObject.particleSystems = [];
        for (index = 0; index < scene.particleSystems.length; index++) {
            serializationObject.particleSystems.push(scene.particleSystems[index].serialize(false));
        }
        // Post processes
        serializationObject.postProcesses = [];
        for (index = 0; index < scene.postProcesses.length; index++) {
            serializationObject.postProcesses.push(scene.postProcesses[index].serialize());
        }
        // Action Manager
        if (scene.actionManager) {
            serializationObject.actions = scene.actionManager.serialize("scene");
        }
        // Components
        for (var _b = 0, _c = scene._serializableComponents; _b < _c.length; _b++) {
            var component = _c[_b];
            component.serialize(serializationObject);
        }
        return serializationObject;
    };
    /**
     * Serialize a scene into a JSON compatible object
     * @param scene defines the scene to serialize
     * @returns a JSON promise compatible object
     */
    SceneSerializer.SerializeAsync = function (scene) {
        var serializationObject = SceneSerializer._Serialize(scene, false);
        var promises = [];
        this._CollectPromises(serializationObject, promises);
        return Promise.all(promises).then(function () { return serializationObject; });
    };
    SceneSerializer._CollectPromises = function (obj, promises) {
        if (Array.isArray(obj)) {
            var _loop_1 = function (i) {
                var o = obj[i];
                if (o instanceof Promise) {
                    promises.push(o.then(function (res) { return (obj[i] = res); }));
                }
                else if (o instanceof Object || Array.isArray(o)) {
                    this_1._CollectPromises(o, promises);
                }
            };
            var this_1 = this;
            for (var i = 0; i < obj.length; ++i) {
                _loop_1(i);
            }
        }
        else if (obj instanceof Object) {
            var _loop_2 = function (name_1) {
                if (Object.prototype.hasOwnProperty.call(obj, name_1)) {
                    var o = obj[name_1];
                    if (o instanceof Promise) {
                        promises.push(o.then(function (res) { return (obj[name_1] = res); }));
                    }
                    else if (o instanceof Object || Array.isArray(o)) {
                        this_2._CollectPromises(o, promises);
                    }
                }
            };
            var this_2 = this;
            for (var name_1 in obj) {
                _loop_2(name_1);
            }
        }
    };
    /**
     * Serialize a mesh into a JSON compatible object
     * @param toSerialize defines the mesh to serialize
     * @param withParents defines if parents must be serialized as well
     * @param withChildren defines if children must be serialized as well
     * @returns a JSON compatible object
     */
    SceneSerializer.SerializeMesh = function (toSerialize /* Mesh || Mesh[] */, withParents, withChildren) {
        if (withParents === void 0) { withParents = false; }
        if (withChildren === void 0) { withChildren = false; }
        var serializationObject = {};
        SceneSerializer.ClearCache();
        toSerialize = toSerialize instanceof Array ? toSerialize : [toSerialize];
        if (withParents || withChildren) {
            //deliberate for loop! not for each, appended should be processed as well.
            for (var i = 0; i < toSerialize.length; ++i) {
                if (withChildren) {
                    toSerialize[i].getDescendants().forEach(function (node) {
                        if (node instanceof Mesh && toSerialize.indexOf(node) < 0 && !node.doNotSerialize) {
                            toSerialize.push(node);
                        }
                    });
                }
                //make sure the array doesn't contain the object already
                if (withParents && toSerialize[i].parent && toSerialize.indexOf(toSerialize[i].parent) < 0 && !toSerialize[i].parent.doNotSerialize) {
                    toSerialize.push(toSerialize[i].parent);
                }
            }
        }
        toSerialize.forEach(function (mesh) {
            FinalizeSingleMesh(mesh, serializationObject);
        });
        return serializationObject;
    };
    return SceneSerializer;
}());
export { SceneSerializer };
//# sourceMappingURL=sceneSerializer.js.map