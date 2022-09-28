// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./packingFunctions.js";
import "./bayerDitherFunctions.js";
var name = "shadowMapFragmentExtraDeclaration";
var shader = "#if SM_FLOAT==0\n#include<packingFunctions>\n#endif\n#if SM_SOFTTRANSPARENTSHADOW==1\n#include<bayerDitherFunctions>\nuniform float softTransparentShadowSM;\n#endif\nvarying float vDepthMetricSM;\n#if SM_USEDISTANCE==1\nuniform vec3 lightDataSM;\nvarying vec3 vPositionWSM;\n#endif\nuniform vec3 biasAndScaleSM;\nuniform vec2 depthValuesSM;\n#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1\nvarying float zSM;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapFragmentExtraDeclaration = { name: name, shader: shader };
//# sourceMappingURL=shadowMapFragmentExtraDeclaration.js.map