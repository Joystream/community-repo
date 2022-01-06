docker-compose down -v
service docker stop
rm -rf /var/lib/docker/volumes/joystream_query-node-data
service docker start
./import-qn-data.sh
for file in $(rgrep -l mokhtar query-node/); do sed -i s/"\\\u0000"/""/g $file ; done
./deploy-qn.sh
docker logs -f -n 100 processor
