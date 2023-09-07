import express from "express";
import cors from "cors";
import { randomBytes } from "node:crypto";
import axios from "axios";

const app = express();

// initialize middleware('s)
app.use(express.json());
app.use(cors());

// datastore
const posts = {};

function getRandomId(bytes = 4) {
  return randomBytes(bytes).toString("hex");
}

// define GET route for /posts - retrive all posts
app.get("/posts", (req, res) => {
  return res.json(posts);
});

// define POST route for /posts - create a new post
app.post("/posts/create", (req, res) => {
  const { content } = req.body;
  // get a random id for new post
  const postId = getRandomId();
  const post = { id: postId, content: content };

  // store the post in datastore
  posts[postId] = post;

  // send PostCreated event to event_bus
  axios
    .post("http://event-bus-srv:4010/events", {
      type: "PostCreated",
      data: post,
    })
    .catch(console.error);

  // return post object in response
  return res.status(201).json(post);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  return res.sendStatus(204);
});

const PORT = process.env.PORT || 4011;

app.listen(PORT, () => {
  console.info("[POSTS SERVICE]: running on port %d", PORT);
});
