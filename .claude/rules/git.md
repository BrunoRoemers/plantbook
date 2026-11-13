# Git

Bruno reviews by staging what he has approved. Never touch the index: change only the working tree and leave every change unstaged.

- No `git add`, `git rm` (use `rm`), `git mv` (use `mv`), `git restore --staged`, `git reset`, `git apply --index`/`--3way`, `git stash`, or commits, unless Bruno explicitly asks.
- A staged file that needs more changes gets edited in the working tree only (it shows as `MM`), so Bruno sees the new diff on top of what he staged.
- While Bruno is reviewing, don't change files he hasn't said are fair game.
