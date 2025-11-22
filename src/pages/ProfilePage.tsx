import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

import logo from "../assets/images/logo.svg";
import iconExplore from "../assets/images/icon-explore.svg";
import iconMyProjects from "../assets/images/icon-myprojects.svg";
import iconGamepad from "../assets/images/icon-gamepad.svg";
import iconPlay from "../assets/images/icon-play.svg";
import iconHeart from "../assets/images/icon-heart.svg";
import iconEdit from "../assets/images/icon-edit.svg";
import iconLock from "../assets/images/icon-lock.svg";
import iconLogout from "../assets/images/icon-logout.svg";

export default function ProfilePage() {
  const navigate = useNavigate();
  const logoutAction = useAuthStore((state) => state.logout);

  const [gamesCreated, setGamesCreated] = useState(0);

  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamesCreated = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/auth/me/game");
        setGamesCreated(response.data.meta.total);
      } catch (error) {
        console.error("Failed to fetch games created:", error);
        toast.error("Failed to fetch games created.");
      } finally {
        setLoading(false);
      }
    };
    fetchGamesCreated();
  }, []);

  const handleLogout = () => {
    logoutAction();
    navigate("/login");
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
          <a href="/">
            <img src={logo} alt="WordIT Logo" className="h-8" />
          </a>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="/" className="flex items-center gap-2">
                <img src={iconExplore} alt="" className="w-5 h-5" />
                <span>Explore</span>
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/my-projects" className="flex items-center gap-2">
                <img src={iconMyProjects} alt="" className="w-5 h-5" />
                <span>My Projects</span>
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage
                src={user?.profile_picture ?? undefined}
                alt="User Avatar"
              />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-900">
              {user?.username || "Username"}
            </span>
          </div>
        </div>
      </nav>

      {user && (
        <main className="max-w-4xl mx-auto py-10 px-6">
          <div className="pb-2 mb-6">
            <Typography variant="h2">Profile</Typography>
          </div>
          <div className="flex flex-col gap-5">
            <Card>
              <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={user?.profile_picture ?? undefined}
                    alt="User Avatar"
                  />
                  <AvatarFallback className="text-4xl">
                    {user?.username?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <Typography variant="h3">
                    {user.username || "Username"}
                  </Typography>
                  <Typography variant="muted" className="mt-1">
                    {user.email}
                  </Typography>
                </div>
              </CardContent>
            </Card>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card>
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <img
                      src={iconGamepad}
                      alt="Games Created"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <Typography variant="h3">
                      {loading ? "..." : gamesCreated}
                    </Typography>
                    <Typography variant="muted">Games Created</Typography>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <img src={iconPlay} alt="Total Plays" className="w-6 h-6" />
                  </div>
                  <div>
                    <Typography variant="h3">
                      {user.total_game_played}
                    </Typography>
                    <Typography variant="muted">Total Plays</Typography>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <img
                      src={iconHeart}
                      alt="Total Favorites"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <Typography variant="h3">
                      {user.total_game_liked}
                    </Typography>
                    <Typography variant="muted">Total Favorites</Typography>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 px-4 h-12"
                >
                  <img src={iconEdit} alt="" className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 px-4 h-12"
                >
                  <img src={iconLock} alt="" className="w-5 h-5" />
                  <span>Change Password</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-4 px-4 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <img src={iconLogout} alt="" className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </div>
  );
}
