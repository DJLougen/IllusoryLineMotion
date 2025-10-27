"""
Minimal Illusory Line Motion (ILM) Task
Timing sequence:
1. Fixation + placeholders: 1000 ms
2. Cue appears: 50 ms
3. Blank (placeholders only): SOA - 50 ms
4. Line animates at specified speed
5. Response collection (2000 ms timeout)
6. ITI: 500 ms

Parameters:
- line_speed_deg_per_sec: Controls animation speed (default 4.0)
  * 4.0 = 2.0s for 8° line
  * 8.0 = 1.0s for 8° line
- cue_target_SOA_ms: Time from cue onset to line onset (default 150ms)
  * Common for IOR: 100-300ms

Response keys:
- 'Q' = Left to Right
- 'p' = Right to Left
- 'ESC' = Quit and save data
"""

from psychopy import visual, core, event, monitors, data, gui
import pandas as pd
from numpy.random import randint
import os

# --- Experiment metadata ---
psychopyVersion = '2024.2.4'
expName = 'illusoryLineTask'  # from the Builder filename that created this script
# information about this experiment
expInfo = {
    'participant': f"{randint(0, 999999):06.0f}",
    'session': '001',
}

# Show participant info dialog
dlg = gui.DlgFromDict(dictionary=expInfo, sortKeys=False, title=expName)
if dlg.OK == False:
    core.quit()  # user pressed cancel

# Extract parameters
LINE_SPEED = 200
SOA = .150 # seconds

# Add hidden fields after dialog
expInfo['date'] = data.getDateStr()
expInfo['expName'] = expName
expInfo['psychopyVersion'] = psychopyVersion

# Setup data file
dataDir = 'data'
if not os.path.exists(dataDir):
    os.makedirs(dataDir)
filename = f"{dataDir}/{expInfo['participant']}_{expName}_{expInfo['date']}"

# Create ExperimentHandler for data saving
thisExp = data.ExperimentHandler(
    name=expName, 
    version='',
    extraInfo=expInfo, 
    runtimeInfo=None,
    dataFileName=filename
)

# --- Load conditions ---
trials = pd.read_csv("psychoPY/illusory_line_conditions_100.csv").to_dict("records")

# --- Define monitor manually ---
mon = monitors.Monitor("MBP_M3Max")  # name is arbitrary
mon.setWidth(34.5)      # physical screen width in cm 
mon.setSizePix([1728, 1117])  # logical resolution (Retina displays use scaled coordinates)
mon.setDistance(60)     # viewing distance in cm (about arm's length)
mon.saveMon()           # save configuration so PsychoPy can find it

# --- Create calibrated window ---
win = visual.Window(
    monitor=mon,
    units="deg",
    fullscr=False,
    color="black",
    allowStencil=False,
    checkTiming=True,
    waitBlanking=True
)

# Measure actual frame rate
actual_fps = win.getActualFrameRate(nIdentical=10, nWarmUpFrames=10)
if actual_fps is not None:
    print(f"Measured frame rate: {actual_fps:.2f} Hz")
else:
    print("Warning: Could not measure frame rate reliably")

# --- Stimuli ---
fixation = visual.ShapeStim(win, vertices='cross', size=(0.6, 0.6), lineColor='white')
cue = visual.Circle(win, radius=1, fillColor='white', lineColor='white')
L_circle = visual.Circle(win, radius=0.5, pos=(-4, 1.1), fillColor='white')
R_circle = visual.Circle(win, radius=0.5, pos=(4, 1.1), fillColor='white')
line = visual.Line(win, lineColor='white', lineWidth=3)

# --- Timing control ---
clock = core.Clock()

# --- Instructions Screen ---
instructions_text = visual.TextStim(
    win,
    text="""Illusory Line Motion Task

On each trial, you will see two circles on the screen.
One circle will briefly flash white (the cue).
Then, a line will appear and animate across the screen.

Your task:
- Press 'Q' if the line appears to move from LEFT to RIGHT
- Press 'P' if the line appears to move from RIGHT to LEFT

Try to respond as quickly and accurately as possible.

Press SPACEBAR to begin
Press ESC at any time to quit""",
    height=0.5,
    color='white',
    wrapWidth=20
)

instructions_text.draw()
win.flip()
event.waitKeys(keyList=['space', 'escape'])

# Check if they pressed escape
if event.getKeys(['escape']):
    win.close()
    core.quit()

# --- Run trials ---
for i, trial in enumerate(trials, start=1):
    cueCondition = trial["cueCondition"]
    lineCondition = trial["lineCondition"]

    # --- Set cue position ---
    cue.pos = (4, 1.1) if cueCondition == "cued" else (-4, 1.1)

    # --- Set line parameters ---
    lineY = 1.1
    if lineCondition == "congruent":
        x_start, x_end, draw_instantly = 4, -4, False
    elif lineCondition == "incongruent":
        x_start, x_end, draw_instantly = -4, 4, False
    else:  # center
        x_start, x_end, draw_instantly = -4, 4, True

    line.start = (x_start, lineY)
    line.end = (x_start, lineY)

    # --- Draw fixation & circles ---
    fixation.draw()
    L_circle.draw()
    R_circle.draw()
    win.flip()
    core.wait(1.0)  # 1 second baseline

    # --- Draw cue for 50ms ---
    cue.draw()
    L_circle.draw()
    R_circle.draw()
    fixation.draw()
    win.flip()
    core.wait(0.05)  # cue visible for 50ms
    
    # --- Blank period (rest of SOA) ---
    L_circle.draw()
    R_circle.draw()
    fixation.draw()
    win.flip()
    core.wait(SOA - 0.05)  # SOA minus the 50ms cue duration

    # --- Draw line animation ---
    speed = LINE_SPEED  # deg/sec (configurable in dialog)
    distance = abs(x_end - x_start)
    duration = distance / speed
    clock.reset()

    while True:
        # Check for escape key
        if event.getKeys(['escape']):
            win.close()
            core.quit()
        
        t = clock.getTime()
        if draw_instantly:
            line.start = (x_start, lineY)
            line.end = (x_end, lineY)
            line.draw()
            fixation.draw()
            L_circle.draw()
            R_circle.draw()
            win.flip()
            break
        else:
            progress = min(t / duration, 1.0)  # 0.0 to 1.0 (complete line)
            current_x = x_start + (x_end - x_start) * progress
            line.start = (x_start, lineY)
            line.end = (current_x, lineY)
            line.draw()
            fixation.draw()
            L_circle.draw()
            R_circle.draw()
            win.flip()
            if progress >= 1.0:
                break

    # --- Record response ---
    clock.reset()
    keys = event.waitKeys(maxWait=2, keyList=['q', 'p', 'escape'], timeStamped=clock)
    
    # Check if escape was pressed
    if keys and keys[0][0] == 'escape':
        thisExp.abort()  # save data before quitting
        win.close()
        core.quit()
    
    rt = None if keys is None else keys[0][1]
    key = None if keys is None else keys[0][0]
    
    # Save trial data
    thisExp.addData('trial_n', i)
    thisExp.addData('cueCondition', cueCondition)
    thisExp.addData('lineCondition', lineCondition)
    thisExp.addData('response', key)
    thisExp.addData('rt', rt)
    thisExp.nextEntry()
    
    print(f"Trial {i:03d}: cue={cueCondition}, line={lineCondition}, key={key}, rt={rt:.3f}s" if rt else f"Trial {i:03d}: cue={cueCondition}, line={lineCondition}, key={key}, rt=None")

    # Clear screen for inter-trial interval
    win.flip()  # blank screen
    core.wait(0.5)

# --- End experiment ---
thisExp.saveAsWideText(filename + '.csv')
thisExp.saveAsPickle(filename)
print(f"\nData saved to: {filename}.csv")
win.close()
core.quit()