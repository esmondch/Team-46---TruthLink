const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');  
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');

// Sample data for posts
let posts = [
    {
      id: 1,
      title: 'Is the Earth flat?',
      content: 'I heard some people claim the Earth is flat. Is this true?',
      username: 'user1', // Username of the post creator
      comments: [
        { id: 1, text: 'No, the Earth is round!', username: 'user2' }, // Username of the commenter
        { id: 2, text: 'There is scientific evidence to prove the Earth is round.', username: 'user3' }
      ]
    },
    {
      id: 2,
      title: 'Does drinking water improve skin?',
      content: 'I was told that drinking more water helps with skin health. Is this accurate?',
      username: 'user4', // Username of the post creator
      comments: [
        { id: 1, text: 'Yes, water helps with skin hydration!', username: 'user5' }
      ]
    }
];


// Home route (redirect to login page if not logged in)
app.get('/', (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect('/login');
  }
  res.render('index', { username: req.session.username, posts });
});

// Route to show login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  req.session.loggedIn = true;
  res.redirect('/');  // Redirect to home page after login
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
});

app.get('/post/create', (req, res) => {
    if (!req.session.loggedIn) {
      return res.redirect('/login');  // Redirect to login if not logged in
    }
    res.render('create', { username: req.session.username });  // Pass username to the view
});
  
// Route to display a single post
app.get('/post/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.send('Post not found');
    res.render('post', { post });
});

// Route to handle new post submissions
app.post('/post', (req, res) => {
    const newPost = {
        id: posts.length + 1,
        title: req.body.title,
        content: req.body.content,
        username: req.session.username,  // Get the username from the session
        comments: []  // Initialize with an empty comments array
    };
    posts.push(newPost);
    res.redirect('/');  // Redirect to home page to see the newly created post
});

// Route to handle comment submission
app.post('/post/:id/comment', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.send('Post not found');
    const newComment = {
        id: post.comments.length + 1,
        text: req.body.comment,
        username: req.session.username  // Get the username from the session
    };
    post.comments.push(newComment);
    res.redirect(`/post/${post.id}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
