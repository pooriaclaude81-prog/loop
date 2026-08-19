# Loop — how to use it

No technical knowledge needed. About ten minutes, and you can stop after Step 2 if you
just want to try it.

---

## 1. Install it

1. Copy `loop.apk` to your phone (email it to yourself, or transfer by cable).
2. Tap the file. Android will say it can't install apps from this source — tap
   **Settings** in that message and turn on **Allow from this source**.
3. Tap the file again and install.
4. Open **Loop**. Allow notifications when it asks. This one matters: the timer lives in
   a notification, and without permission it can't show.

The app appears as **Loop** with a purple ring icon.

---

## 2. Try it right now, with no setup

Loop opens on **Today**, which will say there's no plan yet.

Tap **Repeat yesterday** — nothing happens the first time, because there's no yesterday.
So instead, get a plan in. The quickest way:

Open Claude, paste this, and send it to yourself however is easiest — then copy the whole
thing and use **Paste plan** on the Today screen.

```json
{
  "schema": 1, "type": "plan", "date": "2026-08-19",
  "plan_id": "test-1", "rev": 1, "tz": "Asia/Tehran",
  "coach_note": "First day. Keep it small.",
  "sections": [
    { "key": "study", "label": "Study", "weight": 0.6, "color": "indigo",
      "tasks": [
        { "key": "study.a", "label": "Cardiology", "mode": "timer", "target_min": 60 }
      ]},
    { "key": "exercise", "label": "Exercise", "weight": 0.4, "color": "amber",
      "tasks": [
        { "key": "ex.run", "label": "Easy 5k", "mode": "run",
          "target": { "distance_km": 5, "pace_band": ["5:40","6:10"], "run_type": "easy" } }
      ]}
    ]
}
```

**Change the date to today** before pasting, or Loop will file it as an old day.

Now you have a plan. Tap a task to start its timer. Lock your phone — the timer keeps
running and shows in your notifications. Come back and tap again to pause.

---

## 3. The four screens

**Today** — your day. Tap a timed task to start or stop it. Tap any other task to log it.
**Press and hold** any task to log it after the fact, if you forgot to start the timer.
Sleep sits at the top; tap **Add** to enter it by hand.

**Review** — opens itself at 21:30. Everything is already filled in. Read it, fix anything
wrong, write a note at the bottom, tap **Send**. Nothing is ever sent without that tap.

**History** — how the last few weeks went. The thick line is your 7-day average, which is
the number that actually means something. The thin line is daily noise.

**Settings** — email account, pairing token, times.

Your day score only appears on Review and History. That's deliberate. Seeing it all day
turns the evening into score-chasing.

---

## 4. Connecting your email (optional, ~5 minutes)

This is what makes it automatic: Claude writes tomorrow's plan into your Gmail drafts,
and Loop picks it up by itself.

### Get an App Password

A normal Gmail password won't work. You need a 16-character App Password:

1. Go to **myaccount.google.com** → **Security**.
2. Turn on **2-Step Verification** if it isn't already. This is required.
3. Go to **myaccount.google.com/apppasswords**.
4. Type "Loop" as the name, click **Create**.
5. Copy the 16-character code it shows you. Spaces don't matter.

### Turn on IMAP in Gmail

1. Gmail on a computer → gear icon → **See all settings**.
2. **Forwarding and POP/IMAP** tab → **Enable IMAP** → **Save Changes**.

### Put it into Loop

1. Loop → **Settings**.
2. Type your Gmail address and paste the App Password. Tap **Save**.
3. Tap **Test connection**. It will tell you exactly what's wrong if something is — it
   doesn't just say "failed".
4. Tap **Generate** under *Pairing token*, then **Copy**.

### Tell Claude

Give Claude the token and this instruction:

> Each night, create a Gmail **draft** (don't send it) with the subject
> `[LOOP1|PLAN] YYYY-MM-DD · TOKEN` — where the date is tomorrow and TOKEN is the token I
> copied from Loop. In the body, write a short note to me, then a fenced code block marked
> ```loop containing the plan JSON.

Loop checks for new drafts every 30 minutes, and whenever you open it.

---

## 5. Two settings that stop Android breaking it

Android aggressively kills background apps, which would stop your timer.

**Settings → Background reliability → Open battery settings** → find Loop → set to
**Unrestricted** / **Don't optimise**.

**If you have a Xiaomi, Redmi or POCO phone** there is a *second*, separate setting called
**Autostart**. No app can turn this on for you:

Phone Settings → Apps → Manage apps → Loop → **Autostart** → turn on.

Without it, Loop can't check your mail in the background.

---

## 6. Health data (optional)

If you use Mi Fitness, Google Fit or similar with a watch, Loop can read your sleep and
workouts automatically.

Settings → **Health Connect** → **Grant access**.

If you don't have it, nothing breaks — just tap **Add** on the sleep strip each morning.
It takes five seconds.

Loop never scores your sleep. It shows it as context and uses it to shape the next day's
plan, and that's all.

---

## If something goes wrong

**A plan won't import** — Loop keeps it and shows you exactly what was wrong with it, with
the line. Fix it in Claude and paste again.

**Timer stopped overnight** — check the two settings in Step 5. Loop also asks "still on
this?" after 45 minutes with the screen off, and pauses itself if you don't answer, so a
timer left running overnight doesn't record eight fake hours.

**Nothing arrives by email** — Settings → **Test connection**. It reports the real error.
The usual causes are IMAP not enabled in Gmail, or a normal password used instead of an
App Password.

**You can always work without email.** Paste a plan, or share one into Loop from Gmail
using the share button. The share sheet and clipboard always work, with no setup at all.
