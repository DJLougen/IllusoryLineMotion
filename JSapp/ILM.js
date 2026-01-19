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
    on_finish: function () {
        // Filter to only response trials and select relevant columns
        const response_data = jsPsych.data.get().filter({ task: 'response' });

        // Get clean data with only the columns we need
        const clean_data = response_data.values().map(trial => ({
            participant_id: trial.participant,
            session: trial.session,
            trial_num: trial.trial_n,
            cue_side: trial.cue_side,
            line_origin: trial.line_origin,
            response_direction: trial.response_direction,
            rt: trial.rt,
            line_speed: trial.line_speed,
            soa: trial.soa
        }));

        // Convert to CSV
        const columns = ['participant_id', 'session', 'trial_num', 'cue_side', 'line_origin', 'rt', 'line_speed', 'soa', 'response_direction'];
        const csv_header = columns.join(',');
        const csv_rows = clean_data.map(row => columns.map(col => row[col] ?? '').join(','));
        const csv_content = [csv_header, ...csv_rows].join('\n');

        // Create filename and download
        const participant_id = clean_data[0]?.participant_id || 'unknown';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
        const filename = `${participant_id}_illusoryLineTask_${date}.csv`;

        const blob = new Blob([csv_content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
});

// Experiment parameters
let params = {
    participant_id: '',
    session: '001',
    line_speed: 75.0,  // degrees per second (LINE_SPEED)
    soa: 150,         // stimulus onset asynchrony in ms
    num_trials: 0,    // 0 = use all trials from CSV
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
        const response = await fetch('illusory_line_conditions_150.csv');
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
            { cueCondition: 'right', lineCondition: 'right', trial_num: 1 },
            { cueCondition: 'left', lineCondition: 'right', trial_num: 2 },
            { cueCondition: 'right', lineCondition: 'left', trial_num: 3 },
            { cueCondition: 'left', lineCondition: 'left', trial_num: 4 },
            { cueCondition: 'right', lineCondition: 'center', trial_num: 5 },
            { cueCondition: 'left', lineCondition: 'center', trial_num: 6 }
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
        <p><label>Line Speed (deg/sec): <input name="line_speed" type="number" step="0.1" value="${params.line_speed}" required /></label></p>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">
            Screen: ${screen_width} x ${screen_height} pixels<br>
            SOA: ${params.soa}ms | Monitor: ${params.monitor_width_cm}cm @ ${params.viewing_distance_cm}cm
        </p>
    `,
    on_finish: function (data) {
        params.participant_id = data.response.participant_id;
        params.session = data.response.session;
        params.line_speed = parseFloat(data.response.line_speed);

        // Add experiment metadata to all trials
        jsPsych.data.addProperties({
            participant: params.participant_id,
            session: params.session,
            expName: 'illusoryLineTask',
            date: new Date().toISOString().slice(0, 10),
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
// lineCondition parameter is optional - if not provided, will try to get from jsPsych timeline
function draw_trial_stimuli(canvas, context, phase, progress = 0, lineConditionOverride = null) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Convert visual angles to pixels using actual screen width
    const circle_radius = deg_to_pixels(0.5, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const cue_radius = deg_to_pixels(1.0, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const circle_offset_x = deg_to_pixels(4.0, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const circle_offset_y = deg_to_pixels(1.1, params.viewing_distance_cm, params.monitor_width_cm, screen_width);
    const fixation_size = deg_to_pixels(0.3, params.viewing_distance_cm, params.monitor_width_cm, screen_width);

    // Clear canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fixation cross
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX - fixation_size, centerY);
    context.lineTo(centerX + fixation_size, centerY);
    context.moveTo(centerX, centerY - fixation_size);
    context.lineTo(centerX, centerY + fixation_size);
    context.stroke();

    // Draw placeholder circles
    context.fillStyle = 'white';
    context.strokeStyle = 'white';
    context.lineWidth = 2;

    // Left circle - ABOVE fixation (subtract Y because canvas Y goes down)
    context.beginPath();
    context.arc(centerX - circle_offset_x, centerY - circle_offset_y, circle_radius, 0, 2 * Math.PI);
    context.fill();

    // Right circle - ABOVE fixation
    context.beginPath();
    context.arc(centerX + circle_offset_x, centerY - circle_offset_y, circle_radius, 0, 2 * Math.PI);
    context.fill();

    // Draw cue if in cue phase
    if (phase === 'cue') {
        const cue_x = jsPsych.timelineVariable('cueCondition') === 'right' ?
            centerX + circle_offset_x : centerX - circle_offset_x;

        context.beginPath();
        context.arc(cue_x, centerY - circle_offset_y, cue_radius, 0, 2 * Math.PI);
        context.fill();
    }

    // Draw line if in line phase
    if (phase === 'line' && progress !== null) {
        const lineY = centerY - circle_offset_y;  // Line at same height as circles
        let x_start, x_end, draw_full;

        // Use override if provided, otherwise get from timeline
        const lineCondition = lineConditionOverride || jsPsych.timelineVariable('lineCondition');

        if (lineCondition === 'right') {
            // Line goes from right circle edge to left circle edge (right-to-left)
            x_start = centerX + circle_offset_x - circle_radius;  // Inner edge of right circle
            x_end = centerX - circle_offset_x + circle_radius;    // Inner edge of left circle
            draw_full = false;
        } else if (lineCondition === 'left') {
            // Line goes from left circle edge to right circle edge (left-to-right)
            x_start = centerX - circle_offset_x + circle_radius;  // Inner edge of left circle
            x_end = centerX + circle_offset_x - circle_radius;    // Inner edge of right circle
            draw_full = false;
        } else {  // center - draws full line instantly between circles
            x_start = centerX - circle_offset_x + circle_radius;  // Inner edge of left circle
            x_end = centerX + circle_offset_x - circle_radius;    // Inner edge of right circle
            draw_full = true;
        }

        const current_x = draw_full ? x_end : x_start + (x_end - x_start) * progress;

        context.strokeStyle = 'white';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x_start, lineY);
        context.lineTo(current_x, lineY);
        context.stroke();
    }
}

// Create trial procedure (will be populated after loading conditions)
let trial_procedure = null;

// Function to create trial procedure after conditions are loaded
function createTrialProcedure() {
    return {
        timeline: [
            // Fixation (1000ms)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function (canvas) {
                    const context = canvas.getContext('2d');
                    draw_trial_stimuli(canvas, context, 'fixation');
                },
                choices: "NO_KEYS",
                trial_duration: 1000
            },
            // Cue (50ms)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function (canvas) {
                    const context = canvas.getContext('2d');
                    draw_trial_stimuli(canvas, context, 'cue');
                },
                choices: "NO_KEYS",
                trial_duration: 50
            },
            // Blank (SOA - 50ms)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function (canvas) {
                    const context = canvas.getContext('2d');
                    draw_trial_stimuli(canvas, context, 'blank');
                },
                choices: "NO_KEYS",
                trial_duration: function () {
                    return params.soa - 50;
                }
            },
            // Line animation + 1 second wait (fixed duration)
            {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: '',
                choices: "NO_KEYS",
                trial_duration: 1000,  // Fixed 1 second duration (draw + 0.5s wait)
                on_start: function () {
                    // Create and manage our own canvas for animation
                    const canvas = document.createElement('canvas');
                    canvas.width = screen_width;
                    canvas.height = screen_height;
                    canvas.style.position = 'fixed';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.zIndex = '9999';
                    canvas.style.backgroundColor = 'black';
                    canvas.id = 'line-animation-canvas';
                    document.body.appendChild(canvas);

                    const context = canvas.getContext('2d');
                    // Capture lineCondition NOW before async animation starts
                    const lineCondition = jsPsych.timelineVariable('lineCondition');
                    const draw_instantly = lineCondition === 'center';

                    if (draw_instantly) {
                        draw_trial_stimuli(canvas, context, 'line', 1.0, lineCondition);
                    } else {
                        const distance_deg = 8.0;
                        const duration_ms = (distance_deg / params.line_speed) * 1000;
                        const start_time = performance.now();

                        function animate() {
                            const elapsed = performance.now() - start_time;
                            const progress = Math.min(elapsed / duration_ms, 1.0);

                            draw_trial_stimuli(canvas, context, 'line', progress, lineCondition);

                            // Keep animating until done, then show completed line
                            if (progress < 1.0) {
                                requestAnimationFrame(animate);
                            }
                        }
                        animate();
                    }
                },
                on_finish: function () {
                    // Clean up our canvas
                    const canvas = document.getElementById('line-animation-canvas');
                    if (canvas) canvas.remove();
                }
            },
            // Response screen (replaces ITI)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function (canvas) {
                    const context = canvas.getContext('2d');
                    context.fillStyle = 'black';
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    // Add response prompt text
                    context.fillStyle = 'white';
                    context.font = '24px Arial';
                    context.textAlign = 'center';
                    context.fillText('Which direction did the line move?', canvas.width / 2, canvas.height / 2 - 40);

                    context.font = '20px Arial';
                    context.fillText('Q = Left to Right', canvas.width / 2, canvas.height / 2 + 20);
                    context.fillText('P = Right to Left', canvas.width / 2, canvas.height / 2 + 50);
                },

                choices: ['q', 'p'],
                trial_duration: null,  // wait for response
                data: {
                    task: 'response',
                    cueCondition: jsPsych.timelineVariable('cueCondition'),
                    lineCondition: jsPsych.timelineVariable('lineCondition'),
                    trial_n: function () {
                        return jsPsych.data.get().filter({ task: 'response' }).count() + 1;
                    },
                    // These will be populated in on_finish
                    cue_side: null,
                    line_origin: null,
                    response_direction: null
                },
                on_finish: function (data) {
                    const trial_num = data.trial_n;
                    const cue_side = data.cueCondition;  // 'left' or 'right'
                    const line_origin = data.lineCondition;  // 'left', 'right', or 'center'
                    const key = data.response;  // 'q' or 'p' or null
                    const rt = data.rt;

                    // Convert key press to perceived direction
                    // Q = perceived left-to-right, P = perceived right-to-left
                    let response_direction = null;
                    if (key === 'q') {
                        response_direction = 'left_to_right';
                    } else if (key === 'p') {
                        response_direction = 'right_to_left';
                    }

                    // Store clear, meaningful data
                    data.cue_side = cue_side;
                    data.line_origin = line_origin;
                    data.response_direction = response_direction;

                    console.log(`Trial ${trial_num.toString().padStart(3, '0')}: cue=${cue_side}, line_from=${line_origin}, response=${response_direction}, rt=${rt ? rt.toFixed(3) + 's' : 'None'}`);
                }
            }
        ],
        timeline_variables: trial_conditions
    };
}

// Debrief
const debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        const trials = jsPsych.data.get().filter({ task: 'response' });
        const n_trials = trials.count();
        const n_responses = trials.filter({ response: null }).count();
        const response_rate = ((n_trials - n_responses) / n_trials * 100).toFixed(1);

        return `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <h1>Experiment Complete!</h1>
                <p style="font-size: 18px;">Thank you for participating.</p>
                <p style="font-size: 16px;">
                    Your data will download after you press the key.<br>
                </p>
                <p style="font-size: 14px; margin-top: 40px;">
                    Press any key to finish.
                </p>
            </div>
        `;
    }
};

// Run experiment - load conditions first
async function runExperiment() {
    try {
        // Load trial conditions from CSV
        await loadConditions();
        // Check if conditions loaded properly
        if (trial_conditions.length === 0) {
            throw new Error('No trial conditions loaded from CSV');
        }

        console.log(`Starting experiment with ${trial_conditions.length} trials`);
        console.log('First few trials:', trial_conditions.slice(0, 3));

        // Create and add trial procedure after conditions are loaded
        trial_procedure = createTrialProcedure();
        timeline.push(trial_procedure);

        // Add debrief screen (calculated after trials complete)
        timeline.push(debrief);

        // Run experiment
        await jsPsych.run(timeline);
    } catch (error) {
        console.error('Failed to start experiment:', error);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px;">
                <h1>Error Loading Experiment</h1>
                <p>Error: ${error.message}</p>
                <p>Please make sure <strong>illusory_line_conditions_100.csv</strong> is in the same folder as this file.</p>
                <p>Check the browser console (F12) for more details.</p>
            </div>
        `;
    }
}

runExperiment();