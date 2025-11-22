import { useState, useEffect } from "react";
import api from "@/api/axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

import logo from "../assets/images/logo.svg";
import { useNavigate } from "react-router-dom";
import iconExplore from "../assets/images/icon-explore.svg";
import { useAuthStore } from "@/store/useAuthStore";
import iconMyProjects from "../assets/images/icon-myprojects.svg";
import thumbnailPlaceholder from "../assets/images/thumbnail-placeholder.png";
import iconPlus from "../assets/images/icon-plus.svg";
import iconSearch from "../assets/images/icon-search.svg";
import iconFolderLarge from "../assets/images/icon-folder-large.svg";
import iconEdit from "../assets/images/icon-edit.svg";
import iconPublish from "../assets/images/icon-eye.svg";
import iconUnpublish from "../assets/images/icon-eye-off.svg";
import iconDelete from "../assets/images/icon-trash.svg";

type Project = {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  is_published: boolean;
  game_template: number;
};

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/auth/me/game");
        setProjects(response.data.data);
      } catch (err) {
        setError("Failed to fetch projects. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const Navbar = () => (
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
          <Button variant="secondary" asChild>
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
            {user?.username}
          </span>
        </div>
      </div>
    </nav>
  );

  if (loading)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3">Loading...</Typography>
      </div>
    );
  if (error)
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Typography variant="h3" className="text-destructive">
          {error}
        </Typography>
      </div>
    );

  const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center text-center p-12 md:p-20 mt-6">
      <img
        src={iconFolderLarge}
        alt="No projects"
        className="w-20 h-20 mb-6 text-gray-400"
      />
      <Typography variant="h3" className="mb-2">
        You haven't created any games yet
      </Typography>
      <Typography variant="muted" className="max-w-sm mb-8">
        Get started by choosing a template and building your first educational
        game.
      </Typography>
      <Button
        size="lg"
        className="w-full max-w-xs"
        onClick={() => navigate("/create-quiz")}
      >
        <img src={iconPlus} alt="" className="w-5 h-5 mr-2" />
        Create Your First Game
      </Button>
    </Card>
  );

  const ProjectList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-1 mt-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="relative p-4 h-fit sm:h-80 md:h-fit cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/quiz/${project.id}`)}
        >
          <div className="w-full h-full flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="w-full h-full flex flex-col md:flex-row md:items-center gap-4">
              <img
                src={
                  project.thumbnail_image
                    ? `${import.meta.env.VITE_API_URL}/${project.thumbnail_image}`
                    : thumbnailPlaceholder
                }
                alt={
                  project.thumbnail_image
                    ? project.name
                    : "Placeholder Thumbnail"
                }
                className="w-full md:w-28 md:h-24 rounded-md object-cover"
              />
              <div className="flex flex-col md:gap-6 justify-between items-stretch h-full w-full">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Typography variant="p" className="font-semibold">
                      {project.name}
                    </Typography>
                    <Typography
                      variant="p"
                      className="text-sm text-muted-foreground"
                    >
                      {project.description}
                    </Typography>
                  </div>
                  <div className="md:hidden">
                    <Badge
                      variant={project.is_published ? "default" : "destructive"}
                      className={
                        project.is_published
                          ? "capitalize bg-green-100 text-green-800"
                          : "capitalize bg-yellow-100 text-yellow-800"
                      }
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6 md:mt-2">
                  <Button variant="outline" size="sm" className="h-7">
                    <img src={iconEdit} alt="" className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  {project.is_published ? (
                    <Button variant="outline" size="sm" className="h-7">
                      <img
                        src={iconUnpublish}
                        alt=""
                        className="w-3.5 h-3.5 mr-1.5"
                      />
                      Unpublish
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="h-7">
                      <img
                        src={iconPublish}
                        alt=""
                        className="w-3.5 h-3.5 mr-1.5"
                      />
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive"
                  >
                    <img
                      src={iconDelete}
                      alt=""
                      className="w-3.5 h-3.5 mr-1.5"
                    />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side: Badge */}
            <div className="hidden md:block">
              <Badge
                variant={project.is_published ? "default" : "destructive"}
                className={
                  project.is_published
                    ? "text-sm px-3 bg-green-100 text-green-800"
                    : "text-sm px-3 bg-yellow-100 text-yellow-800"
                }
              >
                {project.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Typography variant="h2">
              My Projects ({projects.length})
            </Typography>
            <Typography variant="muted">
              Manage your educational games
            </Typography>
          </div>
          <Button onClick={() => navigate("/create-quiz")}>
            <img src={iconPlus} alt="" className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </div>
        <div className="mt-6 relative">
          <img
            src={iconSearch}
            alt=""
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search your projects..." className="pl-10" />
        </div>
        {projects.length === 0 ? <EmptyState /> : <ProjectList />}
      </main>
    </div>
  );
}
