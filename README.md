# Illusory Line Motion (ILM) Task

A web-based implementation of the Illusory Line Motion paradigm for studying inhibition of return (IOR) and attention.

## Overview

In the Illusory Line Motion illusion, a line that appears instantaneously can appear to "shoot" away from a previously attended location. This experiment measures perceived line motion direction following peripheral cues.

## Running the Experiment

### Online (Pavlovia)
The experiment is hosted on Pavlovia and can be run directly in a web browser:
- URL: [Your Pavlovia experiment URL]
- No installation required
- Works on any modern browser (Chrome, Firefox, Safari, Edge)

### Local Testing
1. Clone this repository
2. Open `index.html` in a web browser
3. For best results, use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   # Then open http://localhost:8000
   ```

## Task Instructions

1. Keep your eyes on the central fixation cross
2. Two circles will appear on either side of fixation
3. One circle will briefly flash (the cue)
4. A line will then appear between the circles
5. Report the perceived direction of line motion:
   - Press **Q** if the line appeared to move from **LEFT to RIGHT**
   - Press **P** if the line appeared to move from **RIGHT to LEFT**

## Trial Structure

| Phase | Duration |
|-------|----------|
| Fixation + placeholders | 1000 ms |
| Cue flash | 50 ms |
| Blank interval | SOA - 50 ms (default: 100 ms) |
| Line animation | Speed-dependent (~107 ms at 75 deg/s) |
| Response window | 2000 ms |
| Inter-trial interval | 1000 ms |

## Experimental Conditions

- **Cue side**: Left or Right
- **Line origin**: Left, Right, or Center (instant)
  - Left: Line draws from left circle toward right
  - Right: Line draws from right circle toward left
  - Center: Line appears instantaneously (control)

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| line_speed | 75 deg/s | Speed of line animation |
| soa | 150 ms | Stimulus onset asynchrony |
| num_trials | 150 | Total number of trials (0 = all from CSV) |

## Output Data

Data is saved as CSV with the following columns:

| Column | Description |
|--------|-------------|
| participant_id | Participant identifier |
| session | Session number |
| trial_num | Trial number |
| cue_side | Which side was cued (left/right) |
| line_origin | Where line drew from (left/right/center) |
| rt | Reaction time in ms |
| line_speed | Line speed setting |
| soa | SOA setting |
| response_direction | Perceived direction (left_to_right/right_to_left) |

## File Structure

```
IllusoryLineMotion/
├── index.html                      # Main HTML file
├── ILM.js                          # Experiment script
├── illusory_line_conditions_150.csv # Trial conditions
├── JSapp/                          # Development folder
│   ├── index.html
│   ├── ILM.js
│   └── illusory_line_conditions_150.csv
└── README.md
```

## Technical Details

- Built with jsPsych 7.3.4
- Uses HTML5 Canvas for stimulus presentation
- Pavlovia plugin for online data collection
- Visual angles calculated based on monitor parameters

## Contact

- Lab: Perception & Action Lab, University of Toronto
- Email: d.lougen@mail.utoronto.ca
