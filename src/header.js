(function() {
    var canvas = document.getElementById("canvas");

    //make the canvas fullscreen
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.Module = {
        TOTAL_MEMORY: 256*1024*1024,
        canvas:       canvas
    };
    window.bgfx = window.Module;
}());