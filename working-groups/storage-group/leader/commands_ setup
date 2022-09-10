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
yarn joystream-cli working-groups:createOpening -o ~/joystream_working_dir/Strorage_WG_Worker.json
yarn joystream-cli working-groups:openings
yarn joystream-cli working-groups:opening --id 1
yarn joystream-cli working-groups:application 2
yarn joystream-cli working-groups:application 3
yarn joystream-cli working-groups:fillOpening --openingId 1 --applicationIds 2 --applicationIds 3
yarn joystream-cli working-groups:overview
yarn joystream-cli working-groups:createOpening -i ~/joystream_working_dir/Strorage_WG_Worker.json
```
### bucket mgmt
```
yarn storage-node leader:create-bucket -i 18 -n 20000 -s 1500000000000 -k /root/keys/storage-role-key.json -p xxxxxx
yarn storage-node leader:update-bucket-status -i 18 -s off -k /root/keys/storage-role-key.json -p xxxxxx
```
