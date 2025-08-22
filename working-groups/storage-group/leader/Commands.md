# Overview
```
yarn joystream-cli working-groups:overview -g=storageProviders
```

## Disable Bucket
```
yarn storage-node leader:update-bucket-status -i 8 -s off -k /root/keys/storage-role-key.json -p xxxxxx
```
## remove bags from Bucket
```
for i in $(seq 2000 2710) ; do
    yarn storage-node leader:update-bag -i dynamic:channel:$i -k /root/keys/storage-role-key.json -r 8 -p xxx
done

or 

curl 'https://joystream2.yyagi.cloud/graphql'  \
     -s \
     -H 'Accept-Encoding: gzip, deflate, br'  \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json'  \
     -H 'Connection: keep-alive'  \
     -H 'DNT: 1'  \
     -H 'Origin: https://joystream2.yyagi.cloud'  \
     --data-binary '{"query":"query MyQuery { storageBuckets(where: {id_eq: 2}) {  bags { id } } }\n"}'   2>&1\
     | jq . | grep dynamic | sed 's/"id"://g;s/"//g;s/ //g' > bags_file
     
for i in $(cat ~/bags_file) ; do
    yarn storage-node leader:update-bag -i $i -k /root/keys/storage-role-key.json -r 1 -p xxxxx
done
```

## Delete Bucket
Can only delete empty buckets
```
yarn storage-node leader:remove-operator -i 8 -k /root/keys/storage-role-key.json -p xxxxx
yarn storage-node leader:delete-bucket -i 8 -k /root/keys/storage-role-key.json -p xxxxx
```

## Re-invite
```
yarn storage-node leader:remove-operator -i 3 -k /root/keys/storage-role-key.json -p xxxxxx
yarn storage-node leader:invite-operator -i 3  -w 3 -k /root/keys/storage-role-key.json -p xxxxx
```
## Evict worker 
Make sure the bucket is empty and deleted
```
 yarn joystream-cli working-groups:evictWorker 7 --group=storageProviders
 ```
 
## Remove/add Bag to Bucket

```
yarn storage-node leader:update-bag -i dynamic:channel:2705 -k /root/keys/storage-role-key.json -r 17 -p xxxxxxx
yarn storage-node leader:update-bag -i dynamic:channel:2706 -k /root/keys/storage-role-key.json -a 17 -p xxxxxxx

```

## Change rewards
```
yarn joystream-cli working-groups:updateWorkerReward  8  6 --group=storageProviders
```
