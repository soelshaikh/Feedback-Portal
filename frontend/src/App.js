// App.js (updated AnalysisPage & related fetch logic)
// Keep your existing imports; I include all at top for completeness.
import React, { useState, useEffect, useCallback, useMemo } from "react";
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

import { Star, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

// API URL (same as before)
// const API_URL = "https://feedback-portal-backend-emqg.onrender.com/api"; // adjust if needed
const API_URL = "http://localhost:5000/api"; // adjust if needed

// ------------------------- (Keep your questions and star rating components) -------------------------
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
    {
      id: "q6",
      text: "How often do you get new customers weekly?",
      type: "number",
    },
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

const StarRating = ({
  formData,
  hoverRating,
  setHoverRating,
  handleStarClick,
}) => {
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

// renderQuestion stays unchanged — copy your original
const renderQuestion = (
  q,
  formData,
  handleAnswerChange,
  handleCheckboxChange
) => {
  switch (q.type) {
    case "dropdown":
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

// ------------------------------ FeedbackForm (unchanged except props) ------------------------------
const FeedbackForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  handleAnswerChange,
  handleCheckboxChange,
  hoverRating,
  setHoverRating,
  handleStarClick,
  submitting,
}) => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6">
        We'd Love Your Feedback 💬
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-xl space-y-6"
      >
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Person Type *
          </label>
          <div className="flex flex-col gap-3">
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

        {questions.all.map((q) => (
          <div key={q.id}>
            <label className="font-medium">{q.text}</label>
            {renderQuestion(
              q,
              formData,
              handleAnswerChange,
              handleCheckboxChange
            )}
          </div>
        ))}

        {formData.personType === "Technician" &&
          questions.technician.map((q) => (
            <div key={q.id}>
              <label className="font-medium">{q.text}</label>
              {renderQuestion(
                q,
                formData,
                handleAnswerChange,
                handleCheckboxChange
              )}
            </div>
          ))}

        {formData.personType === "Customer" &&
          questions.customer.map((q) => (
            <div key={q.id}>
              <label className="font-medium">{q.text}</label>
              {renderQuestion(
                q,
                formData,
                handleAnswerChange,
                handleCheckboxChange
              )}
            </div>
          ))}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full p-3 rounded-lg text-white font-semibold flex items-center justify-center ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l3 3-3 3v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </form>
    </div>
  );
};

// 🔥 Map question IDs → Full Question Text
const QUESTION_TEXT_MAP = {
  q1: "How easy was it to find or offer a service?",
  q2: "Would you use this platform?",
  q3: "What feature do you wish we had?",
  q4: "How do you usually find technicians/customers today?",
  q5: "Would you recommend our platform to others?",
  q6: "How often do you get new customers weekly?",
  q7: "What commission % feels fair to you?",
  q8: "Would you prefer cash or digital payments?",
  q9: "How quickly do you expect a technician to arrive?",
  q10: "What matters most to you?",
};

// ------------------------------ New AnalysisPage (full-featured) ------------------------------
const AnalysisPage = ({ initialFeedbacks }) => {
  // pagination & table state
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // filters & sorting & search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [personTypeFilter, setPersonTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // analytics data
  const [summary, setSummary] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [choiceAnalytics, setChoiceAnalytics] = useState({});
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // fetch analytics once
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`${API_URL}/analytics`);
      const a = await res.json();
      setSummary(a.summary || null);
      setDistribution(a.distribution || []);
      const choicesRes = await fetch(`${API_URL}/analytics/choices`);
      const choicesData = await choicesRes.json();
      setChoiceAnalytics(choicesData.choices || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // fetch feedbacks with current params
  const fetchPage = useCallback(async () => {
    try {
      setLoadingTable(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (personTypeFilter) params.set("personType", personTypeFilter);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`${API_URL}/feedback?${params.toString()}`);
      const json = await res.json();
      setFeedbacks(json.feedbacks || []);
      setPage(json.page || 1);
      setPages(json.pages || 1);
      setLimit(json.limit || limit);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTable(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    personTypeFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  // reload when relevant inputs change
  useEffect(() => {
    setPage(1); // reset to first page when filters/search change
  }, [
    debouncedSearch,
    personTypeFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    limit,
  ]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage, page, limit]);

  // helper to render choice charts (bars) given key in choiceAnalytics
  const ChoiceBar = ({ qKey, title }) => {
    const data = (choiceAnalytics[qKey] || []).map((r) => ({
      name: r.option || "N/A",
      value: r.count,
    }));
    if (!data.length) return <div className="p-4">No data for {title}</div>;

    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // small helper to format date
  const fmt = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">Admin Feedback Dashboard</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <p>Total Feedbacks</p>
          <p className="text-3xl font-bold">{summary ? summary.total : "—"}</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg">
          <p>Average Rating</p>
          <p className="text-3xl font-bold">
            {summary ? Number(summary.avgRating).toFixed(2) : "—"} ⭐
          </p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <p>Customers</p>
          <p className="text-3xl font-bold">
            {summary ? summary.customerCount : "—"}
          </p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
          <p>Technicians</p>
          <p className="text-3xl font-bold">
            {summary ? summary.technicianCount : "—"}
          </p>
        </div>
      </div>

      {/* Filters / Search */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, comment, job role, q1..."
          className="p-2 border rounded w-full"
        />
        <select
          value={personTypeFilter}
          onChange={(e) => setPersonTypeFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="Customer">Customer</option>
          <option value="Technician">Technician</option>
        </select>
        <div className="flex items-center gap-2">
          <label className="text-sm">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="createdAt">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Charts: rating distribution + user distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-bold text-xl">Rating Distribution</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution.map((d, i) => {
                  const label = d._id === "other" ? "Other" : `${i + 1}`;
                  return { bucket: d._id, count: d.count || 0 };
                })}
              >
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-bold text-xl">Choice Questions - Snapshot</h2>
          <div className="grid grid-cols-1 gap-4">
            <ChoiceBar
              qKey="q1"
              title="How easy was it to find/offer a service?"
            />
            <ChoiceBar qKey="q8" title="Payment preference (q8)" />
          </div>
        </div>
      </div>

      {/* Per-question choice charts (q1, q2, q5, q8, q9, q10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChoiceBar
          qKey="q1"
          title="How easy was it to find/offer a service? (q1)"
        />
        <ChoiceBar qKey="q2" title="Would you use this platform? (q2)" />
        <ChoiceBar qKey="q5" title="Would you recommend (q5)" />
        <ChoiceBar qKey="q8" title="Payment preference (q8)" />
        <ChoiceBar qKey="q9" title="Arrival expectation (q9)" />
        <ChoiceBar qKey="q10" title="What matters most (q10 - checkbox)" />
      </div>

      {/* Feedback table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold text-xl mb-3">Feedbacks (Table)</h2>

        {loadingTable ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Rating</th>
                    <th className="p-2">Comment</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((f) => (
                    <tr
                      key={f._id}
                      className="border-t cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedFeedback(f);
                        setShowModal(true);
                      }}
                    >
                      <td className="p-2 font-semibold">{f.name}</td>
                      <td className="p-2">{f.personType}</td>
                      <td className="p-2">{f.rating}</td>
                      <td className="p-2">
                        {f.comment
                          ? f.comment.slice(0, 80) +
                            (f.comment.length > 80 ? "..." : "")
                          : "—"}
                      </td>
                      <td className="p-2">{fmt(f.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded mr-2"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="px-3 py-1 border rounded"
                >
                  Next
                </button>
              </div>
              <div>
                <span>
                  Page {page} / {pages} — Total: {total}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- FEEDBACK DETAILS MODAL --- */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Feedback Details</h2>

            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {selectedFeedback.name}
              </p>
              <p>
                <strong>Type:</strong> {selectedFeedback.personType}
              </p>
              <p>
                <strong>Job Role:</strong> {selectedFeedback.jobRole || "—"}
              </p>
              <p>
                <strong>Location:</strong> {selectedFeedback.location || "—"}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {selectedFeedback.rating}
              </p>
              <p>
                <strong>Comment:</strong> {selectedFeedback.comment || "—"}
              </p>

              <hr className="my-3" />

              <h3 className="text-xl font-semibold">Survey Answers</h3>

              {Object.entries(selectedFeedback.answers || {}).map(
                ([key, value]) => {
                  const questionText = QUESTION_TEXT_MAP[key] || key;
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : value;

                  return (
                    <p key={key}>
                      <strong>{questionText}:</strong> {displayValue || "—"}
                    </p>
                  );
                }
              )}
              <hr className="my-3" />

              <p>
                <strong>Submitted At:</strong>{" "}
                {new Date(selectedFeedback.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------------ MAIN APP (kept mostly same, but integrate AnalysisPage) ------------------------------
function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]); // no longer used for analysis large fetch
  const [formData, setFormData] = useState({
    name: "",
    personType: "Customer",
    jobRole: "",
    location: "",
    rating: 0,
    comment: "",
    answers: {},
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Use existing fetch for small sets (we won't call it each time analysis opens — AnalysisPage handles its own fetch)
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/feedback?page=1&limit=20`);
      const json = await res.json();
      setFeedbacks(json.feedbacks || []);
    } catch (err) {
      console.error(err);
    }
  };

  // keep behaviour: only fetch when necessary
  useEffect(() => {
    if (page === "home") {
      // nothing; home uses local state
    }
  }, [page]);

  // form handlers (unchanged)
  const handleInputChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAnswerChange = (id, value) =>
    setFormData((p) => ({ ...p, answers: { ...p.answers, [id]: value } }));
  const handleCheckboxChange = (id, option) => {
    const current = formData.answers[id] || [];
    const updated = current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option];
    handleAnswerChange(id, updated);
  };
  const handleStarClick = (rating) => setFormData((p) => ({ ...p, rating }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personType || !formData.rating)
      return toast.error("Please fill all required fields");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Feedback submitted successfully!");
        setFormData({
          name: "",
          personType: "Customer",
          jobRole: "",
          location: "",
          rating: 0,
          comment: "",
          answers: {},
        });
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (err) {
      toast.error("Server error. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* NAV */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-blue-600">
            Service Feedback Portal
          </h1>

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
            submitting={submitting}
          />
        ) : (
          <AnalysisPage />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 text-center mt-12">
        <p>Made by Soel Shaikh ❤️</p>
      </footer>
    </div>
  );
}

export default App;
