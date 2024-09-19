A Command line tool to integrate storage objects:

- bags 
    * Associated buckets list 
    * Associated objects list and size .
    * How many objects and total size. 
    * Filters
        - Time period filter for bags created and deleted 
        - Bags
        - Buckets
- objects   
    * Associated bag
    * Associated buckets.
    * Object size.
    * IPFS hash
    * Date created 
    * Compare object size in the Query node and in the Storage node
    * Confirm objects status on buckets by doing head request to nodes. 
    * Lost objects
    * Failed uploads
    * Filters
        - Time period filter for objected created and deleted 
        - Objects
        - Buckets
        - bags
- Node (Buckets)
     * Node info
        - Country and city
        - Geo coordinate 
        - Endpoint
        - Capacity
    * Storage Status 
    * Query Node URL 
    * Accepting bags status
    * Storage node Version
    * Number of Bags
    * Bags list including size
    * Number of objects
    * Objects list including size
    * Total storage used
    * Upload test
    * Download test
    * Compare objects in the storage with QN.
    * Filters
        -Time period filter for objected created and deleted
        - Objects
        - Buckets
        - bags
