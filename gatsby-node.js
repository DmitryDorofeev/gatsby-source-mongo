const MongoClient = require(`mongodb`).MongoClient
const crypto = require(`crypto`)

exports.sourceNodes = (
  { boundActionCreators, getNode, hasNodeChanged },
  opts,
  done
) => {
  const { createNode } = boundActionCreators

  let serverOptions = opts.server || {
    address: `localhost`,
    port: 27017,
  }
  let dbName = opts.dbName || `local`;
  let authUrlPart = ``;

  if (opts.auth) {
    authUrlPart = `${opts.auth.user}:${opts.auth.password}@`
  }
  const port = serverOptions.port ? `:${serverOptions.port}` : ''
  const query = opts.query ? '?' + opts.query : ''
  const protocol = opts.srv ? 'mongodb+srv' : 'mongodb'
  const url = `${protocol}://${authUrlPart}${serverOptions.address}${port}/${dbName}${query}`

  MongoClient.connect(url,
    function(err, client) {
      // Establish connection to db
      if (err) {
        console.warn(err)
        return
      }
      const db = client.db(dbName)
      let collection = opts.collection || `documents`
      if (Array.isArray(collection)) {
        for (const col of collection) {
          createNodes(db, opts, dbName, createNode, col, done)
        }
      } else {
        createNodes(db, opts, dbName, createNode, collection, done)
      }
    }
  )
}

function createNodes(
  db,
  opts,
  dbName,
  createNode,
  collectionName,
  done
) {
  let collection = db.collection(collectionName)
  let cursor = collection.find()

  // Execute the each command, triggers for each document
  cursor.each(function(err, item) {
    // If the item is null then the cursor is exhausted/empty and closed
    if (item == null) {
      // Let's close the db
      done()
    } else {
      var id = item._id.toString()
      delete item._id

      var node = {
        // Data for the node.
        ...item,
        id: `${id}`,
        parent: `__${collectionName}__`,
        children: [],
        internal: {
          type: `mongodb${caps(dbName)}${caps(collectionName)}`,
          content: JSON.stringify(item),
          contentDigest: crypto
            .createHash(`md5`)
            .update(JSON.stringify(item))
            .digest(`hex`),
        },
      }
      createNode(node)
    }
  })
}

function caps(s) {
  return s.replace(/\b\w/g, l => l.toUpperCase())
}
