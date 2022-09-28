// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "mrtFragmentDeclaration";
var shader = "#if defined(WEBGL2) || defined(WEBGPU)\nlayout(location=0) out vec4 glFragData[{X}];\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var mrtFragmentDeclaration = { name: name, shader: shader };
//# sourceMappingURL=mrtFragmentDeclaration.js.map