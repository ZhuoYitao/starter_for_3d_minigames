// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "logDepthDeclaration";
var shader = "#ifdef LOGARITHMICDEPTH\nuniform float logarithmicDepthConstant;\nvarying float vFragmentDepth;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var logDepthDeclaration = { name: name, shader: shader };
//# sourceMappingURL=logDepthDeclaration.js.map