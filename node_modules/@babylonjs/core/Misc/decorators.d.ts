import type { Nullable } from "../types";
import type { IAnimatable } from "../Animations/animatable.interface";
declare type Scene = import("../scene").Scene;
declare type ImageProcessingConfiguration = import("../Materials/imageProcessingConfiguration").ImageProcessingConfiguration;
declare type FresnelParameters = import("../Materials/fresnelParameters").FresnelParameters;
declare type ColorCurves = import("../Materials/colorCurves").ColorCurves;
declare type BaseTexture = import("../Materials/Textures/baseTexture").BaseTexture;
export declare function expandToProperty(callback: string, targetKey?: Nullable<string>): (target: any, propertyKey: string) => void;
export declare function serialize(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsTexture(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsColor3(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsFresnelParameters(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsVector2(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsVector3(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsMeshReference(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsColorCurves(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsColor4(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsImageProcessingConfiguration(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsQuaternion(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
export declare function serializeAsMatrix(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
/**
 * Decorator used to define property that can be serialized as reference to a camera
 * @param sourceName defines the name of the property to decorate
 */
export declare function serializeAsCameraReference(sourceName?: string): (target: any, propertyKey: string | symbol) => void;
/**
 * Class used to help serialization objects
 */
export declare class SerializationHelper {
    /**
     * Gets or sets a boolean to indicate if the UniqueId property should be serialized
     */
    static AllowLoadingUniqueId: boolean;
    /**
     * @param sourceProperty
     * @hidden
     */
    static _ImageProcessingConfigurationParser: (sourceProperty: any) => ImageProcessingConfiguration;
    /**
     * @param sourceProperty
     * @hidden
     */
    static _FresnelParametersParser: (sourceProperty: any) => FresnelParameters;
    /**
     * @param sourceProperty
     * @hidden
     */
    static _ColorCurvesParser: (sourceProperty: any) => ColorCurves;
    /**
     * @param sourceProperty
     * @param scene
     * @param rootUrl
     * @hidden
     */
    static _TextureParser: (sourceProperty: any, scene: Scene, rootUrl: string) => Nullable<BaseTexture>;
    /**
     * Appends the serialized animations from the source animations
     * @param source Source containing the animations
     * @param destination Target to store the animations
     */
    static AppendSerializedAnimations(source: IAnimatable, destination: any): void;
    /**
     * Static function used to serialized a specific entity
     * @param entity defines the entity to serialize
     * @param serializationObject defines the optional target object where serialization data will be stored
     * @returns a JSON compatible object representing the serialization of the entity
     */
    static Serialize<T>(entity: T, serializationObject?: any): any;
    /**
     * Creates a new entity from a serialization data object
     * @param creationFunction defines a function used to instanciated the new entity
     * @param source defines the source serialization data
     * @param scene defines the hosting scene
     * @param rootUrl defines the root url for resources
     * @returns a new entity
     */
    static Parse<T>(creationFunction: () => T, source: any, scene: Nullable<Scene>, rootUrl?: Nullable<string>): T;
    /**
     * Clones an object
     * @param creationFunction defines the function used to instanciate the new object
     * @param source defines the source object
     * @returns the cloned object
     */
    static Clone<T>(creationFunction: () => T, source: T): T;
    /**
     * Instanciates a new object based on a source one (some data will be shared between both object)
     * @param creationFunction defines the function used to instanciate the new object
     * @param source defines the source object
     * @returns the new object
     */
    static Instanciate<T>(creationFunction: () => T, source: T): T;
}
/**
 * Decorator used to redirect a function to a native implementation if available.
 * @param target
 * @param propertyKey
 * @param descriptor
 * @param predicate
 * @hidden
 */
export declare function nativeOverride<T extends (...params: any[]) => boolean>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...params: Parameters<T>) => unknown>, predicate?: T): void;
export declare namespace nativeOverride {
    var filter: <T extends (...params: any) => boolean>(predicate: T) => (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...params: Parameters<T>) => unknown>) => void;
}
export {};
