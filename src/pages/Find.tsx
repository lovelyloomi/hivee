import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { id: 'graphic-design', name: 'Graphic Design', color: 'bg-gradient-to-br from-pink-500 to-purple-500' },
  { id: 'illustration', name: 'Illustration', color: 'bg-gradient-to-br from-purple-500 to-blue-500' },
  { id: 'photography', name: 'Photography', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { id: 'ui-ux', name: 'UI/UX Design', color: 'bg-gradient-to-br from-cyan-500 to-teal-500' },
  { id: 'animation', name: 'Animation', color: 'bg-gradient-to-br from-teal-500 to-green-500' },
  { id: 'video', name: 'Video Editing', color: 'bg-gradient-to-br from-green-500 to-yellow-500' },
  { id: '3d', name: '3D Modeling', color: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
  { id: 'music', name: 'Music Production', color: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: 'writing', name: 'Content Writing', color: 'bg-gradient-to-br from-red-500 to-pink-500' },
];

const Find = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/swipe?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t('find.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('find.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group relative aspect-square rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className={`absolute inset-0 ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="relative h-full flex items-center justify-center p-6">
                <span className="text-white font-bold text-lg text-center drop-shadow-lg">
                  {category.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Find;
