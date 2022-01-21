/////////////////////////////////////////////////////////////////
//    Sýnidæmislausn á dæmi 4 í Heimadæmum 2 í Tölvugrafík
//     Teiknar þríhyrning á strigann þar sem notandinn smellir
//     músinni.  Hægri músarsmellur hreinsar.
//
//    Hjálmtýr Hafsteinsson, janúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var TRISIZE = 8;
var maxNumPoints = 600;  
var index = 0;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPoints, gl.DYNAMIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    canvas.addEventListener("mousedown", function(e){

        // Ef hægri músarsmellur þá "tæma" fylkið
        if( e.button === 2 ) {
            index = 0;
        }
        else {
            gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        
            // Reikna hnit nýja þríhyrningsins
            var t1 = vec2(2*(e.offsetX-TRISIZE)/canvas.width-1, 2*(canvas.height-(e.offsetY+TRISIZE))/canvas.height-1);
            var t2 = vec2(2*e.offsetX/canvas.width-1, 2*(canvas.height-(e.offsetY-TRISIZE))/canvas.height-1);
            var t3 = vec2(2*(e.offsetX+TRISIZE)/canvas.width-1, 2*(canvas.height-(e.offsetY+TRISIZE))/canvas.height-1);
        
            // Bæta punktunum aftast í punktafylkið
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*index++, flatten(t1));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*index++, flatten(t2));
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*index++, flatten(t3));
            //index++;
        }
    } );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, index );

    window.requestAnimFrame(render);
}
