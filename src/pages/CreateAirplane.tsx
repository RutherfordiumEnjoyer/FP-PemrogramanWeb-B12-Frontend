import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Navbar from "@/components/ui/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plane, ArrowLeft } from "lucide-react";
import Dropzone from "@/components/ui/dropzone"; 
import toast from "react-hot-toast";

export default function CreateAirplane() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) return toast.error("Judul dan Deskripsi wajib diisi!");
    
    const finalTitle = title.toLowerCase().includes('airplane') ? title : `Airplane: ${title}`;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", finalTitle);
      formData.append("description", description);
      
      if (thumbnail) {
          formData.append("thumbnail_image", thumbnail);
      }

      const dummyGameData = {
          mode: "template_static",
          info: "Questions are hardcoded in frontend"
      };
      formData.append("game_data", JSON.stringify(dummyGameData));

      await api.post("/api/game/game-type/airplane", formData, {
          headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Game berhasil di-publish! Siap dimainkan.");
      navigate("/"); 
    } catch (error) {
      console.error("Gagal publish game:", error);
      toast.error("Terjadi kesalahan saat publish game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Navigation Back */}
        <Button 
            variant="ghost" 
            className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 transition-colors" 
            onClick={() => navigate("/create-projects")}
        >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Pilihan Template
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri: Info & Ilustrasi */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <Plane className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 rotate-[-15deg]" />
                    
                    <div className="relative z-10">
                        <div className="bg-white/20 p-3 rounded-xl w-fit mb-4 backdrop-blur-sm">
                            <Plane className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Publish Game Pesawat</h1>
                        <p className="text-sky-100 text-sm leading-relaxed">
                            Buat game pesawat serumu sendiri! Cukup isi detail di samping, upload cover yang menarik, dan game kamu siap dimainkan oleh semua orang.
                        </p>
                    </div>
                </div>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-slate-700">Tips Game Bagus</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-3 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                            <p>Gunakan judul yang singkat dan menarik.</p>
                        </div>
                        <div className="flex gap-3 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                            <p>Deskripsikan tantangan apa yang akan dihadapi pemain.</p>
                        </div>
                        <div className="flex gap-3 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                            <p>Upload gambar cover beresolusi tinggi agar terlihat profesional.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kolom Kanan: Form Input */}
            <div className="lg:col-span-2">
                <Card className="border-slate-200 shadow-lg bg-white">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-xl text-slate-800">Detail Game</CardTitle>
                        <CardDescription>Lengkapi informasi berikut untuk mempublikasikan gamemu.</CardDescription>
                    </CardHeader>
                    
                    {/* PERBAIKAN: space-y-4 (lebih rapat) dan pt-4 */}
                    <CardContent className="space-y-4 pt-4">
                        {/* Judul */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Judul Game</label>
                            <Input 
                                placeholder="Contoh: Misi Penyelamatan Langit" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-12 text-lg border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-all"
                            />
                            <p className="text-xs text-slate-400 italic">
                                *Sistem akan otomatis menambahkan tag "Airplane" jika belum ada.
                            </p>
                        </div>
                        
                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Deskripsi Singkat</label>
                            <Input 
                                placeholder="Jelaskan misi game ini dalam satu kalimat..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-12 border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-all"
                            />
                        </div>

                        {/* Upload Cover */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Thumbnail Game</label>
                            <Dropzone
                                label="Upload Cover Image (Max 2MB)"
                                allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
                                maxSize={2 * 1024 * 1024}
                                onChange={(file) => setThumbnail(file)}
                            />
                        </div>

                        {/* Tombol Action */}
                        <div className="pt-4 flex justify-end">
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                size="lg"
                                className="w-full md:w-auto min-w-[200px] bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200 transition-all active:scale-95"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" /> Publish Game
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