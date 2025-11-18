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
  'header.searchPlaceholder': { 
    en: 'Search users, works, opportunities...', 
    fr: 'Rechercher utilisateurs, œuvres, opportunités...', 
    it: 'Cerca utenti, opere, opportunità...', 
    es: 'Buscar usuarios, trabajos, oportunidades...',
    zh: '搜索用户、作品、机会...',
    ja: 'ユーザー、作品、機会を検索...',
    ar: 'البحث عن المستخدمين والأعمال والفرص...'
  },
  
  // Navigation
  'nav.home': { en: 'Home', fr: 'Accueil', it: 'Home', es: 'Inicio', zh: '首页', ja: 'ホーム', ar: 'الصفحة الرئيسية' },
  'nav.swipe': { en: 'BEEfriend', fr: 'BEEfriend', it: 'BEEfriend', es: 'BEEfriend', zh: 'BEEfriend', ja: 'BEEfriend', ar: 'BEEfriend' },
  'nav.gallery': { en: 'BEEmade', fr: 'BEEmade', it: 'BEEmade', es: 'BEEmade', zh: 'BEEmade', ja: 'BEEmade', ar: 'BEEmade' },
  'nav.connections': { en: 'BEEbond', fr: 'BEEbond', it: 'BEEbond', es: 'BEEbond', zh: 'BEEbond', ja: 'BEEbond', ar: 'BEEbond' },
  'nav.opportunities': { en: 'HIVES', fr: 'HIVES', it: 'HIVES', es: 'HIVES', zh: 'HIVES', ja: 'HIVES', ar: 'HIVES' },
  
  // Verification
  'verification.emailVerified': { en: 'Email Verified', fr: 'Email vérifié', it: 'Email verificata', es: 'Email verificado', zh: '已验证邮箱', ja: 'メール確認済み', ar: 'البريد الإلكتروني موثق' },
  
  // Account Types
  'accountType.selectType': { en: 'Select Your Account Type', fr: 'Sélectionnez votre type de compte', it: 'Seleziona il tipo di account', es: 'Selecciona tu tipo de cuenta', zh: '选择账户类型', ja: 'アカウントタイプを選択', ar: 'اختر نوع حسابك' },
  'accountType.selectDescription': { en: 'Choose the category that best describes you', fr: 'Choisissez la catégorie qui vous décrit le mieux', it: 'Scegli la categoria che ti descrive meglio', es: 'Elige la categoría que mejor te describa', zh: '选择最能描述您的类别', ja: 'あなたに最も適したカテゴリーを選択してください', ar: 'اختر الفئة التي تصفك بشكل أفضل' },
  
  'accountType.freelance_artist.title': { en: 'Freelance Artist', fr: 'Artiste indépendant', it: 'Artista freelance', es: 'Artista freelance', zh: '自由艺术家', ja: 'フリーランスアーティスト', ar: 'فنان مستقل' },
  'accountType.freelance_artist.description': { en: 'Independent artist offering services', fr: 'Artiste indépendant offrant des services', it: 'Artista indipendente che offre servizi', es: 'Artista independiente que ofrece servicios', zh: '提供服务的独立艺术家', ja: 'サービスを提供する独立アーティスト', ar: 'فنان مستقل يقدم الخدمات' },
  
  'accountType.commission_artist.title': { en: 'Commission Artist', fr: 'Artiste de commande', it: 'Artista su commissione', es: 'Artista de comisión', zh: '委托艺术家', ja: 'コミッションアーティスト', ar: 'فنان بالعمولة' },
  'accountType.commission_artist.description': { en: 'Specializing in commissioned work', fr: 'Spécialisé dans le travail sur commande', it: 'Specializzato in lavori su commissione', es: 'Especializado en trabajo comisionado', zh: '专门从事委托作品', ja: '受注制作専門', ar: 'متخصص في الأعمال بالعمولة' },
  
  'accountType.art_student.title': { en: 'Art Student', fr: 'Étudiant en art', it: 'Studente d\'arte', es: 'Estudiante de arte', zh: '艺术学生', ja: '美術学生', ar: 'طالب فني' },
  'accountType.art_student.description': { en: 'Learning and showcasing work', fr: 'Apprendre et présenter son travail', it: 'Imparare e mostrare il lavoro', es: 'Aprendiendo y mostrando trabajo', zh: '学习和展示作品', ja: '学習と作品の展示', ar: 'التعلم وعرض الأعمال' },
  
  'accountType.studio_agency.title': { en: 'Studio/Agency', fr: 'Studio/Agence', it: 'Studio/Agenzia', es: 'Estudio/Agencia', zh: '工作室/代理', ja: 'スタジオ/エージェンシー', ar: 'استوديو/وكالة' },
  'accountType.studio_agency.description': { en: 'Business profile for agencies', fr: 'Profil professionnel pour agences', it: 'Profilo aziendale per agenzie', es: 'Perfil empresarial para agencias', zh: '代理机构商业资料', ja: 'エージェンシー向けビジネスプロフィール', ar: 'ملف تجاري للوكالات' },
  
  'accountType.gallery_curator.title': { en: 'Gallery/Curator', fr: 'Galerie/Conservateur', it: 'Galleria/Curatore', es: 'Galería/Curador', zh: '画廊/策展人', ja: 'ギャラリー/キュレーター', ar: 'معرض/أمين' },
  'accountType.gallery_curator.description': { en: 'Gallery owners discovering talent', fr: 'Propriétaires de galeries découvrant des talents', it: 'Proprietari di gallerie alla scoperta di talenti', es: 'Propietarios de galerías descubriendo talento', zh: '画廊主发掘人才', ja: 'タレント発掘中のギャラリーオーナー', ar: 'أصحاب المعارض يكتشفون المواهب' },
  
  'accountType.art_collector.title': { en: 'Art Collector', fr: 'Collectionneur d\'art', it: 'Collezionista d\'arte', es: 'Coleccionista de arte', zh: '艺术收藏家', ja: 'アートコレクター', ar: 'جامع فني' },
  'accountType.art_collector.description': { en: 'Collectors discovering artists', fr: 'Collectionneurs découvrant des artistes', it: 'Collezionisti alla scoperta di artisti', es: 'Coleccionistas descubriendo artistas', zh: '收藏家发现艺术家', ja: 'アーティスト発掘中のコレクター', ar: 'جامعون يكتشفون الفنانين' },
  
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
  'swipe.selectCategory': { 
    en: 'Select Artist Category', 
    fr: 'Sélectionner une Catégorie d\'Artiste', 
    it: 'Seleziona Categoria Artista', 
    es: 'Seleccionar Categoría de Artista', 
    zh: '选择艺术家类别', 
    ja: 'アーティストカテゴリーを選択', 
    ar: 'اختر فئة الفنان' 
  },
  'swipe.selectSubtitle': { 
    en: 'What kind of artists are you looking for?', 
    fr: 'Quel type d\'artistes recherchez-vous ?', 
    it: 'Che tipo di artisti stai cercando?', 
    es: '¿Qué tipo de artistas estás buscando?', 
    zh: '您在寻找什么类型的艺术家？', 
    ja: 'どのようなアーティストをお探しですか？', 
    ar: 'ما نوع الفنانين الذين تبحث عنهم؟' 
  },
  'swipe.allArtists': { 
    en: 'All Artists', 
    fr: 'Tous les Artistes', 
    it: 'Tutti gli Artisti', 
    es: 'Todos los Artistas', 
    zh: '所有艺术家', 
    ja: '全アーティスト', 
    ar: 'جميع الفنانين' 
  },
  'swipe.allArtistsDesc': { 
    en: 'Swipe through all creative professionals', 
    fr: 'Parcourir tous les professionnels créatifs', 
    it: 'Scorri tutti i professionisti creativi', 
    es: 'Desliza por todos los profesionales creativos', 
    zh: '浏览所有创意专业人士', 
    ja: 'すべてのクリエイティブプロフェッショナルをスワイプ', 
    ar: 'تصفح جميع المحترفين المبدعين' 
  },
  'swipe.interested': { en: 'Interested', fr: 'Intéressé', it: 'Interessato', es: 'Interesado', zh: '感兴趣', ja: '興味あり', ar: 'مهتم' },
  'swipe.pass': { en: 'Pass', fr: 'Passer', it: 'Passa', es: 'Pasar', zh: '跳过', ja: 'パス', ar: 'تخطي' },
  'swipe.requirements': { en: 'Requirements', fr: 'Exigences', it: 'Requisiti', es: 'Requisitos', zh: '要求', ja: '要件', ar: 'المتطلبات' },
  'swipe.complete.title': { en: 'All Done!', fr: 'Terminé !', it: 'Tutto Fatto!', es: '¡Completado!', zh: '全部完成！', ja: '完了！', ar: 'تم!' },
  'swipe.complete.desc': { en: "You've reviewed all available jobs. Check your matches!", fr: 'Vous avez consulté tous les emplois disponibles. Vérifiez vos correspondances !', it: 'Hai rivisto tutti i lavori disponibili. Controlla le tue corrispondenze!', es: '¡Has revisado todos los trabajos disponibles! ¡Revisa tus coincidencias!', zh: '您已浏览所有可用的工作。查看您的匹配！', ja: '利用可能なすべての仕事を確認しました。マッチングをチェック！', ar: 'لقد راجعت جميع الوظائف المتاحة. تحقق من تطابقاتك!' },
  'swipe.complete.cta': { en: 'View Matches', fr: 'Voir les Correspondances', it: 'Visualizza Corrispondenze', es: 'Ver Coincidencias', zh: '查看匹配', ja: 'マッチングを見る', ar: 'عرض التطابقات' },
  'swipe.whatLookingFor': { 
    en: 'What are you looking for?', 
    fr: 'Que recherchez-vous ?', 
    it: 'Cosa stai cercando?', 
    es: '¿Qué estás buscando?', 
    zh: '您在寻找什么？', 
    ja: '何をお探しですか？', 
    ar: 'ماذا تبحث؟' 
  },
  'swipe.changeCategory': { 
    en: 'Change Category', 
    fr: 'Changer de Catégorie', 
    it: 'Cambia Categoria', 
    es: 'Cambiar Categoría', 
    zh: '更改类别', 
    ja: 'カテゴリーを変更', 
    ar: 'تغيير الفئة' 
  },
  'swipe.noMoreProfiles': { 
    en: 'No more profiles to swipe', 
    fr: 'Plus de profils à parcourir', 
    it: 'Nessun altro profilo da scorrere', 
    es: 'No hay más perfiles para deslizar', 
    zh: '没有更多的个人资料可浏览', 
    ja: 'スワイプするプロフィールがありません', 
    ar: 'لا مزيد من الملفات الشخصية للتصفح' 
  },
  'swipe.refresh': { 
    en: 'Refresh', 
    fr: 'Actualiser', 
    it: 'Aggiorna', 
    es: 'Actualizar', 
    zh: '刷新', 
    ja: 'リフレッシュ', 
    ar: 'تحديث' 
  },
  'swipe.or': { 
    en: 'or choose a category', 
    fr: 'ou choisissez une catégorie', 
    it: 'o scegli una categoria', 
    es: 'o elige una categoría', 
    zh: '或选择类别', 
    ja: 'またはカテゴリーを選択', 
    ar: 'أو اختر فئة' 
  },
  'swipe.showFilters': { 
    en: 'Show Filters', 
    fr: 'Afficher les Filtres', 
    it: 'Mostra Filtri', 
    es: 'Mostrar Filtros', 
    zh: '显示过滤器', 
    ja: 'フィルターを表示', 
    ar: 'عرض المرشحات' 
  },
  'swipe.hideFilters': { 
    en: 'Hide Filters', 
    fr: 'Masquer les Filtres', 
    it: 'Nascondi Filtri', 
    es: 'Ocultar Filtros', 
    zh: '隐藏过滤器', 
    ja: 'フィルターを非表示', 
    ar: 'إخفاء المرشحات' 
  },
  'swipe.maxDistance': { 
    en: 'Max Distance', 
    fr: 'Distance Maximale', 
    it: 'Distanza Massima', 
    es: 'Distancia Máxima', 
    zh: '最大距离', 
    ja: '最大距離', 
    ar: 'المسافة القصوى' 
  },
  'swipe.undo': { 
    en: 'Undo Last Swipe', 
    fr: 'Annuler le Dernier Swipe', 
    it: 'Annulla Ultimo Swipe', 
    es: 'Deshacer Último Swipe', 
    zh: '撤销上次滑动', 
    ja: '最後のスワイプを元に戻す', 
    ar: 'التراجع عن آخر تمرير' 
  },
  
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
