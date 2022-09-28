declare type Scene = import("../../scene").Scene;
/**
 * Enum defining the type of properties that can be edited in the property pages in the NME
 */
export declare enum PropertyTypeForEdition {
    /** property is a boolean */
    Boolean = 0,
    /** property is a float */
    Float = 1,
    /** property is a int */
    Int = 2,
    /** property is a Vector2 */
    Vector2 = 3,
    /** property is a list of values */
    List = 4
}
/**
 * Interface that defines an option in a variable of type list
 */
export interface IEditablePropertyListOption {
    /** label of the option */
    label: string;
    /** value of the option */
    value: number;
}
/**
 * Interface that defines the options available for an editable property
 */
export interface IEditablePropertyOption {
    /** min value */
    min?: number;
    /** max value */
    max?: number;
    /** notifiers: indicates which actions to take when the property is changed */
    notifiers?: {
        /** the material should be rebuilt */
        rebuild?: boolean;
        /** the preview should be updated */
        update?: boolean;
        /** the onPreviewCommandActivated observer of the preview manager should be triggered */
        activatePreviewCommand?: boolean;
        /** a callback to trigger */
        callback?: (scene: Scene) => void;
    };
    /** list of the options for a variable of type list */
    options?: IEditablePropertyListOption[];
}
/**
 * Interface that describes an editable property
 */
export interface IPropertyDescriptionForEdition {
    /** name of the property */
    propertyName: string;
    /** display name of the property */
    displayName: string;
    /** type of the property */
    type: PropertyTypeForEdition;
    /** group of the property - all properties with the same group value will be displayed in a specific section */
    groupName: string;
    /** options for the property */
    options: IEditablePropertyOption;
}
/**
 * Decorator that flags a property in a node material block as being editable
 * @param displayName
 * @param propertyType
 * @param groupName
 * @param options
 */
export declare function editableInPropertyPage(displayName: string, propertyType?: PropertyTypeForEdition, groupName?: string, options?: IEditablePropertyOption): (target: any, propertyKey: string) => void;
export {};
