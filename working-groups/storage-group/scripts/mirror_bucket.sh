#!/bin/bash

NUM_PROCESSORS=1000
PASSWORD="password"
KEYFILE="/target/to/copy/to/directory/keyfile"
FILEDIR="/target/to/copy/to/directory"
JOYSTREAMDIR='/root/joystream'
SRC_BUCKET_ID="2"
DES_BUCKET_ID="18"
GRAPHQL="https://joystream.yyagi.cloud/graphql"
SRC_QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$SRC_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
DES_QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$DES_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
PARSER='.data.storageBuckets[0].bags[].id'

curl --header "Content-Type: application/json"  --request POST   --data "$SRC_QUERY"  $GRAPHQL | jq -r $PARSER  | sort -u > $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt
curl --header "Content-Type: application/json"  --request POST   --data "$DES_QUERY"  $GRAPHQL | jq -r $PARSER  | sort -u > $FILEDIR/bags_bucket${DES_BUCKET_ID}.txt

diff $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt $FILEDIR/bags_bucket${DES_BUCKET_ID}.txt  | grep "<" | cut -d " " -f 2 > $FILEDIR/bags_bucket${SRC_BUCKET_ID}_diff_${DES_BUCKET_ID}.txt
#cat bags_bucket${SRC_BUCKET_ID}_diff_${DES_BUCKET_ID}.txt

rm $FILEDIR/split_bucket${SRC_BUCKET_ID}_*
split bags_bucket${SRC_BUCKET_ID}_diff_${DES_BUCKET_ID}.txt -n l/$NUM_PROCESSORS $FILEDIR/split_bucket${SRC_BUCKET_ID}_

cd $JOYSTREAMDIR
yarn storage-node leader:update-bucket-status -i $DES_BUCKET_ID -s on -k $KEYFILE -p $PASSWORD

for file in $FILEDIR/split_bucket${SRC_BUCKET_ID}_*
do
  patch=""
  for ch in $(cat $file)
  do
    patch=$patch" "$ch
  done
  yarn storage-node leader:update-bags -i $patch -a $DES_BUCKET_ID -k $KEYFILE -p $PASSWORD
done

rm $FILEDIR/split_bucket${SRC_BUCKET_ID}_*
