export interface ProductApplication {
  name: string;
  description?: string;
  image?: string;
}

export interface ProductVariant {
  name: string;
  description: string;
  image?: string;
  uses?: string[];
}

export interface ProductFamily {
  name: string;
  slug: string;
  label: string;
  image: string;
  summary: string;
  detail: string[];
  variants?: ProductVariant[];
  applications: ProductApplication[];
}

export interface Project {
  name: string;
  slug: string;
  location: string;
  type: string;
  legacyHits: number;
  images: string[];
}

export interface RegionalOpportunity {
  country: string;
  oldSiteCount: number;
  items: string[];
}

export const productFamilies: ProductFamily[] = [
  {
    name: 'PC Strand',
    slug: 'pc-strand',
    label: 'Pre-stressed concrete strand',
    image: '/world/products/pc-strand.webp',
    summary:
      'High-tensile seven-wire strand for pre-stressed concrete members, taking the tension while concrete takes compression.',
    detail: [
      'Pre-stressed concrete gains its strength by placing engineered stresses into the member before service loads arrive. High-strength concrete handles compression; high-tensile steel strand handles tension.',
      'High-tensile strands are stretched between abutments at the ends of long casting beds. Concrete is poured around the strands, bonds as it sets, then the strands are released to compress and arch the member with built-in load resistance.',
    ],
    variants: [
      {
        name: 'Pre-Stressed Concrete Strand',
        image: '/legacy/images/pcstrand/pc-strand.png',
        description:
          'The core PC strand product used in pre-stressed concrete, combining high-strength concrete in compression with steel strand in tension.',
      },
      {
        name: 'Pre-Stressed Galvanized Strand',
        image: '/legacy/images/galvanizedstrand/galvanized-strand.png',
        description:
          'A corrosion-resistant version of pre-stressed strand where individual wires are galvanized before stranding.',
        uses: ['Stay cable bridges', 'Egg shaped digester wastewater plants'],
      },
      {
        name: 'Unbonded Strand',
        image: '/legacy/images/pcstrand/unbonded-strand.png',
        description:
          'PC strand coated with corrosion-resistant grease and HDPE sheathing, used in pre-stressed steel structures, bridges, high-rise buildings, foundations and stay cable systems.',
        uses: ['Rail and road bridges', 'High-rise buildings', 'Stay cable bridges', 'Foundation columns'],
      },
    ],
    applications: [
      {
        name: 'Hollow Core Slabs',
        image: '/legacy/images/pcstrand/hollow-core-slabs.png',
        description:
          'Precast pre-stressed floor slabs with internal voids, widely used where fast assembly, lower self-weight and economical construction matter.',
      },
      {
        name: 'Pre-Stressed Concrete Plank',
        image: '/legacy/images/pcstrand/pre-stressed-concreate-planks.png',
        description:
          'Floor and roof deck systems that erect quickly, reduce on-site labour and span long open spaces with shallow structural depth.',
      },
      {
        name: 'Pre-Stressed Concrete Beams',
        image: '/legacy/images/pcstrand/pre-stressed-concrete-beams5.png',
        description:
          'Concrete beams kept in compression while tensile forces are carried by steel tendons, commonly used on highway bridges.',
      },
      {
        name: 'Post-Tensioned Buildings',
        image: '/legacy/images/stories/post-tensioned.png',
        description:
          'A cost-effective floor system adopted across Australia, Southeast Asia, the Middle East and South Asia for commercial, industrial and institutional buildings.',
      },
      {
        name: 'In Situ Flat Slab',
        image: '/legacy/images/pcstrand/in-situ-flat-slab.png',
        description:
          'Economical slab systems for suitable column grids, viable beyond 6.0 m spans and increasingly efficient as live loads rise.',
      },
      {
        name: 'Precast Girders',
        image: '/legacy/images/pcstrand/precast-girders.png',
        description:
          'Economical for spans up to about 40 m where site access allows mobile cranes and night-time launching work.',
      },
      {
        name: 'Insitu Construction',
        image: '/legacy/images/pcstrand/insitu-construction.png',
        description:
          'A practical method for shorter elevated viaduct stretches when limited precast mould reuse makes precast uneconomical.',
      },
      {
        name: 'Span By Precast Segmental',
        image: '/legacy/images/pcstrand/span-by-prescast-segmental.png',
        description:
          'Used for moderately large bridge spans where launching trusses can lift delivered precast segments along the alignment.',
      },
      {
        name: 'Balanced Cantilever Precast Segmental',
        image: '/legacy/images/pcstrand/balanced-cantilever-precast-segmental.png',
        description:
          'Suitable where segments can be delivered from rear erected spans or below the span and erected from multiple construction fronts.',
      },
      {
        name: 'Egg Shaped Digesters',
        image: '/legacy/images/stories/egg-shaped-digesters.png',
        description:
          'Wastewater treatment digesters with post-tensioned walls in longitudinal and circumferential directions.',
      },
      {
        name: 'Stay Cable Bridges',
        image: '/legacy/images/pcstrand/stay-cable-bridge1.png',
        description:
          'HDPE PC strand and unbonded strand applications for bridge stay cable construction.',
      },
    ],
  },
  {
    name: 'PC Wire',
    slug: 'pc-wire',
    label: 'High-tensile wire',
    image: '/world/products/pc-wire.webp',
    summary:
      'High-tensile wire for pre-stressing concrete products and repeatable precast production.',
    detail: [
      'PC wire is used in pre-stressing concrete for residential flooring and precast concrete products including pipes, railway sleepers, PC piles, posts and ground anchors.',
    ],
    applications: [
      {
        name: 'Pre-Stressed Concrete Spun Poles',
        image: '/legacy/images/pcwire/prestressed-concrete-spun-poles.png',
      },
      {
        name: 'Pre-Stressed Concrete Square Piles',
        image: '/legacy/images/pcwire/prestressed-concrete-square-piles.png',
      },
      {
        name: 'Concrete Railway Sleepers',
        image: '/legacy/images/pcwire/railway-sleepers.png',
      },
    ],
  },
  {
    name: 'PC Bar',
    slug: 'pc-bar',
    label: 'Reinforcement bar',
    image: '/world/products/pc-bar.webp',
    summary:
      'Spiral-grooved bar developed as main reinforcement for PC poles and spun piles.',
    detail: [
      'PC bars are developed as the main reinforcement for PC poles and spun piles. The chemical composition is suitable for spot welding.',
      'The bar is drawn into spiral grooves, then high-frequency quenched and tempered to achieve mechanical properties in accordance with JIS G3137.',
    ],
    applications: [
      {
        name: 'Pre-Stressed Concrete Spun Pole',
        image: '/legacy/images/pcbar/prestressedcsp.png',
      },
      {
        name: 'Pre-Stressed Concrete Spun Pile',
        image: '/legacy/images/pcbar/prestressed-concrete-spun-piles.png',
      },
    ],
  },
  {
    name: 'Galvanized Strand & Wire',
    slug: 'galvanized-strand-wire',
    label: 'Zinc-protected steel',
    image: '/world/products/galvanised.webp',
    summary:
      'Galvanized wires and strands with zinc protection for exposed environments and conductor systems.',
    detail: [
      'Galvanizing applies a protective zinc barrier between steel and the environment, offering cathodic protection.',
      'Coating weight and thickness are chosen by expected service life, exposure environment and cost.',
      'Galvanized wires are commonly used for chain link fencing, gabion boxes, barbed wire and cable applications.',
    ],
    variants: [
      {
        name: 'Hot Dipped Heavy Galvanized Wire',
        image: '/legacy/images/galvanizedstrand/galvanized-wires.png',
        description: 'Heavy zinc-coated wire for demanding exposure conditions.',
      },
      {
        name: 'Hot Dipped Medium Galvanized Wire',
        description: 'Medium zinc-coated wire for general industrial use.',
      },
      {
        name: 'Hot Dipped Standard Galvanized Wire',
        description: 'Standard galvanized wire for everyday protected-wire applications.',
      },
      {
        name: 'Electro Galvanized Wire',
        description: 'Electro-galvanized wire for controlled coating and finish requirements.',
      },
      {
        name: 'Galfan Wire',
        description: 'Galfan-coated wire for enhanced corrosion resistance.',
      },
      {
        name: 'Galvanized Steel Core Strand for ACSR',
        image: '/legacy/images/galvanizedstrand/galvanizedstrand.png',
        description:
          'Steel core strand used with aluminium in Aluminium Conductor Steel Reinforced overhead conductors.',
      },
      {
        name: 'Galvanized Steel Stay Strand',
        description: 'Stay wire strand for overhead and structural support applications.',
      },
      {
        name: 'Integral Bearer Cable Strand',
        description: 'Galvanized strand for integral bearer cable systems.',
      },
      {
        name: 'Optical Fiber Strand',
        description: 'Galvanized steel strand for optical fiber support applications.',
      },
    ],
    applications: [
      {
        name: 'Low Voltage Armoured Cable',
        image: '/legacy/images/galvanizedstrand/galvanized-wires2.png',
      },
      {
        name: 'XLPE Cable',
        image: '/legacy/images/galvanizedstrand/galvanized-wires3.png',
      },
      {
        name: 'Chain Link Fencing & Barbed Wire',
        image: '/legacy/images/galvanizedstrand/galvanized-wires4.png',
      },
      {
        name: 'Gabion Boxes',
        image: '/legacy/images/galvanizedstrand/gabion1.png',
      },
    ],
  },
  {
    name: 'Other Wires',
    slug: 'other-wires',
    label: 'Industrial drawn wires',
    image: '/world/products/other-wires.webp',
    summary:
      'A supporting range of drawn wire products for industrial and manufacturing requirements.',
    detail: [
      'Beyond pre-stressing applications, Wire & Wire supplies a wider range of drawn wire products for industrial use.',
    ],
    applications: [
      { name: 'Low Carbon Steel Wire' },
      { name: 'PVC-Coated Colour Steel Wires' },
      { name: 'PVC-Coated Galvanized Iron Wire' },
      { name: 'Carbon Steel Wire For Cold Heading & Forging (CHQ)' },
      { name: 'CO2 MIG Welding Wire' },
      { name: 'Multi Use Wires' },
    ],
  },
];

export const companyProfile = {
  overview: [
    'Wire & Wire Products (M) Sdn. Bhd. places its ultimate emphasis on customer satisfaction, with consultancy services that extend beyond product supply.',
    'A dedicated sales team studies the market and makes projections valued by customers, while a senior management team brings over 100 years of combined experience in distribution, trading, logistics and services.',
    'Volume purchasing supports competitive pricing and freight, while industry knowledge helps secure consistent supply of prime quality products.',
  ],
  mission: [
    'To provide superior service to our customer',
    'To ensure quality and reliability of our products',
    'To uphold our trustworthiness and credibility',
  ],
  vision:
    'To emerge as one of the largest trading and distribution companies in the world, with strategically located regional offices worldwide.',
  recognition:
    'Wire & Wire Products has gained global recognition in the steel wire industry for exceptional service and uncompromising quality control, with products reaching Australasia, Asia, the Middle East, Europe, Africa and the Americas.',
  values: [
    'Customer Satisfaction',
    'Continuous Progression',
    'Strong Teamwork',
    'Trust & Credibility',
    'Excellent Growth',
    'International Vision',
  ],
  team:
    'Wire & Wire Products (M) Sdn Bhd began in 2001 in a small suburban town in Kuala Lumpur. Through passion and perseverance, the company grew into one of the region\'s notable steel wire suppliers, supported by a dedicated team focused on customer needs and superior material quality.',
  ceo: {
    name: "Dato' Anathkumar Alagu",
    title: 'Chief Executive Officer',
    paragraphs: [
      'Wire & Wire Products is the result of great passion and a will to succeed. We take great care in ensuring comfort to our clients and our services extend well beyond the sale of our products.',
      'My team and I are ever willing to go the extra mile, identify customer needs and provide after-sale support and services. I believe in a win-win situation, achieved when clients are satisfied and staff are motivated.',
      'It is a proud moment to reflect upon our achievements thus far, and an exciting moment to look toward the future.',
    ],
  },
  governance: {
    description:
      'The Directors of Wire & Wire are responsible for the corporate governance of the company, guiding and monitoring the business and affairs of Wire & Wire on behalf of members to whom they are accountable.',
    guidelines:
      'Corporate governance guidelines are intended to ensure that the company is effectively directed and managed, risks are identified, monitored and assessed, and appropriate disclosures are made.',
    items: ['Director responsibilities', 'Communications to shareholders', 'Board committees'],
  },
  directory: {
    foundingDate: '2001',
    registeredOffice: [
      'No. 62-1, Jalan Metro Perdana Barat 3',
      'Taman Usahawan Kepong',
      'Kepong Utara 52100',
      'Kuala Lumpur, Malaysia',
    ],
    correspondenceOffice: [
      'A1-3A-1, Arcoris Business Suites',
      'Jalan Kiara, Mont Kiara',
      '50480 Kuala Lumpur, Malaysia',
    ],
    underReview: [
      'Market Segment',
      'Fiscal Year-End',
      'Accounting Standards',
      'Total Capital Stock & Quantity of Stock',
      'Management',
      'Shareholding Structure',
      'Applicant Body',
      'Deutsche Borse Listing Partner',
      'Designated Sponsor',
      'Specialist',
      'Publication date of Financial Statements',
      'Publication of Interim Report',
      'Expected Date of next AGM',
    ],
    partners: [
      {
        role: 'Auditors',
        name: 'Crowe Horwath (AF1018)',
        address: ['Level 16, Tower C, Magen Avenue II', '12 Jalan Yap Kwan Seng, 50450 Kuala Lumpur', 'Malaysia'],
      },
      {
        role: 'Solicitors',
        name: 'Cheah Teh & SU',
        address: ['L-3-1, No.2, Jalan Solaris, Solaris Mont Kiara', '50480 Kuala Lumpur, Malaysia'],
      },
      {
        role: 'Principal Bankers',
        name: 'AmBANK (M) Berhad',
        address: ['No. 24 Jalan USJ10/1 USJ', 'Taipan Triangle 47620 UEP Subang Jaya', 'Selangor, Malaysia'],
      },
      {
        role: 'Principal Bankers',
        name: 'United Overseas Bank (Malaysia) Berhad',
        address: ['No. 2108, Jalan Meru', '41050 Klang, Selangor Darul Ehsan, Malaysia'],
      },
      {
        role: 'Principal Bankers',
        name: 'RHB Bank Berhad',
        address: ['47 & 49, Jalan USJ 10/1', 'UEP Subang Jaya, 47620 Petaling Jaya', 'Selangor Darul Ehsan, Malaysia'],
      },
    ],
  },
  csr: [
    {
      title: 'Sin Chew Foundation donation',
      image: '/legacy/images/csr/csr6.png',
      text: 'Cash donation to the Sin Chew Foundation to help victims of the 2008 Sichuan earthquake in China.',
    },
    {
      title: 'ATMAH Foundation support',
      image: '/legacy/images/csr/csr3.png',
      text: 'Contributions to the Association to Mobilize All Humanity to support underprivileged children with education and wellbeing.',
    },
    {
      title: 'Melvin Jones Humanitarian Award',
      image: '/legacy/images/csr/csr4.png',
      text: "Dato' Anathkumar was awarded the Melvin Jones Humanitarian Award by Lions Club International Foundation.",
    },
    {
      title: 'Feed The Needy Programme',
      image: '/legacy/images/csr/csr5.png',
      text: 'Organizers and sponsors of a daily programme for the blind, homeless and anyone in need.',
    },
    {
      title: 'Sight conservation',
      image: '/legacy/images/csr/csr1.png',
      text: 'Annual contribution to Lions Club Bukit Kiara for cataract operations for underprivileged elderly people.',
    },
    {
      title: "Children's Carnival Talent",
      image: '/legacy/images/csr/csr7.png',
      text: 'Annual charity event for over 200 primary school students from impoverished backgrounds and broken homes.',
    },
    {
      title: 'Home refurbishment',
      image: '/legacy/images/stories/1.jpg',
      text: 'Painting and refurbishment of a dilapidated home for two boys suffering from Krabbe disease.',
    },
    {
      title: 'WWP Ponggal Carnival 2017',
      image: '/legacy/images/stories/4.jpg',
      text: 'Annual charity event in India attended by 996 school children from impoverished villages, with meals, uniforms, school bags, shoes and stationery.',
    },
  ],
};

export const regionalPresence = {
  headquarters: 'Kuala Lumpur, Malaysia',
  regionalOffices: ['Vietnam', 'Cambodia', 'Indonesia', 'Philippines', 'India'],
  upcomingOffices: ['China', 'Australia', 'United Kingdom', 'Middle East', 'Singapore'],
};

export const projects: Project[] = [
  {
    name: 'Fontana Towers, Bahrain',
    slug: 'fontana-towers',
    location: 'Bahrain',
    type: 'Tower',
    legacyHits: 16433,
    images: ['/legacy/images/projects/project-fontana-towers.png'],
  },
  {
    name: 'KSL City Mall, Johor Bahru',
    slug: 'ksl-city-mall-johor-bahru',
    location: 'Johor Bahru, Malaysia',
    type: 'Commercial mall',
    legacyHits: 18753,
    images: ['/legacy/images/projects/ksl_city_mall_johor_bahru.png'],
  },
  {
    name: 'Southern Express Highway from Colombo to Galle',
    slug: 'southern-express-highway',
    location: 'Sri Lanka',
    type: 'Expressway',
    legacyHits: 14037,
    images: ['/legacy/images/projects/southern-express-highway.png'],
  },
  {
    name: 'Lebuh Raya Kemuning Shah Alam',
    slug: 'lebuh-raya-kemuning-shah-alam',
    location: 'Shah Alam, Malaysia',
    type: 'Highway',
    legacyHits: 13948,
    images: ['/legacy/images/projects/labuh-raya.png'],
  },
  {
    name: 'Al-Reem Island, Abu Dhabi',
    slug: 'al-reem-island',
    location: 'Abu Dhabi, UAE',
    type: 'Island development',
    legacyHits: 13958,
    images: ['/legacy/images/projects/project-al-reem-island.png'],
  },
  {
    name: 'Kuala Lumpur - Putrajaya Elevated Highway',
    slug: 'kuala-lumpur-putrajaya-elevated-highway',
    location: 'Malaysia',
    type: 'Elevated highway',
    legacyHits: 14317,
    images: [
      '/legacy/images/projects/elevated-highway.png',
      '/legacy/images/projects/project-kuala-lumpur-purajaya-elevated-highway-01.png',
    ],
  },
  {
    name: 'Binjai Condominium, Kuala Lumpur',
    slug: 'binjai-condominium',
    location: 'Kuala Lumpur, Malaysia',
    type: 'Residential tower',
    legacyHits: 13968,
    images: [
      '/legacy/images/projects/project-binjai-condominium-1.png',
      '/legacy/images/projects/project-binjai-condominium-2.png',
      '/legacy/images/projects/project-binjai-condominium-3.png',
    ],
  },
  {
    name: 'Covasuites, Kota Damansara',
    slug: 'covasuites-kota-damansara',
    location: 'Kota Damansara, Malaysia',
    type: 'Residential development',
    legacyHits: 13523,
    images: ['/legacy/images/projects/covasuites_kota_damansara.png'],
  },
  {
    name: 'Boon Lay MRT Extension',
    slug: 'boon-lay-mrt-extension',
    location: 'Singapore',
    type: 'MRT extension',
    legacyHits: 15757,
    images: ['/legacy/images/projects/boon-lay.png'],
  },
  {
    name: 'Ethylene Cracker Complex for Shell',
    slug: 'ethylene-cracker-complex-for-shell',
    location: 'Singapore',
    type: 'Industrial complex',
    legacyHits: 13342,
    images: ['/legacy/images/projects/ethylene-cracker.png'],
  },
  {
    name: 'Braddell Road Interchange',
    slug: 'braddell-road-interchange',
    location: 'Singapore',
    type: 'Road interchange',
    legacyHits: 13384,
    images: ['/legacy/images/projects/braddell-road.png'],
  },
  {
    name: 'Fusionopolis',
    slug: 'fusionopolis',
    location: 'Singapore',
    type: 'Research and business hub',
    legacyHits: 12169,
    images: ['/legacy/images/projects/fusionopolis.png'],
  },
  {
    name: 'HDB Centre at Toa Payoh',
    slug: 'hdb-centre-at-toa-payoh',
    location: 'Singapore',
    type: 'Civic/commercial building',
    legacyHits: 13458,
    images: ['/legacy/images/projects/hdb-centre.png'],
  },
  {
    name: 'Jurong Sewage Treatment Works',
    slug: 'jurong-sewage-treatment-works',
    location: 'Singapore',
    type: 'Utilities infrastructure',
    legacyHits: 12810,
    images: ['/legacy/images/projects/jurong-sewage.png'],
  },
  {
    name: 'Marina Bayfront Vehicular Bridge',
    slug: 'marina-bayfront-vehicular-bridge',
    location: 'Singapore',
    type: 'Vehicular bridge',
    legacyHits: 11864,
    images: ['/legacy/images/projects/marina-bayfront.png'],
  },
  {
    name: 'NTU Alumni',
    slug: 'ntu-alumni',
    location: 'Singapore',
    type: 'Institutional building',
    legacyHits: 12531,
    images: ['/legacy/images/projects/ntu-alumni.png'],
  },
  {
    name: "Singapore Commodity Hub - South East Asia's biggest logistics hub",
    slug: 'singapore-commodity-hub',
    location: 'Singapore',
    type: 'Logistics hub',
    legacyHits: 12513,
    images: ['/legacy/images/projects/singapore-commodity-hub.png'],
  },
  {
    name: 'Kuningan City',
    slug: 'kuningan-city',
    location: 'Jakarta, Indonesia',
    type: 'Mixed-use development',
    legacyHits: 12137,
    images: ['/legacy/images/projects/kuningancity.png', '/legacy/images/projects/kuningan-city.png'],
  },
  {
    name: 'Antasari-Blok M Non Toll Project DKI',
    slug: 'antasari-blok-m-non-toll-project-dki',
    location: 'Jakarta, Indonesia',
    type: 'Urban road project',
    legacyHits: 12366,
    images: ['/legacy/images/projects/antasari_blok_m_non_toll_project_dki_the_maket.png'],
  },
  {
    name: 'Kampung Melayu Casablanca Non Toll Project DKI',
    slug: 'kampung-melayu-casablanca-non-toll-project-dki',
    location: 'Jakarta, Indonesia',
    type: 'Urban road project',
    legacyHits: 14093,
    images: ['/legacy/images/projects/kampung_melayu_casablanca_non_toll_projectdki.png'],
  },
  {
    name: 'New Pantai Expressway',
    slug: 'new-pantai-expressway',
    location: 'Malaysia',
    type: 'Expressway',
    legacyHits: 12780,
    images: ['/legacy/images/projects/project_new_pantai_expressway.png', '/legacy/images/projects/project_new_pantai_expressway2.png'],
  },
  {
    name: 'Prince Court Hospital, Kuala Lumpur',
    slug: 'prince-court-hospital-kuala-lumpur',
    location: 'Kuala Lumpur, Malaysia',
    type: 'Hospital',
    legacyHits: 13229,
    images: ['/legacy/images/projects/prince-court-hospital-1.png'],
  },
  {
    name: 'Kuala Lumpur Convention Centre',
    slug: 'kuala-lumpur-convention-centre',
    location: 'Kuala Lumpur, Malaysia',
    type: 'Convention centre',
    legacyHits: 11972,
    images: ['/legacy/images/projects/kuala-lumpur-convension-centre-1.png'],
  },
];

export const regionalOpportunities: RegionalOpportunity[] = [
  {
    country: 'Malaysia',
    oldSiteCount: 12,
    items: [
      'Seven Bidders for Kinrara - Damansara highway',
      'SUKE Highway - Sungai Besi - Ulu Kelang Elevated Expressway',
      'Damansara Shah Alam Highway (DASH)',
      'BESRAYA Highway Extension',
      'Widening of Central Spine Federal Road',
      'Budget Announcement on 6 Highway Projects in 10th Malaysian Plan',
      'West Coast highway project to start soon',
      'Malaysia to sign MoU to build RM 6.6b bridge with Bangladesh',
      'Iskandar Malaysia to see RM 73.3 billion in investment by 2016',
      'LRT Extension (Ampang Line and Kelana Jaya Line)',
      'MRT Project',
      "MRT system aims to boost Klang Valley's public transportation",
    ],
  },
  {
    country: 'Indonesia',
    oldSiteCount: 12,
    items: [
      'South Banten Airport, Pandeglang, Banten',
      'South Banten Airport will be completed for Next 32 Months',
      'Foreign Investors Start to Engage in Airport Business',
      'Medan-Kuala Namu Toll Road Project for Rebidding',
      'Bappenas Hopes to Push More Infrastructure Deals',
      'Construction of Medan - Kuala Namu Toll Road to be tendered in July',
      'Govt to build Medan-Binjai road',
      'Government Supports Six Toll Road Projects with Rp 12.5 Trillion of Funds',
      'Jalan Layang non Tol Kp Melayu - Tanah Abang',
      'Jalan Tol Semarang - Bawen',
      'Kalimantan to develop coal railway in 2013',
      "Ground-breaking of Kalimantan's coal transport railway to be in June",
    ],
  },
  {
    country: 'Philippines',
    oldSiteCount: 4,
    items: [
      "BOHOL-CEBU Multi Access Friendship Bridge - Super bridge gains support",
      'Bohol-Cebu bridge proposal endorsement urged',
      'Aumentado asks DPWH: Endorse Bohol-Cebu bridge',
      'Bridge spanning 17 km. to link Cebu and Bohol',
    ],
  },
  {
    country: 'Vietnam',
    oldSiteCount: 4,
    items: [
      'Hanoi PC to decide investment plan for Tu Lien Bridge',
      'Four new bridges to be built in Hanoi',
      'Ho Chi Minh City Metro, Vietnam',
      'Light Rail And Metro In Vietnam',
    ],
  },
  {
    country: 'Bangladesh',
    oldSiteCount: 1,
    items: ['Malaysian Expertise to build bridge in Bangladesh'],
  },
  {
    country: 'Sri Lanka',
    oldSiteCount: 1,
    items: ['Ongoing & proposed Expressways in Sri Lanka'],
  },
  {
    country: 'India',
    oldSiteCount: 3,
    items: [
      'Minister: India offers huge opportunities for Malaysia',
      'IJM shortlisted for India highway project',
      'Local firms set to pounce on India highway projects',
    ],
  },
  {
    country: 'Saudi Arabia',
    oldSiteCount: 5,
    items: [
      'Saudi Arabia starts Mecca mosque expansion',
      'Haramain High Speed Rail Project, Saudi Arabia',
      'Saudi Arabia set to award final phase of Al Haramain rail project',
      'Al Haramain High Speed Rail - Construction Start',
      'Saudi rail chief says Haramain project on schedule',
    ],
  },
  {
    country: 'United Arab Emirates',
    oldSiteCount: 4,
    items: [
      'Etihad Rail, United Arab Emirates',
      'Partnership to develop Emirates rail projects',
      'New Abu Dhabi Development Projects Approved - January 2012',
      'Abu Dhabi-Dubai commute to be easier',
    ],
  },
  {
    country: 'Australia',
    oldSiteCount: 18,
    items: [
      'East Coast Australia High Speed Rail Upgrade',
      'BHP gets nod for Olympic Dam expansion',
      "BHP's already eye-watering Olympic Dam expansion bulked up again",
      'Olympic Dam will start economic boom: BIS',
      "Oakajee Port & Rail - Oakajee 'critical' to mine potential",
      'Murchison Metals ends Oakajee Port & Rail involvement with sale to Mitsubishi completed',
      'Oakajee Port & Rail, Western Australia',
      'Victoria Regional Rail Link contract awarded',
      'Anketell Port Strategic Industrial Area',
      'WA starts procuring land for Anketell Port',
      'Wheatstone LNG project to make Australia second largest global producer',
      'Wheatstone LNG project sends steel pipe contract offshore',
      'Wheatstone LNG Project Well Underway, Looks to Dispose Remaining Volumes - Chevron',
      'Chevron launches major gas project in Australia',
      "Ichthys LNG Terminal - Darwin's $34bn Ichthys LNG project opens",
      "Gas the next fuel to fire Australia's boom",
      "Australia's LNG boom fizzles as costs, competition bite",
      'Australia Pacific LNG - Wah Seong gets Aussie pipe-coating deal',
    ],
  },
  {
    country: 'Singapore',
    oldSiteCount: 8,
    items: [
      'Singapore LNG Secondary Berth Project - Press Releases',
      'Singapore extends Next Gen Broadband to commercial buildings',
      'Jurong 88 MW NG Cogeneration Plant - Alstom Wins Contract To Build Gas-Fired Cogen Plant For Sembcorp',
      'SINGAPORE: PowerSeraya inaugurates new 800MW co-generation combined cycle plant',
      'Singapore Generator adds Co generation to Power plant',
      'Singapore East West Line Tuas West Extension - Tuas West Extension construction underway',
      'Alstom to supply Singapore East West Metro Line Extension',
      'Alstom to supply the trackwork for extension of East-West metro line Singapore',
    ],
  },
  {
    country: 'Thailand',
    oldSiteCount: 8,
    items: [
      'AOT pushed forward the Suvarnabhumi Airport Expansion Project (Phase II) with a budget of over 62.5 billion Baht',
      'Suvarnabhumi expansion advances',
      'Suvarnabhumi Airport expansion to finish a year early',
      'Suvarnabhumi airport to undergo $1.9bn expansion',
      'Nong Saeng Natural Gas power Project',
      'Natural Gas Power Plant for Thailand',
      'High Speed Train Line from Bangkok to Chiang Mai is a priority',
      'High-speed train project bidding set for next year',
    ],
  },
  {
    country: 'Cambodia',
    oldSiteCount: 13,
    items: [
      "Road No. 48 (Koh Kong - Sre Ambel) - Thaksin Shinawatra's reported investment in Koh Kong has led to a land-grab",
      'Neak Loeung Bridge - Cambodia builds bridge to link ASEAN highway',
      'The Construction of Neak Loeung Bridge Launched',
      'Construction on 4th Cambodia-China Friendship Bridge begins in Cambodia',
      'Cambodia launches construction of Prek Kdam Bridge over Tonle sap River',
      'The Cambodian Railway Tracker - GMS Rehabilitation of the Railway in Cambodia',
      'Cambodian railway to be revived by 2013',
      "China to help restoration of Cambodia's National Road No. 62",
      'Cambodia holds ceremony for construction of national road No. 8',
      'Road No 57 (Battambang - Pailin) - China to continue helping Cambodia with infrastructure',
      'New Rail Link - from Phnom Penh to Loc Ninh',
      'Cambodia and Thailand to restore rail link',
      'China pledges to fund Loc Ninh-Phnom Penh Railway Project',
    ],
  },
];

export const investorRelations = {
  intro:
    'The investor information from the legacy site is intended only for professional investors able to evaluate and accept higher risks related to investment in shares issued by the company.',
  restrictions: [
    'It does not present an offer to sell or an invitation to buy or subscribe for shares.',
    'Visitors are responsible for observing applicable national laws and regulations.',
    'Information should not be reproduced, copied or transferred to another person.',
    'Professional investors are considered to have the experience, knowledge and expertise to make investment decisions and assess associated risks.',
  ],
  mifidCategories: [
    'Credit institutions',
    'Investment firms',
    'Other authorised or regulated financial institutions',
    'Insurance companies',
    'Collective investment schemes and their management companies',
    'Pension funds and their management companies',
    'Commodity and commodity derivative dealers',
    'Locals',
    'Other institutional investors',
    'Large undertakings meeting relevant balance sheet, turnover or own-funds thresholds',
    'National and regional governments, public bodies that manage public debt, central banks and supranational institutions',
    'Other institutional investors whose main activity is investment in financial instruments',
  ],
};

export const productFilmPlan = [
  {
    id: 'pc-strand',
    label: 'PC Strand',
    title: 'Seven wires, one strand.',
    focalPoint: 'a seven-wire PC strand cross-section and coil',
    subject:
      'a miniature tension-steel studio with a seven-wire PC strand uncoiling from a reel, its helical wires clearly visible, with small cutaway blocks showing concrete compression and steel tension',
  },
  {
    id: 'prestressing',
    label: 'Prestressing',
    title: 'Stress before the load.',
    focalPoint: 'the strand being stretched between abutments before concrete is poured',
    subject:
      'a long miniature casting bed with high-tensile strands stretched between abutments, fresh concrete forms around them, and a cutaway beam arching upward after release',
  },
  {
    id: 'pc-wire',
    label: 'PC Wire',
    title: 'Wire for repeatable precast.',
    focalPoint: 'a high-tensile wire spool feeding spun poles, square piles and railway sleepers',
    subject:
      'a compact precast yard where high-tensile PC wire feeds into molds for spun poles, square piles and concrete railway sleepers',
  },
  {
    id: 'pc-bar',
    label: 'PC Bar',
    title: 'Grooved, quenched, tempered.',
    focalPoint: 'spiral-grooved PC bars entering spun pile reinforcement cages',
    subject:
      'a miniature PC bar production bench with spiral-grooved steel bars, a quenching station, tempered bundles and reinforced spun pile cages',
  },
  {
    id: 'galvanized',
    label: 'Galvanized',
    title: 'Zinc against the weather.',
    focalPoint: 'zinc-coated wire and strand used for fencing, cable and gabion systems',
    subject:
      'a miniature galvanizing bay with bright zinc-coated wires, galvanized strand, chain link fencing, low-voltage armoured cable, barbed wire and gabion boxes',
  },
  {
    id: 'unbonded-other',
    label: 'Unbonded & Other',
    title: 'Protected for exposed spans.',
    focalPoint: 'HDPE-sheathed unbonded strand rising into a stay cable bridge',
    subject:
      'a final miniature bridge and industrial supply scene where HDPE-sheathed unbonded strand becomes stay cables while other wire spools wait for manufacturing use',
  },
];
