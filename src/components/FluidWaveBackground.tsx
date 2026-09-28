"use client";

import { useEffect, useRef } from "react";

interface FluidWaveBackgroundProps {
  animate?: "on" | "off";
  color1?: string;
  color2?: string;
  color3?: string;
  bgColor1?: string;
  bgColor2?: string;
  brightness?: number;
  positionX?: number;
  positionY?: number;
  rotationX?: number;
  rotationZ?: number;
  uStrength?: number;
  uDensity?: number;
  uFrequency?: number;
  frameRate?: number;
  pixelDensity?: number;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export default function FluidWaveBackground({
  animate = "on",
  color1 = "#94ffd1",
  color2 = "#6bf5ff",
  color3 = "#ffffff",
  bgColor1 = "#000000",
  brightness = 1.2,
  positionX = 0,
  positionY = 0.9,
  rotationX = 45,
  rotationZ = 0,
  uStrength = 3.4,
  uDensity = 1.2,
  uFrequency = 0,
  frameRate = 30,
  pixelDensity = 1,
  className = "",
}: FluidWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vsSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

    const fsSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_bgColor1;
uniform float u_brightness;
uniform float u_strength;
uniform float u_density;
uniform float u_frequency;
uniform float u_rotationX;
uniform float u_rotationZ;
uniform float u_positionX;
uniform float u_positionY;

varying vec2 v_uv;

vec2 rotate2d(vec2 uv, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  st.x -= u_positionX * 0.5;
  st.y -= (u_positionY - 0.5) * 0.45;

  if (abs(u_rotationZ) > 0.01) {
    st = rotate2d(st, u_rotationZ * 0.01745329251);
  }

  float radX = u_rotationX * 0.01745329251;
  float cosX = max(cos(radX), 0.25);
  st.y /= cosX;

  vec2 p = st * (u_density * 1.6);
  float t = u_time * 0.35;

  float freq = u_frequency > 0.05 ? u_frequency : 2.2;
  float str = max(u_strength * 0.32, 0.5);

  float w1 = sin(p.x * freq + t * 0.75) * cos(p.y * (freq * 0.85) + t * 0.55);
  float w2 = sin((p.x * 0.85 + p.y * 1.1) * freq - t * 0.65);
  float w3 = cos(length(p * vec2(0.9, 1.3)) * (freq * 0.75) - t * 0.85);
  float w4 = sin(p.x * 2.1 - p.y * 1.6 + t * 0.45);

  float wave = (w1 * 0.35 + w2 * 0.30 + w3 * 0.20 + w4 * 0.15);
  float d = clamp(wave * str * 0.5 + 0.5, 0.0, 1.0);

  vec3 col = mix(u_bgColor1, u_color1, smoothstep(0.12, 0.60, d));
  col = mix(col, u_color2, smoothstep(0.40, 0.85, d));
  col = mix(col, u_color3, smoothstep(0.70, 0.98, d) * 0.9);

  col *= u_brightness;

  gl_FragColor = vec4(col, 1.0);
}
`;

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");
    const uBgColor1 = gl.getUniformLocation(program, "u_bgColor1");
    const uBrightness = gl.getUniformLocation(program, "u_brightness");
    const uStrengthLoc = gl.getUniformLocation(program, "u_strength");
    const uDensityLoc = gl.getUniformLocation(program, "u_density");
    const uFrequencyLoc = gl.getUniformLocation(program, "u_frequency");
    const uRotationX = gl.getUniformLocation(program, "u_rotationX");
    const uRotationZ = gl.getUniformLocation(program, "u_rotationZ");
    const uPositionX = gl.getUniformLocation(program, "u_positionX");
    const uPositionY = gl.getUniformLocation(program, "u_positionY");

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const rgb3 = hexToRgb(color3);
    const rgbBg = hexToRgb(bgColor1);

    gl.uniform3f(uColor1, rgb1[0], rgb1[1], rgb1[2]);
    gl.uniform3f(uColor2, rgb2[0], rgb2[1], rgb2[2]);
    gl.uniform3f(uColor3, rgb3[0], rgb3[1], rgb3[2]);
    gl.uniform3f(uBgColor1, rgbBg[0], rgbBg[1], rgbBg[2]);
    gl.uniform1f(uBrightness, brightness);
    gl.uniform1f(uStrengthLoc, uStrength);
    gl.uniform1f(uDensityLoc, uDensity);
    gl.uniform1f(uFrequencyLoc, uFrequency);
    gl.uniform1f(uRotationX, rotationX);
    gl.uniform1f(uRotationZ, rotationZ);
    gl.uniform1f(uPositionX, positionX);
    gl.uniform1f(uPositionY, positionY);

    let animationFrameId: number;
    let startTime = performance.now();
    let lastTime = 0;
    const interval = Math.max(1000 / Math.max(frameRate, 12), 33);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1) * pixelDensity;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const render = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        lastTime = currentTime;
        resize();
        if (animate === "on") {
          const elapsed = (currentTime - startTime) * 0.001;
          gl.uniform1f(uTime, elapsed);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render(startTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    animate,
    color1,
    color2,
    color3,
    bgColor1,
    brightness,
    positionX,
    positionY,
    rotationX,
    rotationZ,
    uStrength,
    uDensity,
    uFrequency,
    frameRate,
    pixelDensity,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block pointer-events-none ${className}`}
    />
  );
}
