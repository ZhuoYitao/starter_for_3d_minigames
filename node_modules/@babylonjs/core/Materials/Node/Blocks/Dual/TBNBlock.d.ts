import { NodeMaterialBlock } from "../../nodeMaterialBlock";
import type { NodeMaterialBuildState } from "../../nodeMaterialBuildState";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets";
import { NodeMaterialConnectionPoint } from "../../nodeMaterialBlockConnectionPoint";
import { NodeMaterial, NodeMaterialDefines } from "../../nodeMaterial";
import { AbstractMesh } from "../../../../Meshes/abstractMesh";
/**
 * Block used to implement TBN matrix
 */
export declare class TBNBlock extends NodeMaterialBlock {
    /**
     * Create a new TBNBlock
     * @param name defines the block name
     */
    constructor(name: string);
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
     * Gets the normal input component
     */
    get normal(): NodeMaterialConnectionPoint;
    /**
     * Gets the tangent input component
     */
    get tangent(): NodeMaterialConnectionPoint;
    /**
     * Gets the world matrix input component
     */
    get world(): NodeMaterialConnectionPoint;
    /**
     * Gets the TBN output component
     */
    get TBN(): NodeMaterialConnectionPoint;
    get target(): NodeMaterialBlockTargets;
    set target(value: NodeMaterialBlockTargets);
    autoConfigure(material: NodeMaterial): void;
    prepareDefines(mesh: AbstractMesh, nodeMaterial: NodeMaterial, defines: NodeMaterialDefines): void;
    protected _buildBlock(state: NodeMaterialBuildState): this;
}
