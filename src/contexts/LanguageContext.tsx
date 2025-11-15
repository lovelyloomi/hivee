import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'it' | 'es' | 'zh' | 'ja' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
    it: string;
    es: string;
    zh: string;
    ja: string;
    ar: string;
  };
}

const translations: Translations = {
  // Header
  'header.title': { en: 'SwipeJob', fr: 'SwipeJob', it: 'SwipeJob', es: 'SwipeJob', zh: 'SwipeJob', ja: 'SwipeJob', ar: 'SwipeJob' },
  
  // Index/Landing
  'landing.hero.title': { 
    en: 'Find Your Dream Job', 
    fr: 'Trouvez Votre Emploi de Rêve', 
    it: 'Trova il Tuo Lavoro dei Sogni', 
    es: 'Encuentra Tu Trabajo Soñado',
    zh: '找到您的理想工作',
    ja: '夢の仕事を見つけよう',
    ar: 'ابحث عن وظيفة أحلامك'
  },
  'landing.hero.subtitle': { 
    en: 'Swipe through opportunities, match with companies that value your talent', 
    fr: 'Parcourez les opportunités, connectez-vous avec des entreprises qui valorisent votre talent', 
    it: 'Scorri le opportunità, abbina le aziende che apprezzano il tuo talento', 
    es: 'Desliza por oportunidades, conecta con empresas que valoran tu talento',
    zh: '浏览机会，与重视您才能的公司匹配',
    ja: '機会をスワイプして、あなたの才能を評価する企業とマッチング',
    ar: 'تصفح الفرص، تواصل مع الشركات التي تقدر موهبتك'
  },
  'landing.cta': { en: 'Start Swiping', fr: 'Commencer', it: 'Inizia', es: 'Comenzar', zh: '开始浏览', ja: 'スワイプ開始', ar: 'ابدأ التصفح' },
  'landing.feature1.title': { en: 'Quick & Easy', fr: 'Rapide et Facile', it: 'Veloce e Facile', es: 'Rápido y Fácil', zh: '快速简单', ja: '迅速で簡単', ar: 'سريع وسهل' },
  'landing.feature1.desc': { en: 'Swipe through jobs in seconds', fr: 'Parcourez les emplois en quelques secondes', it: 'Scorri i lavori in pochi secondi', es: 'Desliza trabajos en segundos', zh: '几秒钟内浏览工作', ja: '数秒で仕事をスワイプ', ar: 'تصفح الوظائف في ثوانٍ' },
  'landing.feature2.title': { en: 'Perfect Matches', fr: 'Correspondances Parfaites', it: 'Abbinamenti Perfetti', es: 'Coincidencias Perfectas', zh: '完美匹配', ja: '完璧なマッチング', ar: 'تطابقات مثالية' },
  'landing.feature2.desc': { en: 'AI-powered job recommendations', fr: "Recommandations d'emploi par IA", it: 'Raccomandazioni di lavoro AI', es: 'Recomendaciones de trabajo con IA', zh: 'AI智能工作推荐', ja: 'AI搭載の求人推薦', ar: 'توصيات وظيفية بالذكاء الاصطناعي' },
  'landing.feature3.title': { en: 'Grow Your Career', fr: 'Développez Votre Carrière', it: 'Fai Crescere la Tua Carriera', es: 'Crece Tu Carrera', zh: '发展您的职业', ja: 'キャリアを成長させる', ar: 'نمِّ مسيرتك المهنية' },
  'landing.feature3.desc': { en: 'Connect with top companies', fr: 'Connectez-vous avec les meilleures entreprises', it: 'Connettiti con le migliori aziende', es: 'Conecta con las mejores empresas', zh: '与顶尖公司联系', ja: 'トップ企業とつながる', ar: 'تواصل مع أفضل الشركات' },
  
  // Swipe
  'swipe.interested': { en: 'Interested', fr: 'Intéressé', it: 'Interessato', es: 'Interesado', zh: '感兴趣', ja: '興味あり', ar: 'مهتم' },
  'swipe.pass': { en: 'Pass', fr: 'Passer', it: 'Passa', es: 'Pasar', zh: '跳过', ja: 'パス', ar: 'تخطي' },
  'swipe.requirements': { en: 'Requirements', fr: 'Exigences', it: 'Requisiti', es: 'Requisitos', zh: '要求', ja: '要件', ar: 'المتطلبات' },
  'swipe.complete.title': { en: 'All Done!', fr: 'Terminé !', it: 'Tutto Fatto!', es: '¡Completado!', zh: '全部完成！', ja: '完了！', ar: 'تم!' },
  'swipe.complete.desc': { en: "You've reviewed all available jobs. Check your matches!", fr: 'Vous avez consulté tous les emplois disponibles. Vérifiez vos correspondances !', it: 'Hai rivisto tutti i lavori disponibili. Controlla le tue corrispondenze!', es: '¡Has revisado todos los trabajos disponibles! ¡Revisa tus coincidencias!', zh: '您已浏览所有可用的工作。查看您的匹配！', ja: '利用可能なすべての仕事を確認しました。マッチングをチェック！', ar: 'لقد راجعت جميع الوظائف المتاحة. تحقق من تطابقاتك!' },
  'swipe.complete.cta': { en: 'View Matches', fr: 'Voir les Correspondances', it: 'Visualizza Corrispondenze', es: 'Ver Coincidencias', zh: '查看匹配', ja: 'マッチングを見る', ar: 'عرض التطابقات' },
  
  // Matches
  'matches.title': { en: 'Your Matches', fr: 'Vos Correspondances', it: 'Le Tue Corrispondenze', es: 'Tus Coincidencias', zh: '您的匹配', ja: 'あなたのマッチング', ar: 'تطابقاتك' },
  'matches.new': { en: 'New', fr: 'Nouveau', it: 'Nuovo', es: 'Nuevo', zh: '新', ja: '新規', ar: 'جديد' },
  'matches.message': { en: 'Message', fr: 'Message', it: 'Messaggio', es: 'Mensaje', zh: '消息', ja: 'メッセージ', ar: 'رسالة' },
  'matches.noMatches': { en: 'No matches yet', fr: 'Pas encore de correspondances', it: 'Nessuna corrispondenza ancora', es: 'Aún sin coincidencias', zh: '还没有匹配', ja: 'マッチングはまだありません', ar: 'لا توجد تطابقات بعد' },
  
  // Chat
  'chat.typing': { en: 'Type a message...', fr: 'Tapez un message...', it: 'Scrivi un messaggio...', es: 'Escribe un mensaje...', zh: '输入消息...', ja: 'メッセージを入力...', ar: 'اكتب رسالة...' },
  'chat.send': { en: 'Send', fr: 'Envoyer', it: 'Invia', es: 'Enviar', zh: '发送', ja: '送信', ar: 'إرسال' },
  'chat.attachment': { en: 'Attachment', fr: 'Pièce jointe', it: 'Allegato', es: 'Adjunto', zh: '附件', ja: '添付', ar: 'مرفق' },
  'chat.block': { en: 'Block User', fr: "Bloquer l'utilisateur", it: 'Blocca utente', es: 'Bloquear usuario', zh: '屏蔽用户', ja: 'ユーザーをブロック', ar: 'حظر المستخدم' },
  'chat.report': { en: 'Report User', fr: "Signaler l'utilisateur", it: 'Segnala utente', es: 'Reportar usuario', zh: '举报用户', ja: 'ユーザーを報告', ar: 'الإبلاغ عن المستخدم' },
  'chat.unmatch': { en: 'Unmatch', fr: 'Défaire la correspondance', it: 'Rimuovi corrispondenza', es: 'Deshacer coincidencia', zh: '取消匹配', ja: 'マッチング解除', ar: 'إلغاء التطابق' },
  
  // Profile
  'profile.title': { en: 'Profile', fr: 'Profil', it: 'Profilo', es: 'Perfil', zh: '个人资料', ja: 'プロフィール', ar: 'الملف الشخصي' },
  'profile.about': { en: 'About', fr: 'À propos', it: 'Informazioni', es: 'Acerca de', zh: '关于', ja: 'について', ar: 'حول' },
  'profile.portfolio': { en: 'Portfolio', fr: 'Portfolio', it: 'Portfolio', es: 'Portafolio', zh: '作品集', ja: 'ポートフォリオ', ar: 'المحفظة' },
  'profile.activity': { en: 'Activity', fr: 'Activité', it: 'Attività', es: 'Actividad', zh: '活动', ja: 'アクティビティ', ar: 'النشاط' },
  'profile.skills': { en: 'Skills', fr: 'Compétences', it: 'Competenze', es: 'Habilidades', zh: '技能', ja: 'スキル', ar: 'المهارات' },
  'profile.programs': { en: 'Programs', fr: 'Programmes', it: 'Programmi', es: 'Programas', zh: '软件', ja: 'プログラム', ar: 'البرامج' },
  'profile.bio': { en: 'Bio', fr: 'Biographie', it: 'Biografia', es: 'Biografía', zh: '简介', ja: '自己紹介', ar: 'السيرة الذاتية' },
  'profile.location': { en: 'Location', fr: 'Localisation', it: 'Posizione', es: 'Ubicación', zh: '位置', ja: '場所', ar: 'الموقع' },
  'profile.noWorks': { en: 'No works yet', fr: 'Pas encore de travaux', it: 'Nessun lavoro ancora', es: 'Aún sin trabajos', zh: '还没有作品', ja: '作品はまだありません', ar: 'لا توجد أعمال بعد' },
  'profile.settings': { en: 'Settings', fr: 'Paramètres', it: 'Impostazioni', es: 'Configuración', zh: '设置', ja: '設定', ar: 'الإعدادات' },
  'profile.personalInfo': { en: 'Personal Information', fr: 'Informations Personnelles', it: 'Informazioni Personali', es: 'Información Personal', zh: '个人信息', ja: '個人情報', ar: 'المعلومات الشخصية' },
  'profile.name': { en: 'Name', fr: 'Nom', it: 'Nome', es: 'Nombre', zh: '姓名', ja: '名前', ar: 'الاسم' },
  'profile.email': { en: 'Email', fr: 'Email', it: 'Email', es: 'Correo', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني' },
  'profile.phone': { en: 'Phone', fr: 'Téléphone', it: 'Telefono', es: 'Teléfono', zh: '电话', ja: '電話', ar: 'الهاتف' },
  'profile.experience': { en: 'Experience', fr: 'Expérience', it: 'Esperienza', es: 'Experiencia', zh: '经验', ja: '経験', ar: 'الخبرة' },
  'profile.save': { en: 'Save Changes', fr: 'Enregistrer', it: 'Salva', es: 'Guardar', zh: '保存更改', ja: '変更を保存', ar: 'حفظ التغييرات' },
  
  // Navigation
  'nav.home': { en: 'Home', fr: 'Accueil', it: 'Home', es: 'Inicio', zh: '主页', ja: 'ホーム', ar: 'الرئيسية' },
  'nav.find': { en: 'Find', fr: 'Trouver', it: 'Trova', es: 'Buscar', zh: '查找', ja: '探す', ar: 'البحث' },
  'nav.works': { en: 'Works', fr: 'Travaux', it: 'Lavori', es: 'Trabajos', zh: '作品', ja: '作品', ar: 'الأعمال' },
  'nav.favorites': { en: 'Favorites', fr: 'Favoris', it: 'Preferiti', es: 'Favoritos', zh: '收藏', ja: 'お気に入り', ar: 'المفضلة' },
  'nav.matches': { en: 'Matches', fr: 'Correspondances', it: 'Corrispondenze', es: 'Coincidencias', zh: '匹配', ja: 'マッチング', ar: 'التطابقات' },
  'nav.opportunities': { en: 'Opportunities', fr: 'Opportunités', it: 'Opportunità', es: 'Oportunidades', zh: '机会', ja: '機会', ar: 'الفرص' },
  
  // Common
  'common.back': { en: 'Back', fr: 'Retour', it: 'Indietro', es: 'Volver', zh: '返回', ja: '戻る', ar: 'رجوع' },
  'common.next': { en: 'Next', fr: 'Suivant', it: 'Avanti', es: 'Siguiente', zh: '下一步', ja: '次へ', ar: 'التالي' },
  'common.save': { en: 'Save', fr: 'Enregistrer', it: 'Salva', es: 'Guardar', zh: '保存', ja: '保存', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler', it: 'Annulla', es: 'Cancelar', zh: '取消', ja: 'キャンセル', ar: 'إلغاء' },
  'common.delete': { en: 'Delete', fr: 'Supprimer', it: 'Elimina', es: 'Eliminar', zh: '删除', ja: '削除', ar: 'حذف' },
  'common.edit': { en: 'Edit', fr: 'Modifier', it: 'Modifica', es: 'Editar', zh: '编辑', ja: '編集', ar: 'تعديل' },
  'common.loading': { en: 'Loading...', fr: 'Chargement...', it: 'Caricamento...', es: 'Cargando...', zh: '加载中...', ja: '読み込み中...', ar: 'جارٍ التحميل...' },
  'common.error': { en: 'Error', fr: 'Erreur', it: 'Errore', es: 'Error', zh: '错误', ja: 'エラー', ar: 'خطأ' },
  'common.success': { en: 'Success', fr: 'Succès', it: 'Successo', es: 'Éxito', zh: '成功', ja: '成功', ar: 'نجح' },
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
    // Set document direction for Arabic
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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
