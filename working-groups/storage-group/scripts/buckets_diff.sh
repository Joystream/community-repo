#!/bin/bash

FILEDIR="/target/to/copy/to/directory"
SRC_BUCKET_ID="2"
DES_BUCKET_ID="18"
GRAPHQL="https://joystream.yyagi.cloud/graphql"
SRC_QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$SRC_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
DES_QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$DES_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
PARSER='.data.storageBuckets[0].bags[].id'

curl --header "Content-Type: application/json"  --request POST   --data "$SRC_QUERY"  $GRAPHQL | jq -r $PARSER > $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt
curl --header "Content-Type: application/json"  --request POST   --data "$DES_QUERY"  $GRAPHQL | jq -r $PARSER > $FILEDIR/bags_bucket${DES_BUCKET_ID}.txt


diff $FILEDIR/bags_bucket${SRC_BUCKET_ID}.txt $FILEDIR/bags_bucket${DES_BUCKET_ID}.txt  | grep "<" | cut -d " " -f 2 > $FILEDIR/bags_bucket${SRC_BUCKET_ID}_diff_${DES_BUCKET_ID}.txt
cat bags_bucket${SRC_BUCKET_ID}_diff_${DES_BUCKET_ID}.txt
