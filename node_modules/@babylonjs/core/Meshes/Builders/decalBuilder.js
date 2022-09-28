import { Vector3, Matrix, Vector2 } from "../../Maths/math.vector.js";
import { Mesh } from "../mesh.js";
import { VertexBuffer } from "../../Buffers/buffer.js";
import { VertexData } from "../mesh.vertexData.js";
import { PositionNormalTextureVertex } from "../../Maths/math.vertexFormat.js";
import { CompatibilityOptions } from "../../Compat/compatibilityOptions.js";
/**
 * Creates a decal mesh.
 * A decal is a mesh usually applied as a model onto the surface of another mesh. So don't forget the parameter `sourceMesh` depicting the decal
 * * The parameter `position` (Vector3, default `(0, 0, 0)`) sets the position of the decal in World coordinates
 * * The parameter `normal` (Vector3, default `Vector3.Up`) sets the normal of the mesh where the decal is applied onto in World coordinates
 * * The parameter `size` (Vector3, default `(1, 1, 1)`) sets the decal scaling
 * * The parameter `angle` (float in radian, default 0) sets the angle to rotate the decal
 * * The parameter `captureUVS` defines if we need to capture the uvs or compute them
 * @param name defines the name of the mesh
 * @param sourceMesh defines the mesh where the decal must be applied
 * @param options defines the options used to create the mesh
 * @param options.position
 * @param options.normal
 * @param options.size
 * @param options.angle
 * @param options.captureUVS
 * @returns the decal mesh
 * @see https://doc.babylonjs.com/how_to/decals
 */
export function CreateDecal(name, sourceMesh, options) {
    var indices = sourceMesh.getIndices();
    var positions = sourceMesh.getVerticesData(VertexBuffer.PositionKind);
    var normals = sourceMesh.getVerticesData(VertexBuffer.NormalKind);
    var uvs = sourceMesh.getVerticesData(VertexBuffer.UVKind);
    var position = options.position || Vector3.Zero();
    var normal = options.normal || Vector3.Up();
    var size = options.size || Vector3.One();
    var angle = options.angle || 0;
    // Getting correct rotation
    if (!normal) {
        var target = new Vector3(0, 0, 1);
        var camera = sourceMesh.getScene().activeCamera;
        var cameraWorldTarget = Vector3.TransformCoordinates(target, camera.getWorldMatrix());
        normal = camera.globalPosition.subtract(cameraWorldTarget);
    }
    var yaw = -Math.atan2(normal.z, normal.x) - Math.PI / 2;
    var len = Math.sqrt(normal.x * normal.x + normal.z * normal.z);
    var pitch = Math.atan2(normal.y, len);
    // Matrix
    var decalWorldMatrix = Matrix.RotationYawPitchRoll(yaw, pitch, angle).multiply(Matrix.Translation(position.x, position.y, position.z));
    var inverseDecalWorldMatrix = Matrix.Invert(decalWorldMatrix);
    var meshWorldMatrix = sourceMesh.getWorldMatrix();
    var transformMatrix = meshWorldMatrix.multiply(inverseDecalWorldMatrix);
    var vertexData = new VertexData();
    vertexData.indices = [];
    vertexData.positions = [];
    vertexData.normals = [];
    vertexData.uvs = [];
    var currentVertexDataIndex = 0;
    var extractDecalVector3 = function (indexId) {
        var result = new PositionNormalTextureVertex();
        if (!indices || !positions || !normals) {
            return result;
        }
        var vertexId = indices[indexId];
        result.position = new Vector3(positions[vertexId * 3], positions[vertexId * 3 + 1], positions[vertexId * 3 + 2]);
        // Send vector to decal local world
        result.position = Vector3.TransformCoordinates(result.position, transformMatrix);
        // Get normal
        result.normal = new Vector3(normals[vertexId * 3], normals[vertexId * 3 + 1], normals[vertexId * 3 + 2]);
        result.normal = Vector3.TransformNormal(result.normal, transformMatrix);
        if (options.captureUVS && uvs) {
            var v = uvs[vertexId * 2 + 1];
            result.uv = new Vector2(uvs[vertexId * 2], CompatibilityOptions.UseOpenGLOrientationForUV ? 1 - v : v);
        }
        return result;
    }; // Inspired by https://github.com/mrdoob/three.js/blob/eee231960882f6f3b6113405f524956145148146/examples/js/geometries/DecalGeometry.js
    var clip = function (vertices, axis) {
        if (vertices.length === 0) {
            return vertices;
        }
        var clipSize = 0.5 * Math.abs(Vector3.Dot(size, axis));
        var clipVertices = function (v0, v1) {
            var clipFactor = Vector3.GetClipFactor(v0.position, v1.position, axis, clipSize);
            return new PositionNormalTextureVertex(Vector3.Lerp(v0.position, v1.position, clipFactor), Vector3.Lerp(v0.normal, v1.normal, clipFactor));
        };
        var result = new Array();
        for (var index = 0; index < vertices.length; index += 3) {
            var total = 0;
            var nV1 = null;
            var nV2 = null;
            var nV3 = null;
            var nV4 = null;
            var d1 = Vector3.Dot(vertices[index].position, axis) - clipSize;
            var d2 = Vector3.Dot(vertices[index + 1].position, axis) - clipSize;
            var d3 = Vector3.Dot(vertices[index + 2].position, axis) - clipSize;
            var v1Out = d1 > 0;
            var v2Out = d2 > 0;
            var v3Out = d3 > 0;
            total = (v1Out ? 1 : 0) + (v2Out ? 1 : 0) + (v3Out ? 1 : 0);
            switch (total) {
                case 0:
                    result.push(vertices[index]);
                    result.push(vertices[index + 1]);
                    result.push(vertices[index + 2]);
                    break;
                case 1:
                    if (v1Out) {
                        nV1 = vertices[index + 1];
                        nV2 = vertices[index + 2];
                        nV3 = clipVertices(vertices[index], nV1);
                        nV4 = clipVertices(vertices[index], nV2);
                    }
                    if (v2Out) {
                        nV1 = vertices[index];
                        nV2 = vertices[index + 2];
                        nV3 = clipVertices(vertices[index + 1], nV1);
                        nV4 = clipVertices(vertices[index + 1], nV2);
                        result.push(nV3);
                        result.push(nV2.clone());
                        result.push(nV1.clone());
                        result.push(nV2.clone());
                        result.push(nV3.clone());
                        result.push(nV4);
                        break;
                    }
                    if (v3Out) {
                        nV1 = vertices[index];
                        nV2 = vertices[index + 1];
                        nV3 = clipVertices(vertices[index + 2], nV1);
                        nV4 = clipVertices(vertices[index + 2], nV2);
                    }
                    if (nV1 && nV2 && nV3 && nV4) {
                        result.push(nV1.clone());
                        result.push(nV2.clone());
                        result.push(nV3);
                        result.push(nV4);
                        result.push(nV3.clone());
                        result.push(nV2.clone());
                    }
                    break;
                case 2:
                    if (!v1Out) {
                        nV1 = vertices[index].clone();
                        nV2 = clipVertices(nV1, vertices[index + 1]);
                        nV3 = clipVertices(nV1, vertices[index + 2]);
                        result.push(nV1);
                        result.push(nV2);
                        result.push(nV3);
                    }
                    if (!v2Out) {
                        nV1 = vertices[index + 1].clone();
                        nV2 = clipVertices(nV1, vertices[index + 2]);
                        nV3 = clipVertices(nV1, vertices[index]);
                        result.push(nV1);
                        result.push(nV2);
                        result.push(nV3);
                    }
                    if (!v3Out) {
                        nV1 = vertices[index + 2].clone();
                        nV2 = clipVertices(nV1, vertices[index]);
                        nV3 = clipVertices(nV1, vertices[index + 1]);
                        result.push(nV1);
                        result.push(nV2);
                        result.push(nV3);
                    }
                    break;
                case 3:
                    break;
            }
        }
        return result;
    };
    for (var index = 0; index < indices.length; index += 3) {
        var faceVertices = new Array();
        faceVertices.push(extractDecalVector3(index));
        faceVertices.push(extractDecalVector3(index + 1));
        faceVertices.push(extractDecalVector3(index + 2));
        // Clip
        faceVertices = clip(faceVertices, new Vector3(1, 0, 0));
        faceVertices = clip(faceVertices, new Vector3(-1, 0, 0));
        faceVertices = clip(faceVertices, new Vector3(0, 1, 0));
        faceVertices = clip(faceVertices, new Vector3(0, -1, 0));
        faceVertices = clip(faceVertices, new Vector3(0, 0, 1));
        faceVertices = clip(faceVertices, new Vector3(0, 0, -1));
        if (faceVertices.length === 0) {
            continue;
        }
        // Add UVs and get back to world
        for (var vIndex = 0; vIndex < faceVertices.length; vIndex++) {
            var vertex = faceVertices[vIndex];
            //TODO check for Int32Array | Uint32Array | Uint16Array
            vertexData.indices.push(currentVertexDataIndex);
            vertex.position.toArray(vertexData.positions, currentVertexDataIndex * 3);
            vertex.normal.toArray(vertexData.normals, currentVertexDataIndex * 3);
            if (!options.captureUVS) {
                vertexData.uvs.push(0.5 + vertex.position.x / size.x);
                var v = 0.5 + vertex.position.y / size.y;
                vertexData.uvs.push(CompatibilityOptions.UseOpenGLOrientationForUV ? 1 - v : v);
            }
            else {
                vertex.uv.toArray(vertexData.uvs, currentVertexDataIndex * 2);
            }
            currentVertexDataIndex++;
        }
    }
    // Return mesh
    var decal = new Mesh(name, sourceMesh.getScene());
    vertexData.applyToMesh(decal);
    decal.position = position.clone();
    decal.rotation = new Vector3(pitch, yaw, angle);
    return decal;
}
/**
 * Class containing static functions to help procedurally build meshes
 * @deprecated use the function directly from the module
 */
export var DecalBuilder = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateDecal: CreateDecal,
};
Mesh.CreateDecal = function (name, sourceMesh, position, normal, size, angle) {
    var options = {
        position: position,
        normal: normal,
        size: size,
        angle: angle,
    };
    return CreateDecal(name, sourceMesh, options);
};
//# sourceMappingURL=decalBuilder.js.map