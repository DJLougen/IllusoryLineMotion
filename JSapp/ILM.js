// Define parameters
const params = {
    soa: 200, // SOA in milliseconds
    line_speed: 8.0 // degrees per second
};

// Get screen dimensions
const screen_width = 1024;
const screen_height = 768;

// Function to draw trial stimuli
function draw_trial_stimuli(canvas, context, phase, progress = null) {
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set up drawing styles
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = 2;

    // Draw fixation
    const center_x = canvas.width / 2;
    const center_y = canvas.height / 2;
    const fixation_size = 5;

    // Draw fixation cross
    context.beginPath();
    context.moveTo(center_x - fixation_size, center_y);
    context.lineTo(center_x + fixation_size, center_y);
    context.moveTo(center_x, center_y - fixation_size);
    context.lineTo(center_x, center_y + fixation_size);
    context.stroke();

    // Draw based on phase
    if (phase === 'cue') {
        // Draw cue
        const cue_size = 20;
        context.beginPath();
        context.arc(center_x, center_y, cue_size, 0, 2 * Math.PI);
        context.stroke();
    } else if (phase === 'blank') {
        // Blank screen - nothing drawn
    } else if (phase === 'line' && progress !== null) {
        // Draw line based on progress
        const line_length = 100; // degrees
        const start_x = center_x - line_length / 2;
        const end_x = center_x + line_length / 2;
        const y_pos = center_y;

        // Draw partial line
        const draw_length = line_length * progress;
        context.beginPath();
        context.moveTo(start_x, y_pos);
        context.lineTo(start_x + draw_length, y_pos);
        context.stroke();
    }
}

// Function to get current trial data
function getCurrentTrialData() {
    const last_trial = jsPsych.data.get().last(1).values()[0];
    return last_trial;
}

// Timeline variables from CSV
const timeline_variables = 
jsPsych.data.getCSV('illusory_line_conditions_100.csv').rows;

// Create the main timeline
const timeline = [];

// Add trials based on CSV data
timeline_variables.forEach((row, index) => {
    const trial = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [screen_width, screen_height],
        stimulus: function(canvas) {
            const context = canvas.getContext('2d');
            draw_trial_stimuli(canvas, context, 'fixation');
        },
        choices: "NO_KEYS",
        trial_duration: 1000
    };

    timeline.push(trial);

    // Cue trial
    const cue_trial = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [screen_width, screen_height],
        stimulus: function(canvas) {
            const context = canvas.getContext('2d');
            draw_trial_stimuli(canvas, context, 'cue');
        },
        choices: "NO_KEYS",
        trial_duration: 50
    };

    timeline.push(cue_trial);

    // Blank period (SOA)
    const blank_trial = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [screen_width, screen_height],
        stimulus: function(canvas) {
            const context = canvas.getContext('2d');
            draw_trial_stimuli(canvas, context, 'blank');
        },
        choices: "NO_KEYS",
        trial_duration: function() {
            // Get SOA from CSV row
            const soa = parseInt(row.soa) || params.soa;
            return soa - 50; // Subtract cue duration
        }
    };

    timeline.push(blank_trial);

    // Line animation trial
    const line_duration = (parseInt(row.distance_deg) / params.line_speed)       
* 1000;
    const line_trial = {
        type: jsPsychCanvasKeyboardResponse,
        canvas_size: [screen_width, screen_height],
        stimulus: function(canvas) {
            const context = canvas.getContext('2d');
            // This will be animated by jsPsych's animation system
            draw_trial_stimuli(canvas, context, 'line', 1.0); // Full line
        },
        choices: ['q', 'p'],
        trial_duration: function() {
            // Return total trial duration
            const soa = parseInt(row.soa) || params.soa;
            return 1000 + soa + line_duration;
        },
        data: {
            trial_type: 'illusory_line',
            cueCondition: row.cueCondition,
            soa: row.soa,
            distance_deg: row.distance_deg,
            lineCondition: row.lineCondition,
            trial_index: index
        }
    };

    timeline.push(line_trial);
});

// Add debrief screen
const debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "<p>Experiment complete! Thank you for participating.</p>",
    choices: "NO_KEYS",
    trial_duration: 2000
};

timeline.push(debrief);

// Start the experiment
jsPsych.run(timeline);