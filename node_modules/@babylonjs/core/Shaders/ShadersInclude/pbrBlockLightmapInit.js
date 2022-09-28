// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockLightmapInit";
var shader = "#ifdef LIGHTMAP\nvec4 lightmapColor=texture2D(lightmapSampler,vLightmapUV+uvOffset);\n#ifdef RGBDLIGHTMAP\nlightmapColor.rgb=fromRGBD(lightmapColor);\n#endif\n#ifdef GAMMALIGHTMAP\nlightmapColor.rgb=toLinearSpace(lightmapColor.rgb);\n#endif\nlightmapColor.rgb*=vLightmapInfos.y;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockLightmapInit = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockLightmapInit.js.map