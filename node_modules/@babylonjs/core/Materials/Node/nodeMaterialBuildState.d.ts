import { NodeMaterialBlockConnectionPointTypes } from "./Enums/nodeMaterialBlockConnectionPointTypes";
import { NodeMaterialBlockTargets } from "./Enums/nodeMaterialBlockTargets";
import type { NodeMaterialBuildStateSharedData } from "./nodeMaterialBuildStateSharedData";
/**
 * Class used to store node based material build state
 */
export declare class NodeMaterialBuildState {
    /** Gets or sets a boolean indicating if the current state can emit uniform buffers */
    supportUniformBuffers: boolean;
    /**
     * Gets the list of emitted attributes
     */
    attributes: string[];
    /**
     * Gets the list of emitted uniforms
     */
    uniforms: string[];
    /**
     * Gets the list of emitted constants
     */
    constants: string[];
    /**
     * Gets the list of emitted samplers
     */
    samplers: string[];
    /**
     * Gets the list of emitted functions
     */
    functions: {
        [key: string]: string;
    };
    /**
     * Gets the list of emitted extensions
     */
    extensions: {
        [key: string]: string;
    };
    /**
     * Gets the target of the compilation state
     */
    target: NodeMaterialBlockTargets;
    /**
     * Gets the list of emitted counters
     */
    counters: {
        [key: string]: number;
    };
    /**
     * Shared data between multiple NodeMaterialBuildState instances
     */
    sharedData: NodeMaterialBuildStateSharedData;
    /** @hidden */
    _vertexState: NodeMaterialBuildState;
    /** @hidden */
    _attributeDeclaration: string;
    /** @hidden */
    _uniformDeclaration: string;
    /** @hidden */
    _constantDeclaration: string;
    /** @hidden */
    _samplerDeclaration: string;
    /** @hidden */
    _varyingTransfer: string;
    /** @hidden */
    _injectAtEnd: string;
    private _repeatableContentAnchorIndex;
    /** @hidden */
    _builtCompilationString: string;
    /**
     * Gets the emitted compilation strings
     */
    compilationString: string;
    /**
     * Finalize the compilation strings
     * @param state defines the current compilation state
     */
    finalize(state: NodeMaterialBuildState): void;
    /** @hidden */
    get _repeatableContentAnchor(): string;
    /**
     * @param prefix
     * @hidden
     */
    _getFreeVariableName(prefix: string): string;
    /**
     * @param prefix
     * @hidden
     */
    _getFreeDefineName(prefix: string): string;
    /**
     * @param name
     * @hidden
     */
    _excludeVariableName(name: string): void;
    /**
     * @param name
     * @hidden
     */
    _emit2DSampler(name: string): void;
    /**
     * @param type
     * @hidden
     */
    _getGLType(type: NodeMaterialBlockConnectionPointTypes): string;
    /**
     * @param name
     * @param extension
     * @param define
     * @hidden
     */
    _emitExtension(name: string, extension: string, define?: string): void;
    /**
     * @param name
     * @param code
     * @param comments
     * @hidden
     */
    _emitFunction(name: string, code: string, comments: string): void;
    /**
     * @param includeName
     * @param comments
     * @param options
     * @param options.replaceStrings
     * @param options.repeatKey
     * @hidden
     */
    _emitCodeFromInclude(includeName: string, comments: string, options?: {
        replaceStrings?: {
            search: RegExp;
            replace: string;
        }[];
        repeatKey?: string;
    }): string;
    /**
     * @param includeName
     * @param comments
     * @param options
     * @param options.repeatKey
     * @param options.removeAttributes
     * @param options.removeUniforms
     * @param options.removeVaryings
     * @param options.removeIfDef
     * @param options.replaceStrings
     * @param storeKey
     * @hidden
     */
    _emitFunctionFromInclude(includeName: string, comments: string, options?: {
        repeatKey?: string;
        removeAttributes?: boolean;
        removeUniforms?: boolean;
        removeVaryings?: boolean;
        removeIfDef?: boolean;
        replaceStrings?: {
            search: RegExp;
            replace: string;
        }[];
    }, storeKey?: string): void;
    /**
     * @param name
     * @hidden
     */
    _registerTempVariable(name: string): boolean;
    /**
     * @param name
     * @param type
     * @param define
     * @param notDefine
     * @hidden
     */
    _emitVaryingFromString(name: string, type: string, define?: string, notDefine?: boolean): boolean;
    /**
     * @param name
     * @param type
     * @param define
     * @param notDefine
     * @hidden
     */
    _emitUniformFromString(name: string, type: string, define?: string, notDefine?: boolean): void;
    /**
     * @param value
     * @hidden
     */
    _emitFloat(value: number): string;
}
