(() => {
  const canvas = document.getElementById("paper-ink-ripples");
  if (!canvas) return;
  const stage = document.documentElement;
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) return;
  const VERTEX =
      "\nattribute vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n",
    FRAGMENT =
      "\nprecision highp float;\nuniform sampler2D atlas;\nuniform vec2 size;\nuniform vec2 cell;\nuniform float dpr;\nuniform float count;\nuniform float time;\nuniform float rest;\nuniform float haze;\nuniform float hoverInk;\nuniform float activity;\nuniform vec2 drift;\nuniform vec3 color;\nuniform vec3 accent;\nuniform vec4 waves[24];\nuniform vec4 trail[12];\n\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n}\n\nfloat smoothNoise(vec2 p) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(\n    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),\n    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),\n    u.y\n  );\n}\n\nfloat clouds(vec2 p) {\n  float v = 0.0;\n  float a = 0.55;\n  for (int i = 0; i < 4; i++) {\n    v += a * smoothNoise(p);\n    p = p * 2.02 + vec2(17.1, 9.4);\n    a *= 0.5;\n  }\n  return v;\n}\n\nfloat outline(float kind, float angle, float phase) {\n  if (kind < 0.5) return 1.0;\n  if (kind < 1.5) {\n    float s = sin(angle);\n    float c = cos(angle);\n    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;\n  }\n  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);\n}\n\nvoid main() {\n  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);\n  vec2 index = floor(pixel / cell);\n  vec2 point = pixel / dpr;\n\n  float ring = 0.0;\n  for (int i = 0; i < 12; i++) {\n    vec4 a = waves[i * 2];\n    vec4 b = waves[i * 2 + 1];\n    if (a.w <= 0.0) continue;\n    vec2 v = point - a.xy;\n    float angle = atan(-v.y, v.x);\n    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);\n    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);\n    float d = length(v) - a.z * shape;\n    float k = d > 0.0 ? d / 10.0 : d / 30.0;\n    ring = max(ring, exp(-k * k) * a.w);\n  }\n\n  float hover = 0.0;\n  for (int i = 0; i < 12; i++) {\n    vec4 t = trail[i];\n    if (t.w <= 0.0) continue;\n    vec2 v = point - t.xy;\n    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));\n  }\n  hover = min(hover, 1.0);\n\n  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);\n  vec2 q = turn * (point - drift);\n  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62\n    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;\n  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));\n  float cloud = blob * (0.82 + 0.24 * grain);\n  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);\n\n  float seed = hash(index);\n  float epoch = floor(time * 0.08 * (0.4 + seed) + seed * 97.0);\n  float character = floor(hash(index + epoch * 0.137) * count);\n  vec2 local = fract(pixel / cell);\n  float ink = 1.0;\n\n  float grey = ink * clamp(rest + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.6 + 0.4 * mask), 0.0, 1.0);\n  float blue = ink * ring * 0.07;\n  float alpha = grey + blue - grey * blue;\n  vec3 tint = color * grey * (1.0 - blue) + accent * blue;\n  gl_FragColor = vec4(tint, alpha);\n}\n";
  const compile = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const pos = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const u = {};
  for (const name of [
    "atlas",
    "size",
    "cell",
    "dpr",
    "count",
    "time",
    "rest",
    "haze",
    "hoverInk",
    "activity",
    "drift",
    "color",
    "accent",
    "waves",
    "trail",
  ])
    u[name] = gl.getUniformLocation(program, name);
  const chars = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
  let dpr = 1,
    cell = [7, 13],
    waves = [],
    trail = [],
    energy = 0,
    energyAt = 0,
    clock = 0,
    last = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function resize() {
    const r = { width: innerWidth, height: innerHeight };
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    const font = 13 * dpr + "px Tahoma,Arial,sans-serif";
    const a = document.createElement("canvas");
    let c = a.getContext("2d");
    c.font = font;
    cell = [Math.ceil(15 * dpr), Math.ceil(19 * dpr)];
    a.width = cell[0] * chars.length;
    a.height = cell[1];
    c = a.getContext("2d");
    c.font = font;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";
    [...chars].forEach((ch, i) =>
      c.fillText(ch, (i + 0.5) * cell[0], cell[1] / 2),
    );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
    render();
  }
  function spawn(x, y) {
    if (reduced.matches) return;
    const kind = 1 + Math.floor(Math.random() * 2),
      phase = Math.random() * Math.PI * 2;
    for (const [delay, strength] of [
      [0, 1],
      [0.3, 0.55],
    ])
      waves.push({ x, y, at: clock + delay, kind, phase, strength });
    waves = waves.slice(-12);
  }
  function render() {
    const w = new Float32Array(96),
      t = new Float32Array(48);
    waves = waves.filter((p) => clock - p.at < 4);
    waves.forEach((p, i) => {
      const age = clock - p.at;
      if (age <= 0) return;
      const fade =
        Math.min(1, age / 0.05) *
        Math.exp(-Math.max(0, age - 0.4) / 1.3) *
        Math.min(1, (4 - age) / 0.5);
      w.set(
        [
          p.x,
          p.y,
          (560 * age) / (1 + 0.66 * age),
          fade * p.strength,
          p.kind,
          0.12 + 0.5 * Math.min(1, age / 2.2),
          p.phase,
          age * 3,
        ],
        i * 8,
      );
    });
    trail = trail.filter((p) => clock - p.at < 0.7);
    trail.forEach((p, i) => {
      const age = (clock - p.at) / 0.7;
      t.set([p.x, p.y, 40 + 25 * age, 0.3 * (1 - age) ** 2], i * 4);
    });
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1i(u.atlas, 0);
    gl.uniform2f(u.size, canvas.width, canvas.height);
    gl.uniform2f(u.cell, ...cell);
    gl.uniform1f(u.dpr, dpr);
    gl.uniform1f(u.count, chars.length);
    gl.uniform1f(u.time, clock);
    gl.uniform1f(u.rest, 0);
    gl.uniform1f(u.haze, 0.025);
    gl.uniform1f(u.hoverInk, 0.035);
    gl.uniform1f(
      u.activity,
      energy * Math.exp(-Math.max(0, clock - energyAt) / 0.9),
    );
    gl.uniform2f(u.drift, -30 * clock, 12 * clock);
    gl.uniform3f(u.color, 0.3, 0.27, 0.21);
    gl.uniform3f(u.accent, 0.3, 0.35, 0.25);
    gl.uniform4fv(u.waves, w);
    gl.uniform4fv(u.trail, t);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function point(e) {
    return { x: e.clientX, y: e.clientY };
  }
  window.addEventListener("pointermove", (e) => {
    if (reduced.matches) return;
    const p = point(e),
      previous = trail.at(-1);
    if (previous && Math.hypot(p.x - previous.x, p.y - previous.y) < 18) return;
    energy = Math.min(1, energy + 0.15);
    energyAt = clock;
    trail.push({ ...p, at: clock });
    trail = trail.slice(-12);
  });
  window.addEventListener("pointerdown", (e) => {
    const p = point(e);
    spawn(p.x, p.y);
  });
  let animationFrame;
  function tick(now) {
    if (document.hidden || reduced.matches) {
      last = 0;
      return;
    }
    if (last) clock += Math.min((now - last) / 1000, 0.064);
    last = now;
    render();
    animationFrame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(animationFrame);
    last = 0;
    if (reduced.matches) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    if (!document.hidden) animationFrame = requestAnimationFrame(tick);
  }
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", resume);
  reduced.addEventListener("change", resume);
  resize();
  resume();
})();
