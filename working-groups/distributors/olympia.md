# Olympia Distribution WG

https://dao.joystream.org/#/working-groups/distribution

- Lead: [l1dev](https://dao.joystream.org/#/proposals/preview/13) ([Applications](https://dao.joystream.org/#/working-groups/openings/distributionWorkingGroup-0))
- Budget: [Proposal](https://dao.joystream.org/#/proposals/preview/18) ([Discussion](https://discord.com/channels/811216481340751934/812343711870091285/957682269475201025))

## Bucket Families

| Family | Label | Region | Workers |
|---|---|---|---|
| 0 | EU-1 | N EU | @l1 @max @mike |
| 1 | EU-2 | central EU | @yasir (should be family 0) |
| 2 | AS-1 | E EU / NW AS | @lkskrn @mike |
| 3 | AS-2 | E AS | @ilich |
| 4 | AS-3 | SEA |  @cooloNe |
| 5 | AF-1 | northern AF / southern EU | |
| 6 | AF-2 | southern AF | @Alex |
| 7 | OC | | |
| 8 | SA-1 | SA south | |
| 9 S| A-2 | SA north + central | @0x2bc @spat |
| 10 | NA-1 | NA west | @cooloNe |
| 11 | NA-2 | NA central | |
| 12 | NA-3 | NA east | |

## Workers

https://dao.joystream.org/#/working-groups/distribution

[Pin](https://discord.com/channels/811216481340751934/933726271832227911/957589245407678494)

![](https://cdn.discordapp.com/attachments/933726271832227911/957675927326838814/olympia-distribution.png)

### Upgrading

- [QN](https://discord.com/channels/811216481340751934/933726271832227911/957653724174614559), [also](https://discord.com/channels/811216481340751934/933726271832227911/957390875959361597)
- [Validator](https://discord.com/channels/811216481340751934/933726271832227911/957572146958319616) (`--rpc-cors`)

### Costs

| Member | Bucket | Worker | Location | Size TB | USD / mon |
|---|---|----|---|---|---|
| @l1dev | 0:0 | 0 | Helsinki | 2 | 75 |
| @cooloNe | 10:0 | 1 | Los Angeles | 0.8 | 84 |
| @cooloNe | 4:0| 1 | Singapore | 0.8 | 225 |
| @Ilich | 3:0 | 2 | Novosibirsk | 0.3 | 44 |
| @AlexZNet | 6:0 | 3 | Johannesburg | 0.1 | 60 |
| @xJames#8645 |  9:0 | 4 | Sao Paolo | 0.75 | 177 |
| @Lelik_maxi#6419 |  0:1 | 5 | Helsinki | 1.4 | 57 |
| @lkskrn#8336 |  2:0 | 6 | Moscow | 0.3 | 51 |
| @yasir#4678 | 1:0 | 7 | Finland | 1.8 | 170 |
| @spat_sochi#8803 |  9:1 | 8 | Bogota | 0.1 | 69 |
| @MikeShipa#1881 | 0:2 | 9 | Helsinki | 0.48 | 50 |
| @MikeShipa#1881 | 2:1 | 9 | Moscow | 3.5 | 96 |
| **Total** | | | | | 1183 (300/w) |

## Setup

- [Commands](https://discord.com/channels/811216481340751934/933726271832227911/957567685993050162)
- Hint: [set dynamic bag policy early to avoid manual bag assignment](https://discord.com/channels/811216481340751934/933726271832227911/957592223422230566)

## Bugs

- multiple workers can be invited to the same bucket ([details](https://discord.com/channels/811216481340751934/933726271832227911/957673382936199240))
- worker id is not displayed on https://dao.joystream.org/#/working-groups/distribution 
- only one of three hired workers is displayed on https://dao.joystream.org/#/working-groups/openings/distributionWorkingGroup-4
