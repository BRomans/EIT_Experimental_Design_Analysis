var ctx = {
  w: 1000,
  h: 800,

  trials: [],
  results: [],
  all_results : [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,
  shapes: [],
  x_size: 0,
  y_size: 0,
  currentState: 0,
  currentTimestamp: 0,
  
  participantIndex:"ParticipantID",
  blockIndex:"Block1",
  trialIndex:"TrialID",
  vvIndex:"VV",
  objectsCountIndex:"OC",

};

var state = {
  NONE:0,
  INTERTITLE: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3
};


// process the next trial
var nextTrial = function() {
  ctx.cpt++;
  ctx.results[ctx.cpt] = ctx.trials[ctx.cpt];
  ctx.results[ctx.cpt]["Errors"] = 0;
  ctx.results[ctx.cpt]["ExeTime"] = '';
  ctx.all_results.push(ctx.results[ctx.cpt]);
  if(ctx.participant !== ctx.trials[ctx.cpt]["ParticipantID"]){
    ctx.results[ctx.cpt] = undefined;
    endExperiment();
  } else {
    // Init frame and target object
    console.log(ctx.trials[ctx.cpt]["ParticipantID"]);
    console.log(ctx.trials[ctx.cpt]["VV"]);
    console.log(ctx.trials[ctx.cpt]["OC"]);
    var shapesContainer = d3.select("#mainScene");
    drawContainer(shapesContainer);
    ctx.frame = d3.select("#frame");
    var n_objects = convertObjectCount(ctx.trials[ctx.cpt]["OC"]);
    ctx.shapes = [];
    var visual_variable = ctx.trials[ctx.cpt]["VV"];
    ctx.x_size = n_objects / 4;  //24 -> 6, 16 -> 4, 8 -> 2
    ctx.y_size = n_objects / ctx.x_size; // 24 -> 4, 16 ->4, 8 -> 4
    var targetStrokeWidth = Math.random() < 0.5 ? 1 : 6;
    var targetShape = Math.random() < 0.5 ? "circle" : "ellipse";

    ctx.shapes.push({stroke: targetStrokeWidth, shape: targetShape, target: true});

    if(visual_variable === "Width") {
      for(var i=1; i<n_objects; i++) {
        ctx.shapes.push( {
          stroke: (targetStrokeWidth === 1? 6 : 1),
          shape: targetShape,
          target: false
        });
      }
    }
    if(visual_variable === "Shape") {
      for(var i=1; i<n_objects; i++) {
        ctx.shapes.push( {
          stroke: targetStrokeWidth,
          shape: (targetShape === "circle" ? "ellipse" : "circle"),
          target: false
        });
      }
    }

    // Generate shapes objects
    if(visual_variable === "Width_Shape") {
      for(var i=0; i<n_objects-1; i++) {
        if(i < (n_objects/4)) {
          ctx.shapes.push( {
            stroke: targetStrokeWidth,
            shape: (targetShape === "circle" ? "ellipse" : "circle"),
            target: false
          });
        }else if(((i>n_objects/4)) && (i<(n_objects/2)+ 1)) {
          ctx.shapes.push( {
            stroke: (targetStrokeWidth === 1? 6 : 1),
            shape: targetShape,
            target: false
          });
        } else {
          ctx.shapes.push( {
            stroke: (targetStrokeWidth === 1? 6 : 1),
            shape: (targetShape === "circle" ? "ellipse" : "circle"),
            target: false
          });
        }
      }
    }
  }
  drawShapes(ctx.frame, ctx.shapes);
  ctx.currentTimestamp = new Date().getTime();
}

function onShapeClick(value) {
  console.log(value);
  if(value === true){
    // get ready for nextTrial
    nextTrial();
  } else {
    // repeat this trial
    ctx.results[ctx.cpt]["Errors"] += 1;
    drawShapes(ctx.frame, ctx.shapes)
    ctx.currentTimestamp = new Date().getTime();

  }
}

function drawShapes(frame, shapes) {
  console.log("Shapes", shapes);
  frame.selectAll("*").remove();
  shuffle(shapes);
  var counter = 0;
  for(var i=0; i < ctx.x_size; i++) {
    for(var j=0; j < ctx.y_size; j++) {
      drawObject(frame, shapes[counter], i, j);
      counter++;
    }
  }
}

function drawPlaceholdersMask(frame, shapes) { 
  var counter = 0;
  for(var i=0; i < ctx.x_size; i++) {
    for(var j=0; j < ctx.y_size; j++) {
      drawObjectPlaceholder(frame, shapes[counter], i, j);
      counter++;
    }
  }
}
// Draws the container for the objects
function drawContainer(container) {
  container.selectAll("*").remove();
  container.append("rect")
        .style('transform', 'translate(50%, 50%)')
        .attr("style", "fill:white")
        .attr("width", 1000)
        .attr("height", 800)
        .attr("align","center")
        //.attr("stroke", "black")
        //.attr("stroke-width", 4);
  var group = container.append("g")
        .attr("id", "frame")
        .attr("width", 800)
        .attr("height", 800);
  if(ctx.trials[ctx.cpt]["OC"] === "Low"){
    group.style('transform', 'translate(45%, 25%)');
  } else if(ctx.trials[ctx.cpt]["OC"] === "Medium") {
    group.style('transform', 'translate(35%, 25%)')
  } else if(ctx.trials[ctx.cpt]["OC"] === "High"){
    group.style('transform', 'translate(25%, 25%)');
  }
    
}

// draws the object inside the frame
function drawObject(frame, object, xTranslate, yTranslate) {
  var currentObject = frame.append(object.shape)
    .attr("stroke", "#544d68")
    .attr("style", "fill:#80d6ff")
    .attr("stroke-width", object.stroke);
  if(object.shape === "circle") {
    currentObject.attr("r", 25)
    .attr("cx", 100 * xTranslate+1)
    .attr("cy", 100 * yTranslate+1);

  }
  if(object.shape === "ellipse") {
    currentObject.attr("rx", 30)
      .attr("ry", 10)
      .attr("cx", 100 * xTranslate+1)
      .attr("cy", 100 * yTranslate+1);
    frame.append(object.shape)
    .attr("stroke", "#544d68")
    .attr("style", "fill:#80d6ff")
    .attr("stroke-width", object.stroke)
    .attr("rx", 10)
    .attr("ry", 30)
    .attr("cx", 100 * xTranslate+1)
    .attr("cy", 100 * yTranslate+1);
    }
  
}

// draws the object placeholder inside the frame
function drawObjectPlaceholder(frame, object, xTranslate, yTranslate) {
  var currentObject = frame.append("circle")
    .attr("style", "fill:#0077c2")
    .attr("stroke", "#0077c2")
    .attr("stroke-width", 6)
    .attr("r", 32)
    .attr("cx", 100 * xTranslate+1)
    .attr("cy", 100 * yTranslate+1)
    .attr("onclick", "onShapeClick("+ object.target +")");
}

var elaborateCSV = function(allResults) {
  let items = [];
  if(allResults) {
    for(var i=0; i<ctx.all_results.length; i++) {
      if(ctx.all_results[i] !== undefined) {
        items.push(ctx.all_results[i]);
      }
    }
  } else {
    for(var i=0; i<ctx.results.length; i++) {
      if(ctx.results[i] !== undefined) {
        items.push(ctx.results[i]);
      }
    }
  }
  
  const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  csv.unshift(header.join(','));
  csv = csv.join('\r\n');
  console.log(csv);
  downloadCSV(csv);
}

function downloadCSV(csv) {
  var csvContent = "data:text/csv;charset=utf-8," + csv;
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "participant_"+ ctx.participant + "_preattentive_experiment_results_" + new Date().toISOString() + ".csv");
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link); 
}

// Shuffles an array of objects
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Converts the OC to an Integer
var convertObjectCount = function(countName) {
  if(countName == "Low") {
    return 8;
  } else if(countName == "Medium") {
    return 16;
  } else if(countName == "High") {
    return 24;
  }
}

// Keyboard input capture
function keyboardCapture(event) {
  event.preventDefault();
  if(event.keyCode == 32) {
    if(ctx.currentState !== state.NONE && ctx.currentState !== state.INTERTITLE){
      console.log("Spacebar");
      var successTimestamp = new Date().getTime();
      var trialTimestamp = successTimestamp - ctx.currentTimestamp;
      ctx.results[ctx.cpt]["ExeTime"] = trialTimestamp;
      ctx.currentState = state.PLACEHOLDERS;
      var frame = ctx.frame;
      drawPlaceholdersMask(frame, ctx.shapes);
    }
  }
  else if(event.keyCode == 13) {
      console.log("Enter");
      if(ctx.currentState === state.INTERTITLE){
        ctx.currentState = state.SHAPES;
        var instructionContainer = d3.select('#instructions');
        instructionContainer.selectAll("*").remove();
        startExperiment(event);
      } 
      if(ctx.currentState === state.NONE){
        var instructionContainer = d3.select('#instructions');
        instructionContainer.selectAll("*").remove();
        createScene();
      }
      /*else if(ctx.currentState === state.PLACEHOLDERS ) {
          ctx.currentState = state.SHAPES;
          nextTrial();
      }*/
  }
};

var showIntertitle = function() {
  if(ctx.currentState === state.NONE) {
    ctx.currentState = state.INTERTITLE;

    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("Hi! Thank you for helping us out with this experiment. <br>Dont worry, it shouldn't take more than 5 min");

    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("1. Pay close attention to the figures shown in the image, one of them is different from all the others!");

    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("<b>2. When you spot the intruder, press <code> space bar </code>");

    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("3. Click on the circle where the intruder was last seen");

    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("Press <code>Enter</code> key when ready to start.");
  }else {
    ctx.currentState = state.NONE
    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("Thanks! The experiment is over!<br> Use the <code>Print</code> button to download your results <br> Use <code>Print All</code> to download the full set");
    d3.select("#instructions")
      .append('p')
      .classed('instr', true)
      .html("Press <code>Enter</code> key when ready to start a new experiment.");
    d3.select("#instructions")
      .append('button')
      .classed('instr', true)
      .attr('onclick', 'elaborateCSV(false)')
      .attr('onkeyup','ignore(event)')
      .html("Print");
    d3.select("#instructions")
      .append('button')
      .classed('instr', true)
      .attr('onclick', 'elaborateCSV(true)')
      .attr('onkeyup','ignore(event)')
      .html("Print All");
    
  }

}

document.addEventListener('keypress', keyboardCapture);

var startExperiment = function(event) {
  event.preventDefault();

  console.log(event);
  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i-1;
        }
      }
    }
  }
  ctx.results = [];
  console.log("start experiment at "+ctx.cpt);
  nextTrial();
}

function endExperiment() {
  var shapesContainer = d3.select("#mainScene");
  shapesContainer.selectAll("*").remove();
  showIntertitle();
}

var createScene = function(){
  var svgEl = d3.select("#scene").append("svg");
  svgEl.append("center");
  svgEl.attr("id", "mainScene");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
  .classed('centered', true);

  var instructions = d3.select('#scene').append("div")
    .attr("id", "instructions")
    .attr("width", 400)
    .attr("height", 400);

  showIntertitle();
  loadData(svgEl);
};

/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function(trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setTrial(options[0]);

}

var setParticipant = function(participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(!(ctx.trials[i][ctx.blockIndex] === block)) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setBlock(options[0]);

};

var loadData = function(svgEl){

  d3.csv("../csv/PreattentiveExperiment.csv").then(function(data){
    ctx.trials = data;

    var participant = "";
    var options = [];

    for(var i = 0; i < ctx.trials.length; i++) {
      if(!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
      .text(function (d) { return d; });

    setParticipant(options[0]);

  }).catch(function(error){console.log(error)});
};

function onchangeParticipant() {
  selectValue = d3.select('#participantSel').property('value');
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select('#blockSel').property('value');
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property('value');
  setTrial(selectValue);
};
