import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import { Vector3 } from "../Maths/math.vector";
import { Color3 } from "../Maths/math.color";
import "../Meshes/Builders/linesBuilder";
import type { Node } from "../node";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import type { RotationGizmo } from "./rotationGizmo";
/**
 * Single plane rotation gizmo
 */
export declare class PlaneRotationGizmo extends Gizmo {
    /**
     * Drag behavior responsible for the gizmos dragging interactions
     */
    dragBehavior: PointerDragBehavior;
    private _pointerObserver;
    /**
     * Rotation distance in radians that the gizmo will snap to (Default: 0)
     */
    snapDistance: number;
    /**
     * Event that fires each time the gizmo snaps to a new location.
     * * snapDistance is the the change in distance
     */
    onSnapObservable: Observable<{
        snapDistance: number;
    }>;
    /**
     * The maximum angle between the camera and the rotation allowed for interaction
     * If a rotation plane appears 'flat', a lower value allows interaction.
     */
    static MaxDragAngle: number;
    /**
     * Accumulated relative angle value for rotation on the axis. Reset to 0 when a dragStart occurs
     */
    angle: number;
    private _isEnabled;
    private _parent;
    private _coloredMaterial;
    private _hoverMaterial;
    private _disableMaterial;
    private _gizmoMesh;
    private _rotationDisplayPlane;
    private _dragging;
    private _angles;
    private static _RotationGizmoVertexShader;
    private static _RotationGizmoFragmentShader;
    private _rotationShaderMaterial;
    /**
     * Creates a PlaneRotationGizmo
     * @param planeNormal The normal of the plane which the gizmo will be able to rotate on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param tessellation Amount of tessellation to be used when creating rotation circles
     * @param parent
     * @param useEulerRotation Use and update Euler angle instead of quaternion
     * @param thickness display gizmo axis thickness
     */
    constructor(planeNormal: Vector3, color?: Color3, gizmoLayer?: UtilityLayerRenderer, tessellation?: number, parent?: Nullable<RotationGizmo>, useEulerRotation?: boolean, thickness?: number);
    /**
     * Create Geometry for Gizmo
     * @param parentMesh
     * @param thickness
     * @param tessellation
     */
    private _createGizmoMesh;
    protected _attachedNodeChanged(value: Nullable<Node>): void;
    /**
     * If the gizmo is enabled
     */
    set isEnabled(value: boolean);
    get isEnabled(): boolean;
    /**
     * Disposes of the gizmo
     */
    dispose(): void;
}
