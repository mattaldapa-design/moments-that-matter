# Moments That Matter

## Goal

> **A journaling app Matt can take on a trip and use on his iPhone. He
> starts a trip, sets how many days it runs, and on each day quickly adds
> blocks for the key moments: the food he ate, a place, a person he met.
> Each block is a few taps, with a picture beside it, and more detail only
> if he wants it, even days later. The trip's story builds itself from those
> blocks, so he never faces a blank page. At the end he can export a summary
> of the trip, to look back on and to share with others. The first version
> is his alone; other people join by file later.**

*Signed 2026-10-17. Matt, shown this whole draft in chat: "Yeah, I like
that. That seems to capture it in a in in a nice general term. I, I think
there's going to be more to grow from it, but I, but I think it's a good
start." The wording is the agent's until Matt rewrites it in his own voice.*

## Current state (2026-10-18)

```
README.md            this file
README-STANDARD.md   Starter Dough version 5
CLAUDE.md            Starter Dough, as committed in 8f695d9
app/                 the first build: 1,114 lines in 8 files the agent wrote
                     (wc -l app/index.html app/sw.js app/manifest.webmanifest
                     app/css/app.css app/js/*.js), plus darkroom-tokens.css and
                     darkroom.css copied from the Dark Room kit, and three
                     placeholder icons
.claude/launch.json  the preview server for the desktop app
git                  remote: github.com/mattaldapa-design/moments-that-matter
                     (branch claude/journaling-app-0aafd1, also pushed as main)
```

**As of 2026-10-21, version 43 is live** at
<https://mattaldapa-design.github.io/moments-that-matter/> and in daily use
on Matt's iPhone for a real trip; version 44 (the kit refresh, I37) is in
the working tree, waiting on Matt's commit. Everything below was built
between 2026-10-17 and 2026-10-21; the Decisions and Intentions carry the
detail.
The 18th added: Send this day (I25), Settings & help with a User guide and
your name (I24), a colour per kind (I26), tap-to-reframe pictures (I28),
recap sleeves (I27), the removal of Pass the notebook, a movable first day
(I29), airlines as a list (I30), a folding packing list (I31), a pencil to
change a moment's emoji (I32), a Day summary fold on every board with a
note, Spent today, Miles and Steps (I33), Mindfulness moments with I
statements (I34), word tiles for Notes and Mindfulness, and two rounds of
code-review fixes. The 19th to 21st added: Done floating in the corner
(I35), a trip picture of its own (I36), Reframe before a picture's focal
point moves (I28), rounded-tile chips, and the Dark Room kit's 20 October
sleeves, plum field, tints and lamp-lit depth (I37). What it does: trips (start one, set its days, rename, add
or remove a day, delete); boards (a city, a weather tap, the Day summary
fold, tiles in time order, drag to reorder, a list view with move arrows);
the add flow (eight kinds, a type-anything box, a gallery of about 300 words
with emojis, a word block when nothing matches); the block editor (a picture
from the photo library, with place and time read from the picture when it
carries them, a pencil on the emoji, the kind's own fields, Where with the
phone's position on request, When, Cost, Note, I statements, nothing
required, saved as he types); a Stay carries across its nights; a trail at the top of every screen,
each level tappable; one-tap backup to the share sheet (or a download) as a
`.json` with the pictures inside, and a reminder once 10 changes or 8 MB have
piled up since the last backup (10 changes or 8 MB, Decision of 2026-10-17);
import of a backup, as a copy if the trip is already there; an offline shell
through a service worker.

**Verified 2026-10-17** by the agent in the desktop app's built-in browser at
375×812, served by the launch.json server: start a trip → open Day 3 → set
city and weather → add Food & drink → attach a synthetic JPEG carrying EXIF
(2026-10-19 14:05, 33°50'37.6"S 151°14'28.4"E) → the block shows 33.8438°S
151.2412°E and 14:05 → typing "scone" made a word block → a Stay with 3
nights shows "night 2" on Day 4 → list move and tile drag both reordered and
stayed reordered → backup produced `Australia - Moments backup
2026-10-17.json` (38 KB: 1 day, 3 blocks, 1 picture) → importing it made a
copy with the picture showing → the service worker reached "activated".

**Changed the same evening, after Matt's first look** (verified in the
same preview): When no longer asks for a date; Time, Cost and How long are
off the default card and in an "Add a detail" list; each day row shows the
emojis of its moments under its name; a ⋯ on each day row opens a sheet to
slide a day in before or after, move it earlier or later, or remove it, and
the dates renumber. Checked: sliding a day in before Day 3 made Day 3 empty
and moved Sydney and its 3 moments to Day 4; a block with no details shows
Title, Where, Note and the list; choosing Cost added the field.

Later the same evening: a day's key picture (I10); details removable, with
Website and Menu links (I11); optional place-name lookup (Decision); one
item on several days (I12); and the Recap with PDF and picture export
(I13), in `app/js/recap.js`.

**Published 2026-10-17 (late evening, 2026-10-18 UTC):** workflow run 6 on
commit `9efdc81` succeeded; `curl -s -o /dev/null -w "%{http_code}"
https://mattaldapa-design.github.io/moments-that-matter/` returned 200, and
in the desktop app's browser the page loaded with the manifest and the
service worker "activated" at that scope, no console errors.

After Matt's fourth look (same evening): a fixed "$" on Cost and whole
dollars in the recap; People added one name at a time, with "Met Larry and
Diane" as the automatic title (I14); the picture picker forgets its last
choice; Activity starts as ✨ and a block's title steers its emoji ("Surfing
lesson" → 🏄); the recap drops "pictures kept", counts every block's named
place, and packs several days onto a page (the test trip's export went from
7 pages to 5). Verified in the preview, 2026-10-17.

After the fifth look: the recap's "most-used icon" stat is replaced by
moments a day on average, and the recap's emojis, day headings and titles
open their moment or day (I15).

Then, in the agreed order: Archive to a file (I3) and place levels (I7),
both verified in the preview.
Then the longer detail list with "Your own" (I17) and "Share this day" as
one picture (I19). Then stars in the recap (I20) and "About this trip" with the
packing list (I18). After the seventh look: the day picture leads with date and place,
"Day n" by the weather; Activity asks "What did you do?" first and the icon
follows the words. After Matt's sixth look: the day picture is photo-first
(one, two side by side, one tall and two stacked, or a 2×2 fill the middle,
words below with place, stars and a note line) and tile captions show only
place and stars.

**Not verified:** anything on an iPhone. Home-screen install from Chrome,
the photo picker's location behaviour, share-to-Files, long-press drag on
touch, and whether iOS marks the storage persistent are all untested.

**At risk:** the service worker serves the app shell cache-first, so a
changed file does not reach an installed phone until `VERSION` in
`app/sw.js` is bumped.

## Runbook

1. **Preview on the PC.** In the desktop app, start the `moments` server from
   `.claude/launch.json`; it runs
   `python -m http.server 8787 --bind 127.0.0.1 --directory app`. Open
   <http://localhost:8787>. Warning: after editing files under `app/`, bump
   `VERSION` in `app/sw.js` or unregister the service worker in the browser,
   or the old files keep being served.
2. **Publish.** The code is on GitHub at
   <https://github.com/mattaldapa-design/moments-that-matter>. Pushing
   `claude/journaling-app-0aafd1` (the repository's default branch, because
   it was pushed first) runs `.github/workflows/pages.yml`, which serves the
   `app/` folder at <https://mattaldapa-design.github.io/moments-that-matter/>.
   Pages was switched on by Matt on 2026-10-17 (Settings → Pages → Source →
   GitHub Actions); the `github-pages` environment only lets the default
   branch deploy, so a push to remote `main` is a copy, not a publish, until
   `main` is made the default. The local default branch is `master` (the seed
   only). Bump `VERSION` in `app/sw.js` and `APP_VERSION` in `app/js/app.js`
   together with every publish, or phones keep the old files. The Trips
   screen shows the version it is running and has "Check for an update";
   when a newer worker takes over, the app reopens itself once.
3. **On the phone.** Open the address above in Chrome on the iPhone, Share →
   Add to Home Screen, then open it from the icon.
4. **Sharing a trip with someone.** They install the app from the same
   address. Back up sends them a copy; Pass the notebook sends it and locks
   it here until their file comes back through Import a trip, which then
   replaces it. They receive by saving the attachment to Files and tapping
   Import a trip.

## Intentions

What Matt has said he wants, in his words, not yet decided. Each closes in one
of three ways: promoted to a Decision, absorbed into the signed Goal, or
struck.

- **I1 (absorbed into the Goal 2026-10-17) — A travel journaling app that captures moments quickly and builds
  the day's story from blocks.** *(2026-10-17)* The pitch, as Matt said it:

  *"I have an idea that um, I need your help with building out. It's it's
  going to be a journaling app. It's intended for me to be able to um, take on
  a trip, and uh, I want to be able to easily input the information that I'm
  trying to get across and be able to manage my, uh, let, let me just put it
  this way. I'm not a good journaler. Um, the like city, this is not
  necessarily about sitting and writing out a lot of things. It's, it's really
  about um, quickly being able to um, capture a moment, capture information,
  write a name down, jog a note, and compile it in within the journal story.
  Um, and the way that I mainly want to use this is, is, is in travel. So, so
  it's not about like a daily affirmation of like, my thoughts, but more or
  less just to remember what happened like kind of build that narrative out. I
  imagine that I'll be able to like in my perfect world, this would be like
  like more more like an application that that lets me build out the day. So
  so like I imagine it kind of like unfolds like like little like a like a
  little paper like puzzle kind of thing um, without without being puzzling.
  Um kind of like a, like a folded, like, like origami type um, style and
  I'll, I'll describe it a little bit more. Um, so I imagine like imagine I
  want to... [the transcript repeats the passage from "let me just put it this
  way" to here; the repeat is left out] like start a, a trip like like a
  journal um go on a trip, and the way that it would, uh, like, go, I, I
  imagine, like, using this this journal tool, this journal application would,
  it, like, um, st- start your trip, and I'd, I'd tap to, like, start a trip.
  Okay, how many days are you going on? Uh, how many days would you be gone
  for? And you can, like, add or remove days. Like, yeah, I want to do, like, a
  string of, like, 14 days. It's going to be this trip. Okay, you can title it
  or whatever the trip is. And then in there on each day, you know, you can
  enter that day. And then there I can like almost like a, like I, I can, it,
  it's like you have like a little like, I don't know, maybe like almost like
  a, uh, each day is kind of like a, a way that you can just start adding
  different elements to it. So, so let's say like I can select from a, a list
  of categories of things that I want to, that I did that day. So, I can be
  like food. And so it just, I can add like a food block. And then like when I
  click on food, it lets me like name the food that I have. I can like had how
  much it cost. I can like each section is like real quick for me to fill
  out. I can put a picture of it next to it. Um, maybe there's a, a people
  button section. So like I can not, not in the food section. And like, then
  when I'm done, like putting that information in on the food, I can step out
  and I can be like, um, location or landmark or, uh, person I met or, you
  know, like people and like, you can add like a person and an interaction you
  had and, or story or I don't know, like there's different elements you can
  add into each of the days and make kind of like a little clipboard almost
  of, of all of the activities you did. And I want to be able to do that for
  every single day, um, you know, on my trip. And then at the end, I can like
  export out those and like share it with other people. Um, you know, I, I
  maybe it uses, I'm going to mostly likely be using it on my phone as well.
  So, so I want it to, um, I want it to be that. But really, like the most
  important thing is that it's like, it's easy for me to do because I don't
  like to just sit with a blank page. Like I like to just be able to like drag
  and drop and add elements to my day based on the general things that, that
  I did. And you can, you can kind of customize each of the days to, to fit
  that purpose. And again, this, this idea is not fully like fleshed out. I'm,
  I'm curious on, on, on what you think we can do, but I would love to build
  something that I can use and, and on my next trip. Or even if I can share it
  out too and other people can use it."*

  *Added 2026-10-17*, asked what the pitch left out: *"honestly, I I I
  don't have much else um, besides that because journaling is it feels so
  simple, but ultimately the thing that holds me back is being able to just
  quickly add items and not overthink things because I don't want it to be a
  full paragraph. [...] when I travel and stuff, you know, days are um, like
  pretty pretty standard, right? I mean, I eat something, I do something, I
  see something, I. Travel, I, I, I, I you know, visit a, a landmark. I don't
  know. There, there's so many like little things, but like if I can just like
  have like the calendar day what it was, you know, and like I can choose if I
  want to add extra little detail, if I really, really want to, but it's like
  capturing just the key moments and not having to write a whole bunch."*

  *Added 2026-10-17*, asked whether the end product is a record for him or
  something to hand to others: *"I would say it's a little bit of both. Um,
  you know, these journals are not supposed to be, it's supposed to be
  something you can share, not something that's like personal you keep hidden
  in secret yourself. I mean, you know, if you, we could develop what that
  might look like later, but but I would like this to be more of a
  collaborative thing and like even if I could like I mean, dream state, I
  could like you know, um export it or cloud save it as a as a quick little
  like slideshow or uh um like a almost just like a summary, like a your trip
  summary. Um you know, in a in a at a glance, you know. And and and you can
  like kind of look back at it. Um and also you can add more details if you
  really want to. You can just like maybe um not after you export it, but like
  yeah, you can always go back and, and, and add extra layers to each each
  day. Cause I would say like each day kind of has like its solid foundation
  that you have, and then, you know, like you could, if you want to go back
  and maybe you're looking through photos and you're like, oh yeah, I want to
  add that detail. Um, as well."* [The transcript then repeats this passage;
  the repeat is left out.] What "collaborative" means here is not yet
  settled; the agent has asked.

  **Settles when:** Matt and the agent have agreed what the first version
  captures on a day and what it produces at the end of a trip. (The
  settling condition is the agent's draft.)

  **Absorbed into the Goal, 2026-10-17.** The block categories and the
  shape of the end-of-trip summary are still to be decided; they will be
  Decisions, not a reopening of this entry.

- **I2 — Other people can add to a trip, by a shared file rather than live
  sync.** *(2026-10-17)* Asked what "collaborative" means: *"maybe this app
  we can save a cloud shared like on on on a Google Drive or something or on
  a you know on one of those servers where um, they can add stuff to the day
  as well if they want to. Um, maybe they can import your trip and view it.
  Um, they can share with you a a photo or a location. Um, or a story that
  they remember. They can add to your your day. Um, through the cloud,
  perhaps."* Asked whether that is a want or thinking out loud: *"keep it as a
  solo thing that maybe two individual people can like have their own and
  then share across a different platform or something like that, a different
  medium, because they don't need to update in real time together. Um, but
  maybe there's like a shared file that they can use to update their their
  current trip and, and import it. Um, but yeah, like I said, I don't think
  they need to sync with each other uh, at the start."*

  **Settles when:** one copy of the app can export a trip as a file and
  another copy can import it, and Matt has said what an importer may add to
  a day. (The settling condition is the agent's draft.) Deferred under Not
  now until the solo version exists.

  *Added 2026-10-17*, after finding he had one trip going in a Chrome tab
  and another in the home-screen app: *"I don't know if that would be just
  something that we look about like merging a project or merging one into
  another. So like you can pick up on it or something like that, or
  somebody can edit it and, and share it back and we can be working from a
  copy of somebody else's, like I said, the import uh, feature [...] I know
  that's a later thing [...] if I want to merge them, that would be nice to
  be able to do."* So import has two meanings to settle: bring a trip in as
  its own, and merge a trip's moments into one already here. Today import
  does only the first.

- **I3 (settled 2026-10-17) — Trips back up to a cloud drive Matt chooses, and past trips can be
  offloaded to keep the app slim.** *(2026-10-17)* Matt, after hearing how a
  home-screen web app stores data on the phone: *"that's what I'm thinking,
  is that it just automatically kind of backs up onto a like linked cloud
  drive that you choose. And so that way you it's it's able to, to do that.
  You can also just like offload past trips as their own little journal I
  don't know, packets onto the cloud, and then clear up the space on your app
  for new ones and just kind of keep it keep it slim."* Also: *"just trying
  to make sure that [...] it just doesn't accidentally disappear."*

  **Settles when:** Matt has said whether "automatically" means with no tap
  from him (which on a web app means signing in to Google Drive; iCloud has
  no equivalent) or a one-tap save that he can send to any drive. (The
  settling condition is the agent's draft.)

  **Settled 2026-10-17:** one-tap backup with a reminder (Decision of that
  date), and "Archive to a file" on the trip page, which backs the trip up,
  asks whether the file is safe, and only then removes the trip from the
  phone; Import brings it back. Verified in the preview on a copy of the
  test trip: backup file produced, trip and its pictures gone, one trip
  left.

- **I4 — A day is built from emoji-icon blocks; a block can hold blocks;
  some things span days.** *(2026-10-17)* Asked to walk through one real
  day, Matt described day three of an Australia trip, flying into Sydney.
  What he named, gathered by the agent from his telling: a flight (airline,
  seat, flight details, "maybe it's a bumpy flight"); breakfast coffee and a
  scone with a picture; a bike ride; a lunch cruise on Sydney Harbour, with
  the food eaten on the boat nested inside it; the zoo, with ticket price,
  how long they stayed, and the weather; a fireworks show; the people sat
  next to at the fireworks (names, contact details, where from, what they
  recommended); the hotel, which should carry across several days without
  being re-added. In his words:

  *"I imagine like the plane icon would be something that like I would look
  for and I would just drop it into the day you know I'd be adding these
  little icons to the day"* ... *"you can use like emojis to like creates a
  little icon of what you did that day. You can make little icon emojis and
  you can add more details on those. And so you're kind of building out your
  day and adding pictures to each of these little icons"* ... *"inside of it,
  you could even talk about the food that you ate too. So you can add within
  those, once you're like in that layer, that's why I described it kind of
  like little paper origami unfolding [...] you can kind of go deep within
  the days, but you need to be able to get yourself out and back to like the
  main area fast"* ... *"maybe it can be like multiple things. You can add
  multiple elements uh, within that same day"* ... *"if it's a mode of travel
  or something like that, yeah, you can like easily move it to like across
  several days if it's like consistent. Um, so that way, like you it's
  included in each day and you don't have to like always re-add it [...]
  especially like if I'm staying at a hotel"*.

  *Added 2026-10-17*, on how a board should look and feel: *"I imagined it
  almost like magnets on a refrigerator or something like that, where like
  they're they're you know stuck to the the refrigerator, and you can kind of
  move them around as you want to. But they're colorful and they're like fun.
  Um, you know, if you want to, and it kind of tells the story. And then it's
  almost like a like a what's that? Like a word cloud, but also with with with
  visuals or emojis or some sort of symbol of it."* Earlier the same day he
  said a board is "probably going to be chronological"; settled the same
  day: time order, draggable, with a list view (see Decisions).

  **Settles when:** the first version's block kinds and their fields are a
  Decision, and Matt has said whether nesting and cross-day items are in the
  first version or wait. (The settling condition is the agent's draft.)

  **Settled in part, 2026-10-17:** blocks are built-in kinds plus any emoji,
  nothing mandatory, and the seven kinds are decided; see the Decisions of
  that date. Cross-day items are covered by Stay's nights for now. Blocks
  inside blocks are under Not now.

  **Built 2026-10-17** in the first build: boards, tiles, drag, list view,
  the seven kinds, Stay across nights.

  *Added 2026-10-26*, on Travel's How chips: *"I'd also like the ability to
  add Taxi/Ride Share and Shuttle as travel method options."* **Changed the
  same day:** 🚕 Taxi or ride share and 🚐 Shuttle sit after Car.

- **I5 (struck 2026-10-17) — A block's icon can be a word instead of an emoji.** *(2026-10-17)*
  Matt, while deciding how blocks work: *"some people might not want it to
  look like emojis and might not want those. And that might not be easily
  visible for them to um, do the task. So maybe you can choose to just use a
  word, you know, food instead of uh, an actual emoji of one."* Said as
  "maybe" and about other people. *Added 2026-10-17*, asked whether it is for
  the first version: *"you can maybe have like a little box where you can
  start typing a word and it auto-populates and I can just tap that word to
  add it as an item. Like to the board, and I can choose to either add it as
  an emoji if it exists, or just the word if it doesn't exist as an emoji,
  and that way I can just add it to to my board and then then start adding
  information afterwards."* Matt's word for a day's page is **board**: *"I
  keep on using this term as a board, like again, I'm kind of imagining it
  like almost like a little like collage board that I'm building out, except
  it's going to be a little more organized and it's probably going to be
  chronological."*

  **Settles when:** Matt says whether it is in the first version, and if so
  whether it is a per-app setting or a per-block choice. (The settling
  condition is the agent's draft.)

  **Built 2026-10-17** as the type-anything box: a typed word becomes an
  emoji block when the gallery knows it, else a word block (see the
  Decision of that date). A setting to prefer words everywhere is not built.

  **Struck 2026-10-17**, by Matt, asked whether the switch should be
  app-wide or per block: *"I'm not even sure if the words instead of emojis
  is needed [...] my worry and my concern was that it would be very icon
  heavy and and it would be hard to tell what I'm trying to refer to when I
  can clearly see the word next to the icons and the emojis [...] I feel
  like it's it's it's contextually pretty easy to understand."* The word
  block for a typed word with no emoji stays, as built.

- **I6 — A photo added to a block fills in its location (and time) from
  the photo's own data, which Matt can verify or change.** *(2026-10-17)*
  Matt: *"if I add a photo from my photos, can it just, can it autofill the
  location um, I don't know if there's any data within the photo that we can
  pull to tell the story uh, easier. And, and you can like verify it or, or
  not, you know, or change it."* Agent's note, from user reports rather than
  Apple documentation: on iPhone, a web app gets a library photo's location
  only if the picker's Options menu allows it (iOS 17 and later), and a
  photo taken fresh from inside the web app arrives with no location. A
  fallback is the phone's own position at the moment a block is added.

  **Settles when:** on Matt's phone, a block made from a real photo shows the
  right place and time without him typing them, and he has said what should
  happen when the photo carries no location. (The settling condition is the
  agent's draft.)

  **Built 2026-10-17**, verified on the PC with a synthetic photo and then
  on Matt's iPhone with a library picture: time and coordinates filled in.
  Names: see the Decision of 2026-10-17 on place lookup; "Look up the name"
  turned 33.8438°S 151.2412°E into "Rainforest Trail, Mosman" in the
  preview.

- **I7 — Places nest: country, city, down to the building or park; a block
  folds into that, and Matt can always get back out to the top fast.**
  *(2026-10-17)* Matt: *"Sydney. Is a location, right? But then also the
  hotel within Sydney's a location, but maybe I want like you know that
  umbrella of it, like like there's a hierarchy from like the like country
  like you know city kind of thing down to the building you know and, and
  park that I'm at [...] it's kind of like folding into each other when I
  was mentioning the paper unfolding. But I also want you to be able to kind
  of like go back out to the main scope quickly if you if you needed to add
  something or you don't want to get too far down lost in the weeds of it
  and you can't get out."* Agent's proposal, not yet decided: a day carries a
  city set once at the top of its board; a block's place sits under it; a
  trail like "Australia › Sydney › Taronga Zoo" shows at the top of every
  screen, and tapping any level jumps there.

  **Settles when:** the first version shows a block's place with its levels
  and Matt can get from the deepest screen to the trip in one tap. (The
  settling condition is the agent's draft.)

  **Built 2026-10-17**, in three passes: the trail (Trips › trip › Day n ›
  block) on every screen, any level one tap; then the city in the trail
  ("Day 4 · Sydney"), a place trail above Where in the editor ("Australia ›
  Sydney › Rainforest Trail, Mosman"), and a "cities and towns" stat once a
  trip has more than one; then, after the ninth look, **Places** in "About
  this trip": countries with their cities listed underneath, which the
  board offers when a day's city is typed, and which the trail and the
  recap's cover use. Verified in the preview. Getting out from the deepest
  screen is still one tap on the trail or the back arrow.

- **I8 — Days can be moved, and a day slid in between two others.**
  *(2026-10-17)* Matt, on the trip page: *"added and removed days good, but
  I think like then um, like sometimes you may miss a couple of days or do
  them out of order. So I think we should be able to edit the day order as
  well and or slide a day in between. Uh, another existing day."*

  **Settles when:** the trip page lets him move a day and insert one, the
  dates renumber from the first day, and the moments stay with their day.
  (The settling condition is the agent's draft.)

  **Built 2026-10-17:** the ⋯ on each day row slides a day in before or
  after, moves it earlier or later, or removes it; verified in the preview
  (Sydney and its 3 moments moved from Day 3 to Day 4 when a day slid in).

- **I9 — A day's row shows the emojis of its moments, a snapshot of the
  day.** *(2026-10-17)* Matt: *"in that space in between where it like where
  it shows the little icon of the like weather, I'd love to see all the icons
  of the different things that we're doing that day [...] it just tells you a
  little snapshot of what you might find in that day, like a little window
  of like, food. I did food that day, did an activity [...] it might be
  harder when it's on a phone because it's kind of small. But I think that
  might be nice."*

  **Settles when:** each day row shows its moments' emojis next to the
  weather and Matt can read them on his phone. (The settling condition is
  the agent's draft.)

  **Built 2026-10-17:** the emojis sit under the day's name, up to eight
  then "+n", with the weather at the end of the row. Matt has seen it on
  the phone without complaint; not asked about directly.

- **I10 — Each day can have a key photo, chosen by Matt, as its icon.**
  *(2026-10-17)* Matt: *"I think we should be able to make a key photo for
  each day. So I know it seems default to whatever one is in the front, but
  if you want to make a key photo for the day and make that little icon,
  that would be nice as well."*

  **Settles when:** from a block with a picture Matt can make it the day's
  picture, and the day's row shows it instead of the first picture. (The
  settling condition is the agent's draft.)

  **Built 2026-10-17:** a block with a picture has "Make this the day's
  picture"; the day row shows it. Verified in the preview: the button
  flips to "This is the day's picture" and Day 4's row took the picture.
  **Grown 2026-10-17** to four key pictures in tap order (Decision of that
  date); tiles show the number.

- **I11 — A block can carry a website link, and a food block a menu link.**
  *(2026-10-17)* Matt, on the phone: *"it'd be cool if you could add a
  website, if like there was a um, a website um, that they had, you can like
  copy it, go to the website, copy and paste the URL, the web URL into it.
  Um, for some of the places like food, like if I had a menu, um, that could
  be an option as well."*

  **Settles when:** Website and Menu are in the "Add a detail" list, a
  pasted address opens from the block. (The settling condition is the
  agent's draft.)

  **Built 2026-10-17:** Website and Menu are in the list; a pasted address
  gets an Open button. Verified in the preview with "taronga.org.au".

- **I12 (settled 2026-10-17) — One item can sit on several days, consecutive or scattered,
  keeping its place, with a different picture and details on each day.**
  *(2026-10-17)* Matt: *"what if we can add an item to each day so like I
  don't know we're staying at the hotel the same hotel for three days we can
  add it to the like three consecutive days or we can add it to to different
  days throughout the trip um and at least it like keeps the location but
  maybe you can add a different picture on each day um as well uh and other
  kind of information just like some of the general ones [...] you can
  change the rest."*

  **Settles when:** from a block Matt can pick the other days it belongs to,
  each day gets its own copy with the same name and place and its own
  picture, note and details, and Matt has said whether renaming one renames
  them all. (The settling condition is the agent's draft.)

  **Built 2026-10-17** as an "Also on" row of day chips in the editor, and
  **settled** by the Decision of the same date: name, place and the kind's
  own fields travel together (renaming one renames all); picture, note,
  details and order are each day's own. Verified in the preview: hotel added to day 6, renamed
  there, day 4 followed.

- **I13 — The end-of-trip summary is a recap like Apple Music's year in
  review: fun stats with pictures, a scrollable overview of the trip's
  emojis, a day-by-day photo collage, and an export as a PDF or other visual
  file to share.** *(2026-10-17)* Matt, asked what he sees when he opens the
  summary: *"I want to like press a button that gives me almost like how in
  like Apple Music they do like your year in summary [...] it gives you fun
  stats about your trip. So you know you I don't know, spent this much on
  food. You met this many new people. You ate at this many restaurants. But
  like I imagine that it's like it will like show you like a little picture
  next to it [...] a nice like little scrollable thing. Like it could be
  like maybe like a couple of different export options. So like your trip at
  a high level [...] it can like show you the little icons of like all the
  things you did, the little emojis, like as an overview kind of version of
  it. And like, you know, it can like give you cool stats on your trip. And
  then you can kind of have like more of a photo export version of like show
  me a day by day, like collage version [...] maybe even are able to like
  turn it into a like slide book version or a like a long scroll version.
  You know, we can play around with like a couple of these first, but
  ultimately too, I would like this to be able to like be able to export out
  as like a PDF or some sort of visual file that you can share with somebody
  to give them some highlights on your trip."*

  **Settles when:** the first recap's sections, its stats and its export
  format are a Decision. (The settling condition is the agent's draft.)

  **Decided and built 2026-10-17:** see the Decision of that date. Verified
  in the preview on the test trip: the Recap screen rendered 7 stats, the
  emoji field and 4 day bands; "Save as PDF" produced a 7-page, 466 KB PDF
  whose cross-reference table checks out; "Share as pictures" produced the
  same 7 pages as JPEGs. Not yet opened on the iPhone.

- **I14 — People are added one at a time, by name; maybe into contacts one
  day.** *(2026-10-17)* Matt: *"it says title Larry and Diane, but I guess it
  could be like met Larry and Diane or something like that. And the name's
  Larry and Diane [...] maybe with people you can like you can add first
  name, like you can add a person, add a person [...] because names is, is
  indicating always two people as opposed to like, you might be one person
  and like add a person. You know, maybe you can even add them to your
  contacts. Who knows? [...] but that's that's a later kind of thing."*

  **Settles when:** a People block takes one name at a time and reads "Met
  Larry and Diane" on its own; contacts stay under Not now. (The settling
  condition is the agent's draft.)

  **Built 2026-10-17**, verified in the preview; contacts are under Not now.

- **I15 — The recap is also a way to move through the trip: tap an emoji
  or a day and land there, to look or to edit.** *(2026-10-17)* Matt: *"the
  everything you did [...] what if you can tap each of those things and go
  to it to see which one it was [...] it might be cool if you can tap it and
  go to that day and you can just kind of like look at your whole trip at,
  as a whole that way as well another way of looking at it [...] the
  day-by-day view is is is just an interesting way of navigating through
  your trip and being able to edit it as well."*

  **Settles when:** on the Recap, an emoji opens its moment and a day band
  opens its board. (The settling condition is the agent's draft.)

  **Built 2026-10-17**, verified in the preview: an emoji opened "New
  Friends" on Day 1; the Day 1 band opened its board.

- **I16 (struck 2026-10-17) — Pull activity data from the phone or Apple Watch: steps, miles
  hiked, stairs.** *(2026-10-17)* Matt: *"I wear an Apple Watch. I don't
  know if there's any way to sync my step count. Um, you know, if I do a
  trail, like, it, it'd be nice to put, like, step counts or miles hiked or,
  um, you know, like, like stairs, uh, you know, taken [...] data that maybe
  if I wanted to sync from my phone, I could."* Agent's note: a home-screen
  web app cannot read Apple Health; that needs a native app (see the
  platform Decision). Typing the numbers as details is the reach today.

  **Settles when:** Matt has heard that limit and said whether typed
  details are enough for now. (The settling condition is the agent's draft.)

  **Struck 2026-10-17**, Matt: *"We don't need to do the the Apple Watch
  thing. Um, that's that's big picture. I mean, even though if you just had
  the you know, you can put the trail and the trail length or something like
  that. Um, that would be wonderful."* Trail and distance become details
  (I17).

- **I17 — More kinds of detail to add to a block, including his own.**
  *(2026-10-17)* Matt: *"I'm also not 100% enamored with all of the uh, add
  detail functions because, I mean, yes, cost, how long, website, but I feel
  like there could be more options to add um, things from that from that
  drop down menu [...] it can be a bit. Limiting in what I add"*; examples
  across his telling: steps, miles, stairs, seat numbers, hotel room number.

  **Settles when:** the list has grown and includes a detail Matt names
  himself, and he has used it on a real block. (The settling condition is
  the agent's draft.)

  **Built 2026-10-17** (see the Decision of that date); verified in the
  preview with a four-star rating and a "Trail · 7.2 mi" of Matt's own kind.
  Not yet used on a real block by Matt.

- **I18 — Trip-level information: who he travelled with, the cruise line,
  a packing list, and other big-picture things, apart from the days.**
  *(2026-10-17)* Matt: *"I'm also wondering if there's like overall trip
  info because it's great day by day, but like you know maybe just name it.
  Who did you travel with? Um, what was the cruise line? [...] maybe you can
  have a packing list. Uh, included, um, like what you packed, what you
  brought [...] these are, like, all optional things, but I think, like,
  they might need to live separately [...] at the high level of the trip
  level and then um, and then versus at the at the day level."*

  **Settles when:** the trip page has a place for trip-wide details and a
  packing list, and Matt has said what the first version holds. (The
  settling condition is the agent's draft.)

  **Built 2026-10-17:** an "About this trip" panel on the trip page, folded
  by default: travelled with (names one at a time), trip details from a
  list (Airline or cruise line, Booking reference, Budget, Website,
  Insurance, Your own), and a packing list with ticks and a "1 of 2 packed"
  count. Companions show on the recap's cover. Verified in the preview,
  including after a reload. The first version's contents are the agent's
  reading of Matt's examples; he has not yet said what else it should hold.

- **I19 — A one-day recap as a single picture, to send or post.**
  *(2026-10-17)* Matt: *"it would be cool if you can like do almost the
  recap, but at, like just from the day level where like you had a really
  good day and like at the end of the day, you want to send your friend or a
  loved one or, or post like a little screenshot picture of my like, I did
  all these cool, this was like a summary of my day today [...] it's just
  like a one PDF kind of um, shot or, or one, one JPEG or, or whatever the,
  the photo version is that gets saved. So that way, if you want to like
  post that picture online to on like a social media platform."*

  **Settles when:** a board has a one-tap "Share this day" that hands the
  share sheet one picture of that day. (The settling condition is the
  agent's draft.)

  **Built 2026-10-17:** "Share this day" on the board draws one 1080×1350
  picture (trip, day, date and city, weather, emojis, up to four pictures,
  titles) and hands it to the share sheet. Verified in the preview (97 KB
  JPEG).

- **I20 — Rate a meal or a tour with stars, see the stars in the recap,
  and keep the name of a guide or waiter who was good.** *(2026-10-17)*
  Matt, on hearing "rating" for a trail: *"what if you can rate your meal
  that you had? Maybe you really loved the meal and you can give it a, a, a
  star rating [...] you can see how many like like four star meals you had
  or something like that [...] maybe you took a really good tour and you had
  the tour guide's name and you want to write that down, like the, you had
  a really good waiter at the restaurant."*

  **Settles when:** any block can take stars (already true since I17), the
  recap counts them, and a block can carry a guide's or waiter's name. (The
  settling condition is the agent's draft.)

  **Built 2026-10-17:** the recap shows how many moments got four stars or
  more and the top-rated one, plus a line of guides and hosts; "Guide or
  host" is a ready-made detail. Verified in the preview.

- **I21 — A gauge of how much of the phone the app is using, with a
  warning in time to archive.** *(2026-10-17)* Matt: *"some sort of warning
  about how big it's getting and lets you know to like clear it out [...] I
  don't want somebody to reach their limit and then it like not be able to
  take any more or break or something. So, I mean, that's why we have the
  offload feature, but, um, it'd be nice to like, see how much, like if
  there's like a progress on it of, of how much you're using."*

  **Settles when:** the Trips screen shows used against available with a
  bar, each trip shows its own size, and a warning appears before the
  phone's limit. (The settling condition is the agent's draft.)

  **Built 2026-10-17:** a bar on the Trips screen (green, amber from 70%,
  red from 90%, with a nudge to archive), and each trip page says its
  pictures and their size. The "allowed" figure is what the phone reports;
  the app cannot change it. Verified in the preview.

- **I22 — A countdown to a trip that has not started, on the Trips page.**
  *(2026-10-17)* Matt: *"if I'm planning for a trip or for any kind of
  event [...] It'd be nice if I could like set the date in advance when it's
  coming up and get a little countdown to it or something. Like maybe it
  like like on the homepage on the trips page, it like lets me know how far
  I am from that trip. Date."* On reminders: *"I don't know if you can set
  phone reminders [...] but probably not."* Agent's note: a home-screen web
  app on iPhone can show notifications only with a server to send them,
  which this app does not have; a countdown it can do.

  **Settles when:** a trip with a future first day shows "Starts in n days"
  on the Trips page and its own page. (The settling condition is the
  agent's draft.)

  **Built 2026-10-17:** "Starts in n days" / "Starts tomorrow" on the trip's
  tile and page; "Day n of m today" while it runs. Verified in the preview
  with a trip dated 24 days ahead.

- **I23 (built 2026-10-17, cut 2026-10-18) — Pass the notebook: hand a trip to someone by text, let them add,
  and get it back whole.** *(2026-10-17)* Matt: *"Would we be able to make
  the pass the notebook feature like kind of like a almost like a text
  message version of it? Like, like you could pass it to them like a note
  as a as a text, and then they can just open it that way and import it and
  then they can like pass the notebook back as a text. That might be a
  little risky [...] just make sure you back it up, I guess, first."* Then,
  shown the shape: *"I like that. I think that's a fun feature. Let's
  incorporate it."*

  **Settles when:** a trip can be passed on from its page, is read-only
  while passed, and an import of it replaces the passed copy instead of
  making a second one. (The settling condition is the agent's draft.)

  **Built 2026-10-17** (see the Decision of that date). Verified in the
  preview: pass → banner and read-only face, editor routes bounce; import
  of the passed file → "The notebook is back", one trip, editable again.

- **I24 — A short explanation of the features in the app, and a settings
  place with a small profile.** *(2026-10-17)* Matt: *"we may need like a
  short little like just readme like informational button or section like
  a settings section um, that way you can just like understand some of the
  features [...] what does it mean? You know, the backup. What does the
  pass the notebook mean? What does archiving? [...] some sort of
  information though is need to be shared [...] that way somebody doesn't
  mess up"*; and *"maybe you can just make yourself a little like um, you
  know a little profile."*

  **Settles when:** the app has a screen that explains back up, archive and
  pass the notebook side by side, and holds the settings and a name. (The
  settling condition is the agent's draft.)

  **Built 2026-10-17** (see the Decision of that date): ⚙ Settings & help
  from the foot of Trips; seven "How it works" sections; name, place-name
  switch, saved packing list, storage gauge, version and update check.
  Verified in the preview; the name signs the pass note and the recap.

- **I25 — Send one day, not the whole trip, and drop it into another
  trip.** *(2026-10-18)* Matt: *"imagine person A has the trip they're
  making it on their phone. And person B also has the same trip and they're
  making it on their phone [...] they plan on, like, having one master one
  at the end [...] Would they be able to export like the activity. So so
  not just the trip, but instead like how we shared the day, maybe they can
  share a day and you can add it into your trip and reorder it and and and
  somehow add just the day into the trip [...] as opposed to just like
  trying to merge the trips?"*

  **Settles when:** a day can be sent as a file from the day menu, and
  Import a trip recognises it and offers to add it to a trip of Matt's
  choosing, either into the day with the same date or as a new day. (The
  settling condition is the agent's draft.)

  **Built 2026-10-18** (see the Decision of that date). Verified in the
  preview: a day sent, added to another trip as a new day with its
  pictures, then offered to the same-dated day of its own trip and skipped
  as already there. The help text covers it.

- **I26 — More colour, within Dark Room.** *(2026-10-18)* Matt: *"I love
  that you incorporated darkroom into this [...] it's it's very much my UI
  [...] I think the only thing that I would like is a little more variety
  in, I mean, in color [...] everything either is red, yellow, or black,
  basically, and white. Um, and then, of course, the emoji colors. I feel
  like it just needs a little more splashes of color just to give it a
  little more dynamicism [...] I love, like, how each of the cards and the
  tiles, they they kind of highlight when I when I tap them."* The brief
  allows hot pink, acid and lagoon as earned splashes, scoped, and lagoon in
  artwork and badges; the agent's proposal is one colour per kind in the
  artwork slots (emoji faces, kind buttons, type covers, stat tiles).

  **Settles when:** Matt sees the coloured kinds on his phone and says it
  is the variety he meant. (The settling condition is the agent's draft.)

- **I27 — The recap should feel like browsing a record collection.**
  *(2026-10-18)* Matt: *"maybe the recap screen. I think you could just have
  a little more style [...] maybe like some, some highlights around some of
  the, the little boxes there [...] like I like it feeling like I'm kind of
  like browsing through like a, like a record collection, you know, of
  vinyls and, and looking at all the different CD covers."*

  **Settles when:** the recap's stat cards and day bands lift and glow like
  sleeves in a crate, and Matt says it feels that way. (The settling
  condition is the agent's draft.)

  **Built 2026-10-18:** coloured rims and a tilted lift on the stat cards,
  a lift on the day bands and their pictures, a crate glow behind the emoji
  field. Verified in the preview; awaiting Matt's eye on the phone.

- **I28 — Reframe a picture so crops keep the subject.** *(2026-10-18)*
  Matt: *"a lot of my key photos are, are still kind of cropped weird in the
  um in in my uh recaps and in, in some of the the share photos which which
  is kind of a bummer [...] I don't know if I can just like move them around
  and and reframe or something."*

  **Settles when:** tapping a picture in the editor sets the point that
  every crop keeps in frame, on tiles, cards and the recap. (The settling
  condition is the agent's draft.)

  **Built 2026-10-18:** a tap on the picture in the editor sets its focal
  point (a ring marks it); tiles, rows, recap bands, PDF pages and the day
  card crop around it; untouched tall pictures in wide frames favour their
  top third. Verified in the preview with a focal point at 15% from the top.

  *Added 2026-10-18*, after a week's use: *"I accidentally tap the crop
  button by accident when I'm just scrolling through and I don't even
  realize it. So it would be nice to either activate that feature so it
  doesn't happen by accident, or just make it very clear that that's going
  to be the focal point of the photo. Because it's not very clear from just
  it being a little white circle."* Options put to him the same day; he
  chose the Reframe button (Decision of 2026-10-18). **Changed the same
  day:** the picture ignores taps until Reframe is pressed; the ring has
  crosshairs and a "Kept in frame" label; while reframing the frame and ring
  turn signal red and the hint says where to tap; the tap sets the point and
  ends the mode. Never mind cancels.

  *Reported 2026-10-26*: *"When I reframe a picture - it disappears. I
  just see a '?' in the memory."* See Findings, same date: the fix in
  version 47 stores a fresh copy of the picture's bytes instead of handing
  the stored picture back to the database, and refreshes the picture on
  screen.

  *Added 2026-10-26*: *"currently the 'kept in frame' appears constantly
  once a photo is added - I'd like that to only appear when reframing
  appears."* **Changed the same day:** the label shows only in reframe mode;
  the small crosshair ring still marks the point at rest. (Keeping the ring
  is the agent's reading of "kept in frame" as the label.)

- **I29 — Change a trip's first day and have every day move with it.**
  *(2026-10-18)* Matt: *"be able to change the trip start date and then it
  will adjust the days along with it. So that way um, if I needed to delay,
  if a trip got delayed or something happened or it moved up or anything
  uh, maybe I, I entered a, a start date wrong, I can edit that. And then
  it will shift and not lose anything."*

  **Settles when:** the first day can be changed on the trip page and every
  day's date follows, with all moments in place. (The settling condition is
  the agent's draft.)

  **Built 2026-10-18:** "First day" in About this trip; days are numbered,
  not dated, so moving the first day moves them all. Verified in the
  preview: Day 8 went from Nov 17 to Nov 19 with its six moments.

- **I30 — Several airlines or cruise lines on a trip, and a way to put one
  on a day.** *(2026-10-18)* Matt: *"you should be able to add multiple um
  airlines and cruises basically like the idea of like sometimes you take
  multiple flights and, and use multiple airlines and and uh, maybe you do
  take flights into a cruise so I think that should be um um able to be
  added on the trip details uh, uh, on the top and then you should be able
  to add that to specific days as well."*

  **Settles when:** About this trip takes airlines and lines one at a time,
  and one can be put on a chosen day as a Travel moment. (The settling
  condition is the agent's draft.)

  **Built 2026-10-18:** "Airlines and lines" in About this trip, one at a
  time, each with a 📅 that puts it on a chosen day as a Travel moment;
  Travel's Company field offers them. The old single "Airline or cruise
  line" detail migrates into the list. Verified in the preview.

- **I31 — The packing list folds under its title, with the unpacked
  items first.** *(2026-10-18)* Matt: *"the packing list is starting to get
  really long [...] I'd like the, the packing list to be collapsible from
  the packing list like um, title [...] imagine I have a four of 23 packed
  [...] when I click on packing list, it will like ex- expand down and it'll
  show me everything [...] it should also just default to having unchecked
  items at the top of the list, that way I can I can see what I haven't
  finished yet. And then as I add it, it'll just they'll they'll be they'll
  be placed at the bottom of the list."*

  **Settles when:** the list opens and closes from its title with the count
  beside it, and ticked items drop to the bottom. (The settling condition is
  the agent's draft.)

  **Built 2026-10-18.**

- **I32 — A moment's emoji can be changed without changing its title.**
  *(2026-10-18)* Matt: *"have the option to change the emoji [...] let's say
  I pick coffee, but I don't want a picture of the coffee on it. Maybe I want
  to change the emoji to a heart but still have coffee be the title [...]
  I'd like that option from when I create the moment, to change the emoji
  icon. Especially [so] that way it shows on the summary of the day [...]
  the emoji that I want it to be."* Told that the title steers the emoji
  today: *"Yeah, I'm aware. So I think that the way it will work first is if
  I'm typing surfing and it changes it to a surf emoji and I add the moment,
  when I go into the moment, I can just go and only update the emoji if I
  wanted to. So there's that little edit idea for the emoji. Kind of like,
  you know, it could be a little pencil or something like that, that I can
  at least recognize that I want to change this emoji once I make the
  moment."*

  **Settles when:** inside a moment, a pencil by the emoji lets Matt pick
  another one; the title keeps its words; the picked emoji stays even if the
  title is edited later, and it is what the day row, the board and the recap
  show. (The settling condition is the agent's draft.)

  **Built 2026-10-18:** a pencil on the emoji in the moment opens a picker:
  type a word the gallery knows or an emoji from the keyboard, or tap one of
  a dozen favourites. A picked emoji stays through title edits; "Back to the
  title's own" lets the title steer it again.

- **I33 — Each day has a day summary that folds at the top: one place for
  long notes and musings, with day-level extras such as what was spent,
  miles and steps.** *(2026-10-18)* Matt: *"I want a day summary section
  [...] if I want to summarize the day, let's say I can hit the plus sign,
  my thoughts on the day, and then what that will do is it'll create a
  collapsible section that has like daily summary on it, and it has just my
  long notes and musing. So it's a little different than the notes moment,
  which captures an individual story [...] maybe it's always on there, kind
  of like how on the main page, the about the trip, is always there [...]
  there is a daily summary that you can collapse at the top, and I don't
  want it to take up too much space because this is really about the
  photos, but if you do want to just have one musing about the day, you can
  do that out of there. And if you really want to add another element, maybe
  you can add to the daily summary, like if you want to add the budget you
  spent for that day, the total amount you spent, or at least when you add
  that it will automatically tally up all of the money that you had in those
  moments [...] maybe you can log your miles and steps for the day at that
  level."* Asked whether he wants it: *"Yes, it is a feature that I want. I
  think I use the term maybe because I'm not sure how it's going to look on
  the page, whether I want it at the top. I know I want it. I just don't
  know exactly the layout that it's going to be. So I want you to use what I
  said as that basis to incorporate it. And then what I can do is I can
  change it if I don't like it."*

  **Settles when:** every day has a Day summary fold at the top, closed by
  default and one line tall when closed; open, it holds a long note, the
  day's spend added up from its moments, and miles or steps if Matt adds
  them; Matt has seen the layout and either kept it or said what to change.
  (The settling condition is the agent's draft.)

  **Built 2026-10-18**, the layout the agent's: the fold sits under the city
  and weather, always there; closed, its line shows the first words of the
  note, the spend and any miles or steps; open, a note box, "Spent today"
  (only when a moment has a price), and "Add to the summary" for Miles and
  Steps. A sent day carries its summary. Tallies are not yet in the recap.

  *Added 2026-10-18*, after seeing it on the phone: *"the daily summary
  looks good. I don't want the spent today to be the like default that's
  there. I think just the day summary box is fine [...] you can write as
  much as you need to in the box itself. I just don't want it to impact the
  collapsible section. I don't think it just needs to be a preview that
  something was written there [...] put the spent today as add to the
  summary, like it should be one of the features that you can add to it, as
  an option."* **Changed the same day:** Spent today is now an item under
  Add to the summary, with the sum added up once it is there; the closed
  line says "a note" when something is written, instead of quoting it, then
  the spend, miles or steps that were added. The note itself has no limit
  Matt will meet (20,000 characters). The reading of "preview" as a marker
  rather than an excerpt is the agent's.

  *Added 2026-10-18*, on that marker: *"next to it, it just says a note. I
  don't like that [...] I would just say remove that [...] I like when I do
  have like two statements or something like that."* **Changed the same
  day:** the closed line no longer says "a note"; it shows only the counts
  and sums that were added (I statements, Spent today, Miles, Steps).

- **I34 — Mindfulness moments: I-statements Matt can add to a moment, as a
  moment of their own on the day, or to the day summary.** *(2026-10-18)*
  Matt: *"I would like this almost as any add item, a mindfulness option.
  Let's call them mindfulness moments. And so when you add a mindfulness
  moment, it's going to have like I statements. I want it to have a few
  different prompts, and we can work those out together. It should have like
  'I was surprised' or 'I felt', 'I reflected', 'I learned'. I think you
  should be able to add those mindfulness moments to not just a moment
  itself, but at the daily summary level too [...] let's figure out how many
  we can fit in there, and how that will work. So we're gonna add the
  mindfulness moment. Then you can select from the I statements or add your
  own I statement, and then go from there."* Shown the draft: *"Yeah, that
  seems right. I also want mindful moments to be their own moment you can
  add to the timeline if you want to, or to the day if you want to. And just
  like the notes, they're a little different, but these have a very specific
  call out to it."*

  *Added 2026-10-18*, in the same breath, and it reaches Note moments too:
  *"when I do add a note, instead of it being an emoji, if somebody writes
  the content for a note, can it just be the text that they input from the
  note itself, or the mindfulness note itself, just so that way it has a
  little bit of text in that bubble, like a little preview of what the
  mindfulness actually was, since there's not really a photo associated with
  it. But you can put a photo if you really wanted to, since it works
  similarly to the other moments that you add."*

  **Settles when:** Mindfulness is a kind of moment with a list of prompts
  to pick from plus "your own"; the same I-statements can be added inside
  any moment and under Add to the summary on a day; a Note or Mindfulness
  tile with no picture shows its words instead of an emoji; and the prompt
  list and any limit on how many are Matt's, worked out with him. (The
  settling condition is the agent's draft; the prompts are not yet decided.)

  **Built 2026-10-18**, after the Decision of that date: Mindfulness is the
  eighth kind (💭); its moment opens on prompt chips, each picked prompt
  becomes a row to finish, Your own is a free row; the same rows come to any
  moment through Add a detail → I statement; Add to the summary →
  Mindfulness makes the moment and opens it; the day summary lists every
  statement on the day as prompt and dots, naming the moment when it is not
  a Mindfulness one, and each opens its moment. A Note or Mindfulness tile
  with no picture shows its words, with the emoji as a small badge. A
  statement stands in for the note line on the recap's day cards.

- **I35 — Done floats in the bottom corner of a moment, like the +.**
  *(2026-10-18)* Matt: *"I'd like the done button, when I'm filling out
  the memories, to follow much like how the plus sign follows in the bottom
  corner. I want to be able to exit out of the item without having to scroll
  all the way down to the bottom. I want that done to be kind of fixed to
  that bottom right corner, similarly to the plus sign."*

  **Settles when:** Done sits fixed at the bottom right of every moment,
  visible wherever Matt has scrolled, and one tap takes him back to the day
  with everything saved. (The settling condition is the agent's draft.)

  **Built 2026-10-18:** Done is a floating button in the + position; Delete
  this moment stays at the end of the form.

- **I36 — A trip can have a picture of its own, shown on the Trips screen
  before any day has one.** *(2026-10-19)* Matt, with a screenshot of the
  Trips screen showing the Mediterranean Cruise as a plain red tile six days
  out: *"I'd [like] the ability to add a photo to a trip so it appears on
  the Home Screen without adding a photo on a day. That way it can be used
  in advance and the screen isn't a default swash."*

  **Settles when:** About this trip has a Trip picture that Matt can choose,
  replace or remove; it fronts the trip's tile on the Trips screen and the
  recap cover whether or not any day has a picture; day pictures never push
  it out. (The settling condition is the agent's draft; "Home Screen" read
  as the Trips screen.)

  **Built 2026-10-19:** Trip picture is the first row of About this trip:
  Choose a picture, then a thumbnail with Replace and Remove. It is a photo
  with no moment behind it, so it is left out of the picture counts, the
  recap's day pictures and Send this day, and it travels in a backup. Remove
  hands the tile back to the first day picture, if there is one.

- **I37 — The app takes the Dark Room kit's 20 October additions for a
  fresh coat of paint and more visual variety.** *(2026-10-20)* Matt: *"the
  darkroom style design that I have incorporated into this project just
  received some updates. I think it'd be nice to try and incorporate them
  into the design that we already have currently. That way it has like a
  little bit of a fresh coat of paint based on some of the feedback I had
  [...] give the app a little more visual variety given the expansion of the
  design kit."* On the kit's rule that restyles happen on a
  `ui-refresh/<app>` branch: *"the dark room was implemented from the start
  on this project. So the stuff about the separate branch was mostly
  intended for projects that I designed dark room after they're created
  [...] since it's already kind of built in to it, you can make these
  updates and add these kind of cosmetic changes to your main thread."*

  **Settles when:** the app carries the kit's 20 October files and uses the
  new pieces where they fit (sleeves, plum, tints, the lamp and the three
  shadows), without changing what any control does, and Matt has seen it
  and kept it or said what to change. (The settling condition is the
  agent's draft.)

  **Built 2026-10-21**, the placement the agent's: the two kit files
  refreshed, so every panel is lit from the top-left lamp and sits on the
  three named shadows; a trip with no picture wears a tangerine or gold
  sleeve on the Trips screen instead of the red type tile; the recap's head
  (cover, title, the one loud line) sits on the plum field with peach text,
  the app's one hero section; the recap's number tiles cycle the five
  sleeves; Mindfulness wears rose, on its tiles, its kind button and the day
  summary's statement links; Spent today is a peach hint. Boards keep their
  colour per kind, since six kinds on one screen would break the two-sleeve
  rule. The PDF and day-card drawings are unchanged.

- **I38 — Tap a moment's picture to see it on its own, unobstructed, then
  come back.** *(2026-10-26)* Matt: *"Let's make it so a person can tap on
  the image and view it as a standalone image - unobstructed - and then be
  able to return to the memory/screen."*

  **Settles when:** a tap on the picture in a moment shows it alone, full
  screen with nothing over it, and a tap, the × or the phone's Back returns
  to the same moment with nothing lost. (The settling condition is the
  agent's draft.)

  **Built 2026-10-26:** the picture fills a black screen with one × in the
  corner; a tap anywhere, the ×, Escape or Back closes it. Back works
  because opening the viewer adds one step to the phone's history, so Back
  closes the picture rather than leaving the moment. Reframe still takes
  its own tap first.

## Decisions

Dated, append-only. Each says what was chosen, the alternative, why, who
decided, where it is enforced, and what it **serves**.

- **2026-10-17 — This project started from a portion of Starter Dough
  (commit `8f695d9`, standard version 5).** Matt pitched the app in a session
  opened inside `D:\Starter Dough`. Alternative: build it there. Why: the
  kit's own rule is that a project takes a portion into its own folder.
  Enforced: this folder; `README-STANDARD.md` and `CLAUDE.md`, copied from
  the kit's commit `8f695d9`. **Serves →** Goal.

- **2026-10-17 — The name and folder are `Moments That Matter`.** Matt:
  *"we'll call it moments that matter. Because it has my name in it, I
  guess."* Alternative: none was offered; the name is Matt's. The
  capitalisation and the folder's place, `D:\Moments That Matter` beside his
  other projects, are the agent's. **Serves →** Goal.

- **2026-10-17 — The first version is a solo app; sharing happens through
  an exported file, not live sync.** Chosen: one person's trip on one phone,
  with export for sharing; a shared file others can import may come later.
  Alternative: a cloud-shared trip others add to in real time (I2 as first
  pitched). Why it lost, in Matt's words: *"let's just start with that
  prototype. [...] we're gonna start at the base level of what we can
  functionally do as I learn what the [...] interface and the [...] UI really
  is gonna play a big part of it"*; *"they don't need to update in real time
  together"*; *"I don't think they need to sync with each other uh, at the
  start."* Enforced: this entry and the Not now entry below; in the first
  build, no accounts and no server-side sharing (the agent's reading of
  "solo"). **Serves →** I1, and I2 by sequencing it after.

- **2026-10-17 — The app is a web app added to the iPhone home screen.**
  Chosen: HTML and JavaScript, installed from a web address, opened
  full-screen outside the browser, with trips and photos stored on the
  phone. Alternatives: a native Swift app (needs a Mac, Xcode and an Apple
  developer account; Matt builds on Windows) and a cross-platform app such
  as Expo (more setup, and installing it for real still goes through Apple).
  Matt, shown the three with costs and the agent's recommendation: *"I want
  it to really just just work functionally"*, and after hearing how storage
  works, *"Yeah, that's what I'm thinking."* Matt wants Expo kept in mind
  for later apps: *"I want to do that eventually with just general um, like
  other application ideas that I have."* Matt uses Chrome on the phone, not
  Safari; on iPhone both run on WebKit and both can add a web app to the home
  screen, so the build targets WebKit, not a browser. Enforced: the app's
  manifest opens it standalone; the first build is checked on Matt's phone
  from Chrome. **Serves →** Goal.

- **2026-10-17 — Backup is one tap, and the app reminds Matt when enough
  new content has piled up since the last backup.** Chosen: a one-tap save
  of the trip as a file to whatever drive he picks, plus a reminder when the
  unbacked-up content crosses a threshold. Alternative: backing up on its
  own with no tap, which on a web app means signing in to Google Drive and
  rules out iCloud. Matt: *"one tap is fine. I just wanted to really make
  sure it knows that you didn't, you like, you haven't backed up it at least
  like since you've added a bunch of stuff. Like, I mean, I don't want it to
  constantly be doing like every day, but like if there is like maybe
  substantial new content added that you might want to consider backing it
  up, like maybe when it reaches a certain, I don't know, like, you know,
  kill, like byte threshold or something like that."* The threshold itself
  is not decided; "byte threshold" was tentative. Enforced: the backup
  button and reminder in the app, once built. **Serves →** I3.

- **2026-10-17 — Blocks are a short set of built-in kinds with their own
  fields, plus "anything else" as any emoji with simple fields; no field is
  mandatory.** Chosen: built-in kinds (the list and their fields are the next
  Decision) that ask for what fits them, and under them an open block where
  Matt picks any emoji and gets a name, photo, note and price. Alternatives:
  built-in kinds only (can't log what has no kind) or any-emoji only (a plane
  doesn't know it's a plane, so no seat field). Matt: *"I agree that the
  combination, the both [...] there's going to be some very specific things
  that [...] I don't want to have to have a template for. And um, and
  sometimes, like, having a template can be very restrictive as well, almost
  as much as a blank page, where it's like, well, it's hard to fit it in this
  box. And so it's, you know, nothing is really mandatory."* Enforced: the
  block-kind list in the app's code once built; no required fields on any
  block form. **Serves →** I4, and the Goal's "never faces a blank page".

- **2026-10-17 — Adding a block starts with the built-in kinds as buttons
  and a type-anything box; a typed word becomes an emoji block if one
  matches, else a word block.** Chosen: on a board, tapping add shows the
  built-in kinds, and below them a box; typing shows suggestions from a word
  list kept on the phone; tapping one drops the block on the board with its
  details left to fill in later. Alternative: an emoji keyboard picker alone
  (no words, nothing for what has no emoji), or words alone (loses the icons
  Matt looks for). Matt's design: *"a little box where you can start typing
  a word and it auto-populates and I can just tap that word to add it as an
  item [...] either add it as an emoji if it exists, or just the word if it
  doesn't exist as an emoji"*; shown the flow on his Sydney morning: *"Yeah,
  now we're getting there."* Enforced: the add flow and the word list in the
  app, once built. **Serves →** I4, I5, and the Goal's "a few taps".

- **2026-10-17 — A board shows its blocks in time order, draggable to
  reorder, as tiles; a list view is one tap away.** Chosen: blocks sit in
  the order of the day and Matt can drag one to move it; the board can be
  switched between a tile view and a plain list, like a computer folder.
  Alternative: blocks float anywhere, like magnets on a fridge. Matt: *"as
  much as like being like being able to float everywhere is, is fine, I feel
  like you can just get messy. And so there needs to be some sort of
  organization around it. And um, I think the the draggable and
  chronological is good. Um, I also think there should just be a list view if
  you really want one [...] in case you have like a lot of icons in there on
  each day [...] kind of like the tile view versus the the list view in a in
  a web you know folder. Or computer folder."* The magnet look (colourful,
  fun) stays as the styling of the tiles. Enforced: the board view in the
  app, once built. **Serves →** I4.

- **2026-10-17 — Photos come into the app from the photo library; the
  first version does not use the camera.** Chosen: take pictures with the
  phone's camera as usual, add them to blocks later. Alternative: taking
  photos from inside the app, which on a web app also loses the photo's
  location. Matt: *"I don't imagine us taking photos using the application.
  I imagine just importing photos into the application would be the easiest
  way [...] I think you would just take your pictures and then just add them
  later. But I can always I can always that that can change. It's not it's
  not off the off the table."* Enforced: no camera capture in the first
  build; the photo field opens the library. **Serves →** I6, and the Goal.

- **2026-10-17 — The first version has seven built-in kinds; weather sits
  on the board; everything else comes through the gallery.** Chosen, every
  block having a photo, title, note and cost, none required:

  | Kind | Asks beyond the basics |
  |---|---|
  | ✈️ Travel | how (plane, boat, train, car, bike), company, from and to, seat or number |
  | 🍽️ Food & drink | where |
  | 🚴 Activity | where, how long |
  | 📍 Place | how long |
  | 👋 People | names, where from, contact, what they recommended |
  | 🏨 Stay | nights, so it carries across days |
  | 📝 Note | nothing more |

  Weather is one tap at the top of a board. Anything else (art, museum,
  beach, shopping, a show) is a gallery or typed word, promoted to a kind
  later if it turns out to need its own fields. Alternatives: a longer list
  (more buttons to scan past; the gallery covers the long tail), or no Note
  kind (but the pitch says "write a name down, jog a note"). Matt, asked for
  the set drawn from his Sydney day plus Note: *"let's just let's start with
  those seven kinds. I don't think anything has changed since my last
  ramble."* The emoji for each kind and the field names are the agent's.
  Enforced: the kind list in the app's code once built. **Serves →** I4, and
  the Goal.

- **2026-10-17 — A block's date is its day's date; time, cost and how long
  are optional details added from a list, not fields on every card.**
  Chosen: When no longer asks for a date, since the day already says it;
  time is an extra Matt can add; cost and how long come off the default
  card and into an "Add a detail" list on the card. Alternative: the first
  build's card, with When, Cost and How long on every block. Matt, on his
  first look at the build: *"the when should be pretty obvious based on the
  start date that you pick for your tour [...] I also don't know if I want
  time um, specifically because it just adds a lot of extra cumbersome. I
  think it should be an option to add the time, but I don't think it's 100%
  necessary"*; *"Cost on everything just feels very superficial [...] maybe
  there is just like a drop-down list of all these of these things that you
  can add, like that would be on those cards"*; *"I don't know if I'd want
  the how long for activities"*. The agent's reading, to be confirmed:
  picture, title, Where and Note stay on every card; a kind's own fields
  (airline and seat, names, nights) stay on its card; Time, Cost and How long
  move to the list. Confirmed by Matt the same evening, asked outright:
  *"Yes, I think it should have those four as the default."* Enforced: the
  editor in `app/js/app.js`. **Serves →**
  the Goal's "a few taps", and I4.

- **2026-10-17 — The app is served from GitHub Pages.** Chosen: the app's
  code lives in a public GitHub repository and Pages serves it over https,
  so the iPhone can add it to the home screen; trips never leave the phone.
  Alternatives: Netlify or Cloudflare Pages (same result, more moving parts),
  or serving from the PC over home Wi-Fi (no https, no offline, no reach
  away from home). Matt, shown the three with costs: *"Yeah, I think option
  one is the best. We can do GitHub pages."* Matt creates the account and
  repository himself; the agent pushes and wires the deploy. Enforced: the
  git remote and the Pages deploy workflow, once added (see Runbook).
  **Serves →** Goal ("use on his iPhone"), and the three Open items.

- **2026-10-17 — Place names can be looked up from coordinates with an
  online service, as an option; nothing is sent unless Matt asks.** Chosen:
  a "Look up the name" button beside a block's coordinates asks
  OpenStreetMap's Nominatim service for a name and fills Where, editable;
  a switch on the Trips screen, "Look up place names automatically when
  online", does the same without the tap and starts **off**. Alternative:
  no lookup, names typed by hand (what he had). Matt: *"allow it to look it
  up using an online service if um, you know, if the user wants to. The
  user doesn't have to. Um, so it should be an option."* The agent's
  choices, not Matt's words: the service (OpenStreetMap, free, no account,
  asks for light use), the switch starting off, and the button being there
  regardless of the switch. Enforced: the lookup in `app/js/app.js`; the
  switch is stored on the phone. **Serves →** I6, I7.

- **2026-10-17 — An item on several days shares one name and place;
  renaming one renames them all.** Chosen: name, place and the kind's own
  fields travel together across an item's days; picture, note, added
  details and order belong to each day. Alternative: each day's copy stands
  alone once made. Matt: *"I think you should be able to name them all
  [...] I don't want like if I spell something wrong, I don't want to have
  to change it on like five different things. So um, I imagine it should
  rename all of them."* He floated, tentatively, an unlink: *"Maybe you can
  uncheck it or something, and then it will make them individual [...] but I
  don't see why."* Not built; noted here, not as a rule. Enforced: the copies
  share a group id and saving one writes the shared fields to the others
  (`syncFamily` in `app/js/app.js`). **Serves →** I12.

- **2026-10-17 — The first recap is one long scroll (cover, stats with
  pictures, the trip's emojis, then day by day), exported as a PDF made of
  pictures of those bands.** Chosen: a Recap button on the trip page opens
  the scroll; "Save as PDF" draws each band to an image and wraps the images
  into a PDF on the phone, and the same images can go to the share sheet.
  Stats show only when there is something to count. Alternatives: a text
  PDF (needs emoji fonts; skipped), a slide-book layout (Not now). Matt,
  shown the shape with costs: *"Yeah, that does. Let's let's go for it."*
  The stat list beyond his three (spent on food, people met, places eaten
  at) is the agent's, to keep or strike. Enforced: `app/js/recap.js`.
  **Serves →** I13, and the Goal's "export a summary of the trip".

- **2026-10-17 — Costs are plain numbers shown with a dollar sign; the
  recap rounds them to whole dollars.** Chosen: the Cost field carries a
  fixed "$" in front, and stats read "$35". Alternative: no symbol, as in
  the first build. Matt: *"when adding cost be nice if like it just showed
  the dollar sign already in front of it [...] 35 spent on food. It doesn't
  say dollars. It just says 35. Um, I wonder, it just, just round to the
  whole as well."* The symbol is a label, not a currency conversion; a trip
  in another currency still shows "$" (the agent's simplification). Enforced:
  the Cost field and `stats()` in `app/js/recap.js`. **Serves →** I13.

- **2026-10-17 — Next in order: offload a past trip (I3), then place
  levels (I7), then words instead of emojis (I5).** Chosen from three the
  agent laid out with costs. Matt: *"let's go in the order you're
  recommending right there. One, then two. And then we'll look at three."*
  Enforced: this list; each lands as its own entry when built. **Serves →**
  I3, I7, I5.

- **2026-10-17 — The backup reminder shows after 10 changes since the last
  backup.** Chosen: the placeholder from the first build stays, 10 changes
  or 8 MB of new pictures, whichever first. Alternative: a larger or
  size-only threshold. Matt: *"I think the backup threshold after 10 changes
  is, is a good good limit to start here uh, for a backup."* The 8 MB half
  is the agent's, kept as a safety net for picture-heavy days. Enforced:
  `BACKUP_DUE` in `app/js/app.js`. **Serves →** I3.

- **2026-10-17 — The detail list grows, and gains "Your own", a detail
  Matt names himself.** Chosen: ready-made details (Time, Cost, How long,
  Website, Menu, plus Steps, Distance, Room, Confirmation number, Rating)
  and "Your own" with a label and a value. Alternative: the five-item list.
  Matt: *"starting off with the detail list and being able to to do those is
  is great. Um the your own is is a good good feature."* The added
  ready-made names are the agent's. Trip-level details and the packing list
  (I18) follow when Matt wants them: *"a lot of these I'm going to be
  thinking of as as I, you know, as I need them."* Enforced: `DETAILS` and
  the custom details in `app/js/app.js`. **Serves →** I17.

- **2026-10-17 — A day has up to four key pictures, chosen in tap order;
  the cards show those first, and four is the limit.** Chosen: on a block
  with a picture, "Make this key picture n of 4" adds it to the day's key
  pictures in the order tapped; tapping again removes it; the day row, the
  one-day picture and the recap use key pictures first, then fill to four
  in day order. Alternative: one key picture and the rest by day order
  (the first build), or no cap. Matt: *"you have a key one, key two, key
  three, key four, and you just can mix in, you can mix them and, and match
  them in that kind of order if you want them to show up in a specific
  order [...] I'd rather just keep it like a four limit for the day. That's
  just kind of what it is. It's made on your phone [...] this isn't a, a
  photo dump app."* Enforced: `day.keyPhotos` in `app/js/app.js` and the
  card drawing in `app/js/recap.js`. **Serves →** I10, I19, and the Do not.

- **2026-10-17 — Pass the notebook: one person writes at a time; a passed
  trip is read-only until it comes back, and its return replaces it.**
  Chosen: "Pass the notebook" on the trip page backs the trip up, opens
  the share sheet with a short note (Messages among the choices), and marks
  the trip passed on; while passed, the trip cannot be edited here; "Take
  it back" undoes that; importing a file of a passed trip replaces it
  rather than adding a copy. Alternatives: a plain backup sent by text (two
  diverging copies), or live sync (Not now). Matt: *"I like that. I think
  that's a fun feature. Let's incorporate it."* The receiving side stays
  three taps (save the attachment to Files, open the app, Import), since a
  home-screen web app cannot receive files from Messages directly.
  Enforced: `passNotebook`, the read-only guards and `importTrip` in
  `app/js/app.js`. **Serves →** I23, I2.

- **2026-10-17 — One "Settings & help" screen, from a gear on the Trips
  page: How it works in short paragraphs, the settings, and a profile that
  is just a name.** Chosen: the explanations live in the app, in its own
  voice, with back up, archive and pass the notebook explained together;
  the place-name switch, storage gauge, version, update check and saved
  packing list move there from the foot of Trips; the name signs the
  pass-the-notebook note and the recap cover. Alternative: a fuller profile
  (picture, home city), held until something needs it. Matt, asked whether
  a name is enough for now: *"Yeah, I think that's good. Let's proceed."*
  Enforced: `settingsPage` in `app/js/app.js`. **Serves →** I24, I23, I13.

- **2026-10-18 — A day can be sent on its own and added to another trip,
  into the day with the same date or as a new day; the receiver keeps or
  removes what arrives.** Chosen: "Send this day" in the day menu packs
  the day, its moments and pictures into a file for the share sheet;
  Import a trip recognises it, asks which trip, then adds the moments to
  the same-dated day (skipping any already there from an earlier send) or
  appends a new day. Alternative: merging whole trips (I2), which Matt now
  sees as the rarer need. Matt: *"I think that's that's better [...] I
  think that would be a rarer occasion being used uh, other than somebody
  just having a day logged better than another person does and just being
  like, okay, well, let me just add my events to yours. And send you the
  day, basically. Um, and you can add those elements and remove the ones
  that you don't want."* Enforced: `sendDay` and `importDay` in
  `app/js/app.js`. **Serves →** I25, I2.

- **2026-10-18 — Pass the notebook is cut; Send this day and Back up
  cover sharing.** Chosen: remove the pass button, the read-only state,
  Take it back and the replace-on-return import rule, built the day before
  (I23); two people log in parallel and exchange days. Alternative: keep
  it with a longer explanation. Matt: *"with send the day, somebody can
  just make their own parallel trip and then just [...] send [...] they can
  compare and contrast and be like, okay, yours is better here. Just add
  add these days to yours, basically [...] just cut it then."* A trip that
  was passed on before this version simply becomes editable again.
  Enforced: the code is gone from `app/js/app.js`; the Decision of
  2026-10-17 on Pass the notebook is superseded. **Serves →** the Goal's
  "a few taps", and I25.

- **2026-10-18 — Mindfulness: seven prompts, and the day summary lists the
  day's Mindfulness moments rather than keeping its own.** Chosen: a
  Mindfulness kind of moment (💭) with the prompts I was surprised, I felt,
  I reflected, I learned, I noticed, I'm grateful for, and Your own, no cap
  on how many statements; "Add to the summary → Mindfulness" creates that
  moment on the day and opens it; the day summary shows each one as its
  prompt and three dots, and tapping it opens the moment; one made from +
  appears there the same way. Alternative: statements stored on the day
  itself, separate from the board, which lost the link between the two and
  could hold the same thought twice. Matt: *"if you do that, it
  automatically creates the moment for you. And it takes you to that moment
  [...] under the summary it will just put the like, 'I was surprised' and
  then maybe three dots, and if you click on that from the summary it will
  take you to the moment within the day that was created alongside it, and
  then vice versa, if you create it from the little plus it'll just
  automatically add it to the daily summary."* On the prompt list (his four
  plus the agent's I noticed, I'm grateful for, Your own): *"Yes, I like
  that."* One part is the agent's: an I-statement added inside some other
  moment, such as a Cruise, is listed in the day summary too, as its prompt
  and dots, naming the moment it sits in. Enforced: the Mindfulness kind in
  `app/js/words.js`; the statements and the summary list in
  `app/js/app.js`. **Serves →** I34.

- **2026-10-18 — Chips are rounded tiles, not pills.** Chosen: the text
  chips (the I-statement prompts, Travel's How, the Also on days), the
  gallery words and the name chips take the covers' 14px corners
  (`--radius-md`); the weather discs and the kit's own buttons (Recap, Back
  up, Done) keep their shape. Alternative: keep the Dark Room brief's rule
  as written, *"Circles are the shape. Buttons and magnets are
  radius-pill"*, which is where the pills came from, not from an inference.
  Matt: *"the start with are like oval shape elongated circles which I feel
  like doesn't necessarily fit with the theme [...] everything kind of is
  tiles and nothing's really circles in that shape in this app."* Shown the
  tiles: *"Looks good, keep the tiles."* Enforced: `.mtm-chip--text`, `.mtm-word`,
  `.mtm-person` in `app/css/app.css`. **Serves →** I26 (the look) and the
  Goal's quick capture, nothing more than taste.

- **2026-10-18 — Reframing a picture takes a Reframe button first.**
  Chosen: the picture in the editor ignores taps until Reframe is pressed;
  the ring that marks the kept spot has crosshairs and a "Kept in frame"
  label at all times; in reframe mode the frame and ring turn signal red,
  the hint reads "Tap the picture where it matters most", and the tap sets
  the point and ends the mode. Alternatives: press and hold on the picture
  (nothing on screen says it is there), or a clearer marker alone (the
  accidental taps would continue). Matt: *"I accidentally tap the crop
  button by accident when I'm just scrolling through [...] either activate
  that feature so it doesn't happen by accident, or just make it very clear
  [...] it's not very clear from just it being a little white circle"*,
  then *"Go with the Reframe button."* Enforced: `#reframe` and
  `.is-reframing` in `app/js/app.js` and `app/css/app.css`. **Serves →**
  I28.

**Open decisions — waiting on Matt, oldest first:**

- *2026-10-17* — **What "Import a trip" means and where it lives.** Today
  it reads a backup file this app made. Matt: *"I guess we got to figure out
  what the import a trip is going to look like and, and what that
  necessarily means [...] I guess I'm just importing like an exported file
  from this."* Tied to I2 and I3.

## Not now

- **Adding a person met to the phone's contacts.** Deferred 2026-10-17.
  Matt: *"maybe you can even add them to your contacts. Who knows? [...] but
  that's that's a later kind of thing."* Trigger: Matt asks, after People
  blocks have been used on a trip.
- **Choosing what the recap pictures include, or fewer pages by option.**
  Deferred 2026-10-17. Matt: *"it'd be nice if it could either be maybe
  like less pages [...] or give you the option."* The first fix packs
  several days onto a page; an option waits. Trigger: Matt asks after
  seeing the packed pages on a fuller trip.

- **Slide-book and separate long-scroll layouts for the recap.** Deferred
  2026-10-17. Reason: Matt: *"we can play around with like a couple of these
  first"*; the first recap is one long scroll. Trigger: once Matt has used
  the first recap on a real trip and asks.

- **Blocks inside blocks (the boat lunch with its food nested in it).**
  Deferred 2026-10-17. Reason: the agent proposed logging such things as
  two blocks side by side first and building nesting in a later pass, and
  Matt accepted the proposal's set without objecting; this deferral is the
  agent's, not Matt's words. Trigger: once Matt has used the flat board on a
  real day and says he misses it.

- **Live multi-person sync (I2 as first pitched).** Deferred 2026-10-17.
  Reason, Matt: *"they don't need to update in real time together."*
  Trigger: not until the solo version has been used on a real trip and Matt
  says it is time. (The trigger is the agent's draft; Matt declares when it
  has fired.)

## Open items

- **First run on Matt's phone.** Done when Matt opens the app from a
  home-screen icon added through Chrome on his iPhone, adds a block with a
  picture from his own photo library, and the block shows that picture's
  place and time without him typing them. *(2026-10-17)* **Done
  2026-10-17:** installed through Chrome, a library picture filled in time
  and coordinates (see Findings).
- **Backup round trip on the phone.** Done when a backup made on the iPhone
  is saved through the share sheet to Files and imports back as a copy with
  its pictures showing. *(2026-10-17)* **Done 2026-10-17**, by way of
  Archive: Matt: *"I did try the archive and everything. It all worked.
  Everything repopulated relatively easily."*
- **Drag on touch.** Done when Matt holds a tile on the iPhone, drags it to
  a new spot, and the new order is still there after the app is closed and
  reopened. *(2026-10-17)* **Done 2026-10-17**, Matt: *"when I open uh, and my
  phone and I, I, I drag a photo or a tile to a new spot, it does survive
  closing. So that looks good."*

## Do not

- **Do not let it become a photo dump.** *Drafted 2026-10-17 by the agent
  from Matt's words; not yet confirmed.* Matt: *"one of the things I used to
  love to do was make like little music videos with my like little travel
  experiences, and they'd be montages basically of all the different things I
  did throughout the day, and it wouldn't be like every photo and every video
  that I took. It'd just be like highlights [...] that's why I'm saying the
  moments that matter, because it's like, you know, I want to be very
  targeted. I want it to be something that is um, again, it really like, jogs
  your jogs your memory and and it's not supposed to be just a photo dump of
  every single thing."*

---

## Limits, as built (2026-10-17)

Measured from the code, so the next reader knows the edges before Matt
hits them. Matt asked: *"I'd rather set the limits, you know, and know the
limits before I break them."*

| Thing | Limit | Where |
|---|---|---|
| Days in a trip | 120 on the stepper; "Add a day at the end" has no cap | `newTrip`, `tripPage` |
| Moments on a day | none; the board scrolls | `board` |
| Pictures on a moment | one | `attachPhoto` |
| Picture size kept | longest side 1600 px, JPEG quality 0.82, roughly 150–400 KB each | `shrink` |
| Day row snapshot | 8 emojis, then "+n" | `tripPage` |
| Day summary note | 20,000 characters; the closed line only says "a note" | `cleanNotes`, `daySummary` |
| Miles, Steps on a day | 20 characters each | `cleanLog` |
| I statements on a moment | 50, each 2,000 characters; a prompt 40 | `cleanMind` |
| Emoji picker | 14 favourites, then 12 gallery matches as you type | `pickEmoji` |
| Words on a tile without a picture | 6 lines, then cut | `.mtm-block__emoji--text` |
| Recap day band on screen | 4 pictures (key photo first), 10 titles then "+n" | `renderRecap` |
| Recap PDF day band | 4 pictures, 6 titles then "+n" | `drawPages` |
| Key pictures on a day | 4, in tap order; the cards draw them first | `KEY_MAX` |
| One-day picture | 4 pictures (key pictures first), 6 titles then "+n", one note line each | `drawDayCard` |
| Day file | one day, its moments and pictures; joins the same-dated day or becomes a new last day; repeats are skipped by id | `sendDay`, `importDay` |
| Backup file | the whole trip in one JSON with pictures inside, about 1.35× the picture bytes; built in memory, so very large trips (thousands of pictures) may strain the phone | `backupTrip` |
| Backup reminder | 10 changes or 8 MB since the last backup | `BACKUP_DUE` |
| Gallery words | about 300 | `words.js` |
| Storage on the phone | the browser's quota for the app; the Trips screen shows what is used | `storageLine` |

## Findings

- **2026-10-26 — Reframing broke the picture on the iPhone.** Matt: *"When
  I reframe a picture - it disappears. I just see a '?' in the memory."*
  Reframe wrote the photo record back with the same Blob it had read from
  IndexedDB. On Safari a Blob read from IndexedDB and stored again can come
  back unreadable, and the picture's object URL breaks with it (WebKit bug
  158991 describes the same symptom; the desktop preview never shows it).
  Fix, version 47: Reframe reads the picture's bytes into memory, stores a
  new Blob made from them, and points the picture on screen at that copy;
  if the bytes cannot be read, nothing is written and a toast says so. The
  one other place that wrote a stored picture back was this one; every
  other write stores a picture that was just made. Whether pictures already
  reframed on the phone are recoverable is unknown until Matt reopens one:
  if the moment shows it again, only the on-screen URL had broken.

Dated, append-only. What was learned, in the order it was learned.

- **2026-10-18 — Another agent read this project as a UI reference.**
  Matt: another AI agent on a different project *"use[d] our journal
  design as a reference for the UI and and concept [...] they didn't change
  anything."* Checked the same day: working trees clean, no stray files, no
  extra branches or stashes, remote matches local. Nothing to undo.

- **2026-10-18 — "As entered" goes.** Matt, on the recap's money lines:
  *"it's just kind of a weird phrase there [...] spent in total [...] spent
  on food and drinks and like I don't think we need the as entered thing
  [...] it's going to be up to the person to just infer that."* Changed the
  same day.

- **2026-10-18 — The help text read like work.** Matt: *"let's change it
  from how it works to like user guide [...] This this app should be fun
  [...] all of that stuff kind of sounds like work. So I want it to feel
  like something that like something gets you excited to use it [...] I
  don't want all of those to take up that [...] Keeps the trip here. Do that
  whenever the reminder shows. I don't. I don't think it needs the
  instructions [...] let's try and simplify it a little bit."* Rewritten
  the same day: "User guide", one or two warm lines each, the backup trio
  kept side by side without instructions.

- **2026-10-17 — Code review of the day's work** (the agent's /code-review
  at high effort, ten findings, all fixed the same day, version 25): a
  backup file's emoji, weather and ids were rendered as raw HTML, so a
  crafted file from someone else could have run script inside the app
  (import now keeps ids id-shaped and glyphs tag-free, and glyphs are
  escaped on render); replacing a picture left a dead id in the day's key
  list and the trip cover (slots now carry over); screens had no render
  token, so a slow screen could paint over a newer one (each render now
  has a number and stale ones stop); a new service worker reloaded the
  page mid-edit (it now waits for the next screen change); trip-level
  details were not flushed on leaving the trip page; Google Fonts were
  never cached offline (opaque responses are now cached); moving days ran
  across many transactions (now one); the backup re-implemented the share
  path (now shares deliverFiles); helpers were duplicated between app.js and
  recap.js (now util.js); the trip page read days one at a time (now one
  read). Verified in the preview: a malicious import rendered inert, a day
  slid in cleanly, a replaced key picture kept its slot.

- **2026-10-17 — Eleventh look, planning a trip ahead.** "Travelled
  with" reads past tense for a trip not yet taken; wants a saved packing
  list he can reuse (*"if I can import a packing list uh, like already, or
  I can like save a packing list when I have it"*); wants the packing
  progress beside the countdown on the Trips page; and a pencil by the
  title to rename from the top, after skipping the name and getting stuck
  with *"Untitled trip"*. Changed the same day: "Travelling with"; a pencil
  next to the title edits it in place; "Starts in n days · 3 of 12 packed"
  on the tile; "Save this list for next time" and "Use my saved list" on the
  packing list.

- **2026-10-17 — Tenth look.** The chevron after "About this trip" sat
  *"almost overlapping with the P on uh, trip"*; given room the same day.
  Asked for a countdown (I22).

- **2026-10-17 — Back up versus archive.** Matt: *"What's the difference
  between backup this trip and archive to a file? I feel like they're
  almost kind of do the same thing."* Settled in his words: back up is
  *"I'm not done with this, I want to keep working on it, I want to keep it
  here for a little bit and keep using it"*; archive is *"get this thing off
  my phone and, and it's going to go into the, place of record."* Same
  file, different fate for the trip. Changed the same day: the button reads
  "Archive: back up, then remove from this phone" and sits below the
  everyday buttons.

- **2026-10-17 — Ninth look, the trip page header.** *"I don't need the
  number of megabytes in this trip. That's that doesn't need to be up at
  the very top [...] The trip title, like I, I have one right now that I
  call I'm calling Australia and New Zealand, and then underneath it says
  where in the world, and then I'm going to put Australia and New Zealand
  again. So it just feels a little I don't know. Like, redundant [...] I
  wish there'd be a way that you can either like again put Australia and
  then like list the cities underneath it and then New Zealand put the
  cities underneath it [...] the top just feels a little like eh a little
  cluttered and redundant."* Changed the same day: the header is the dates
  and the title only; pictures and size moved into "About this trip"; "Where
  in the world?" became **Places** there, countries with their cities
  underneath, and a board offers those cities when you type where you were.

- **2026-10-17 — Eighth look.** The Activity prompt appeared above where
  he tapped, out of view: *"I didn't even notice I tapped activity and I
  thought just it froze, but it it's actually above it. I had to scroll
  back up."* The example placeholders are too specific: *"I appreciate the
  pre-fill examples that you gave, but they're a little they're a little too
  specific [...] it looks like it's auto-filled, and then I would just keep
  it as generic as possible."* The helper line under the prompt is not
  needed: *"they don't need to know that. They'll see it."* Changed the
  same day: the prompt opens right under the kind buttons, where the tap
  was; placeholders are generic; the helper line is gone.

- **2026-10-17 — Casing.** Matt asked whether "Food & drink" with a small
  d was a miss. It is the app's sentence case, the Dark Room copy rule.
  Matt: *"Let's just follow the rules [...] We don't need to change any
  rules for it."* He also noted his phone was slow to pick up a new
  version; a version label and "Check for an update" were added the same
  day.

- **2026-10-17 — Seventh look.** The day picture's header: *"day one
  doesn't need to be as take up so much space. I think, like, the more
  important thing is, like, the day, date, and location, and day one can be
  maybe next to the next to the uh, weather icon."* Activity: *"I use that
  the most because I do most activities [...] it always just defaults to the
  little sparkle icon [...] I think it should prompt you really to, to like
  put in the activity first and it'll give you an emoji with it. And then
  you'll have the option just to replace that with a picture."* He thought
  about moving the type-anything box above the kinds and decided against:
  *"I like it with the emojis underneath it."* Changed the same day: the
  day picture leads with the date and place, "Day n" sits by the weather;
  tapping Activity asks "What did you do?" first, the icon follows the words.

- **2026-10-17 — Sixth look: the day picture and the board, with
  screenshots.** The one-day picture: *"I have three pictures in it, and it,
  none of them are really easily viewable. So it's not a good way of kind
  of encapsulating the excitement [...] I'm not liking the utilization of
  the space. I feel like there's a lot of empty space that's not being
  used, as well as, like, it's just the layout could just be better. And
  maybe more photo-centric, I guess. But I still do want that information
  to be visible."* Likes that details show on the card, finds what shows
  *"kind of odd"*. The board tiles: *"the times, like, as metadata
  underneath, like, that's not super important [...] there's a 35 for, like,
  the cost of the food underneath it [...] It just says 35 under it [...] I
  don't think it needs to be on the day view."* Changed the same day: the
  day picture is rebuilt photo-first with the pictures filling the space
  and a note line under each title; tile captions show the place and stars,
  not time or cost.

- **2026-10-17 — Archive and import on the iPhone:** *"It all worked.
  Everything repopulated relatively easily."* The same look struck I5.

- **2026-10-17 — Fifth look, the packed recap on the iPhone.** Pages: *"two
  less from when I when I did it, but I did add a couple more photos."* The
  "most-used icon" stat goes: *"it kind of makes the default icon the most
  used [...] this was biking was f- times four"*; wanted instead something
  like total events or *"you average this many events per day"*; loved
  *"day one was your most active day"* and big numbers that *"really
  helping drive that"*. Asked for the recap to be tappable (I15). Changed
  the same day: the icon stat is replaced by moments a day on average; the
  emoji field and the day bands open their moment or day.

- **2026-10-17 — Fourth look on the iPhone, with the Recap**, while
  building a real trip: *"overall, overall, pretty successful. I, I, I like
  the changes so far."* Liked: the scroll, the PDF (*"works well"*),
  "everything you did", the weather, day by day. Asked for: a dollar sign on
  costs and whole dollars in stats (Decision); people one at a time (I14);
  a wrongly chosen picture is hard to back out of, and a picker dismissed
  with nothing selected still added the earlier picture; Activity's bike
  emoji *"makes it feel like I'm biking"*, the title should steer the emoji;
  "pictures kept" unclear; "places visited" should count every block's
  location, not just Place blocks; eleven export pictures is a lot, with
  blank space. Fixed the same day: see Current state.

- **2026-10-17 — Third look on the iPhone**, after the detail and link
  changes: *"everything else looks really good though. This is a good first
  start. Um, to this, I'm I'm enjoying it so far."* Asked for: one item on
  several days (I12).

- **2026-10-17 — Second look on the iPhone.** A library picture filled in
  the time and the coordinates (*"it did pool navigational information"*);
  "Use my location" works and also gives coordinates. Liked: *"it
  auto-saves things when I tap out, so I don't lose stuff."* Asked for: a way
  to clear or not have a time (*"What if I just don't even want the time?"*);
  the cost hint *"A$ 12"* read as a bug (*"there's always an A money next to
  the 12"*); "Title" on a word block such as "record shop" could be "Name";
  website and menu links (I11). Fixed the same day: a × on each added
  detail clears it, cost hint is a plain number, Name on place, stay and
  word blocks, Website and Menu details.

- **2026-10-17 — First run on Matt's iPhone**, from the home-screen icon
  added through Chrome, with a portrait picture from his photo library:
  *"Looks good on the phone."* The picture is cropped badly in the block
  editor's frame (*"it kind of makes them like out of the frame"*), fine in
  the day row's circle and the tile. He mostly shoots portrait and would like
  landscape to work too. Whether the picture's place and time filled in was
  not said; asked. Fix the same day: the editor frame takes the picture's
  own shape and shows all of it.

- **2026-10-17 — Matt's first look at the first build** (in the desktop
  preview). Kept: *"I like the little icons. I like that it does default to
  the picture. List looks good."* Changed by the Decision of the same date:
  When, Cost and How long on every card. Asked for: moving and inserting
  days (I8), a day's emojis on its row (I9).
