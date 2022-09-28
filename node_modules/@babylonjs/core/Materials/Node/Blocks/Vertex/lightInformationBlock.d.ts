import { NodeMaterialBlock } from "../../nodeMaterialBlock";
import type { NodeMaterialBuildState } from "../../nodeMaterialBuildState";
import type { NodeMaterialConnectionPoint } from "../../nodeMaterialBlockConnectionPoint";
import type { Nullable } from "../../../../types";
import type { Scene } from "../../../../scene";
import type { Effect } from "../../../effect";
import type { NodeMaterial, NodeMaterialDefines } from "../../nodeMaterial";
import type { Mesh } from "../../../../Meshes/mesh";
import type { Light } from "../../../../Lights/light";
import type { AbstractMesh } from "../../../../Meshes/abstractMesh";
/**
 * Block used to get data information from a light
 */
export declare class LightInformationBlock extends NodeMaterialBlock {
    private _lightDataUniformName;
    private _lightColorUniformName;
    private _lightTypeDefineName;
    private _forcePrepareDefines;
    /**
     * Gets or sets the light associated with this block
     */
    light: Nullable<Light>;
    /**
     * Creates a new LightInformationBlock
     * @param name defines the block name
     */
    constructor(name: string);
    /**
     * Gets the current class name
     * @returns the class name
     */
    getClassName(): string;
    /**
     * Gets the world position input component
     */
    get worldPosition(): NodeMaterialConnectionPoint;
    /**
     * Gets the direction output component
     */
    get direction(): NodeMaterialConnectionPoint;
    /**
     * Gets the direction output component
     */
    get color(): NodeMaterialConnectionPoint;
    /**
     * Gets the direction output component
     */
    get intensity(): NodeMaterialConnectionPoint;
    bind(effect: Effect, nodeMaterial: NodeMaterial, mesh?: Mesh): void;
    prepareDefines(mesh: AbstractMesh, nodeMaterial: NodeMaterial, defines: NodeMaterialDefines): void;
    protected _buildBlock(state: NodeMaterialBuildState): this;
    serialize(): any;
    _deserialize(serializationObject: any, scene: Scene, rootUrl: string): void;
}
