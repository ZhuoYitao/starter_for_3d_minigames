// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "logDepthFragment";
var shader = "#ifdef LOGARITHMICDEPTH\ngl_FragDepthEXT=log2(vFragmentDepth)*logarithmicDepthConstant*0.5;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var logDepthFragment = { name: name, shader: shader };
//# sourceMappingURL=logDepthFragment.js.map