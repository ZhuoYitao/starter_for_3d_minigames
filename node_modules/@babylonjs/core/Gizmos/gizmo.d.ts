import type { Observer } from "../Misc/observable";
import type { Nullable } from "../types";
import type { IDisposable } from "../scene";
import { Quaternion } from "../Maths/math.vector";
import type { AbstractMesh } from "../Meshes/abstractMesh";
import { Mesh } from "../Meshes/mesh";
import type { Node } from "../node";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { StandardMaterial } from "../Materials/standardMaterial";
import type { PointerInfo } from "../Events/pointerEvents";
import type { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior";
/**
 * Cache built by each axis. Used for managing state between all elements of gizmo for enhanced UI
 */
export interface GizmoAxisCache {
    /** Mesh used to render the Gizmo */
    gizmoMeshes: Mesh[];
    /** Mesh used to detect user interaction with Gizmo */
    colliderMeshes: Mesh[];
    /** Material used to indicate color of gizmo mesh */
    material: StandardMaterial;
    /** Material used to indicate hover state of the Gizmo */
    hoverMaterial: StandardMaterial;
    /** Material used to indicate disabled state of the Gizmo */
    disableMaterial: StandardMaterial;
    /** Used to indicate Active state of the Gizmo */
    active: boolean;
    /** DragBehavior */
    dragBehavior: PointerDragBehavior;
}
/**
 * Renders gizmos on top of an existing scene which provide controls for position, rotation, etc.
 */
export declare class Gizmo implements IDisposable {
    /** The utility layer the gizmo will be added to */
    gizmoLayer: UtilityLayerRenderer;
    /**
     * The root mesh of the gizmo
     */
    _rootMesh: Mesh;
    private _attachedMesh;
    private _attachedNode;
    private _customRotationQuaternion;
    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    protected _scaleRatio: number;
    /**
     * boolean updated by pointermove when a gizmo mesh is hovered
     */
    protected _isHovered: boolean;
    /**
     * When enabled, any gizmo operation will perserve scaling sign. Default is off.
     * Only valid for TransformNode derived classes (Mesh, AbstractMesh, ...)
     */
    static PreserveScaling: boolean;
    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    set scaleRatio(value: number);
    get scaleRatio(): number;
    /**
     * True when the mouse pointer is hovered a gizmo mesh
     */
    get isHovered(): boolean;
    /**
     * If a custom mesh has been set (Default: false)
     */
    protected _customMeshSet: boolean;
    /**
     * Mesh that the gizmo will be attached to. (eg. on a drag gizmo the mesh that will be dragged)
     * * When set, interactions will be enabled
     */
    get attachedMesh(): Nullable<AbstractMesh>;
    set attachedMesh(value: Nullable<AbstractMesh>);
    /**
     * Node that the gizmo will be attached to. (eg. on a drag gizmo the mesh, bone or NodeTransform that will be dragged)
     * * When set, interactions will be enabled
     */
    get attachedNode(): Nullable<Node>;
    set attachedNode(value: Nullable<Node>);
    /**
     * Disposes and replaces the current meshes in the gizmo with the specified mesh
     * @param mesh The mesh to replace the default mesh of the gizmo
     */
    setCustomMesh(mesh: Mesh): void;
    protected _updateGizmoRotationToMatchAttachedMesh: boolean;
    /**
     * If set the gizmo's rotation will be updated to match the attached mesh each frame (Default: true)
     */
    set updateGizmoRotationToMatchAttachedMesh(value: boolean);
    get updateGizmoRotationToMatchAttachedMesh(): boolean;
    /**
     * If set the gizmo's position will be updated to match the attached mesh each frame (Default: true)
     */
    updateGizmoPositionToMatchAttachedMesh: boolean;
    /**
     * When set, the gizmo will always appear the same size no matter where the camera is (default: true)
     */
    updateScale: boolean;
    protected _interactionsEnabled: boolean;
    protected _attachedNodeChanged(value: Nullable<Node>): void;
    private _beforeRenderObserver;
    private _tempQuaternion;
    private _tempVector;
    private _tempVector2;
    private _tempMatrix1;
    private _tempMatrix2;
    private _rightHandtoLeftHandMatrix;
    /**
     * Creates a gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(
    /** The utility layer the gizmo will be added to */
    gizmoLayer?: UtilityLayerRenderer);
    /**
     * posture that the gizmo will be display
     * When set null, default value will be used (Quaternion(0, 0, 0, 1))
     */
    get customRotationQuaternion(): Nullable<Quaternion>;
    set customRotationQuaternion(customRotationQuaternion: Nullable<Quaternion>);
    /**
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    protected _update(): void;
    /**
     * Handle position/translation when using an attached node using pivot
     */
    protected _handlePivot(): void;
    /**
     * computes the rotation/scaling/position of the transform once the Node world matrix has changed.
     */
    protected _matrixChanged(): void;
    /**
     * refresh gizmo mesh material
     * @param gizmoMeshes
     * @param material material to apply
     */
    protected _setGizmoMeshMaterial(gizmoMeshes: Mesh[], material: StandardMaterial): void;
    /**
     * Subscribes to pointer up, down, and hover events. Used for responsive gizmos.
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param gizmoAxisCache Gizmo axis definition used for reactive gizmo UI
     * @returns {Observer<PointerInfo>} pointerObserver
     */
    static GizmoAxisPointerObserver(gizmoLayer: UtilityLayerRenderer, gizmoAxisCache: Map<Mesh, GizmoAxisCache>): Observer<PointerInfo>;
    /**
     * Disposes of the gizmo
     */
    dispose(): void;
}
