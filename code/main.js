/*
  * A Simple WebGL Demo in JavaScript.
  *
  * (C) 2021 Omar M.Gindia, All rightes reserved.
  */

main();


function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    alert("Unable to init WebGL.");
    return;
  }

  const shader = load_shader(gl);
  gl.useProgram(shader);

  const program_info = {
    program: shader,
    attr_loc: {
      vert_pos: gl.getAttribLocation(shader, 'position'),
    },
    uniform_loc: {
      projection: gl.getUniformLocation(shader, 'projection'),
      view: gl.getUniformLocation(shader, 'view'),
      time_tick: gl.getUniformLocation(shader, 'time_tick'),
    },
  }

  const VBO = vbo(gl);

  // loop
  function render(now) {
    now *= 0.001;
    draw(gl, program_info, VBO, now);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function draw(gl, program_info, VBO, time_tick) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const FOV_RAD = 45 * Math.PI / 180.0;
  const aspect_ratio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const near = 0.1;
  const far = 100.0;
  const perspective = mat4.create();
  mat4.perspective(perspective,
    FOV_RAD,
    aspect_ratio,
    near,
    far);

  const view = mat4.create();
  mat4.translate(view,
    view,
    [0.0, 0.0, -30.0]);
  mat4.rotate(view,
    view,
    time_tick,
    [0, 0, 1] // z-axis
  );

  {
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO.position);
    gl.vertexAttribPointer(
      program_info.attr_loc.vert_pos,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.enableVertexAttribArray(
      program_info.attr_loc.vert_pos);
  }

  gl.useProgram(program_info.program);

  gl.uniformMatrix4fv(program_info.uniform_loc.projection,
    false,
    perspective);

  gl.uniformMatrix4fv(program_info.uniform_loc.view,
    false,
    view);

  gl.uniform1f(program_info.uniform_loc.time_tick, time_tick)

  {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}


function vbo(gl) {
  const vbo = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  const positions = [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

  return {
    position: vbo,
  };
}


// Returns : ShaderProgram | null
function load_shader(gl) {
  const vert_src = `
  attribute vec2 position;

  uniform mat4 view;
  uniform mat4 projection;

  void main() {
    gl_Position = projection * view * vec4(position, 0.0, 1.0);
  }
  `;

  const frag_src = `
  precision mediump float;

  uniform float time_tick;

  void main() {
    float red = abs(cos(time_tick));
    float green = abs(sin(time_tick));
    float blue = abs(tan(time_tick));

    vec4 color = vec4(red, green, blue, 1.0);
    gl_FragColor = color;
  }
  `;

  const v_shader = gl.createShader(gl.VERTEX_SHADER);
  const f_shader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(v_shader, vert_src);
  gl.shaderSource(f_shader, frag_src);

  gl.compileShader(v_shader);
  if (!gl.getShaderParameter(v_shader, gl.COMPILE_STATUS)) {
    alert("[GL] Compiling Shader: " + gl.getShaderInfoLog(v_shader));
    return null;
  }

  gl.compileShader(f_shader);
  if (!gl.getShaderParameter(f_shader, gl.COMPILE_STATUS)) {
    alert("[GL] Compiling Shader: " + gl.getShaderInfoLog(f_shader));
    return null;
  }

  const shader = gl.createProgram();
  gl.attachShader(shader, v_shader);
  gl.attachShader(shader, f_shader);
  gl.linkProgram(shader);
  if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
    alert("[GL] Compiling Shader: " + gl.getProgramInfoLog(f_shader));
    return null;
  }

  return shader;
}
