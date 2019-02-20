/* Replication of Goldstone and Carvalho's Experiment using our stimuli. */

/*   Create a Psiturk object to keep track of the experiment's pages for its
                        corresponding participants.                       */
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

/* This array contains all the html pages to be used in this experiment.

 * instructions/Briefing.html: Debriefs the participant on the experiment.
 * instructions/Active-Study.html: instructions before active learning phase.
 * instructions/Passive-Study.html: instructions before passive learning phase.
 instructions/TestingPhase.html: instructions before testing phase.
 * stage.html: stage on which we draw the stimulus.
 * postquestionnaire.html: Contains a thank you and goodbye.

 */
var Pages = [
	"instructions/Briefing.html",
  "instructions/Active-Study.html",
	"instructions/Passive-Study.html",
  "instructions/TestingPhase.html",
  "stage.html",
	"postquestionnaire2.html"];

var ActiveInstructions = [
	"instructions/Briefing.html",
	"instructions/Active-Study.html"];

var PassiveInstructions = [
	"instructions/Briefing.html",
	"instructions/Passive-Study.html"];

var TestingInstructions = ["instructions/TestingPhase.html"];

/* Preload all pages so that PsiTurk can speedily switch between them. */
psiTurk.preloadPages(Pages);

/* Create an object for this experiment:

 * Dimensions: will be randomly assigned to attributes of the bird. Only the
   number of features that vary are included. If you'd like to vary more features,
	 add more dimensions.
 * Blocks: number of blocks per phase. Currently 4 for study and later 1 for test.
 * Stimuli: number of stimuli per block. Currently 24, later 36.
 * Current Trial: keeps track of the current trial of the experiment.
 * Current View: What's displayed on the screen. Usually stage.html.
 * To Draw: Information on category and configuration drawn.
 * Testing: Boolean on whether currently in testing phase.
 * Condition: condition of test group.
 * Task: task the participants will be a part of.

 (Counterbalance 1 and 2 are provided by psiTurk in exp.html. If there are no
 	conditions to counterbalance, you can change this in config.txt.)

 */
var experiment = {
    dimensions: [0,1,2,3],
    blocks: 4,
    stimuli: 24,
    currentTrial: 0,
		currentView: undefined,
		toDraw: undefined,
		testing: undefined,
    condition: function(){ return counterbalance1 == 1 ? "passive" : "active"; },
		task: function(){ return counterbalance2 == 1 ? "interleaved" : "blocked"; }
}

/* Set true to print useful debugging information. */
var debug = true;

/* Global variable for keeping track of duration of experiment. */
var startTime;

/* Each category has a diagnostic characteristic at index 0, and nondiagnostic
 	 features from indeces 1-3.
	 So far only the first four features are drawn, and the last two features
	 (eyes and tail bulb color) are omitted.
	 To draw them all, you can uncomment those sections from the drawbug() function.
	 and append new diagnistic configurations. */
var category1 = [
	["a","0120"],["a","0010"],["a","0021"],["a","0000"],
	["a","0101"],["a","0001"],["a","0020"],["a","0121"],
	["a","0011"],["a","0100"],["a","0110"],["a","0111"]
];
var category2 = [
	["b","1120"],["b","1010"],["b","1021"],["b","1000"],
	["b","1101"],["b","1001"],["b","1020"],["b","1121"],
	["b","1011"],["b","1100"],["b","1110"],["b","1111"]
];
var category3 = [
	["c","2120"],["c","2010"],["c","2021"],["c","2000"],
	["c","2101"],["c","2001"],["c","2020"],["c","2121"],
	["c","2011"],["c","2100"],["c","2110"],["c","2111"]
];
var learningStimuli = [];
var testingStimuli = [];

/* Arbitrary values for scaling the bird. */
var bugScale = 9;

/* height and width of the svg on which we will draw the bugs in px */
var canvasHeight = 500;
var canvasWidth = 600;

/* Central x and y values to be used for drawing */
var centX = canvasWidth/2;
var centY = canvasHeight*0.4;

/* Dimensions for bug properties */
var bodyRx = 20*bugScale;
var bodyRy = 10*bugScale;
var headRx = 6*bugScale;
var headRy = 12*bugScale
var eyeWidth = headRx/2;

/* Center points to be used for reference */
var headCy = centY;
var headCx = centX - (bodyRx + headRx);
var eyeCx = headCx + 3*bugScale;

/* Shuffles an aray by swapping the current value -starting at the end of the
   array and traversing to the beginning- with a random value in the array. */
function shuffle(array){
	var currentIndex = array.length, nextIndex, temp;

	while(currentIndex !== 0) {
		nextIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		/* Value to move from index currentIndex is stored in temp. */
		temp = array[currentIndex];
		/* Value in currentIndex is now equal to the value in nextIndex. */
		array[currentIndex] = array[nextIndex];
		/* Value in nextIndex is now equal to temp. */
		array[nextIndex] = temp;
	}
	return array;
};

/* Creates the stimuli order based on the probability specified in probs. */
function order(){
	/* Probability table for how likely each category is to follow another.
		         [[aa, ab, ac], [ba, bb, bc], [ca, cb, cc]]                 */
	var probs = experiment.task == "interleaved" ?
	[[0.25, 0.375, 0.375], [0.375, 0.25, 0.375], [0.375, 0.375, 0.25]]:
	[[.75, .125, .125], [.125, .75, .125], [.125, .125, .75]];

	/* How many stimuli of each category we have and keep count of them . */
	var numEach = 8, counts = [numEach, numEach, numEach],
	    stimArray = [],
	    a = 0, b = 1, c = 2;

	/* Add up the probabilities of the letters we haven't run out of. */
	var normalize = function(probs, counts, char) {
		/* New distribution of normalized probabilities. */
	  var normalDist = [];
		/* Total probabilities of all letters to follow char. */
	  var total = 0;

		for (var p = 0; p < 3; p++) {
			if (counts[p] > 0) total += probs[char][p];
		}

		/* Divide the probabilities of the letters we haven't run out of by the total.
		   If we have run out of a letter, set its probability to zero.
			 Add these probabilities to normalDist, our new array of probabilities
			 for the character coming after char.                                      */
		for (p = 0; p < 3; p++) {
			normalDist[p] = counts[p] > 0 ? probs[char][p]/total : 0;
		}

		return normalDist;
	};

	/* Gets the next category by normalizing the probabilities and picking the
	                           next a, b or c.                               */
	var nextSample = function(probs, counts, char){
		var dist = normalize(probs, counts, char),
		 		r = Math.random();

		if (r < dist[a]) {
			return 0;
		} else if (r < (dist[a] + dist[b])) {
			return 1;
		} else if (r < (dist[a] + dist[b] + dist[c])) {
			return 2;
		}
	};

	/* Returns an array of categories arranged by the probabilities indicated above. */
	var sample = function(probs, counts, numStims) {
		var prev, events = [], num = Math.random();

		/* If num < 1/3, prev = 0; if num < 2/3 prev = 1; else prev = 2. */
		prev = (num < (1/3)) ? 0 : (num < (2/3)) ? 1 : 2;

		for (var i = 0; i < numStims; i++) {
			prev = nextSample(probs, counts, prev);
			events[i] = prev;
			counts[prev] -= 1;

			/* stimArray[i] = "a" if prev = 0, "b" if prev = 1, "c" otherwise. */
			stimArray[i] = (prev === 0) ? "a" : (prev === 1) ? "b" : "c";
		}
		return stimArray;
	};

	return sample(probs, counts, experiment.stimuli);
};

/* Return's a random int between range(0, max). */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

/* Initializes learning stimuli given the number of stimuli you'd like from each
   category and how many times you'd like to repeat that stimuli. */
function initializeLearningStimuli(numStimuli, numRepeat){
	var temp = [];

  for (var category=0; category<3; category++){
		/* For each category, remove a copy of the stimuli in it.*/
		var toRemove = eval("category"+(category+1)).slice();
		/* Calculate the index of temp to store removed values. */
		var index = numStimuli*category;

		for (var i=0; i<numStimuli; i++){
			/* Remove numStimuli number of random elements from each category. */
			var stimuli = toRemove.splice(getRandomInt(toRemove.length),1);
			/* Store stimuli[0] in temp because js is weird about copying array values.*/
		  temp[index + i] = stimuli[0];
		}
  }
  var copy = temp.slice();
	for (var toCopy=0; toCopy<numRepeat-1; toCopy++){
		/* Make numRepeat number of copies of each stimuli. */
		learningStimuli = temp.concat(copy);
	}
	/* Sort stimuli in alphabetical order. Critical for compatibility from probabilities. */
	learningStimuli.sort(alphabetize);
};

/* Returns a shuffled order of all stimuli in each category. */
function initializeTestingStimuli(){

	for (var i=0; i<3; i++){
		var toRemove = eval("category"+(i+1));
		testingStimuli = testingStimuli.concat(toRemove);
	}
	if (debug) console.log("Testing stimuli: "+testingStimuli);
	testingStimuli = shuffle(testingStimuli);
	if (debug) console.log("Shuffled testing stimuli: "+testingStimuli);
};

/* Comparator to order alphabetically. */
function alphabetize(a, b){
	var firstVal = a[0][0], nextVal = b[0][0];
	return firstVal < nextVal ? -1: firstVal > nextVal ? 1 : 0;
};

/* Returns next learning block given the learning stimuli. */
function getBlock(stimuli){
	/* Create a copy of learning stimuli. */
	var temp = stimuli.slice();
	/* Shuffle the learning stimuli and alphabetize to increase randomness. */
	temp = shuffle(temp);
	temp.sort(alphabetize);
	/* Get probabilities for next learning block. */
	var ordered = order();
	if (debug) console.log("Order recieved: "+ordered);
	/* Associate an abstract configuration to each letter returned from order(). */
	var converted = convert(ordered, temp);
	return converted;
};

/* Converts an array containing the order of probabilites to an array containing
   the order of probabilites and a corresponding abstract configuration.

	 ['a','b','c',...] -> [['a','0010'], ['b','1020'], ['c','2010'],...]        */
function convert(order, stimuli){
	/* Since we ordered our stimuli alphabetically, all a's range from 0-7, b's from
	   8-15, and c's from 16-23. Critical for probabilties recieved from order. */
	var a=0, b=8, c=16;
	var temp = [];
	for (var i=0; i<experiment.stimuli; i++){
		var stim = order.pop();
		if (stim === "a"){
			/* If our next stimuli is 'a', add stimuli[a] and increment a. */
			stim = stimuli[a++];
			temp.unshift(stim);
		} else if (stim === "b"){
			/* If our next stimuli is 'b', add stimuli[a] and increment b. */
			stim = stimuli[b++];
			temp.unshift(stim);
		} else {
			/* If our next stimuli is 'c', add stimuli[a] and increment c. */
			stim = stimuli[c++];
			temp.unshift(stim);
		}
	}
	return temp;
};

function drawbug(duration, showCategory, feedback, instruct){
  /* Create the canvas to draw the bug on. */
  var svg = d3.select("#stim").select("#canvas")
      			.attr("height",500)
						.attr("width",600);

	/* White out instructions to not confuse participants. */
	document.getElementById("Top").style.color = "white";
	document.getElementById("Bottom").style.color = "white";

  /* Takes the value at the specified index and draws the body part according
	   to this value.                                                        */
	var wing = parseInt(experiment.toDraw[1].charAt(experiment.dimensions[0]));
  var bulb = parseInt(experiment.toDraw[1].charAt(experiment.dimensions[1]));
  var tongue = parseInt(experiment.toDraw[1].charAt(experiment.dimensions[2]));
	var foot = parseInt(experiment.toDraw[1].charAt(experiment.dimensions[3]));
	var tail = 0;
	var eye = 0;

	/* Static Body Parts:
	   Draw Body. */
	var path =
	  " M " + (centX-160) + " " + (centY+150) +
	  " A " + (eyeCx-200) + " " + (centY-50) + " 0 1 1 " + (centX+115) + " " + (centY+150);
		svg.select("#ticks") .attr("d", path);

	var path =
	  " M " + (centX - 160) + "," + (centY + 150) +
	  " L " + (centX + 115) + "," + (centY + 150);
		svg.select("#bodyLine").attr("d", path);

	/* Draw Eye. */
	svg.select("#eyeOuter")
				.attr("cx", centX - 110 + bodyRx/2)
				.attr("cy", centY + headRy - 50)
				.attr("r", 2*eyeWidth);

	/* Draw Spikes. */
	var path =
		" M " + (centX - 160) + "," + (centY + 150) +
		" L " + (centX - 230) + "," + (centY + 100);
		svg.select("#spike1A").attr("d", path);

	var path =
		" M " + (centX - 230) + "," + (centY + 100) +
		" L " + (centX - 148) + "," + (centY + 70);
		svg.select("#spike1B").attr("d", path);

  var path =
		" M " + (centX - 148) + "," + (centY + 70) +
		" L " + (centX - 210) + "," + (centY - 10);
		svg.select("#spike2A").attr("d", path);

	var path =
		" M " + (centX - 210) + "," + (centY - 10) +
		" L " + (centX - 112) + "," + (centY + 5);
		svg.select("#spike2B").attr("d", path);

	var path =
		" M " + (centX - 112) + "," + (centY + 5) +
		" L " + (centX - 140) + "," + (centY - 85);
		svg.select("#spike3A").attr("d", path);

	var path =
		" M " + (centX - 140) + "," + (centY - 85) +
		" L " + (centX - 45) + "," + (centY - 40);
		svg.select("#spike3B").attr("d", path);

	/* Draw Wing Stripes. */
	var path =
		" M " + (centX - 195) + "," + (centY + 10) +
		" L " + (centX - 175) + "," + (centY - 5);
		svg.select("#leftWingStripe").attr("d", path);
	var path =
		" M " + (centX - 188) + "," + (centY + 20) +
		" L " + (centX - 158) + "," + (centY - 2);
		svg.select("#midLeftWingStripe").attr("d", path);
	var path =
		" M " + (centX - 180) + "," + (centY + 30) +
		" L " + (centX - 142) + "," + (centY );
		svg.select("#midRightWingStripe").attr("d", path);
	var path =
		" M " + (centX - 170) + "," + (centY + 44) +
		" L " + (centX - 119) + "," + (centY + 4);
		svg.select("#rightWingStripe").attr("d", path);

	/* Draw Leg. */
	var path =
		" M " + (centX - 110 + bodyRx/2) + "," + (centY + 150) +
		" L " + (centX -110 + bodyRx/2) + "," + (centY + 295);
		svg.select("#leg").attr("d", path);

	/* Draw Foot. */
	var path =
		" M " + (centX - 110 + bodyRx/2) + "," + (centY + 295) +
		" L " + (centX - 60 + bodyRx/2) + "," + (centY + 295);
		svg.select("#footRight").attr("d", path);
	var path =
		" M " + (centX - 110 + bodyRx/2) + "," + (centY + 295) +
		" L " + (centX - 160 + bodyRx/2) + "," + (centY + 295);
		svg.select("#footLeft").attr("d", path);

	/* Draw Tail.
	var path =
		" M " + (centX - 160) + "," + (centY + 150) +
		" L " + (centX - 255) + "," + (centY + 280);
		svg.select("#tail1").attr("d", path);

	var path =
		" M " + (centX - 160) + "," + (centY + 150) +
		" L " + (centX - 205) + "," + (centY + 250);
		svg.select("#tail2").attr("d", path);

	var path =
		" M " + (centX - 160) + "," + (centY + 150) +
		" L " + (centX - 250) + "," + (centY + 230);
		svg.select("#tail3").attr("d", path); */

	/* Draw Tail Bulbs
	svg.select("#tailBulb1")
				.attr("cx", centX-250)
				.attr("cy", centY+278)
				.attr("r", eyeWidth/2);
	svg.select("#tailBulb2")
				.attr("cx", centX-225)
				.attr("cy", centY+265)
				.attr("r", eyeWidth/2);
	svg.select("#tailBulb3")
				.attr("cx", centX-250)
				.attr("cy", centY+250)
				.attr("r", eyeWidth/2); */

	/* Draw Antenna. */
	var path =
		" M " + (centX - 80 + bodyRx/2) + "," + (centY - 150) +
		" L " + (centX - 110 + bodyRx/2) + "," + (centY - 42);
		svg.select("#antennaLine").attr("d", path);

	var path =
		" M " + (centX - 80 + bodyRx/2) + " " + (centY - 150) +
		" Q " + (centX - 70 + bodyRx/2) + " " + (centY - 180) +
		" " + (centX -12 + bodyRx/2) + " " + (centY - 160);
		svg.select("#antenna").attr("d", path);

	/* Draw Antenna Bulbs. */
  svg.select("#outerBulb")
    .attr("cx", centX + 90)
    .attr("cy", (centY - 135))
    .attr("r", eyeWidth);
  svg.select("#antennaBulb2")
    .attr("cx", centX + 90)
    .attr("cy", (centY - 135))
    .attr("r", eyeWidth / 1.5);
  svg.select("#antennaBulb3")
    .attr("cx", centX + 90)
    .attr("cy", (centY - 135))
    .attr("r", eyeWidth / 3.5);

	/* Draw Beak. */
  var path =
		" M " + (centX+115) + "," + (centY + 150) +
		" L " + (centX + 240) + "," + (centY + 100);
		svg.select("#beak1").attr("d", path);

	var path =
		" M " + (centX + 108) + "," + (centY + 92) +
		" L " + (centX + 240) + "," + (centY + 100);
		svg.select("#beak2").attr("d", path);

	var path =
	  " M " + (centX + 108) + "," + (centY + 92) +
		" L " + (centX + 240) + "," + (centY + 75);
		svg.select("#beak3").attr("d", path);

	var path =
	  " M " + (centX + 80) + "," + (centY + 20) +
		" L " + (centX + 240) + "," + (centY + 75);
		svg.select("#beak4").attr("d", path);

	/* Draw Tongue. */
	var path =
	  " M " + (centX+115) + "," + (centY + 92) +
		" L " + (centX + 300) + "," + (centY + 85);
		svg.select("#tongue").attr("d", path);

	/* Draw Ticks. */
	var path =
	  " M " + (centX + 250) + "," + (centY + 75) +
		" L " + (centX + 250) + "," + (centY + 102);
		svg.select("#leftTick").attr("d", path);
	var path =
	  " M " + (centX + 265) + "," + (centY + 75) +
		" L " + (centX + 265) + "," + (centY + 102);
		svg.select("#midTick").attr("d", path);
	var path =
	  " M " + (centX + 280) + "," + (centY + 75) +
		" L " + (centX + 280) + "," + (centY + 102);
		svg.select("#rightTick").attr("d", path);

	/* Non-static Body Parts:
		 Eye Diameter: */
	if (eye === 0) { 	/* Big Pupil */
	    svg.select("#eyeInnerCircle1").attr("visibility", "hidden");
			svg.select("#eyeInnerCircle").attr("visibility", "hidden");
	    svg.select("#eyeInnerCircle2")
						.attr("cx", centX - 110 + bodyRx/2)
						.attr("cy", centY + headRy - 50)
						.attr("r", eyeWidth)
						.attr("visibility", "visible");

	} else if (eye === 1) { /* Small Pupil */
			svg.select("#eyeInnerCircle2").attr("visibility", "hidden");
			svg.select("#eyeInnerCircle1").attr("visibility", "hidden");
			svg.select("#eyeInnerCircle")
						.attr("cx", centX - 110 + bodyRx/2)
						.attr("cy", centY + headRy - 50)
						.attr("r", eyeWidth/1.5)
						.attr("visibility", "visible");

	} else { /* Medium Pupil */
			svg.select("#eyeInnerCircle2").attr("visibility", "hidden");
			svg.select("#eyeInnerCircle").attr("visibility", "hidden");
			svg.select("#eyeInnerCircle1")
						.attr("cx", centX - 110 + bodyRx/2)
						.attr("cy", centY + headRy - 50)
						.attr("r", eyeWidth/1.25)
						.attr("visibility", "visible");
	}

	/* Foot Orientation */
	if (foot === 0) { /* Left Foot */
		svg.select("#footLeft").attr("visibility", "visible");
		svg.select("#footRight").attr("visibility", "hidden");
	} else if (foot === 1) {  /* Right Foot */
		svg.select("#footLeft").attr("visibility", "hidden");
		svg.select("#footRight").attr("visibility", "visible");
	} else { /* No Foot */
		svg.select("#footLeft").attr("visibility", "hidden");
		svg.select("#footRight").attr("visibility", "hidden");
	}

['a','0110']
	/* Wing Stripes */
	if (wing === 1) { /* Left Two */
	  svg.select("#leftWingStripe").attr("visibility", "visible");
	  svg.select("#midLeftWingStripe").attr("visibility", "visible");
	  svg.select("#midRightWingStripe").attr("visibility", "visible");
		svg.select("#rightWingStripe").attr("visibility", "hidden");
	} else if (wing === 2) { /* Right Two */
		svg.select("#leftWingStripe").attr("visibility", "hidden");
	  svg.select("#midLeftWingStripe").attr("visibility", "visible");
	  svg.select("#midRightWingStripe").attr("visibility", "visible");
		svg.select("#rightWingStripe").attr("visibility", "visible");
	} else { /* Outer Two */
		svg.select("#leftWingStripe").attr("visibility", "visible");
	  svg.select("#midLeftWingStripe").attr("visibility", "hidden");
	  svg.select("#midRightWingStripe").attr("visibility", "hidden");
		svg.select("#rightWingStripe").attr("visibility", "visible");
	}

	/* Tick Marks */
	if (tongue === 1) { /* One Tick */
	  svg.select("#leftTick").attr("visibility", "visible");
	  svg.select("#midTick").attr("visibility", "hidden");
	  svg.select("#rightTick").attr("visibility", "hidden");
	} else if (tongue === 2) { /* Two Ticks */
		svg.select("#leftTick").attr("visibility", "visible");
	  svg.select("#midTick").attr("visibility", "visible");
	  svg.select("rightTick").attr("visibility", "hidden");
	} else { /* Three Ticks */
		svg.select("#leftTick").attr("visibility", "visible");
		svg.select("#midTick").attr("visibility", "visible");
	  svg.select("#rightTick").attr("visibility", "visible");
	}

	/* Antenna Bulbs */
  if (bulb === 1) { /* Outer Bulb Biggest */
	    svg.select("#antennaBulb3").attr("stroke-width", "2")
	    svg.select("#outerBulb").attr("stroke-width", "4")
	    svg.select("#antennaBulb2").attr("stroke-width", "2");
  } else if (bulb === 2) { /* Middle Bulb Biggest */
	    svg.select("#antennaBulb3").attr("stroke-width", "2")
	    svg.select("#antennaBulb2").attr("stroke-width", "4")
	    svg.select("#outerBulb").attr("stroke-width", "2");
  } else { /* Inner Bulb */
	    svg.select("#antennaBulb2").attr("stroke-width", "2")
    	svg.select("#antennaBulb3").attr("stroke-width", "4")
    	svg.select("#outerBulb").attr("stroke-width", "2")
  }

	/* Tail Bulb Color*/
  if (tail === 1 ) { /* Grey */
      svg.select("#tailBulb1").attr("stroke", "grey")
  } else if (tail === 2) { /* Purple */
      svg.select("#tailBulb1").attr("stroke", "purple")
  } else { /* Pink */
      svg.select("#tailBulb1").attr("stroke", "pink")
  }

	/* Feedback presented for active after guessing, or for passive for learning. */
	if (showCategory && !experiment.testing){
		d3.select(".category").text(" This is in category "+experiment.toDraw[0].toUpperCase());
		d3.select(".feedback").text(feedback);
	}

	/* After duration amount of milliseconds, remove image and text from canvas. */
	setTimeout(function(){
							svg = d3.select("#stim").select("#canvas")
	      							.attr("height",0)
											.attr("width",0);
							d3.select(".category").text("");
							d3.select(".feedback").text("");
							document.getElementById("Top").style.color = "black";
							if (instruct) document.getElementById("Bottom").style.color = "black"; }, duration);
};

/* The control flow of the experiment. */
var Experiment = function(){

	var currentTime, 		/* Used to calculate reaction time. */
			responded,   		/* Has the participant in the active condition responded? */
			drawn,       		/* Has the image been drawn? */
			cheating,    		/* Is the participant attempting to cheat? */ //smh
			response = "",
			stimuliSet = experiment.testing ? testingStimuli : getBlock(learningStimuli);
			if (debug) {
				console.log("Learning stimuli: "+learningStimuli);
				console.log("Array to be used: "+stimuliSet);
			}

	/* Starts the experiment. Must call finishInstructions to satisfy Psiturk. */
	var start = function() {
		psiTurk.finishInstructions();
		next();
	}

	/* Displays next slide.  */
	var next = function() {
		if (stimuliSet.length === 0) {
			experiment.blocks--;
			/* Writes data to database after every block. */
			psiTurk.saveData();
			if (experiment.blocks !== 0){
				/* If there are blocks remaining, get new order for next block. */
				stimuliSet = getBlock(learningStimuli);
				if (debug) {
					console.log("Learning stimuli: "+learningStimuli);
					console.log("Array to be used: "+stimuliSet);
				}
				next();
			}	else {
				$("body").unbind("keydown", response_handler);
				if (!experiment.testing) {
					/* Setting up specifications for testing phase. */
					experiment.testing = true;
					experiment.stimuli = 36;
					experiment.blocks = 1;
					initializeTestingStimuli();
					psiTurk.doInstructions(TestingInstructions,
																 function(){ experiment.currentView = new Experiment(); }
																 );
				} else {
						/* Record the time the participant completed the study. */
						var studyDuration = new Date().getTime() - startTime;
						psiTurk.recordTrialData( { "condition": experiment.condition,  // Active or Passive
						 													 "task": experiment.task,            // Interleaved or blocked
																			 "testing": 1,                       // Testing or Learning
																			 "response": "N/A",                  // Recorded response
																			 "category": "N/A",                  // Category of bird
																			 "hit": "N/A",                       // Response = category ? True or False
																			 "rt": "N/A",  										 	 // Reaction time
																			 "configuration": "N/A",             // 4 digit configuration used to draw the bird
																		 	 "trial": ++experiment.currentTrial, // Current trial
																		   "block": 0,                         // Current block. 0 makes it easier for analyzing
																		 	 "duration": studyDuration} );       // Duration elapsed since start time
						if(debug) {
							console.log("Recorded the following line of data: "
							+ "\ncondition: " + experiment.condition
							+ "\ntask: " + experiment.task
							+ "\ntesting: " + "N/A"
							+ "\nresponse: " + "N/A"
							+ "\ncategory: " + "N/A"
							+ "\nhit: " + "N/A"
							+ "\nrt: " + "N/A"
							+ "\nconfiguration:" + "N/A"
							+ "\ntrial: " + experiment.currentTrial
							+ "\nblock: " + 0
							+ "\nduration: " + studyDuration);
			 			}
						experiment.currentView = new thankYou();
				}
			}
		} else {
				/* If in test phase or condition is active: firstValue. Else, second value. */
				var showCategory = (experiment.condition == "active" || experiment.testing) ? false : true;
				var displayTime = (experiment.condition == "active" || experiment.testing) ? 500 : 2500;
				/* Resets values for next drawing. */
				responded = drawn = false;
				cheating = 0;
				/* Next stimuli to draw. */
				experiment.toDraw = stimuliSet.shift();
				/* Display text onto screen. */
				d3.select(".instructions").text('What category did the bird belong to?');
				d3.select(".guess").text('Type "a", "b", or "c"');
				/* Draw bug onto screen. */
				drawbug(displayTime, showCategory, "", true);
				currentTime = new Date().getTime();
		}
	};

	/* Handles the responses. */
	var response_handler = function(k) {
		var wrongKey = false;
		drawn = false;

		/* Updates the screen (or not) depending on the screen pressed. */
		switch (k.keyCode) {
			case 65:
				response += "a";
				break;
			case 66:
				response += "b";
				break;
			case 67:
				response += "c";
				break;
			case 32: // Spacebar
				/* Couldn't have responded if no response is recorded. */
				if (response.length == 0) break;
				responded = true;
				cheating++;
				break;
			case 16: // Left and Right Shift
				drawn = true;
				break;
			default:
				alert("Warning. Incorrect key pressed.");
				wrongKey = true;
				break;
		}

		if ((!responded || experiment.testing) && response.length == 1) {
			var rt = new Date().getTime() - currentTime;
			var hit = (response == experiment.toDraw[0]) ? 1 : 0;
			var isTesting = experiment.testing ? 1 : 0;
			var ignore = wrongKey ? 1 : 0;

			if ((rt < 2500 && experiment.condition == "passive" && !experiment.testing) || (rt < 500 && experiment.condition == "active")){
				 alert("Warning. Please take the full time allotted to examine the bird category. Please wait 5 seconds before continuing.");
			}

			/* Many conditionals because we should only record once per trial. */
			if (!wrongKey && !drawn && response.length == 1){
				psiTurk.recordTrialData( { "condition": experiment.condition,     // Active or Passive
				 													 "task": experiment.task,               // Interleaved or blocked
																	 "testing": isTesting,                  // Testing or Learning
																	 "response": response,                  // Recorded response
																	 "category": experiment.toDraw[0],      // Category of bird
																	 "hit": hit,                            // Response = category ? True or False
																	 "rt": rt,  														// Reaction time
																	 "configuration": experiment.toDraw[1], // 4 digit configuration used to draw the bird
																 	 "trial": ++experiment.currentTrial,    // Current trial
																   "block": experiment.blocks,            // Current block
																 	 "duration": 0} );                      // By default, duration is only recorded at end of sets

				 /* Useful for debugging. */
	 			if(debug) {
	 					console.log("Recorded the following line of data: "
	 					+ "\ncondition: " + experiment.condition
	 					+ "\ntask: " + experiment.task
	 					+ "\ntesting: " + isTesting
	 					+ "\nresponse: " + response
	 					+ "\ncategory: " + experiment.toDraw[0]
	 					+ "\nhit: " + hit
	 					+ "\nrt: " + rt
	 					+ "\nconfiguration:" + experiment.toDraw[1]
	 					+ "\ntrial: " + experiment.currentTrial
						+ "\nblock: " + experiment.blocks
						+ "\nduration: " + 0);
	 			}
			}
			/* No need for feedback. Next slide. */
			if (experiment.condition == "passive" || experiment.testing){
 					response = "";
 					next();
			/* Active phase and not testing. */
			} else {
 					d3.select(".instructions").text('Press "spacebar" to continue');
					document.getElementById("Bottom").style.color = "white";
 			}

		}

		/* Pressed 'a', 'b', or 'c' more than once. */
		if (response.length > 1){
			alert("Warning. You have already guessed a category for this bird.");
			response = response.slice(0,-1);
		}
		/* Completed all aspects of the active phase. */
		if (responded && drawn && response.length == 1){
			response = "";
			next();
		}
		/* Response is recorded and spacebar pressed.
			 If they continue to press spacebar, cheating becomes greater than one and
			 they will no longer be able to view the stimuli more than once.        */
		if (responded && cheating == 1 && response.length == 1){
			cheating++;
			if (!experiment.testing && experiment.condition == "active") {
				var feedback = response == experiment.toDraw[0] ? "Correct!" : "Incorrect!";
				var showCategory = true;
				drawbug(2000, showCategory, feedback, false);
				d3.select(".instructions").text('Press "shift" to continue');
			}
		}
	};

	psiTurk.showPage("stage.html");

	$("body").focus().keydown(response_handler);

	start();
};

var thankYou = function () {
	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";
	var question_number = 1;
	var answer;

	// Records data; Runs when the submit button is checked.
	record_responses = function() {
	var selectedVal = "";
		var selected = $("input[type='radio']:checked");
		if (selected.length > 0) {
				selectedVal = selected.val();
		}

	psiTurk.recordTrialData([question_number, selectedVal]);
	//increment question number
	question_number++;
	};


	// Triggers re-submitting task if 10 seconds have elapsed in failure.
	prompt_resubmit = function() {
		replaceBody(error_message);
		$("#resubmit").click(resubmit);
	};

	// Attempts to resubmit task
	resubmit = function() {
		replaceBody("<h1>Trying to resubmit...</h1>");
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function() {
					clearInterval(reprompt);
								psiTurk.computeBonus('compute_bonus',
									function(){
						experiment.currentView = new thankYou();
					}
				);
			},
			error: prompt_resubmit
		});
	};

	 //Load the questionnaire snippet
	psiTurk.saveData({
			success: function() {
								experiment.currentView = new demographicQuestions();
							 },
			error: prompt_resubmit});

	};

	/*
	* Presents the participant with the demographic questions page, then completes the HIT
	*/
	demographicQuestions = function() {
	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {
		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});

	};

	prompt_resubmit = function() {
		replaceBody(error_message);
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		replaceBody("<h1>Trying to resubmit...</h1>");
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function() {
					clearInterval(reprompt);
								psiTurk.completeHIT();
			},
			error: prompt_resubmit
		});
	};

	psiTurk.showPage('postquestionnaire2.html');

	$("#next").click(function () {
			record_responses();
			psiTurk.saveData({
						success: function(){
									psiTurk.completeHIT();
						},
						error: prompt_resubmit});
	});
};

/* This is where the experiment begins. */
$(window).load( function(){

	/* Retrieve condition and task, and iniitiate testing. */
	experiment.condition = experiment.condition();
	experiment.task = experiment.task();
	experiment.testing = false;
	/* Retrieve 4 stimuli from each category, and duplicate them. */
	initializeLearningStimuli(4,2);

	/* Randomly assign abstract dimensions to our stimuli dimensions. */
	experiment.dimensions = shuffle(experiment.dimensions);
	/* Unecessary feature for our experiment. We want the wing stripes to be our defining characteristic. */

	psiTurk.recordTrialData( {
														'wing' : experiment.dimensions[0],
														'antenna' : experiment.dimensions[1],
														'tongue' : experiment.dimensions[2],
														'foot' : experiment.dimensions[3]
														} );
	if (debug){
		console.log("wing: "+experiment.dimensions[0]+"\nantenna: "+experiment.dimensions[1]+"\ntongue: "+experiment.dimensions[2]+"\nfoot: "+experiment.dimensions[3])
	}

	/* A list of pages you want to display in sequence. */
	var instructions = experiment.condition == "active" ? ActiveInstructions : PassiveInstructions;

	/* Record the time the participant began the study. */
	startTime = new Date().getTime();

	/* Display instructions and then begin the experiment. */
 	psiTurk.doInstructions(
		instructions, function() { experiment.currentView = new Experiment(); }
 	);
 });
