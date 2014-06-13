

## TODO


## Outline

### `__()` a.k.a The Sandbox Constructor Function
- it should accept any number of string parameters which correspond to **exact string** queries
    - it should also accept an array of strings
    - it should accept version information in the following form:
    ```
    __('jquery@2.1.1')
    ```
        - it should default to the latest version if no version is given
    - it should accept file information in the following form:
    ```
    __('bootstrap@2.1.1(bootstrap.min.js, bootstrap.min.css)')
    ```
        - it should default to the latest version if no version is given
        - it should skip 
- on the first call, it should perform a search on the jsdelivr api
    - it should check all supplied files against the search to ensure that a proper url can be built
    - if the **entire** query is correct, it should store the 
- it should accept an optional callback function as the final argument

### The `jsdelivr` CDN namespace
#### `jsdelivr.search()`

#### `jsdelivr.get(query1, [query2], ..., [queryN], [callback])`
