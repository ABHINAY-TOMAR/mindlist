
import React from 'react';

const Explore: React.FC = () => {
  const playlists = [
    { title: "Introduction to Quantum Physics", author: "ScienceDaily", videos: 12, views: "1.2M", img: "https://picsum.photos/seed/physics/400/225" },
    { title: "Organic Chemistry Masterclass", author: "ChemWorld", videos: 45, views: "850K", img: "https://picsum.photos/seed/chem/400/225" },
    { title: "Behavioral Economics", author: "MindTheory", videos: 8, views: "200K", img: "https://picsum.photos/seed/econ/400/225" },
    { title: "Deep Learning Foundations", author: "AI Labs", videos: 30, views: "3M", img: "https://picsum.photos/seed/ai/400/225" },
    { title: "Modern Art History", author: "MuseumX", videos: 15, views: "450K", img: "https://picsum.photos/seed/art/400/225" },
    { title: "Advanced Calculus II", author: "MathHub", videos: 22, views: "150K", img: "https://picsum.photos/seed/math/400/225" },
  ];

  const shorts = [
    { title: "DNA Explained in 60s", author: "BioFlash", img: "https://picsum.photos/seed/dna/200/350" },
    { title: "The P vs NP Problem", author: "LogicByte", img: "https://picsum.photos/seed/logic/200/350" },
    { title: "Black Holes Facts", author: "SpaceX", img: "https://picsum.photos/seed/space/200/350" },
    { title: "Photosynthesis Demo", author: "GreenThumb", img: "https://picsum.photos/seed/green/200/350" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 bg-blue-500 h-8 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Trending Playlists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((pl, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800">
                <img src={pl.img} alt={pl.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-2 right-2 bg-slate-900/90 px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                  <i className="fas fa-list text-[8px]"></i> {pl.videos} VIDEOS
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl">
                    <i className="fas fa-play text-white ml-1"></i>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="font-bold text-slate-100 line-clamp-1">{pl.title}</h3>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <span>{pl.author}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{pl.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 bg-red-500 h-8 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Study Shorts</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {shorts.map((sh, i) => (
            <div key={i} className="flex-shrink-0 w-44 space-y-3 cursor-pointer group">
              <div className="relative h-72 rounded-2xl overflow-hidden border border-slate-800">
                <img src={sh.img} alt={sh.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex flex-col justify-end p-3">
                  <p className="text-xs text-white font-bold line-clamp-2">{sh.title}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{sh.author}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;
