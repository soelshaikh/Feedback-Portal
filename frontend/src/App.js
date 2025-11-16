import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Star,
  Menu,
  X,
  MessageSquare,
  Users,
  TrendingUp,
  MapPin,
} from "lucide-react";

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://feedback-portal-backend-emqg.onrender.com/api";

// ------------------------------
// QUESTIONS (Outside App)
// ------------------------------
const questions = {
  all: [
    {
      id: "q1",
      text: "How easy was it to find or offer a service?",
      type: "dropdown",
      options: ["Very easy", "Average", "Hard"],
    },
    {
      id: "q2",
      text: "Would you use this platform ?",
      type: "dropdown",
      options: ["Yes", "No"],
    },
    { id: "q3", text: "What feature do you wish we had?", type: "text" },
    {
      id: "q4",
      text: "How do you usually find technicians/customers today?",
      type: "text",
    },
    {
      id: "q5",
      text: "Would you recommend our platform to others?",
      type: "dropdown",
      options: ["Yes", "No"],
    },
  ],
  technician: [
    { id: "q6", text: "How often do you get new customers weekly?", type: "number" },
    { id: "q7", text: "What commission % feels fair to you?", type: "number" },
    {
      id: "q8",
      text: "Would you prefer cash or digital payments?",
      type: "dropdown",
      options: ["Cash", "UPI", "Card"],
    },
  ],
  customer: [
    {
      id: "q9",
      text: "How quickly do you expect a technician to arrive?",
      type: "dropdown",
      options: ["30 min", "1 hr", "2 hrs", "Same day"],
    },
    {
      id: "q10",
      text: "What matters most to you?",
      type: "checkbox",
      options: ["Price", "Trust", "Speed", "Reviews"],
    },
  ],
};

// ------------------------------
// STAR RATING COMPONENT
// ------------------------------
const StarRating = ({ formData, hoverRating, setHoverRating, handleStarClick }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative cursor-pointer">
          <Star
            size={32}
            className={`${
              formData.rating >= star || hoverRating >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleStarClick(star)}
          />

          {/* Half Star */}
          <div
            className="absolute top-0 left-0 w-1/2 h-full cursor-pointer"
            onMouseEnter={() => setHoverRating(star - 0.5)}
            onClick={() => handleStarClick(star - 0.5)}
          />
        </div>
      ))}

      <span className="ml-2 text-lg font-semibold text-gray-700">
        {formData.rating > 0 ? formData.rating : "Select rating"}
      </span>
    </div>
  );
};

// ------------------------------
// RENDER QUESTION COMPONENT
// ------------------------------
const renderQuestion = (q, formData, handleAnswerChange, handleCheckboxChange) => {
  switch (q.type) {
    case "dropdown":
      // Convert dropdown → radio
      return (
        <div className="space-y-2 pl-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100"
            >
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={formData.answers[q.id] === opt}
                onChange={() => handleAnswerChange(q.id, opt)}
                className="w-5 h-5"
              />
              <span className="text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-2 pl-2">
          {q.options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2 rounded-lg hover:bg-gray-100"
            >
              <input
                type="checkbox"
                checked={(formData.answers[q.id] || []).includes(opt)}
                onChange={() => handleCheckboxChange(q.id, opt)}
                className="w-5 h-5"
              />
              <span className="text-gray-800">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "number":
      return (
        <input
          type="number"
          value={formData.answers[q.id] || ""}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      );

    default:
      return (
        <input
          type="text"
          value={formData.answers[q.id] || ""}
          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      );
  }
};


// ------------------------------
// FEEDBACK FORM COMPONENT
// ------------------------------
const FeedbackForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  handleAnswerChange,
  handleCheckboxChange,
  hoverRating,
  setHoverRating,
  handleStarClick,
}) => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">We'd Love Your Feedback 💬</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg p-8 rounded-xl space-y-6">

        {/* Basic Inputs */}
        <input
          type="text"
          name="name"
          placeholder="Your name *"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          required
        />
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Person Type *</label>

  <div className="flex flex-col gap-3">

    {/* Customer Option */}
    <label
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
        formData.personType === "Customer"
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="personType"
        value="Customer"
        checked={formData.personType === "Customer"}
        onChange={handleInputChange}
        required
        className="w-5 h-5 text-blue-600"
      />
      <span className="font-medium">Customer</span>
    </label>

    {/* Technician Option */}
    <label
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
        formData.personType === "Technician"
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="personType"
        value="Technician"
        checked={formData.personType === "Technician"}
        onChange={handleInputChange}
        className="w-5 h-5 text-blue-600"
      />
      <span className="font-medium">Technician</span>
    </label>

  </div>
</div>


        <input
          type="text"
          name="jobRole"
          placeholder="Job role"
          value={formData.jobRole}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
        />

        {/* Rating */}
        <StarRating
          formData={formData}
          hoverRating={hoverRating}
          setHoverRating={setHoverRating}
          handleStarClick={handleStarClick}
        />

        <textarea
          name="comment"
          placeholder="Your comments..."
          value={formData.comment}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          rows={4}
        />

        <h2 className="text-xl font-bold pt-4">Survey Questions</h2>

        {/* Show Questions */}
        {questions.all.map((q) => (
          <div key={q.id}>
            <label className="font-medium">{q.text}</label>
            {renderQuestion(q, formData, handleAnswerChange, handleCheckboxChange)}
          </div>
        ))}

        {formData.personType === "Technician" &&
          questions.technician.map((q) => (
            <div key={q.id}>
              <label className="font-medium">{q.text}</label>
              {renderQuestion(q, formData, handleAnswerChange, handleCheckboxChange)}
            </div>
          ))}

        {formData.personType === "Customer" &&
          questions.customer.map((q) => (
            <div key={q.id}>
              <label className="font-medium">{q.text}</label>
              {renderQuestion(q, formData, handleAnswerChange, handleCheckboxChange)}
            </div>
          ))}

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

// ------------------------------
// ANALYSIS PAGE
// ------------------------------
const AnalysisPage = ({ feedbacks }) => {
  const totalFeedbacks = feedbacks.length;

  const avgRating =
    totalFeedbacks > 0
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / totalFeedbacks).toFixed(1)
      : 0;

  const customerCount = feedbacks.filter((f) => f.personType === "Customer").length;
  const technicianCount = feedbacks.filter((f) => f.personType === "Technician").length;

  const ratingCounts = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r}⭐`,
    count: feedbacks.filter((f) => f.rating >= r && f.rating < r + 1).length,
  }));

  const pieData = [
    { name: "Customers", value: customerCount, color: "#3b82f6" },
    { name: "Technicians", value: technicianCount, color: "#10b981" },
  ];

  const latestComments = feedbacks.filter((f) => f.comment).slice(-10).reverse();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Feedback Analysis 📊</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <p>Total Feedbacks</p>
          <p className="text-3xl font-bold">{totalFeedbacks}</p>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg">
          <p>Average Rating</p>
          <p className="text-3xl font-bold">{avgRating} ⭐</p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <p>Customers</p>
          <p className="text-3xl font-bold">{customerCount}</p>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
          <p>Technicians</p>
          <p className="text-3xl font-bold">{technicianCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-bold text-xl">Rating Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingCounts}>
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-bold text-xl">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" label cx="50%" cy="50%" outerRadius={100}>
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="font-bold text-xl mb-4">Latest Comments</h2>

        {latestComments.map((f, i) => (
          <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
            <p className="font-semibold">{f.name}</p>
            <p>{f.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------
// MAIN APP
// ------------------------------
function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    personType: "Customer",   // ⭐ DEFAULT SELECTED
    jobRole: "",
    location: "",
    rating: 0,
    comment: "",
    answers: {},
  });

  const [hoverRating, setHoverRating] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/feedback`);
      setFeedbacks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (page === "analysis") fetchFeedbacks();
  }, [page]);

  const handleInputChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAnswerChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      answers: { ...p.answers, [id]: value },
    }));
  };

  const handleCheckboxChange = (id, option) => {
    const current = formData.answers[id] || [];
    const updated = current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option];

    handleAnswerChange(id, updated);
  };

  const handleStarClick = (rating) => {
    setFormData((p) => ({ ...p, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personType || !formData.rating)
      return alert("Fill all required fields");

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Feedback Submitted!");
        setFormData({
          name: "",
          personType: "",
          jobRole: "",
          location: "",
          rating: 0,
          comment: "",
          answers: {},
        });
      } else {
        alert("Failed to submit!");
      }
    } catch (err) {
      alert("Backend not running");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* NAV */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Service Feedback Portal</h1>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="bg-white border-t">
            <button
              onClick={() => {
                setPage("home");
                setMenuOpen(false);
              }}
              className="block w-full px-4 py-2 hover:bg-gray-100"
            >
              Home
            </button>

            <button
              onClick={() => {
                setPage("analysis");
                setMenuOpen(false);
              }}
              className="block w-full px-4 py-2 hover:bg-gray-100"
            >
              Analysis
            </button>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <main className="py-8">
        {page === "home" ? (
          <FeedbackForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleAnswerChange={handleAnswerChange}
            handleCheckboxChange={handleCheckboxChange}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
            handleStarClick={handleStarClick}
          />
        ) : (
          <AnalysisPage feedbacks={feedbacks} />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
       <p>Made by Soel Shaikh ❤️</p>
      </footer>
    </div>
  );
}

export default App;
