# Community Repo Files and folders naming rules

v1.0

## Folders

Folders should generally be named in lower case characters, with '-' as words separator. In other words, in lower kebab case: `example-folder-in-lower-kebab-case`

### `council-reports`
This folder can be used for creating council reports. The council reports submitted should be formatted in the following way:
`Council Round #n - DD/MM/YYYY - Council Report.md`
### `community-contributions`
This folder can be used for community coded bots and projects and anything that doesn't fit elsewhere. Each submission should be in a unique folder within this directory.
### `documentation`
This folder can be used for documentation.
### `submission-log`
This folder can be used for maintaining a log of submissions. If the testnet is started from fresh, a new file should be made.
Each entry in the log should include the Joystream username of the submission, a link to the proposal, a link to the PR and the amount of tokens awarded to the user (if applicable).
`#1 - Rome Testnet - Community Repo Submission Log.md`
### `tokenomics-reports`
This folder can be used for creating tokenomics reports, tokenomics reports are to be submitted during each `Council Round`. The tokenomics reports submitted should be formatted in the following way:
`Council Round #n - DD/MM/YYYY - Tokenomics Report.md`
### `workinggroup-reports`
This folder can be used for creating reports specific to working groups like the storage or curator working groups.

## Files

For regular files, the general rule should be to use lower snake case: `lower_Snake_Case`. Uppercase is allowed, as well as numbers.

Not recommended to use:
1. Spaces
2. Non-English characters
3. Characters used in URLs: #, &, ?, :, /


These naming conventions can be overruled by the specific requirements dictated by respective software tools or libraries that a contributor choses to use for their coding contributions.
