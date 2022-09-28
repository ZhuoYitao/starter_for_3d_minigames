import { VertexData } from "../mesh.vertexData.js";
import { Vector2, Vector3, Matrix } from "../../Maths/math.vector.js";
import { Mesh } from "../mesh.js";
import { CompatibilityOptions } from "../../Compat/compatibilityOptions.js";
/**
 * Scripts based off of https://github.com/maximeq/three-js-capsule-geometry/blob/master/src/CapsuleBufferGeometry.js
 * @param options the constructors options used to shape the mesh.
 * @returns the capsule VertexData
 * @see https://doc.babylonjs.com/divingDeeper/mesh/creation/set/capsule
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CreateCapsuleVertexData(options) {
    if (options === void 0) { options = {
        subdivisions: 2,
        tessellation: 16,
        height: 1,
        radius: 0.25,
        capSubdivisions: 6,
    }; }
    var subdivisions = Math.max(options.subdivisions ? options.subdivisions : 2, 1);
    var tessellation = Math.max(options.tessellation ? options.tessellation : 16, 3);
    var height = Math.max(options.height ? options.height : 1, 0);
    var radius = Math.max(options.radius ? options.radius : 0.25, 0);
    var capDetail = Math.max(options.capSubdivisions ? options.capSubdivisions : 6, 1);
    var radialSegments = tessellation;
    var heightSegments = subdivisions;
    var radiusTop = Math.max(options.radiusTop ? options.radiusTop : radius, 0);
    var radiusBottom = Math.max(options.radiusBottom ? options.radiusBottom : radius, 0);
    var heightMinusCaps = height - (radiusTop + radiusBottom);
    var thetaStart = 0.0;
    var thetaLength = 2.0 * Math.PI;
    var capsTopSegments = Math.max(options.topCapSubdivisions ? options.topCapSubdivisions : capDetail, 1);
    var capsBottomSegments = Math.max(options.bottomCapSubdivisions ? options.bottomCapSubdivisions : capDetail, 1);
    var alpha = Math.acos((radiusBottom - radiusTop) / height);
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    var index = 0;
    var indexArray = [], halfHeight = heightMinusCaps * 0.5;
    var pi2 = Math.PI * 0.5;
    var x, y;
    var normal = Vector3.Zero();
    var vertex = Vector3.Zero();
    var cosAlpha = Math.cos(alpha);
    var sinAlpha = Math.sin(alpha);
    var coneLength = new Vector2(radiusTop * sinAlpha, halfHeight + radiusTop * cosAlpha)
        .subtract(new Vector2(radiusBottom * sinAlpha, -halfHeight + radiusBottom * cosAlpha))
        .length();
    // Total length for v texture coord
    var vl = radiusTop * alpha + coneLength + radiusBottom * (pi2 - alpha);
    var v = 0;
    for (y = 0; y <= capsTopSegments; y++) {
        var indexRow = [];
        var a = pi2 - alpha * (y / capsTopSegments);
        v += (radiusTop * alpha) / capsTopSegments;
        var cosA = Math.cos(a);
        var sinA = Math.sin(a);
        // calculate the radius of the current row
        var _radius = cosA * radiusTop;
        for (x = 0; x <= radialSegments; x++) {
            var u = x / radialSegments;
            var theta = u * thetaLength + thetaStart;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            // vertex
            vertex.x = _radius * sinTheta;
            vertex.y = halfHeight + sinA * radiusTop;
            vertex.z = _radius * cosTheta;
            vertices.push(vertex.x, vertex.y, vertex.z);
            // normal
            normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
            normals.push(normal.x, normal.y, normal.z);
            // uv
            uvs.push(u, CompatibilityOptions.UseOpenGLOrientationForUV ? v / vl : 1 - v / vl);
            // save index of vertex in respective row
            indexRow.push(index);
            // increase index
            index++;
        }
        // now save vertices of the row in our index array
        indexArray.push(indexRow);
    }
    var coneHeight = height - radiusTop - radiusBottom + cosAlpha * radiusTop - cosAlpha * radiusBottom;
    var slope = (sinAlpha * (radiusBottom - radiusTop)) / coneHeight;
    for (y = 1; y <= heightSegments; y++) {
        var indexRow = [];
        v += coneLength / heightSegments;
        // calculate the radius of the current row
        var _radius = sinAlpha * ((y * (radiusBottom - radiusTop)) / heightSegments + radiusTop);
        for (x = 0; x <= radialSegments; x++) {
            var u = x / radialSegments;
            var theta = u * thetaLength + thetaStart;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            // vertex
            vertex.x = _radius * sinTheta;
            vertex.y = halfHeight + cosAlpha * radiusTop - (y * coneHeight) / heightSegments;
            vertex.z = _radius * cosTheta;
            vertices.push(vertex.x, vertex.y, vertex.z);
            // normal
            normal.set(sinTheta, slope, cosTheta).normalize();
            normals.push(normal.x, normal.y, normal.z);
            // uv
            uvs.push(u, CompatibilityOptions.UseOpenGLOrientationForUV ? v / vl : 1 - v / vl);
            // save index of vertex in respective row
            indexRow.push(index);
            // increase index
            index++;
        }
        // now save vertices of the row in our index array
        indexArray.push(indexRow);
    }
    for (y = 1; y <= capsBottomSegments; y++) {
        var indexRow = [];
        var a = pi2 - alpha - (Math.PI - alpha) * (y / capsBottomSegments);
        v += (radiusBottom * alpha) / capsBottomSegments;
        var cosA = Math.cos(a);
        var sinA = Math.sin(a);
        // calculate the radius of the current row
        var _radius = cosA * radiusBottom;
        for (x = 0; x <= radialSegments; x++) {
            var u = x / radialSegments;
            var theta = u * thetaLength + thetaStart;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            // vertex
            vertex.x = _radius * sinTheta;
            vertex.y = -halfHeight + sinA * radiusBottom;
            vertex.z = _radius * cosTheta;
            vertices.push(vertex.x, vertex.y, vertex.z);
            // normal
            normal.set(cosA * sinTheta, sinA, cosA * cosTheta);
            normals.push(normal.x, normal.y, normal.z);
            // uv
            uvs.push(u, CompatibilityOptions.UseOpenGLOrientationForUV ? v / vl : 1 - v / vl);
            // save index of vertex in respective row
            indexRow.push(index);
            // increase index
            index++;
        }
        // now save vertices of the row in our index array
        indexArray.push(indexRow);
    }
    // generate indices
    for (x = 0; x < radialSegments; x++) {
        for (y = 0; y < capsTopSegments + heightSegments + capsBottomSegments; y++) {
            // we use the index array to access the correct indices
            var i1 = indexArray[y][x];
            var i2 = indexArray[y + 1][x];
            var i3 = indexArray[y + 1][x + 1];
            var i4 = indexArray[y][x + 1];
            // face one
            indices.push(i1);
            indices.push(i2);
            indices.push(i4);
            // face two
            indices.push(i2);
            indices.push(i3);
            indices.push(i4);
        }
    }
    indices = indices.reverse();
    if (options.orientation && !options.orientation.equals(Vector3.Up())) {
        var m = new Matrix();
        options.orientation
            .clone()
            .scale(Math.PI * 0.5)
            .cross(Vector3.Up())
            .toQuaternion()
            .toRotationMatrix(m);
        var v_1 = Vector3.Zero();
        for (var i = 0; i < vertices.length; i += 3) {
            v_1.set(vertices[i], vertices[i + 1], vertices[i + 2]);
            Vector3.TransformCoordinatesToRef(v_1.clone(), m, v_1);
            vertices[i] = v_1.x;
            vertices[i + 1] = v_1.y;
            vertices[i + 2] = v_1.z;
        }
    }
    var vDat = new VertexData();
    vDat.positions = vertices;
    vDat.normals = normals;
    vDat.uvs = uvs;
    vDat.indices = indices;
    return vDat;
}
/**
 * Creates a capsule or a pill mesh
 * @param name defines the name of the mesh
 * @param options The constructors options.
 * @param scene The scene the mesh is scoped to.
 * @returns Capsule Mesh
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function CreateCapsule(name, options, scene) {
    if (options === void 0) { options = {
        orientation: Vector3.Up(),
        subdivisions: 2,
        tessellation: 16,
        height: 1,
        radius: 0.25,
        capSubdivisions: 6,
        updatable: false,
    }; }
    if (scene === void 0) { scene = null; }
    var capsule = new Mesh(name, scene);
    var vertexData = CreateCapsuleVertexData(options);
    vertexData.applyToMesh(capsule, options.updatable);
    return capsule;
}
/**
 * Class containing static functions to help procedurally build meshes
 * @deprecated please use CreateCapsule directly
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export var CapsuleBuilder = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateCapsule: CreateCapsule,
};
/**
 * Creates a capsule or a pill mesh
 * @param name defines the name of the mesh.
 * @param options the constructors options used to shape the mesh.
 * @param scene defines the scene the mesh is scoped to.
 * @returns the capsule mesh
 * @see https://doc.babylonjs.com/how_to/capsule_shape
 */
Mesh.CreateCapsule = function (name, options, scene) {
    return CreateCapsule(name, options, scene);
};
VertexData.CreateCapsule = CreateCapsuleVertexData;
//# sourceMappingURL=capsuleBuilder.js.map