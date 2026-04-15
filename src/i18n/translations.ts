export type Language = 'en' | 'fr' | 'it' | 'es' | 'zh' | 'ja' | 'ar';

export interface Translations {
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

export const translations: Translations = {
  // Header
  'header.title': { en: 'HIVEE', fr: 'HIVEE', it: 'HIVEE', es: 'HIVEE', zh: 'HIVEE', ja: 'HIVEE', ar: 'HIVEE' },
  'header.searchPlaceholder': { 
    en: 'Search users, works, opportunities...', 
    fr: 'Rechercher utilisateurs, oeuvres, opportunites...', 
    it: 'Cerca utenti, opere, opportunita...', 
    es: 'Buscar usuarios, trabajos, oportunidades...',
    zh: '搜索用户、作品、机会...',
    ja: 'ユーザー、作品、機会を検索...',
    ar: 'البحث عن المستخدمين والأعمال والفرص...'
  },
  
  // Navigation
  'nav.home': { en: 'Home', fr: 'Accueil', it: 'Home', es: 'Inicio', zh: '首页', ja: 'ホーム', ar: 'الصفحة الرئيسية' },
  'nav.find': { en: 'BEEhunt', fr: 'BEEhunt', it: 'BEEhunt', es: 'BEEhunt', zh: 'BEEhunt', ja: 'BEEhunt', ar: 'BEEhunt' },
  'nav.gallery': { en: 'BEEmade', fr: 'BEEmade', it: 'BEEmade', es: 'BEEmade', zh: 'BEEmade', ja: 'BEEmade', ar: 'BEEmade' },
  'nav.connections': { en: 'BEEfriend', fr: 'BEEfriend', it: 'BEEfriend', es: 'BEEfriend', zh: 'BEEfriend', ja: 'BEEfriend', ar: 'BEEfriend' },
  'nav.opportunities': { en: 'BEEsiness', fr: 'BEEsiness', it: 'BEEsiness', es: 'BEEsiness', zh: 'BEEsiness', ja: 'BEEsiness', ar: 'BEEsiness' },
  
  // Verification
  'verification.emailVerified': { en: 'Email Verified', fr: 'Email verifie', it: 'Email verificata', es: 'Email verificado', zh: '已验证邮箱', ja: 'メール確認済み', ar: 'البريد الإلكتروني موثق' },
  
  // Account Types
  'accountType.selectType': { en: 'Select Your Account Type', fr: 'Selectionnez votre type de compte', it: 'Seleziona il tipo di account', es: 'Selecciona tu tipo de cuenta', zh: '选择账户类型', ja: 'アカウントタイプを選択', ar: 'اختر نوع حسابك' },
  'accountType.selectDescription': { en: 'Choose the category that best describes you', fr: 'Choisissez la categorie qui vous decrit le mieux', it: 'Scegli la categoria che ti descrive meglio', es: 'Elige la categoria que mejor te describa', zh: '选择最能描述您的类别', ja: 'あなたに最も適したカテゴリーを選択してください', ar: 'اختر الفئة التي تصفك بشكل أفضل' },
  'accountType.freelance_artist.title': { en: 'Freelance Artist', fr: 'Artiste independant', it: 'Artista freelance', es: 'Artista freelance', zh: '自由艺术家', ja: 'フリーランスアーティスト', ar: 'فنان مستقل' },
  'accountType.freelance_artist.description': { en: 'Independent artist offering services', fr: 'Artiste independant offrant des services', it: 'Artista indipendente che offre servizi', es: 'Artista independiente que ofrece servicios', zh: '提供服务的独立艺术家', ja: 'サービスを提供する独立アーティスト', ar: 'فنان مستقل يقدم الخدمات' },
  'accountType.commission_artist.title': { en: 'Commission Artist', fr: 'Artiste de commande', it: 'Artista su commissione', es: 'Artista de comision', zh: '委托艺术家', ja: 'コミッションアーティスト', ar: 'فنان بالعمولة' },
  'accountType.commission_artist.description': { en: 'Specializing in commissioned work', fr: 'Specialise dans le travail sur commande', it: 'Specializzato in lavori su commissione', es: 'Especializado en trabajo comisionado', zh: '专门从事委托作品', ja: '受注制作専門', ar: 'متخصص في الأعمال بالعمولة' },
  'accountType.art_student.title': { en: 'Art Student', fr: 'Etudiant en art', it: "Studente d'arte", es: 'Estudiante de arte', zh: '艺术学生', ja: '美術学生', ar: 'طالب فني' },
  'accountType.art_student.description': { en: 'Learning and showcasing work', fr: 'Apprendre et presenter son travail', it: 'Imparare e mostrare il lavoro', es: 'Aprendiendo y mostrando trabajo', zh: '学习和展示作品', ja: '学習と作品の展示', ar: 'التعلم وعرض الأعمال' },
  'accountType.studio_agency.title': { en: 'Studio/Agency', fr: 'Studio/Agence', it: 'Studio/Agenzia', es: 'Estudio/Agencia', zh: '工作室/代理', ja: 'スタジオ/エージェンシー', ar: 'استوديو/وكالة' },
  'accountType.studio_agency.description': { en: 'Business profile for agencies', fr: 'Profil professionnel pour agences', it: 'Profilo aziendale per agenzie', es: 'Perfil empresarial para agencias', zh: '代理机构商业资料', ja: 'エージェンシー向けビジネスプロフィール', ar: 'ملف تجاري للوكالات' },
  'accountType.gallery_curator.title': { en: 'Gallery/Curator', fr: 'Galerie/Conservateur', it: 'Galleria/Curatore', es: 'Galeria/Curador', zh: '画廊/策展人', ja: 'ギャラリー/キュレーター', ar: 'معرض/أمين' },
  'accountType.gallery_curator.description': { en: 'Gallery owners discovering talent', fr: 'Proprietaires de galeries decouvrant des talents', it: 'Proprietari di gallerie alla scoperta di talenti', es: 'Propietarios de galerias descubriendo talento', zh: '画廊主发掘人才', ja: 'タレント発掘中のギャラリーオーナー', ar: 'أصحاب المعارض يكتشفون المواهب' },
  'accountType.art_collector.title': { en: 'Art Collector', fr: "Collectionneur d'art", it: "Collezionista d'arte", es: 'Coleccionista de arte', zh: '艺术收藏家', ja: 'アートコレクター', ar: 'جامع فني' },
  'accountType.art_collector.description': { en: 'Collectors discovering artists', fr: 'Collectionneurs decouvrant des artistes', it: 'Collezionisti alla scoperta di artisti', es: 'Coleccionistas descubriendo artistas', zh: '收藏家发现艺术家', ja: 'アーティスト発掘中のコレクター', ar: 'جامعون يكتشفون الفنانين' },
  
  // Index/Landing
  'home.tagline': { en: 'FIND ART, MAKE ART, SHARE ART', fr: "TROUVE L'ART, CREE L'ART, PARTAGE L'ART", it: 'TROVA ARTE, CREA ARTE, CONDIVIDI ARTE', es: 'ENCUENTRA ARTE, CREA ARTE, COMPARTE ARTE', zh: '寻找艺术，创作艺术，分享艺术', ja: 'アートを見つけ、アートを作り、アートを共有', ar: 'ابحث عن الفن، اصنع الفن، شارك الفن' },
  'home.hero.title': { en: 'ART IS MEANT TO\nBE SHARED', fr: "L'ART EST FAIT POUR\nETRE PARTAGE", it: "L'ARTE E FATTA PER\nESSERE CONDIVISA", es: 'EL ARTE ESTA HECHO PARA\nSER COMPARTIDO', zh: '艺术注定\n要被分享', ja: 'アートは\n共有されるべきもの', ar: 'الفن مصنوع\nليتم مشاركته' },
  'home.hero.description': { en: 'Hunt bees around you, bee friends, share your works, see bees around the world and find the best opportunity to work around you', fr: "Chasse les abeilles autour de toi, fais-toi des amis abeilles, partage tes oeuvres, decouvre les abeilles du monde entier et trouve les meilleures opportunites de travail", it: 'Caccia le api intorno a te, fai amicizia con le api, condividi le tue opere, scopri le api in tutto il mondo e trova le migliori opportunita di lavoro', es: 'Caza abejas a tu alrededor, haz amigos abejas, comparte tus obras, descubre abejas en todo el mundo y encuentra las mejores oportunidades de trabajo', zh: '寻找周围的蜜蜂，结交蜜蜂朋友，分享你的作品，看到世界各地的蜜蜂，找到最佳工作机会', ja: '周りのミツバチを探し、ミツバチの友達を作り、作品を共有し、世界中のミツバチを見て、最高の仕事の機会を見つけよう', ar: 'اصطاد النحل من حولك، كون صداقات نحل، شارك أعمالك، اكتشف النحل حول العالم واعثر على أفضل فرصة عمل' },
  'home.cta.getStarted': { en: 'Get Started', fr: 'Commencer', it: 'Inizia', es: 'Empezar', zh: '开始使用', ja: '始める', ar: 'ابدأ الآن' },
  'home.cta.startHunting': { en: 'Start Hunting', fr: 'Commencer la Chasse', it: 'Inizia la Caccia', es: 'Comenzar Busqueda', zh: '开始寻找', ja: '探索を始める', ar: 'ابدأ البحث' },
  'home.cta.viewOpportunities': { en: 'View Opportunities', fr: 'Voir les Opportunites', it: 'Vedi Opportunita', es: 'Ver Oportunidades', zh: '查看机会', ja: '機会を見る', ar: 'عرض الفرص' },
  'home.feature1.title': { en: 'Lightning Fast', fr: 'Ultra Rapide', it: 'Veloce come un Fulmine', es: 'Super Rapido', zh: '闪电般快速', ja: '電光石火', ar: 'سريع كالبرق' },
  'home.feature1.description': { en: 'Review dozens of job opportunities in minutes, not hours', fr: "Consultez des dizaines d'opportunites en quelques minutes, pas en heures", it: 'Esamina decine di opportunita in pochi minuti, non ore', es: 'Revisa docenas de oportunidades en minutos, no horas', zh: '几分钟内浏览数十个工作机会，而不是几小时', ja: '数時間ではなく数分で数十の仕事の機会をレビュー', ar: 'راجع عشرات الفرص في دقائق، وليس ساعات' },
  'home.feature2.title': { en: 'Perfect Matches', fr: 'Correspondances Parfaites', it: 'Abbinamenti Perfetti', es: 'Coincidencias Perfectas', zh: '完美匹配', ja: '完璧なマッチング', ar: 'تطابقات مثالية' },
  'home.feature2.description': { en: 'Smart algorithm shows you jobs that fit your skills and goals', fr: "Un algorithme intelligent vous montre des emplois qui correspondent a vos competences et objectifs", it: "L'algoritmo intelligente ti mostra lavori adatti alle tue competenze e obiettivi", es: 'El algoritmo inteligente te muestra trabajos que se ajustan a tus habilidades y objetivos', zh: '智能算法为您展示符合您技能和目标的工作', ja: 'スマートアルゴリズムがあなたのスキルと目標に合った仕事を表示', ar: 'الخوارزمية الذكية تعرض لك الوظائف التي تناسب مهاراتك وأهدافك' },
  'home.feature3.title': { en: 'Career Growth', fr: 'Croissance de Carriere', it: 'Crescita Professionale', es: 'Crecimiento Profesional', zh: '职业发展', ja: 'キャリア成長', ar: 'النمو المهني' },
  'home.feature3.description': { en: 'Discover opportunities from startups to established companies', fr: 'Decouvrez des opportunites des startups aux entreprises etablies', it: 'Scopri opportunita dalle startup alle aziende consolidate', es: 'Descubre oportunidades desde startups hasta empresas establecidas', zh: '从初创公司到成熟企业，发现各种机会', ja: 'スタートアップから確立された企業まで機会を発見', ar: 'اكتشف الفرص من الشركات الناشئة إلى الشركات الراسخة' },
  'landing.hero.title': { en: 'Find Your Dream Job', fr: 'Trouvez Votre Emploi de Reve', it: 'Trova il Tuo Lavoro dei Sogni', es: 'Encuentra Tu Trabajo Sonado', zh: '找到您的理想工作', ja: '夢の仕事を見つけよう', ar: 'ابحث عن وظيفة أحلامك' },
  'landing.hero.subtitle': { en: 'Swipe through opportunities, match with companies that value your talent', fr: 'Parcourez les opportunites, connectez-vous avec des entreprises qui valorisent votre talent', it: 'Scorri le opportunita, abbina le aziende che apprezzano il tuo talento', es: 'Desliza por oportunidades, conecta con empresas que valoran tu talento', zh: '浏览机会，与重视您才能的公司匹配', ja: '機会をスワイプして、あなたの才能を評価する企業とマッチング', ar: 'تصفح الفرص، تواصل مع الشركات التي تقدر موهبتك' },
  'landing.cta': { en: 'Start Swiping', fr: 'Commencer', it: 'Inizia', es: 'Comenzar', zh: '开始浏览', ja: 'スワイプ開始', ar: 'ابدأ التصفح' },
  'landing.feature1.title': { en: 'Quick & Easy', fr: 'Rapide et Facile', it: 'Veloce e Facile', es: 'Rapido y Facil', zh: '快速简单', ja: '迅速で簡単', ar: 'سريع وسهل' },
  'landing.feature1.desc': { en: 'Swipe through jobs in seconds', fr: 'Parcourez les emplois en quelques secondes', it: 'Scorri i lavori in pochi secondi', es: 'Desliza trabajos en segundos', zh: '几秒钟内浏览工作', ja: '数秒で仕事をスワイプ', ar: 'تصفح الوظائف في ثوانٍ' },
  'landing.feature2.title': { en: 'Perfect Matches', fr: 'Correspondances Parfaites', it: 'Abbinamenti Perfetti', es: 'Coincidencias Perfectas', zh: '完美匹配', ja: '完璧なマッチング', ar: 'تطابقات مثالية' },
  'landing.feature2.desc': { en: 'AI-powered job recommendations', fr: "Recommandations d'emploi par IA", it: 'Raccomandazioni di lavoro AI', es: 'Recomendaciones de trabajo con IA', zh: 'AI智能工作推荐', ja: 'AI搭載の求人推薦', ar: 'توصيات وظيفية بالذكاء الاصطناعي' },
  'landing.feature3.title': { en: 'Grow Your Career', fr: 'Developpez Votre Carriere', it: 'Fai Crescere la Tua Carriera', es: 'Crece Tu Carrera', zh: '发展您的职业', ja: 'キャリアを成長させる', ar: 'نمِّ مسيرتك المهنية' },
  'landing.feature3.desc': { en: 'Connect with top companies', fr: 'Connectez-vous avec les meilleures entreprises', it: 'Connettiti con le migliori aziende', es: 'Conecta con las mejores empresas', zh: '与顶尖公司联系', ja: 'トップ企業とつながる', ar: 'تواصل مع أفضل الشركات' },
  
  // Home
  'home.artistOfMonth': { en: 'BEES of the month', fr: 'BEES du mois', it: 'BEES del mese', es: 'BEES del mes', zh: '本月蜜蜂', ja: '今月のBEES', ar: 'نحل الشهر' },
  'home.artistOfMonthSubtitle': { en: 'Discover the most talented artists of this month', fr: 'Decouvrez les artistes les plus talentueux de ce mois', it: 'Scopri gli artisti piu talentuosi di questo mese', es: 'Descubre los artistas mas talentosos de este mes', zh: '探索本月最有才华的艺术家', ja: '今月最も才能のあるアーティストを発見', ar: 'اكتشف الفنانين الأكثر موهبة هذا الشهر' },
  
  // Swipe
  'swipe.selectCategory': { en: 'Select Artist Category', fr: "Selectionner une Categorie d'Artiste", it: 'Seleziona Categoria Artista', es: 'Seleccionar Categoria de Artista', zh: '选择艺术家类别', ja: 'アーティストカテゴリーを選択', ar: 'اختر فئة الفنان' },
  'swipe.selectSubtitle': { en: 'What kind of artists are you looking for?', fr: "Quel type d'artistes recherchez-vous ?", it: 'Che tipo di artisti stai cercando?', es: 'Que tipo de artistas estas buscando?', zh: '您在寻找什么类型的艺术家？', ja: 'どのようなアーティストをお探しですか？', ar: 'ما نوع الفنانين الذين تبحث عنهم؟' },
  'swipe.allArtists': { en: 'All Artists', fr: 'Tous les Artistes', it: 'Tutti gli Artisti', es: 'Todos los Artistas', zh: '所有艺术家', ja: '全アーティスト', ar: 'جميع الفنانين' },
  'swipe.allArtistsDesc': { en: 'Swipe through all creative professionals', fr: 'Parcourir tous les professionnels creatifs', it: 'Scorri tutti i professionisti creativi', es: 'Desliza por todos los profesionales creativos', zh: '浏览所有创意专业人士', ja: 'すべてのクリエイティブプロフェッショナルをスワイプ', ar: 'تصفح جميع المحترفين المبدعين' },
  'swipe.interested': { en: 'Interested', fr: 'Interesse', it: 'Interessato', es: 'Interesado', zh: '感兴趣', ja: '興味あり', ar: 'مهتم' },
  'swipe.pass': { en: 'Pass', fr: 'Passer', it: 'Passa', es: 'Pasar', zh: '跳过', ja: 'パス', ar: 'تخطي' },
  'swipe.requirements': { en: 'Requirements', fr: 'Exigences', it: 'Requisiti', es: 'Requisitos', zh: '要求', ja: '要件', ar: 'المتطلبات' },
  'swipe.complete.title': { en: 'All Done!', fr: 'Termine !', it: 'Tutto Fatto!', es: 'Completado!', zh: '全部完成！', ja: '完了！', ar: 'تم!' },
  'swipe.complete.desc': { en: "You've reviewed all available jobs. Check your matches!", fr: 'Vous avez consulte tous les emplois disponibles. Verifiez vos correspondances !', it: 'Hai rivisto tutti i lavori disponibili. Controlla le tue corrispondenze!', es: 'Has revisado todos los trabajos disponibles! Revisa tus coincidencias!', zh: '您已浏览所有可用的工作。查看您的匹配！', ja: '利用可能なすべての仕事を確認しました。マッチングをチェック！', ar: 'لقد راجعت جميع الوظائف المتاحة. تحقق من تطابقاتك!' },
  'swipe.complete.cta': { en: 'View Matches', fr: 'Voir les Correspondances', it: 'Visualizza Corrispondenze', es: 'Ver Coincidencias', zh: '查看匹配', ja: 'マッチングを見る', ar: 'عرض التطابقات' },
  'swipe.whatLookingFor': { en: 'What are you looking for?', fr: 'Que recherchez-vous ?', it: 'Cosa stai cercando?', es: 'Que estas buscando?', zh: '您在寻找什么？', ja: '何をお探しですか？', ar: 'ماذا تبحث؟' },
  'swipe.changeCategory': { en: 'Change Category', fr: 'Changer de Categorie', it: 'Cambia Categoria', es: 'Cambiar Categoria', zh: '更改类别', ja: 'カテゴリーを変更', ar: 'تغيير الفئة' },
  'swipe.noMoreProfiles': { en: 'No more profiles to swipe', fr: 'Plus de profils a parcourir', it: 'Nessun altro profilo da scorrere', es: 'No hay mas perfiles para deslizar', zh: '没有更多的个人资料可浏览', ja: 'スワイプするプロフィールがありません', ar: 'لا مزيد من الملفات الشخصية للتصفح' },
  'swipe.refresh': { en: 'Refresh', fr: 'Actualiser', it: 'Aggiorna', es: 'Actualizar', zh: '刷新', ja: 'リフレッシュ', ar: 'تحديث' },
  'swipe.or': { en: 'or choose a category', fr: 'ou choisissez une categorie', it: 'o scegli una categoria', es: 'o elige una categoria', zh: '或选择类别', ja: 'またはカテゴリーを選択', ar: 'أو اختر فئة' },
  'swipe.showFilters': { en: 'Show Filters', fr: 'Afficher les Filtres', it: 'Mostra Filtri', es: 'Mostrar Filtros', zh: '显示过滤器', ja: 'フィルターを表示', ar: 'عرض المرشحات' },
  'swipe.hideFilters': { en: 'Hide Filters', fr: 'Masquer les Filtres', it: 'Nascondi Filtri', es: 'Ocultar Filtros', zh: '隐藏过滤器', ja: 'フィルターを非表示', ar: 'إخفاء المرشحات' },
  'swipe.maxDistance': { en: 'Max Distance', fr: 'Distance Maximale', it: 'Distanza Massima', es: 'Distancia Maxima', zh: '最大距离', ja: '最大距離', ar: 'المسافة القصوى' },
  'swipe.undo': { en: 'Undo Last Swipe', fr: 'Annuler le Dernier Swipe', it: 'Annulla Ultimo Swipe', es: 'Deshacer Ultimo Swipe', zh: '撤销上次滑动', ja: '最後のスワイプを元に戻す', ar: 'التراجع عن آخر تمرير' },

  // Common
  'common.back': { en: 'Back', fr: 'Retour', it: 'Indietro', es: 'Volver', zh: '返回', ja: '戻る', ar: 'رجوع' },
  'common.next': { en: 'Next', fr: 'Suivant', it: 'Avanti', es: 'Siguiente', zh: '下一步', ja: '次へ', ar: 'التالي' },
  'common.save': { en: 'Save', fr: 'Enregistrer', it: 'Salva', es: 'Guardar', zh: '保存', ja: '保存', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler', it: 'Annulla', es: 'Cancelar', zh: '取消', ja: 'キャンセル', ar: 'إلغاء' },
  'common.delete': { en: 'Delete', fr: 'Supprimer', it: 'Elimina', es: 'Eliminar', zh: '删除', ja: '削除', ar: 'حذف' },
  'common.edit': { en: 'Edit', fr: 'Modifier', it: 'Modifica', es: 'Editar', zh: '编辑', ja: '編集', ar: 'تعديل' },
  'common.loading': { en: 'Loading...', fr: 'Chargement...', it: 'Caricamento...', es: 'Cargando...', zh: '加载中...', ja: '読み込み中...', ar: 'جارٍ التحميل...' },
  'common.error': { en: 'Error', fr: 'Erreur', it: 'Errore', es: 'Error', zh: '错误', ja: 'エラー', ar: 'خطأ' },
  'common.success': { en: 'Success', fr: 'Succes', it: 'Successo', es: 'Exito', zh: '成功', ja: '成功', ar: 'نجح' },
  'common.remove': { en: 'Remove', fr: 'Retirer', it: 'Rimuovi', es: 'Eliminar', zh: '移除', ja: '削除', ar: 'إزالة' },
  'common.add': { en: 'Add', fr: 'Ajouter', it: 'Aggiungi', es: 'Agregar', zh: '添加', ja: '追加', ar: 'إضافة' },
  'common.search': { en: 'Search', fr: 'Rechercher', it: 'Cerca', es: 'Buscar', zh: '搜索', ja: '検索', ar: 'بحث' },
  'common.upload': { en: 'Upload', fr: 'Telecharger', it: 'Carica', es: 'Subir', zh: '上传', ja: 'アップロード', ar: 'رفع' },
  'common.uploading': { en: 'Uploading...', fr: 'Telechargement...', it: 'Caricamento...', es: 'Subiendo...', zh: '上传中...', ja: 'アップロード中...', ar: 'جارٍ الرفع...' },
  'common.modify': { en: 'Modify', fr: 'Modifier', it: 'Modifica', es: 'Modificar', zh: '修改', ja: '変更', ar: 'تعديل' },
  'common.saving': { en: 'Saving...', fr: 'Sauvegarde...', it: 'Salvataggio...', es: 'Guardando...', zh: '保存中...', ja: '保存中...', ar: 'جارٍ الحفظ...' },
  'common.message': { en: 'Message', fr: 'Message', it: 'Messaggio', es: 'Mensaje', zh: '消息', ja: 'メッセージ', ar: 'رسالة' },
  'common.unblock': { en: 'Unblock', fr: 'Debloquer', it: 'Sblocca', es: 'Desbloquear', zh: '解除屏蔽', ja: 'ブロック解除', ar: 'إلغاء الحظر' },
  'common.block': { en: 'Block', fr: 'Bloquer', it: 'Blocca', es: 'Bloquear', zh: '屏蔽', ja: 'ブロック', ar: 'حظر' },
  'common.report': { en: 'Report', fr: 'Signaler', it: 'Segnala', es: 'Reportar', zh: '举报', ja: '報告', ar: 'إبلاغ' },
  'common.apply': { en: 'Apply Now', fr: 'Postuler', it: 'Candidati', es: 'Postular', zh: '立即申请', ja: '応募する', ar: 'تقدم الآن' },
  'common.post': { en: 'Post', fr: 'Publier', it: 'Pubblica', es: 'Publicar', zh: '发布', ja: '投稿', ar: 'نشر' },
  'common.update': { en: 'Update', fr: 'Mettre a jour', it: 'Aggiorna', es: 'Actualizar', zh: '更新', ja: '更新', ar: 'تحديث' },

  // Auth
  'auth.login': { en: 'Sign In', fr: 'Se connecter', it: 'Accedi', es: 'Iniciar sesion', zh: '登录', ja: 'サインイン', ar: 'تسجيل الدخول' },
  'auth.register': { en: 'Sign Up', fr: "S'inscrire", it: 'Registrati', es: 'Registrarse', zh: '注册', ja: 'サインアップ', ar: 'التسجيل' },
  'auth.loginToContinue': { en: 'Sign In to Continue', fr: 'Connectez-vous pour continuer', it: 'Accedi per Continuare', es: 'Inicia sesion para continuar', zh: '登录以继续', ja: '続行するにはサインインしてください', ar: 'سجل الدخول للمتابعة' },
  'auth.needLoginFeature': { en: 'You need to log in to use this feature', fr: 'Vous devez vous connecter pour utiliser cette fonctionnalite', it: "Devi effettuare l'accesso per utilizzare questa funzione", es: 'Necesitas iniciar sesion para usar esta funcion', zh: '您需要登录才能使用此功能', ja: 'この機能を使用するにはログインが必要です', ar: 'يجب تسجيل الدخول لاستخدام هذه الميزة' },
  'auth.needLoginMatches': { en: 'You need to log in to view matches', fr: 'Vous devez vous connecter pour voir les matchs', it: "Devi effettuare l'accesso per visualizzare i match", es: 'Necesitas iniciar sesion para ver las coincidencias', zh: '您需要登录才能查看匹配', ja: 'マッチングを表示するにはログインが必要です', ar: 'يجب تسجيل الدخول لعرض التطابقات' },
  'auth.needLoginChat': { en: 'You need to log in to view chats', fr: 'Vous devez vous connecter pour voir les chats', it: "Devi effettuare l'accesso per visualizzare le chat", es: 'Necesitas iniciar sesion para ver los chats', zh: '您需要登录才能查看聊天', ja: 'チャットを表示するにはログインが必要です', ar: 'يجب تسجيل الدخول لعرض المحادثات' },

  // Matches
  'matches.title': { en: 'Bees U Matched With', fr: 'Abeilles Matchees', it: 'Api con cui hai fatto Match', es: 'Abejas con las que hiciste Match', zh: '匹配到的蜜蜂', ja: 'マッチしたBEES', ar: 'النحل الذي تطابقت معه' },
  'matches.noMatches': { en: 'No matches yet', fr: 'Aucun match pour le moment', it: 'Nessun match ancora', es: 'Sin coincidencias aun', zh: '还没有匹配', ja: 'まだマッチングがありません', ar: 'لا توجد تطابقات بعد' },
  'matches.startSwiping': { en: 'Start swiping to find artists you\'d love to work with!', fr: 'Commencez a swiper pour trouver des artistes avec qui travailler!', it: 'Inizia a scorrere per trovare artisti con cui lavorare!', es: 'Empieza a deslizar para encontrar artistas con los que te gustaria trabajar!', zh: '开始滑动寻找您喜欢合作的艺术家！', ja: '一緒に仕事をしたいアーティストを見つけるためにスワイプしましょう！', ar: 'ابدأ بالتصفح للعثور على فنانين تود العمل معهم!' },
  'matches.sendMessage': { en: 'Send a message to start chatting!', fr: 'Envoyez un message pour commencer a discuter!', it: 'Invia un messaggio per iniziare a chattare!', es: 'Envia un mensaje para empezar a chatear!', zh: '发送消息开始聊天！', ja: 'メッセージを送ってチャットを始めましょう！', ar: 'أرسل رسالة لبدء المحادثة!' },
  'matches.loadingMatches': { en: 'Loading matches...', fr: 'Chargement des matchs...', it: 'Caricamento match...', es: 'Cargando coincidencias...', zh: '加载匹配中...', ja: 'マッチングを読み込み中...', ar: 'جارٍ تحميل التطابقات...' },

  // Chat
  'chat.noMessages': { en: 'No messages yet', fr: 'Aucun message pour le moment', it: 'Nessun messaggio ancora', es: 'Sin mensajes aun', zh: '还没有消息', ja: 'まだメッセージがありません', ar: 'لا توجد رسائل بعد' },
  'chat.startConversation': { en: 'Send a message to start the conversation!', fr: 'Envoyez un message pour commencer la conversation!', it: 'Invia un messaggio per iniziare la conversazione!', es: 'Envia un mensaje para iniciar la conversacion!', zh: '发送消息开始对话！', ja: 'メッセージを送って会話を始めましょう！', ar: 'أرسل رسالة لبدء المحادثة!' },
  'chat.typeMessage': { en: 'Type a message...', fr: 'Tapez un message...', it: 'Scrivi un messaggio...', es: 'Escribe un mensaje...', zh: '输入消息...', ja: 'メッセージを入力...', ar: 'اكتب رسالة...' },
  'chat.loadingConversation': { en: 'Loading conversation...', fr: 'Chargement de la conversation...', it: 'Caricamento conversazione...', es: 'Cargando conversacion...', zh: '加载对话中...', ja: '会話を読み込み中...', ar: 'جارٍ تحميل المحادثة...' },
  'chat.dropToUpload': { en: 'Drop file to upload', fr: 'Deposez le fichier a telecharger', it: 'Trascina il file per caricarlo', es: 'Suelta el archivo para subirlo', zh: '拖放文件上传', ja: 'ファイルをドロップしてアップロード', ar: 'أفلت الملف للرفع' },
  'chat.online': { en: 'Online', fr: 'En ligne', it: 'Online', es: 'En linea', zh: '在线', ja: 'オンライン', ar: 'متصل' },
  'chat.offline': { en: 'Offline', fr: 'Hors ligne', it: 'Offline', es: 'Desconectado', zh: '离线', ja: 'オフライン', ar: 'غير متصل' },
  'chat.reportUser': { en: 'Report User', fr: 'Signaler utilisateur', it: 'Segnala utente', es: 'Reportar usuario', zh: '举报用户', ja: 'ユーザーを報告', ar: 'الإبلاغ عن مستخدم' },
  'chat.viewProfile': { en: 'View Profile', fr: 'Voir le profil', it: 'Vedi profilo', es: 'Ver perfil', zh: '查看资料', ja: 'プロフィールを見る', ar: 'عرض الملف الشخصي' },
  'chat.blockUser': { en: 'Block User', fr: 'Bloquer utilisateur', it: 'Blocca utente', es: 'Bloquear usuario', zh: '屏蔽用户', ja: 'ユーザーをブロック', ar: 'حظر المستخدم' },
  'chat.unmatch': { en: 'Unmatch', fr: 'Annuler le match', it: 'Annulla match', es: 'Deshacer match', zh: '取消匹配', ja: 'マッチ解除', ar: 'إلغاء التطابق' },
  'chat.blockConfirmTitle': { en: 'Block User', fr: 'Bloquer utilisateur', it: 'Blocca utente', es: 'Bloquear usuario', zh: '屏蔽用户', ja: 'ユーザーをブロック', ar: 'حظر المستخدم' },
  'chat.blockConfirmDesc': { en: "Are you sure you want to block {name}? They won't be able to message you anymore and you won't see their content.", fr: "Etes-vous sur de vouloir bloquer {name} ? Ils ne pourront plus vous envoyer de messages.", it: 'Sei sicuro di voler bloccare {name}? Non potranno piu inviarti messaggi e non vedrai i loro contenuti.', es: 'Estas seguro de querer bloquear a {name}? No podran enviarte mensajes y no veras su contenido.', zh: '确定要屏蔽 {name} 吗？他们将无法再给你发消息，你也看不到他们的内容。', ja: '{name}をブロックしますか？メッセージを送れなくなり、コンテンツも表示されなくなります。', ar: 'هل أنت متأكد أنك تريد حظر {name}؟ لن يتمكنوا من مراسلتك بعد الآن.' },
  'chat.unmatchConfirmTitle': { en: 'Unmatch User', fr: 'Annuler le match', it: 'Annulla match', es: 'Deshacer match', zh: '取消匹配', ja: 'マッチ解除', ar: 'إلغاء التطابق' },
  'chat.unmatchConfirmDesc': { en: "Are you sure you want to unmatch with {name}? This will remove them from your matches and delete your conversation history.", fr: "Etes-vous sur de vouloir annuler le match avec {name} ? Cela supprimera le match et l'historique des conversations.", it: "Sei sicuro di voler annullare il match con {name}? Verra rimosso dai tuoi match e la cronologia delle conversazioni verra eliminata.", es: 'Estas seguro de querer deshacer el match con {name}? Sera eliminado de tus coincidencias y se borrara el historial.', zh: '确定要取消与 {name} 的匹配吗？这将删除匹配和对话记录。', ja: '{name}とのマッチを解除しますか？マッチリストから削除され、会話履歴も削除されます。', ar: 'هل أنت متأكد أنك تريد إلغاء التطابق مع {name}؟ سيتم حذف المحادثة.' },
  'chat.justNow': { en: 'Just now', fr: 'A l\'instant', it: 'Proprio ora', es: 'Justo ahora', zh: '刚刚', ja: 'たった今', ar: 'الآن' },

  // Works / Gallery
  'works.title': { en: 'Bees Art Gallery', fr: 'Galerie d\'Art Bees', it: 'Galleria d\'Arte Bees', es: 'Galeria de Arte Bees', zh: '蜜蜂艺术画廊', ja: 'Bees アートギャラリー', ar: 'معرض فن النحل' },
  'works.searchPlaceholder': { en: 'Search works...', fr: 'Rechercher des oeuvres...', it: 'Cerca opere...', es: 'Buscar trabajos...', zh: '搜索作品...', ja: '作品を検索...', ar: 'البحث عن أعمال...' },
  'works.uploadNew': { en: 'Upload New Work', fr: 'Telecharger une nouvelle oeuvre', it: 'Carica nuovo lavoro', es: 'Subir nuevo trabajo', zh: '上传新作品', ja: '新しい作品をアップロード', ar: 'رفع عمل جديد' },
  'works.loadDraft': { en: 'Load Draft', fr: 'Charger brouillon', it: 'Carica bozza', es: 'Cargar borrador', zh: '加载草稿', ja: '下書きを読み込む', ar: 'تحميل مسودة' },
  'works.saveDraft': { en: 'Save Draft', fr: 'Sauvegarder brouillon', it: 'Salva bozza', es: 'Guardar borrador', zh: '保存草稿', ja: '下書きを保存', ar: 'حفظ المسودة' },
  'works.fileLabel': { en: 'File (JPG, PNG, PDF, FBX, Video)', fr: 'Fichier (JPG, PNG, PDF, FBX, Video)', it: 'File (JPG, PNG, PDF, FBX, Video)', es: 'Archivo (JPG, PNG, PDF, FBX, Video)', zh: '文件 (JPG, PNG, PDF, FBX, Video)', ja: 'ファイル (JPG, PNG, PDF, FBX, Video)', ar: 'ملف (JPG, PNG, PDF, FBX, Video)' },
  'works.selected': { en: 'Selected', fr: 'Selectionne', it: 'Selezionato', es: 'Seleccionado', zh: '已选择', ja: '選択済み', ar: 'محدد' },
  'works.fileModified': { en: 'File modified', fr: 'Fichier modifie', it: 'File modificato', es: 'Archivo modificado', zh: '文件已修改', ja: 'ファイル変更済み', ar: 'تم تعديل الملف' },
  'works.previewReady': { en: 'Preview ready for gallery', fr: 'Apercu pret pour la galerie', it: 'Anteprima pronta per la galleria', es: 'Vista previa lista para la galeria', zh: '预览已准备好', ja: 'ギャラリー用プレビュー準備完了', ar: 'المعاينة جاهزة للمعرض' },
  'works.title_label': { en: 'Title', fr: 'Titre', it: 'Titolo', es: 'Titulo', zh: '标题', ja: 'タイトル', ar: 'العنوان' },
  'works.titlePlaceholder': { en: 'Work title', fr: 'Titre de l\'oeuvre', it: 'Titolo del lavoro', es: 'Titulo del trabajo', zh: '作品标题', ja: '作品タイトル', ar: 'عنوان العمل' },
  'works.type': { en: 'Type', fr: 'Type', it: 'Tipo', es: 'Tipo', zh: '类型', ja: 'タイプ', ar: 'النوع' },
  'works.selectType': { en: 'Select work type', fr: 'Selectionner le type', it: 'Seleziona tipo', es: 'Seleccionar tipo', zh: '选择类型', ja: 'タイプを選択', ar: 'اختر النوع' },
  'works.style': { en: 'Style', fr: 'Style', it: 'Stile', es: 'Estilo', zh: '风格', ja: 'スタイル', ar: 'الأسلوب' },
  'works.selectStyle': { en: 'Select style', fr: 'Selectionner le style', it: 'Seleziona stile', es: 'Seleccionar estilo', zh: '选择风格', ja: 'スタイルを選択', ar: 'اختر الأسلوب' },
  'works.madeWithAI': { en: 'Made with AI', fr: 'Fait avec IA', it: 'Fatto con IA', es: 'Hecho con IA', zh: 'AI生成', ja: 'AI制作', ar: 'صنع بالذكاء الاصطناعي' },
  'works.nsfw': { en: 'NSFW (18+ content)', fr: 'NSFW (contenu 18+)', it: 'NSFW (contenuto 18+)', es: 'NSFW (contenido 18+)', zh: 'NSFW (18+ 内容)', ja: 'NSFW (18+コンテンツ)', ar: 'محتوى للبالغين (18+)' },
  'works.downloadable': { en: 'Downloadable', fr: 'Telechargeable', it: 'Scaricabile', es: 'Descargable', zh: '可下载', ja: 'ダウンロード可能', ar: 'قابل للتحميل' },
  'works.showDownloadable': { en: 'Show Downloadable', fr: 'Afficher telechargeables', it: 'Mostra scaricabili', es: 'Mostrar descargables', zh: '显示可下载', ja: 'ダウンロード可能を表示', ar: 'عرض القابلة للتحميل' },
  'works.description': { en: 'Description', fr: 'Description', it: 'Descrizione', es: 'Descripcion', zh: '描述', ja: '説明', ar: 'الوصف' },
  'works.descriptionPlaceholder': { en: 'Describe your work...', fr: 'Decrivez votre oeuvre...', it: 'Descrivi il tuo lavoro...', es: 'Describe tu trabajo...', zh: '描述你的作品...', ja: '作品を説明...', ar: 'صف عملك...' },
  'works.hashtags': { en: 'Hashtags (max 5)', fr: 'Hashtags (max 5)', it: 'Hashtag (max 5)', es: 'Hashtags (max 5)', zh: '标签 (最多5个)', ja: 'ハッシュタグ (最大5個)', ar: 'وسوم (حد أقصى 5)' },
  'works.trendingLast24h': { en: 'Trending in Last 24h', fr: 'Tendances des dernieres 24h', it: 'Tendenze ultime 24h', es: 'Tendencia ultimas 24h', zh: '24小时内热门', ja: '過去24時間のトレンド', ar: 'الشائع في آخر 24 ساعة' },
  'works.allTypes': { en: 'All Types', fr: 'Tous les types', it: 'Tutti i tipi', es: 'Todos los tipos', zh: '所有类型', ja: '全タイプ', ar: 'كل الأنواع' },
  'works.allStyles': { en: 'All Styles', fr: 'Tous les styles', it: 'Tutti gli stili', es: 'Todos los estilos', zh: '所有风格', ja: '全スタイル', ar: 'كل الأساليب' },
  'works.global': { en: 'Global', fr: 'Mondial', it: 'Globale', es: 'Global', zh: '全球', ja: 'グローバル', ar: 'عالمي' },
  'works.local': { en: 'Local', fr: 'Local', it: 'Locale', es: 'Local', zh: '本地', ja: 'ローカル', ar: 'محلي' },
  'works.noWorks': { en: 'No works found', fr: 'Aucune oeuvre trouvee', it: 'Nessun lavoro trovato', es: 'No se encontraron trabajos', zh: '未找到作品', ja: '作品が見つかりません', ar: 'لم يتم العثور على أعمال' },
  'works.deleteWork': { en: 'Delete Work', fr: 'Supprimer l\'oeuvre', it: 'Elimina lavoro', es: 'Eliminar trabajo', zh: '删除作品', ja: '作品を削除', ar: 'حذف العمل' },
  'works.editWork': { en: 'Edit your work', fr: 'Modifier votre oeuvre', it: 'Modifica il tuo lavoro', es: 'Editar tu trabajo', zh: '编辑你的作品', ja: '作品を編集', ar: 'تعديل عملك' },
  'works.showAI': { en: 'Show AI Works', fr: 'Afficher les oeuvres IA', it: 'Mostra opere IA', es: 'Mostrar trabajos IA', zh: '显示AI作品', ja: 'AI作品を表示', ar: 'عرض أعمال الذكاء الاصطناعي' },
  'works.showNSFW': { en: 'Show NSFW', fr: 'Afficher NSFW', it: 'Mostra NSFW', es: 'Mostrar NSFW', zh: '显示NSFW', ja: 'NSFWを表示', ar: 'عرض محتوى البالغين' },
  'works.publishedWorks': { en: 'Published works', fr: 'Oeuvres publiees', it: 'Opere pubblicate', es: 'Trabajos publicados', zh: '已发布作品', ja: '公開済み作品', ar: 'الأعمال المنشورة' },
  'works.noWorksYet': { en: 'You have not uploaded any works yet', fr: "Vous n'avez pas encore telecharge d'oeuvres", it: 'Non hai ancora caricato lavori', es: 'Aun no has subido trabajos', zh: '你还没有上传作品', ja: 'まだ作品をアップロードしていません', ar: 'لم ترفع أي أعمال بعد' },

  // Opportunities
  'opp.title': { en: 'Opportunities Around the Hives', fr: 'Opportunites autour des Ruches', it: 'Opportunita intorno agli Alveari', es: 'Oportunidades alrededor de las Colmenas', zh: '蜂巢周围的机会', ja: 'ハイブ周辺の機会', ar: 'فرص حول الخلايا' },
  'opp.applications': { en: 'Applications', fr: 'Candidatures', it: 'Candidature', es: 'Solicitudes', zh: '申请', ja: '応募', ar: 'طلبات' },
  'opp.postOpportunity': { en: 'Post Opportunity', fr: 'Publier une opportunite', it: 'Pubblica opportunita', es: 'Publicar oportunidad', zh: '发布机会', ja: '機会を投稿', ar: 'نشر فرصة' },
  'opp.editOpportunity': { en: 'Edit Opportunity', fr: 'Modifier l\'opportunite', it: 'Modifica opportunita', es: 'Editar oportunidad', zh: '编辑机会', ja: '機会を編集', ar: 'تعديل الفرصة' },
  'opp.postNew': { en: 'Post a New Opportunity', fr: 'Publier une nouvelle opportunite', it: 'Pubblica una nuova opportunita', es: 'Publicar una nueva oportunidad', zh: '发布新机会', ja: '新しい機会を投稿', ar: 'نشر فرصة جديدة' },
  'opp.lookingFor': { en: 'Looking for...', fr: 'A la recherche de...', it: 'Cercando...', es: 'Buscando...', zh: '寻找...', ja: '求めている...', ar: 'أبحث عن...' },
  'opp.selectArtistType': { en: 'Select artist type', fr: 'Selectionner le type d\'artiste', it: 'Seleziona tipo di artista', es: 'Seleccionar tipo de artista', zh: '选择艺术家类型', ja: 'アーティストタイプを選択', ar: 'اختر نوع الفنان' },
  'opp.workType': { en: 'Work Type', fr: 'Type de travail', it: 'Tipo di lavoro', es: 'Tipo de trabajo', zh: '工作类型', ja: '作業タイプ', ar: 'نوع العمل' },
  'opp.selectWorkType': { en: 'Select work type', fr: 'Selectionner le type de travail', it: 'Seleziona tipo di lavoro', es: 'Seleccionar tipo de trabajo', zh: '选择工作类型', ja: '作業タイプを選択', ar: 'اختر نوع العمل' },
  'opp.commission': { en: 'Commission', fr: 'Commission', it: 'Commissione', es: 'Comision', zh: '委托', ja: 'コミッション', ar: 'عمولة' },
  'opp.partTime': { en: 'Part-Time', fr: 'Temps partiel', it: 'Part-Time', es: 'Tiempo parcial', zh: '兼职', ja: 'パートタイム', ar: 'دوام جزئي' },
  'opp.fullTime': { en: 'Full-Time', fr: 'Temps plein', it: 'Full-Time', es: 'Tiempo completo', zh: '全职', ja: 'フルタイム', ar: 'دوام كامل' },
  'opp.jobDescription': { en: 'Job Description', fr: 'Description du poste', it: 'Descrizione del lavoro', es: 'Descripcion del trabajo', zh: '职位描述', ja: '仕事の説明', ar: 'وصف الوظيفة' },
  'opp.jobDescPlaceholder': { en: 'Describe the opportunity, requirements, and what you\'re looking for...', fr: 'Decrivez l\'opportunite, les exigences et ce que vous recherchez...', it: 'Descrivi l\'opportunita, i requisiti e cosa stai cercando...', es: 'Describe la oportunidad, requisitos y lo que buscas...', zh: '描述机会、要求和您在寻找什么...', ja: '機会、要件、求めているものを説明してください...', ar: 'صف الفرصة والمتطلبات وما تبحث عنه...' },
  'opp.paymentBudget': { en: 'Payment/Budget', fr: 'Paiement/Budget', it: 'Pagamento/Budget', es: 'Pago/Presupuesto', zh: '付款/预算', ja: '報酬/予算', ar: 'الدفع/الميزانية' },
  'opp.paymentPlaceholder': { en: 'e.g., $500-$1000, Negotiable, etc.', fr: 'ex: 500-1000EUR, Negociable, etc.', it: 'es: 500-1000EUR, Negoziabile, ecc.', es: 'ej: $500-$1000, Negociable, etc.', zh: '例如：$500-$1000，可协商等', ja: '例：$500-$1000、交渉可能など', ar: 'مثال: 500-1000 دولار، قابل للتفاوض، إلخ' },
  'opp.noOpportunities': { en: 'No opportunities found', fr: 'Aucune opportunite trouvee', it: 'Nessuna opportunita trovata', es: 'No se encontraron oportunidades', zh: '未找到机会', ja: '機会が見つかりません', ar: 'لم يتم العثور على فرص' },
  'opp.postedBy': { en: 'Posted by', fr: 'Publie par', it: 'Pubblicato da', es: 'Publicado por', zh: '发布者', ja: '投稿者', ar: 'نشر بواسطة' },
  'opp.deleteConfirm': { en: 'Are you sure you want to delete this opportunity?', fr: 'Etes-vous sur de vouloir supprimer cette opportunite ?', it: 'Sei sicuro di voler eliminare questa opportunita?', es: 'Estas seguro de que quieres eliminar esta oportunidad?', zh: '确定要删除此机会吗？', ja: 'この機会を削除しますか？', ar: 'هل أنت متأكد أنك تريد حذف هذه الفرصة؟' },

  // Favorites
  'fav.title': { en: 'My Favorites', fr: 'Mes Favoris', it: 'I miei Preferiti', es: 'Mis Favoritos', zh: '我的收藏', ja: 'お気に入り', ar: 'المفضلة' },
  'fav.works': { en: 'Works', fr: 'Oeuvres', it: 'Opere', es: 'Trabajos', zh: '作品', ja: '作品', ar: 'أعمال' },
  'fav.opportunities': { en: 'Opportunities', fr: 'Opportunites', it: 'Opportunita', es: 'Oportunidades', zh: '机会', ja: '機会', ar: 'فرص' },
  'fav.searchFavorites': { en: 'Search favorites...', fr: 'Rechercher des favoris...', it: 'Cerca preferiti...', es: 'Buscar favoritos...', zh: '搜索收藏...', ja: 'お気に入りを検索...', ar: 'البحث في المفضلة...' },
  'fav.noFavoriteWorks': { en: 'No favorite works yet', fr: 'Aucune oeuvre favorite', it: 'Nessun lavoro preferito', es: 'Sin trabajos favoritos', zh: '还没有收藏作品', ja: 'お気に入り作品がありません', ar: 'لا توجد أعمال مفضلة بعد' },
  'fav.noFavoriteOpp': { en: 'No favorite opportunities yet', fr: 'Aucune opportunite favorite', it: 'Nessuna opportunita preferita', es: 'Sin oportunidades favoritas', zh: '还没有收藏机会', ja: 'お気に入り機会がありません', ar: 'لا توجد فرص مفضلة بعد' },
  'fav.noMatch': { en: 'No favorites match your search', fr: 'Aucun favori ne correspond a votre recherche', it: 'Nessun preferito corrisponde alla ricerca', es: 'Ningun favorito coincide con tu busqueda', zh: '没有匹配的收藏', ja: '検索に一致するお気に入りがありません', ar: 'لا توجد مفضلات تطابق بحثك' },

  // Blocked Users
  'blocked.title': { en: 'Blocked Users', fr: 'Utilisateurs bloques', it: 'Utenti bloccati', es: 'Usuarios bloqueados', zh: '已屏蔽用户', ja: 'ブロックしたユーザー', ar: 'المستخدمون المحظورون' },
  'blocked.noBlocked': { en: 'No blocked users', fr: 'Aucun utilisateur bloque', it: 'Nessun utente bloccato', es: 'Sin usuarios bloqueados', zh: '没有被屏蔽的用户', ja: 'ブロックしたユーザーがいません', ar: 'لا يوجد مستخدمون محظورون' },
  'blocked.willAppear': { en: 'Users you block will appear here', fr: 'Les utilisateurs que vous bloquez apparaitront ici', it: 'Gli utenti che blocchi appariranno qui', es: 'Los usuarios que bloquees apareceran aqui', zh: '你屏蔽的用户将显示在这里', ja: 'ブロックしたユーザーはここに表示されます', ar: 'المستخدمون الذين تحظرهم سيظهرون هنا' },

  // Privacy Settings
  'privacy.title': { en: 'Privacy Settings', fr: 'Parametres de confidentialite', it: 'Impostazioni Privacy', es: 'Configuracion de privacidad', zh: '隐私设置', ja: 'プライバシー設定', ar: 'إعدادات الخصوصية' },
  'privacy.subtitle': { en: 'Control who can see your profile and interact with you', fr: 'Controlez qui peut voir votre profil et interagir avec vous', it: 'Controlla chi puo vedere il tuo profilo e interagire con te', es: 'Controla quien puede ver tu perfil e interactuar contigo', zh: '控制谁可以看到你的资料并与你互动', ja: 'プロフィールの閲覧とやり取りを管理', ar: 'تحكم في من يمكنه رؤية ملفك الشخصي والتفاعل معك' },
  'privacy.disableViewTracking': { en: 'Disable View Tracking', fr: 'Desactiver le suivi des vues', it: 'Disabilita tracciamento visualizzazioni', es: 'Desactivar seguimiento de visitas', zh: '禁用查看追踪', ja: '閲覧追跡を無効にする', ar: 'تعطيل تتبع المشاهدات' },
  'privacy.disableViewTrackingDesc': { en: 'Prevent others from seeing that you viewed their profile', fr: 'Empecher les autres de voir que vous avez consulte leur profil', it: 'Impedisci agli altri di vedere che hai visualizzato il loro profilo', es: 'Evita que otros vean que visitaste su perfil', zh: '阻止他人看到你查看了他们的资料', ja: '他のユーザーがあなたの閲覧を見れないようにする', ar: 'منع الآخرين من رؤية أنك شاهدت ملفهم' },
  'privacy.anonymousBrowsing': { en: 'Anonymous Browsing', fr: 'Navigation anonyme', it: 'Navigazione anonima', es: 'Navegacion anonima', zh: '匿名浏览', ja: '匿名ブラウジング', ar: 'تصفح مجهول' },
  'privacy.anonymousBrowsingDesc': { en: 'Browse profiles without leaving a trace', fr: 'Parcourir les profils sans laisser de trace', it: 'Naviga nei profili senza lasciare traccia', es: 'Navega perfiles sin dejar huella', zh: '浏览资料而不留下痕迹', ja: '痕跡を残さずにプロフィールを閲覧', ar: 'تصفح الملفات دون ترك أثر' },
  'privacy.whoCanSeeProfile': { en: 'Who can see your profile', fr: 'Qui peut voir votre profil', it: 'Chi puo vedere il tuo profilo', es: 'Quien puede ver tu perfil', zh: '谁可以看到你的资料', ja: 'プロフィールの閲覧者', ar: 'من يمكنه رؤية ملفك' },
  'privacy.whoCanMessage': { en: 'Who can message you', fr: 'Qui peut vous envoyer des messages', it: 'Chi puo inviarti messaggi', es: 'Quien puede enviarte mensajes', zh: '谁可以给你发消息', ja: 'メッセージの送信者', ar: 'من يمكنه مراسلتك' },
  'privacy.everyone': { en: 'Everyone', fr: 'Tout le monde', it: 'Tutti', es: 'Todos', zh: '所有人', ja: '全員', ar: 'الجميع' },
  'privacy.matchesOnly': { en: 'Matches Only', fr: 'Matchs uniquement', it: 'Solo match', es: 'Solo coincidencias', zh: '仅匹配', ja: 'マッチのみ', ar: 'التطابقات فقط' },
  'privacy.nobody': { en: 'Nobody', fr: 'Personne', it: 'Nessuno', es: 'Nadie', zh: '无人', ja: '誰もいない', ar: 'لا أحد' },
  'privacy.locationPrivacy': { en: 'Location Privacy Level', fr: 'Niveau de confidentialite de la position', it: 'Livello privacy posizione', es: 'Nivel de privacidad de ubicacion', zh: '位置隐私级别', ja: '位置プライバシーレベル', ar: 'مستوى خصوصية الموقع' },
  'privacy.highPrivacy': { en: 'High Privacy', fr: 'Haute confidentialite', it: 'Alta Privacy', es: 'Alta privacidad', zh: '高隐私', ja: '高プライバシー', ar: 'خصوصية عالية' },
  'privacy.highPrivacyDesc': { en: 'Location fuzzy within ~2 km. Others see distance ranges only', fr: 'Position floue dans un rayon de ~2 km. Les autres ne voient que des plages de distance', it: 'Posizione sfocata entro ~2 km. Gli altri vedono solo intervalli di distanza', es: 'Ubicacion difusa dentro de ~2 km. Otros ven solo rangos de distancia', zh: '位置模糊在约2公里内。其他人只能看到距离范围', ja: '位置は約2km以内でぼかされます。他のユーザーには距離範囲のみ表示', ar: 'الموقع ضبابي ضمن ~2 كم. الآخرون يرون نطاقات المسافة فقط' },
  'privacy.balanced': { en: 'Balanced (Recommended)', fr: 'Equilibre (Recommande)', it: 'Bilanciato (Consigliato)', es: 'Equilibrado (Recomendado)', zh: '平衡（推荐）', ja: 'バランス（推奨）', ar: 'متوازن (موصى به)' },
  'privacy.balancedDesc': { en: 'Location fuzzy within ~1 km. Good balance of privacy and accuracy', fr: 'Position floue dans un rayon de ~1 km. Bon equilibre entre confidentialite et precision', it: 'Posizione sfocata entro ~1 km. Buon equilibrio tra privacy e precisione', es: 'Ubicacion difusa dentro de ~1 km. Buen equilibrio de privacidad y precision', zh: '位置模糊在约1公里内。隐私和准确性的良好平衡', ja: '位置は約1km以内でぼかされます。プライバシーと精度のバランスが良い', ar: 'الموقع ضبابي ضمن ~1 كم. توازن جيد بين الخصوصية والدقة' },
  'privacy.precise': { en: 'Precise', fr: 'Precis', it: 'Preciso', es: 'Preciso', zh: '精确', ja: '正確', ar: 'دقيق' },
  'privacy.preciseDesc': { en: 'Location fuzzy within ~500 m. More accurate for local matching', fr: 'Position floue dans un rayon de ~500 m. Plus precis pour le match local', it: 'Posizione sfocata entro ~500 m. Piu preciso per il matching locale', es: 'Ubicacion difusa dentro de ~500 m. Mas preciso para coincidencias locales', zh: '位置模糊在约500米内。更适合本地匹配', ja: '位置は約500m以内でぼかされます。ローカルマッチングにより正確', ar: 'الموقع ضبابي ضمن ~500 م. أكثر دقة للتطابق المحلي' },
  'privacy.saveSettings': { en: 'Save Privacy Settings', fr: 'Sauvegarder les parametres', it: 'Salva impostazioni privacy', es: 'Guardar configuracion de privacidad', zh: '保存隐私设置', ja: 'プライバシー設定を保存', ar: 'حفظ إعدادات الخصوصية' },

  // Profile Setup
  'setup.title': { en: 'Complete Your Profile', fr: 'Completez votre profil', it: 'Completa il tuo Profilo', es: 'Completa tu perfil', zh: '完善你的个人资料', ja: 'プロフィールを完成させる', ar: 'أكمل ملفك الشخصي' },
  'setup.subtitle': { en: 'Set up your profile to start networking', fr: 'Configurez votre profil pour commencer le networking', it: 'Configura il tuo profilo per iniziare a fare networking', es: 'Configura tu perfil para empezar a hacer networking', zh: '设置你的资料开始社交', ja: 'ネットワーキングを始めるためにプロフィールを設定', ar: 'أعد ملفك الشخصي لبدء التواصل' },
  'setup.username': { en: 'Username', fr: "Nom d'utilisateur", it: 'Username', es: 'Nombre de usuario', zh: '用户名', ja: 'ユーザー名', ar: 'اسم المستخدم' },
  'setup.usernamePlaceholder': { en: 'e.g. artist_123', fr: 'ex. artiste_123', it: 'es. artista_123', es: 'ej. artista_123', zh: '例如 artist_123', ja: '例: artist_123', ar: 'مثال: artist_123' },
  'setup.usernameHelp': { en: '3-20 characters, only lowercase letters, numbers and underscore', fr: '3-20 caracteres, lettres minuscules, chiffres et underscore uniquement', it: '3-20 caratteri, solo lettere minuscole, numeri e underscore', es: '3-20 caracteres, solo letras minusculas, numeros y guion bajo', zh: '3-20个字符，仅小写字母、数字和下划线', ja: '3-20文字、小文字・数字・アンダースコアのみ', ar: '3-20 حرفًا، أحرف صغيرة وأرقام وشرطة سفلية فقط' },
  'setup.displayAs': { en: 'How do you want to be displayed?', fr: 'Comment voulez-vous etre affiche ?', it: 'Come vuoi essere visualizzato?', es: 'Como quieres que te muestren?', zh: '你希望如何显示？', ja: 'どのように表示したいですか？', ar: 'كيف تريد أن يتم عرضك؟' },
  'setup.realName': { en: 'Real First and Last Name', fr: 'Vrai prenom et nom', it: 'Nome e Cognome reali', es: 'Nombre y apellido reales', zh: '真实姓名', ja: '本名', ar: 'الاسم الحقيقي' },
  'setup.usernameNickname': { en: 'Username (nickname)', fr: "Nom d'utilisateur (surnom)", it: 'Username (nickname)', es: 'Nombre de usuario (apodo)', zh: '用户名（昵称）', ja: 'ユーザー名（ニックネーム）', ar: 'اسم المستخدم (الكنية)' },
  'setup.portfolio': { en: 'Portfolio', fr: 'Portfolio', it: 'Portfolio', es: 'Portafolio', zh: '作品集', ja: 'ポートフォリオ', ar: 'الحقيبة' },
  'setup.externalLink': { en: 'External link', fr: 'Lien externe', it: 'Link esterno', es: 'Enlace externo', zh: '外部链接', ja: '外部リンク', ar: 'رابط خارجي' },
  'setup.uploadPDF': { en: 'Upload PDF', fr: 'Telecharger PDF', it: 'Carica PDF', es: 'Subir PDF', zh: '上传PDF', ja: 'PDFをアップロード', ar: 'رفع PDF' },
  'setup.galleryLabel': { en: 'Work Gallery (max 10 images)', fr: 'Galerie (max 10 images)', it: 'Galleria Lavori (max 10 immagini)', es: 'Galeria de trabajos (max 10 imagenes)', zh: '作品画廊（最多10张图片）', ja: '作品ギャラリー（最大10枚）', ar: 'معرض الأعمال (حد أقصى 10 صور)' },
  'setup.galleryHelp': { en: 'Upload your best works to showcase to other users', fr: 'Telechargez vos meilleures oeuvres pour les montrer aux autres', it: 'Carica le tue migliori opere per mostrarti agli altri utenti', es: 'Sube tus mejores trabajos para mostrarselos a otros usuarios', zh: '上传你最好的作品展示给其他用户', ja: 'ベスト作品をアップロードして他のユーザーに見せましょう', ar: 'ارفع أفضل أعمالك لعرضها على المستخدمين الآخرين' },
  'setup.uploadImages': { en: 'Upload images', fr: 'Telecharger des images', it: 'Carica immagini', es: 'Subir imagenes', zh: '上传图片', ja: '画像をアップロード', ar: 'رفع صور' },
  'setup.imagesUploaded': { en: '{count}/10 images uploaded', fr: '{count}/10 images telechargees', it: '{count}/10 immagini caricate', es: '{count}/10 imagenes subidas', zh: '{count}/10 张图片已上传', ja: '{count}/10 枚アップロード済み', ar: '{count}/10 صور مرفوعة' },
  'setup.professionalInfo': { en: 'Professional Information', fr: 'Informations professionnelles', it: 'Informazioni Professionali', es: 'Informacion profesional', zh: '专业信息', ja: '専門情報', ar: 'المعلومات المهنية' },
  'setup.artistSpecialization': { en: 'Artist Specialization', fr: 'Specialisation artistique', it: 'Specializzazione Artistica', es: 'Especializacion artistica', zh: '艺术专业', ja: 'アーティスト専門分野', ar: 'التخصص الفني' },
  'setup.educationLevel': { en: 'Education Level', fr: "Niveau d'education", it: 'Livello di Istruzione', es: 'Nivel de educacion', zh: '教育水平', ja: '学歴', ar: 'المستوى التعليمي' },
  'setup.selfTaught': { en: 'Self-Taught', fr: 'Autodidacte', it: 'Autodidatta', es: 'Autodidacta', zh: '自学', ja: '独学', ar: 'عصامي' },
  'setup.highSchool': { en: 'High School', fr: 'Lycee', it: 'Scuola Superiore', es: 'Escuela secundaria', zh: '高中', ja: '高校', ar: 'المدرسة الثانوية' },
  'setup.bootcamp': { en: 'Bootcamp', fr: 'Bootcamp', it: 'Bootcamp', es: 'Bootcamp', zh: '训练营', ja: 'ブートキャンプ', ar: 'بوتكامب' },
  'setup.onlineCourses': { en: 'Online Courses', fr: 'Cours en ligne', it: 'Corsi Online', es: 'Cursos en linea', zh: '在线课程', ja: 'オンラインコース', ar: 'دورات عبر الإنترنت' },
  'setup.associate': { en: "Associate's Degree", fr: 'Licence', it: 'Laurea Triennale', es: 'Titulo asociado', zh: '副学士', ja: '準学士', ar: 'شهادة جامعية' },
  'setup.bachelor': { en: "Bachelor's Degree", fr: 'Licence', it: 'Laurea', es: 'Licenciatura', zh: '学士', ja: '学士', ar: 'بكالوريوس' },
  'setup.master': { en: "Master's Degree", fr: 'Master', it: 'Magistrale', es: 'Maestria', zh: '硕士', ja: '修士', ar: 'ماجستير' },
  'setup.doctorate': { en: 'Doctorate', fr: 'Doctorat', it: 'Dottorato', es: 'Doctorado', zh: '博士', ja: '博士', ar: 'دكتوراه' },
  'setup.yearsExperience': { en: 'Years of Experience', fr: "Annees d'experience", it: 'Anni di Esperienza', es: 'Anos de experiencia', zh: '经验年限', ja: '経験年数', ar: 'سنوات الخبرة' },
  'setup.availability': { en: 'Availability', fr: 'Disponibilite', it: 'Disponibilita', es: 'Disponibilidad', zh: '可用性', ja: '可用性', ar: 'التوفر' },
  'setup.openToOpportunities': { en: 'Open to Opportunities', fr: 'Ouvert aux opportunites', it: 'Aperto a Opportunita', es: 'Abierto a oportunidades', zh: '开放机会', ja: '機会に開かれている', ar: 'مفتوح للفرص' },
  'setup.availableFreelance': { en: 'Available for Freelance', fr: 'Disponible en freelance', it: 'Disponibile per Freelance', es: 'Disponible para freelance', zh: '可接自由职业', ja: 'フリーランス可', ar: 'متاح للعمل الحر' },
  'setup.fullTimeOnly': { en: 'Full-Time Only', fr: 'Temps plein uniquement', it: 'Solo Full-Time', es: 'Solo tiempo completo', zh: '仅全职', ja: 'フルタイムのみ', ar: 'دوام كامل فقط' },
  'setup.notAvailable': { en: 'Not Available', fr: 'Non disponible', it: 'Non Disponibile', es: 'No disponible', zh: '不可用', ja: '利用不可', ar: 'غير متاح' },
  'setup.languages': { en: 'Languages', fr: 'Langues', it: 'Lingue', es: 'Idiomas', zh: '语言', ja: '言語', ar: 'اللغات' },
  'setup.languagePlaceholder': { en: 'e.g. English, French', fr: 'ex. Francais, Anglais', it: 'es. Italiano, Inglese', es: 'ej. Espanol, Ingles', zh: '例如 中文, 英语', ja: '例: 日本語, 英語', ar: 'مثال: العربية، الإنجليزية' },
  'setup.preferredWorkTypes': { en: 'Preferred Work Types', fr: 'Types de travail preferes', it: 'Tipi di Lavoro Preferiti', es: 'Tipos de trabajo preferidos', zh: '首选工作类型', ja: '希望する作業タイプ', ar: 'أنواع العمل المفضلة' },
  'setup.workTypePlaceholder': { en: 'e.g. Commissions, Long-term Projects', fr: 'ex. Commandes, Projets a long terme', it: 'es. Commissioni, Progetti a Lungo Termine', es: 'ej. Comisiones, Proyectos a largo plazo', zh: '例如 委托, 长期项目', ja: '例: コミッション, 長期プロジェクト', ar: 'مثال: عمولات، مشاريع طويلة الأمد' },
  'setup.socialMediaPortfolio': { en: 'Social Media & Portfolio', fr: 'Reseaux sociaux & Portfolio', it: 'Social Media & Portfolio', es: 'Redes sociales y portafolio', zh: '社交媒体和作品集', ja: 'ソーシャルメディア＆ポートフォリオ', ar: 'وسائل التواصل والحقيبة' },
  'setup.socialMediaHelp': { en: 'Connect your social accounts and portfolio to showcase your work', fr: 'Connectez vos comptes sociaux et portfolio pour montrer votre travail', it: 'Connetti i tuoi account social e portfolio per far vedere il tuo lavoro', es: 'Conecta tus cuentas sociales y portafolio para mostrar tu trabajo', zh: '连接你的社交账号和作品集来展示你的作品', ja: 'ソーシャルアカウントとポートフォリオを接続して作品を紹介', ar: 'اربط حساباتك الاجتماعية ومحفظتك لعرض أعمالك' },
  'setup.personalWebsite': { en: 'Personal Website', fr: 'Site Web personnel', it: 'Sito Web Personale', es: 'Sitio web personal', zh: '个人网站', ja: '個人ウェブサイト', ar: 'الموقع الشخصي' },
  'setup.profilePreview': { en: 'Profile Preview', fr: 'Apercu du profil', it: 'Anteprima Profilo', es: 'Vista previa del perfil', zh: '资料预览', ja: 'プロフィールプレビュー', ar: 'معاينة الملف الشخصي' },
  'setup.yourProfilePreview': { en: 'Your Profile Preview', fr: 'Apercu de votre profil', it: 'Anteprima del Tuo Profilo', es: 'Vista previa de tu perfil', zh: '你的资料预览', ja: 'あなたのプロフィールプレビュー', ar: 'معاينة ملفك الشخصي' },
  'setup.completing': { en: 'Completing...', fr: 'Finalisation...', it: 'Completamento...', es: 'Completando...', zh: '完成中...', ja: '完了中...', ar: 'جارٍ الإكمال...' },
  'setup.completeProfile': { en: 'Complete Profile', fr: 'Completer le profil', it: 'Completa Profilo', es: 'Completar perfil', zh: '完成资料', ja: 'プロフィール完成', ar: 'إكمال الملف الشخصي' },
  'setup.selectEducation': { en: 'Select your education level', fr: 'Selectionnez votre niveau d\'education', it: 'Seleziona il tuo livello di istruzione', es: 'Selecciona tu nivel de educacion', zh: '选择你的教育水平', ja: '学歴を選択', ar: 'اختر مستواك التعليمي' },
  'setup.fileSelected': { en: 'File selected', fr: 'Fichier selectionne', it: 'File selezionato', es: 'Archivo seleccionado', zh: '已选择文件', ja: 'ファイル選択済み', ar: 'تم تحديد الملف' },

  // Profile / User Profile
  'profile.portfolio': { en: 'Portfolio', fr: 'Portfolio', it: 'Portfolio', es: 'Portafolio', zh: '作品集', ja: 'ポートフォリオ', ar: 'الحقيبة' },
  'profile.recentWorks': { en: 'Recent Works', fr: 'Oeuvres recentes', it: 'Opere Recenti', es: 'Trabajos recientes', zh: '最近作品', ja: '最近の作品', ar: 'الأعمال الحديثة' },
  'profile.skills': { en: 'Skills', fr: 'Competences', it: 'Competenze', es: 'Habilidades', zh: '技能', ja: 'スキル', ar: 'المهارات' },
  'profile.programs': { en: 'Programs', fr: 'Programmes', it: 'Programmi', es: 'Programas', zh: '软件', ja: 'プログラム', ar: 'البرامج' },
  'profile.contactInfo': { en: 'Contact Information', fr: 'Informations de contact', it: 'Informazioni di contatto', es: 'Informacion de contacto', zh: '联系信息', ja: '連絡先情報', ar: 'معلومات الاتصال' },
  'profile.profileNotFound': { en: 'Profile not found', fr: 'Profil introuvable', it: 'Profilo non trovato', es: 'Perfil no encontrado', zh: '未找到资料', ja: 'プロフィールが見つかりません', ar: 'الملف الشخصي غير موجود' },
  'profile.totalLikes': { en: 'Total likes', fr: 'Total de likes', it: 'Totale like', es: 'Total de me gusta', zh: '总点赞数', ja: '合計いいね', ar: 'إجمالي الإعجابات' },
  'profile.totalViews': { en: 'Total views', fr: 'Total de vues', it: 'Totale visualizzazioni', es: 'Total de vistas', zh: '总浏览量', ja: '合計閲覧数', ar: 'إجمالي المشاهدات' },
  'profile.profileViews': { en: 'Profile views', fr: 'Vues du profil', it: 'Visualizzazioni profilo', es: 'Vistas del perfil', zh: '资料浏览量', ja: 'プロフィール閲覧数', ar: 'مشاهدات الملف الشخصي' },

  // Admin
  'admin.userReports': { en: 'User Reports', fr: 'Signalements utilisateurs', it: 'Segnalazioni utenti', es: 'Reportes de usuarios', zh: '用户举报', ja: 'ユーザー報告', ar: 'تقارير المستخدمين' },
  'admin.reviewModerate': { en: 'Review and moderate reported content and users', fr: 'Examiner et moderer le contenu et les utilisateurs signales', it: 'Rivedi e modera contenuti e utenti segnalati', es: 'Revisar y moderar contenido y usuarios reportados', zh: '审查和管理被举报的内容和用户', ja: '報告されたコンテンツとユーザーの確認と管理', ar: 'مراجعة وإدارة المحتوى والمستخدمين المبلغ عنهم' },
  'admin.suspiciousActivity': { en: 'Suspicious Activity', fr: 'Activite suspecte', it: 'Attivita sospetta', es: 'Actividad sospechosa', zh: '可疑活动', ja: '不審な活動', ar: 'نشاط مشبوه' },
  'admin.securityAlerts': { en: 'Monitor automated security alerts', fr: 'Surveiller les alertes de securite automatiques', it: 'Monitora gli avvisi di sicurezza automatici', es: 'Monitorear alertas de seguridad automaticas', zh: '监控自动安全警报', ja: '自動セキュリティアラートの監視', ar: 'مراقبة تنبيهات الأمان التلقائية' },
  'admin.auditLogs': { en: 'Audit Logs', fr: 'Journaux d\'audit', it: 'Log di audit', es: 'Registros de auditoria', zh: '审计日志', ja: '監査ログ', ar: 'سجلات التدقيق' },
  'admin.completeHistory': { en: 'Complete history of admin actions', fr: 'Historique complet des actions admin', it: 'Cronologia completa delle azioni admin', es: 'Historial completo de acciones de administrador', zh: '管理员操作完整历史', ja: '管理者操作の完全な履歴', ar: 'السجل الكامل لإجراءات المسؤول' },
  'admin.noReports': { en: 'No reports to review', fr: 'Aucun signalement a examiner', it: 'Nessuna segnalazione da esaminare', es: 'Sin reportes para revisar', zh: '没有需要审查的举报', ja: '確認する報告がありません', ar: 'لا توجد تقارير للمراجعة' },

  // Notifications
  'notif.title': { en: 'Notifications', fr: 'Notifications', it: 'Notifiche', es: 'Notificaciones', zh: '通知', ja: '通知', ar: 'الإشعارات' },
  'notif.noNotifications': { en: 'No notifications yet', fr: 'Aucune notification', it: 'Nessuna notifica', es: 'Sin notificaciones', zh: '没有通知', ja: '通知がありません', ar: 'لا توجد إشعارات بعد' },
  'notif.emailNewMatch': { en: 'Email on new match', fr: 'Email lors d\'un nouveau match', it: 'Email per nuovo match', es: 'Email en nueva coincidencia', zh: '新匹配时发邮件', ja: '新しいマッチ時にメール', ar: 'بريد عند تطابق جديد' },
  'notif.emailNewMessage': { en: 'Email on new message', fr: 'Email lors d\'un nouveau message', it: 'Email per nuovo messaggio', es: 'Email en nuevo mensaje', zh: '新消息时发邮件', ja: '新メッセージ時にメール', ar: 'بريد عند رسالة جديدة' },
  'notif.emailNewComment': { en: 'Email on new comment', fr: 'Email lors d\'un nouveau commentaire', it: 'Email per nuovo commento', es: 'Email en nuevo comentario', zh: '新评论时发邮件', ja: '新コメント時にメール', ar: 'بريد عند تعليق جديد' },
  'notif.emailNewOpp': { en: 'Email on new opportunity', fr: 'Email lors d\'une nouvelle opportunite', it: 'Email per nuova opportunita', es: 'Email en nueva oportunidad', zh: '新机会时发邮件', ja: '新しい機会時にメール', ar: 'بريد عند فرصة جديدة' },

  // Report
  'report.fakeProfile': { en: 'Fake Profile', fr: 'Faux profil', it: 'Profilo falso', es: 'Perfil falso', zh: '虚假资料', ja: '偽プロフィール', ar: 'ملف شخصي مزيف' },
  'report.harassment': { en: 'Harassment', fr: 'Harcelement', it: 'Molestie', es: 'Acoso', zh: '骚扰', ja: 'ハラスメント', ar: 'تحرش' },
  'report.inappropriateContent': { en: 'Inappropriate Content', fr: 'Contenu inapproprie', it: 'Contenuto inappropriato', es: 'Contenido inapropiado', zh: '不当内容', ja: '不適切なコンテンツ', ar: 'محتوى غير لائق' },
  'report.nsfwContent': { en: 'Report NSFW Content', fr: 'Signaler contenu NSFW', it: 'Segnala contenuto NSFW', es: 'Reportar contenido NSFW', zh: '举报NSFW内容', ja: 'NSFWコンテンツを報告', ar: 'الإبلاغ عن محتوى للبالغين' },

  // Profile Editor
  'editor.basicInfo': { en: 'Basic Information', fr: 'Informations de base', it: 'Informazioni Base', es: 'Informacion basica', zh: '基本信息', ja: '基本情報', ar: 'المعلومات الأساسية' },
  'editor.fullName': { en: 'Full Name', fr: 'Nom complet', it: 'Nome Completo', es: 'Nombre completo', zh: '全名', ja: '氏名', ar: 'الاسم الكامل' },
  'editor.showAs': { en: 'Show as', fr: 'Afficher comme', it: 'Mostra come', es: 'Mostrar como', zh: '显示为', ja: '表示名', ar: 'عرض كـ' },
  'editor.realNameLabel': { en: 'Real Name', fr: 'Nom reel', it: 'Nome Reale', es: 'Nombre real', zh: '真名', ja: '本名', ar: 'الاسم الحقيقي' },
  'editor.profileImages': { en: 'Profile Images', fr: 'Images du profil', it: 'Immagini del profilo', es: 'Imagenes del perfil', zh: '资料图片', ja: 'プロフィール画像', ar: 'صور الملف الشخصي' },
  'editor.workImages': { en: 'Work Images', fr: 'Images des oeuvres', it: 'Immagini Lavori', es: 'Imagenes de trabajo', zh: '作品图片', ja: '作品画像', ar: 'صور الأعمال' },
  'editor.uploadPortfolioPDF': { en: 'Upload PDF Portfolio', fr: 'Telecharger portfolio PDF', it: 'Carica Portfolio PDF', es: 'Subir portafolio PDF', zh: '上传PDF作品集', ja: 'PDFポートフォリオをアップロード', ar: 'رفع محفظة PDF' },
  'editor.portfolioLink': { en: 'Portfolio URL', fr: 'URL du portfolio', it: 'URL Portfolio', es: 'URL del portafolio', zh: '作品集链接', ja: 'ポートフォリオURL', ar: 'رابط الحقيبة' },
  'editor.profileSettings': { en: 'Profile Settings', fr: 'Parametres du profil', it: 'Impostazioni Profilo', es: 'Configuracion del perfil', zh: '资料设置', ja: 'プロフィール設定', ar: 'إعدادات الملف الشخصي' },

  // Location
  'location.enableLocation': { en: 'Enable Location', fr: 'Activer la position', it: 'Abilita posizione', es: 'Habilitar ubicacion', zh: '启用位置', ja: '位置情報を有効にする', ar: 'تفعيل الموقع' },
  'location.showLocation': { en: 'Show Location', fr: 'Afficher la position', it: 'Mostra posizione', es: 'Mostrar ubicacion', zh: '显示位置', ja: '位置を表示', ar: 'عرض الموقع' },
  'location.locationStatus': { en: 'Location Status', fr: 'Statut de la position', it: 'Stato posizione', es: 'Estado de ubicacion', zh: '位置状态', ja: '位置ステータス', ar: 'حالة الموقع' },
  'location.searchRadius': { en: 'Search Radius', fr: 'Rayon de recherche', it: 'Raggio di ricerca', es: 'Radio de busqueda', zh: '搜索半径', ja: '検索半径', ar: 'نطاق البحث' },

  // Watermark
  'watermark.create': { en: 'Create Your Watermark', fr: 'Creer votre filigrane', it: 'Crea la tua Filigrana', es: 'Crea tu marca de agua', zh: '创建水印', ja: 'ウォーターマークを作成', ar: 'إنشاء علامتك المائية' },
  'watermark.text': { en: 'Watermark Text', fr: 'Texte du filigrane', it: 'Testo Filigrana', es: 'Texto de marca de agua', zh: '水印文本', ja: 'ウォーターマークテキスト', ar: 'نص العلامة المائية' },
  'watermark.image': { en: 'Watermark Image', fr: 'Image du filigrane', it: 'Immagine Filigrana', es: 'Imagen de marca de agua', zh: '水印图片', ja: 'ウォーターマーク画像', ar: 'صورة العلامة المائية' },
  'watermark.style': { en: 'Watermark Style', fr: 'Style du filigrane', it: 'Stile Filigrana', es: 'Estilo de marca de agua', zh: '水印样式', ja: 'ウォーターマークスタイル', ar: 'نمط العلامة المائية' },
  'watermark.position': { en: 'Watermark Position', fr: 'Position du filigrane', it: 'Posizione Filigrana', es: 'Posicion de marca de agua', zh: '水印位置', ja: 'ウォーターマーク位置', ar: 'موضع العلامة المائية' },
  'watermark.repeated': { en: 'Repeated', fr: 'Repete', it: 'Ripetuta', es: 'Repetida', zh: '重复', ja: '繰り返し', ar: 'متكرر' },
  'watermark.opacity': { en: 'Opacity', fr: 'Opacite', it: 'Opacita', es: 'Opacidad', zh: '不透明度', ja: '不透明度', ar: 'الشفافية' },

  // 3D Editor
  'editor3d.materialType': { en: 'Material Type', fr: 'Type de materiau', it: 'Tipo di materiale', es: 'Tipo de material', zh: '材质类型', ja: 'マテリアルタイプ', ar: 'نوع المادة' },
  'editor3d.renderMode': { en: 'Render Mode', fr: 'Mode de rendu', it: 'Modalita di rendering', es: 'Modo de renderizado', zh: '渲染模式', ja: 'レンダーモード', ar: 'وضع العرض' },
  'editor3d.environment': { en: 'Environment', fr: 'Environnement', it: 'Ambiente', es: 'Entorno', zh: '环境', ja: '環境', ar: 'البيئة' },
  'editor3d.backgroundColor': { en: 'Background Color', fr: 'Couleur d\'arriere-plan', it: 'Colore di sfondo', es: 'Color de fondo', zh: '背景颜色', ja: '背景色', ar: 'لون الخلفية' },
  'editor3d.metalness': { en: 'Metalness', fr: 'Metallicite', it: 'Metallicita', es: 'Metalicidad', zh: '金属度', ja: 'メタルネス', ar: 'المعدنية' },
  'editor3d.roughness': { en: 'Roughness', fr: 'Rugosite', it: 'Rugosita', es: 'Rugosidad', zh: '粗糙度', ja: 'ラフネス', ar: 'الخشونة' },
  'editor3d.mainLight': { en: 'Main Light Intensity', fr: 'Intensite de la lumiere principale', it: 'Intensita luce principale', es: 'Intensidad de luz principal', zh: '主光强度', ja: 'メインライト強度', ar: 'شدة الإضاءة الرئيسية' },
  'editor3d.ambientLight': { en: 'Ambient Light', fr: 'Lumiere ambiante', it: 'Luce ambientale', es: 'Luz ambiental', zh: '环境光', ja: 'アンビエントライト', ar: 'الإضاءة المحيطة' },
  'editor3d.saveSettings': { en: 'Save Settings', fr: 'Sauvegarder', it: 'Salva impostazioni', es: 'Guardar configuracion', zh: '保存设置', ja: '設定を保存', ar: 'حفظ الإعدادات' },

  // Misc / Search / Recommendations
  'search.selectCategory': { en: 'Select Artist Bee Category', fr: "Selectionner la categorie d'artiste", it: 'Seleziona Categoria Artista Bee', es: 'Seleccionar categoria de artista Bee', zh: '选择艺术家蜜蜂类别', ja: 'アーティストBeeカテゴリーを選択', ar: 'اختر فئة فنان النحل' },
  'recommendations.title': { en: 'Recommended for You', fr: 'Recommande pour vous', it: 'Consigliati per te', es: 'Recomendado para ti', zh: '为你推荐', ja: 'あなたへのおすすめ', ar: 'موصى به لك' },

  // Analytics
  'analytics.publishedWorks': { en: 'Published works', fr: 'Oeuvres publiees', it: 'Opere pubblicate', es: 'Trabajos publicados', zh: '已发布作品', ja: '公開済み作品', ar: 'الأعمال المنشورة' },
  'analytics.recentViews': { en: 'No recent views yet', fr: 'Aucune vue recente', it: 'Nessuna visualizzazione recente', es: 'Sin vistas recientes', zh: '还没有最近的浏览', ja: 'まだ最近の閲覧がありません', ar: 'لا توجد مشاهدات حديثة بعد' },

  // Drafts
  'drafts.title': { en: 'Your Drafts', fr: 'Vos brouillons', it: 'Le tue bozze', es: 'Tus borradores', zh: '你的草稿', ja: 'あなたの下書き', ar: 'مسوداتك' },
  'drafts.noDrafts': { en: 'No drafts found', fr: 'Aucun brouillon', it: 'Nessuna bozza trovata', es: 'Sin borradores', zh: '没有找到草稿', ja: '下書きが見つかりません', ar: 'لم يتم العثور على مسودات' },

  // My Content / My Applications  
  'myContent.noWorks': { en: 'No works', fr: 'Aucune oeuvre', it: 'Nessun lavoro', es: 'Sin trabajos', zh: '没有作品', ja: '作品がありません', ar: 'لا توجد أعمال' },
  'myApps.noApplications': { en: 'No applications', fr: 'Aucune candidature', it: 'Nessuna candidatura', es: 'Sin solicitudes', zh: '没有申请', ja: '応募がありません', ar: 'لا توجد طلبات' },
  'myApps.noApplicationsSent': { en: 'You have not sent any applications yet', fr: "Vous n'avez pas encore envoye de candidatures", it: 'Non hai ancora inviato candidature', es: 'Aun no has enviado solicitudes', zh: '你还没有提交申请', ja: 'まだ応募を送信していません', ar: 'لم ترسل أي طلبات بعد' },
  'myApps.rejected': { en: 'Rejected', fr: 'Rejete', it: 'Rifiutata', es: 'Rechazada', zh: '已拒绝', ja: '不採用', ar: 'مرفوض' },
  'myApps.submitApplication': { en: 'Submit Your Application', fr: 'Soumettre votre candidature', it: 'Invia la tua candidatura', es: 'Enviar tu solicitud', zh: '提交申请', ja: '応募を提出', ar: 'أرسل طلبك' },

  // Export
  'export.title': { en: 'Export Portfolio', fr: 'Exporter le portfolio', it: 'Esporta Portfolio', es: 'Exportar portafolio', zh: '导出作品集', ja: 'ポートフォリオをエクスポート', ar: 'تصدير الحقيبة' },
  'export.portfolioWorks': { en: 'Portfolio Works', fr: 'Oeuvres du portfolio', it: 'Opere del Portfolio', es: 'Trabajos del portafolio', zh: '作品集作品', ja: 'ポートフォリオ作品', ar: 'أعمال الحقيبة' },

  // Time-related
  'time.justNow': { en: 'Just now', fr: "A l'instant", it: 'Proprio ora', es: 'Justo ahora', zh: '刚刚', ja: 'たった今', ar: 'الآن' },
  'time.mAgo': { en: '{n}m ago', fr: 'il y a {n}m', it: '{n}m fa', es: 'hace {n}m', zh: '{n}分钟前', ja: '{n}分前', ar: 'منذ {n} دقيقة' },
  'time.hAgo': { en: '{n}h ago', fr: 'il y a {n}h', it: '{n}h fa', es: 'hace {n}h', zh: '{n}小时前', ja: '{n}時間前', ar: 'منذ {n} ساعة' },
  'time.dAgo': { en: '{n}d ago', fr: 'il y a {n}j', it: '{n}g fa', es: 'hace {n}d', zh: '{n}天前', ja: '{n}日前', ar: 'منذ {n} يوم' },

  // Onboarding
  'onboarding.activityFeed': { en: 'Activity feed coming soon', fr: 'Fil d\'activite bientot disponible', it: 'Feed attivita in arrivo', es: 'Feed de actividad proximamente', zh: '活动动态即将推出', ja: 'アクティビティフィード近日公開', ar: 'تغذية النشاط قريبًا' },

  // Recent Matches
  'recent.matches': { en: 'Recent Matches', fr: 'Matchs recents', it: 'Match recenti', es: 'Coincidencias recientes', zh: '最近匹配', ja: '最近のマッチ', ar: 'التطابقات الأخيرة' },
};
