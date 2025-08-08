import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const filesSchema = new mongoose.Schema(
  {
   upload_User:{
      ref:"User",
      type:mongoose.Schema.Types.ObjectId,
      required:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
      s3Key: {
      type: [String], 
      required: true,
    },
    files: {
      type: [String],
      required: true,
    },
     deletedAt: {
    type: Date,
  },
    isDeleted: {
    type: Boolean,
    default: false,
  },
  },
  { timestamps: true }
);

filesSchema.plugin(mongooseUniqueValidator);

const Files = mongoose.model("Files", filesSchema);

export default Files;
