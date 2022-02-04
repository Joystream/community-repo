# [41.CC-1 - Finalizing Content Migration](https://blog.joystream.org/sumer-kpis/#41.CC-1)

The goal is to check if transferred channels and videos from Sumer testnet are available on Giza distributors.

## Abstract

> After the upgrade, we migrated a lot of the content from sumer over to giza. This means some follow up work is required.
> Based on our own, and the community input, the channels that was migrated (including all videos) is available in thi issue.
> For addressing both this, and the [KPI 41.CC-2](https://blog.joystream.org/sumer-kpis/#41.CC-2), using the "old" and the "new" query-node is needed.

> Find out if all of the following was in fact migrated as we inteded, or if something was missing: channels videos (he migrations says yes for both, but double check wouldn't hurt) assets - some nuances here:
> How many ACCEPTED (ignore PENDING/REJECTED) data objects were there in total stored under these channels? How many bytes in total? We know the exact amounts migrated.
> For 1. Share the queries and scripts used to get the data.

[verify.js](verify.js) does following
- load `ids.js` with channel, video mapping
- query and cache Sumer QN for channels (`oldChannels.json`)
- query and cache Giza QN for videos (`newVideos.json`)
- select migrated *ids* and perform one HEAD request for each asset on `https://storage-1.joystream.org/argus` (~12 results/s, no throttling, sorry!)
- save results to `migration_result.json`
- print tables for empty source videos (`PENDING`) and non-uploads on Giza (see [below](#results)).

> Were there any censored channels or videos that made it into the migration? If yes, re-evaluate, and censor again if needed.

4 channels (54 55 57 133) are marked as `isCensored`, see [Censored source channels](#censored-source-channels).

> Are there any channels or videos that wasn't attempted migrated, but should have been? Make a channel on discord, and a forum thread where users can post what they are missing. Review what is being requested, and share the results.

Of 4706 selected videos 4646 were successfully transferred (646,5 GB video data + 82 MB thumbnails).

60 empty source videos were selected for transfer and the same amount is empty on the target provider.


## Resources

- Old and new `ChannelId` mapped: https://github.com/Joystream/community-repo/issues/609
- old QN: https://hydra-sumer.joystream.org/graphql
- new QN: https://hydra.joystream.org/graphql
- initial Distributor setup: https://github.com/bwhm/helpdesk/tree/giza/roles/distributors-lead#initial-configurations---giza

### Queries

#### `Channel <> Videos` collection [Sumer](https://hydra-sumer.joystream.org/graphql)
```
query {
  channels (where:{id_eq:534 }) {
    id
    createdAt
    updatedAt
    createdInBlock
    title
    category {
      name
    }
    ownerMember {
      id
      handle
      channels {
        id
        title
      }
    }
    coverPhotoAvailability
    avatarPhotoAvailability
    coverPhotoDataObject {
      joystreamContentId
      size
    }
    avatarPhotoDataObject {
      joystreamContentId
      size
    }
    isCensored
    isPublic
    }
    languages {
      iso
    }
    videos {
      id
      title
      mediaAvailability
      thumbnailPhotoAvailability
    }
}
```

Shorter version [here](verify.js#L14)

#### Assets on JSG provider ([Giza](https://hydra.joystream.org/graphql))

````
query{storageBuckets(where:{id_eq:"1"}){id,createdAt,acceptingNewBags,dataObjectsSizeLimit,dataObjectCountLimit,dataObjectsCount,dataObjectsSize,bags{id,objects{id,createdAt,isAccepted,size}}operatorMetadata{id,nodeEndpoint,nodeLocationId,extra,nodeLocation{id,countryCode,coordinates{latitude,longitude}}}}}
````
=> https://discord.com/channels/811216481340751934/812344681786507274/936573775066054688


#### `Channel <> Videos` collection and `Bag <> StorageBucket` associations [Giza](https://hydra.joystream.org/graphql)
```
query {
  storageBags { id distributionBuckets{id familyId bucketIndex} }  
  channels {id createdAt updatedAt createdInBlock title
    category { name } isCensored isPublic
    ownerMember { id handle }
    videos { id title }
  }
}
```

## Results

Loaded IDs of 4706 transferred videos in 177 channels.
Loaded info of 4706 migrated videos.
Loaded info of 713 old channels.
4646 videos were transferred 646485444380 bytes + 82260654 avatars + covers.

### Migrated videos with empty source

|ID|Title|Size|Upload|Thumbnail|
|---|---|---|---|---|
| 6154 | test upload | 140534084 | PENDING | ACCEPTED |
| 296 | asd | 253791949 | PENDING | ACCEPTED |
| 298 | 2021-05-25 11-13-38 | 253791949 | PENDING | ACCEPTED |
| 299 | 2021-05-25 11-13-38 | 253791949 | PENDING | ACCEPTED |
| 300 | 2021-05-25 11-13-38 | 253791949 | PENDING | ACCEPTED |
| 301 | asdasd | 253791949 | PENDING | ACCEPTED |
| 2040 | Как стать Амбассадором Bit.Country | 144893665 | PENDING | ACCEPTED |
| 120 | Showreel animation 2021 | 44997716 | PENDING | PENDING |
| 121 | Showreel animation 2021 | 44997716 | PENDING | PENDING |
| 303 | Tretyakov Gallery - Black Square | 755357428 | PENDING | PENDING |
| 206 | Любимое кафе с лучшим видом | 19237360 | PENDING | PENDING |
| 219 | Путешествую с Пятницей | 14891181 | PENDING | PENDING |
| 393 | Ночую в заброшке | 27508553 | PENDING | PENDING |
| 407 | Нашел работу в горах | 37731273 | PENDING | PENDING |
| 413 | Где я жил в кемпинге | 48027398 | PENDING | PENDING |
| 415 | Лес обезьян | 34139670 | PENDING | PENDING |
| 428 | Подношения | 42596459 | PENDING | PENDING |
| 220 | Путешествую с Пятницей | 14891181 | PENDING | PENDING |
| 201 | Как живет семья Бали | 29098159 | PENDING | PENDING |
| 194 | Бали открыли | 34331478 | PENDING | PENDING |
| 216 | Прекрасный вид на 360 | 36176482 | PENDING | PENDING |
| 388 | Танцы с Пятницей | 36599530 | PENDING | PENDING |
| 430 | С Пятницей на  вулкан | 36065310 | PENDING | PENDING |
| 399 | Бали в стиле старых фильмов | 79158922 | PENDING | PENDING |
| 2601 | JOY | 6264500 | PENDING | ACCEPTED |
| 1255 | Superman: Eleventh Hour | 34823272 | PENDING | ACCEPTED |
| 1270 | Superman: Jungle Drums | 49888116 | PENDING | ACCEPTED |
| 2388 | The Great Piggy Bank Robbery | 80195964 | PENDING | ACCEPTED |
| 5591 | I DID A INTENSE WORKOUT CHALLENGE | 299462853 | PENDING | ACCEPTED |
| 5593 | Super-Pump Arm Workout for Mass | 263483999 | PENDING | ACCEPTED |
| 2473 | Cosmos Laundromat | 76159780 | PENDING | ACCEPTED |
| 2488 | Elephants Dream | 69682629 | PENDING | ACCEPTED |
| 2374 | Big Buck Bunny | 94054804 | PENDING | ACCEPTED |
| 2377 | Caminandes1 | 4999593 | PENDING | ACCEPTED |
| 3511 | Самые смешные коты  | 45902976 | PENDING | ACCEPTED |
| 3513 | Приколы с Котами Топовая Подборка  | 188260671 | PENDING | ACCEPTED |
| 3522 | Самые смешные коты рунета | 36525391 | PENDING | ACCEPTED |
| 2532 | Что происходит на дорогах.  | 74585760 | PENDING | ACCEPTED |
| 3252 | Секрет обычной ТЁРКИ!  | 99776942 | PENDING | ACCEPTED |
| 3260 |  Без помощи сварки | 166481690 | PENDING | ACCEPTED |
| 2731 | Добрые поступки на дороге !!  | 95672013 | PENDING | ACCEPTED |
| 2784 | Сначало кушал один    ...... | 60910695 | PENDING | ACCEPTED |
| 2980 | ОШИБКИ при раскладке ПЛИТКИ! | 54067149 | PENDING | ACCEPTED |
| 2983 | Резка кафельной плитки без плиткореза | 25852047 | PENDING | ACCEPTED |
| 3680 | Убойные приколы с животными#6 | 69258194 | PENDING | ACCEPTED |
| 3791 | Милые животные | 42696740 | PENDING | ACCEPTED |
| 3790 | Милые белки | 303573777 | PENDING | ACCEPTED |
| 3789 | Спасение котенка  | 57380709 | PENDING | ACCEPTED |
| 4957 | ЩЕНОК ЮМИ ЧУ | 149896221 | PENDING | ACCEPTED |
| 4956 | ТАЙНАЯ ЖИЗНЬ ДОМАШНИХ ЖИВОТНЫХ  | 27674316 | PENDING | ACCEPTED |
| 4963 | Супер коты | 46215175 | PENDING | ACCEPTED |
| 4997 | Смешные кошки  | 41456550 | PENDING | ACCEPTED |
| 5070 | СМЕШНЫЕ ЖИВОТНЫЕ , КОТЫ СОБАКИ И ДРУГИЕ | 121691971 | PENDING | ACCEPTED |
| 8662 | IMG_ | 42613049 | PENDING | ACCEPTED |
| 4684 | J. Grunsfeld about working on Hubble | 42109276 | PENDING | PENDING |
| 5259 | Funny Parrot Talking Videos | 28707385 | PENDING | ACCEPTED |
| 5755 | Шоу 15 этажей | 259660035 | PENDING | ACCEPTED |
| 7724 | Joystream | 154651016 | PENDING | ACCEPTED |
| 4854 | Как собирать семантику (запросы) | 216125363 | PENDING | ACCEPTED |
| 8968 | roksolana joy | 14286490 | PENDING | ACCEPTED |

### Censored source channels

Found 4 censored channels in migration set:
 ```
{"id":"55","createdAt":"2021-05-28T15:41:12.000Z","updatedAt":"2021-06-03T07:31:00.000Z","createdInBlock":733904,"title":"Gingah","category":null,"ownerMember":{"id":"2195","handle":"gingah"},"isCensored":true,"isPublic":true,"coverPhotoAvailability":"ACCEPTED","coverPhotoDataObject":{"joystreamContentId":"5GpiUscQLtvBzZE1Gk53wvw8gz8zjP7TqFvM5bGhYZUcwCbd","size":193858},"avatarPhotoAvailability":"ACCEPTED","avatarPhotoDataObject":{"joystreamContentId":"5DyCJaqLMDxC1TgRjuGoFL3VDcw3dV9P1b3NsrdNapqyDPC7","size":15103},"videos":[]}
{"id":"57","createdAt":"2021-05-28T15:44:06.000Z","updatedAt":"2021-06-03T07:31:42.000Z","createdInBlock":733933,"title":"Gingah","category":null,"ownerMember":{"id":"2195","handle":"gingah"},"isCensored":true,"isPublic":true,"coverPhotoAvailability":"ACCEPTED","coverPhotoDataObject":{"joystreamContentId":"5HW2XWFDEgxmmGN7FQMeX52HHM8EyhbbHSp9YvGm6VCCzAxF","size":172320},"avatarPhotoAvailability":"ACCEPTED","avatarPhotoDataObject":{"joystreamContentId":"5Fg31k7kmX6Ms5oy75P3KHQ844CfrTo3FvfjeKGQHeb4gi3H","size":14980},"videos":[]}
{"id":"54","createdAt":"2021-05-28T15:40:54.000Z","updatedAt":"2021-06-03T07:24:18.000Z","createdInBlock":733901,"title":"Gingah","category":null,"ownerMember":{"id":"2195","handle":"gingah"},"isCensored":true,"isPublic":true,"coverPhotoAvailability":"ACCEPTED","coverPhotoDataObject":{"joystreamContentId":"5Cpg2fhvHtMNcrHrJ3VZ78wo1gCM47M6cKxZwGTiK23jWxzH","size":193858},"avatarPhotoAvailability":"ACCEPTED","avatarPhotoDataObject":{"joystreamContentId":"5FFTicA5vjzgM68QCNzFe8xGXxjVBq1phCRigGdXMMWCGWMU","size":15103},"videos":[]}
{"id":"133","createdAt":"2021-06-08T16:07:12.000Z","updatedAt":"2021-06-20T12:08:00.014Z","createdInBlock":892380,"title":"testing channel","category":null,"ownerMember":{"id":"2269","handle":"member_test_2112"},"isCensored":true,"isPublic":true,"coverPhotoAvailability":"INVALID","coverPhotoDataObject":null,"avatarPhotoAvailability":"INVALID","avatarPhotoDataObject":null,"videos":[]}
```

### Verification

Performed HEAD request on 4697 videos.
4646 of 4706 assets are available.

60 have no content.

| Channel | Video | Asset | Status |
|---|---|---|---|
| 734 | 9724 |  | no media |
| 734 | 9731 |  | no media |
| 734 | 9750 |  | no media |
| 734 | 9746 |  | no media |
| 734 | 9749 |  | no media |
| 734 | 9843 |  | no media |
| 734 | 9840 |  | no media |
| 734 | 9827 |  | no media |
| 734 | 9857 |  | no media |
| 734 | 9859 |  | no media |
| 734 | 9736 |  | no media |
| 734 | 9845 |  | no media |
| 734 | 9822 |  | no media |
| 734 | 9832 |  | no media |
| 747 | 12100 |  | no media |
| 751 | 9698 |  | no media |
| 751 | 9777 |  | no media |
| 751 | 9697 |  | no media |
| 757 | 9772 |  | no media |
| 757 | 9773 |  | no media |
| 757 | 9774 |  | no media |
| 757 | 9775 |  | no media |
| 757 | 9776 |  | no media |
| 758 | 10667 |  | no media |
| 777 | 10917 |  | no media |
| 778 | 10154 |  | no media |
| 778 | 10169 |  | no media |
| 784 | 10831 |  | no media |
| 799 | 10821 |  | no media |
| 799 | 10822 |  | no media |
| 799 | 10862 |  | no media |
| 799 | 10866 |  | no media |
| 801 | 11340 |  | no media |
| 801 | 11341 |  | no media |
| 801 | 11342 |  | no media |
| 801 | 10888 |  | no media |
| 801 | 10993 |  | no media |
| 801 | 11109 |  | no media |
| 801 | 11111 |  | no media |
| 801 | 11023 |  | no media |
| 801 | 11164 |  | no media |
| 801 | 11603 |  | no media |
| 801 | 11604 |  | no media |
| 801 | 11606 |  | no media |
| 801 | 11170 |  | no media |
| 801 | 11614 |  | no media |
| 801 | 11231 |  | no media |
| 801 | 11222 |  | no media |
| 801 | 11224 |  | no media |
| 801 | 11631 |  | no media |
| 801 | 11308 |  | no media |
| 814 | 11506 |  | no media |
| 819 | 11568 |  | no media |
| 821 | 11702 |  | no media |
| 822 | 11824 |  | no media |
| 822 | 11826 |  | no media |
| 828 | 11884 |  | no media |
| 864 | 13757 |  | no media |
| 869 | 13024 |  | no media |
| 889 | 14004 |  | no media |
