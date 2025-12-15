import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Play, Eye, Heart, MessageSquare, ExternalLink, Filter } from "lucide-react";

const showcaseProjects = [
  {
    id: "1",
    title: "Legenda Nusantara",
    creator: "Studio Animasi Jakarta",
    category: "Animation",
    description: "Epic fantasy series based on Indonesian folklore featuring Gatotkaca and other legendary heroes.",
    thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=450&fit=crop",
    stats: { views: "125K", likes: "8.5K", comments: "342" },
    tags: ["Fantasy", "Animation", "Series"],
    featured: true,
  },
  {
    id: "2",
    title: "Kopi Pahit",
    creator: "Indie Films ID",
    category: "Drama",
    description: "A heartwarming story about a young barista discovering life lessons through her customers.",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=450&fit=crop",
    stats: { views: "89K", likes: "5.2K", comments: "198" },
    tags: ["Drama", "Slice of Life", "Feature"],
    featured: true,
  },
  {
    id: "3",
    title: "Cyber Jakarta 2077",
    creator: "Neon Studios",
    category: "Sci-Fi",
    description: "Cyberpunk thriller set in a futuristic Jakarta where technology and tradition collide.",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop",
    stats: { views: "156K", likes: "12K", comments: "567" },
    tags: ["Sci-Fi", "Thriller", "Series"],
    featured: true,
  },
  {
    id: "4",
    title: "Sang Penari",
    creator: "Tari Motion Pictures",
    category: "Drama",
    description: "A dancer's journey from traditional Javanese dance to contemporary expression.",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=450&fit=crop",
    stats: { views: "67K", likes: "4.1K", comments: "156" },
    tags: ["Drama", "Dance", "Feature"],
    featured: false,
  },
  {
    id: "5",
    title: "Petualangan Kancil",
    creator: "Animasi Anak Bangsa",
    category: "Animation",
    description: "Educational animated series teaching children about Indonesian wildlife and conservation.",
    thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=450&fit=crop",
    stats: { views: "234K", likes: "18K", comments: "892" },
    tags: ["Animation", "Kids", "Educational"],
    featured: false,
  },
  {
    id: "6",
    title: "Misteri Borobudur",
    creator: "Heritage Films",
    category: "Mystery",
    description: "Archaeological thriller uncovering ancient secrets hidden within Borobudur temple.",
    thumbnail: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=450&fit=crop",
    stats: { views: "98K", likes: "6.7K", comments: "234" },
    tags: ["Mystery", "Historical", "Feature"],
    featured: false,
  },
];

const categories = ["All", "Animation", "Drama", "Sci-Fi", "Mystery", "Comedy", "Horror"];

export default function ShowcasePage() {
  const featuredProjects = showcaseProjects.filter((p) => p.featured);
  const allProjects = showcaseProjects;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Creator <span className="text-violet-400">Showcase</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover amazing IP Bibles and creative projects built with MODO by our talented community.
          </p>
          <Link href="/auth?tab=register">
            <Button size="lg">
              <Sparkles className="w-5 h-5" />
              Start Your Project
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Projects</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <Card
                key={project.id}
                className={`overflow-hidden group ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
              >
                <div className={`relative ${index === 0 ? "aspect-video lg:aspect-[16/10]" : "aspect-video"} overflow-hidden`}>
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-violet-300 text-sm font-medium">{project.category}</span>
                    <h3 className={`font-bold text-white mt-1 ${index === 0 ? "text-2xl" : "text-xl"}`}>
                      {project.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2">{project.creator}</p>
                  </div>
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {project.stats.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {project.stats.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {project.stats.comments}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    cat === "All"
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{project.creator}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {project.stats.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {project.stats.likes}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Want to Be Featured?
          </h2>
          <p className="text-xl text-violet-200 mb-8">
            Submit your MODO project for a chance to be featured in our showcase and reach thousands of creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?tab=register">
              <Button size="xl" variant="white">
                <Sparkles className="w-5 h-5" />
                Start Creating
              </Button>
            </Link>
            <Button size="xl" variant="outlineLight">
              Submit Your Project
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
