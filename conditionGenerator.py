# ============================================================
# Illusory Line Task Condition Generator (Fixed Proportions)
# ============================================================
# Author: Daniel Lougen
# Date: 2025-10-27
#
# Generates exactly N trials with:
#   2 Cue Conditions  (cued, uncued)
# × 3 Line Conditions (congruent, center, incongruent)
#
# Fixed ratio:
#   congruent   = 20%
#   incongruent = 20%
#   center      = 60%
#
# Automatically balances cued/uncued within each line type.
# ============================================================

import polars as pl
import random

# -----------------------------
# USER SETTINGS
# -----------------------------
total_trials = 150
seed = 42
output_path = f"illusory_line_conditions_{total_trials}.csv"

# -----------------------------
# Factor setup
# -----------------------------
cue_conditions = ["cued", "uncued"]
line_conditions = {
    "congruent":   0.3333333333333, # 33%
    "incongruent": 0.3333333333333, # 33%
    "center":      0.3333333333333  # 33%   
}

# -----------------------------
# Calculate number of trials per condition
# -----------------------------
trials = []
for line_type, proportion in line_conditions.items():
    n_line = round(total_trials * proportion)
    n_per_cue = n_line // len(cue_conditions)

    for cue in cue_conditions:
        for _ in range(n_per_cue):
            trials.append({
                "cueCondition": cue,
                "lineCondition": line_type
            })

# -----------------------------
# Adjust if rounding made it off (keep total = 100)
# -----------------------------
while len(trials) < total_trials:
    # randomly add to congruent/incongruent if under
    cue = random.choice(cue_conditions)
    line = random.choice(["congruent", "incongruent"])
    trials.append({"cueCondition": cue, "lineCondition": line})
while len(trials) > total_trials:
    # randomly remove a center trial if overshoot
    idx = next((i for i, t in enumerate(trials) if t["lineCondition"] == "center"), 0)
    del trials[idx]

# -----------------------------
# Shuffle and number
# -----------------------------
random.seed(seed)
random.shuffle(trials)
for i, t in enumerate(trials, 1):
    t["trial_num"] = i

# -----------------------------
# Save to CSV
# -----------------------------
df = pl.DataFrame(trials)
df.write_csv(output_path)

# Summary printout
print(f"✅ Saved {len(df)} total trials to: {output_path}")
print(df.group_by(["cueCondition", "lineCondition"]).len())
print(df.head(8))
