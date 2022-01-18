# Council Minutes generator

- Counil & Tokenomics Report: `yarn run report  [round|block range]` collects information from the [Joystream chain](https://testnet.joystream.org/). It was created to allow the council to generate a report after the end of a council round. It takes some minutes to cache all events. The next run with the same block range, will be quicker.
- Storage: `yarn run storage` generates a table with stats how many liaisons each storage worker has (similar to https://joystreamstats.live/storage)

## Setup

`yarn`

To update the submodule in `src/lib`:
```
git submodule init
git submodule update
```

## Usage

`yarn run report`

OR

`yarn build && node build/generator.js <start block> <end block>`

## Examples

- `yarn run report 30`
- `node build/generator.js 57601 234038`

# Contributors

* [freakstatic](https://github.com/freakstatic)
* [l1dev](https://git.joystreamstats.live/l1dev)
* [isonar](https://github.com/singulart)
