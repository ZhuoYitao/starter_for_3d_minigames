// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "shadowMapFragmentSoftTransparentShadow";
var shader = "#if SM_SOFTTRANSPARENTSHADOW==1\nif ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM*alpha) discard;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapFragmentSoftTransparentShadow = { name: name, shader: shader };
//# sourceMappingURL=shadowMapFragmentSoftTransparentShadow.js.map