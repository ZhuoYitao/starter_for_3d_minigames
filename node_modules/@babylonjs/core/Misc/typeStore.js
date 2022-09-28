/** @hidden */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _RegisteredTypes = {};
/**
 * @param className
 * @param type
 * @hidden
 */
export function RegisterClass(className, type) {
    _RegisteredTypes[className] = type;
}
/**
 * @param fqdn
 * @hidden
 */
export function GetClass(fqdn) {
    return _RegisteredTypes[fqdn];
}
//# sourceMappingURL=typeStore.js.map