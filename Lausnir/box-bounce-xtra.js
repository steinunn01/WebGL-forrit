/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 5 í heimadæmum 3 í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur fært hann
//     til vinstri/hægri með örvalyklum og stækkað/minnkað hann
//     með upp/niður-örvum.
//
//    Hjálmtýr Hafsteinsson, janúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var vertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );

    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:    // vinstri ör
                dX -= 0.001;
                break;
            case 39:    // hægri ör
                dX += 0.001;
                break;
            case 38:	// upp ör
                boxRad *= 1.1;
                // Uppfærum hnitin á hornpunktum ferningsins
                for (var i=0; i<8; i++) {
                    vertices[i] *= 1.1;
                }
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));    
                break;
            case 40:	// niður ör
                boxRad /= 1.1;
                // Uppfærum hnitin á hornpunktum ferningsins
                for (var i=0; i<8; i++) {
                    vertices[i] /= 1.1;
                }
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));    
                break;
        }
    } );

    render();
}


function render() {
    
    // Lát ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.uniform2fv( locBox, flatten(box) );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    window.requestAnimFrame(render);
}
