Needed : 
- URL : https://play.joystream.org/studio/videos
- test bag ID: YYAGI:2705,2706 
- test bag ID: 0x2bc:2222, 2223, 2227 
- Or create new channel in Atlas


Check buckets assigned to the bag 
```
{
  storageBags(limit: 3000, offset: 0, where: {id_eq: "dynamic:channel:2705"}) {
    storageBuckets {
      id
    }
    id
  }
}
```

Remove all buckets and leave only allow bucket to be tested 

```
yarn storage-node leader:update-bag -i dynamic:channel:2705 -k /root/keys/storage-role-key.json -r 17 -p xxxxxxx
yarn storage-node leader:update-bag -i dynamic:channel:2705 -k /root/keys/storage-role-key.json -r 14 -p xxxxxxx
yarn storage-node leader:update-bag -i dynamic:channel:2706 -k /root/keys/storage-role-key.json -a 16 -p xxxxxxx

```
