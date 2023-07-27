## Initial settings
### global settings
```
yarn joystream-cli api:setQueryNodeEndpoint
yarn joystream-cli account:import  --backupFilePath /path/to/lead-key.json
yarn joystream-cli working-groups:setDefaultGroup -g storageProviders
```
> Set "global" storage limits to 2000 GB and 200000 files:
```
yarn storage-node leader:update-voucher-limits -s 2000000000000 -o 20000 -k /root/keys/storage-role-key.json
```

> Update/set the dynamic bag policy:
```
yarn storage-node leader:update-dynamic-bag-policy -t Channel -n 5 -k /root/keys/storage-role-key.json
```

> Update the bag limit:
```
yarn storage-node leader:update-bag-limit -l 10 -k /root/keys/storage-role-key.json
```



### hiring
```

yarn joystream-cli working-groups:createOpening -i /root/community-repo/working-groups/storage-group/leader/opening/Strorage_WG_Deputy_Leader.json
yarn joystream-cli working-groups:createOpening -i /root/community-repo/working-groups/storage-group/leader/opening/Strorage_WG_Worker.json

#list all opening
yarn joystream-cli working-groups:openings

#list an opening
yarn joystream-cli working-groups:opening --id x

#view application
yarn joystream-cli working-groups:application x

#Accept application
yarn joystream-cli working-groups:fillOpening --openingId x --applicationIds x

```
### bucket mgmt
```
yarn storage-node leader:create-bucket -i <WorkerId> -n 20000 -s 2000000000000 -k /root/keys/storage-role-key.json -p xxxxxx
yarn storage-node leader:update-bucket-status -i <bucketId> -s off -k /root/keys/storage-role-key.json -p xxxxxx
```

```
yarn joystream-cli working-groups:overview
```
