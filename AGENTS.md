# Repository operating instructions

These instructions apply to the entire `bachikoljunior-blip/Gptgame` repository.

## Persistent delivery policy

- For every user-requested implementation or fix in this repository, completion means that the verified changes have been merged into `main`. Do not stop at local edits, a pushed task branch, or an open pull request.
- The user grants standing authorization, across chats, devices, context resets, and development sessions, to push task branches, create or update pull requests, merge completed pull requests into `main`, and allow the configured GitHub Pages workflow to publish the result. This remains active until the user explicitly revokes, replaces, or restricts it. Do not request separate confirmation for each normal push, pull request, merge, or Pages publication.
- At the end of each implementation unit: run the relevant checks, inspect the resulting change set, push it, create or update its pull request, confirm that it is mergeable, merge it into `main`, and verify that `main` contains the expected result. For deployable game changes, also verify the Pages workflow and public release when the available tools permit it.
- Never merge known failing, conflicted, incomplete, or out-of-scope changes. Resolve ordinary failures within the requested task. If repository protection, permissions, an external service, or an unresolved product decision makes merging impossible, report the exact blocker instead of claiming completion or bypassing the protection.
- This standing authorization is limited to this repository and its already configured deployment target. A later explicit user instruction overrides this policy.
