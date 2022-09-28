import { Vector3 } from "../Maths/math.vector.js";
/**
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _MeshCollisionData = /** @class */ (function () {
    function _MeshCollisionData() {
        this._checkCollisions = false;
        this._collisionMask = -1;
        this._collisionGroup = -1;
        this._surroundingMeshes = null;
        this._collider = null;
        this._oldPositionForCollisions = new Vector3(0, 0, 0);
        this._diffPositionForCollisions = new Vector3(0, 0, 0);
        this._collisionResponse = true;
    }
    return _MeshCollisionData;
}());
export { _MeshCollisionData };
//# sourceMappingURL=meshCollisionData.js.map