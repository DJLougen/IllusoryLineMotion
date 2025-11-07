/**
 * @fileoverview Experiment script for line motion direction judgment task
 * 
 * This script runs an experiment where participants judge the direction of      
a moving line
 * with varying cue conditions and line conditions. It outputs a CSV file        
with all responses.
 */

/**
 * Draws the trial stimuli on a canvas
 * @param {HTMLCanvasElement} canvas - The canvas to draw on
 * @param {CanvasRenderingContext2D} context - The canvas context
 * @param {string} phase - The current phase ('fixation', 'cue', 'blank',        
'line')
 * @param {number|null} progress - Animation progress (0-1) for line phase
 */
function draw_trial_stimuli(canvas, context, phase, progress = null) {
    // Clear canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (phase === 'fixation') {
        // Draw fixation cross
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 10;

        context.beginPath();
        context.moveTo(centerX - size, centerY);
        context.lineTo(centerX + size, centerY);
        context.moveTo(centerX, centerY - size);
        context.lineTo(centerX, centerY + size);
        context.stroke();
    }

    if (phase === 'cue') {
        // Draw cue
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const circle_offset = 100;
        const cue_radius = 20;

        const cue_x = jsPsych.timelineVariable('cueCondition') === 'cued' ?      

            centerX + circle_offset : centerX - circle_offset;

        context.beginPath();
        context.arc(cue_x, centerY - circle_offset, cue_radius, 0, 2 * 
Math.PI);
        context.fillStyle = 'white';
        context.fill();
    }

    if (phase === 'line' && progress !== null) {
        // Draw line
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const circle_offset = 100;
        const lineY = centerY - circle_offset;
        let x_start, x_end, draw_full;

        const lineCondition = jsPsych.timelineVariable('lineCondition');
        if (lineCondition === 'congruent') {
            // Line goes from right circle edge to left circle edge 
(right-to-left)
            x_start = centerX + circle_offset - 10;  // Inner edge of right      
circle
            x_end = centerX - circle_offset + 10;    // Inner edge of left       
circle
            draw_full = false;
        } else if (lineCondition === 'incongruent') {
            // Line goes from left circle edge to right circle edge 
(left-to-right)
            x_start = centerX - circle_offset + 10;  // Inner edge of left       
circle
            x_end = centerX + circle_offset - 10;    // Inner edge of right      
circle
            draw_full = false;
        } else {  // center - draws full line instantly between circles
            x_start = centerX - circle_offset + 10;  // Inner edge of left       
circle
            x_end = centerX + circle_offset - 10;    // Inner edge of right      
circle
            draw_full = true;
        }

        const current_x = draw_full ? x_end : x_start + (x_end - x_start) *      
progress;

        context.strokeStyle = 'white';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x_start, lineY);
        context.lineTo(current_x, lineY);
        context.stroke();
    }
}

/**
 * Creates the trial procedure after conditions are loaded
 * @returns {Object} The trial procedure object
 */
function createTrialProcedure() {
    return {
        timeline: [
            // Fixation (1000ms)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function(canvas) {
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
                stimulus: function(canvas) {
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
                stimulus: function(canvas) {
                    const context = canvas.getContext('2d');
                    // Just clear canvas
                    context.fillStyle = 'black';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                },
                choices: "NO_KEYS",
                trial_duration: function() {
                    return params.soa - 50;
                }
            },
            // Line animation (NO response collection)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function(canvas) {
                    const context = canvas.getContext('2d');
                    const lineCondition = 
jsPsych.timelineVariable('lineCondition');
                    const draw_instantly = lineCondition === 'center';

                    if (draw_instantly) {
                        // Draw full line immediately
                        draw_trial_stimuli(canvas, context, 'line', 1.0);
                    } else {
                        // Animate line
                        const distance_deg = 8.0;  // 8 degrees
                        const duration_ms = (distance_deg / 
params.line_speed) * 1000;
                        const start_time = performance.now();

                        function animate() {
                            const elapsed = performance.now() - start_time;
                            const progress = Math.min(elapsed / 
duration_ms, 1.0);

                            draw_trial_stimuli(canvas, context, 'line',
progress);

                            if (progress < 1.0) {
                                requestAnimationFrame(animate);
                            }
                        }
                        animate();
                    }
                },
                choices: "NO_KEYS",
                trial_duration: 500
            },
            // Response screen (replaces ITI)
            {
                type: jsPsychCanvasKeyboardResponse,
                canvas_size: [screen_width, screen_height],
                stimulus: function(canvas) {
                    const context = canvas.getContext('2d');
                    context.fillStyle = 'black';
                    context.fillRect(0, 0, canvas.width, canvas.height);

                    // Add response prompt text
                    context.fillStyle = 'white';
                    context.font = '24px Arial';
                    context.textAlign = 'center';
                    context.fillText('Which direction did the line move?',       
canvas.width / 2, canvas.height / 2 - 40);

                    context.font = '20px Arial';
                    context.fillText('Q = Left to Right', canvas.width / 2,      
canvas.height / 2 + 20);
                    context.fillText('P = Right to Left', canvas.width / 2,      
canvas.height / 2 + 50);
                },

                choices: ['q', 'p'],
                trial_duration: null,  // wait for response
                data: {
                    task: 'response',
                    cueCondition: jsPsych.timelineVariable('cueCondition'),
                    lineCondition: 
jsPsych.timelineVariable('lineCondition'),
                    trial_n: function() {
                        return jsPsych.data.get().filter({task: 
'response'}).count() + 1;
                    }
                },
                on_finish: function(data) {
                    // Add response and rt columns 
                    data.response = data.response;  // 'q' or 'p' or null
                    data.rt = data.rt;  // reaction time or null

                    // Log trial info like Python version
                    const trial_num = data.trial_n;
                    const cue = data.cueCondition;
                    const line = data.lineCondition;
                    const key = data.response;
                    const rt = data.rt;
                    console.log(`Trial ${trial_num.toString().padStart(3,        
'0')}: cue=${cue}, line=${line}, key=${key}, rt=${rt ? rt.toFixed(3) + 's'       
: 'None'}`);
                }
            }
        ],
        timeline_variables: trial_conditions
    };
}

/**
 * Generates a CSV string from trial data
 * @param {Array} data - Array of trial data objects
 * @returns {string} CSV formatted string
 */
function generateCSV(data) {
    if (!data || data.length === 0) return '';

    // Create header row
    const headers = ['trial_n', 'cueCondition', 'lineCondition', 
'response', 'rt'];
    const csvRows = [headers.join(',')];

    // Add data rows
    data.forEach(trial => {
        const values = [
            trial.trial_n,
            `"${trial.cueCondition}"`,
            `"${trial.lineCondition}"`,
            `"${trial.response}"`,
            trial.rt
        ];
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
}

/**
 * Downloads data as a CSV file
 * @param {string} csvData - CSV formatted data string
 * @param {string} filename - Name of the file to download
 */
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Main execution
const params = {
    line_speed: 10,
    soa: 100
};

// Set up screen dimensions
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;

// Trial conditions
const trial_conditions = [
    { cueCondition: 'cued', lineCondition: 'congruent' },
    { cueCondition: 'cued', lineCondition: 'incongruent' },
    { cueCondition: 'cued', lineCondition: 'center' },
    { cueCondition: 'uncued', lineCondition: 'congruent' },
    { cueCondition: 'uncued', lineCondition: 'incongruent' },
    { cueCondition: 'uncued', lineCondition: 'center' }
];

// Create the trial procedure
const trial_procedure = createTrialProcedure();

// Debrief screen with CSV download
const debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div style="text-align: center; padding: 20px;">
            <h2>Experiment Complete</h2>
            <p>Thank you for participating!</p>
            <p>Your data has been saved. Click below to download the 
results.</p>
            <button id="download-btn" style="padding: 10px 20px; font-size:      
16px;">Download Results</button>
        </div>
    `,
    on_start: function() {
        // Add event listener to download button
        document.getElementById('download-btn').addEventListener('click',        
function() {
            // Get all response data
            const all_data = jsPsych.data.get().filter({task: 
'response'}).values();
            const csv_data = generateCSV(all_data);
            downloadCSV(csv_data, 'experiment_results.csv');
        });
    }
};

// Run the experiment
jsPsych.init({
    timeline: [trial_procedure, debrief],
    on_finish: function() {
        // Optional: Add any cleanup or final processing here
    }
});