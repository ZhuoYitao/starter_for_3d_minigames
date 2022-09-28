import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Quaternion, TmpVectors, Vector3 } from "../../Maths/math.vector.js";
/**
 * A behavior that allows a transform node to stick to a surface position/orientation
 * @since 5.0.0
 */
var SurfaceMagnetismBehavior = /** @class */ (function () {
    function SurfaceMagnetismBehavior() {
        this._attachPointLocalOffset = new Vector3();
        this._workingPosition = new Vector3();
        this._workingQuaternion = new Quaternion();
        this._lastTick = -1;
        this._hit = false;
        /**
         * Distance offset from the hit point to place the target at, along the hit normal.
         */
        this.hitNormalOffset = 0.05;
        /**
         * Spatial mapping meshes to collide with
         */
        this.meshes = [];
        /**
         * Set to false if the node should strictly follow the camera without any interpolation time
         */
        this.interpolatePose = true;
        /**
         * Rate of interpolation of position and rotation of the attached node.
         * Higher values will give a slower interpolation.
         */
        this.lerpTime = 250;
        /**
         * If true, pitch and roll are omitted.
         */
        this.keepOrientationVertical = true;
        /**
         * Is this behavior reacting to pointer events
         */
        this.enabled = true;
        /**
         * Maximum distance for the node to stick to the surface
         */
        this.maxStickingDistance = 0.8;
    }
    Object.defineProperty(SurfaceMagnetismBehavior.prototype, "name", {
        /**
         * Name of the behavior
         */
        get: function () {
            return "SurfaceMagnetism";
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Function called when the behavior needs to be initialized (after attaching it to a target)
     */
    SurfaceMagnetismBehavior.prototype.init = function () { };
    /**
     * Attaches the behavior to a transform node
     * @param target defines the target where the behavior is attached to
     * @param scene the scene
     */
    SurfaceMagnetismBehavior.prototype.attach = function (target, scene) {
        this._attachedMesh = target;
        this._scene = scene || target.getScene();
        if (!this._attachedMesh.rotationQuaternion) {
            this._attachedMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(this._attachedMesh.rotation.y, this._attachedMesh.rotation.x, this._attachedMesh.rotation.z);
        }
        this.updateAttachPoint();
        this._workingPosition.copyFrom(this._attachedMesh.position);
        this._workingQuaternion.copyFrom(this._attachedMesh.rotationQuaternion);
        this._addObservables();
    };
    /**
     * Detaches the behavior
     */
    SurfaceMagnetismBehavior.prototype.detach = function () {
        this._attachedMesh = null;
        this._removeObservables();
    };
    SurfaceMagnetismBehavior.prototype._getTargetPose = function (pickingInfo) {
        if (!this._attachedMesh) {
            return null;
        }
        if (pickingInfo && pickingInfo.hit) {
            var pickedNormal = pickingInfo.getNormal(true, true);
            var pickedPoint = pickingInfo.pickedPoint;
            if (!pickedNormal || !pickedPoint) {
                return null;
            }
            pickedNormal.normalize();
            var worldTarget = TmpVectors.Vector3[0];
            worldTarget.copyFrom(pickedNormal);
            worldTarget.scaleInPlace(this.hitNormalOffset);
            worldTarget.addInPlace(pickedPoint);
            if (this._attachedMesh.parent) {
                TmpVectors.Matrix[0].copyFrom(this._attachedMesh.parent.getWorldMatrix()).invert();
                Vector3.TransformNormalToRef(worldTarget, TmpVectors.Matrix[0], worldTarget);
            }
            return {
                position: worldTarget,
                quaternion: Quaternion.RotationYawPitchRoll(-Math.atan2(pickedNormal.x, -pickedNormal.z), this.keepOrientationVertical ? 0 : Math.atan2(pickedNormal.y, Math.sqrt(pickedNormal.z * pickedNormal.z + pickedNormal.x * pickedNormal.x)), 0),
            };
        }
        return null;
    };
    /**
     * Updates the attach point with the current geometry extents of the attached mesh
     */
    SurfaceMagnetismBehavior.prototype.updateAttachPoint = function () {
        this._getAttachPointOffsetToRef(this._attachPointLocalOffset);
    };
    /**
     * Finds the intersection point of the given ray onto the meshes and updates the target.
     * Transformation will be interpolated according to `interpolatePose` and `lerpTime` properties.
     * If no mesh of `meshes` are hit, this does nothing.
     * @param pickInfo The input pickingInfo that will be used to intersect the meshes
     * @returns a boolean indicating if we found a hit to stick to
     */
    SurfaceMagnetismBehavior.prototype.findAndUpdateTarget = function (pickInfo) {
        this._hit = false;
        if (!pickInfo.ray) {
            return false;
        }
        var subPicking = pickInfo.ray.intersectsMeshes(this.meshes)[0];
        if (this._attachedMesh && subPicking && subPicking.hit && subPicking.pickedMesh) {
            var pose = this._getTargetPose(subPicking);
            if (pose && Vector3.Distance(this._attachedMesh.position, pose.position) < this.maxStickingDistance) {
                this._workingPosition.copyFrom(pose.position);
                this._workingQuaternion.copyFrom(pose.quaternion);
                this._hit = true;
            }
        }
        return this._hit;
    };
    SurfaceMagnetismBehavior.prototype._getAttachPointOffsetToRef = function (ref) {
        if (!this._attachedMesh) {
            ref.setAll(0);
            return;
        }
        var storedQuat = TmpVectors.Quaternion[0];
        storedQuat.copyFrom(this._attachedMesh.rotationQuaternion);
        this._attachedMesh.rotationQuaternion.copyFromFloats(0, 0, 0, 1);
        this._attachedMesh.computeWorldMatrix();
        var boundingMinMax = this._attachedMesh.getHierarchyBoundingVectors();
        var center = TmpVectors.Vector3[0];
        boundingMinMax.max.addToRef(boundingMinMax.min, center);
        center.scaleInPlace(0.5);
        center.z = boundingMinMax.max.z;
        // We max the z coordinate because we want the attach point to be on the back of the mesh
        var invWorld = TmpVectors.Matrix[0];
        this._attachedMesh.getWorldMatrix().invertToRef(invWorld);
        Vector3.TransformCoordinatesToRef(center, invWorld, ref);
        this._attachedMesh.rotationQuaternion.copyFrom(storedQuat);
    };
    SurfaceMagnetismBehavior.prototype._updateTransformToGoal = function (elapsed) {
        if (!this._attachedMesh || !this._hit) {
            return;
        }
        var oldParent = this._attachedMesh.parent;
        this._attachedMesh.setParent(null);
        var worldOffset = TmpVectors.Vector3[0];
        Vector3.TransformNormalToRef(this._attachPointLocalOffset, this._attachedMesh.getWorldMatrix(), worldOffset);
        if (!this.interpolatePose) {
            this._attachedMesh.position.copyFrom(this._workingPosition).subtractInPlace(worldOffset);
            this._attachedMesh.rotationQuaternion.copyFrom(this._workingQuaternion);
            return;
        }
        // position
        var interpolatedPosition = new Vector3();
        Vector3.SmoothToRef(this._attachedMesh.position, this._workingPosition, elapsed, this.lerpTime, interpolatedPosition);
        this._attachedMesh.position.copyFrom(interpolatedPosition);
        // rotation
        var currentRotation = new Quaternion();
        currentRotation.copyFrom(this._attachedMesh.rotationQuaternion);
        Quaternion.SmoothToRef(currentRotation, this._workingQuaternion, elapsed, this.lerpTime, this._attachedMesh.rotationQuaternion);
        this._attachedMesh.setParent(oldParent);
    };
    SurfaceMagnetismBehavior.prototype._addObservables = function () {
        var _this = this;
        this._pointerObserver = this._scene.onPointerObservable.add(function (pointerInfo) {
            if (_this.enabled && pointerInfo.type == PointerEventTypes.POINTERMOVE && pointerInfo.pickInfo) {
                _this.findAndUpdateTarget(pointerInfo.pickInfo);
            }
        });
        this._lastTick = Date.now();
        this._onBeforeRender = this._scene.onBeforeRenderObservable.add(function () {
            var tick = Date.now();
            _this._updateTransformToGoal(tick - _this._lastTick);
            _this._lastTick = tick;
        });
    };
    SurfaceMagnetismBehavior.prototype._removeObservables = function () {
        this._scene.onPointerObservable.remove(this._pointerObserver);
        this._scene.onBeforeRenderObservable.remove(this._onBeforeRender);
        this._pointerObserver = null;
        this._onBeforeRender = null;
    };
    return SurfaceMagnetismBehavior;
}());
export { SurfaceMagnetismBehavior };
//# sourceMappingURL=surfaceMagnetismBehavior.js.map