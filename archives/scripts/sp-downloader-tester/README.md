# Storage Provider Download Tester
This tool helps to check the response time of the Storage Providers Workers.  
It selects a list of files and downloads all of them at the same time and outputs some stats about the downloads. 

## Install dependencies
 ```
 yarn 
 ```

## Usage
 ```
  -w, --workers <workerId>        the Worker id's to perform the tests, separated by comma. Ex: 4,5,6
  -f, --asset-file [path]         a list of assets ids to download the same files for different workers
  -s, --nr-small-assets [number]  the number of small files to download (default: 9)
  -b, --nr-big-assets [number]    the number of big files to download (default: 1)
  -h, --help                      display help for command
 ```

## Examples
Run script without the list of files to download (it will generate an assets.txt file for future use)
 ```
yarn run sp-downloader-tester -w 3
```
Run script with the list of files to download
```
yarn run sp-downloader-tester -w 3 -f assets.txt
```

