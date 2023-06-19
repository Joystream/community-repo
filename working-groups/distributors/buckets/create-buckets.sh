set -e
dir=$(dirname $0)
max=12

# Prepare: chmod +x community-repo/working-groups/distributors/families/create-buckets.sh
# Run: cd joystream/distributor-node && community-repo/working-groups/distributors/families/create-buckets.sh

for f in $(seq 0 $max) ; do
  yarn joystream-distributor leader:create-bucket -f $f -y
done
