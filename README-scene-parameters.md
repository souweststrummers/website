# Scene Parameters - Complete Reference Guide

## Quick Overview

Scenes are **completely optional** for automatic navigation during playback. Add them only when needed for songs with repeats, D.S. al Coda, or complex structures.

```javascript
{
  "title": "My Song",
  "scenes": [
    {
      "at": 0.30,
      "goto": 0.15,
      "for": 25,
      "mode": "scroll",
      "then": "continue"
    }
  ]
}
```

---

## Parameter Reference

### `at` - Trigger Location
**Required:** ✅ YES  
**Type:** Number (0.0 to 1.0)  
**Default:** None (must be specified)

**What it does:**  
Defines where in the song the scene triggers. Uses the same percentage as the Location display on the remote.

**Examples:**
- `0.20` = Triggers at 20% through the song
- `0.50` = Triggers at 50% (halfway)
- `0.85` = Triggers at 85% (near end)

**How to find:**
1. Use location-tester.html
2. Scroll to where you want the scene to trigger
3. Note the Location % (e.g., "Location: 35%")
4. Use that value: `"at": 0.35`

---

### `goto` - Jump Destination
**Required:** ✅ YES  
**Type:** Number (0.0 to 1.0)  
**Default:** None (must be specified)

**What it does:**  
Where to jump when the scene triggers.

**Examples:**
- `0.10` = Jump to 10%
- `0.25` = Jump to 25%
- `0.60` = Jump to 60%

**Common patterns:**
- Jump backwards: `"at": 0.50, "goto": 0.20` (repeat chorus)
- Jump forwards: `"at": 0.40, "goto": 0.80` (skip section)

---

### `for` - Duration
**Required:** ✅ YES  
**Type:** Number (seconds)  
**Default:** None (must be specified)

**What it does:**  
How long to play from the `goto` location before executing `then` action.

**Examples:**
- `20` = Play for 20 seconds
- `30` = Play for 30 seconds
- `0` = Instant jump (no delay, goes straight to `then` action)

**What happens:**
1. Scene triggers at `at` location
2. Jumps to `goto` location
3. Plays/pauses for `for` seconds (depending on `mode`)
4. Executes `then` action

**Note:** If `mode` is "scroll", playback continues scrolling during this time, so you'll end up past the `goto` location.

---

### `mode` - Playback Behavior
**Required:** ❌ NO (optional)  
**Type:** String (`"scroll"` or `"pause"`)  
**Default:** `"scroll"` (if omitted)

**What it does:**  
Controls whether playback scrolls or pauses during the `for` duration.

#### Option 1: `"scroll"` (default)
```javascript
{
  "at": 0.30,
  "goto": 0.15,
  "for": 25,
  "mode": "scroll"  // or omit - same behavior
}
```

**Behavior:**
1. Triggers at 30%
2. Jumps to 15%
3. **Keeps scrolling** from 15% for 25 seconds (ends at ~20%)
4. Executes `then` action from ~20%

**Use when:** You want the PDF to keep moving during the repeat section.

#### Option 2: `"pause"`
```javascript
{
  "at": 0.30,
  "goto": 0.15,
  "for": 25,
  "mode": "pause"
}
```

**Behavior:**
1. Triggers at 30%
2. Jumps to 15%
3. **Stops scrolling** - stays at 15% for 25 seconds
4. Executes `then` action from 15%, then **resumes scrolling**

**Use when:** You want the PDF to stay still during the repeat section (static view of chorus).

---

### `then` - After Scene Completes
**Required:** ❌ NO (optional)  
**Type:** String (`"back"`, `"continue"`, `"stop"`) or Number (0.0-1.0)  
**Default:** `"back"` (if omitted)

**What it does:**  
Determines where to go after the scene finishes playing for `for` seconds.

#### Option 1: `"back"` (default) ✨
```javascript
{
  "at": 0.50,
  "goto": 0.20,
  "for": 25
  // No 'then' = "back"
}
```

**Behavior:**
1. Triggers at 50%
2. Jumps to 20%
3. Plays for 25 seconds (ends at ~25% if scrolling, or 20% if paused)
4. **Returns to 50%** (trigger point)
5. **Continues playing** from 50% to 100%

**Use when:** Song repeats a section and returns to finish properly (most common).

#### Option 2: `"continue"`
```javascript
{
  "at": 0.50,
  "goto": 0.20,
  "for": 25,
  "then": "continue"
}
```

**Behavior:**
1. Triggers at 50%
2. Jumps to 20%
3. Plays for 25 seconds (ends at ~25%)
4. **Stays at current position** (~25%)
5. Continues playing from ~25% to 100%

**Use when:** You want to skip the middle section (25%-50%) after the repeat.

#### Option 3: `"stop"`
```javascript
{
  "at": 0.80,
  "goto": 0.20,
  "for": 30,
  "then": "stop"
}
```

**Behavior:**
1. Triggers at 80%
2. Jumps to 20%
3. Plays for 30 seconds
4. **Stops playback completely**
5. Song ends (no scrolling to 100%)

**Use when:** Song ends at the final chorus - no need to scroll past it.

#### Option 4: Numeric value (0.0-1.0)
```javascript
{
  "at": 0.30,
  "goto": 0.15,
  "for": 25,
  "then": 0.60
}
```

**Behavior:**
1. Triggers at 30%
2. Jumps to 15%
3. Plays for 25 seconds
4. **Jumps to 60%**
5. Continues playing from 60% to 100%

**Use when:** You need to skip a section (like a page gap) after the scene.

---

## Complete Examples

### Example 1: Simple Repeat (minimal)
```javascript
{
  "at": 0.50,
  "goto": 0.20,
  "for": 25
}
```
**What happens:**
- Triggers at 50% → jumps to 20%
- Scrolls for 25 seconds (reaches ~25%)
- Returns to 50% (trigger point)
- Continues from 50% to end
- Uses defaults: `mode: "scroll"`, `then: "back"`

---

### Example 2: Paused Chorus View
```javascript
{
  "at": 0.50,
  "goto": 0.20,
  "for": 25,
  "mode": "pause"
}
```
**What happens:**
- Triggers at 50% → jumps to 20%
- **Pauses** at 20% for 25 seconds
- Returns to 50% (trigger point)
- Continues from 50% to end (resumes scrolling)

---

### Example 3: Skip Page Gap
```javascript
{
  "at": 0.30,
  "goto": 0.15,
  "for": 25,
  "then": 0.60
}
```
**What happens:**
- Triggers at 30% → jumps to 15%
- Scrolls for 25 seconds
- Jumps to 60% (skips gap)
- Continues from 60% to end

---

### Example 4: End at Final Chorus
```javascript
{
  "at": 0.85,
  "goto": 0.20,
  "for": 30,
  "then": "stop"
}
```
**What happens:**
- Triggers at 85% → jumps to 20%
- Scrolls for 30 seconds
- **Stops playback**
- Song ends cleanly at chorus

---

### Example 5: Multiple Scenes
```javascript
{
  "scenes": [
    {
      "at": 0.30,
      "goto": 0.10,
      "for": 20
      // First repeat - continues from ~15%
    },
    {
      "at": 0.60,
      "goto": 0.10,
      "for": 20
      // Second repeat - continues from ~15%
    },
    {
      "at": 0.85,
      "goto": 0.10,
      "for": 25,
      "then": "stop"
      // Final chorus - ends
    }
  ]
}
```

---

## Decision Tree

**Do I need scenes at all?**
- Song plays straight through? → **No scenes needed**
- Song has repeats/D.S./complex structure? → **Yes, add scenes**

**Which parameters do I need?**
- Always required: `at`, `goto`, `for`
- Optional: `mode`, `then`

**What mode?**
- Want PDF to keep scrolling during repeat? → `"scroll"` or omit
- Want PDF to pause/hold during repeat? → `"pause"`

**What then?**
- Return to trigger and finish song? → `"back"` or omit (DEFAULT)
- Stay at current position (skip ahead)? → `"continue"`
- End the song? → `"stop"`
- Skip to specific location? → `0.60` (number)

---

## Common Mistakes

### ❌ Wrong: Forgetting required parameters
```javascript
{
  "at": 0.30,
  "goto": 0.15
  // Missing "for" - will cause errors
}
```

### ✅ Correct: All required parameters
```javascript
{
  "at": 0.30,
  "goto": 0.15,
  "for": 25
}
```

---

### ❌ Wrong: Using "continue" when you want to finish the song
```javascript
{
  "at": 0.80,
  "goto": 0.20,
  "for": 30,
  "then": "continue"  // Stays at ~0.25, skips 0.25-0.80!
}
```

### ✅ Correct: Use default "back" or "stop"
```javascript
{
  "at": 0.80,
  "goto": 0.20,
  "for": 30
  // Default "back" - returns to 0.80, finishes song!
}
```

Or:

```javascript
{
  "at": 0.80,
  "goto": 0.20,
  "for": 30,
  "then": "stop"  // Ends at chorus - also perfect!
}
```

---

### ❌ Wrong: Values outside range
```javascript
{
  "at": 150,      // Should be 1.50 or 0-1 range
  "goto": 0.15,
  "for": 25
}
```

### ✅ Correct: Values in 0-1 range
```javascript
{
  "at": 0.80,     // 80% = 0.80
  "goto": 0.15,
  "for": 25
}
```

---

## Scene Behavior Rules

1. **Each scene fires ONCE per playthrough**
   - Even if you return to the trigger point, it won't fire again
   - Prevents infinite loops

2. **Scenes execute in order**
   - First matching scene triggers
   - Only one scene active at a time

3. **Reset triggers:**
   - "Back to top" button resets all scenes
   - Loading a new song resets all scenes
   - Refreshing the page resets all scenes

4. **Tolerance:**
   - Scenes trigger within ±1% of `at` location
   - Accounts for scroll timing variance

---

## Summary Table

| Parameter | Required | Type | Default | Purpose |
|-----------|----------|------|---------|---------|
| `at` | ✅ YES | Number (0-1) | None | Where scene triggers |
| `goto` | ✅ YES | Number (0-1) | None | Where to jump |
| `for` | ✅ YES | Number (seconds) | None | How long to play |
| `mode` | ❌ NO | String | `"scroll"` | Scroll or pause |
| `then` | ❌ NO | String/Number | `"back"` | What happens after |

---

## Getting Help

**Finding locations:**
- Use `location-tester.html` tool
- Load your PDF, scroll to position
- Copy the Location % value

**Testing scenes:**
1. Add one scene at a time
2. Test with "Back to top" between tests
3. Adjust timing as needed
4. Most songs need 0-2 scenes

**Questions?**
- See `README-scenes.md` for more examples
- Check `songs-data-example.js` for sample code
