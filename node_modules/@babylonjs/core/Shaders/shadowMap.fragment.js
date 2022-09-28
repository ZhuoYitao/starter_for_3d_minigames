// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/shadowMapFragmentExtraDeclaration.js";
import "./ShadersInclude/clipPlaneFragmentDeclaration.js";
import "./ShadersInclude/clipPlaneFragment.js";
import "./ShadersInclude/shadowMapFragment.js";
var name = "shadowMapPixelShader";
var shader = "#include<shadowMapFragmentExtraDeclaration>\n#ifdef ALPHATEST\nvarying vec2 vUV;\nuniform sampler2D diffuseSampler;\n#endif\n#include<clipPlaneFragmentDeclaration>\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\n#include<clipPlaneFragment>\n#ifdef ALPHATEST\nfloat alphaFromAlphaTexture=texture2D(diffuseSampler,vUV).a;\nif (alphaFromAlphaTexture<ALPHATESTVALUE)\ndiscard;\n#endif\n#if SM_SOFTTRANSPARENTSHADOW==1\n#ifdef ALPHATEST\nif ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM*alphaFromAlphaTexture) discard;\n#else\nif ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM) discard;\n#endif\n#endif\n#include<shadowMapFragment>\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var shadowMapPixelShader = { name: name, shader: shader };
//# sourceMappingURL=shadowMap.fragment.js.map