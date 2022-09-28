
import { TmpVectors, Vector3 } from "../Maths/math.vector.js";
import { SubMesh } from "./subMesh.js";
/**
 * @param vector
 * @param positions
 * @param indices
 * @param step
 * @param checkStopper
 * @param ref
 * @hidden
 */
SubMesh.prototype._projectOnTrianglesToRef = function (vector, positions, indices, step, checkStopper, ref) {
    // Triangles test
    var proj = TmpVectors.Vector3[0];
    var tmp = TmpVectors.Vector3[1];
    var distance = +Infinity;
    for (var index = this.indexStart; index < this.indexStart + this.indexCount - (3 - step); index += step) {
        var indexA = indices[index];
        var indexB = indices[index + 1];
        var indexC = indices[index + 2];
        if (checkStopper && indexC === 0xffffffff) {
            index += 2;
            continue;
        }
        var p0 = positions[indexA];
        var p1 = positions[indexB];
        var p2 = positions[indexC];
        // stay defensive and don't check against undefined positions.
        if (!p0 || !p1 || !p2) {
            continue;
        }
        var tmpDist = Vector3.ProjectOnTriangleToRef(vector, p0, p1, p2, tmp);
        if (tmpDist < distance) {
            proj.copyFrom(tmp);
            distance = tmpDist;
        }
    }
    ref.copyFrom(proj);
    return distance;
};
/**
 * @param vector
 * @param positions
 * @param indices
 * @param ref
 * @hidden
 */
SubMesh.prototype._projectOnUnIndexedTrianglesToRef = function (vector, positions, indices, ref) {
    // Triangles test
    var proj = TmpVectors.Vector3[0];
    var tmp = TmpVectors.Vector3[1];
    var distance = +Infinity;
    for (var index = this.verticesStart; index < this.verticesStart + this.verticesCount; index += 3) {
        var p0 = positions[index];
        var p1 = positions[index + 1];
        var p2 = positions[index + 2];
        var tmpDist = Vector3.ProjectOnTriangleToRef(vector, p0, p1, p2, tmp);
        if (tmpDist < distance) {
            proj.copyFrom(tmp);
            distance = tmpDist;
        }
    }
    ref.copyFrom(proj);
    return distance;
};
SubMesh.prototype.projectToRef = function (vector, positions, indices, ref) {
    var material = this.getMaterial();
    if (!material) {
        return -1;
    }
    var step = 3;
    var checkStopper = false;
    switch (material.fillMode) {
        case 3:
        case 5:
        case 6:
        case 8:
            return -1;
        case 7:
            step = 1;
            checkStopper = true;
            break;
        default:
            break;
    }
    // LineMesh first as it's also a Mesh...
    if (material.fillMode === 4) {
        return -1;
    }
    else {
        // Check if mesh is unindexed
        if (!indices.length && this._mesh._unIndexed) {
            return this._projectOnUnIndexedTrianglesToRef(vector, positions, indices, ref);
        }
        return this._projectOnTrianglesToRef(vector, positions, indices, step, checkStopper, ref);
    }
};
//# sourceMappingURL=subMesh.project.js.map