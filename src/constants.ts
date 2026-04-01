import { RoutineItem, Supplement } from './types';

export const INITIAL_MORNING_ROUTINES: RoutineItem[] = [
  { 
    id: '1', 
    title: 'Power Wasser', 
    value: '200ML', 
    icon: 'Droplets', 
    completed: false, 
    color: 'text-yellow-400',
    protocol: [
      'Zuerst Zähne putzen!',
      '200–300 ml Wasser (Raumtemperatur)',
      'Saft einer halben Zitrone hinzufügen',
      'Eine Prise Meersalz & 3-4g Creapure einrühren',
      '1 Portion hydrolysiertes Kollagenpulver einrühren',
      'Mit Strohhalm zügig trinken (Zahnschmelzschutz)',
      'Anschließend Mund ausspülen'
    ],
    videoUrl: 'https://youtu.be/z_cIF3BGctM?is=6NiwqSs10UDuOEdu'
  },
  { 
    id: '3', 
    title: 'Morgenlicht', 
    value: '10 MIN', 
    icon: 'Sun', 
    completed: false, 
    color: 'text-yellow-400',
    protocol: [
      'Innerhalb der ersten 30-60 Min. nach dem Aufstehen',
      'Nach draußen gehen (Fenster blockieren wichtige Wellenlängen)',
      'Keine Sonnenbrille tragen',
      'Bei klarem Himmel: 5-10 Min.',
      'Bei Bewölkung: 15-20 Min.',
      'Bei starker Bewölkung/Regen: 30 Min.'
    ]
  },
  { 
    id: '4', 
    title: 'Dehnübungen', 
    value: '', 
    icon: 'Activity', 
    completed: false, 
    color: 'text-yellow-400',
    protocol: [
      'Sanfte Mobilisation der Wirbelsäule',
      'Hüftbeuger dehnen',
      'Brustmuskulatur öffnen',
      '3-5 Minuten tiefes Atmen während der Übungen'
    ]
  },
];

export const INITIAL_EVENING_ROUTINES: RoutineItem[] = [
  { id: 'e1', title: 'Bildschirme ausschalten', value: 'AB 20:00', icon: 'Moon', completed: false, color: 'text-yellow-400' },
];

export const INITIAL_DAILY_TASKS: RoutineItem[] = [
  { id: 'd1', title: 'Wasser trinken', value: '2 LITER', icon: 'Droplets', completed: false, color: 'text-yellow-400' },
  { id: 'd2', title: 'Bewegen', value: '10.000 SCHRITTE', icon: 'Footprints', completed: false, color: 'text-yellow-400' },
];

export const INITIAL_SUPPLEMENTS: Supplement[] = [
  { id: 's1', name: 'Vitamin D3+K2', time: 'Nach dem Frühstück', icon: 'Pill', color: 'text-yellow-400', completed: false },
  { id: 's2', name: 'Omega 3', time: 'Nach dem Frühstück', icon: 'Pill', color: 'text-yellow-400', completed: false },
  { id: 's3', name: 'Magnesium Citrat', time: 'Nach dem Frühstück', icon: 'Pill', color: 'text-yellow-400', completed: false },
  { id: 's4', name: 'Magnesiumbisglycinat', time: 'Abends', icon: 'Pill', color: 'text-yellow-400', completed: false },
];

export const SHOPPING_LIST_CATEGORIES = [
  {
    category: 'Fleisch',
    items: [
      { id: 'm1', name: 'Hähnchenbrust' },
      { id: 'm2', name: 'Putenbrust' },
      { id: 'm3', name: 'Hirschgulasch' },
      { id: 'm4', name: 'Rinderleber (Weiderind)' },
      { id: 'm5', name: 'Rindfleisch (Leber)' },
      { id: 'm6', name: 'Rinderfilet' },
      { id: 'm7', name: 'Schweinefilet' },
      { id: 'm8', name: 'Schweinemedaillons' },
      { id: 'm9', name: 'Lammfleisch' },
      { id: 'm10', name: 'Rindergulasch' },
      { id: 'm11', name: 'Entenbrust mit Haut' },
      { id: 'm12', name: 'Rinderhackfleisch' },
      { id: 'm13', name: 'Ribeye Steak' },
      { id: 'm14', name: 'Hähnchen' },
      { id: 'm15', name: 'Rinderleber' },
    ]
  },
  {
    category: 'Käse',
    items: [
      { id: 'c1', name: 'Parmesan' },
      { id: 'c2', name: 'Alter Gouda' },
      { id: 'c3', name: 'Harzer Käse' },
      { id: 'c4', name: 'Emmentaler' },
      { id: 'c5', name: 'Tilsiter' },
      { id: 'c6', name: 'Mozzarella (Vollfett)' },
      { id: 'c7', name: 'Brie' },
      { id: 'c8', name: 'Camembert' },
      { id: 'c9', name: 'Bergkäse' },
    ]
  },
  {
    category: 'Gemüse',
    items: [
      { id: 'v1', name: 'Brennnessel' },
      { id: 'v2', name: 'Grünkohl' },
      { id: 'v3', name: 'Rosenkohl' },
      { id: 'v4', name: 'Brokkoli' },
      { id: 'v5', name: 'Rucola' },
      { id: 'v6', name: 'Blumenkohl' },
      { id: 'v7', name: 'Avocado' },
      { id: 'v8', name: 'Beeren (zB. Himbeeren)' },
      { id: 'v11', name: 'Wild Heidelbeeren' },
      { id: 'v12', name: 'Ingwer' },
      { id: 'v9', name: 'Fenchel' },
      { id: 'v10', name: 'Grüne Oliven' },
      { id: 'v13', name: 'Karotten' },
      { id: 'v14', name: 'Gurke' },
      { id: 'v15', name: 'Sauerkraut' },
      { id: 'v16', name: 'Zucchini' },
    ]
  },
  {
    category: 'Getreide-Alternativen',
    items: [
      { id: 'g1', name: 'Kürbiskerne' },
      { id: 'g2', name: 'Mandelmus' },
      { id: 'g3', name: 'Leinsamenmehl' },
      { id: 'g4', name: 'Chiasamen' },
      { id: 'g5', name: 'Flohsamenschalen' },
    ]
  },
  {
    category: 'Milchprodukte',
    items: [
      { id: 'd1', name: 'Eier (insb. Eigelb)' },
      { id: 'd2', name: 'Ziegenmilch-Joghurt natur' },
      { id: 'd10', name: 'Griechischer Joghurt' },
      { id: 'd3', name: 'Buttermilch natur' },
      { id: 'd4', name: 'Schmand 24%' },
      { id: 'd5', name: 'Saure Sahne 20%' },
      { id: 'd6', name: 'Schlagsahne (30% Fett)' },
      { id: 'd7', name: 'Creme fraîche' },
      { id: 'd8', name: 'Mascarpone' },
      { id: 'd9', name: 'Weidebutter' },
      { id: 'd11', name: 'Eier' },
    ]
  },
  {
    category: 'Nüsse & Samen',
    items: [
      { id: 'n1', name: 'Hanfsamen geschält' },
      { id: 'n2', name: 'Kürbiskerne' },
      { id: 'n3', name: 'Sonnenblumenkerne' },
      { id: 'n4', name: 'Walnüsse' },
      { id: 'n5', name: 'Haselnüsse' },
      { id: 'n6', name: 'Macadamia-Nüsse' },
    ]
  },
  {
    category: 'Fisch',
    items: [
      { id: 'f1', name: 'Lachs (wild)' },
      { id: 'f2', name: 'Sardinen in Olivenöl' },
      { id: 'f3', name: 'Miesmuscheln' },
      { id: 'f4', name: 'Hering' },
      { id: 'f5', name: 'Garnelen' },
      { id: 'f6', name: 'Makrele' },
      { id: 'f7', name: 'Forelle (ganz)' },
      { id: 'f8', name: 'Hering in Tomatensauce (zuckerfrei)' },
      { id: 'f9', name: 'Sardinen' },
      { id: 'f10', name: 'Wildlachs' },
    ]
  },
  {
    category: 'Getränke',
    items: [
      { id: 'b1', name: 'Knochenbrühe selbstgemacht' },
      { id: 'b2', name: 'Kefir natur' },
      { id: 'b3', name: 'Kaffee mit Butter (Bulletproof Coffee)' },
      { id: 'b4', name: 'Mineralwasser mit Apfelessig' },
      { id: 'b5', name: 'Grüner Tee kalt aufgegossen' },
      { id: 'b6', name: 'Süßungsmittel: Monk Fruit, Erythrit oder Stevia (flüssig)' },
      { id: 'b7', name: 'Knochenbrühe' },
    ]
  },
  {
    category: 'Fette & Öle',
    items: [
      { id: 'o1', name: 'Ghee / Butterschmalz' },
      { id: 'o2', name: 'Olivenöl' },
      { id: 'o3', name: 'Kokosöl' },
    ]
  },
  {
    category: 'Gewürze & Basics',
    items: [
      { id: 'sp1', name: 'Meersalz' },
    ]
  },
  {
    category: 'Supplemente',
    items: [
      { id: 'supp1', name: 'Creapure', url: 'https://droptime.de/preisvergleich/creapure' },
      { id: 'supp2', name: 'Vitamin D3+K2', url: 'https://nature-heart.de/products/vitamin-d3-k2-tropfen?currency=EUR&variant=44779060494604&utm_source=google&utm_medium=cpc&utm_campaign=Google%20Shopping&stkn=ff71406f5d4f&utm_source=google&utm_medium=cpc&klar_source=google&klar_cpid=22656206045&klar_adid=757262971886&gad_source=1&gad_campaignid=22656206045&gbraid=0AAAAA-EDcThhEcs2y_fW3IaWq-RoAN6rx&gclid=CjwKCAiAwNDMBhBfEiwAd7ti1OHsyv6z9eWFH0pvjhJQFMlk5Kq_-N_Nt4GqIObq6QZEkXdGtWtDnBoCYH4QAvD_BwE' },
      { id: 'supp3', name: 'Omega 3', url: 'http://amazon.de/Omega-3-Vegan-FORTE-60-Kapseln/dp/B0C2J9Y9LM/ref=sr_1_2_sspa?__mk_de_DE=ÅMÅŽÕÑ&crid=CHYBBDDGAY0D&dib=eyJ2IjoiMSJ9.XCbY7_F7qW0PovHP86eAwt46Ag3sZ6-0Srnh8EW8FKEv-DIiIi20sA3Ru4sFxLOk4Qt-bL2AWRtBXxzw_JQKUBK7repULButcLNYJAYWFrOB4WEG_7Cuxgy7ru-tA4S1tWT-O2KlJ3WESwX48ikQrWOfIAzPQvlQBjNCtIPDnfCS4OhbIvpKNmhlD6XU6RswbFtMfLRIsANaVFPgsPhuvhi3weQQds_CqxXFz-TIEvJk0rMMcC2wPoeFZFagzwqYWIJaol6g3nZMk4LXHhPUSYYH0zZ6Tj1rIL0sfvS6txc.YhLMGNQOifnj6fHhhqhbQ3AatKsSFbgwqxBCz9u-rTE&dib_tag=se&keywords=omega+3&qid=1771322874&sprefix=omega+3%2Caps%2C132&sr=8-2-spons&aref=MdnoKpmF27&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1' },
      { id: 'supp4', name: 'Magnesiumbisglycinat', url: 'https://www.esn.com/products/esn-magnesium-caps-120-kaps?variant=54281630482700' },
      { id: 'supp5', name: 'Magnesium Citrat', url: 'https://nature-heart.de/products/magnesium-citrat?_pos=1&_psq=citra&_ss=e&_v=1.0' },
    ]
  }
];
