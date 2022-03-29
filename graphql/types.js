const { GraphQLObjectType, GraphQLString, GraphQLID } = require('graphql');
const { User, Post, Comment } = require('../models');

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This is the usertype',
    fields:() => ({
        id: {type: GraphQLID},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        displayName: {type: GraphQLString},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
    }),
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    description: 'This is the PostType',
    fields:() => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        body: {type: GraphQLString},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        author: {
            type: UserType, 
            resolve(parent) {
                return User.findbyId(parent.authorId)
        }},
    }),
});

const CommentType = new GraphQLObjectType ({
    name: 'Comment',
    description: "This is the CommentType",
    fields: {
        id: {type: GraphQLID},
        comment: {type: GraphQLString},
        user: {type: UserType, resolve(parent) {
            return User.findbyId(parent.postId)
        }},
        post: {type: PostType, resolve(parent) {
            return Post.findbyId(parent.postId)
        }}
    }
})

module.exports = {
    UserType,
    PostType,
    CommentType
}