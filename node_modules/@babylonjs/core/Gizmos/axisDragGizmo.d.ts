import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import { Vector3 } from "../Maths/math.vector";
import { TransformNode } from "../Meshes/transformNode";
import type { Node } from "../node";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior";
import { Gizmo } from "./gizmo";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import { StandardMaterial } from "../Materials/standardMaterial";
import type { Scene } from "../scene";
import type { PositionGizmo } from "./positionGizmo";
import { Color3 } from "../Maths/math.color";
/**
 * Single axis drag gizmo
 */
export declare class AxisDragGizmo extends Gizmo {
    /**
     * Drag behavior responsible for the gizmos dragging interactions
     */
    dragBehavior: PointerDragBehavior;
    private _pointerObserver;
    /**
     * Drag distance in babylon units that the gizmo will snap to when dragged (Default: 0)
     */
    snapDistance: number;
    /**
     * Event that fires each time the gizmo snaps to a new location.
     * * snapDistance is the the change in distance
     */
    onSnapObservable: Observable<{
        snapDistance: number;
    }>;
    private _isEnabled;
    private _parent;
    private _gizmoMesh;
    private _coloredMaterial;
    private _hoverMaterial;
    private _disableMaterial;
    private _dragging;
    /**
     * @param scene
     * @param material
     * @param thickness
     * @param isCollider
     * @hidden
     */
    static _CreateArrow(scene: Scene, material: StandardMaterial, thickness?: number, isCollider?: boolean): TransformNode;
    /**
     * @param scene
     * @param arrow
     * @hidden
     */
    static _CreateArrowInstance(scene: Scene, arrow: TransformNode): TransformNode;
    /**
     * Creates an AxisDragGizmo
     * @param dragAxis The axis which the gizmo will be able to drag on
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param parent
     * @param thickness display gizmo axis thickness
     */
    constructor(dragAxis: Vector3, color?: Color3, gizmoLayer?: UtilityLayerRenderer, parent?: Nullable<PositionGizmo>, thickness?: number);
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
