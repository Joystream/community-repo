set -e
dir=$(dirname $0)
max=12

# Prepare: chmod +x community-repo/working-groups/distributors/families/configure-families.sh
# Run: cd joystream/distributor-node && community-repo/working-groups/distributors/families/configure-families.sh

for f in $(seq 0 $max) ; do
  yarn joystream-distributor leader:create-bucket-family -c distributor-node/config.yml -y
  yarn joystream-distributor leader:set-bucket-family-metadata -f $f -i $dir/$f.json -y    
done
