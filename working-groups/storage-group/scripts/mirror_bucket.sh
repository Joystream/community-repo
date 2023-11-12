#!/bin/bash

NUM_PROCESSORS=1000
PASSWORD="password"
KEYFILE="/target/to/copy/to/directory/keyfile"
FILEDIR="/target/to/copy/to/directory"
SRC_BUCKET_ID="2"
DES_BUCKET_ID="18"
GRAPHQL="https://joystream.yyagi.cloud/graphql"
QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$SRC_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
PARSER='.data.storageBuckets[0].bags[].id'

curl --header "Content-Type: application/json"  --request POST   --data "$QUERY"  $GRAPHQL | jq -r $PARSER > $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt

split $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt -n l/$NUM_PROCESSORS $FILEDIR/split_bucket${SRC_BUCKET_ID}_

yarn storage-node leader:update-bucket-status -i $DES_BUCKET_ID -s on -k $KEYFILE -p $PASSWORD

for file in $FILEDIR/split_bucket2_*
do
  patch=""
  for ch in $(cat $file)
  do
    patch=$patch" "$ch
  done
  yarn storage-node leader:update-bags -i $patch -a $DES_BUCKET_ID -k $KEYFILE -p $PASSWORD
done
