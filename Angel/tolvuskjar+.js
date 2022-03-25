/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 3 í heimadæmum 4 í Tölvugrafík
//     Sýnir tölvuskjá búinn til úr þremur teningum.
//     Nú með mynd á skjánum!
//
//    Hjálmtýr Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var screenNumVertices  = 6;
var cubeNumVertices  = 36;

var program1;
var program2;

var texture;

var cubePoints = [];
var cubeColors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var modelViewLoc1;
var projectionLoc1;
var vPosition1;
var vColor1;
var modelViewLoc2;
var projectionLoc2;
var vPosition2;
var vTexCoord2;

// Grafísk minnissvæði fyrir cube
var cubeColBuffer;
var cubeVertBuffer;

// Grafísk minnissvæði fyrir screen
var screenVertBuffer;
var screenTexBuffer;


// Tveir þríhyrningar sem mynda spjald í z=0 planinu
var screenVertices = [
    vec4( -1.25, -0.9, 0.0, 1.0 ),
    vec4(  1.25, -0.9, 0.0, 1.0 ),
    vec4(  1.25,  0.9, 0.0, 1.0 ),
    vec4(  1.25,  0.9, 0.0, 1.0 ),
    vec4( -1.25,  0.9, 0.0, 1.0 ),
    vec4( -1.25, -0.9, 0.0, 1.0 )
];

// Mynsturhnit fyrir spjaldið
var screenTexCoords = [
    vec2( 0.0, 0.0 ),
    vec2( 1.0, 0.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 1.0, 1.0 ),
    vec2( 0.0, 1.0 ),
    vec2( 0.0, 0.0 )
];



function configureTexture( image, prog ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.useProgram(prog);
    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);


    // Litarar sem lita með litafylki (sent sem attribute-breyta)
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );

    // Litarar sem lita með mynstri
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    
    
    // VBO for cube
    cubeColBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeColBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColors), gl.STATIC_DRAW );

    vColor1 = gl.getAttribLocation( program1, "vColor" );
    gl.vertexAttribPointer( vColor1, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor1 );

    cubeVertBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW );

    vPosition1 = gl.getAttribLocation( program1, "vPosition" );
    gl.vertexAttribPointer( vPosition1, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition1 );

    modelViewLoc1 = gl.getUniformLocation( program1, "modelViewMatrix" );
    projectionLoc1 = gl.getUniformLocation( program1, "projectionMatrix" );


    // VBO for screen
    screenVertBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, screenVertBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(screenVertices), gl.STATIC_DRAW );
    
    vPosition2 = gl.getAttribLocation( program2, "vPosition" );
    gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition2 );
    
    screenTexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, screenTexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(screenTexCoords), gl.STATIC_DRAW );
    
    vTexCoord2 = gl.getAttribLocation( program2, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord2, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord2 );
    
    var image = document.getElementById("texImage");
    configureTexture( image, program2 );

    modelViewLoc2 = gl.getUniformLocation( program2, "modelview" );
    projectionLoc2 = gl.getUniformLocation( program2, "projection" );

    var projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );

    // Send the projection matrix once only
    gl.useProgram(program1);
    gl.uniformMatrix4fv(projectionLoc1, false, flatten(projectionMatrix));
    
    gl.useProgram(program2);
    gl.uniformMatrix4fv(projectionLoc2, false, flatten(projectionMatrix));
    


    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 0.1;
                break;
            case 40:	// niður ör
                zDist -= 0.1;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  
       
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        cubePoints.push( vertices[indices[i]] );
        cubeColors.push(vertexColors[a]);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    var mv2 = mv;
    
    // Smíða tölvuskjá

    gl.useProgram(program1);
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertBuffer );
    gl.vertexAttribPointer( vPosition1, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeColBuffer );
    gl.vertexAttribPointer( vColor1, 4, gl.FLOAT, false, 0, 0 );

    // Fyrst botnplatan..
    mv1 = mult( mv, translate( 0.0, -0.2, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.4, 0.04, 0.25 ) );
    gl.uniformMatrix4fv(modelViewLoc1, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, cubeNumVertices );

	// Svo stöngin...
    mv1 = mult( mv, translate( 0.0, 0., 0.0 ) );
    mv1 = mult( mv1, scalem( 0.1, 0.4, 0.05 ) );
    gl.uniformMatrix4fv(modelViewLoc1, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, cubeNumVertices );

    // Loks skjárinn sjálfur...
    mv1 = mult( mv, translate( 0.0, 0.3, -0.02 ) );
    mv1 = mult( mv1, rotateX( 5 ));
    mv1 = mult( mv1, scalem( 0.7, 0.5, 0.02 ) );
    gl.uniformMatrix4fv(modelViewLoc1, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, cubeNumVertices );


    gl.useProgram(program2);

    gl.bindBuffer( gl.ARRAY_BUFFER, screenVertBuffer );
    gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, screenTexBuffer );
    gl.vertexAttribPointer( vTexCoord2, 2, gl.FLOAT, false, 0, 0 );

    mv2 = mult( mv2, translate( 0.0, 0.3, -0.035 ) );
    mv2 = mult( mv2, rotateX( 5 ));
    mv2 = mult( mv2, scalem( 0.26, 0.26, 1.0 ) );
    gl.uniformMatrix4fv(modelViewLoc2, false, flatten(mv2));
    gl.drawArrays( gl.TRIANGLES, 0, screenNumVertices );

    requestAnimFrame( render );
}

