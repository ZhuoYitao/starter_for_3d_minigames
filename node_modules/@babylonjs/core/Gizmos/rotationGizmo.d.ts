import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import { Color3 } from "../Maths/math.color";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import type { Mesh } from "../Meshes/mesh";
import type { GizmoAxisCache } from "./gizmo";
import { Gizmo } from "./gizmo";
import { PlaneRotationGizmo } from "./planeRotationGizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { Node } from "../node";
import type { GizmoManager } from "./gizmoManager";
/**
 * Options for each individual plane rotation gizmo contained within RotationGizmo
 * @since 5.0.0
 */
export interface PlaneRotationGizmoOptions {
    /**
     * Color to use for the plane rotation gizmo
     */
    color?: Color3;
}
/**
 * Additional options for each rotation gizmo
 */
export interface RotationGizmoOptions {
    /**
     * When set, the gizmo will always appear the same size no matter where the camera is (default: true)
     */
    updateScale?: boolean;
    /**
     * Specific options for xGizmo
     */
    xOptions?: PlaneRotationGizmoOptions;
    /**
     * Specific options for yGizmo
     */
    yOptions?: PlaneRotationGizmoOptions;
    /**
     * Specific options for zGizmo
     */
    zOptions?: PlaneRotationGizmoOptions;
}
/**
 * Gizmo that enables rotating a mesh along 3 axis
 */
export declare class RotationGizmo extends Gizmo {
    /**
     * Internal gizmo used for interactions on the x axis
     */
    xGizmo: PlaneRotationGizmo;
    /**
     * Internal gizmo used for interactions on the y axis
     */
    yGizmo: PlaneRotationGizmo;
    /**
     * Internal gizmo used for interactions on the z axis
     */
    zGizmo: PlaneRotationGizmo;
    /** Fires an event when any of it's sub gizmos are dragged */
    onDragStartObservable: Observable<unknown>;
    /** Fires an event when any of it's sub gizmos are released from dragging */
    onDragEndObservable: Observable<unknown>;
    private _meshAttached;
    private _nodeAttached;
    private _observables;
    /** Node Caching for quick lookup */
    private _gizmoAxisCache;
    get attachedMesh(): Nullable<AbstractMesh>;
    set attachedMesh(mesh: Nullable<AbstractMesh>);
    get attachedNode(): Nullable<Node>;
    set attachedNode(node: Nullable<Node>);
    protected _checkBillboardTransform(): void;
    /**
     * True when the mouse pointer is hovering a gizmo mesh
     */
    get isHovered(): boolean;
    /**
     * Creates a RotationGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param tessellation Amount of tessellation to be used when creating rotation circles
     * @param useEulerRotation Use and update Euler angle instead of quaternion
     * @param thickness display gizmo axis thickness
     * @param gizmoManager Gizmo manager
     * @param options More options
     */
    constructor(gizmoLayer?: UtilityLayerRenderer, tessellation?: number, useEulerRotation?: boolean, thickness?: number, gizmoManager?: GizmoManager, options?: RotationGizmoOptions);
    set updateGizmoRotationToMatchAttachedMesh(value: boolean);
    get updateGizmoRotationToMatchAttachedMesh(): boolean;
    /**
     * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
     */
    set snapDistance(value: number);
    get snapDistance(): number;
    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    set scaleRatio(value: number);
    get scaleRatio(): number;
    /**
     * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
     * @param mesh Axis gizmo mesh
     * @param cache Gizmo axis definition used for reactive gizmo UI
     */
    addToAxisCache(mesh: Mesh, cache: GizmoAxisCache): void;
    /**
     * Disposes of the gizmo
     */
    dispose(): void;
    /**
     * CustomMeshes are not supported by this gizmo
     */
    setCustomMesh(): void;
}
