// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "subSurfaceScatteringFunctions";
var shader = "bool testLightingForSSS(float diffusionProfile)\n{\nreturn diffusionProfile<1.;\n}";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var subSurfaceScatteringFunctions = { name: name, shader: shader };
//# sourceMappingURL=subSurfaceScatteringFunctions.js.map