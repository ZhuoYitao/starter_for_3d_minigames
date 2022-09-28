import { Scene } from "../scene.js";
import { Vector3 } from "../Maths/math.vector.js";
import { Engine } from "../Engines/engine.js";
import { Collider } from "./collider.js";
/** @hidden */
var DefaultCollisionCoordinator = /** @class */ (function () {
    function DefaultCollisionCoordinator() {
        this._scaledPosition = Vector3.Zero();
        this._scaledVelocity = Vector3.Zero();
        this._finalPosition = Vector3.Zero();
    }
    DefaultCollisionCoordinator.prototype.getNewPosition = function (position, displacement, collider, maximumRetry, excludedMesh, onNewPosition, collisionIndex) {
        position.divideToRef(collider._radius, this._scaledPosition);
        displacement.divideToRef(collider._radius, this._scaledVelocity);
        collider.collidedMesh = null;
        collider._retry = 0;
        collider._initialVelocity = this._scaledVelocity;
        collider._initialPosition = this._scaledPosition;
        this._collideWithWorld(this._scaledPosition, this._scaledVelocity, collider, maximumRetry, this._finalPosition, excludedMesh);
        this._finalPosition.multiplyInPlace(collider._radius);
        //run the callback
        onNewPosition(collisionIndex, this._finalPosition, collider.collidedMesh);
    };
    DefaultCollisionCoordinator.prototype.createCollider = function () {
        return new Collider();
    };
    DefaultCollisionCoordinator.prototype.init = function (scene) {
        this._scene = scene;
    };
    DefaultCollisionCoordinator.prototype._collideWithWorld = function (position, velocity, collider, maximumRetry, finalPosition, excludedMesh) {
        if (excludedMesh === void 0) { excludedMesh = null; }
        var closeDistance = Engine.CollisionsEpsilon * 10.0;
        if (collider._retry >= maximumRetry) {
            finalPosition.copyFrom(position);
            return;
        }
        // Check if this is a mesh else camera or -1
        var collisionMask = excludedMesh ? excludedMesh.collisionMask : collider.collisionMask;
        collider._initialize(position, velocity, closeDistance);
        // Check if collision detection should happen against specified list of meshes or,
        // if not specified, against all meshes in the scene
        var meshes = (excludedMesh && excludedMesh.surroundingMeshes) || this._scene.meshes;
        for (var index = 0; index < meshes.length; index++) {
            var mesh = meshes[index];
            if (mesh.isEnabled() && mesh.checkCollisions && mesh.subMeshes && mesh !== excludedMesh && (collisionMask & mesh.collisionGroup) !== 0) {
                mesh._checkCollision(collider);
            }
        }
        if (!collider.collisionFound) {
            position.addToRef(velocity, finalPosition);
            return;
        }
        if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
            collider._getResponse(position, velocity);
        }
        if (velocity.length() <= closeDistance) {
            finalPosition.copyFrom(position);
            return;
        }
        collider._retry++;
        this._collideWithWorld(position, velocity, collider, maximumRetry, finalPosition, excludedMesh);
    };
    return DefaultCollisionCoordinator;
}());
export { DefaultCollisionCoordinator };
Scene.CollisionCoordinatorFactory = function () {
    return new DefaultCollisionCoordinator();
};
//# sourceMappingURL=collisionCoordinator.js.map