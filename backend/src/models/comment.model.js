import mongoose, { Schema } from "mongoose";
import mongooseAggregatePagination from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

commentSchema.plugin(mongooseAggregatePagination);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
