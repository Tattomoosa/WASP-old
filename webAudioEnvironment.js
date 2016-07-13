//dont do shit til we load
$(function() {
	"use strict"

	//create an audio context
	var audioContext = new (
		window.AudioContext ||
		window.webkitAudioContext
	)();
	//glad that is out of the way!

////////////////////////////////////////
//nav.init
//
//this sets up a bunch of mouse interaction
//that is not on the nodes directly.
//////////////////////////////////////////

	var gameInitialization = {
		initAppWindow : function() {
			var div, initOffset
			var aw = $( '#background-layer');
			console.log(foregroundLines.canvas);
			$(backgroundLines.canvas).on('mousedown',function(e) {
				if (e.which == 1) {
					if (!e.shiftKey) {
						NodeOp.removeSelected();
					};
					$('#app-window').children('.selectbox').remove();
					div = $("<div class='selectbox'></div>");

					div.appendTo('#app-window');
					div.offset({ 'top' : event.pageY , 'left' : event.pageX });
					initOffset = div.offset()
				}
			});
			$(document).on('mouseup',function(e) {
				if (e.which == 1) {
				if (div) {
					var selectTop = div.offset().top;
					var selectLeft = div.offset().left;
					var selectBottom = selectTop + div.height();
					var selectRight = selectLeft + div.width();

					$('#app-window').children('.node-controls').each( function(){
						var box = $(this);
						var boxTop = box.offset().top;
						var boxLeft = box.offset().left;
						var boxBottom = boxTop + box.height();
						var boxRight = boxLeft + box.width();
						var yIn = false;
						var xIn = false;

						if (boxTop > selectTop && boxTop < selectBottom || boxBottom < selectBottom && boxBottom > selectTop ||
								boxTop < selectBottom && boxBottom > selectTop) {
							if (boxLeft > selectLeft && boxLeft < selectRight || boxRight < selectRight && boxRight > selectLeft ||
								boxLeft < selectRight && boxRight > selectLeft) {
								box.addClass('selected');
							};

						};

					});

					div.remove();
					div = 0;
				};
				};
			});
			$(document).on('mousemove', function() {
				if (div) {
					var x = initOffset.left - event.pageX;
					var y = initOffset.top - event.pageY;
					if (y < 0) {
						div.offset({top:initOffset.top});
						div.height(-y);
					} else {
						div.offset({top:event.pageY});
						div.height(y);
					};
					if (x < 0) {
						div.offset({left:initOffset.left});
						div.width(-x);
					} else {
						div.offset({left:event.pageX});
						div.width(initOffset.left - event.pageX);
					};
				};
			});
		}
	}
////////////////////////////////////////
//nav.svg
//This is the section where we deal with all manner of lines. We got thin lines, thick lines,
//whatever sort you fancy. connecting lines + updating and all that
////////////////////////////////////////
	
	var SVG = {
		//this is where we create a containing SVG element. this is done to manage Z axis
		//and separate the 'live' line from the background lines.
		createCanvas : function( width, height, container, pos, z, pointerevents){
			var canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			canvas.setAttribute('width', width);
			canvas.setAttribute('height', height);

			canvas.setAttribute('pointer-events', pointerevents);
			
			var htmlstring = '<div style="z-index: ' + z + '; position: ' + pos + '; pointer-events: ' + pointerevents + ';" top: 0px, left: 0px, height: 0></div>';
			console.log (htmlstring);
			var svgContain = $( htmlstring );
			container.prepend(svgContain);
			svgContain.append( canvas );    
			return canvas;
		},
		//draw a line to deal with later
		  createLine : function (x1, y1, x2, y2, color, w) {
			var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', x1);
			line.setAttribute('y1', y1);
			line.setAttribute('x2', x2);
			line.setAttribute('y2', y2);
			line.setAttribute('stroke', color);
			line.setAttribute('stroke-width', w);
			return line;
		  },
		//what to do when the user hovers over a line
		mouseOverLine : function (line, stroke) {
			line.setAttribute('stroke-width', stroke);
		},
		//reset the line when user no longer hovers
		mouseLeaveLine : function (line, stroke) {
			line.setAttribute('stroke-width', stroke);
		},
		//make dat line DYNAMIC here
		updateLine: function (which, x1, y1, x2, y2) {
			which.setAttribute('x1', x1);
			which.setAttribute('y1', y1);
			which.setAttribute('x2', x2);
			which.setAttribute('y2', y2);
		},
		//yeah. boom. bye bye.
		deleteLine: function (which) {
			which.remove();
		},
		//this is the containing object for the canvas. is this
		//being separate from the canvas? uhh...
		//noooooooooooooo
		//but this is how i did it so it will be like that
		//until i fix it.
		lineContext : function( pos, z, pointerEvents) {
			this.canvas = SVG.createCanvas (
				$( '#app-window' ).width(),
				$( '#app-window' ).height(),
				$( '#app-window' ),
				pos,
				z,
				pointerEvents
			)
		},
		updateConnectingLine : function(origin, end, line) {

			requestAnimationFrame(function() {
			var y1 = origin.offset().top + origin.height()/2;
			var x1 = origin.offset().left + origin.width()/2;
			var y2 = end.offset().top + end.width()/2;
			var x2 = end.offset().left + end.width()/2;
			var appwindow = $( '#app-window' );
			var offy = appwindow.offset().top;
			var offx = appwindow.offset().left;	
			
			SVG.updateLine( line, x1-offx, y1-offy, x2-offx, y2-offy);
		});
		},
	}
	
	//these are our GLOBAL line contexts. not sure if this is necessary?
	//maybe nice to reduce jquery calls? whateverrr it works for now
	var backgroundLines = new SVG.lineContext('absolute', '1', 'auto');
	var foregroundLines = new SVG.lineContext('absolute', '1200', 'none');
	
	//set up App Window babeh... 
	gameInitialization.initAppWindow();

	//backgroundLines.canvas.css( top, 0);

	//creates relevant button for each node type
	$(' .create-node-button ').click ( function() {
		createNode (
			$( this ).data().nodetype	
		);
	});
	

////////////////////////////////////////
//nav.nodedef
//
//this is where we define nodes. the plan is to
//deprecate this with a filetype, maybe xml
////////////////////////////////////////////

//lets define some objects nao. here's some nodes!

	var BiquadFilterNodeGUI = function() {
		this.node = audioContext.createBiquadFilter();

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Biquad Filter');

		//MAKE ROW IO
		var currentrow = NodeOp.createRow(this.controls, 'io');
		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node );

		var ioDisplay = $("<h1>IN / OUT</h1>");
		currentrow.append(ioDisplay);

		//MAKE ROW: FREQUENCY
		var currentrow = NodeOp.createRow(this.controls, 'frequency');
		currentrow.data( 'node', this.node.frequency );
		console.log (currentrow.data( 'node' ));

		var display = $("<h1>FREQUENCY</h1>");
		currentrow.append(display);

		//ROW CONTROLS
		//numerical input
		currentrow.numberInput = $("<input type='number' value='20' step='1'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'frequency', $(this).val() );
		});
		//END ROW
		//

		//MAKE ROW: QUALITY FACTOR
		var currentrow = NodeOp.createRow(this.controls, 'q');
		currentrow.data( 'node', this.node.Q );
		console.log (currentrow.data( 'node' ));

		display = $("<h1>Q FACTOR</h1>");
		currentrow.append(display);

		//ROW CONTROLS
		//numerical input
		currentrow.numberInput = $("<input type='number' value='.2' step='.01' min='0' max='1.000'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'Q', $(this).val() );
		});
		//END ROW
		//
		//MAKE ROW: GAIN
		var currentrow = NodeOp.createRow(this.controls, 'gain');
		currentrow.data( 'node', this.node.gain );
		console.log (currentrow.data( 'node' ));

		display = $("<h1>GAIN</h1>");
		currentrow.append(display);

		//ROW CONTROLS
		//numerical input
		currentrow.numberInput = $("<input type='number' value='.2' step='.01'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'gain', $(this).val() );
		});
		//END ROW
		//

		//NEW ROW
		//for biquad filter type
		currentrow = NodeOp.createRow(this.controls, 'type'); //new row for wavetype
		//rowDisplay = $("<h1>TYPE</h1>");
		//currentrow.append(rowDisplay);

		//here we make a dropdown menu... gotta figure out a good way to split it up
		//without making too many assumptions...
		var typeList = $("<div class='dropdown selected'></div>");
		currentrow.append(typeList);
		var option = $("<li data-filtertype='"+'"lowpass"'+"'>LOW&nbsp;PASS</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"highpass"'+"'>HIGH&nbsp;PASS</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"bandpass"'+"'>BAND&nbsp;PASS</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"lowshelf"'+"'>LOW&nbsp;SHELF</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"highshelf"'+"'>HIGH&nbsp;SHELF</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"peaking"'+"'>PEAKING</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"notch"'+"'>NOTCH</li>");
		typeList.append(option);
		option = $("<li data-filtertype='"+'"allpass"'+"'>ALL&nbsp;PASS</li>");
		typeList.append(option);

		var typeButton = $("<h1 class='dropdown-call'>TYPE<br>HIGH&nbsp;PASS</h1>");
		currentrow.append(typeButton);

		typeList.children().each(function() {
			$(this).click(function() {
				var node = $(this).closest('.node-controls').data('rootObj');
				node.update ('type', $(this).data('filtertype'));
				typeButton.html('TYPE<br>' + $(this).html());
				typeList.css('display','none');
			});
		});

		typeList.mouseleave(function() {
			$(this).css('display', 'none');
			typeButton.css('display', 'block');
		});

		typeButton.click(function(e) {
			console.log(typeButton.siblings('.dropdown'));
			var dropdown = typeButton.siblings('.dropdown')
			dropdown.css({
				'display': 'block',
			});
			dropdown.offset({
				'top' : e.pageY-4,
				'left' : e.pageX-4,
			});
		});
		//done with dropdown!

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node.type ); //type = wavetype
		console.log(this.node);

		//END ROW

		//this.update('frequency', 20);
		//
		//QUICK RESIZE
		NodeOp.updateControlsSize (this.controls);
	}

	BiquadFilterNodeGUI.prototype.update = function(which, aValue) {
		console.log(this.node);
		if (which == 'frequency' ||
			which == 'detune' ||
		    which == 'Q' ||
			which == 'gain') {
			var stringCommand = 'this.node.' + which + '.value'; //this tells us which audioParam to deal with dynamically
			console.log (eval (stringCommand + ' = ' + aValue) ); //eval evaluates a string as code!
			eval (stringCommand + ' = ' + aValue);
		}
		if (which == 'type') {
			var stringCommand = 'this.node.' + which; //this tells us which audioParam to deal with dynamically
			console.log (eval (stringCommand + ' = ' + aValue) ); //eval evaluates a string as code!
			eval (stringCommand + ' = ' + aValue);
		}
	}

	var DelayNodeGUI = function() {
		this.node = audioContext.createDelay(10);

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Delay');

		//MAKE ROW IO
		var currentrow = NodeOp.createRow(this.controls, 'io');
		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node );

		var ioDisplay = $("<h1>IN / OUT</h1>");
		currentrow.append(ioDisplay);

		//MAKE ROW: DELAYTIME
		var currentrow = NodeOp.createRow(this.controls, 'delay-time');
		currentrow.data( 'node', this.node.delayTime );
		console.log (currentrow.data( 'node' ));

		var delayDisplay = $("<h1>DLY TIME</h1>");
		currentrow.append(delayDisplay);

		//ROW CONTROLS
		//numerical input
		currentrow.numberInput = $("<input type='number' value='.5' step='.1' max='10'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'delayTime', $(this).val() );
		});
		this.update('delayTime', .5);
		NodeOp.updateControlsSize (this.controls);
	}

	DelayNodeGUI.prototype.update = function(which, aValue) {
		if (which == 'delayTime') {
			var stringCommand = 'this.node.' + which + '.value'; //this tells us which audioParam to deal with dynamically
			console.log (eval (stringCommand + ' = ' + aValue) ); //eval evaluates a string as code!
			eval (stringCommand + ' = ' + aValue);

			//this.controls.delayDisplay.html( (eval (stringCommand)).toFixed(2) );
			//valueParam = aValue; //this[which] means i can call use the string value of which as a variable name
			//this.controls.gainDisplay.html( (valueParam).toFixed(2) );
		}
	}

	var GainNodeGUI = function() {
		this.node = audioContext.createGain();

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Gain');

		//MAKE ROW IO
		var currentrow = NodeOp.createRow(this.controls, 'io');
		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node );

		var ioDisplay = $("<h1>IN / OUT</h1>");
		currentrow.append(ioDisplay);

		//MAKE ROW: GAIN
		var currentrow = NodeOp.createRow(this.controls, 'gain');
		currentrow.data( 'node', this.node.gain );
		console.log (currentrow.data( 'node' ));

		var ioDisplay = $("<h1>GAIN</h1>");
		currentrow.append(ioDisplay);

		//ROW CONTROLS
		//numerical input
		currentrow.numberInput = $("<input type='number' value='.5' step='.01'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'gain', $(this).val() );
		});

		//END ROW
/*
		//NEW ROW data
		currentrow = NodeOp.createRow(this.controls, 'data'); //new row 
		//simply displays current volume (as percent)
		this.controls.gainDisplay = $( "<p>" + this.node.gain.value +  "%</p>" );
		currentrow.append (this.controls.gainDisplay);

		//END ROW
*/
		NodeOp.updateControlsSize (this.controls);
		this.update ('gain', '0.5');
	}

	GainNodeGUI.prototype.update = function(which, aValue) {
		if (which == 'gain') {
			var stringCommand = 'this.node.' + which + '.value'; //this tells us which audioParam to deal with dynamically
			//console.log (eval (stringCommand + ' = ' + aValue) ); //eval evaluates a string as code!
			eval (stringCommand + ' = ' + aValue);

			//this.controls.gainDisplay.html( (eval (stringCommand)).toFixed(2) );
			//valueParam = aValue; //this[which] means i can call use the string value of which as a variable name
			//this.controls.gainDisplay.html( (valueParam).toFixed(2) );
		}
	}

	var OscNodeGUI = function () {

		this.node = audioContext.createOscillator();
		this.node.start();

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Oscillator');

		//MAKE ROW
		currentrow = NodeOp.createRow(this.controls, 'output'); //new row for output
		currentrow.data( 'node', this.node );
		var rowDisplay = $("<h1>OUTPUT</h1>");
		currentrow.append(rowDisplay);

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'frequency'); //new row for frequency io
		currentrow.data( 'node', this.node.frequency );
		rowDisplay = $("<h1>FREQUENCY</h1>");
		currentrow.append(rowDisplay);

		//ROW CONTROLS

		//create frequency numerical input
		currentrow.numberInput = $("<input type='number' value='440'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'frequency', this.value );
		});

		//END ROW

		//NEW ROW
		currentrow = NodeOp.createRow(this.controls, 'type'); //new row for wavetype
		//rowDisplay = $("<h1>TYPE</h1>");
		//currentrow.append(rowDisplay);

		//here we make a dropdown menu... gotta figure out a good way to split it up
		//without making too many assumptions...
		var typeList = $("<div class='dropdown selected'></div>");
		currentrow.append(typeList);
		
		var option = $("<li data-wavetype='sine'>SINE</li>");
		typeList.append(option);
		
		option = $("<li data-wavetype='square'>SQUARE</li>");
		typeList.append(option);
		
		option = $("<li data-wavetype='sawtooth'>SAWTOOTH</li>");
		typeList.append(option);

		option = $("<li data-wavetype='triangle'>TRIANGLE</li>");
		typeList.append(option);
		//gonna have to make this is work someday.........
		//option = $("<li data-wavetype='custom'>CUSTOM</li>");
		//typeList.append(option);

		var typeButton = $("<h1 class='dropdown-call'>TYPE<br>SINE</h1>");
		currentrow.append(typeButton);

		typeList.children().each(function() {
			$(this).click(function() {
				var node = $(this).closest('.node-controls').data('rootObj');
				node.update ('type', $(this).data('wavetype'));
				typeButton.html('TYPE<br>' + $(this).html());
				typeList.css('display','none');
			});
		});

		typeList.mouseleave(function() {
			$(this).css('display', 'none');
			typeButton.css('display', 'block');
		});

		typeButton.click(function(e) {
			console.log(typeButton.siblings('.dropdown'));
			var dropdown = typeButton.siblings('.dropdown')
			dropdown.css({
				'display': 'block',
			});
			dropdown.offset({
				'top' : e.pageY-4,
				'left' : e.pageX-4,
			});
		});
		//done with dropdown!

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node.type ); //type = wavetype
		console.log(this.node);

		//END ROW
		NodeOp.updateControlsSize (this.controls);

		//NOT TEMPORARY
		this.update ('frequency', 440);

	}

	OscNodeGUI.prototype.update = function(which, value) {
		if (which == 'frequency') {		
			this.node.frequency.value = value;
			//this.controls.freqDisplay.html( this.node.frequency.value.toFixed(2) + "hz " + this.node.type );
		}
		if (which == 'type') {
			this.node.type = value;
		}
	}
		
	var StereoPannerNodeGUI = function(type, value) {

		this.node = audioContext.createStereoPanner();

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Stereo Pan');

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'io'); //new row io
		currentrow.data( 'node', this.node );
		var ioDisplay = $("<h1>IN / OUT</h1>");
		currentrow.append(ioDisplay);


		//END ROW

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'panner'); //new row io
		currentrow.data( 'node', this.node.pan );
		var ioDisplay = $("<h1>PAN</h1>");
		currentrow.append(ioDisplay);

		//ROW CONTROLS

		//create frequency numerical input
		currentrow.numberInput = $("<input type='number' value='0' min='-1' max='1' step='.1'>");
		currentrow.append(currentrow.numberInput);

		//we use parent() to get to object reference stored in its data and call a method
		//and we have to wrap the call in an anonymous function so we can do some maths...
		currentrow.numberInput.on ('keyup mouseup', function() {
			$( this ).closest( '.node-controls' ).data( 'rootObj' ).update( 'which', this.value );
		});
		//END ROW
		NodeOp.updateControlsSize (this.controls);


		this.update('pan', 0);

	};

	StereoPannerNodeGUI.prototype.update = function(which, value) {
		if (which == 'pan') {		
			this.node.pan.value = value;
			//this.controls.panDisplay.html( this.node.pan.value.toFixed(2) );
		}
	}

	var AnalyserNodeGUI = function(type, value) {

		this.node = audioContext.createAnalyser();

		//temp?
		this.node.fftSize = 2048;
		this.bufferLength = this.node.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
		this.node.smoothingTimeConstant=1;
		//

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Analyser');
		NodeOp.createResizeHandle(this.controls);

		this.drawType = 'oscilloscope';


		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'input'); //new row input

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', this.node );

		//here we make a dropdown menu... gotta figure out a good way to split it up
		//without making too many assumptions...
		var typeList = $("<div class='dropdown selected'></div>");
		currentrow.append(typeList);
		
		var option = $("<li data-drawtype='oscilloscope'>OSCILLOSCOPE</li>");
		typeList.append(option);
		
		option = $("<li data-drawtype='frequencybar'>FREQUENCY BAR</li>");
		typeList.append(option);
		
		var typeButton = $("<h1 class='dropdown-call'>MODE<br>OSCILLOSCOPE</h1>");
		currentrow.append(typeButton);

		typeList.children().each(function() {
			$(this).click(function() {
				var node = $(this).closest('.node-controls').data('rootObj');
				node.update ('drawtype', $(this).data('drawtype'));
				//node.update ('type', $(this).data('wavetype'));
				typeButton.html('MODE<br>' + $(this).html());
				typeList.css('display','none');
			});
		});

		typeList.mouseleave(function() {
			$(this).css('display', 'none');
			typeButton.css('display', 'block');
		});

		typeButton.click(function(e) {
			console.log(typeButton.siblings('.dropdown'));
			var dropdown = typeButton.siblings('.dropdown')
			dropdown.css({
				'display': 'block',
			});
			dropdown.offset({
				'top' : e.pageY-4,
				'left' : e.pageX-4,
			});
		});



		//END ROW	

		//NEW ROW


		//temp
		var canvas = document.createElement('canvas');
		canvas.width = 135;
		canvas.height = 45;
		$(canvas).addClass('noselect');
		$(canvas).css({
			'border' : '1px solid lightgrey',
			'border-radius' : '2px',
			'margin' : '1px',
		});
		this.controls.append(canvas);
		this.canvas = canvas;
		this.vis = canvas.getContext('2d');
		this.updateDraw();

		NodeOp.updateControlsSize (this.controls);
	};

	AnalyserNodeGUI.prototype.update = function(which, value) {	
		if (which == 'drawtype') {		
			this.drawType = value;
			//this.controls.panDisplay.html( this.node.pan.value.toFixed(2) );
		}

	};

	AnalyserNodeGUI.prototype.updateDraw = function() {
		var which = this;
		//currently this ish is straight up stolen from the MDN!! Could use some
		//spicing up but make sure to give the actual person credit!
		//setInterval (function() {
		if (which.drawType == 'oscilloscope') {
			//oscilloscope works ok but these parameters should be exposed....
			which.node.fftSize = 2048; 
			which.bufferLength = which.node.frequencyBinCount;
			which.dataArray = new Uint8Array(which.bufferLength);
			which.node.smoothingTimeConstant=0;
			//ok now that we're done re-doing shit we don't really need...
			requestAnimationFrame(function() {
				which.node.getByteTimeDomainData(which.dataArray);
				which.vis.clearRect(0,0,which.canvas.width, which.canvas.height);
				which.vis.fillStyle = 'hsl(210, 29%, 18%)';
				which.vis.fillRect(0, 0, which.canvas.width,which.canvas.height);
				
				which.vis.lineWidth = 3;
				which.vis.strokeStyle = 'steelblue';
				which.vis.beginPath();
				var sliceWidth = which.canvas.width * 1.0 / (which.bufferLength);
				var x = 0;
				var y = 0;
				for(var i = 0; i < which.bufferLength + 1; i++) {
			   
					var v = which.dataArray[i] / 128.0;
					y = v * which.canvas.height/2;


					if(i === 0) {
					  which.vis.moveTo(x, y);
					} else {
					  which.vis.lineTo(x, y);
					}

					x += sliceWidth;
				};
				which.vis.lineTo(which.canvas.width, y)

				which.vis.stroke();

				which.vis.lineWidth = 2;
				which.vis.strokeStyle = 'white';
				which.vis.stroke();

				which.updateDraw();
			});
		} else {
			if (which.drawType == 'frequencybar') {
				which.node.fftSize = 2048;
				which.bufferLength = which.node.frequencyBinCount;
				which.dataArray = new Uint8Array(which.bufferLength);
				which.node.smoothingTimeConstant=0;
				requestAnimationFrame(function() {
					which.node.getByteFrequencyData(which.dataArray);
					which.vis.clearRect(0,0,which.canvas.width, which.canvas.height);
					which.vis.fillStyle = 'hsl(210, 29%, 18%)';
					which.vis.fillRect(0, 0, which.canvas.width,which.canvas.height);


					var barWidth = (which.canvas.width / which.bufferLength);
					var barHeightPercent;
					var barHeight;
					var x = 0;

					for(var i = 0; i < which.bufferLength; i++) {
						barHeightPercent = which.dataArray[i]/256;
						barHeight = which.canvas.height * barHeightPercent;

						//barHeight = which.dataArray[i]/2;

						//make color match nicely
						which.vis.fillStyle = 'rgb(' + 255 + ',255,255)';
						which.vis.fillRect(x, which.canvas.height - barHeight/2, x, barHeight);

						x += barWidth;
					};
					which.updateDraw();
				});
			};
		};
	};


	//makesa sound come outcha speakas
	var DestinationNodeGUI = function(type, value) {

		//create control window
		this.controls = $("<div class='node-controls'></div>");
		$( '#app-window' ).append(this.controls);
		//we store the object in the window...
		this.controls.data('rootObj', this);

		NodeOp.createDragHandle(this.controls,'Destination');

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'input'); //new row input

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', audioContext.destination );

		var inputDisplay = $("<h1>INPUT</h1>");
		currentrow.append(inputDisplay);
		//END ROW

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'data'); //new row input

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', audioContext.destination );

		var inputDisplay = $("<h1>OUTPUT 1 <br> (.L)</h1>");
		currentrow.append(inputDisplay);
		//END ROW

		//NEW ROW
		var currentrow = NodeOp.createRow(this.controls, 'data'); //new row input

		//gets run as code in NodeOp.connection
		currentrow.data( 'node', audioContext.destination );

		var inputDisplay = $("<h1>OUTPUT 2 <br>  (.R)</h1>");
		currentrow.append(inputDisplay);
		//END ROW
		NodeOp.updateControlsSize (this.controls);
	}



////////////////////////////////////////
//nav.nodeop
//
//this is where things get GROSS
//a lot of nitty gritty shit happens here
//and it could use some work
//
//really, this is the section that handles all the shit the nodes do
//in short, its most of WASP
//and its a fucking mess :)
////////////////////////////////////////////
//Here are the operations that accomplish creating and maintaining nodes

	var NodeOp = {
		//removes all selected elements
		removeSelected : function() {
			$( '#app-window' ).find( '.selected' ).each(function() {
					$(this).removeClass('selected' )
			});
		},	
		//initializes output handle draggability does NOT create handle
		initOutputHandle : function(handle) {
			handle.draggable({
			revertDuration: 200,
			revert: function() {
				$(handle).removeClass('selected');

					//passing values to active line
				handle.updateLine = setInterval(function() {
					var notch = handle.siblings( '.output-notch' ) [0];

					SVG.updateConnectingLine (handle, $(notch) ,foregroundLines.canvas.aline);
				}, 1);
				return('true');
			},
				drag: function() {
						var notch = handle.siblings( '.output-notch' ) [0];
						SVG.updateConnectingLine ( handle, $( notch ) ,foregroundLines.canvas.aline);
				},
				start: function() {
					$(handle).closest('.node-controls ').css('z-index', '1500'); //whole parent can we make it just output handle?
					$(handle).addClass('selected');

					//going to have to do all this svg shit differently
					var line = SVG.createLine( 0,0,0,0, $(handle).css('background-color'), 4, 'true'); //it gets updated right away anyway...

					//CURRENTLY HARDCODED AS foregroundLines WATCH OUT
					foregroundLines.canvas.aline = foregroundLines.canvas.appendChild(line);

				},
				stop: function(event, ui) {
					$(handle).closest('.node-controls ').css('z-index', '2'); //whole parent can we make it just output handle?
					$(foregroundLines.canvas).empty();					
					clearInterval (handle.updateLine);
				}
			});
		},
		disconnectByOutputHandle : function (handle) {
			var notch = handle.data('connected-notch');
			//this actually disconnects the audio nodes
			NodeOp.disconnection(handle, notch);
			//this deletes the line
			SVG.deleteLine(handle.data('connected-line'));

			//removing the handle from the output notch array of handles, though
			//is a bit tricky...
			var notchArray = $(notch.data('connected-handles'));
			notchArray.each( function(index, element) {
				if ($(element)[0] == handle[0]) {
					notchArray.splice(index,1);
				}
			});
			notch.data('connected-handles',notchArray);
			//if notch data is empty go ahead and wipe it!!
			if (notch.data('connected-handles').length == 0) {
				//remove our handle from the notch so it doesn't tel svg to draw lines
				notch.removeData('connected-handles');
				//make output handle look like it does when no outputs!
				NodeOp.resetOutputHandle( notch.siblings( '.output-handle' ).not( '.is-input') );
			}
			//we store the controls window...
			var controls = handle.closest('.node-controls');
			//finally, we delete that pesky output notch!!
			handle.remove();
			//now that its gone we update control window size!
			NodeOp.updateControlsSize(controls);
		},

		resetOutputHandle : function (handle) {
			var outputHandle = $(handle);
			outputHandle.css({
				'margin-top' : '-9px' ,
				'top' : '50%',
				'right' : '0px',
				'box-shadow' : '0px 0px 1px 1px rgba(0,0,0,.5)',
				'-webkit-box-shadow' : '0px 0px 1px 1px rgba(0,0,0,.5)',
				'-moz-box-shadow' : '0px 0px 1px 1px rgba(0,0,0,.5)'
			});
		},
		initOutputAsInputHandle : function (handle)  {
			handle.click(function() {
				NodeOp.disconnectByOutputHandle($(handle))
			});
		},

		initInputHandle : function(handle) {
			handle.droppable({
				accept: '.output-handle',
				activeClass : '.selected' ,
				tolerance : 'intersect',
				drop : function(event, ui) {
					//GOTTA BE A BETTER WAY SPLIT THIS SHIT UP!!

					var outputHandle = ui.draggable;
					//var style = outputHandle.css();

					//our output-handle is going to a foreign land
					//we need to make sure it rememberswhere home is...

					var connectedNotch = $(outputHandle.siblings('.output-notch' ) );

					


					//test connection, if true do a whole bunch of sheeit
					//also does the connection for us
					//isnt that nice?
					if ( NodeOp.connection( connectedNotch, $(this) ) ) {

					outputHandle.data('node-controls', outputHandle.closest('.node-controls' ) ); //store control window of parent
					outputHandle.data('connected-notch', connectedNotch );
					
					//the notch must remember too
					//make an array so we can do multi-out? //AND THEN I DID
					if (connectedNotch.data('connected-handles') === undefined ) {
						connectedNotch.data('connected-handles', [] );
						connectedNotch.data('connected-handles').push(outputHandle);
					} else {
						connectedNotch.data('connected-handles').push(outputHandle);
					}
						//create a new output handle back at home
						var row = outputHandle.closest('.row'); //need this for later..

						outputHandle.addClass ( 'is-input' ); //registers that this output went somewhere!
						connectedNotch.addClass ('sending-output' ); //registers that this output is sending signal somewhere!
		
						//sloppy list of css to revert after we change parents...
						//put this in an array or some shit and get it out of here!
						var bgcol = outputHandle.css ( 'background-color' );
						var col = outputHandle.css ( 'color' );
						var ff = outputHandle.css ( 'font-family' );
						var fs = outputHandle.css ( 'font-size' );
						var lh = outputHandle.css ( 'line-height' );
						var fw = outputHandle.css ( 'font-weight' );
						var fst = outputHandle.css ( 'font-style' );
						var shadow = '-5px 0px 10px 0px ' + bgcol;

						//changing the parent to the input node we are connecting to...			
						outputHandle.appendTo (this.closest('.row'));

//						var inputs = outputHandle.siblings('.is-input').length;
//						var inputOffset = (outputHandle.height() + 5);
//						var inputRows = inputs * inputOffset;


						outputHandle.draggable('option','revert','false');
						outputHandle.draggable('destroy');
						outputHandle.removeClass('selected');

						var controls = outputHandle.closest('.node-controls');

/*						
						//time to deal with sizing and shit--
*/
						//re-render handle style there must be a better way ughughgu
						outputHandle.css( 'background-color', col );
						outputHandle.css( 'color', bgcol );
						outputHandle.css( 'border-color', bgcol );
						outputHandle.css( 'font-family', ff );
						outputHandle.css( 'font-size', fs );	
						outputHandle.css( 'line-height', lh );
						outputHandle.css( 'font-weight', fw );;
						outputHandle.css( 'font-style', fst );	
						outputHandle.css( '-webkit-box-shadow', shadow);

						
						//now we make a new output Handle at home...

						var newOutputHandle = outputHandle.clone();
						newOutputHandle.removeClass ('is-input');
						newOutputHandle.appendTo(row);
						newOutputHandle.removeAttr('style');
						newOutputHandle.css({'top': '50%'});
						newOutputHandle.css({'right': '-5px', 'margin-top' : '-9px'});
						newOutputHandle.css( '-webkit-box-shadow', '5px 0px 10px 0px ' + bgcol );
						NodeOp.initOutputHandle (newOutputHandle);



						//made it!!
						//lets draw a line to celebrate!

						//get these foreground lines out of my way
						$(foregroundLines.canvas).empty();
						//and draw some nice background lines instead
						var line = SVG.createLine( 0,0,100,100, bgcol, 2, 'true'); //it gets updated right away anyway...
						outputHandle.data( 'connected-line', backgroundLines.canvas.appendChild(line) );
						//backgroundLines.canvas.appendChild(line);
						//outputHandle.val( 'line', line );


						var $line = $(line);
						$line.hover(function() {
							SVG.mouseOverLine(line,6)
						}, function() {
							SVG.mouseLeaveLine(line,2);
						});
						$line.click(function() {
							console.log('you clicked a line!');
						});
						
						//this re-fits controls window and re-places elements
						//it also updates the connecting line
						NodeOp.updateControlsSize (controls);


						//now we make our output Handle an output as input handle...
						setTimeout( function() {NodeOp.initOutputAsInputHandle (outputHandle)}, 500 );
					}
				},
				over : function(event) {

				}
			});
		},
		connection : function(from, to) {
			//this is where we connect two audio nodes using data stored in strings in the ROW containing our handles...
			var toNode = eval ( to.parents( '.row' ).data( 'node' ) );
			var fromNode = eval ( from.parents( '.row' ).data( 'node' ) );
			console.log (' can ' + fromNode + 'connect to' + toNode + '?');

			//apparently there is no way to check if audionodes are already connected so we gotta do our own thing...

			if (fromNode == '[object AudioParam]') {
				console.log ('no, output is AudioParam and I havent made that work yet');
				return false;
			} else {
				console.log ('...are they already connected?');
				//how do i tell???

				//there is no way in Web Audio API to check if two nodes are connected, but...
				//disconnect throws an ERROR message
				//so if we disconnect but catch it in a try...
				//then we can perform a 'check'
				try {
					fromNode.disconnect(toNode);
					console.log ('they were already connected');
					fromNode.connect(toNode)
					return false;
				}
				catch(err) {
					fromNode.connect(toNode)
					console.log('connection made!');
					return true;
				};
			};		
		},

		disconnection : function(to, from) {
			//this is where we connect two audio nodes using data stored in strings in the ROW containing our handles...
			var toNode = eval ( to.parents( '.row' ).data( 'node' ) );
			var fromNode = eval ( from.parents( '.row' ).data( 'node' ) );
			console.log ('severing connection between ' + fromNode + ' and ' + toNode + '?');
			fromNode.disconnect(toNode);
			return true;
		},

		onControlsDrag : function(actual){

			$('#app-window').children('.selected').each(function() {

				var which = $(this);
				var offsetPos = which.data('offsetPosition');

				if (!which.is(actual) ) {
					which.offset({ 'top' : event.pageY - offsetPos.top , 'left' : event.pageX - offsetPos.left});
				};
				//we have to update all connected lines!
				which.find('.is-input').each(function() {
					var outputHandle = $(this);
					SVG.updateConnectingLine ( outputHandle , outputHandle.data ('connected-notch') , outputHandle.data('connected-line') )
				});
			

				which.find('.sending-output').each(function() {

				//we save all output handles connected to output notch to an array called connected-handles
				//and we iterate through them to draw!

					var outputNotch = $(this);
					var outputNotchHandleArray = $( outputNotch.data('connected-handles') );
					outputNotchHandleArray.each( function() {
						var ourHandle = this;
						SVG.updateConnectingLine ( ourHandle , outputNotch , ourHandle.data('connected-line') )
					});
				
			});

			});
		},
		resetResizeHandles : function(controls) {
			controls.children('.resize-handle').each(function() {
				var handle = $(this);
				if (handle.hasClass('resize-se')) {
					handle.css({
							'top' : controls.height(),
							'left' : controls.width(),
					});
				} else {
					if (handle.hasClass('resize-s')) {
						handle.css({
							'top' : controls.height(),
							'left' : 0,
							'width' : '100%'
						});
					} else {
						if (handle.hasClass('resize-sw')) {
							handle.css({
								'top' : controls.height(),
								'left' : 0,
							});
						} else {
							if (handle.hasClass('resize-e')) {
								handle.css({
									'top' : 0,
									'height' : '100%',
									'left' : controls.width(),
								});
							} else {
								if (handle.hasClass('resize-w')) {
									handle.css({
										'top' : 0,
										'height' : '100%',
										'left' : 0,
									});
								};
							};
						};
					};
				};
			});
		},
		//now we create a resize handle for certain elements....
		createResizeHandle : function(controls) {
			var xOffset, yOffset;
			var sehandle = $('<div class="resize-handle resize-se"></div>');
			controls.append(sehandle);

			//southeasthandle
			sehandle.draggable({
				start: function() {
					yOffset = controls.height() - controls.data('rootObj').canvas.height;
					xOffset = 4;
					//xOffset = controls.width() - controls.data('rootObj').canvas.width;
				},
				drag: function(e) {
					if (sehandle.position().left > 100) {
						controls.width(sehandle.position().left);
					} else {controls.width(100)};

					if (sehandle.position().top > 80) {
						controls.height(sehandle.position().top);
					} else {controls.height(80)};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() -xOffset,
					});
				},	
				stop: function(e) {
					if (sehandle.position().left > 100) {
						controls.width(sehandle.position().left);
					} else {controls.width(100)};

					if (sehandle.position().top > 80) {
						controls.height(sehandle.position().top);
					} else {controls.height(80)};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() -xOffset,
					});
					controls.data('rootObj').canvas.width = controls.width() - xOffset;
					controls.data('rootObj').canvas.height = controls.height() - yOffset;

					NodeOp.resetResizeHandles(controls);
				},	
			});
			//south handle
			var shandle = $('<div class="resize-handle resize-s"></div>');
			controls.append(shandle);
			shandle.draggable({
				start: function() {
					yOffset = controls.height() - controls.data('rootObj').canvas.height;
					xOffset = 4;
					//xOffset = controls.width() - controls.data('rootObj').canvas.width;
				},
				drag: function(e) {
					if (shandle.position().top > 80) {
						controls.height(shandle.position().top);
					} else {controls.height(80)};
					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() -xOffset,
					});
				},	
				stop: function(e) {

					if (shandle.position().top > 80) {
						controls.height(shandle.position().top);
					} else {controls.height(80)};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() - xOffset,
					});
					controls.data('rootObj').canvas.width = controls.width() - xOffset;
					controls.data('rootObj').canvas.height = controls.height() - yOffset;

					NodeOp.resetResizeHandles(controls);
				},
			});
			var swhandle = $('<div class="resize-handle resize-sw"></div>');
			controls.append(swhandle);
			var sePoint = {x:0,y:0};

			//southwesthandle
			swhandle.draggable({
				helper: 'clone',
				start: function() {
					yOffset = controls.height() - controls.data('rootObj').canvas.height;
					xOffset = 4;
					sePoint.x = controls.offset().left + controls.width();
					sePoint.y = controls.offset().top + controls.height();
					//xOffset = controls.width() - controls.data('rootObj').canvas.width;
				},
				drag: function(e) {
					if (e.pageX < (sePoint.x - 100) ) {
						controls.offset({'left': e.pageX});
						var w = sePoint.x - controls.offset().left;
						controls.width(w);
					};

					swhandle.offset({'top': e.pageY});
					swhandle.offset({'left': e.pageX});

					if (swhandle.position().top > 80) {
						controls.height(swhandle.position().top);
					} else {controls.height(80)};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() -xOffset,
					});
				},	
				stop: function(e) {
					if (e.pageX < (sePoint.x - 100) ) {
						controls.offset({'left': e.pageX});
						var w = sePoint.x - controls.offset().left;
						controls.width(w);
					};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() - xOffset,
					});

					controls.data('rootObj').canvas.width = controls.width() - xOffset;
					controls.data('rootObj').canvas.height = controls.height() - yOffset;

					NodeOp.resetResizeHandles(controls);
				},	
			});
			var whandle = $('<div class="resize-handle resize-w"></div>');
			controls.append(whandle);
			//westhandle
			whandle.draggable({
				helper: 'clone',
				start: function() {
					yOffset = controls.height() - controls.data('rootObj').canvas.height;
					xOffset = 4;
					sePoint.x = controls.offset().left + controls.width();
					sePoint.y = controls.offset().top + controls.height();
					//xOffset = controls.width() - controls.data('rootObj').canvas.width;
				},
				drag: function(e) {
					if (e.pageX < (sePoint.x - 100) ) {
						controls.offset({'left': e.pageX});
						var w = sePoint.x - controls.offset().left;
						controls.width(w);
					};

					whandle.offset({'top': e.pageY});
					whandle.offset({'left': e.pageX});

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() -xOffset,
					});
				},	
				stop: function(e) {
					if (e.pageX < (sePoint.x - 100) ) {
						controls.offset({'left': e.pageX});
						var w = sePoint.x - controls.offset().left;
						controls.width(w);
					};

					$(controls.data('rootObj').canvas).css({
						'height' : controls.height() - yOffset,
						'width' : controls.width() - xOffset,
					});

					controls.data('rootObj').canvas.width = controls.width() - xOffset;
					controls.data('rootObj').canvas.height = controls.height() - yOffset;

					NodeOp.resetResizeHandles(controls);
				},	
			});
			var ehandle = $('<div class="resize-handle resize-e"></div>');
			controls.append(ehandle);
			//easthandle
			ehandle.draggable({
				start: function() {
					yOffset = controls.height() - controls.data('rootObj').canvas.height;
					xOffset = 4;
					//xOffset = controls.width() - controls.data('rootObj').canvas.width;
				},
				drag: function(e) {
					if (ehandle.position().left > 100) {
						controls.width(ehandle.position().left);
					} else {controls.width(100)};


					$(controls.data('rootObj').canvas).css({
						'width' : controls.width() -xOffset,
					});
				},	
				stop: function(e) {
					if (ehandle.position().left > 100) {
						controls.width(ehandle.position().left);
					} else {controls.width(100)};

					$(controls.data('rootObj').canvas).css({
						'width' : controls.width() -xOffset,
					});
					controls.data('rootObj').canvas.width = controls.width() - xOffset;
					controls.data('rootObj').canvas.height = controls.height() - yOffset;

					NodeOp.resetResizeHandles(controls);
				},	
			});

		},
		//creates the top bar handle for dragging window around
		createDragHandle : function(controls, title) {
			//creates top bar to drag it by --no reference needed!
			var appender = $("<div class='drag-handle'>" + title + "</div>");
			controls.append(appender);
			var closeButton = $("<span class ='close-button'>x</span>");
			appender.append(closeButton);
			controls.draggable({
				containment: $( '#app-window' ),
				handle: '.drag-handle',
				stack: '.node-controls',
				start: function(e) {
					var actual = $(this);
					
					//remove all other selected if not holding shift
					//if (!e.shiftKey) {
					//	NodeOp.removeSelected();
					//}
					//this bullshit is to deal with dragging a bunch of selected shit at once
					$('#app-window').children('.selected').not(actual).each(function() {
						var thisPos = $(this).offset();
						var myPos = actual.offset();
						var endPos = {top: event.pageY - thisPos.top , left: event.pageX - thisPos.left}
						$(this).data('offsetPosition', endPos);
					});

					//NodeOp.removeSelected();
					//controls.css('opacity', '0.8');
					controls.addClass('selected');
				},
				drag: function() {
					NodeOp.onControlsDrag( $(this) );
				},
				stop: function() {
					//controls.css('opacity', '1');
				//	controls.removeClass('selected');
					
					//make sure nothing is misaligned at end of drag!
					NodeOp.onControlsDrag( $(this) );
				}
			});
			controls.on('mousedown',function(e) {
				if (e.which == 1) { //left mouse button
					if (e.shiftKey) {
						if (controls.hasClass('selected')) {
							controls.removeClass('selected');
						} else {
							controls.addClass('selected');
						};
					} else {
						NodeOp.removeSelected();
						controls.addClass('selected');
					};
				};
			});
			controls.on('click',function(e) {
			});
			controls.children( ' .drag-handle ' ).dblclick(function() {
				console.log ('double click!');
				//here we do shit to minimize window
			});
			closeButton.click(function() {
				
				controls.find('.is-input').each(function() {
					NodeOp.disconnectByOutputHandle( $(this) );
				});

				controls.find('.sending-output').each(function() {
					var handleArray = $(this).data('connected-handles');
					$(handleArray).each(function(index,element) {
						NodeOp.disconnectByOutputHandle( $(this) );
					});
				});
				controls.children().each(function() {this.remove()});
				controls.css({'background': 'black'});
				setTimeout(function() {
				controls.remove();
				},30);

			});
		},
		updateControlsSize : function (controls) {
			var vMargin = 2;
			var minRowHeight = 17;
			controls.children('.row').each(function() {
				var inputCount = 0;
				var displace = 0;
				var topOffset = 9;
				$(this).children('.is-input').each(function() {
					$(this).css({
						'top' : displace + topOffset + vMargin,
						'left' : -5,
					});
					displace += $(this).outerHeight();
					SVG.updateConnectingLine( $(this), $(this).data('connected-notch'), $(this).data('connected-line') );
				});
				if (displace == 0) {displace = 17 };
				var inputHandle = $(this).children('.input-handle');
				inputHandle.css({
					'top' : topOffset + vMargin,
					'min-height' : displace,
				});
				//if ($(this).height() < displace) {
					$(this).css({	
						'min-height' : displace + vMargin*2,
						'height' : 20,
					});
				//};
			});
			controls.css('height','auto');

			//now if there are resize handles we then reset them to new window size!
			NodeOp.resetResizeHandles(controls);

		},
		createRow : function (controls, type) {
			var row = $( "<div class='row " + type + "  '> </div>");
			controls.append (row);
			var input = true;
			var output = true;
			var symbol = false;
			var cssString = 'color: magenta'

			switch(type) {
				case ('frequency') :
					symbol ='&#402;';
					output = false;
					break;
				case ('gain') :
					symbol = 'A';
					output = false;

					break;
				case ('type') :
					symbol = 'w'; //for wave, type is wavetype
					input = false;
					output = false;

					break;

				case ('delay-time') :
					symbol = 'T';
					output = false;
					break;

				case ('panner') :
					symbol = 'p';
					output = false;

					break;

				case ('q') :
					symbol = 'Q';
					output = false;

					break;

				case ('data') :
					
					input = false;
					output = false;
					break;
				case ('input') :
					symbol = 'S'
					output = false;
					break;

				case ('output') :
					symbol = 'S'
					input = false;
					break;
				case ('io') :
					symbol = 'S'
					break;
			}
			
			if (input) {
				//leave if we don't want an io
				//makes our input handle
				if (!symbol) {symbol = '<bold>I</bold>'};

				row.inputHandle = $( "<div class ='input-handle noselect'>"+ symbol + "</div>" );
				row.append (row.inputHandle);
				row.inputHandle.css({ cssString });

				NodeOp.initInputHandle (row.inputHandle);
			}

			if (symbol == '<bold>I</bold>') {
				symbol = false;
			}

			if (output) {

				if (!symbol)  {symbol = '<bold>O</bold>'};

				//creates a notch for when we drag output away
				row.outputNotch = $( "<div class ='output-notch noselect'></div>" );
				row.append (row.outputNotch);

				//creates a handle we can drag an output out of
				row.outputHandle = $( "<div class ='output-handle noselect'>" + symbol + "</div>" );
				row.append(row.outputHandle);
				row.outputHandle.css({ cssString });

				//THIS could be done better!!
				NodeOp.initOutputHandle (row.outputHandle);
			}

			//so we can add controls
			return row;
		}


	};

	function createNode (nodetype) {
		var node;			//a reference to the node we're creating
		var locateNode;		//the location in nodeArray we want to store that reference

		switch(nodetype) {
			case ('osc'):
				node = new OscNodeGUI();
				break;

			case ('gain'):
				node = new GainNodeGUI();
				break;

			case ('delay'):
				node = new DelayNodeGUI();
				break;

			case ('panner'):
				node = new StereoPannerNodeGUI();
				break;

			case ('destination'):
				node = new DestinationNodeGUI();
				break;

			case ('analyser'):
				node = new AnalyserNodeGUI();
				break;

			case ('biquad-filter'):
				node = new BiquadFilterNodeGUI();
				break;

			default:

				console.log ('ERROR: Node kind not defined!');

		}

		//nodeArray.push (node);
	}
});

