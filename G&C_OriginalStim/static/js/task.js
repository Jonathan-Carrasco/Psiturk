/* Replication of Goldstone and Carvalho's Experiment using their stimuli. */

/*   Create a Psiturk object to keep track of the experiment's pages for its
                        corresponding participants.
 */
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
	"instructions/RepeatInstructions.html",
	"stage.html",
	"postquestionnaire2.html"];

var ActiveInstructions = [
	"instructions/Briefing.html",
	"instructions/Active-Study.html"];

var PassiveInstructions = [
	"instructions/Briefing.html",
	"instructions/Passive-Study.html"];

var RepeatInstructions = ["instructions/RepeatInstructions.html"];

var TestingInstructions = ["instructions/TestingPhase.html"];

var AllImages = [
	"static/images/watergun/0120.jpg",
	"static/images/watergun/0010.jpg",
	"static/images/watergun/0021.jpg",
	"static/images/watergun/0001.jpg",
	"static/images/watergun/0000.jpg",
	"static/images/watergun/0101.jpg",
	"static/images/watergun/0020.jpg",
	"static/images/watergun/0121.jpg",
	"static/images/watergun/0011.jpg",
	"static/images/watergun/0100.jpg",
	"static/images/watergun/0110.jpg",
	"static/images/watergun/0111.jpg",
	"static/images/watergun/1120.jpg",
	"static/images/watergun/1010.jpg",
	"static/images/watergun/1021.jpg",
	"static/images/watergun/1001.jpg",
	"static/images/watergun/1000.jpg",
	"static/images/watergun/1101.jpg",
	"static/images/watergun/1020.jpg",
	"static/images/watergun/1121.jpg",
	"static/images/watergun/1011.jpg",
	"static/images/watergun/1100.jpg",
	"static/images/watergun/1110.jpg",
	"static/images/watergun/1111.jpg",
	"static/images/watergun/2120.jpg",
	"static/images/watergun/2010.jpg",
	"static/images/watergun/2021.jpg",
	"static/images/watergun/2001.jpg",
	"static/images/watergun/2000.jpg",
	"static/images/watergun/2101.jpg",
	"static/images/watergun/2020.jpg",
	"static/images/watergun/2121.jpg",
	"static/images/watergun/2011.jpg",
	"static/images/watergun/2100.jpg",
	"static/images/watergun/2110.jpg",
	"static/images/watergun/2111.jpg",
  "static/images/bird/0120.jpg",
  "static/images/bird/0010.jpg",
  "static/images/bird/0021.jpg",
  "static/images/bird/0001.jpg",
  "static/images/bird/0000.jpg",
  "static/images/bird/0101.jpg",
  "static/images/bird/0020.jpg",
  "static/images/bird/0121.jpg",
  "static/images/bird/0011.jpg",
  "static/images/bird/0100.jpg",
  "static/images/bird/0110.jpg",
  "static/images/bird/0111.jpg",
  "static/images/bird/1120.jpg",
  "static/images/bird/1010.jpg",
  "static/images/bird/1021.jpg",
  "static/images/bird/1001.jpg",
  "static/images/bird/1000.jpg",
  "static/images/bird/1101.jpg",
  "static/images/bird/1020.jpg",
  "static/images/bird/1121.jpg",
  "static/images/bird/1011.jpg",
  "static/images/bird/1100.jpg",
  "static/images/bird/1110.jpg",
  "static/images/bird/1111.jpg",
  "static/images/bird/2120.jpg",
  "static/images/bird/2010.jpg",
  "static/images/bird/2021.jpg",
  "static/images/bird/2001.jpg",
  "static/images/bird/2000.jpg",
  "static/images/bird/2101.jpg",
  "static/images/bird/2020.jpg",
  "static/images/bird/2121.jpg",
  "static/images/bird/2011.jpg",
  "static/images/bird/2100.jpg",
  "static/images/bird/2110.jpg",
  "static/images/bird/2111.jpg"];

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
   * Pictures: 50/50 chance to start with watergun images.

   (Counterbalance 1 and 2 are provided by psiTurk in exp.html. If there are no
   	conditions to counterbalance, you can change this in config.txt.)
   */
  var experiment = {
      blocks: 4,
      stimuli: 24,
      currentTrial: 0,
  		currentView: undefined,
  		toDraw: undefined,
  		testing: undefined,
  		firstSet: true,
      condition: function(){ return counterbalance1 == 1 ? "active" : "passive"; },
  		task: function(){ return counterbalance2 == 1 ? "interleaved" : "blocked"; },
  		pictures: function(){ return Math.random() < 0.5 ? "watergun" : "bird"; }
  	};

/* Set up each respective condition for this experiment. */
experiment.condition = experiment.condition();
experiment.task = experiment.task();
experiment.pictures = experiment.pictures();

/* Preload all pages so that PsiTurk can speedily switch between them. */
psiTurk.preloadPages(Pages);
psiTurk.preloadPages(AllImages);

/* Set true to print useful debugging information. */
var debug = true;

/* Global variable for keeping track of duration of experiment. */
var startTime;

/* Each category has a diagnostic characteristic at index 0, and nondiagnostic
 	 features from indeces 1-3.
	 So far only the first four features are drawn, and the last two features
	 (eyes and tail bulb color) are omitted.
	 To draw them all, you can uncomment those sections from the showStimuli() function.
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


function showStimuli(duration, showCategory, feedback, instruct){
  /* White out instructions to not confuse participants. */
	document.getElementById("Top").style.color = "white";
	document.getElementById("Bottom").style.color = "white";
	document.getElementById("stim").innerHTML = '<img src=static/images/'+experiment.pictures+'/'+experiment.toDraw[1]+'.jpg height=500 width=550>';

	/* Feedback presented for active after guessing, or for passive for learning. */
	if (showCategory && !experiment.testing){
		d3.select(".category").text(" This is in category "+experiment.toDraw[0].toUpperCase());
		d3.select(".feedback").text(feedback);
	}

	/* After duration amount of milliseconds, remove image and text from canvas. */
	setTimeout(function(){
							d3.select(".category").text("");
							d3.select(".feedback").text("");
							document.getElementById("stim").innerHTML = "";
							document.getElementById("Top").style.color = "black";
							if (instruct) document.getElementById("Bottom").style.color = "black"; }, duration);
};

/* The control flow of the experiment */
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
					/* Setting up specifications for test phase*/
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
						var set = experiment.firstSet ? 0 : 1;
            psiTurk.recordTrialData( { "condition": experiment.condition,  // Active or Passive
						 													 "task": experiment.task,            // Interleaved or blocked
																			 "testing": 1,                       // Testing or Learning
																			 "response": "N/A",                  // Recorded response
																			 "category": "N/A",                  // Category of bird
																			 "hit": "N/A",                       // Response = Category ? True or False
																			 "rt": "N/A",  										 	 // Reaction time
																			 "configuration": "N/A",             // 4 digit configuration used to draw the bird
																		 	 "trial": ++experiment.currentTrial, // Current trial
																		   "block": 0,                         // Current block. 0 makes it easier for analyzing
                                       "set": set,                         // Current Set
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
							+ "\nset" + set
							+ "\nduration: " + studyDuration);
			 			}
						if (experiment.firstSet){
              /* Just finished first set. Setting up specifications for second set.*/
							experiment.task = experiment.task == "blocked" ? "interleaved" : "blocked";
							experiment.pictures = experiment.pictures == "bird" ? "watergun" : "bird";
							experiment.testing = false;
							experiment.firstSet = false;
							experiment.blocks = 4;
							experiment.stimuli = 24;
							experiment.currentTrial = 0;
							learningStimuli.length = 0;
							initializeLearningStimuli(4,2);
							psiTurk.doInstructions(
								RepeatInstructions, function() { experiment.currentView = new Experiment(); }
						 	);
						} else {
								experiment.currentView = new thankYou();
						}
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
      d3.select(".instructions").text('What category did the object belong to?');
      d3.select(".guess").text('Type "a", "b", or "c"');
      /* Draw bug onto screen. */
      showStimuli(displayTime, showCategory, "", true);
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
			var set = experiment.firstSet ? 0 : 1;

			if ((rt < 2500 && experiment.condition == "passive" && !experiment.testing) || (rt < 500 && (experiment.condition == "active" || experiment.testing))){
				 alert("Warning. Please take the full time allotted to examine the object category. Please wait 5 seconds before continuing.");
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
																 	 "trial": ++experiment.currentTrial,    // Current Trial
																   "block": experiment.blocks,            // Current Block
																	 "set": set,                            // Current Set
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
						+ "\nset: " + set
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
			alert("Warning. You have already guessed a category for this object.");
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
			if (!experiment.testing && (experiment.condition == "active")) {
				var feedback = response == experiment.toDraw[0] ? "Correct!" : "Incorrect!";
				var showCategory = true;
				showStimuli(2000, showCategory, feedback, false);
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

/* Begin Task */
$(window).load( function(){
	experiment.testing = false;
	initializeLearningStimuli(4,2);

	/* Randomly assign abstract dimensions to our stimuli dimensions. */
	/* experiment.dimensions = shuffle(experiment.dimensions); */
	/* Unecessary feature for our experiment. We want the wing stripes to be our defining characteristic. */

	/* A list of pages you want to display in sequence. */
	var instructions = experiment.condition == "active" ? ActiveInstructions : PassiveInstructions;

	if (experiment.picture == "watergun") {
		psiTurk.recordTrialData( 'Watergun: trigger: 0, cylinder: 1, water: 2, handle: 3. Bird: wing: 0, antenna: 1, beak: 2, feet: 3.' );
	} else {
		psiTurk.recordTrialData( 'Bird: wing: 0, antenna: 1, beak: 2, feet: 3. Watergun: trigger: 0, cylinder: 1, water: 2, handle: 3.' );
	}

	/* Record the time the participant began the study. */
	startTime = new Date().getTime();

	/* Display instructions and then begin the experiment. */
 	psiTurk.doInstructions(
		instructions, function() { experiment.currentView = new Experiment(); }
 	);
 });
