import { Vector3 } from "../../Maths/math.vector.js";
import { Color4 } from "../../Maths/math.color.js";
import { Mesh } from "../../Meshes/mesh.js";
import { VertexData } from "../mesh.vertexData.js";
import { Logger } from "../../Misc/logger.js";
import { _PrimaryIsoTriangle, GeodesicData } from "../geodesicMesh.js";
import { GoldbergMesh } from "../goldbergMesh.js";
import { CompatibilityOptions } from "../../Compat/compatibilityOptions.js";
/**
 * Creates the Mesh for a Goldberg Polyhedron
 * @param options an object used to set the following optional parameters for the polyhedron, required but can be empty
 * @param goldbergData polyhedronData defining the Goldberg polyhedron
 * @returns GoldbergSphere mesh
 */
export function CreateGoldbergVertexData(options, goldbergData) {
    var size = options.size;
    var sizeX = options.sizeX || size || 1;
    var sizeY = options.sizeY || size || 1;
    var sizeZ = options.sizeZ || size || 1;
    var sideOrientation = options.sideOrientation === 0 ? 0 : options.sideOrientation || VertexData.DEFAULTSIDE;
    var positions = new Array();
    var indices = new Array();
    var normals = new Array();
    var uvs = new Array();
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var v = 0; v < goldbergData.vertex.length; v++) {
        minX = Math.min(minX, goldbergData.vertex[v][0] * sizeX);
        maxX = Math.max(maxX, goldbergData.vertex[v][0] * sizeX);
        minY = Math.min(minY, goldbergData.vertex[v][1] * sizeY);
        maxY = Math.max(maxY, goldbergData.vertex[v][1] * sizeY);
    }
    var index = 0;
    for (var f = 0; f < goldbergData.face.length; f++) {
        var verts = goldbergData.face[f];
        var a = Vector3.FromArray(goldbergData.vertex[verts[0]]);
        var b = Vector3.FromArray(goldbergData.vertex[verts[2]]);
        var c = Vector3.FromArray(goldbergData.vertex[verts[1]]);
        var ba = b.subtract(a);
        var ca = c.subtract(a);
        var norm = Vector3.Cross(ca, ba).normalize();
        for (var v = 0; v < verts.length; v++) {
            normals.push(norm.x, norm.y, norm.z);
            var pdata = goldbergData.vertex[verts[v]];
            positions.push(pdata[0] * sizeX, pdata[1] * sizeY, pdata[2] * sizeZ);
            var vCoord = (pdata[1] * sizeY - minY) / (maxY - minY);
            uvs.push((pdata[0] * sizeX - minX) / (maxX - minX), CompatibilityOptions.UseOpenGLOrientationForUV ? 1 - vCoord : vCoord);
        }
        for (var v = 0; v < verts.length - 2; v++) {
            indices.push(index, index + v + 2, index + v + 1);
        }
        index += verts.length;
    }
    VertexData._ComputeSides(sideOrientation, positions, indices, normals, uvs);
    var vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    return vertexData;
}
/**
 * Creates the Mesh for a Goldberg Polyhedron which is made from 12 pentagonal and the rest hexagonal faces
 * @see https://en.wikipedia.org/wiki/Goldberg_polyhedron
 * @see https://doc.babylonjs.com/divingDeeper/mesh/creation/polyhedra/goldberg_poly
 * @param name defines the name of the mesh
 * @param options an object used to set the following optional parameters for the polyhedron, required but can be empty
 * @param scene defines the hosting scene
 * @returns Goldberg mesh
 */
export function CreateGoldberg(name, options, scene) {
    if (scene === void 0) { scene = null; }
    var size = options.size;
    var sizeX = options.sizeX || size || 1;
    var sizeY = options.sizeY || size || 1;
    var sizeZ = options.sizeZ || size || 1;
    var m = options.m || 1;
    if (m !== Math.floor(m)) {
        m === Math.floor(m);
        Logger.Warn("m not an integer only floor(m) used");
    }
    var n = options.n || 0;
    if (n !== Math.floor(n)) {
        n === Math.floor(n);
        Logger.Warn("n not an integer only floor(n) used");
    }
    if (n > m) {
        var temp = n;
        n = m;
        m = temp;
        Logger.Warn("n > m therefore m and n swapped");
    }
    var primTri = new _PrimaryIsoTriangle();
    primTri.build(m, n);
    var geodesicData = GeodesicData.BuildGeodesicData(primTri);
    var goldbergData = geodesicData.toGoldbergPolyhedronData();
    var goldberg = new GoldbergMesh(name, scene);
    options.sideOrientation = Mesh._GetDefaultSideOrientation(options.sideOrientation);
    goldberg._originalBuilderSideOrientation = options.sideOrientation;
    var vertexData = CreateGoldbergVertexData(options, goldbergData);
    vertexData.applyToMesh(goldberg, options.updatable);
    goldberg.goldbergData.nbSharedFaces = geodesicData.sharedNodes;
    goldberg.goldbergData.nbUnsharedFaces = geodesicData.poleNodes;
    goldberg.goldbergData.adjacentFaces = geodesicData.adjacentFaces;
    goldberg.goldbergData.nbFaces = goldberg.goldbergData.nbSharedFaces + goldberg.goldbergData.nbUnsharedFaces;
    goldberg.goldbergData.nbFacesAtPole = (goldberg.goldbergData.nbUnsharedFaces - 12) / 12;
    for (var f = 0; f < geodesicData.vertex.length; f++) {
        goldberg.goldbergData.faceCenters.push(Vector3.FromArray(geodesicData.vertex[f]));
        goldberg.goldbergData.faceCenters[f].x *= sizeX;
        goldberg.goldbergData.faceCenters[f].y *= sizeY;
        goldberg.goldbergData.faceCenters[f].z *= sizeZ;
        goldberg.goldbergData.faceColors.push(new Color4(1, 1, 1, 1));
    }
    for (var f = 0; f < goldbergData.face.length; f++) {
        var verts = goldbergData.face[f];
        var a = Vector3.FromArray(goldbergData.vertex[verts[0]]);
        var b = Vector3.FromArray(goldbergData.vertex[verts[2]]);
        var c = Vector3.FromArray(goldbergData.vertex[verts[1]]);
        var ba = b.subtract(a);
        var ca = c.subtract(a);
        var norm = Vector3.Cross(ca, ba).normalize();
        var z = Vector3.Cross(ca, norm).normalize();
        goldberg.goldbergData.faceXaxis.push(ca.normalize());
        goldberg.goldbergData.faceYaxis.push(norm);
        goldberg.goldbergData.faceZaxis.push(z);
    }
    return goldberg;
}
Mesh.CreateGoldberg = CreateGoldberg;
//# sourceMappingURL=goldbergBuilder.js.map