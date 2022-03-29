const  { GraphQLString, GraphQLID } = require('graphql');
const { User, Post } = require('../models');
const { createJWTToken } = require('../utils/auth');
const  { PostType } = require('./types');

const register = {
    type: GraphQLString,
    description: 'Register a new user and returns a token',
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString},
        password: { type: GraphQLString },
        displayName: { type: GraphQLString },
    },
    async resolve(_, args) {
        const {username, email, password, displayName} = args;

        const user = new User({username, email, password, displayName});
        await user.save();

        const token = createJWTToken({_id: user._id, username: user.username, email: user.email, displayName: user.displayName});

        return token;
    }
}

const login = {
    type: GraphQLString,
    description: 'Login a user and returns a token',
    args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
    },
    async resolve(_, args) {

        const user = await User.findOne({email: args.email}).select('+password');

        if (!user || args.password !== user.password)
            throw new Error('Invalid email or password');

        const token = createJWTToken({
            _id: user._id,
            username: user.username,
            email: user.email,
        })

        return token;
    }
}

const createPost = {
    type: PostType,
    description: "Create a new post",
    args: {
        title: { type: GraphQLString },
        body: { type: GraphQLString },
    },
    async resolve(_, args, {verifiedUser}) {
        const post = new Post({
            title: args.title,
            body: args.body,
            authorId: verifiedUser._id,
        })
        await post.save()

        return post
    }
}

const updatePost = {
    type: PostType,
    description: "Update a post",
    args: { 
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        body: { type: GraphQLString }, 
    },
    async resolve(_, {id, title, body}, {verifiedUser}) {
        if(!verifiedUser) throw new Error("Unauthorized");

        const postUpdate = await Post.findOneAndUpdate(
            { _id: id, authorId: verifiedUser._id},
            { title, body},
            {
                new: true,
                runValidators: true
            }
        );

        if (!postUpdate) throw new Error("no post for given id");

        return postUpdate;
    }
}

const deletePost = {
    type: GraphQLString,
    description: "Delete a post",
    args: {
        postId: {type: GraphQLID}
    },
    async resolve (_, {postId}, {verifiedUser}) {
        if(!verifiedUser) throw new Error("Unauthorized");

        const postDelete = await Post.findOneAndDelete({
            _id: postId, 
            authorId: verifiedUser._id
        });

        if (!postDelete) throw new Error("Post not found");

        return "Post deleted";
    }
}

const addComment = {
    type: CommentType,
    description: "Add a comment to a post",
    args: { 
        comment: { type: GraphQLString },
        postId: { type: GraphQLID}
    },
    async resolve(_, args, {comment, postId}, {verifiedUser}) {
        const newComment = new Comment({
            comment,
            postId,
            userId: verifiedUser._id,
        })
        return newComment.save()
    }
}

module.exports = {
    register,
    login,
    createPost,
    updatePost,
    deletePost,
    addComment,
}
