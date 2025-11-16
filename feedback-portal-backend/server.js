require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors()); // In production, consider restricting origin
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '50kb' }));

// Basic rate limiter (tune as needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

// MongoDB Connection - use env var
// const MONGODB_URI = "";
const MONGODB_URI = 'mongodb+srv://sohil1700:soel195170686047@cluster0.gsye0lz.mongodb.net/Feedback?appName=Cluster0';
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Exiting.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  personType: { type: String, required: true, enum: ['Customer', 'Technician'] },
  jobRole: String,
  location: String,
  rating: { type: Number, required: true, min: 0, max: 5 },
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
    q10: mongoose.Schema.Types.Mixed // checkbox may be array
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster filtering/sorting
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ personType: 1 });
feedbackSchema.index({ rating: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

// ------------------ Routes ------------------

// POST - Create new feedback (same as before but validate basic shape)
app.post('/api/feedback', async (req, res) => {
  try {
    // Basic server-side validation
    const { name, personType, rating } = req.body;
    if (!name || !personType || typeof rating === 'undefined') {
      return res.status(400).json({ error: 'name, personType and rating are required' });
    }

    // sanitize/limit fields as needed (example)
    const data = {
      name: String(name).trim().slice(0, 200),
      personType,
      jobRole: req.body.jobRole ? String(req.body.jobRole).slice(0,100) : undefined,
      location: req.body.location ? String(req.body.location).slice(0,100) : undefined,
      rating: Number(rating),
      comment: req.body.comment ? String(req.body.comment).slice(0,1000) : undefined,
      answers: req.body.answers || {}
    };

    const feedback = new Feedback(data);
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// GET - Paginated, searchable, filterable feedback list
// Query params:
//  - page (default 1), limit (default 20), search, personType, sortBy (createdAt|rating), sortOrder (asc|desc), from, to
app.get('/api/feedback', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const { search, personType, sortBy = 'createdAt', sortOrder = 'desc', from, to } = req.query;

    const match = {};

    // search across name, comment, jobRole, location and answers fields
    if (search && search.trim()) {
      const s = search.trim();
      match.$or = [
        { name: { $regex: s, $options: 'i' } },
        { comment: { $regex: s, $options: 'i' } },
        { jobRole: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { 'answers.q1': { $regex: s, $options: 'i' } },
        { 'answers.q2': { $regex: s, $options: 'i' } },
        { 'answers.q3': { $regex: s, $options: 'i' } },
        { 'answers.q4': { $regex: s, $options: 'i' } },
        { 'answers.q5': { $regex: s, $options: 'i' } }
      ];
    }

    if (personType) {
      match.personType = personType;
    }

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // total count for pagination
    const total = await Feedback.countDocuments(match);

    // fetch page
    const feedbacks = await Feedback.find(match)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('name personType jobRole location rating comment createdAt answers')
      .lean();

    res.json({ feedbacks, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// GET - Fetch single feedback
app.get('/api/feedback/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const feedback = await Feedback.findById(id).lean();
    if (!feedback) return res.status(404).json({ error: 'Not found' });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET - Analytics (summary + distribution + recent comments) using aggregation
app.get('/api/analytics', async (req, res) => {
  try {
    // Summary: count, avg rating, counts by personType
    const summaryAgg = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          customerCount: { $sum: { $cond: [{ $eq: ['$personType', 'Customer'] }, 1, 0] } },
          technicianCount: { $sum: { $cond: [{ $eq: ['$personType', 'Technician'] }, 1, 0] } }
        }
      }
    ]);

    const summary = summaryAgg[0] || { total: 0, avgRating: 0, customerCount: 0, technicianCount: 0 };

    // Rating distribution buckets
    const distribution = await Feedback.aggregate([
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 1.5, 2.5, 3.5, 4.5, 5.1],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // latest comments (limit 10)
    const latestComments = await Feedback.find({ comment: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name comment createdAt')
      .lean();

    res.json({ summary, distribution, latestComments });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET - Choice-based analytics for survey questions (q1, q2, q5, q8, q9, q10)
app.get('/api/analytics/choices', async (req, res) => {
  try {
    // We'll compute counts per distinct answer for each question
    // For q10 (checkbox), normalize by unwinding array
    const questions = ['q1', 'q2', 'q5', 'q8', 'q9'];

    // For simple choice questions: group by answers.qX
    const results = {};

    for (const q of questions) {
      const agg = await Feedback.aggregate([
        { $match: { [`answers.${q}`]: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: `$answers.${q}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      results[q] = agg.map((r) => ({ option: r._id, count: r.count }));
    }

    // q10 is checkboxes (array) - unwind
    const q10Agg = await Feedback.aggregate([
      { $match: { 'answers.q10': { $exists: true, $ne: null } } },
      { $unwind: '$answers.q10' },
      { $group: { _id: '$answers.q10', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    results['q10'] = q10Agg.map((r) => ({ option: r._id, count: r.count }));

    res.json({ choices: results });
  } catch (error) {
    console.error('Error computing choice analytics:', error);
    res.status(500).json({ error: 'Failed to compute choice analytics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
