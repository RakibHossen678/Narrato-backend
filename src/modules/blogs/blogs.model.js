const mongoose = require("mongoose");
const customIdGenerator = require("../../utils/customIdGenerator");

const BlogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    blogId: {
      type: String,
      unique: true,
      required: [true, "Blog ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
    },
    authorBio: {
      type: String,
      required: [true, "Author bio is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    facebook: {
      type: String,
      required: [true, "Facebook is required"],
    },
    linkedin: {
      type: String,
      required: [true, "LinkedIn is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      required: function () {
        return this.isPaid;
      },
    },

    // Track *who* voted so you can prevent repeat votes and allow undo/switch.
    // (Stored as userId strings to match the rest of the schema.)
    votes: {
      upvoters: {
        type: [String],
        default: [],
      },
      downvoters: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Auto-generate blogId before saving
BlogSchema.plugin(customIdGenerator, {
  field: "blogId",
  prefix: "BLG",
  enableCondition: (blog) => !!blog.title,
});

// generate slug from title before saving
BlogSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
  }
  next();
});

BlogSchema.virtual("upvotesCount").get(function () {
  const upvoters = Array.isArray(this?.votes?.upvoters)
    ? this.votes.upvoters
    : [];
  return upvoters.length;
});

BlogSchema.virtual("downvotesCount").get(function () {
  const downvoters = Array.isArray(this?.votes?.downvoters)
    ? this.votes.downvoters
    : [];
  return downvoters.length;
});

BlogSchema.virtual("score").get(function () {
  const up = Array.isArray(this?.votes?.upvoters)
    ? this.votes.upvoters.length
    : 0;
  const down = Array.isArray(this?.votes?.downvoters)
    ? this.votes.downvoters.length
    : 0;
  return up - down;
});

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
