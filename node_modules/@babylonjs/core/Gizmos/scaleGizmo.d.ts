import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import type { GizmoAxisCache } from "./gizmo";
import { Gizmo } from "./gizmo";
import { AxisScaleGizmo } from "./axisScaleGizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { Mesh } from "../Meshes/mesh";
import type { Node } from "../node";
import type { GizmoManager } from "./gizmoManager";
/**
 * Gizmo that enables scaling a mesh along 3 axis
 */
export declare class ScaleGizmo extends Gizmo {
    /**
     * Internal gizmo used for interactions on the x axis
     */
    xGizmo: AxisScaleGizmo;
    /**
     * Internal gizmo used for interactions on the y axis
     */
    yGizmo: AxisScaleGizmo;
    /**
     * Internal gizmo used for interactions on the z axis
     */
    zGizmo: AxisScaleGizmo;
    /**
     * Internal gizmo used to scale all axis equally
     */
    uniformScaleGizmo: AxisScaleGizmo;
    private _meshAttached;
    private _nodeAttached;
    private _snapDistance;
    private _uniformScalingMesh;
    private _octahedron;
    private _sensitivity;
    private _coloredMaterial;
    private _hoverMaterial;
    private _disableMaterial;
    private _observables;
    /** Node Caching for quick lookup */
    private _gizmoAxisCache;
    /** Fires an event when any of it's sub gizmos are dragged */
    onDragStartObservable: Observable<unknown>;
    /** Fires an event when any of it's sub gizmos are released from dragging */
    onDragEndObservable: Observable<unknown>;
    get attachedMesh(): Nullable<AbstractMesh>;
    set attachedMesh(mesh: Nullable<AbstractMesh>);
    get attachedNode(): Nullable<Node>;
    set attachedNode(node: Nullable<Node>);
    /**
     * True when the mouse pointer is hovering a gizmo mesh
     */
    get isHovered(): boolean;
    /**
     * Creates a ScaleGizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param thickness display gizmo axis thickness
     * @param gizmoManager
     */
    constructor(gizmoLayer?: UtilityLayerRenderer, thickness?: number, gizmoManager?: GizmoManager);
    /** Create Geometry for Gizmo */
    private _createUniformScaleMesh;
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
     * Sensitivity factor for dragging (Default: 1)
     */
    set sensitivity(value: number);
    get sensitivity(): number;
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
}
