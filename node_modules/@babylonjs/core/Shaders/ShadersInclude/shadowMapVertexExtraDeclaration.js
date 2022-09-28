// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "shadowMapVertexExtraDeclaration";
var shader = "#if SM_NORMALBIAS==1\nuniform vec3 lightDataSM;\n#endif\nuniform vec3 biasAndScaleSM;\nuniform vec2 depthValuesSM;\nvarying float vDepthMetricSM;\n#if SM_USEDISTANCE==1\nvarying vec3 vPositionWSM;\n#endif\n#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1\nvarying float zSM;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapVertexExtraDeclaration = { name: name, shader: shader };
//# sourceMappingURL=shadowMapVertexExtraDeclaration.js.map