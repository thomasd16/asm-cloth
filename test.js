function ASM(stdlib, foreign, heap) {
	"use asm";
	var floats = new stdlib.Float64Array(heap);
	var clothWidth = 50;
	var clothHeight = 30;
	var canvaswidth = 560;
	var canvasheight=280;
	var spacing = 7;
	var mouse_px = 0;
	var mouse_py = 0;
	var mouse_x = 0;
	var mouse_y = 0;
	var mouse_down = 0;
	
	var total_points = 0;
	
	
	var floor = stdlib.Math.floor;
	var fround = stdlib.Math.fround;
	var sqrt = stdlib.Math.sqrt;
	var abs = stdlib.Math.abs;
	
	function createPoints() {
		var startx = 0;
		var mempos = 0;
		var pointx = 0.0;
		var pointy = 0.0;
		var y = 0;
		var x = 0;
		startx = (canvaswidth - ~~floor(+(spacing|0)*+(clothWidth|0)))|0;
		startx = ((startx|0)/2)|0;
		
		for( y = 0; (y|0) < (clothHeight|0);y=(y+1)|0){
			for(x = 0; (x|0) < (clothWidth|0); x = (x+1)|0) {
				floats[mempos>>03] = +(startx|0) + (+(x|0)*+(spacing|0));
				floats[(mempos+8)>>3] = +(y|0)*+(spacing|0);
				floats[(mempos+16)>>3] = floats[mempos>>3];
				floats[(mempos+24)>>3] = floats[(mempos+8)>>3];
				mempos = (mempos+32)|0;
			}
		}
		return startx|0;
	}
	
	function resolvePoints(p1,p2) {
		p1 = p1 | 0;
		p2 = p2 | 0;
		var deltaX = 0.0;
		var deltaY = 0.0;
		var dist = 0.0;
		var dif = 0.0;
		var i = 0;
		
		p1 = (p1 * 32)|0;
		p2 = (p2 * 32)|0;
		deltaX = floats[p1>>3]-floats[p2>>3];
		deltaY = floats[(p1+8)>>3] - floats[(p2+8)>>3];
		dist = +sqrt(+(deltaX*deltaX+deltaY*deltaY));
		dif = (+(spacing|0)-dist)/dist;
		
		deltaX = deltaX*dif*0.4;
		deltaY = deltaY*dif*0.4;
		floats[p1>>3] = +(floats[p1>>3]+deltaX);
		floats[(p1+8)>>3] = +(floats[(p1+8)>>3]+deltaY);
		
		if((p2|0) > ((clothWidth*32)|0))
		{
			floats[p2>>3] = +(floats[p2>>3]-deltaX);
			floats[(p2+8)>>3] = +(floats[(p2+8)>>3]-deltaY);
		}
	}
	function resolve(i_mouse_down, i_mouse_x, i_mouse_y) {
		i_mouse_down = i_mouse_down | 0;
		i_mouse_x = i_mouse_x | 0;
		i_mouse_y = i_mouse_y | 0;
		var i = 0;
		var max = 0;
		var p1 = 0;
		var deltaX = 0.0;
		var deltaY = 0.0;
		max = ~~floor(+(clothHeight|0)*+(clothWidth|0));
		for(p1 = 0; (p1|0)<3; p1 = (p1+1)|0) {
			for(i = 50; (i|0) < 1500; i= (i+1)|0) {
				if((((i|0)%(clothWidth|0))|0) != 0)
					resolvePoints(i|0,(i-1)|0);
				resolvePoints(i|0,(i-clothWidth)|0);
			}
		}
		for(i = 50; (i|0)<1500; i = (i+1)|0) {
			p1 = (i*32)|0;
			deltaX = ((floats[p1>>3] - floats[(p1+16)>>3])*0.99);
			deltaY = ((floats[(p1+8)>>3] - floats[(p1+24)>>3])*0.99)+0.2;
			if (abs(deltaX)<0.01) {
				deltaX = 0.0;
			}
			floats[(p1+16)>>3] = floats[p1>>3];
			floats[(p1+24)>>3] = floats[(p1+8)>>3];
			floats[p1>>3]  = floats[p1>>3] + deltaX;
			floats[(p1+8)>>3] = floats[(p1+8)>>3] + deltaY;
		}
		if((i_mouse_down|0)== 1) {
			mouse_px = mouse_x;
			mouse_py = mouse_y;
			mouse_x = i_mouse_x;
			mouse_y = i_mouse_y;
			for(i = 50; (i|0)<1500; i = (i+1)|0) {
				p1 = (i*32)|0;
				deltaX = floats[p1>>3] - +(mouse_x|0);
				deltaY = floats[(p1+8)>>3] - +(mouse_y|0);
				if(sqrt(deltaY*deltaY+deltaX*deltaX) < 20.0) {
					floats[(p1+16)>>3] = floats[p1>>3] - +((mouse_x - mouse_px)|0);
					floats[(p1+24)>>3] = floats[(p1+24)>>3] -+((mouse_y - mouse_py)|0);
				}
			}
		} else {
			mouse_x = i_mouse_x | 0;
			mouse_y = i_mouse_y | 0;
		}
	}
	
	return {
		createPoints: createPoints,
		resolve: resolve
	};
}
(function () {
	var canvas = document.getElementById('c');
	var ctx = canvas.getContext('2d');
	var heap = new ArrayBuffer(0x10000);
	var floats = new Float64Array(heap);
	var mouse_down = 0;
	var mouse_x = 0;
	var mouse_y = 0;
	var rect = canvas.getBoundingClientRect();
	var mod = ASM(window, {
			print:console.log
		},heap);
	mod.createPoints();
	
	
	function render () {
		ctx.clearRect(0, 0, 560, 280);
		ctx.strokeStyle = '#888';
		ctx.beginPath();
		for(var i = 0; i < 30*50; i++) {
			if(i>= 50) {				
				ctx.moveTo(floats[i*4],floats[i*4+1]);
				ctx.lineTo(floats[(i-50)*4],floats[(i-50)*4+1]);
			}
			if(i%50!=0) {
				ctx.moveTo(floats[i*4],floats[i*4+1]);
				ctx.lineTo(floats[(i-1)*4],floats[(i-1)*4+1]);
			}
		}
		ctx.stroke();
	}
	canvas.addEventListener("mouseout", function (e) {
		mouse_down = 0;
		e.preventDefault();
	});
	canvas.addEventListener("mousedown", function (e) {
		mouse_down = 1;
		e.preventDefault();
	});
	canvas.addEventListener("mouseup", function (e) {
		mouse_down = 0;
		e.preventDefault();
	});
	canvas.addEventListener("mousemove", function (e) {
		mouse_x = e.clientX - rect.left;
		mouse_y = e.clientY - rect.top;
	});
	function run() {
		mod.resolve(mouse_down, mouse_x, mouse_y);
		render();
		window.requestAnimationFrame(run);
	}
	run();
}());