# Disable Bucket
yarn storage-node leader:update-bucket-status -i 8 -s off -k /root/keys/storage-role-key.json -p xxxxxx

# remove bags from Bucket
for i in $(seq 2000 2710) ; do
    yarn storage-node leader:update-bag -i dynamic:channel:$i -k /root/keys/storage-role-key.json -r 8 -p xxx
done

# Delete Bucket
yarn storage-node leader:remove-operator -i 8 -k /root/keys/storage-role-key.json -p xxxxx
yarn storage-node leader:delete-bucket -i 8 -k /root/keys/storage-role-key.json -p xxxxx


# Evict worker 

 yarn joystream-cli working-groups:evictWorker 7 --group=storageProviders
