"""doc
type: number
desc: this is some content
"""
x = 0

# regular comment
moreCode()

"""doc
type: function.async
desc: Loads some network resources or something idk. **testing** _stuff_
args:
-   url|string: URL to request
-   options: Options for the thing?
    .method|string:
        default: GET
        desc: >
            Method for the request
            Can be `"GET"` or stuff
    .headers|object: Object with key-value pairs of headers + values
    .nested: extra stuff
    .nested.thing|number: number of extra things?
return: Response
"""
async def fetch():
    pass

"""doc
invalid
"""
