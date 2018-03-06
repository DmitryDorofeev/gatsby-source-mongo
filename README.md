# Mongo source plugin for Gatsby

### Define database credentials in config

```js
module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-mongo`,
      options: {
        server: {
          address: 'localhost',
        },
        auth: {
          user: 'dmitry',
          password: '1234'
        },
        srv: false,
        dbName: `test`,
        query: 'ssl=true&replicaSet=Cluster0-shard-0&authSource=admin',
        collection: [`pages`]
      },
    },
  ],
};
```

### Use graphql requests

```js
export const query = graphql`
  query PageQuery($path: String!) {
    mongoPages(path: { eq: $path }) {
      id
      title
      path
    }
  }
`
```
