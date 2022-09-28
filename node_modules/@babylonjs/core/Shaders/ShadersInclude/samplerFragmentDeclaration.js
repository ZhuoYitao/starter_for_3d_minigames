// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "samplerFragmentDeclaration";
var shader = "#ifdef _DEFINENAME_\n#if _DEFINENAME_DIRECTUV==1\n#define v_VARYINGNAME_UV vMainUV1\n#elif _DEFINENAME_DIRECTUV==2\n#define v_VARYINGNAME_UV vMainUV2\n#elif _DEFINENAME_DIRECTUV==3\n#define v_VARYINGNAME_UV vMainUV3\n#elif _DEFINENAME_DIRECTUV==4\n#define v_VARYINGNAME_UV vMainUV4\n#elif _DEFINENAME_DIRECTUV==5\n#define v_VARYINGNAME_UV vMainUV5\n#elif _DEFINENAME_DIRECTUV==6\n#define v_VARYINGNAME_UV vMainUV6\n#else\nvarying vec2 v_VARYINGNAME_UV;\n#endif\nuniform sampler2D _SAMPLERNAME_Sampler;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var samplerFragmentDeclaration = { name: name, shader: shader };
//# sourceMappingURL=samplerFragmentDeclaration.js.map