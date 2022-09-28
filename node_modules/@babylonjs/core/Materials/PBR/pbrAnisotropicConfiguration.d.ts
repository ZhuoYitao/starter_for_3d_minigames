import type { UniformBuffer } from "../../Materials/uniformBuffer";
import { Vector2 } from "../../Maths/math.vector";
import type { BaseTexture } from "../../Materials/Textures/baseTexture";
import type { Nullable } from "../../types";
import type { IAnimatable } from "../../Animations/animatable.interface";
import type { EffectFallbacks } from "../effectFallbacks";
import { MaterialPluginBase } from "../materialPluginBase";
import { MaterialDefines } from "../materialDefines";
declare type Scene = import("../../scene").Scene;
declare type AbstractMesh = import("../../Meshes/abstractMesh").AbstractMesh;
declare type PBRBaseMaterial = import("./pbrBaseMaterial").PBRBaseMaterial;
/**
 * @hidden
 */
export declare class MaterialAnisotropicDefines extends MaterialDefines {
    ANISOTROPIC: boolean;
    ANISOTROPIC_TEXTURE: boolean;
    ANISOTROPIC_TEXTUREDIRECTUV: number;
    MAINUV1: boolean;
}
/**
 * Plugin that implements the anisotropic component of the PBR material
 */
export declare class PBRAnisotropicConfiguration extends MaterialPluginBase {
    private _isEnabled;
    /**
     * Defines if the anisotropy is enabled in the material.
     */
    isEnabled: boolean;
    /**
     * Defines the anisotropy strength (between 0 and 1) it defaults to 1.
     */
    intensity: number;
    /**
     * Defines if the effect is along the tangents, bitangents or in between.
     * By default, the effect is "stretching" the highlights along the tangents.
     */
    direction: Vector2;
    private _texture;
    /**
     * Stores the anisotropy values in a texture.
     * rg is direction (like normal from -1 to 1)
     * b is a intensity
     */
    texture: Nullable<BaseTexture>;
    /** @hidden */
    private _internalMarkAllSubMeshesAsTexturesDirty;
    /** @hidden */
    _markAllSubMeshesAsTexturesDirty(): void;
    constructor(material: PBRBaseMaterial, addToPluginList?: boolean);
    isReadyForSubMesh(defines: MaterialAnisotropicDefines, scene: Scene): boolean;
    prepareDefines(defines: MaterialAnisotropicDefines, scene: Scene, mesh: AbstractMesh): void;
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene): void;
    hasTexture(texture: BaseTexture): boolean;
    getActiveTextures(activeTextures: BaseTexture[]): void;
    getAnimatables(animatables: IAnimatable[]): void;
    dispose(forceDisposeTextures?: boolean): void;
    getClassName(): string;
    addFallbacks(defines: MaterialAnisotropicDefines, fallbacks: EffectFallbacks, currentRank: number): number;
    getSamplers(samplers: string[]): void;
    getUniforms(): {
        ubo?: Array<{
            name: string;
            size: number;
            type: string;
        }>;
        vertex?: string;
        fragment?: string;
    };
}
export {};
