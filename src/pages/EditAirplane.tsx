import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plane, ArrowLeft } from "lucide-react";
import Dropzone from "@/components/ui/dropzone"; 
import toast from "react-hot-toast";

// Definisi tipe data response dari Backend agar TypeScript tidak error (merah-merah)
interface GameData {
  id: string;
  name: string;
  description: string | null;
  thumbnail_image: string | null;
  is_published: boolean;
}

export default function EditAirplane() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Data Lama saat halaman dibuka
  useEffect(() => {
    const fetchGame = async () => {
        try {
            const response = await api.get(`/api/game/game-type/airplane/${id}`);
            // Casting response data ke Interface GameData
            const game = response.data.data as GameData;
            
            setTitle(game.name);
            setDescription(game.description || "");
            setCurrentThumbnail(game.thumbnail_image);
        } catch (error) {
            console.error("Failed to fetch game:", error);
            toast.error("Gagal mengambil data game.");
            navigate("/my-projects");
        } finally {
            setLoading(false);
        }
    };
    if (id) fetchGame();
  }, [id, navigate]);

  // 2. Handle Simpan Perubahan
  const handleSubmit = async () => {
    if (!title) return toast.error("Judul wajib diisi!");
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      // Hanya kirim gambar jika user mengupload file baru
      if (newThumbnail) {
          formData.append("thumbnail_image", newThumbnail);
      }

      // Endpoint PUT untuk update
      await api.put(`/api/game/game-type/airplane/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Game berhasil diupdate!");
      navigate("/my-projects"); 
    } catch (error) {
      console.error("Gagal update game:", error);
      toast.error("Terjadi kesalahan saat update game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin mb-4">
                <Plane className="w-10 h-10 text-sky-600" />
            </div>
            <p className="text-slate-500 font-medium">Mengambil data game...</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Tombol Back */}
        <Button 
            variant="ghost" 
            className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 transition-colors" 
            onClick={() => navigate("/my-projects")}
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke My Projects
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri: Header */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <Plane className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 rotate-[-15deg]" />
                    <div className="relative z-10">
                        <div className="bg-white/20 p-3 rounded-xl w-fit mb-4 backdrop-blur-sm">
                            <Plane className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Edit Game</h1>
                        <p className="text-orange-100 text-sm leading-relaxed">
                            Perbarui informasi game kamu agar tetap menarik bagi pemain.
                        </p>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan: Form Edit */}
            <div className="lg:col-span-2">
                <Card className="border-slate-200 shadow-lg bg-white">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-xl text-slate-800">Edit Informasi</CardTitle>
                        <CardDescription>Ubah judul, deskripsi, atau cover game.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-4">
                        {/* Judul */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Judul Game</label>
                            <Input 
                                placeholder="Judul Game" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-12 text-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            />
                        </div>
                        
                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
                            <Input 
                                placeholder="Deskripsi..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            />
                        </div>

                        {/* Upload Cover */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Thumbnail Game</label>
                            
                            {/* Preview Gambar Lama jika belum upload baru */}
                            {!newThumbnail && currentThumbnail && currentThumbnail !== 'default_image.jpg' && (
                                <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4">
                                    <img 
                                        src={currentThumbnail.startsWith('http') ? currentThumbnail : `${import.meta.env.VITE_API_URL}/${currentThumbnail}`} 
                                        alt="Current Cover" 
                                        className="w-24 h-16 object-cover rounded-md border bg-white"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600">Cover Saat Ini</p>
                                        <p className="text-xs text-slate-400">Upload baru di bawah untuk mengganti.</p>
                                    </div>
                                </div>
                            )}

                            <Dropzone
                                label="Ganti Cover (Opsional)"
                                allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
                                maxSize={2 * 1024 * 1024}
                                // Menggunakan 'any' agar TypeScript tidak rewel soal tipe File
                                onChange={(file: any) => setNewThumbnail(file)}
                            />
                        </div>

                        {/* Tombol Action */}
                        <div className="pt-4 flex justify-end">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                size="lg"
                                className="w-full md:w-auto min-w-[200px] bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200 transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Menyimpan...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" /> Simpan Perubahan
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
      </main>
    </div>
  );
}