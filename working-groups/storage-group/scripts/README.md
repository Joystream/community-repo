Operation scripts





# Check for missing files on the storage node

``` 
git clone https://github.com/joyutils/swg-compare-files
cd swg-compare-files
node index.js localFiles < storage folder i.e. /data/joystream-storage/>
node index.js bucketObjects <bucket ID>
node index.js diff
```
