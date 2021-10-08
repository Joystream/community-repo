# Tokenomics Report Generator

This scripts collects some information from Joystream chain. \
It was created to allow the council to generate a report in the finish of the council round. \
It takes some minutes to complete the report, multiple runs, with the same block range, will be quicker since it has a "cache" system for the block events.  

## Setup

`yarn && yarn build`

To update the submodule in `src/lib`:
```
git submodule init
git submodule update
```

## Usage

`node build/generator.js <start block> <end block>`

## Example

`node build/generator.js 57601 234038`

# Contributors

* [freakstatic](https://github.com/freakstatic)
* [l1dev](https://git.joystreamstats.live/l1devx)
* [isonar](https://github.com/singulart)
