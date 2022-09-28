import type { Nullable } from "../types";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { Node } from "../node";
import { StandardMaterial } from "../Materials/standardMaterial";
import type { Light } from "../Lights/light";
import { Observable } from "../Misc/observable";
/**
 * Gizmo that enables viewing a light
 */
export declare class LightGizmo extends Gizmo {
    private _lightMesh;
    private _material;
    private _cachedPosition;
    private _cachedForward;
    private _attachedMeshParent;
    private _pointerObserver;
    /**
     * Event that fires each time the gizmo is clicked
     */
    onClickedObservable: Observable<Light>;
    /**
     * Creates a LightGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(gizmoLayer?: UtilityLayerRenderer);
    private _light;
    /**
     * Override attachedNode because lightgizmo only support attached mesh
     * It will return the attached mesh (if any) and setting an attached node will log
     * a warning
     */
    get attachedNode(): Nullable<Node>;
    set attachedNode(value: Nullable<Node>);
    /**
     * The light that the gizmo is attached to
     */
    set light(light: Nullable<Light>);
    get light(): Nullable<Light>;
    /**
     * Gets the material used to render the light gizmo
     */
    get material(): StandardMaterial;
    /**
     * @hidden
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    protected _update(): void;
    private static _Scale;
    /**
     * Creates the lines for a light mesh
     * @param levels
     * @param scene
     */
    private static _CreateLightLines;
    /**
     * Disposes of the light gizmo
     */
    dispose(): void;
    private static _CreateHemisphericLightMesh;
    private static _CreatePointLightMesh;
    private static _CreateSpotLightMesh;
    private static _CreateDirectionalLightMesh;
}
