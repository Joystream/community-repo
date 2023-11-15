#!/usr/bin/env bash


WORKDIR="/root/workDir"
FILEDIR="/data/joystream-storage"

DES_BUCKET_ID="0"
GRAPHQL="https://joystream.yyagi.cloud/graphql"
DES_BUCKET_QUERY='{"query": " { storageBuckets(where: {id_eq: \"'"$DES_BUCKET_ID"'\"}, orderBy: createdAt_ASC) { bags { id } } }"}'
PARSER_BAGS='.data.storageBuckets[0].bags[].id'
PARSER_OBJECTS=".data.storageDataObjects[].id | select(length > 0)"


mkdir -p $WORKDIR
cd $WORKDIR
curl -s --header "Content-Type: application/json"  --request POST   --data "$DES_BUCKET_QUERY"  $GRAPHQL | jq -r $PARSER_BAGS | sort -u > $WORKDIR/bags_bucket${DES_BUCKET_ID}.txt


rm $WORKDIR/objects_bucket${DES_BUCKET_ID}_qn.txt

for BAG in $(cat $WORKDIR/bags_bucket${DES_BUCKET_ID}.txt)
do
   OBJECTS_QUERY='{"query": " { storageDataObjects(where: {storageBag: {id_eq: \"'"$BAG"'\"}}) { id } } "}'
   curl -s --header "Content-Type: application/json"  --request POST   --data "$OBJECTS_QUERY"  $GRAPHQL | jq -r "$PARSER_OBJECTS" | sort -u >> $WORKDIR/objects_bucket${DES_BUCKET_ID}_qn.txt
   sleep 2
done


find $FILEDIR -maxdepth 1  -type f | cut -d "/" -f 4 > $WORKDIR/objects_bucket${DES_BUCKET_ID}_existing.txt
diff $WORKDIR/objects_bucket${DES_BUCKET_ID}_qn.txt $WORKDIR/objects_bucket${DES_BUCKET_ID}_existing.txt  | grep "<" | cut -d " " -f 4 | sort -u > $WORKDIR/objects_bucket${DES_BUCKET_ID}_diff_.txt
