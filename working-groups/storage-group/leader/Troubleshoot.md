

Create a tcpdump container

```
docker build -t tcpdump - <<EOF 
FROM ubuntu 
RUN apt-get update && apt-get install -y tcpdump 
CMD tcpdump -i eth0 
EOF
```


Run the colelction 


All traffic of the storage node 
```
docker run --tty -v "$PWD":/data  --net=container:colossus-1 tcpdump tcpdump -N  -w /data/cap_storage.pcap
```
Queries and response to the QN
```
docker run --tty -v "$PWD":/data  --net=container:graphql-server tcpdump tcpdump -N 'port 8081' -w /data/cap_graphql.pcap
```
