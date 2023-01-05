set -e
dir=$(dirname $0)
max=12

# Prepare
# 1. Update `max` when files were added
# 2. `chmod +x ~/community-repo/working-groups-distributors/bucketFamilies/olympia/set-all.sh`
# 3. Set lead key in joystream/distributor-node/config.yml

# Run
# 1. `cd joystream/distributor-node`
# 3. `~/community-repo/working-groups-distributors/bucketFamilies/olympia/set-all.sh`

for f in $(seq 0 $max) ; do
  yarn joystream-distributor leader:set-bucket-family-metadata -f $f -i $dir/$f.json -y
done
