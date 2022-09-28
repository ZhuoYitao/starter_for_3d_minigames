// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/clipPlaneFragmentDeclaration.js";
import "./ShadersInclude/clipPlaneFragment.js";
var name = "linePixelShader";
var shader = "#include<clipPlaneFragmentDeclaration>\nuniform vec4 color;\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_FRAGMENT_MAIN_BEGIN\n#include<clipPlaneFragment>\ngl_FragColor=color;\n#define CUSTOM_FRAGMENT_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var linePixelShader = { name: name, shader: shader };
//# sourceMappingURL=line.fragment.js.map