require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
const dns = require('dns');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const e = require('express');
const {Schema} = mongoose;

// Basic Configuration
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('test');
const exercises = db.collection('exercises');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})
const userSchema = new Schema({
  username: String,
})



const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.use('/public', express.static(`${process.cwd()}/public`));

app.post('/api/users', async (req, res) => {
/*const newUser = {
  username: req.body.username
}
const {insertedId} = await exercises.insertOne(newUser);
const response = await exercises.findOne({_id: insertedId});*/
const {username, _id} = await User.create({username: req.body.username})
res.json({username, _id})

})

app.get('/api/users', async (req, res) => {
results = await User.find().select('-__v -log');
res.json(results)


})
app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const {_id, username} = await User.findOne({_id: id}).select('-__v');
  const description = req.body.description;
  const duration = +req.body.duration;
  const date = req.body?.date || new Date().toISOString().substring(0, 10);
  const newExercise = {date: date, duration: duration, description: description};
  console.log(newExercise);
  Exercise.create({username: id,
    description: description,
    duration: duration,
    date: date
  });
  res.json({username: username, description: description, duration: duration, date: new Date(date).toDateString(), _id: _id});

})

app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const {username} = await User.findOne({_id: id});
  const from = req.query.from || new Date(0).toISOString().substring(0, 10);
	const to =
		req.query.to || new Date(Date.now()).toISOString().substring(0, 10);
	const limit = Number(req.query.limit) || 0;

  let exercises = await Exercise.find({
		username: id,
		date: { $gte: from, $lte: to },
	})
		.select('-_id -__v -username')
		.limit(limit)
  /*const id = req.params._id;
  const {username} = await User.findOne({_id: id});
  const exercises = await Exercise.find({username: id}).select('-_id -__v -username').limit(limit);
  */
  /*let exercises = await Exercise.find({
		username: id,
		date: { $gte: from, $lte: to },
	})
		.select('-_id -__v -username')
		.limit(limit)*/
  
  const count = exercises.length;
  let parsedDatesLog = exercises.map((exercise) => {
		return {
			description: exercise.description,
			duration: exercise.duration,
			date: new Date(exercise.date).toDateString(),
		};
	});
  res.json({username: username, count: count, _id: id, log: parsedDatesLog})

})


/**
 * const from = req.query.from || new Date(0).toISOString().substring(0, 10);
	const to =
		req.query.to || new Date(Date.now()).toISOString().substring(0, 10);
	const limit = Number(req.query.limit) || 0;


  find({
		userId: userId,
		date: { $gte: from, $lte: to },
	})
		.select('description duration date')
		.limit(limit)
 */
