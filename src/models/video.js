import mongoose, { Schema } from "mongoose";
import moongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    videoFile: {
      type: String,
      reuqired: true,
    },
    thumbanil: {
      type: String,
      reuqired: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    viewes: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(moongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
