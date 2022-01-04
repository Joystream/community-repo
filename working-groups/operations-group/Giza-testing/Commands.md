
# Test Commands

## Storage

commands-storage.txt
> dev:init dev:multihash dev:sync dev:upload dev:verify-bag-id help leader:cancel-invite leader:create-bucket leader:delete-bucket leader:invite-operator leader:remove-operator leader:set-bucket-limits leader:set-global-uploading-status leader:update-bag leader:update-bag-limit leader:update-blacklist leader:update-bucket-status leader:update-data-fee leader:update-dynamic-bag-policy leader:update-voucher-limits operator:accept-invitation operator:set-metadata server

`for cmd in $(cat commands-storage.txt);do echo $cmd ; ~/joystream/storage-node-v2/bin/run $cmd --help ; done`

### dev:init

Initialize development environment. Sets Alice as storage working group leader.

```
USAGE
  $ storage-node dev:init

OPTIONS
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### dev:multihash

Creates a multihash (blake3) for a file.

```
USAGE
  $ storage-node dev:multihash

OPTIONS
  -f, --file=file  (required) Path for a hashing file.
  -h, --help       show CLI help
```

### dev:sync

Synchronizes the data - it fixes the differences between local data folder and worker ID obligations from the runtime.

```
USAGE
  $ storage-node dev:sync

OPTIONS
  -d, --uploads=uploads                              (required) Data uploading directory (absolute path).
  -h, --help                                         show CLI help

  -o, --dataSourceOperatorUrl=dataSourceOperatorUrl  [default: http://localhost:3333] Storage node url
                                                     base (e.g.: http://some.com:3333) to get data from.

  -p, --syncWorkersNumber=syncWorkersNumber          [default: 20] Sync workers number (max async
                                                     operations in progress).

  -q, --queryNodeEndpoint=queryNodeEndpoint          [default: http://localhost:8081/graphql] Query node
                                                     endpoint (e.g.: http://some.com:8081/graphql)

  -t, --syncWorkersTimeout=syncWorkersTimeout        [default: 30] Asset downloading timeout for the
                                                     syncronization (in minutes).

  -w, --workerId=workerId                            (required) Storage node operator worker ID.
```

### dev:upload

Upload data object (development mode only).

```
USAGE
  $ storage-node dev:upload

OPTIONS
  -c, --cid=cid                (required) Data object IPFS content ID.
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --size=size              (required) Data object size.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### dev:verify-bag-id
The command verifies bag id supported by the storage node. Requires chain connection.

```
USAGE
  $ storage-node dev:verify-bag-id

OPTIONS
  -h, --help
      show CLI help

  -i, --bagId=bagId
      (required) Bag ID. Format: {bag_type}:{sub_type}:{id}.
           - Bag types: 'static', 'dynamic'
           - Sub types: 'static:council', 'static:wg', 'dynamic:member', 'dynamic:channel'
           - Id:
             - absent for 'static:council'
             - working group name for 'static:wg'
             - integer for 'dynamic:member' and 'dynamic:channel'
           Examples:
           - static:council
           - static:wg:storage
           - dynamic:member:4
```

#### help
Joystream storage subsystem.

```
VERSION
  storage-node-v2/2.0.0 linux-x64 node-v14.18.2

USAGE
  $ storage-node [COMMAND]

TOPICS
  dev       Development mode commands.
  leader    Storage working group leader commands.
  operator  Storage provider(operator) commands.

COMMANDS
  help    display help for storage-node
  server  Starts the storage node server.
```

### leader:cancel-invite

Cancel a storage bucket operator invite. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:cancel-invite

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:create-bucket

Create new storage bucket. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:create-bucket

OPTIONS
  -a, --allow                  Accepts new bags
  -h, --help                   show CLI help
  -i, --invited=invited        Invited storage operator ID (storage WG worker ID)
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode
  -n, --number=number          Storage bucket max total objects number

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --size=size              Storage bucket max total objects size

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:delete-bucket

Delete a storage bucket. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:delete-bucket

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:invite-operator

Invite a storage bucket operator. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:invite-operator

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -w, --operatorId=operatorId  (required) Storage bucket operator ID (storage group worker ID)

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:remove-operator

Remove a storage bucket operator. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:remove-operator

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:set-bucket-limits

Set VoucherObjectsSizeLimit and VoucherObjectsNumberLimit for the storage bucket.

```
USAGE
  $ storage-node leader:set-bucket-limits

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode
  -o, --objects=objects        (required) New 'voucher object number limit' value

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --size=size              (required) New 'voucher object size limit' value

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:set-global-uploading-status

Set global uploading block. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:set-global-uploading-status

OPTIONS
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --set=(on|off)           (required) Sets global uploading block (on/off).

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-bag

Add/remove a storage bucket from a bag (adds by default).

```
USAGE
  $ storage-node leader:update-bag

OPTIONS
  -a, --add=add
      [default: ] ID of a bucket to add to bag

  -h, --help
      show CLI help

  -i, --bagId=bagId
      (required) Bag ID. Format: {bag_type}:{sub_type}:{id}.
           - Bag types: 'static', 'dynamic'
           - Sub types: 'static:council', 'static:wg', 'dynamic:member', 'dynamic:channel'
           - Id:
             - absent for 'static:council'
             - working group name for 'static:wg'
             - integer for 'dynamic:member' and 'dynamic:channel'
           Examples:
           - static:council
           - static:wg:storage
           - dynamic:member:4

  -k, --keyFile=keyFile
      Key file for the account. Mandatory in non-dev environment.

  -m, --dev
      Use development mode

  -p, --password=password
      Key file password (optional). Could be overriden by ACCOUNT_PWD environment variable.

  -r, --remove=remove
      [default: ] ID of a bucket to remove from bag

  -u, --apiUrl=apiUrl
      [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev environment.

  -y, --accountUri=accountUri
      Account URI (optional). Has a priority over the keyFile and password flags. Could be overriden by 
      ACCOUNT_URI environment variable.
```

### leader:update-bag-limit

Update StorageBucketsPerBagLimit variable in the Joystream node storage.

```
USAGE
  $ storage-node leader:update-bag-limit

OPTIONS
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -l, --limit=limit            (required) New StorageBucketsPerBagLimit value
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-blacklist

Add/remove a content ID from the blacklist (adds by default).

```
USAGE
  $ storage-node leader:update-blacklist

OPTIONS
  -a, --add=add                [default: ] Content ID to add
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -r, --remove=remove          [default: ] Content ID to remove

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-bucket-status

Update storage bucket status (accepting new bags).

```
USAGE
  $ storage-node leader:update-bucket-status

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --set=(on|off)           (required) Sets 'accepting new bags' parameter for the bucket (on/off).

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-data-fee

Update data size fee. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:update-data-fee

OPTIONS
  -f, --fee=fee                (required) New data size fee
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-dynamic-bag-policy

Update number of storage buckets used in the dynamic bag creation policy.

```
USAGE
  $ storage-node leader:update-dynamic-bag-policy

OPTIONS
  -h, --help                      show CLI help
  -k, --keyFile=keyFile           Key file for the account. Mandatory in non-dev environment.
  -m, --dev                       Use development mode
  -n, --number=number             (required) New storage buckets number

  -p, --password=password         Key file password (optional). Could be overriden by ACCOUNT_PWD
                                  environment variable.

  -t, --bagType=(Channel|Member)  (required) Dynamic bag type (Channel, Member).

  -u, --apiUrl=apiUrl             [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                                  environment.

  -y, --accountUri=accountUri     Account URI (optional). Has a priority over the keyFile and password
                                  flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-voucher-limits

Update VoucherMaxObjectsSizeLimit and VoucherMaxObjectsNumberLimit for the Joystream node storage.

```
USAGE
  $ storage-node leader:update-voucher-limits

OPTIONS
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode
  -o, --objects=objects        (required) New 'max voucher object number limit' value

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --size=size              (required) New 'max voucher object size limit' value

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### operator:accept-invitation

Accept pending storage bucket invitation.

```
USAGE
  $ storage-node operator:accept-invitation

OPTIONS
  -h, --help                                     show CLI help
  -i, --bucketId=bucketId                        (required) Storage bucket ID

  -k, --keyFile=keyFile                          Key file for the account. Mandatory in non-dev
                                                 environment.

  -m, --dev                                      Use development mode

  -p, --password=password                        Key file password (optional). Could be overriden by
                                                 ACCOUNT_PWD environment variable.

  -t, --transactorAccountId=transactorAccountId  (required) Transactor account ID (public key)

  -u, --apiUrl=apiUrl                            [default: ws://localhost:9944] Runtime API URL.
                                                 Mandatory in non-dev environment.

  -w, --workerId=workerId                        (required) Storage operator worker ID

  -y, --accountUri=accountUri                    Account URI (optional). Has a priority over the keyFile
                                                 and password flags. Could be overriden by ACCOUNT_URI
                                                 environment variable.
```

### operator:set-metadata

Set metadata for the storage bucket.

```
USAGE
  $ storage-node operator:set-metadata

OPTIONS
  -e, --endpoint=endpoint      Root distribution node endpoint
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -j, --jsonFile=jsonFile      Path to JSON metadata file
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -w, --operatorId=operatorId  (required) Storage bucket operator ID (storage group worker ID)

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### server

Starts the storage node server.

```
USAGE
  $ storage-node server

OPTIONS
  -d, --uploads=uploads                              (required) Data uploading directory (absolute path).

  -e, --elasticSearchEndpoint=elasticSearchEndpoint  Elasticsearch endpoint (e.g.: http://some.com:8081).
                                                     Log level could be set using the ELASTIC_LOG_LEVEL
                                                     enviroment variable.
                                                     Supported values: warn, error, debug, info.
                                                     Default:debug

  -h, --help                                         show CLI help

  -i, --syncInterval=syncInterval                    [default: 1] Interval between synchronizations (in
                                                     minutes)

  -k, --keyFile=keyFile                              Key file for the account. Mandatory in non-dev
                                                     environment.

  -m, --dev                                          Use development mode

  -o, --port=port                                    (required) Server port.

  -p, --password=password                            Key file password (optional). Could be overriden by
                                                     ACCOUNT_PWD environment variable.

  -q, --queryNodeEndpoint=queryNodeEndpoint          (required) [default: http://localhost:8081/graphql]
                                                     Query node endpoint (e.g.:
                                                     http://some.com:8081/graphql)

  -r, --syncWorkersNumber=syncWorkersNumber          [default: 20] Sync workers number (max async
                                                     operations in progress).

  -s, --sync                                         Enable data synchronization.

  -t, --syncWorkersTimeout=syncWorkersTimeout        [default: 30] Asset downloading timeout for the
                                                     syncronization (in minutes).

  -u, --apiUrl=apiUrl                                [default: ws://localhost:9944] Runtime API URL.
                                                     Mandatory in non-dev environment.

  -w, --worker=worker                                (required) Storage provider worker ID

  -y, --accountUri=accountUri                        Account URI (optional). Has a priority over the
                                                     keyFile and password flags. Could be overriden by
                                                     ACCOUNT_URI environment variable.
```

## Distributor

commands-distributor.txt
> start help dev:init dev:batchUpload operator:accept-invitation operator:set-metadata node:set-buckets node:set-worker node:shutdown node:start-public-api node:stop-public-api leader:cancel-invitation leader:create-bucket leader:create-bucket-family leader:delete-bucket leader:delete-bucket-family leader:invite-bucket-operator leader:remove-bucket-operator leader:set-bucket-family-metadata leader:set-buckets-per-bag-limit leader:update-bag leader:update-bucket-mode leader:update-bucket-status leader:update-dynamic-bag-policy

`for cmd in $(cat commands-distributor.txt);do echo $cmd ; ~/joystream/storage-node-v2/bin/run $cmd --help ; done`

### start

>  ›   Error: command start not found

### help

Joystream storage subsystem.

```
VERSION
  storage-node-v2/2.0.0 linux-x64 node-v14.18.2

USAGE
  $ storage-node [COMMAND]

TOPICS
  dev       Development mode commands.
  leader    Storage working group leader commands.
  operator  Storage provider(operator) commands.

COMMANDS
  help    display help for storage-node
  server  Starts the storage node server.
```

### dev:init

Initialize development environment. Sets Alice as storage working group leader.

```
USAGE
  $ storage-node dev:init

OPTIONS
  -h, --help                   show CLI help
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### dev:batchUpload

>  ›   Error: command dev:batchUpload not found

### operator:accept-invitation

Accept pending storage bucket invitation.

```
USAGE
  $ storage-node operator:accept-invitation

OPTIONS
  -h, --help                                     show CLI help
  -i, --bucketId=bucketId                        (required) Storage bucket ID

  -k, --keyFile=keyFile                          Key file for the account. Mandatory in non-dev
                                                 environment.

  -m, --dev                                      Use development mode

  -p, --password=password                        Key file password (optional). Could be overriden by
                                                 ACCOUNT_PWD environment variable.

  -t, --transactorAccountId=transactorAccountId  (required) Transactor account ID (public key)

  -u, --apiUrl=apiUrl                            [default: ws://localhost:9944] Runtime API URL.
                                                 Mandatory in non-dev environment.

  -w, --workerId=workerId                        (required) Storage operator worker ID

  -y, --accountUri=accountUri                    Account URI (optional). Has a priority over the keyFile
                                                 and password flags. Could be overriden by ACCOUNT_URI
                                                 environment variable.
```

### operator:set-metadata

Set metadata for the storage bucket.

```
USAGE
  $ storage-node operator:set-metadata

OPTIONS
  -e, --endpoint=endpoint      Root distribution node endpoint
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -j, --jsonFile=jsonFile      Path to JSON metadata file
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -w, --operatorId=operatorId  (required) Storage bucket operator ID (storage group worker ID)

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### node:set-buckets

>  ›   Error: command node:set-buckets not found

### node:set-worker

> ›   Error: command node:set-worker not found

### node:shutdown

> ›   Error: command node:shutdown not found

### node:start-public-api

> ›   Error: command node:start-public-api not found

## node:stop-public-api

> ›   Error: command node:stop-public-api not found

## leader:cancel-invitation

> ›   Error: command leader:cancel-invitation not found

## leader:create-bucket

Create new storage bucket. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:create-bucket

OPTIONS
  -a, --allow                  Accepts new bags
  -h, --help                   show CLI help
  -i, --invited=invited        Invited storage operator ID (storage WG worker ID)
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode
  -n, --number=number          Storage bucket max total objects number

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --size=size              Storage bucket max total objects size

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:create-bucket-family

>  ›   Error: command leader:create-bucket-family not found

### leader:delete-bucket

Delete a storage bucket. Requires storage working group leader permissions.

```
USAGE
  $ storage-node leader:delete-bucket

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:delete-bucket-family

> ›   Error: command leader:delete-bucket-family not found

### leader:invite-bucket-operator
> ›   Error: command leader:invite-bucket-operator not found

### leader:remove-bucket-operator
> ›   Error: command leader:remove-bucket-operator not found

### leader:set-bucket-family-metadata
> ›   Error: command leader:set-bucket-family-metadata not found

### leader:set-buckets-per-bag-limit
> ›   Error: command leader:set-buckets-per-bag-limit not found
 
### leader:update-bag

Add/remove a storage bucket from a bag (adds by default).

```
USAGE
  $ storage-node leader:update-bag

OPTIONS
  -a, --add=add
      [default: ] ID of a bucket to add to bag

  -h, --help
      show CLI help

  -i, --bagId=bagId
      (required) Bag ID. Format: {bag_type}:{sub_type}:{id}.
           - Bag types: 'static', 'dynamic'
           - Sub types: 'static:council', 'static:wg', 'dynamic:member', 'dynamic:channel'
           - Id:
             - absent for 'static:council'
             - working group name for 'static:wg'
             - integer for 'dynamic:member' and 'dynamic:channel'
           Examples:
           - static:council
           - static:wg:storage
           - dynamic:member:4

  -k, --keyFile=keyFile
      Key file for the account. Mandatory in non-dev environment.

  -m, --dev
      Use development mode

  -p, --password=password
      Key file password (optional). Could be overriden by ACCOUNT_PWD environment variable.

  -r, --remove=remove
      [default: ] ID of a bucket to remove from bag

  -u, --apiUrl=apiUrl
      [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev environment.

  -y, --accountUri=accountUri
      Account URI (optional). Has a priority over the keyFile and password flags. Could be overriden by 
      ACCOUNT_URI environment variable.
```

### leader:update-bucket-mode

> ›   Error: command leader:update-bucket-mode not found

### leader:update-bucket-status

Update storage bucket status (accepting new bags).

```
USAGE
  $ storage-node leader:update-bucket-status

OPTIONS
  -h, --help                   show CLI help
  -i, --bucketId=bucketId      (required) Storage bucket ID
  -k, --keyFile=keyFile        Key file for the account. Mandatory in non-dev environment.
  -m, --dev                    Use development mode

  -p, --password=password      Key file password (optional). Could be overriden by ACCOUNT_PWD
                               environment variable.

  -s, --set=(on|off)           (required) Sets 'accepting new bags' parameter for the bucket (on/off).

  -u, --apiUrl=apiUrl          [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                               environment.

  -y, --accountUri=accountUri  Account URI (optional). Has a priority over the keyFile and password
                               flags. Could be overriden by ACCOUNT_URI environment variable.
```

### leader:update-dynamic-bag-policy

Update number of storage buckets used in the dynamic bag creation policy.

```
USAGE
  $ storage-node leader:update-dynamic-bag-policy

OPTIONS
  -h, --help                      show CLI help
  -k, --keyFile=keyFile           Key file for the account. Mandatory in non-dev environment.
  -m, --dev                       Use development mode
  -n, --number=number             (required) New storage buckets number

  -p, --password=password         Key file password (optional). Could be overriden by ACCOUNT_PWD
                                  environment variable.

  -t, --bagType=(Channel|Member)  (required) Dynamic bag type (Channel, Member).

  -u, --apiUrl=apiUrl             [default: ws://localhost:9944] Runtime API URL. Mandatory in non-dev
                                  environment.

  -y, --accountUri=accountUri     Account URI (optional). Has a priority over the keyFile and password
                                  flags. Could be overriden by ACCOUNT_URI environment variable.
```