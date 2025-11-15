import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'it' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
    it: string;
    es: string;
  };
}

const translations: Translations = {
  // Header
  'header.title': { en: 'SwipeJob', fr: 'SwipeJob', it: 'SwipeJob', es: 'SwipeJob' },
  
  // Index/Landing
  'landing.hero.title': { en: 'Find Your Dream Job', fr: 'Trouvez Votre Emploi de Rêve', it: 'Trova il Tuo Lavoro dei Sogni', es: 'Encuentra Tu Trabajo Soñado' },
  'landing.hero.subtitle': { en: 'Swipe through opportunities, match with companies that value your talent', fr: 'Parcourez les opportunités, connectez-vous avec des entreprises qui valorisent votre talent', it: 'Scorri le opportunità, abbina le aziende che apprezzano il tuo talento', es: 'Desliza por oportunidades, conecta con empresas que valoran tu talento' },
  'landing.cta': { en: 'Start Swiping', fr: 'Commencer', it: 'Inizia', es: 'Comenzar' },
  'landing.feature1.title': { en: 'Quick & Easy', fr: 'Rapide et Facile', it: 'Veloce e Facile', es: 'Rápido y Fácil' },
  'landing.feature1.desc': { en: 'Swipe through jobs in seconds', fr: 'Parcourez les emplois en quelques secondes', it: 'Scorri i lavori in pochi secondi', es: 'Desliza trabajos en segundos' },
  'landing.feature2.title': { en: 'Perfect Matches', fr: 'Correspondances Parfaites', it: 'Abbinamenti Perfetti', es: 'Coincidencias Perfectas' },
  'landing.feature2.desc': { en: 'AI-powered job recommendations', fr: 'Recommandations d\'emploi par IA', it: 'Raccomandazioni di lavoro AI', es: 'Recomendaciones de trabajo con IA' },
  'landing.feature3.title': { en: 'Grow Your Career', fr: 'Développez Votre Carrière', it: 'Fai Crescere la Tua Carriera', es: 'Crece Tu Carrera' },
  'landing.feature3.desc': { en: 'Connect with top companies', fr: 'Connectez-vous avec les meilleures entreprises', it: 'Connettiti con le migliori aziende', es: 'Conecta con las mejores empresas' },
  
  // Swipe
  'swipe.interested': { en: 'Interested', fr: 'Intéressé', it: 'Interessato', es: 'Interesado' },
  'swipe.pass': { en: 'Pass', fr: 'Passer', it: 'Passa', es: 'Pasar' },
  'swipe.requirements': { en: 'Requirements', fr: 'Exigences', it: 'Requisiti', es: 'Requisitos' },
  'swipe.complete.title': { en: 'All Done!', fr: 'Terminé !', it: 'Tutto Fatto!', es: '¡Completado!' },
  'swipe.complete.desc': { en: 'You\'ve reviewed all available jobs. Check your matches!', fr: 'Vous avez consulté tous les emplois disponibles. Vérifiez vos correspondances !', it: 'Hai rivisto tutti i lavori disponibili. Controlla le tue corrispondenze!', es: '¡Has revisado todos los trabajos disponibles! ¡Revisa tus coincidencias!' },
  'swipe.complete.cta': { en: 'View Matches', fr: 'Voir les Correspondances', it: 'Visualizza Corrispondenze', es: 'Ver Coincidencias' },
  
  // Matches
  'matches.title': { en: 'Your Matches', fr: 'Vos Correspondances', it: 'Le Tue Corrispondenze', es: 'Tus Coincidencias' },
  'matches.new': { en: 'New', fr: 'Nouveau', it: 'Nuovo', es: 'Nuevo' },
  
  // Chat
  'chat.typing': { en: 'Type a message...', fr: 'Tapez un message...', it: 'Scrivi un messaggio...', es: 'Escribe un mensaje...' },
  
  // Profile
  'profile.title': { en: 'Profile', fr: 'Profil', it: 'Profilo', es: 'Perfil' },
  'profile.settings': { en: 'Settings', fr: 'Paramètres', it: 'Impostazioni', es: 'Configuración' },
  'profile.personalInfo': { en: 'Personal Information', fr: 'Informations Personnelles', it: 'Informazioni Personali', es: 'Información Personal' },
  'profile.name': { en: 'Name', fr: 'Nom', it: 'Nome', es: 'Nombre' },
  'profile.email': { en: 'Email', fr: 'Email', it: 'Email', es: 'Correo' },
  'profile.phone': { en: 'Phone', fr: 'Téléphone', it: 'Telefono', es: 'Teléfono' },
  'profile.location': { en: 'Location', fr: 'Localisation', it: 'Posizione', es: 'Ubicación' },
  'profile.bio': { en: 'Bio', fr: 'Biographie', it: 'Biografia', es: 'Biografía' },
  'profile.skills': { en: 'Skills', fr: 'Compétences', it: 'Competenze', es: 'Habilidades' },
  'profile.experience': { en: 'Experience', fr: 'Expérience', it: 'Esperienza', es: 'Experiencia' },
  'profile.save': { en: 'Save Changes', fr: 'Enregistrer', it: 'Salva', es: 'Guardar' },
  
  // Find
  'find.title': { en: 'Find Artists', fr: 'Trouver des Artistes', it: 'Trova Artisti', es: 'Encontrar Artistas' },
  'find.subtitle': { en: 'Choose a category to start swiping', fr: 'Choisissez une catégorie pour commencer', it: 'Scegli una categoria per iniziare', es: 'Elige una categoría para comenzar' },
  
  // Works
  'works.title': { en: 'Works', fr: 'Travaux', it: 'Lavori', es: 'Trabajos' },
  'works.add': { en: 'Add Work', fr: 'Ajouter un Travail', it: 'Aggiungi Lavoro', es: 'Agregar Trabajo' },
  'works.bio': { en: 'Description', fr: 'Description', it: 'Descrizione', es: 'Descripción' },
  'works.hashtags': { en: 'Hashtags (comma separated)', fr: 'Hashtags (séparés par des virgules)', it: 'Hashtag (separati da virgole)', es: 'Hashtags (separados por comas)' },
  'works.uploadImage': { en: 'Upload Image', fr: 'Télécharger une Image', it: 'Carica Immagine', es: 'Subir Imagen' },
  'works.submit': { en: 'Post Work', fr: 'Publier', it: 'Pubblica', es: 'Publicar' },
  'works.cancel': { en: 'Cancel', fr: 'Annuler', it: 'Annulla', es: 'Cancelar' },
  
  // Bottom Nav
  'nav.find': { en: 'Find', fr: 'Trouver', it: 'Trova', es: 'Buscar' },
  'nav.works': { en: 'Works', fr: 'Travaux', it: 'Lavori', es: 'Trabajos' },
  'nav.matches': { en: 'Matches', fr: 'Correspondances', it: 'Corrispondenze', es: 'Coincidencias' },
  'nav.opportunities': { en: 'Opportunities', fr: 'Opportunités', it: 'Opportunità', es: 'Oportunidades' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
