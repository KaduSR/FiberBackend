import React, { useEffect, useState } from 'react';
import { dataService } from '../services/api';
import { NewsItem } from '../types';
import { Calendar, ExternalLink, Newspaper, AlertTriangle } from 'lucide-react';

export const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await dataService.getNews();
        setNews(data);
      } catch (error) {
        console.error('Failed to load news', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-green-500/10 p-2 rounded-full">
          <Newspaper className="text-green-500 w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Notícias & Tecnologia</h2>
      </div>

      <div className="space-y-4">
        {news.map((item, index) => {
          // Lógica para determinar se a notícia é crítica para o status da conexão
          const isUrgent = index === 0 && (
            item.title.toLowerCase().includes('manutenção') ||
            item.title.toLowerCase().includes('aviso') ||
            item.title.toLowerCase().includes('instabilidade') ||
            item.title.toLowerCase().includes('queda') ||
            item.source.name === 'Aviso'
          );

          return (
            <div 
              key={index} 
              className={`group bg-zinc-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
                isUrgent ? 'border-red-900/50 shadow-lg shadow-red-900/20' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="h-40 overflow-hidden relative">
                 <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                 
                 {/* Selo de Importante */}
                 {isUrgent && (
                   <div className="absolute top-3 right-3 z-20">
                     <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg shadow-red-900/50 animate-pulse border border-red-400/30">
                       <AlertTriangle size={12} className="mr-1.5" strokeWidth={3} />
                       IMPORTANTE
                     </div>
                   </div>
                 )}

                 <div className="absolute bottom-3 left-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border backdrop-blur-md ${
                      isUrgent 
                        ? 'text-red-200 bg-red-900/40 border-red-500/30'
                        : 'text-green-400 bg-green-900/30 border-green-500/20'
                    }`}>
                      {item.source.name}
                    </span>
                 </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Calendar size={12} className="mr-1" />
                  {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                </div>
                
                <h3 className={`text-lg font-bold mb-2 leading-tight transition-colors ${
                  isUrgent ? 'text-white group-hover:text-red-400' : 'text-white group-hover:text-green-400'
                }`}>
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                  {item.description}
                </p>
                
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    isUrgent
                      ? 'bg-red-900/20 text-red-200 border-red-900/50 hover:bg-red-600 hover:text-white hover:border-red-500'
                      : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-green-600 hover:text-white hover:border-green-500'
                  }`}
                >
                  Ler matéria completa
                  <ExternalLink size={14} className="ml-2" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      
      {news.length === 0 && (
        <div className="text-center text-gray-500 py-10">
            <p>Nenhuma notícia encontrada no momento.</p>
        </div>
      )}
    </div>
  );
};