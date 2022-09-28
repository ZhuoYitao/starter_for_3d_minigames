// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "logDepthVertex";
var shader = "#ifdef LOGARITHMICDEPTH\nvFragmentDepth=1.0+gl_Position.w;\ngl_Position.z=log2(max(0.000001,vFragmentDepth))*logarithmicDepthConstant;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var logDepthVertex = { name: name, shader: shader };
//# sourceMappingURL=logDepthVertex.js.map