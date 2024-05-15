import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "Please enter course title"],
        minLength:[4,"Title must be at least 4 character"],
        maxLength:[80,"Title can exceed 80 character"],
    },
    description:{
        type: String,
        required: [true, "Please enter course description"],
        minLength:[4,"Description must be at least 4 character"],
    },
    lectures:[
        {
            title:{
                type: String,
                required: true
            },
            description:{
                type: String,
                required: true
            },
            video:{
                public_id:{
                    type: String,
                    required: true
                },
                url:{
                    type: String,
                    required: true
                },
              },
        }
    ],
    poster:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        },
      },
    views: {
        type: Number,
        default: 0,
    },
    numberOfVideos: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: [true,"Enter course creator name"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});

export const Course = mongoose.model("Course",schema);