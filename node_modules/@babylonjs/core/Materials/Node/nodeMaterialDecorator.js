/**
 * Enum defining the type of properties that can be edited in the property pages in the NME
 */
export var PropertyTypeForEdition;
(function (PropertyTypeForEdition) {
    /** property is a boolean */
    PropertyTypeForEdition[PropertyTypeForEdition["Boolean"] = 0] = "Boolean";
    /** property is a float */
    PropertyTypeForEdition[PropertyTypeForEdition["Float"] = 1] = "Float";
    /** property is a int */
    PropertyTypeForEdition[PropertyTypeForEdition["Int"] = 2] = "Int";
    /** property is a Vector2 */
    PropertyTypeForEdition[PropertyTypeForEdition["Vector2"] = 3] = "Vector2";
    /** property is a list of values */
    PropertyTypeForEdition[PropertyTypeForEdition["List"] = 4] = "List";
})(PropertyTypeForEdition || (PropertyTypeForEdition = {}));
/**
 * Decorator that flags a property in a node material block as being editable
 * @param displayName
 * @param propertyType
 * @param groupName
 * @param options
 */
export function editableInPropertyPage(displayName, propertyType, groupName, options) {
    if (propertyType === void 0) { propertyType = PropertyTypeForEdition.Boolean; }
    if (groupName === void 0) { groupName = "PROPERTIES"; }
    return function (target, propertyKey) {
        var propStore = target._propStore;
        if (!propStore) {
            propStore = [];
            target._propStore = propStore;
        }
        propStore.push({
            propertyName: propertyKey,
            displayName: displayName,
            type: propertyType,
            groupName: groupName,
            options: options !== null && options !== void 0 ? options : {},
        });
    };
}
//# sourceMappingURL=nodeMaterialDecorator.js.map