import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sw' | 'lg' | 'fr' | 'pt' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US/UK)',
    flag: '🇬🇧',
    region: 'Global / International',
    greeting: 'Welcome back, Gamer'
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇹🇿',
    region: 'East Africa (Tanzania, Kenya, DRC)',
    greeting: 'Karibu tena, Mchezaji'
  },
  {
    code: 'lg',
    name: 'Luganda',
    nativeName: 'Oluganda',
    flag: '🇺🇬',
    region: 'Uganda & Great Lakes',
    greeting: 'Tukusanyukidde, Omuzannyi'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'Francophone Africa (DRC, Rwanda, Senegal)',
    greeting: 'Bienvenue, Joueur'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇦🇴',
    region: 'Angola, Mozambique, Lusophone',
    greeting: 'Bem-vindo de volta, Jogador'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇪🇬',
    region: 'North & East Africa (Egypt, Sudan)',
    greeting: 'أهلاً بك مجدداً، أيها اللاعب'
  }
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.live': 'Live Streams',
    'nav.reels': 'Reels & Clips',
    'nav.library': 'My Library',
    'nav.tutorials': 'Tutorials & Guides',
    'nav.games': 'Game Hub',
    'nav.esports': 'Esports & Tourneys',
    'nav.community': 'Clan Community',
    'nav.store': 'Merch & Store',
    'nav.creator': 'Creator Studio',
    'nav.pricing': 'Pro Gamer Pass',
    'nav.settings': 'Settings & Account',
    'nav.golive': 'Go Live',
    'nav.balance': 'Balance',
    'nav.search_placeholder': 'Search streams, pro tutorials, or clans...',

    // Settings
    'settings.title': 'Visor Settings & Account',
    'settings.subtitle': 'Full-featured control center for account security, payment cards, language localization, stream ingest, and edge routing.',
    'settings.lang_tab': 'Language & Region',
    'settings.lang_tab_desc': 'Switch interface language, locale & regional dialect',
    'settings.lang_select_title': 'Select Interface Language',
    'settings.lang_select_desc': 'Choose your preferred language for menus, notifications, creator tip jars, and streaming controls.',
    'settings.lang_applied': 'Language switched to',
    'settings.save': 'Save Settings',
    'settings.saving': 'Saving to Cloud...',
    'settings.saved': 'Settings Saved Successfully',
    'settings.sign_out': 'Sign Out',
    'settings.sign_in': 'Sign In',

    // Tip Jar
    'tipjar.title': 'Creator Tip Jar',
    'tipjar.subtitle': 'Direct support for your favorite streamer with Mobile Money & Cards',
    'tipjar.send_tip': 'Send Tip to Creator',
    'tipjar.goal_progress': 'Tip Jar Goal Progress',
    'tipjar.preset_amounts': 'Quick Tip Presets',
    'tipjar.custom_amount': 'Custom Amount',
    'tipjar.donor_name': 'Your Gamer Tag / Name',
    'tipjar.donor_message': 'Shoutout Message / Note',
    'tipjar.payment_method': 'Payment Gateway',
    'tipjar.confirm_tip': 'Drop in Tip Jar',
    'tipjar.processing': 'Processing Tip...',
    'tipjar.thank_you': 'Thank You For Your Support!',
    'tipjar.tip_received': 'Tip dropped into the jar!',
    'tipjar.recent_tips': 'Recent Tips & Super Supporters',
    'tipjar.no_tips_yet': 'Be the first supporter to drop a tip!',
    'tipjar.test_alert': 'Test Tip Alert Sound & Overlay',
    'tipjar.manage_goal': 'Manage Tip Jar Goal',
    'tipjar.goal_title': 'Goal Title / Stream Upgrade',
    'tipjar.target_amount': 'Target Amount',
    'tipjar.save_goal': 'Save Tip Goal',

    // Generic
    'common.currency': 'Currency',
    'common.copy': 'Copy Link',
    'common.copied': 'Copied!',
    'common.cancel': 'Cancel',
    'common.active': 'Active',
    'common.popular': 'Popular',
    'common.verified': 'Verified Creator',
    'common.subscribers': 'Subscribers',
    'common.viewers': 'Viewers'
  },
  sw: {
    // Nav
    'nav.live': 'Matangazo ya Moja kwa Moja',
    'nav.reels': 'Klipu na Reli',
    'nav.library': 'Maktaba Yangu',
    'nav.tutorials': 'Mafunzo na Miongozo',
    'nav.games': 'Kitovu cha Michezo',
    'nav.esports': 'Mashindano ya Esports',
    'nav.community': 'Jumuiya ya Kifamilia',
    'nav.store': 'Duka la Vifaa',
    'nav.creator': 'Studio ya Mtayarishaji',
    'nav.pricing': 'Kifurushi cha Pro',
    'nav.settings': 'Mipangilio na Akaunti',
    'nav.golive': 'Anza Kutangaza',
    'nav.balance': 'Salio',
    'nav.search_placeholder': 'Tafuta matangazo, mafunzo ya michezo, au koo...',

    // Settings
    'settings.title': 'Mipangilio na Akaunti ya Visor',
    'settings.subtitle': 'Kituo cha kudhibiti usalama wa akaunti, kadi za malipo, lugha ya kiolesura, na seva za kikanda.',
    'settings.lang_tab': 'Lugha na Eneo',
    'settings.lang_tab_desc': 'Badilisha lugha ya kiolesura, eneo na lahaja',
    'settings.lang_select_title': 'Chagua Lugha ya Kiolesura',
    'settings.lang_select_desc': 'Chagua lugha unayopendelea kwa menyu, arifa, chupa ya vidokezo vya watayarishi, na vidhibiti.',
    'settings.lang_applied': 'Lugha imebadilishwa kuwa',
    'settings.save': 'Hifadhi Mipangilio',
    'settings.saving': 'Inahifadhi kwenye Wingu...',
    'settings.saved': 'Mipangilio Imehifadhiwa Kikamilifu',
    'settings.sign_out': 'Ondoka',
    'settings.sign_in': 'Ingia',

    // Tip Jar
    'tipjar.title': 'Chupa ya Zawadi ya Mtayarishaji (Tip Jar)',
    'tipjar.subtitle': 'Msaada wa moja kwa moja kwa mtangazaji wako kwa M-Pesa, Airtel na Kadi',
    'tipjar.send_tip': 'Tuma Zawadi kwa Mtayarishaji',
    'tipjar.goal_progress': 'Maendeleo ya Lengo la Zawadi',
    'tipjar.preset_amounts': 'Viasi vya Haraka',
    'tipjar.custom_amount': 'Kiasi Maalum',
    'tipjar.donor_name': 'Jina lako la Mchezaji',
    'tipjar.donor_message': 'Ujumbe wa Ponyezi / Maoni',
    'tipjar.payment_method': 'Njia ya Malipo',
    'tipjar.confirm_tip': 'Weka kwenye Chupa ya Zawadi',
    'tipjar.processing': 'Inachakata Zawadi...',
    'tipjar.thank_you': 'Asante Sana kwa Msaada Wako!',
    'tipjar.tip_received': 'Zawadi imeingia kwenye chupa!',
    'tipjar.recent_tips': 'Zawadi za Hivi Karibuni na Wafuasi Wakuu',
    'tipjar.no_tips_yet': 'Kuwa msaidizi wa kwanza kutuma zawadi!',
    'tipjar.test_alert': 'Jaribu Kengele ya Zawadi & Madoido',
    'tipjar.manage_goal': 'Simamia Lengo la Zawadi',
    'tipjar.goal_title': 'Jina la Lengo / Uboreshaji wa Matangazo',
    'tipjar.target_amount': 'Kiwango Lengwa',
    'tipjar.save_goal': 'Hifadhi Lengo',

    // Generic
    'common.currency': 'Sarafu',
    'common.copy': 'Nakili Kiungo',
    'common.copied': 'Imenakiliwa!',
    'common.cancel': 'Ghairi',
    'common.active': 'Hai',
    'common.popular': 'Maarufu',
    'common.verified': 'Mtayarishaji Aliyethibitishwa',
    'common.subscribers': 'Wafuatiliaji',
    'common.viewers': 'Watazamaji'
  },
  lg: {
    // Nav
    'nav.live': 'Ebifaananyi eby\'obutereevu',
    'nav.reels': 'Ebikwata eby\'akaseera',
    'nav.library': 'Tterekero Lyange',
    'nav.tutorials': 'Okuyiga n\'Okusomesebwa',
    'nav.games': 'Ekitebe ky\'Emizannyo',
    'nav.esports': 'Empaka z\'Emizannyo',
    'nav.community': 'Ekibiina ky\'Abazannyi',
    'nav.store': 'Dduuka Ly\'Ebintu',
    'nav.creator': 'Situdiyo y\'Omuzannyi',
    'nav.pricing': 'Ppaasi ya Pro Gamer',
    'nav.settings': 'Enteekateeka n\'Akaawunti',
    'nav.golive': 'Tandika Okuzannya ku Mpewo',
    'nav.balance': 'Ssente ezisigaddewo',
    'nav.search_placeholder': 'Noonya emizannyo, obukugu, oba ebibiina...',

    // Settings
    'settings.title': 'Enteekateeka z\'Akaawunti ya Visor',
    'settings.subtitle': 'Wano we woolereza ebyokwerinda, kaada z\'ensawo, olulimi, n\'ebyuma eby\'akabi.',
    'settings.lang_tab': 'Olulimi n\'Ekitundu',
    'settings.lang_tab_desc': 'Kyusa olulimi lw\'enteekateeka n\'ebikolebwa',
    'settings.lang_select_title': 'Londa Olulimi lw\'Enkozesa',
    'settings.lang_select_desc': 'Londa olulimi lwo lw\'oyagala okukozesa ku menyu, obubaka, n\'eccupa y\'okusasula emizannyo.',
    'settings.lang_applied': 'Olulimi lukyusiddwa okudda mu',
    'settings.save': 'Kaza Enteekateeka',
    'settings.saving': 'Kikazibwa mu Kire...',
    'settings.saved': 'Enteekateeka Zikaziddwa Bulungi',
    'settings.sign_out': 'Vaamu',
    'settings.sign_in': 'Yingira',

    // Tip Jar
    'tipjar.title': 'Eccupa y\'Okusiima Omuzannyi (Tip Jar)',
    'tipjar.subtitle': 'Wa omulwanyi wo ssente ez\'ekirabo ng\'okozesa MTN MoMo, Airtel oba Kaada',
    'tipjar.send_tip': 'Sindika Ekirabo eri Omuzannyi',
    'tipjar.goal_progress': 'Ekiruubirirwa ky\'Eccupa y\'Ekirabo',
    'tipjar.preset_amounts': 'Ebiweereddwa amangu',
    'tipjar.custom_amount': 'Omuwendo gw\'Oyagala',
    'tipjar.donor_name': 'Erinnya Lyo mu Muzannyo',
    'tipjar.donor_message': 'Obubaka bw\'Okwebaza',
    'tipjar.payment_method': 'Enkola y\'Okusasuliramu',
    'tipjar.confirm_tip': 'Suula mu Ccupa y\'Ekirabo',
    'tipjar.processing': 'Tukola ku ssente zo...',
    'tipjar.thank_you': 'Webale nnyo okussaamu omuzannyi amaanyi!',
    'tipjar.tip_received': 'Ekirabo kigudde mu ccupa!',
    'tipjar.recent_tips': 'Ebirabo ebiyiseeko n\'Abawagizi Abakulu',
    'tipjar.no_tips_yet': 'Beera gwe asooka okusuula ekirabo mu ccupa eno!',
    'tipjar.test_alert': 'Gezaako eddoboozi ly\'Ekirabo',
    'tipjar.manage_goal': 'Tereza Ekiruubirirwa ky\'Eccupa',
    'tipjar.goal_title': 'Omutwe gw\'Ekiruubirirwa',
    'tipjar.target_amount': 'Omuwendo ogwetaagisa',
    'tipjar.save_goal': 'Kaza Ekiruubirirwa',

    // Generic
    'common.currency': 'Ssente z\'Ekitundu',
    'common.copy': 'Koppa Enkolagana',
    'common.copied': 'Bikoppebwa!',
    'common.cancel': 'Sazaamu',
    'common.active': 'Kikola',
    'common.popular': 'Kittibwa',
    'common.verified': 'Omuzannyi Akakasiddwa',
    'common.subscribers': 'Abagoberezi',
    'common.viewers': 'Abalabi'
  },
  fr: {
    // Nav
    'nav.live': 'Diffusions en Direct',
    'nav.reels': 'Reels & Clips',
    'nav.library': 'Ma Bibliothèque',
    'nav.tutorials': 'Tutoriels & Guides',
    'nav.games': 'Centre de Jeux',
    'nav.esports': 'Esports & Tournois',
    'nav.community': 'Communauté de Clans',
    'nav.store': 'Boutique & Produits',
    'nav.creator': 'Studio Créateur',
    'nav.pricing': 'Passe Pro Gamer',
    'nav.settings': 'Paramètres & Compte',
    'nav.golive': 'Passer en Direct',
    'nav.balance': 'Solde',
    'nav.search_placeholder': 'Rechercher des streams, guides ou clans...',

    // Settings
    'settings.title': 'Paramètres & Compte Visor',
    'settings.subtitle': 'Centre de contrôle complet pour la sécurité du compte, les cartes de paiement, la langue, et le routage des serveurs.',
    'settings.lang_tab': 'Langue & Région',
    'settings.lang_tab_desc': 'Changer la langue d\'interface et le dialecte régional',
    'settings.lang_select_title': 'Sélectionner la Langue de l\'Interface',
    'settings.lang_select_desc': 'Choisissez votre langue préférée pour les menus, notifications, pourboires des créateurs et commandes.',
    'settings.lang_applied': 'Langue changée en',
    'settings.save': 'Enregistrer les Paramètres',
    'settings.saving': 'Enregistrement dans le Cloud...',
    'settings.saved': 'Paramètres Enregistrés avec Succès',
    'settings.sign_out': 'Se Déconnecter',
    'settings.sign_in': 'Se Connecter',

    // Tip Jar
    'tipjar.title': 'Boîte à Pourboires Créateur (Tip Jar)',
    'tipjar.subtitle': 'Soutenez directement votre streamer favori avec Mobile Money & Cartes',
    'tipjar.send_tip': 'Envoyer un Pourboire au Créateur',
    'tipjar.goal_progress': 'Objectif de la Boîte à Pourboires',
    'tipjar.preset_amounts': 'Montants Prédéfinis',
    'tipjar.custom_amount': 'Montant Personnalisé',
    'tipjar.donor_name': 'Votre Pseudo de Joueur',
    'tipjar.donor_message': 'Message d\'encouragement',
    'tipjar.payment_method': 'Moyen de Paiement',
    'tipjar.confirm_tip': 'Déposer dans la Boîte',
    'tipjar.processing': 'Traitement du Pourboire...',
    'tipjar.thank_you': 'Merci beaucoup pour votre soutien !',
    'tipjar.tip_received': 'Pourboire ajouté à la boîte !',
    'tipjar.recent_tips': 'Derniers Pourboires & Super Supporters',
    'tipjar.no_tips_yet': 'Soyez le premier à soutenir ce créateur !',
    'tipjar.test_alert': 'Tester l\'Alerte Sonore & Overlay',
    'tipjar.manage_goal': 'Gérer l\'Objectif de Pourboire',
    'tipjar.goal_title': 'Titre de l\'Objectif / Matériel Stream',
    'tipjar.target_amount': 'Montant Cible',
    'tipjar.save_goal': 'Sauvegarder l\'Objectif',

    // Generic
    'common.currency': 'Devise',
    'common.copy': 'Copier le Lien',
    'common.copied': 'Copié !',
    'common.cancel': 'Annuler',
    'common.active': 'Actif',
    'common.popular': 'Populaire',
    'common.verified': 'Créateur Vérifié',
    'common.subscribers': 'Abonnés',
    'common.viewers': 'Spectateurs'
  },
  pt: {
    // Nav
    'nav.live': 'Transmissões ao Vivo',
    'nav.reels': 'Reels e Clipes',
    'nav.library': 'Minha Biblioteca',
    'nav.tutorials': 'Tutoriais e Guias',
    'nav.games': 'Hub de Jogos',
    'nav.esports': 'Esports e Torneios',
    'nav.community': 'Comunidade de Clãs',
    'nav.store': 'Loja & Merch',
    'nav.creator': 'Estúdio do Criador',
    'nav.pricing': 'Passe Pro Gamer',
    'nav.settings': 'Configurações e Conta',
    'nav.golive': 'Entrar ao Vivo',
    'nav.balance': 'Saldo',
    'nav.search_placeholder': 'Buscar streams, tutoriais ou clãs...',

    // Settings
    'settings.title': 'Configurações e Conta Visor',
    'settings.subtitle': 'Centro de controle completo para segurança da conta, pagamentos, idioma e servidores regionais.',
    'settings.lang_tab': 'Idioma e Região',
    'settings.lang_tab_desc': 'Alterar idioma da interface e dialeto regional',
    'settings.lang_select_title': 'Selecionar Idioma da Interface',
    'settings.lang_select_desc': 'Escolha seu idioma de preferência para menus, notificações e gorjetas.',
    'settings.lang_applied': 'Idioma alterado para',
    'settings.save': 'Salvar Configurações',
    'settings.saving': 'Salvando na Nuvem...',
    'settings.saved': 'Configurações Salvas com Sucesso',
    'settings.sign_out': 'Sair',
    'settings.sign_in': 'Entrar',

    // Tip Jar
    'tipjar.title': 'Pote de Gorjetas do Criador (Tip Jar)',
    'tipjar.subtitle': 'Apoie seu streamer favorito diretamente com Mobile Money e Cartões',
    'tipjar.send_tip': 'Enviar Gorjeta ao Criador',
    'tipjar.goal_progress': 'Progresso da Meta de Gorjetas',
    'tipjar.preset_amounts': 'Valores Rápidos',
    'tipjar.custom_amount': 'Valor Personalizado',
    'tipjar.donor_name': 'Seu Gamer Tag / Nome',
    'tipjar.donor_message': 'Mensagem de Apoio',
    'tipjar.payment_method': 'Método de Pagamento',
    'tipjar.confirm_tip': 'Colocar no Pote',
    'tipjar.processing': 'Processando Gorjeta...',
    'tipjar.thank_you': 'Muito obrigado pelo seu apoio!',
    'tipjar.tip_received': 'Gorjeta adicionada ao pote!',
    'tipjar.recent_tips': 'Gorjetas Recentes e Apoiadores VIP',
    'tipjar.no_tips_yet': 'Seja o primeiro a enviar uma gorjeta!',
    'tipjar.test_alert': 'Testar Alerta Sonoro',
    'tipjar.manage_goal': 'Gerenciar Meta de Gorjetas',
    'tipjar.goal_title': 'Título da Meta / Upgrade de Setup',
    'tipjar.target_amount': 'Valor Alvo',
    'tipjar.save_goal': 'Salvar Meta',

    // Generic
    'common.currency': 'Moeda',
    'common.copy': 'Copiar Link',
    'common.copied': 'Copiado!',
    'common.cancel': 'Cancelar',
    'common.active': 'Ativo',
    'common.popular': 'Popular',
    'common.verified': 'Criador Verificado',
    'common.subscribers': 'Inscritos',
    'common.viewers': 'Espectadores'
  },
  ar: {
    // Nav
    'nav.live': 'البث المباشر',
    'nav.reels': 'المقاطع والريلز',
    'nav.library': 'مكتبتي',
    'nav.tutorials': 'الدروس والشروحات',
    'nav.games': 'مركز الألعاب',
    'nav.esports': 'الرياضات الإلكترونية',
    'nav.community': 'مجتمع الكلانات',
    'nav.store': 'المتجر والعتاد',
    'nav.creator': 'استوديو صانع المحتوى',
    'nav.pricing': 'اشتراك المحترفين',
    'nav.settings': 'الإعدادات والحساب',
    'nav.golive': 'ابدأ البث المباشر',
    'nav.balance': 'الرصيد',
    'nav.search_placeholder': 'ابحث عن البثوث، الشروحات، أو الكلانات...',

    // Settings
    'settings.title': 'إعدادات وحساب فايزور',
    'settings.subtitle': 'مركز التحكم الشامل لأمان الحساب، بطاقات الدفع، اختيار اللغة وخوادم الحافة الإقليمية.',
    'settings.lang_tab': 'اللغة والمنطقة',
    'settings.lang_tab_desc': 'تغيير لغة الواجهة واللهجة الإقليمية',
    'settings.lang_select_title': 'اختر لغة الواجهة',
    'settings.lang_select_desc': 'اختر لغتك المفضلة للقوائم، الإشعارات، جرة إكراميات صناع المحتوى وأزرار التحكم.',
    'settings.lang_applied': 'تم تغيير اللغة إلى',
    'settings.save': 'حفظ الإعدادات',
    'settings.saving': 'جاري الحفظ في السحابة...',
    'settings.saved': 'تم حفظ الإعدادات بنجاح',
    'settings.sign_out': 'تسجيل الخروج',
    'settings.sign_in': 'تسجيل الدخول',

    // Tip Jar
    'tipjar.title': 'جرة إكراميات ودعم صانع المحتوى (Tip Jar)',
    'tipjar.subtitle': 'ادعم الستريمر المفضل لديك مباشرة عبر الدفع عبر الهاتف والبطاقات',
    'tipjar.send_tip': 'إرسال إكرامية لصانع المحتوى',
    'tipjar.goal_progress': 'تقدم هدف جرة الدعم',
    'tipjar.preset_amounts': 'مبالغ سريعة',
    'tipjar.custom_amount': 'مبلغ مخصص',
    'tipjar.donor_name': 'اسم اللاعب / حسابك',
    'tipjar.donor_message': 'رسالة التشجيع / الإهداء',
    'tipjar.payment_method': 'طريقة الدفع',
    'tipjar.confirm_tip': 'وضع في جرة الإكراميات',
    'tipjar.processing': 'جاري معالجة الإكرامية...',
    'tipjar.thank_you': 'شكراً جزيلاً على دعمك الأسطوري!',
    'tipjar.tip_received': 'تمت إضافة الإكرامية بنجاح!',
    'tipjar.recent_tips': 'أحدث الإكراميات وكبار الداعمين',
    'tipjar.no_tips_yet': 'كن أول داعم يضع إكرامية في هذه الجرة!',
    'tipjar.test_alert': 'تجربة تنبيه الصوت وتأثير الدعم',
    'tipjar.manage_goal': 'إدارة هدف جرة الإكراميات',
    'tipjar.goal_title': 'عنوان الهدف / ترقية العتاد',
    'tipjar.target_amount': 'المبلغ المستهدف',
    'tipjar.save_goal': 'حفظ الهدف',

    // Generic
    'common.currency': 'العملة',
    'common.copy': 'نسخ الرابط',
    'common.copied': 'تم النسخ!',
    'common.cancel': 'إلغاء',
    'common.active': 'نشط',
    'common.popular': 'شائع',
    'common.verified': 'صانع محتوى موثق',
    'common.subscribers': 'المشتركون',
    'common.viewers': 'المشاهدون'
  }
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  const langDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return langDict[key] || TRANSLATIONS.en[key] || key;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  currentLanguageOption: SUPPORTED_LANGUAGES[0]
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('visor_selected_language');
    if (saved && ['en', 'sw', 'lg', 'fr', 'pt', 'ar'].includes(saved)) {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('visor_selected_language', newLang);
  };

  const t = (key: string) => getTranslation(key, language);

  const currentLanguageOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
