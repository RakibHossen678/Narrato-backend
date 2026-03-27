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
      index: true,
    },
    excerpt: {
      type: String,
      default: "",
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
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      index: true,
      unique: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
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
    readTimeMinutes: {
      type: Number,
      default: 1,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    bookmarkedBy: {
      type: [String],
      default: [],
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

  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.isModified("content") || this.isNew) {
    const words = String(this.content || "")
      .replace(/<[^>]+>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    this.readTimeMinutes = Math.max(1, Math.ceil(words.length / 220));
  }

  if (this.isModified("tags") && Array.isArray(this.tags)) {
    this.tags = this.tags
      .map((tag) =>
        String(tag || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
  }

  next();
});

BlogSchema.index({ isPublished: 1, publishedAt: -1, createdAt: -1 });
BlogSchema.index({ userId: 1, createdAt: -1 });
BlogSchema.index({ tags: 1, createdAt: -1 });
BlogSchema.index({ title: "text", excerpt: "text", content: "text" });

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
