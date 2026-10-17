# README standard

**Version 5** — 2026-10-04. A project that copies this records which version
it took.

- Version 1: taken from `D:\PhotoPipeline` at commit `dfe8b05`.
- Version 2: adds **Voice** under Attribution.
- Version 3: intentions close three ways (Decision, absorbed into the signed
  Goal, struck); an elaboration updates its entry, dated, instead of adding a
  new one. Learned from the pilot, `Waveform_Capture`.
- Version 4: signing a Goal can be a quoted confirmation in chat, after the
  whole draft has been shown and refined; a Decision entry is shown with an
  invitation to correct it, not a question. Learned from the pilot's scope
  phase.
- Version 5: references a new project couldn't follow removed.

What a README has to do in a project read mostly by AI agents and by its owner
months later.

## What it is for

A README is the **front door and the memory**, in that order. A reader should
answer five questions top to bottom, and stop as soon as they have what they
came for:

1. **What is this for?** — the goal, in the owner's words
2. **What state is it in right now?** — counts, what is verified, what is at risk
3. **What do I run?** — the exact commands, in order
4. **What does the owner intend, what has been decided, and what is
   deliberately not being done?**
5. **Why is it this way?** — the findings and history

Order is most of the craft. A reader who meets 150 lines of history before the
current state will guess at the state instead.

## One file

Everything lives in `README.md`. The findings go at the **bottom, below a
divider**, not in a separate file: one scroll, one source of truth, and the
"why" stays next to the "what". The divider tells a reader where the front door
ends.

## Three kinds of content, three lifecycles

Mixing these is what makes a document rot.

| Kind | Claims to be current? | How it changes | Where |
|---|---|---|---|
| **Orientation** — goal, state, runbook | Yes | **Rewritten**, dated, kept short | top |
| **Intent** — intentions, decisions, not now | Yes, by date | **Appended**; an entry is promoted, reversed or struck by a new dated entry, never silently edited. An intention may be elaborated in place, with the date of each elaboration | middle |
| **Findings** — what the data proved, bugs found, why rules exist | No — dated when true | **Appended**, never rewritten | bottom, below the divider |

A document that claims currency and isn't rewritten becomes wrong. A dated
finding can't become wrong; it can only become old.

## Sections, in order

**Goal** — 3 to 10 lines, in the owner's words: the end state and what blocks
it today. Signed and dated. **Signing** is the owner's explicit confirmation,
either by editing the file or in chat. Before a chat confirmation is
recorded, the agent shows the whole draft and refines it with the owner until
they confirm; the record then quotes their exact words with the date, and says
the wording is the agent's until the owner rewrites it. If the goal changes,
rewrite it and re-date it.
This is the section that keeps everyone from building the interesting thing
instead of the needed thing.

**Current state** — about 20 lines, dated. What exists, with counts measured
from the artifact rather than copied from a report. What has been **verified**,
by which command, on which date. What is **at risk**. Rewrite it whenever the
state changes.

**Runbook** — the commands, in order, copy-pasteable, each with the one warning
that matters.

**Intentions** — what the owner has said they want, in their words, **not yet
decided**. Each entry is dated and says what would settle it. It closes in one
of three ways: **promoted to a Decision**, **absorbed into the signed Goal**, or
**struck**. When the owner adds to an intention already listed, update that
entry, with the date of the elaboration, instead of adding a new number — and
keep the current understanding and the quotes that support it, not a running
log of every answer. A passing remark belongs here, never under Decisions. Keep
it short: if it grows past six or seven entries, things aren't being settled.

**Decisions** — dated, append-only. Each entry records:

- what was chosen
- the **alternative**, and **why** it lost
- **who** decided — a direct quote where possible
- where it is **enforced** (a config flag, a file, a rule)
- what it **serves →** — the Goal or an Intention

The agent writes the entry at the moment of decision and shows it, with an
invitation to correct it rather than a question; the owner can add to it or
move on. The recaps before each big step are where anything that slipped past
gets caught. A decision that serves nothing stated is either drift
or an intention nobody wrote down. Under Decisions, keep a short **Open
decisions** list: what is waiting on the owner, each item dated from when it
first came up, oldest first.

**Not now** — deferrals, each with a **reason**, a **trigger** and the **date
deferred**: "not until X, because Y." This is the tripwire that makes drift
visible when something is proposed, not three commits later. The owner declares
when a trigger has fired.

**Open items** — each with a **done-state that is a test**: something anyone can
observe, not a description. "Review/purge" is a description. "Done when a photo
deleted on the phone stays deleted after a rebuild" is a test. An item that
can't be phrased as a test is usually a decision in disguise; move it.
Before writing a test, **check that what it points at exists and can be run** —
a column, a command, a line of output — or say what has to be built for it to
exist. A test that looks for something absent can never fail, and reports a
false "done".

**Do not** — anti-goals and standing hazards. Short and blunt.

**Divider**, then reference — architecture, pipeline, prerequisites, version
control — then **Findings**, dated and append-only, as long as they need to be.

## Attribution

Every section that speaks *for the owner* — Goal, Intentions, Decisions, Not now
— is signed or quoted. Agent-drafted text is marked as drafted, **with the
date**, until the owner edits and ratifies it. Attribution says what actually
happened: "written by the agent at the owner's direction" is honest; "the
owner's rules, stated on <date>" over text the owner didn't write is not.
Ratification is separate from attribution and can come later. Rules cited by
number from code are load-bearing: add to the end, never renumber.

**Voice.** Only the owner's own words say "I". Everything an agent writes —
titles, drafts, summaries, and the Goal until it is signed — names the owner.
Quotes are exact: a word added or changed goes in [brackets]. The reader
questions at the top of this standard are exempt; "What do I run?" means
whoever is reading.

## The alignment check

When the owner says **"alignment check"** or **"let's do an alignment"**, any
agent in the repository reads the README and reports three lists, each item
with the date it was first written, oldest first:

1. **Waiting on the owner** — drafted blocks, intentions, open decisions, and Not
   now triggers that may have fired
2. **Decisions that serve no stated intention** — possible drift
3. **Intentions no decision has addressed** — hanging ideas

Reading runs from intention to decision; the check runs the other way, from
what was done back to what it was for. It **reports only** and changes
nothing. The check is not a role: no agent coordinates, and nobody reconciles
anything.

## Rules for updating

- **Rewrite** orientation; **append** intent and findings.
- **Fast-moving numbers** — counts, progress, anything still transferring —
  carry an **"as of" time** and the command that re-measures them. Slow things
  — goal, intentions, decisions — carry a date. Staleness is constant in a
  live project; it only does harm when nobody can see it. Before acting on a
  number that would change a decision, re-measure it.
- Numbers come from the artifact (disk, git, the manifest), not from a script's
  account of its own work and not from a chat transcript.
- Verification that only lives in a conversation didn't happen. Record the
  date, the command and the outcome where the next reader will find it.
- Dates are the owner's local dates.
- Before retiring a document, port anything cited elsewhere; git keeps the
  history.
- Never soften a specific number into a reassurance without re-measuring.

## Size

**No line budget.** The measure is the test below: whether a fresh agent reads
the README and names the right next step. Intent entries carry their why on
purpose, and that costs length. One warning sign: if the front door keeps
growing, check whether history has crept above the divider.

## The test

Open a fresh session in the repository and ask:

> Read the README. What should you build next, and what should you not build?

If the answer matches the owner's intent, the README works. If it proposes the
interesting thing over the needed thing, the Goal, Intentions or Not now
section is missing or weak. Run it after every significant rewrite; the
difference between two answers measures the edit.

## Anti-patterns to watch for

- No stated goal: agents plan from whatever list they find, usually the open
  items
- Current state not rewritten while the project changed underneath it
- Decisions made in conversation and never recorded
- No deferrals list: interesting work gets built ahead of the work that's
  actually blocking
- A document retired while it still held the only copy of something referenced
  elsewhere
- Rules attributed to the owner that an agent wrote
- A specific number softened into a reassurance ("a few")
- A passing remark recorded as a rule
- One word meaning different things to the owner and the agent
