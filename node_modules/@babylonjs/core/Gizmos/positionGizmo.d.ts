import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import type { Node } from "../node";
import type { Mesh } from "../Meshes/mesh";
import type { GizmoAxisCache } from "./gizmo";
import { Gizmo } from "./gizmo";
import { AxisDragGizmo } from "./axisDragGizmo";
import { PlaneDragGizmo } from "./planeDragGizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { GizmoManager } from "./gizmoManager";
/**
 * Gizmo that enables dragging a mesh along 3 axis
 */
export declare class PositionGizmo extends Gizmo {
    /**
     * Internal gizmo used for interactions on the x axis
     */
    xGizmo: AxisDragGizmo;
    /**
     * Internal gizmo used for interactions on the y axis
     */
    yGizmo: AxisDragGizmo;
    /**
     * Internal gizmo used for interactions on the z axis
     */
    zGizmo: AxisDragGizmo;
    /**
     * Internal gizmo used for interactions on the yz plane
     */
    xPlaneGizmo: PlaneDragGizmo;
    /**
     * Internal gizmo used for interactions on the xz plane
     */
    yPlaneGizmo: PlaneDragGizmo;
    /**
     * Internal gizmo used for interactions on the xy plane
     */
    zPlaneGizmo: PlaneDragGizmo;
    /**
     * private variables
     */
    private _meshAttached;
    private _nodeAttached;
    private _snapDistance;
    private _observables;
    /** Node Caching for quick lookup */
    private _gizmoAxisCache;
    /** Fires an event when any of it's sub gizmos are dragged */
    onDragStartObservable: Observable<unknown>;
    /** Fires an event when any of it's sub gizmos are released from dragging */
    onDragEndObservable: Observable<unknown>;
    /**
     * If set to true, planar drag is enabled
     */
    private _planarGizmoEnabled;
    get attachedMesh(): Nullable<AbstractMesh>;
    set attachedMesh(mesh: Nullable<AbstractMesh>);
    get attachedNode(): Nullable<Node>;
    set attachedNode(node: Nullable<Node>);
    /**
     * True when the mouse pointer is hovering a gizmo mesh
     */
    get isHovered(): boolean;
    /**
     * Creates a PositionGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
      @param thickness display gizmo axis thickness
     * @param gizmoManager
     */
    constructor(gizmoLayer?: UtilityLayerRenderer, thickness?: number, gizmoManager?: GizmoManager);
    /**
     * If the planar drag gizmo is enabled
     * setting this will enable/disable XY, XZ and YZ planes regardless of individual gizmo settings.
     */
    set planarGizmoEnabled(value: boolean);
    get planarGizmoEnabled(): boolean;
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
