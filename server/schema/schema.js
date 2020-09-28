// 3 purposes of GraphQL Schema file
// define scheme Types
// define relationships
// define root queries, which are entry-points into GraphQL

const graphql = require('graphql');
const _ = require('lodash');
// The classes below are MongoDB Model Classes
const Book = require('../models/book');
const Author = require('../models/author');


const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},
        author: {
            type: AuthorType,
            resolve(parent, args) {
                //parent: when in a nested Query, parent is the parent call
                //  e.g requesting a book which has a author obj prop..
                //      the book would be the parent when referencing the author here.
                return Author.findById(parent.authorId)
            },
        },
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        books: {
            type: new GraphQLList(BookType),
            resolve(parent,args) {
                return Book.find({authorId: parent.id});
            },
        },
    }),
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID},
                },
            resolve(parent, args) {
                //args: contains data fields defined above
                return Book.findById(args.id);
            
            }
        },
        author: {
            type: AuthorType,
            args: {id: {type: GraphQLID} },
            resolve(parent,args) {
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent,args) {
                return Book.find({}); // .find with empty object returns all books 
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent,args) {
                return Author.find({})
            }
        }
    }
});

const Mutation  = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve(parent,args) {
                let author = new Author({
                    name: args.name,
                    age: args.age,
                })
                return author.save();
            },
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)},
            },
            resolve(parent,args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId,
                });
                return book.save();
            },
        }, // of mutation defs
    },
});

module.exports = new GraphQLSchema({
   query: RootQuery,
   mutation: Mutation,
});