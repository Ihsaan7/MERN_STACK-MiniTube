import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/ui/Toast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  getUserPlaylists,
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../api/services/playlist.services";

const PlaylistsPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createIsPublic, setCreateIsPublic] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  // Delete states
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Toast and Confirm Dialog states
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Fetch playlists
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserPlaylists();
      console.log("Playlists response:", response);
      const playlistData = response.data || [];
      console.log("Playlist data:", playlistData);
      setPlaylists(playlistData);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setError(err.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  // Handle create playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createDescription.trim()) {
      return;
    }

    try {
      setCreateLoading(true);
      const response = await createPlaylist({
        name: createName.trim(),
        description: createDescription.trim(),
        isPublic: createIsPublic,
      });
      console.log("Create playlist response:", response);
      setShowCreateModal(false);
      setCreateName("");
      setCreateDescription("");
      setCreateIsPublic(true);
      await fetchPlaylists();
      setToast({ message: "Playlist created successfully", type: "success" });
    } catch (err) {
      console.error("Error creating playlist:", err);
      setToast({
        message: err.response?.data?.message || "Failed to create playlist",
        type: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit playlist
  const handleEditClick = (playlist) => {
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setEditDescription(playlist.description);
    setEditIsPublic(playlist.isPublic);
    setShowEditModal(true);
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editDescription.trim()) {
      return;
    }

    try {
      setEditLoading(true);
      await updatePlaylist(editingPlaylist._id, {
        name: editName.trim(),
        description: editDescription.trim(),
        isPublic: editIsPublic,
      });
      setShowEditModal(false);
      setEditingPlaylist(null);
      fetchPlaylists();
      setToast({ message: "Playlist updated successfully", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update playlist",
        type: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete playlist
  const handleDeletePlaylist = (playlistId) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this playlist?",
      onConfirm: async () => {
        try {
          setDeleteLoading(playlistId);
          await deletePlaylist(playlistId);
          fetchPlaylists();
          setToast({
            message: "Playlist deleted successfully",
            type: "success",
          });
        } catch (err) {
          setToast({
            message: err.response?.data?.message || "Failed to delete playlist",
            type: "error",
          });
        } finally {
          setDeleteLoading(null);
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  return (
    <Layout>
      <div className="flex">
        {/* Reusable Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div
          className={`flex-1 min-h-screen transition-colors duration-300 ${
            isDark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1
                  className={`text-4xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  My Playlists
                </h1>
                <p
                  className={`font-semibold ${
                    isDark ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Organize your favorite videos
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Playlist
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className={`mb-6 p-4 border-l-4 border-red-500 ${
                  isDark ? "bg-red-950/50" : "bg-red-50"
                }`}
              >
                <p
                  className={`text-sm ${
                    isDark ? "text-red-400" : "text-red-700"
                  }`}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`border animate-pulse ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <div
                      className={`aspect-video ${
                        isDark ? "bg-neutral-800" : "bg-neutral-200"
                      }`}
                    />
                    <div className="p-4 space-y-3">
                      <div
                        className={`h-4 rounded ${
                          isDark ? "bg-neutral-800" : "bg-neutral-200"
                        }`}
                      />
                      <div
                        className={`h-3 w-2/3 rounded ${
                          isDark ? "bg-neutral-800" : "bg-neutral-200"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : playlists.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <svg
                  className={`mx-auto w-24 h-24 mb-4 ${
                    isDark ? "text-neutral-700" : "text-neutral-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  No playlists yet
                </h3>
                <p
                  className={`mb-6 ${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  Create your first playlist to organize videos
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              /* Playlists Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className={`border overflow-hidden transition-all duration-300 cursor-pointer group rounded-lg ${
                      isDark
                        ? "bg-neutral-900 border-neutral-800 hover:border-orange-500"
                        : "bg-white border-neutral-200 hover:border-orange-500 shadow-md hover:shadow-xl"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                      className="relative aspect-video bg-linear-to-br from-orange-500 to-orange-700 cursor-pointer group rounded-t-lg"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg
                            className="w-16 h-16 mx-auto mb-2 opacity-80 group-hover:opacity-100 transition-opacity"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-2xl font-bold">
                            {playlist.videoCount || 0} videos
                          </p>
                        </div>
                      </div>
                      {!playlist.isPublic && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
                          PRIVATE
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3
                        onClick={() => navigate(`/playlist/${playlist._id}`)}
                        className={`text-lg font-semibold mb-2 cursor-pointer hover:text-orange-500 transition-colors line-clamp-2 ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {playlist.name}
                      </h3>
                      <p
                        className={`text-sm mb-4 line-clamp-2 ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        {playlist.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/playlist/${playlist._id}`)}
                          className={`flex-1 px-4 py-2 border font-medium transition-colors ${
                            isDark
                              ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(playlist)}
                          className={`px-4 py-2 border font-medium transition-colors ${
                            isDark
                              ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(playlist._id)}
                          disabled={deleteLoading === playlist._id}
                          className={`px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors disabled:opacity-50 ${
                            deleteLoading === playlist._id ? "cursor-wait" : ""
                          }`}
                        >
                          {deleteLoading === playlist._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg border ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <div className="p-6">
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Create New Playlist
              </h2>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Enter playlist name"
                    maxLength={60}
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Description *
                  </label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Describe your playlist"
                    rows={3}
                    maxLength={300}
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="createIsPublic"
                    checked={createIsPublic}
                    onChange={(e) => setCreateIsPublic(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="createIsPublic"
                    className={`text-sm ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Make this playlist public
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateName("");
                      setCreateDescription("");
                      setCreateIsPublic(true);
                    }}
                    className={`flex-1 px-4 py-3 border font-semibold ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className={`flex-1 px-4 py-3 font-semibold ${
                      createLoading
                        ? "bg-neutral-600 cursor-wait"
                        : "bg-orange-500 hover:bg-orange-600"
                    } text-white transition-colors`}
                  >
                    {createLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && editingPlaylist && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-lg border ${
              isDark
                ? "bg-neutral-900 border-neutral-800"
                : "bg-white border-neutral-200"
            }`}
          >
            <div className="p-6">
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                Edit Playlist
              </h2>
              <form onSubmit={handleUpdatePlaylist} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter playlist name"
                    maxLength={60}
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Description *
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe your playlist"
                    rows={3}
                    maxLength={300}
                    className={`w-full px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                      isDark
                        ? "bg-neutral-950 border-neutral-800 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="editIsPublic"
                    className={`text-sm ${
                      isDark ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Make this playlist public
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPlaylist(null);
                    }}
                    className={`flex-1 px-4 py-3 border font-semibold ${
                      isDark
                        ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex-1 px-4 py-3 font-semibold ${
                      editLoading
                        ? "bg-neutral-600 cursor-wait"
                        : "bg-orange-500 hover:bg-orange-600"
                    } text-white transition-colors`}
                  >
                    {editLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </Layout>
  );
};

export default PlaylistsPage;
