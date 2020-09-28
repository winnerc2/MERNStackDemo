const express = require('express')
const { graphqlHTTP } = require('express-graphql'); // handle GraphQL requests
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const dbName = 'ngrStackDemo';


const app = express();

mongoose.connect('mongodb://localhost/' + dbName);
mongoose.connection.once('open', () => {
    console.log('connected to MongoDB database: ' + dbName);
});

// app.use causes nodejs server to pass all requests to /graphql to the graphqlHTTP object
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
})
);

app.listen(4000, () => {
    console.log('now listening for requests on port 4000...');
});