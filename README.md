
# 🔗 URL Shortener - Node.js + TypeScript + MongoDB

A simple URL shortening service with 7-day expiration, built with Node.js, Express, MongoDB, and TypeScript.

## API Documentation

#### Redirect the user to the original site (browser only)

```http
  GET /:shortUrl
```

Use the shortened URL directly in the browser’s address bar to redirect to the original site.

Example: yourdomain.com/abcdef

#### Generate a shortened URL

```http
  POST /shortenUrl?url=
```

| Parameter | Type     | Description                                |
|:----------|:---------|:-------------------------------------------|
| `url`     | `string` | **Required**. The URL you want to shorten  |

Shortens the desired URL.

Example: yourdomain.com/shortenUrl?url=YOURDOMAIN.COM




## Environment Variables

To run this project, you need to add the following environment variables to your .env file:

`MongoConnectionURI`
`MongoDatabaseName`
`MongoCollection`


