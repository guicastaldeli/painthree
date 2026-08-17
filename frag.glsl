#version 300 es
precision highp float;

uniform vec3 uColor;
out vec4 outColor;

uniform sampler2D uScreenTexture;
uniform vec2 uCanvasSize;

in vec2 vTexCoord;
uniform bool uIsHud;
uniform bool uUseTexture;
uniform sampler2D uTexture;

uniform bool uIsInverted;

vec4 invert(vec4 texColor, bool isInv) {
    if(!isInv) return texColor;

    vec2 screenUv = gl_FragCoord.xy / uCanvasSize;
    vec4 screenColor = texture(uScreenTexture, screenUv);

    return vec4(1.0 - screenColor.rgb, texColor.a);
}

void main() {
    if(uIsHud && uUseTexture) {
        vec4 color = texture(uTexture, vTexCoord);
        if(color.a < 0.01) discard;

        if(uIsInverted) {
            outColor = invert(color, uIsInverted);
        } else {
            outColor = color;
        }
    } else {
        outColor = vec4(uColor, 1.0);
    }
}