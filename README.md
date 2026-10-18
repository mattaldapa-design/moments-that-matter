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

## Current state (2026-10-17, evening)

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

The first build is published (see below) and has not been tried on Matt's
phone. What it
does: trips (start one, set its days, rename, add or remove a day, delete);
boards (a city, a weather tap, tiles in time order, drag to reorder, a list
view with move arrows); the add flow (the seven kinds, a type-anything box,
a gallery of about 300 words with emojis, a word block when nothing matches);
the block editor (a picture from the photo library, with place and time read
from the picture when it carries them, the kind's own fields, Where with the
phone's position on request, When, Cost, Note, nothing required, saved as he
types); a Stay carries across its nights; a trail at the top of every screen,
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
packing list (I18).

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
   only). Bump `VERSION` in `app/sw.js` with every publish or phones keep the
   old files.
3. **On the phone.** Open the address above in Chrome on the iPhone, Share →
   Add to Home Screen, then open it from the icon.

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

  **Built 2026-10-17**, in two passes: the trail (Trips › trip › Day n ›
  block) on every screen, any level one tap; then a trip's region ("Where
  in the world?" on the trip page), the city in the trail ("Day 4 ·
  Sydney"), a place trail above Where in the editor ("Australia › Sydney ›
  Rainforest Trail, Mosman"), the region on the recap's cover, and a
  "cities and towns" stat once a trip has more than one. Verified in the
  preview. Getting out from the deepest screen is still one tap on the
  trail or the back arrow.

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

## Findings

Dated, append-only. What was learned, in the order it was learned.

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
