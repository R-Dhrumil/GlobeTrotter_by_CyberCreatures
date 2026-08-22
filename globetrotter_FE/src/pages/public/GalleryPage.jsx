import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeo } from '../../context/SeoContext';
import { catalogAPI } from '../../api/client';
import { Lightbox } from '../../components/common/Lightbox';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Heart, Maximize2, Tag, Filter, MapPin } from 'lucide-react';

export const GalleryPage = () => {
  const { seoConfig } = useSeo();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxItem, setActiveLightboxItem] = useState(null);
  const [likedItems, setLikedItems] = useState({});

  const filterTags = ['ALL', 'Asia', 'Europe', 'North America', 'Adventure', 'Culture', 'Nature', 'Food & Drink'];

  useEffect(() => {
    fetchGallery();
  }, [selectedTag]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await catalogAPI.getGallery({
        tag: selectedTag !== 'ALL' ? selectedTag : undefined,
        search: searchQuery || undefined,
      });
      if (res.data?.items) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGallery();
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] pb-24">
      <Helmet>
        <title>{seoConfig.gallery.title}</title>
        <meta name="description" content={seoConfig.gallery.description} />
      </Helmet>

      {/* Header */}
      <div className="py-20 bg-stone-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 border border-amber-500/30">
            Visual Expedition Feed
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-4">
            Global Wanderlust Gallery
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
            A Pinterest-style visual waterfall showcasing breathtaking destinations, local cultural activities, and high-altitude adventures.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-premium border border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTag === tag
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search moments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Masonry / Waterfall Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <LoadingSpinner text="Rendering gallery waterfall..." />
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border border-stone-200">
            <p className="text-stone-500 font-medium">No moments found matching your criteria.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {items.map((item) => {
              const isLiked = likedItems[item.id];
              const likes = (item.likesCount || 100) + (isLiked ? 1 : 0);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveLightboxItem(item)}
                  className="masonry-item group relative rounded-3xl overflow-hidden shadow-soft hover:shadow-premium bg-stone-900 cursor-pointer border border-stone-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-white">
                    {/* Top action row */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                        {item.tag || item.category}
                      </span>
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition ${
                          isLiked ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom info row */}
                    <div>
                      <h4 className="text-base font-bold font-serif leading-tight">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-xs text-stone-300 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {item.subtitle}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20 text-[11px] text-stone-300">
                        <span>{likes} likes</span>
                        <span className="flex items-center gap-1 font-semibold text-amber-300">
                          <Maximize2 className="w-3 h-3" />
                          Expand
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={!!activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
        item={activeLightboxItem}
      />
    </div>
  );
};
