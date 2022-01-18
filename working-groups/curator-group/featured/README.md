# [32.CC-2 - Update Featured Categories](https://blog.joystream.org/sumer-kpis/#32.CC-2)

This script generates a week schedule to [configure featured categories on orion](https://github.com/Joystream/atlas/blob/master/docs/community/featured-content.md) ([atlas#1659](https://github.com/Joystream/atlas/issues/1659). To switch the categories it needs to be run daily.

# Setup

1. Run `yarn` to install dependencies.
2. Edit `.env` to set `orionHeader`.
3. Download the files shared by the Curation lead.

# Usage

Commands
- `get`: show current category videos // TODO FIX
- `set`: display mutation requests
- `update`: updates videos.json from `list` (generate with `find DirectoryWithCategoryVideosCuts > list`
- `schedule`: regenerates schedule

`yarn run categories COMMAND`

## Update Videos

The list of video files is saved in `list` with this schema: `./News _ Politics 12/11-6571.mp4`

To update it, download and enter the directory maintained by the Curation lead and run `find > list` and move the file `list` into the directory if the script.

Now run `yarn categories update` to regenerate `videos.json`.

## Update schedule

`yarn categories schedule` saves the schedule for the coming week to `schedule.json`.

## Change featured category videos

With `yarn categories set` the videos of the day are loaded from `schedule.json` and transmitted to orion.

## Verify categories

Use `yarn categories get` to check currently set categories.


# Configuration

`.env` needs to hold the Authorization header shared by the atlas team (see [Setup](#setup)).

To change the server, edit `orionUrl` in categories.ts.

The location of video cuts is hardcoded in `getOrionVideo()`.

A default of 7 days is used for the schedule (edit `generateSchedule()`).
