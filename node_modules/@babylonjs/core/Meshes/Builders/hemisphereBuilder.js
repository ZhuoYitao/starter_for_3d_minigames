import { Mesh } from "../mesh.js";
import { CreateSphere } from "../Builders/sphereBuilder.js";
import { CreateDisc } from "./discBuilder.js";
/**
 * Creates a hemisphere mesh
 * @param name defines the name of the mesh
 * @param options defines the options used to create the mesh
 * @param options.segments
 * @param options.diameter
 * @param options.sideOrientation
 * @param scene defines the hosting scene
 * @returns the hemisphere mesh
 */
export function CreateHemisphere(name, options, scene) {
    if (options === void 0) { options = {}; }
    if (!options.diameter) {
        options.diameter = 1;
    }
    if (!options.segments) {
        options.segments = 16;
    }
    var halfSphere = CreateSphere("", { slice: 0.5, diameter: options.diameter, segments: options.segments }, scene);
    var disc = CreateDisc("", { radius: options.diameter / 2, tessellation: options.segments * 3 + (4 - options.segments) }, scene);
    disc.rotation.x = -Math.PI / 2;
    disc.parent = halfSphere;
    var merged = Mesh.MergeMeshes([disc, halfSphere], true);
    merged.name = name;
    return merged;
}
/**
 * Class containing static functions to help procedurally build meshes
 * @deprecated use the function directly from the module
 */
export var HemisphereBuilder = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateHemisphere: CreateHemisphere,
};
/**
 * Creates a hemispheric light
 * @param name
 * @param segments
 * @param diameter
 * @param scene
 */
Mesh.CreateHemisphere = function (name, segments, diameter, scene) {
    var options = {
        segments: segments,
        diameter: diameter,
    };
    return CreateHemisphere(name, options, scene);
};
//# sourceMappingURL=hemisphereBuilder.js.map