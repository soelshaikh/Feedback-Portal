// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Option 1: Local MongoDB
// const MONGODB_URI = 'mongodb://localhost:27017/feedback_portal';

// Option 2: MongoDB Atlas (uncomment and add your connection string)
const MONGODB_URI = 'mongodb+srv://sohil1700:soel195170686047@cluster0.gsye0lz.mongodb.net/Feedback?appName=Cluster0';


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  personType: {
    type: String,
    required: true,
    enum: ['Customer', 'Technician']
  },
  jobRole: String,
  location: String,
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: String,
  answers: {
    q1: String,
    q2: String,
    q3: String,
    q4: String,
    q5: String,
    q6: String,
    q7: String,
    q8: String,
    q9: String,
    q10: mongoose.Schema.Types.Mixed // Can be string or array for checkboxes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes

// POST - Create new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET - Fetch all feedbacks
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// GET - Fetch feedback by ID
app.get('/api/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET - Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    
    const analytics = {
      totalFeedbacks: feedbacks.length,
      averageRating: feedbacks.length > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
        : 0,
      customerCount: feedbacks.filter(f => f.personType === 'Customer').length,
      technicianCount: feedbacks.filter(f => f.personType === 'Technician').length,
      ratingDistribution: {
        '5': feedbacks.filter(f => f.rating >= 4.5).length,
        '4': feedbacks.filter(f => f.rating >= 3.5 && f.rating < 4.5).length,
        '3': feedbacks.filter(f => f.rating >= 2.5 && f.rating < 3.5).length,
        '2': feedbacks.filter(f => f.rating >= 1.5 && f.rating < 2.5).length,
        '1': feedbacks.filter(f => f.rating < 1.5).length
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});