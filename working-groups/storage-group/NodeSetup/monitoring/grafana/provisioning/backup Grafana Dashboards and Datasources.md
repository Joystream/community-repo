```
export token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
export grafanaurl=https://grafana.joystream.yyagi.cloud/api
```



### Backup the dasboards 
```
curl -o out  -s -H "Authorization: Bearer $token" -X GET $grafanaurl/search?folderIds=0&query=&starred=false


for uid in $(cat out |  jq -r '.[] | .uid'); do
  curl -H "Authorization: Bearer $token" $grafanaurl/dashboards/uid/$uid | jq > grafana-dashboard-$uid.json
  echo "DASH $uid EXPORTED"
done
```


### Backup the Datasources 
```
curl -o datasources -s -H "Authorization: Bearer $token" -X GET $grafanaurl/datasources

for uid in $(cat datasources | jq -r '.[] | .uid'); do
  curl -s -H "Authorization: Bearer $token" -X GET $grafanaurl/datasources/uid/$uid | jq > datasource-$uid.json
  echo "DATASOURCE $uid exported"
done
```
