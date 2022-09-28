import { Vector3 } from "../Maths/math.vector.js";
import { CreateLines } from "../Meshes/Builders/linesBuilder.js";
/**
 * As raycast might be hard to debug, the RayHelper can help rendering the different rays
 * in order to better appreciate the issue one might have.
 * @see https://doc.babylonjs.com/babylon101/raycasts#debugging
 */
var RayHelper = /** @class */ (function () {
    /**
     * Instantiate a new ray helper.
     * As raycast might be hard to debug, the RayHelper can help rendering the different rays
     * in order to better appreciate the issue one might have.
     * @see https://doc.babylonjs.com/babylon101/raycasts#debugging
     * @param ray Defines the ray we are currently tryin to visualize
     */
    function RayHelper(ray) {
        this.ray = ray;
    }
    /**
     * Helper function to create a colored helper in a scene in one line.
     * @param ray Defines the ray we are currently tryin to visualize
     * @param scene Defines the scene the ray is used in
     * @param color Defines the color we want to see the ray in
     * @returns The newly created ray helper.
     */
    RayHelper.CreateAndShow = function (ray, scene, color) {
        var helper = new RayHelper(ray);
        helper.show(scene, color);
        return helper;
    };
    /**
     * Shows the ray we are willing to debug.
     * @param scene Defines the scene the ray needs to be rendered in
     * @param color Defines the color the ray needs to be rendered in
     */
    RayHelper.prototype.show = function (scene, color) {
        if (!this._renderFunction && this.ray) {
            var ray = this.ray;
            this._renderFunction = this._render.bind(this);
            this._scene = scene;
            this._renderPoints = [ray.origin, ray.origin.add(ray.direction.scale(ray.length))];
            this._renderLine = CreateLines("ray", { points: this._renderPoints, updatable: true }, scene);
            this._renderLine.isPickable = false;
            if (this._renderFunction) {
                this._scene.registerBeforeRender(this._renderFunction);
            }
        }
        if (color && this._renderLine) {
            this._renderLine.color.copyFrom(color);
        }
    };
    /**
     * Hides the ray we are debugging.
     */
    RayHelper.prototype.hide = function () {
        if (this._renderFunction && this._scene) {
            this._scene.unregisterBeforeRender(this._renderFunction);
            this._scene = null;
            this._renderFunction = null;
            if (this._renderLine) {
                this._renderLine.dispose();
                this._renderLine = null;
            }
            this._renderPoints = [];
        }
    };
    RayHelper.prototype._render = function () {
        var _a;
        var ray = this.ray;
        if (!ray) {
            return;
        }
        var point = this._renderPoints[1];
        var len = Math.min(ray.length, 1000000);
        point.copyFrom(ray.direction);
        point.scaleInPlace(len);
        point.addInPlace(ray.origin);
        this._renderPoints[0].copyFrom(ray.origin);
        CreateLines("ray", { points: this._renderPoints, updatable: true, instance: this._renderLine }, this._scene);
        (_a = this._renderLine) === null || _a === void 0 ? void 0 : _a.refreshBoundingInfo();
    };
    /**
     * Attach a ray helper to a mesh so that we can easily see its orientation for instance or information like its normals.
     * @param mesh Defines the mesh we want the helper attached to
     * @param meshSpaceDirection Defines the direction of the Ray in mesh space (local space of the mesh node)
     * @param meshSpaceOrigin Defines the origin of the Ray in mesh space (local space of the mesh node)
     * @param length Defines the length of the ray
     */
    RayHelper.prototype.attachToMesh = function (mesh, meshSpaceDirection, meshSpaceOrigin, length) {
        var _this = this;
        this._attachedToMesh = mesh;
        var ray = this.ray;
        if (!ray) {
            return;
        }
        if (!ray.direction) {
            ray.direction = Vector3.Zero();
        }
        if (!ray.origin) {
            ray.origin = Vector3.Zero();
        }
        if (length) {
            ray.length = length;
        }
        if (!meshSpaceOrigin) {
            meshSpaceOrigin = Vector3.Zero();
        }
        if (!meshSpaceDirection) {
            // -1 so that this will work with Mesh.lookAt
            meshSpaceDirection = new Vector3(0, 0, -1);
        }
        if (!this._scene) {
            this._scene = mesh.getScene();
        }
        if (!this._meshSpaceDirection) {
            this._meshSpaceDirection = meshSpaceDirection.clone();
            this._meshSpaceOrigin = meshSpaceOrigin.clone();
        }
        else {
            this._meshSpaceDirection.copyFrom(meshSpaceDirection);
            this._meshSpaceOrigin.copyFrom(meshSpaceOrigin);
        }
        if (!this._onAfterRenderObserver) {
            this._onAfterRenderObserver = this._scene.onBeforeRenderObservable.add(function () { return _this._updateToMesh(); });
            this._onAfterStepObserver = this._scene.onAfterStepObservable.add(function () { return _this._updateToMesh(); });
        }
        // force world matrix computation before the first ray helper computation
        this._attachedToMesh.computeWorldMatrix(true);
        this._updateToMesh();
    };
    /**
     * Detach the ray helper from the mesh it has previously been attached to.
     */
    RayHelper.prototype.detachFromMesh = function () {
        if (this._attachedToMesh && this._scene) {
            if (this._onAfterRenderObserver) {
                this._scene.onBeforeRenderObservable.remove(this._onAfterRenderObserver);
                this._scene.onAfterStepObservable.remove(this._onAfterStepObserver);
            }
            this._attachedToMesh = null;
            this._onAfterRenderObserver = null;
            this._onAfterStepObserver = null;
            this._scene = null;
        }
    };
    RayHelper.prototype._updateToMesh = function () {
        var ray = this.ray;
        if (!this._attachedToMesh || !ray) {
            return;
        }
        if (this._attachedToMesh.isDisposed()) {
            this.detachFromMesh();
            return;
        }
        this._attachedToMesh.getDirectionToRef(this._meshSpaceDirection, ray.direction);
        Vector3.TransformCoordinatesToRef(this._meshSpaceOrigin, this._attachedToMesh.getWorldMatrix(), ray.origin);
    };
    /**
     * Dispose the helper and release its associated resources.
     */
    RayHelper.prototype.dispose = function () {
        this.hide();
        this.detachFromMesh();
        this.ray = null;
    };
    return RayHelper;
}());
export { RayHelper };
//# sourceMappingURL=rayHelper.js.map