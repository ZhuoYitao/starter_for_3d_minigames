import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import type { Scene, IDisposable } from "../scene";
import type { Node } from "../node";
import { AbstractMesh } from "../Meshes/abstractMesh";
import type { Mesh } from "../Meshes/mesh";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import { SixDofDragBehavior } from "../Behaviors/Meshes/sixDofDragBehavior";
import type { GizmoAxisCache } from "./gizmo";
import { RotationGizmo } from "./rotationGizmo";
import { PositionGizmo } from "./positionGizmo";
import { ScaleGizmo } from "./scaleGizmo";
import { BoundingBoxGizmo } from "./boundingBoxGizmo";
/**
 * Helps setup gizmo's in the scene to rotate/scale/position nodes
 */
export declare class GizmoManager implements IDisposable {
    private _scene;
    /**
     * Gizmo's created by the gizmo manager, gizmo will be null until gizmo has been enabled for the first time
     */
    gizmos: {
        positionGizmo: Nullable<PositionGizmo>;
        rotationGizmo: Nullable<RotationGizmo>;
        scaleGizmo: Nullable<ScaleGizmo>;
        boundingBoxGizmo: Nullable<BoundingBoxGizmo>;
    };
    /** When true, the gizmo will be detached from the current object when a pointer down occurs with an empty picked mesh */
    clearGizmoOnEmptyPointerEvent: boolean;
    /** When true (default), picking to attach a new mesh is enabled. This works in sync with inspector autopicking. */
    enableAutoPicking: boolean;
    /** Fires an event when the manager is attached to a mesh */
    onAttachedToMeshObservable: Observable<Nullable<AbstractMesh>>;
    /** Fires an event when the manager is attached to a node */
    onAttachedToNodeObservable: Observable<Nullable<Node>>;
    private _gizmosEnabled;
    private _pointerObservers;
    private _attachedMesh;
    private _attachedNode;
    private _boundingBoxColor;
    private _defaultUtilityLayer;
    private _defaultKeepDepthUtilityLayer;
    private _thickness;
    private _scaleRatio;
    /** Node Caching for quick lookup */
    private _gizmoAxisCache;
    /**
     * When bounding box gizmo is enabled, this can be used to track drag/end events
     */
    boundingBoxDragBehavior: SixDofDragBehavior;
    /**
     * Array of meshes which will have the gizmo attached when a pointer selected them. If null, all meshes are attachable. (Default: null)
     */
    attachableMeshes: Nullable<Array<AbstractMesh>>;
    /**
     * Array of nodes which will have the gizmo attached when a pointer selected them. If null, all nodes are attachable. (Default: null)
     */
    attachableNodes: Nullable<Array<Node>>;
    /**
     * If pointer events should perform attaching/detaching a gizmo, if false this can be done manually via attachToMesh/attachToNode. (Default: true)
     */
    usePointerToAttachGizmos: boolean;
    /**
     * Utility layer that the bounding box gizmo belongs to
     */
    get keepDepthUtilityLayer(): UtilityLayerRenderer;
    /**
     * Utility layer that all gizmos besides bounding box belong to
     */
    get utilityLayer(): UtilityLayerRenderer;
    /**
     * True when the mouse pointer is hovering a gizmo mesh
     */
    get isHovered(): boolean;
    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    set scaleRatio(value: number);
    get scaleRatio(): number;
    /**
     * Instantiates a gizmo manager
     * @param _scene the scene to overlay the gizmos on top of
     * @param thickness display gizmo axis thickness
     * @param utilityLayer the layer where gizmos are rendered
     * @param keepDepthUtilityLayer the layer where occluded gizmos are rendered
     */
    constructor(_scene: Scene, thickness?: number, utilityLayer?: UtilityLayerRenderer, keepDepthUtilityLayer?: UtilityLayerRenderer);
    /**
     * Subscribes to pointer down events, for attaching and detaching mesh
     * @param scene The scene layer the observer will be added to
     */
    private _attachToMeshPointerObserver;
    /**
     * Attaches a set of gizmos to the specified mesh
     * @param mesh The mesh the gizmo's should be attached to
     */
    attachToMesh(mesh: Nullable<AbstractMesh>): void;
    /**
     * Attaches a set of gizmos to the specified node
     * @param node The node the gizmo's should be attached to
     */
    attachToNode(node: Nullable<Node>): void;
    /**
     * If the position gizmo is enabled
     */
    set positionGizmoEnabled(value: boolean);
    get positionGizmoEnabled(): boolean;
    /**
     * If the rotation gizmo is enabled
     */
    set rotationGizmoEnabled(value: boolean);
    get rotationGizmoEnabled(): boolean;
    /**
     * If the scale gizmo is enabled
     */
    set scaleGizmoEnabled(value: boolean);
    get scaleGizmoEnabled(): boolean;
    /**
     * If the boundingBox gizmo is enabled
     */
    set boundingBoxGizmoEnabled(value: boolean);
    get boundingBoxGizmoEnabled(): boolean;
    /**
     * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
     * @param gizmoAxisCache Gizmo axis definition used for reactive gizmo UI
     */
    addToAxisCache(gizmoAxisCache: Map<Mesh, GizmoAxisCache>): void;
    /**
     * Disposes of the gizmo manager
     */
    dispose(): void;
}
