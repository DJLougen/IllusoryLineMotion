/**
 * Illusory Line Motion (ILM) Task
 * jsPsych version converted from PsychoPy
 * 
 * Timing sequence:
 * 1. Fixation + placeholders: 1000 ms
 * 2. Cue appears: 50 ms
 * 3. Blank (placeholders only): SOA - 50 ms (100ms)
 * 4. Line animates at specified speed
 * 5. Response collection (2000 ms timeout)
 * 6. ITI: 500 ms
 * 
 * Parameters:
 * - line_speed: 60 deg/sec ~~~~~ change to around 60 deg/sec for correct motion
 * - Response keys: Q (left→right), P (right→left)
 */

// Initialize jsPsych
const jsPsych = initJsPsych({
    on_finish: function() {
        // Create filename 
        const participant_id = jsPsych.data.get().values()[0].participant_id;
        const date = new Date().toISOString().slice(0,10).replace(/-/g, '_');
        const filename = `${participant_id}_illusoryLineTask_${date}.csv`;
        jsPsych.data.get().localSave('csv', filename);
    }
});

// Experiment parameters 
let params = {
    participant_id: '',
    session: '001',
    line_speed: 60.0,  // degrees per second (LINE_SPEED)
    monitor_width_cm: 34.5,  // mon.setWidth(34.5)
    viewing_distance_cm: 60,   // Python mon.setDistance(60)
    screen_width_px: 1728,     // Python mon.setSizePix([1728, 1117])
    screen_height_px: 1117
};

// Visual angle calculation
function cm_to_pixels(cm, monitor_width_cm, screen_width_px) {
    return (cm / monitor_width_cm) * screen_width_px;
}

function deg_to_cm(degrees, viewing_distance_cm) {
    return 2 * viewing_distance_cm * Math.tan((degrees * Math.PI) / 360);
}

function deg_to_pixels(degrees, viewing_distance_cm, monitor_width_cm, screen_width_px) {
    const cm = deg_to_cm(degrees, viewing_distance_cm);
    return cm_to_pixels(cm, monitor_width_cm, screen_width_px);
}

// Screen dimensions - use actual screen, not canvas
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;
const canvas_width = screen_width;
const canvas_height = screen_height;

// Trial conditions - will be loaded from CSV
let trial_conditions = [];

// Function to load and parse CSV
async function loadConditions() {
    try {
        const response = await fetch('illusory_line_conditions_100.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const rows = text.trim().split('\n').slice(1); // Skip header
        
        trial_conditions = rows.filter(row => row.trim()).map(row => {
            const [cueCondition, lineCondition, trial_num] = row.split(',');
            return {
                cueCondition: cueCondition.trim(),
                lineCondition: lineCondition.trim(),
                trial_num: parseInt(trial_num)
            };
        });
        
        console.log(`Loaded ${trial_conditions.length} trials from CSV`);
        return trial_conditions;
    } catch (error) {
        console.error('Error loading CSV:', error);
        console.log('Using fallback test trials...');
        
        // Fallback: create a few test trials
        trial_conditions = [
            {cueCondition: 'cued', lineCondition: 'congruent', trial_num: 1},
            {cueCondition: 'uncued', lineCondition: 'congruent', trial_num: 2},
            {cueCondition: 'cued', lineCondition: 'incongruent', trial_num: 3},
            {cueCondition: 'uncued', lineCondition: 'incongruent', trial_num: 4},
            {cueCondition: 'cued', lineCondition: 'center', trial_num: 5},
            {cueCondition: 'uncued', lineCondition: 'center', trial_num: 6}
        ];
        
        console.log(`Using ${trial_conditions.length} fallback test trials`);
        return trial_conditions;
    }
}

/* ============================================
   EXPERIMENT TIMELINE
============================================ */

const timeline = [];

// Participant info form 
const participant_info = {
    type: jsPsychSurveyHtmlForm,
    preamble: '<h2>Illusory Line Motion Task</h2><p>Please enter your information:</p>',
    html: `
        <p><label>Participant ID: <input name="participant_id" type="text" value="${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}" required /></label></p>
        <p><label>Session: <input name="session" type="text" value="001" required /></label></p>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">
            Screen: ${screen_width} x ${screen_height} pixels<br>
            Line speed: ${params.line_speed} deg/sec | SOA: ${params.soa}ms<br>
            Monitor: ${params.monitor_width_cm}cm @ ${params.viewing_distance_cm}cm
        </p>
    `,
    on_finish: function(data) {
        params.participant_id = data.response.participant_id;
        params.session = data.response.session;
        
        // Add experiment metadata to all trials 
        jsPsych.data.addProperties({
            participant: params.participant_id,
            session: params.session,
            expName: 'illusoryLineTask',
            date: new Date().toISOString().slice(0,10),
            psychopyVersion: 'jsPsych-7.3.4',
            line_speed: params.line_speed,
            soa: params.soa,
            monitor_width_cm: params.monitor_width_cm,
            viewing_distance_cm: params.viewing_distance_cm,
            screen_width: screen_width,
            screen_height: screen_height
        });
    }
};
timeline.push(participant_info);

// Instructions
const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div style="text-align: center; max-width: 800px; margin: 0 auto;">
            <h1>Illusory Line Motion Task</h1>
            <p style="font-size: 18px; line-height: 1.6;">
                On each trial, you will see two circles on the screen.<br>
                One circle will briefly flash white (the cue).<br>
                Then, a line will appear and animate across the screen.
            </p>
            <div style="margin: 30px 0; padding: 20px; background: #222;">
                <p style="font-size: 20px; margin: 10px 0;"><strong>Your Task:</strong></p>
                <p style="font-size: 18px;">Press <strong>Q</strong> if the line appears to move from <strong>LEFT to RIGHT</strong></p>
                <p style="font-size: 18px;">Press <strong>P</strong> if the line appears to move from <strong>RIGHT to LEFT</strong></p>
            </div>
            <p style="font-size: 16px;">
                Try to respond as quickly and accurately as possible.
            </p>
            <p style="font-size: 18px; margin-top: 40px;">
                <strong>Press SPACEBAR to begin</strong>
            </p>
        </div>
    `,
    choices: [' '],
    post_trial_gap: 500
};
timeline.push(instructions);

// Function to draw stimuli on canvas
function draw_trial_stimuli(canvas, context, phase, progress = 0) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Convert visual angles to pixels using actual screen width
    const circle_radius = deg_to_pixels(0.5, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const cue_radius = deg_to_pixels(1.0, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const circle_offset_x = deg_to_pixels(4.0, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const circle_offset_y = deg_to_pixels(1.1, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const fixation_size = deg_to_pixels(0.3, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    
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