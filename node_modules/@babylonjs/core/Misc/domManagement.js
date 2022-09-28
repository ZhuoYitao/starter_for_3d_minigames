/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Checks if the window object exists
 * @returns true if the window object exists
 */
export function IsWindowObjectExist() {
    return typeof window !== "undefined";
}
/**
 * Checks if the navigator object exists
 * @returns true if the navigator object exists
 */
export function IsNavigatorAvailable() {
    return typeof navigator !== "undefined";
}
/**
 * Check if the document object exists
 * @returns true if the document object exists
 */
export function IsDocumentAvailable() {
    return typeof document !== "undefined";
}
/**
 * Extracts text content from a DOM element hierarchy
 * @param element defines the root element
 * @returns a string
 */
export function GetDOMTextContent(element) {
    var result = "";
    var child = element.firstChild;
    while (child) {
        if (child.nodeType === 3) {
            result += child.textContent;
        }
        child = child.nextSibling;
    }
    return result;
}
/**
 * Sets of helpers dealing with the DOM and some of the recurrent functions needed in
 * Babylon.js
 */
export var DomManagement = {
    /**
     * Checks if the window object exists
     * @returns true if the window object exists
     */
    IsWindowObjectExist: IsWindowObjectExist,
    /**
     * Checks if the navigator object exists
     * @returns true if the navigator object exists
     */
    IsNavigatorAvailable: IsNavigatorAvailable,
    /**
     * Check if the document object exists
     * @returns true if the document object exists
     */
    IsDocumentAvailable: IsDocumentAvailable,
    /**
     * Extracts text content from a DOM element hierarchy
     * @param element defines the root element
     * @returns a string
     */
    GetDOMTextContent: GetDOMTextContent,
};
//# sourceMappingURL=domManagement.js.map