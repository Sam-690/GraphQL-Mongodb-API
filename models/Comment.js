const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
    {
        comment: { 
            type: 'string', 
            required: true 
        },
        userId: { 
            type: 'string', 
            required: true
        },
        postId: {
            type: 'string',
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = model("Comment", commentSchema);