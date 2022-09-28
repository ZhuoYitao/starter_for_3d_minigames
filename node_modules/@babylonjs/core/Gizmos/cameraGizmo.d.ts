import type { Nullable } from "../types";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import { StandardMaterial } from "../Materials/standardMaterial";
import type { Camera } from "../Cameras/camera";
import { Observable } from "../Misc/observable";
/**
 * Gizmo that enables viewing a camera
 */
export declare class CameraGizmo extends Gizmo {
    private _cameraMesh;
    private _cameraLinesMesh;
    private _material;
    private _pointerObserver;
    /**
     * Event that fires each time the gizmo is clicked
     */
    onClickedObservable: Observable<Camera>;
    /**
     * Creates a CameraGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(gizmoLayer?: UtilityLayerRenderer);
    private _camera;
    /** Gets or sets a boolean indicating if frustum lines must be rendered (true by default)) */
    get displayFrustum(): boolean;
    set displayFrustum(value: boolean);
    /**
     * The camera that the gizmo is attached to
     */
    set camera(camera: Nullable<Camera>);
    get camera(): Nullable<Camera>;
    /**
     * Gets the material used to render the camera gizmo
     */
    get material(): StandardMaterial;
    /**
     * @hidden
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    protected _update(): void;
    private static _Scale;
    private _invProjection;
    /**
     * Disposes of the camera gizmo
     */
    dispose(): void;
    private static _CreateCameraMesh;
    private static _CreateCameraFrustum;
}
