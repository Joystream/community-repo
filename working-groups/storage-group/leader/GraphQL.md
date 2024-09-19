# GraphQL
> URL: https://graphql-console.subsquid.io/?graphql_api=https://orion.joystream.org/graphql
 
## Failed uploads
 
 
 ```
 {
  storageDataObjects(limit: 3000, offset: 0, where: {isAccepted_eq: false, createdAt_gt: "2022-09-02T00:00:00.000Z", createdAt_lt: "2022-09-04T03:00:54.000Z"}) {
    createdAt
    id
    storageBag {
      storageBuckets {
        id
      }
      id
    }
  }
}
```

## Bucket

### Bags in Storage Bucket
```
{
  storageBuckets(where: {id_eq: "6"}) {
    id
    bags {
      id
    }
  }
}
```

### Bucket end point and worker 

```
{
  storageBuckets(where: {id_eq: "2"}) {
    id
    acceptingNewBags
    operatorMetadata {
      nodeEndpoint
      extra
    }
    operatorStatus {
      ... on StorageBucketOperatorStatusActive {
        __typename
        workerId
      }
    }
  }
}


```


## Bags

### Buckets asscoated with a bag
```
{
  storageBags(where: {id_eq: "dynamic:channel:2000"}) {
    storageBuckets {
      id
    }
  }
}
```
## Worker 

```
{
  workers(where: {groupId_eq: "storageWorkingGroup", id_eq: "storageWorkingGroup-16"}) {
    id
    groupId
    membershipId
    membership {
      handle
    }
    status {
      ... on WorkerStatusActive {
        phantom
      }
      ... on WorkerStatusLeaving {
        __typename
      }
      ... on WorkerStatusLeft {
        __typename
      }
      ... on WorkerStatusTerminated {
        __typename
      }
    }
  }
}
```
