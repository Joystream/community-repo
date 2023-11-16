Operation scripts





# Check for missing files on the storage node

``` 
git clone https://github.com/joyutils/swg-compare-files
cd swg-compare-files
node index.js localFiles /data/joystream-storage/
node index.js bucketObjects 4
node index.js diff
```
