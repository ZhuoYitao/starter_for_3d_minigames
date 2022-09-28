import { NodeMaterialBlock } from "../../nodeMaterialBlock";
import type { NodeMaterialBuildState } from "../../nodeMaterialBuildState";
import type { NodeMaterialConnectionPoint } from "../../nodeMaterialBlockConnectionPoint";
import type { Scene } from "../../../../scene";
import type { AbstractMesh } from "../../../../Meshes/abstractMesh";
import type { NodeMaterialDefines } from "../../nodeMaterial";
declare type NodeMaterial = import("../../nodeMaterial").NodeMaterial;
declare type Effect = import("../../../effect").Effect;
declare type Mesh = import("../../../../Meshes/mesh").Mesh;
/**
 * Block used to output the final color
 */
export declare class FragmentOutputBlock extends NodeMaterialBlock {
    private _linearDefineName;
    private _gammaDefineName;
    /**
     * Create a new FragmentOutputBlock
     * @param name defines the block name
     */
    constructor(name: string);
    /** Gets or sets a boolean indicating if content needs to be converted to gamma space */
    convertToGammaSpace: boolean;
    /** Gets or sets a boolean indicating if content needs to be converted to linear space */
    convertToLinearSpace: boolean;
    /** Gets or sets a boolean indicating if logarithmic depth should be used */
    useLogarithmicDepth: boolean;
    /**
     * Gets the current class name
     * @returns the class name
     */
    getClassName(): string;
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    initialize(state: NodeMaterialBuildState): void;
    /**
     * Gets the rgba input component
     */
    get rgba(): NodeMaterialConnectionPoint;
    /**
     * Gets the rgb input component
     */
    get rgb(): NodeMaterialConnectionPoint;
    /**
     * Gets the a input component
     */
    get a(): NodeMaterialConnectionPoint;
    prepareDefines(mesh: AbstractMesh, nodeMaterial: NodeMaterial, defines: NodeMaterialDefines): void;
    bind(effect: Effect, nodeMaterial: NodeMaterial, mesh?: Mesh): void;
    protected _buildBlock(state: NodeMaterialBuildState): this;
    protected _dumpPropertiesCode(): string;
    serialize(): any;
    _deserialize(serializationObject: any, scene: Scene, rootUrl: string): void;
}
export {};
