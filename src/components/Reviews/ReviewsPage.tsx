import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";

type Role = "GUEST" | "HOST" | "ADMIN" | string;

interface Booking {
  bookingId: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface ReviewDTO {
  reviewId: string;
  propertyId: string;
  userId: string;
  bookingId: string;
  rating: number;
  comment: string;
  hostResponse?: string | null;
  hostRespondedAt?: string | null;
  createdAt: string;
  userEmail?: string | null;
}

interface CreateReviewBody {
  bookingId: string;
  rating: number;
  comment: string;
}

interface RespondBody {
  response: string;
}

const decodeJwt = (token?: string) => {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"property" | "bookings">("property");
  const [propertyIdInput, setPropertyIdInput] = useState("");
  const [propertyReviews, setPropertyReviews] = useState<ReviewDTO[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);

  const [editingReview, setEditingReview] = useState<ReviewDTO | null>(null);
  const [respondingReview, setRespondingReview] = useState<ReviewDTO | null>(null);

  // Form state for create/edit/respond
  const [formRating, setFormRating] = useState<number>(5);
  const [formComment, setFormComment] = useState("");
  const [formBookingId, setFormBookingId] = useState<string>(""); // for create

  // current auth info
  const token = localStorage.getItem("token") ?? undefined;
  const decoded = decodeJwt(token);
  const currentEmail = decoded?.email ?? "";
  const role = (localStorage.getItem("role") as Role) || decoded?.role || "";

  // helper: fetch reviews for property
  const fetchReviewsForProperty = async (propId: string) => {
    if (!propId) {
      toast.error("Enter a Property ID");
      return;
    }
    setLoadingReviews(true);
    try {
      const res = await axiosClient.get<ReviewDTO[]>(`/api/reviews/property/${propId}`);
      setPropertyReviews(res.data || []);
      setPropertyIdInput(propId);
      setActiveTab("property");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load reviews");
      setPropertyReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // helper: fetch bookings for current user / host / admin
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      let endpoint = "/api/bookings/me";
      if (role === "HOST") endpoint = "/api/bookings/host/my";
      if (role === "ADMIN") endpoint = "/api/bookings/all";
      const res = await axiosClient.get<Booking[]>(endpoint);
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    // optional: fetch bookings on mount so guest can create reviews from bookings list
    fetchBookings();
  }, []);

  // map of bookingId -> whether reviewed (derived from propertyReviews)
  const reviewedBookingIds = useMemo(() => {
    const set = new Set<string>();
    propertyReviews.forEach((r) => {
      if (r.bookingId) set.add(r.bookingId);
    });
    return set;
  }, [propertyReviews]);

  // --- Create new review (guest) ---
  const openCreateModalForBooking = (booking: Booking) => {
    // Only allow completed bookings
    if (booking.status !== "COMPLETED") {
      toast.error("You can only review completed bookings");
      return;
    }
    // If this booking already has a review, block
    if (reviewedBookingIds.has(booking.bookingId)) {
      toast.error("This booking already has a review");
      return;
    }
    setFormBookingId(booking.bookingId);
    setFormRating(5);
    setFormComment("");
    setShowCreateModal(true);
  };

  const handleCreateReview = async () => {
    if (!formBookingId) {
      toast.error("Booking is required");
      return;
    }
    if (!formComment || formComment.trim().length < 3) {
      toast.error("Comment is required (min 3 chars)");
      return;
    }
    try {
      const body: CreateReviewBody = {
        bookingId: formBookingId,
        rating: formRating,
        comment: formComment.trim(),
      };
      const res = await axiosClient.post("/api/reviews", body);
      toast.success("Review posted");
      setShowCreateModal(false);
      // refresh reviews for its property (if we have the property in fetched list)
      // backend returns saved review; use it to update list
      const saved: ReviewDTO = res.data;
      if (saved && saved.propertyId && saved.propertyId === propertyIdInput) {
        setPropertyReviews((prev) => [saved, ...prev]);
      }
      // re-fetch bookings to update UI
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create review");
    }
  };

  // --- Edit review (guest) ---
  const openEditModal = (review: ReviewDTO) => {
    // only allow editing by author
    if (review.userEmail !== currentEmail) {
      toast.error("You can only edit your own reviews");
      return;
    }
    setEditingReview(review);
    setFormRating(review.rating);
    setFormComment(review.comment);
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    try {
      const body = { rating: formRating, comment: formComment.trim() };
      const res = await axiosClient.put(`/api/reviews/${editingReview.reviewId}`, body);
      toast.success("Review updated");
      setShowEditModal(false);
      // Update list locally
      const updated: ReviewDTO = res.data;
      setPropertyReviews((prev) => prev.map((r) => (r.reviewId === updated.reviewId ? updated : r)));
      setEditingReview(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  // --- Delete review (guest/admin) ---
  const handleDeleteReview = async (review: ReviewDTO) => {
    if (!window.confirm("Delete this review?")) return;
    // Only author or admin can delete; backend should enforce
    try {
      await axiosClient.delete(`/api/reviews/${review.reviewId}`);
      toast.success("Review deleted");
      setPropertyReviews((prev) => prev.filter((r) => r.reviewId !== review.reviewId));
      // refresh bookings if needed
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  // --- Host respond ---
  const openRespondModal = (review: ReviewDTO) => {
    if (role !== "HOST" && role !== "ADMIN") {
      toast.error("Only hosts/admins can respond");
      return;
    }
    setRespondingReview(review);
    setFormComment(review.hostResponse || "");
    setShowRespondModal(true);
  };

  const handleRespond = async () => {
    if (!respondingReview) return;
    if (!formComment || formComment.trim().length < 1) {
      toast.error("Response cannot be empty");
      return;
    }
    try {
      const body: RespondBody = { response: formComment.trim() };
      const res = await axiosClient.post(`/api/reviews/${respondingReview.reviewId}/response`, body);
      toast.success("Response saved");
      const updated: ReviewDTO = res.data;
      setPropertyReviews((prev) => prev.map((r) => (r.reviewId === updated.reviewId ? updated : r)));
      setShowRespondModal(false);
      setRespondingReview(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save response");
    }
  };

  // convenience: load reviews and optionally focus a property
  useEffect(() => {
    // nothing auto-loaded by default; user should search or click booking->view property etc.
  }, []);

  // UI small helpers
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h1>
            <p className="text-gray-500 mt-1">View, create and manage property reviews.</p>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <input
              value={propertyIdInput}
              onChange={(e) => setPropertyIdInput(e.target.value)}
              placeholder="Enter Property ID (e.g. property-uuid)"
              className="w-full sm:w-80 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={() => fetchReviewsForProperty(propertyIdInput)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
            >
              Search
            </button>
            <button
              onClick={() => {
                setPropertyIdInput("");
                setPropertyReviews([]);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("property")}
                className={`px-3 py-2 rounded-md font-medium ${
                  activeTab === "property" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Property Reviews
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-3 py-2 rounded-md font-medium ${
                  activeTab === "bookings" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                My Bookings
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {role ? <span>Signed in as <strong>{role}</strong></span> : <span>Not signed in</span>}
              {currentEmail && <span className="ml-3">({currentEmail})</span>}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "property" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Reviews for property: <span className="text-blue-600">{propertyIdInput || "—"}</span></h2>
                <p className="text-sm text-gray-500 mt-1">Showing latest reviews below. Hosts can respond; guests can edit/delete their reviews.</p>
              </div>

              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="p-6 text-center text-gray-500 italic">Loading reviews...</div>
                ) : propertyReviews.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 italic">No reviews found for this property.</div>
                ) : (
                  propertyReviews.map((r) => (
                    <div key={r.reviewId} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/6 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-500">{r.rating}★</div>
                          <div className="text-xs text-gray-400">Rated</div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm text-gray-600">By <span className="font-medium">{r.userEmail ?? r.userId}</span></div>
                            <div className="text-sm text-gray-400 mt-1">{formatDate(r.createdAt)}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* actions */}
                            {r.userEmail === currentEmail && (
                              <>
                                <button
                                  onClick={() => openEditModal(r)}
                                  className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(r)}
                                  className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  Delete
                                </button>
                              </>
                            )}

                            {(role === "HOST" || role === "ADMIN") && (
                              <button
                                onClick={() => openRespondModal(r)}
                                className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                              >
                                {r.hostResponse ? "Edit Response" : "Respond"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 text-gray-800 whitespace-pre-wrap">{r.comment}</div>

                        {r.hostResponse && (
                          <div className="mt-4 border-l-4 border-gray-100 pl-4">
                            <div className="text-sm text-gray-600">Host response</div>
                            <div className="mt-1 text-gray-800">{r.hostResponse}</div>
                            <div className="mt-2 text-xs text-gray-400">{formatDate(r.hostRespondedAt ?? undefined)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">My Bookings</h2>
                <p className="text-sm text-gray-500 mt-1">Completed bookings can be reviewed. Click a booking to add a review for that booking's property.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingBookings ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">Loading bookings...</td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">No bookings found</td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const alreadyReviewed = reviewedBookingIds.has(b.bookingId);
                        return (
                          <tr key={b.bookingId} className="border-t">
                            <td className="px-4 py-3">{b.propertyId}</td>
                            <td className="px-4 py-3">{b.startDate} → {b.endDate}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${b.status === "COMPLETED" ? "bg-green-100 text-green-800" : b.status === "CANCELED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => fetchReviewsForProperty(b.propertyId)}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                >
                                  View Property Reviews
                                </button>
                                {role === "GUEST" && b.status === "COMPLETED" && !alreadyReviewed && (
                                  <button
                                    onClick={() => openCreateModalForBooking(b)}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                                  >
                                    Add Review
                                  </button>
                                )}
                                {role === "GUEST" && alreadyReviewed && (
                                  <div className="text-sm text-gray-500 italic px-3 py-1">Reviewed</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Review Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
              <p className="text-sm text-gray-500 mb-4">Booking: <span className="font-medium">{formBookingId}</span></p>

              <label className="block mb-2 text-sm font-medium">Rating</label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(Number(e.target.value))}
                className="w-32 p-2 border rounded mb-4"
              >
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
              </select>

              <label className="block mb-2 text-sm font-medium">Comment</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={5}
                className="w-full border rounded p-2 mb-4"
                placeholder="Share your experience..."
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={handleCreateReview} className="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Review Modal */}
        {showEditModal && editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Edit Review</h3>
              <p className="text-sm text-gray-500 mb-4">Review: <span className="font-medium">{editingReview.reviewId}</span></p>

              <label className="block mb-2 text-sm font-medium">Rating</label>
              <select
                value={formRating}
                onChange={(e) => setFormRating(Number(e.target.value))}
                className="w-32 p-2 border rounded mb-4"
              >
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
              </select>

              <label className="block mb-2 text-sm font-medium">Comment</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={5}
                className="w-full border rounded p-2 mb-4"
              />

              <div className="flex justify-between items-center gap-3">
                <button onClick={() => { setShowEditModal(false); setEditingReview(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <div className="flex gap-2">
                  <button onClick={() => { setShowEditModal(false); setEditingReview(null); }} className="px-4 py-2 bg-red-500 text-white rounded">Close</button>
                  <button onClick={handleUpdateReview} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Respond Modal (Host) */}
        {showRespondModal && respondingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Respond to Review</h3>
              <p className="text-sm text-gray-500 mb-4">Review by <span className="font-medium">{respondingReview.userEmail ?? respondingReview.userId}</span> — {formatDate(respondingReview.createdAt)}</p>

              <label className="block mb-2 text-sm font-medium">Your response</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={5}
                className="w-full border rounded p-2 mb-4"
                placeholder="Write a polite helpful response..."
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowRespondModal(false); setRespondingReview(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button onClick={handleRespond} className="px-4 py-2 bg-green-600 text-white rounded">Save Response</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
