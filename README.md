# Illusory Line Motion (ILM) Task for IOR Research

## Quick Start for Testing

### Prerequisites
- Python 3.8+
- PsychoPy library

### Installation
```bash
# Install PsychoPy
pip install psychopy

# Or if using conda:
conda install -c conda-forge psychopy
```

### Running the Experiment
```bash
# 1. Clone or download this repository
# 2. Navigate to the folder
cd path/to/ILM_task

# 3. Run the experiment
python minimalILM.py
```

### First-Time Setup
The experiment will automatically:
- Show a dialog to enter participant info and adjust parameters
- Create a `data/` folder for saving results
- Save monitor configuration

### Parameters You Can Adjust (in the GUI dialog)
- **Participant ID**: Auto-generated, but editable
- **Session**: Trial session number
- **Line Speed**: How fast the line draws (default: 4.0 deg/sec)
- **SOA**: Time between cue and line onset (default: 150ms)

### Controls
- **Z**: Line moving left to right
- **M**: Line moving right to left  
- **ESC**: Quit and save data
- **SPACE**: Start experiment (on instruction screen)

### File Structure
```
ILM_task/
├── minimalILM.py          # Main experiment script
├── psychoPY/
│   └── illusory_line_conditions_100.csv  # Trial conditions
├── data/                        # Created automatically for results
└── README.md                    # This file
```

### Output
Data saves to: `data/participantID_illusoryLineTask_date.csv`

Contains: trial number, cue condition, line condition, response, RT

---

## For Collaborators Testing Remotely

### Quick Test (If PsychoPy not installed)
```bash
# Create virtual environment
python -m venv ilm_env

# Activate it
# Mac/Linux:
source ilm_env/bin/activate
# Windows:
ilm_env\Scripts\activate

# Install requirements
pip install psychopy pandas numpy

# Run experiment
python minimalILM.py
```

---

## Experiment Design

**Paradigm**: Illusory Line Motion Task

**Timing**:
1. Fixation + placeholders: 1000ms
2. Peripheral cue flash: 50ms
3. Blank interval: SOA - 50ms (default 100ms)
4. Line animation: speed-dependent
5. Response window: 2000ms
6. Inter-trial interval: 500ms

**Conditions**:
- Cue: cued vs uncued location
- Line direction: congruent, incongruent, center

---

## Troubleshooting

**Error: "No module named 'monitors'"**
→ Ensure PsychoPy is installed correctly
**Monitor warnings on startup**
→ Normal on first run, configuration will be saved

**CSV file not found**
→ Make sure `illusory_line_conditions_100.csv` is in `psychoPY/` folder

**Timing warnings**
→ Close other applications for better frame rate consistency

---

## Contact
- Lab: Perception & Action Lab, University of Toronto
- Email: d.lougen@mail.utoronto.ca
