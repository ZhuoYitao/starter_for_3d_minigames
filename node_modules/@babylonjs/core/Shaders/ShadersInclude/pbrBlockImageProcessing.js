// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockImageProcessing";
var shader = "#if defined(IMAGEPROCESSINGPOSTPROCESS) || defined(SS_SCATTERING)\n#if !defined(SKIPFINALCOLORCLAMP)\nfinalColor.rgb=clamp(finalColor.rgb,0.,30.0);\n#endif\n#else\nfinalColor=applyImageProcessing(finalColor);\n#endif\nfinalColor.a*=visibility;\n#ifdef PREMULTIPLYALPHA\nfinalColor.rgb*=finalColor.a;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockImageProcessing = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockImageProcessing.js.map