import React from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-bold mb-4">Welcome to MiniTube!</h2>
          <p className="text-gray-600 mb-4">
            🎉 Your video platform is ready to go!
          </p>

          {/* User Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Your Profile:</h3>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={user?.avatar || "https://via.placeholder.com/80"}
                alt={user?.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="space-y-1">
                <p className="text-xl font-semibold">{user?.fullName}</p>
                <p className="text-gray-600">@{user?.username}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Placeholder for video feed */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Video Feed</h3>
            <p className="text-gray-500 text-center py-8">
              📹 Videos will appear here once you upload them!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
