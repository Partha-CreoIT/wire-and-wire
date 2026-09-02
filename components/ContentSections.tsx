import { StatBand } from './StatBand';
import { Statement } from './Statement';
import styles from './ContentSections.module.css';

/**
 * The page content that follows the scroll film — every substantive block from
 * wireproducts.cc, recomposed for the new design system. Sits above the film's
 * fixed layers (see .wrap) so it slides over the held finale as you scroll on.
 *
 * Product imagery is optional: generate with the prompts in
 * assets-source/world/GENERATE.md (§ product shots), drop the files into
 * public/world/products/, then set PRODUCT_IMAGES = true.
 */
const PRODUCT_IMAGES = true;

const PRODUCTS: {
  name: string;
  text: string;
  img: string;
  chips?: string[];
}[] = [
  {
    name: 'PC Strand',
    img: 'pc-strand',
    text:
      'Pre-stressed concrete is an architectural and structural material ' +
      'possessing great strength: predetermined engineering stresses placed ' +
      'in members counteract the stresses that occur under service load — ' +
      'high-strength concrete taking compression, high-tensile steel strand ' +
      'taking tension.',
  },
  {
    name: 'PC Wire',
    img: 'pc-wire',
    text:
      'High-tensile wire used in pre-stressing concrete for flooring in ' +
      'residential housing and precast concrete products: concrete pipes, ' +
      'railway sleepers, PC piles and posts, ground anchors and more.',
  },
  {
    name: 'PC Bar',
    img: 'pc-bar',
    text:
      'Developed as the main reinforcement for manufacturing PC poles and ' +
      'spun piles. A chemical composition suited to spot welding, drawn in ' +
      'spiral grooves, then high-frequency quenched and tempered to the ' +
      'mechanical properties of JIS G3137.',
  },
  {
    name: 'Galvanised Strand & Wires',
    img: 'galvanised',
    text:
      'Galvanising applies a protective barrier of zinc between the steel ' +
      'and its environment — excellent cathodic protection. Coating weight ' +
      'is chosen for the life expectancy of the wire, the environment it ' +
      'will face, and cost.',
  },
  {
    name: 'Other Wires',
    img: 'other-wires',
    text:
      'Beyond pre-stressing, a full range of drawn wire products for ' +
      'industry and manufacturing.',
    chips: [
      'Low carbon steel wire',
      'PVC-coated colour steel wires',
      'PVC-coated galvanised iron wire',
      'CHQ cold heading & forging wire',
      'CO₂ MIG welding wire',
      'Multi-use wires',
    ],
  },
];

const MISSION = [
  'To provide superior service to our customer',
  'To ensure quality and reliability of our products',
  'To uphold our trustworthiness and credibility',
];

const VALUES = [
  'Customer Satisfaction',
  'Continuous Progression',
  'Strong Teamwork',
  'Trust & Credibility',
  'Excellent Growth',
  'International Vision',
];

const REGIONAL = ['Vietnam', 'Cambodia', 'Indonesia', 'Philippines', 'India'];
const UPCOMING = ['China', 'Australia', 'United Kingdom', 'Middle East', 'Singapore'];

const PROJECTS = [
  'Kuala Lumpur Convention Centre',
  'Marina Bayfront Vehicular Bridge',
  'Kuala Lumpur – Putrajaya Elevated Highway',
  'Al-Reem Island, Abu Dhabi',
  'Boon Lay MRT Extension',
  'Fusionopolis',
  'Southern Express Highway',
  'New Pantai Expressway',
  'Ethylene Cracker Complex for Shell',
  'Prince Court Hospital, Kuala Lumpur',
  'KSL City Mall, Johor Bahru',
  'Braddell Road Interchange',
  'HDB Centre at Toa Payoh',
  'Jurong Sewage Treatment Works',
  'Singapore Commodity Hub',
  'Lebuh Raya Kemuning, Shah Alam',
  'Fontana Towers',
  'Binjai Condominium',
  'Covasuites Kota Damansara',
  'Kuningan City',
  'NTU Alumni',
  'Antasari – Blok M Project, Jakarta',
  'Kampung Melayu – Casablanca Project, Jakarta',
];

export function ContentSections() {
  return (
    <div className={styles.wrap}>
      <StatBand
        stats={[
          { value: 23, label: 'Landmark projects' },
          { value: 100, suffix: '+', label: 'Years combined experience' },
          { value: 1860, suffix: ' MPa', label: 'Tensile grade' },
          { value: 5, label: 'Product lines' },
        ]}
      />

      <Statement
        theme="light"
        label="The company"
        title="Customer satisfaction, above everything."
        body="We place our ultimate emphasis on customer satisfaction — backed
              by consultancy our clients rely on, a sales team that reads the
              market, and a senior management team with over 100 years'
              combined experience in distribution, trading, logistics and
              services. Volume purchasing keeps pricing and freight
              competitive; sound industry knowledge keeps our supply of prime
              quality products consistent, always."
      />

      <section id="products" className="section--dark" data-theme="dark">
        <div className="layout">
          <div className={styles.sectionHead}>
            <p className="mono has-pin--top-left">What we make</p>
            <h2 className="h2">Five lines of tension steel.</h2>
          </div>
          <ol className={styles.products}>
            {PRODUCTS.map((p, i) => (
              <li key={p.name} className={styles.product}>
                {PRODUCT_IMAGES && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className={styles.productImg}
                    src={`/world/products/${p.img}.webp`}
                    alt={p.name}
                    loading="lazy"
                  />
                )}
                <span className={`mono-sm ${styles.productNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={`h5 ${styles.productName}`}>{p.name}</h3>
                <p className={`body-sm ${styles.productText}`}>{p.text}</p>
                {p.chips && (
                  <ul className={styles.chips}>
                    {p.chips.map((c) => (
                      <li key={c} className="mono-sm">
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section--light" data-theme="light">
        <div className="layout">
          <div className={styles.sectionHead}>
            <p className="mono has-pin--top-left">Principles</p>
            <h2 className="h2">Service, quality, credibility.</h2>
          </div>
          <div className={styles.threeCol}>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Our mission</h3>
              <ul className={styles.missionList}>
                {MISSION.map((m) => (
                  <li key={m} className="body-sm">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Our vision</h3>
              <p className={`h6 ${styles.vision}`}>
                To emerge as one of the largest trading and distribution
                companies in the world, with strategically located regional
                offices worldwide.
              </p>
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Recognition</h3>
              <p className="body-sm">
                Global recognition in the steel wire industry for exceptional
                service and uncompromising quality control, in strict adherence
                to international standards. Our products have reached
                Australasia, Asia, the Middle East, Europe, Africa and the
                Americas.
              </p>
            </div>
          </div>
          <ul className={styles.values}>
            {VALUES.map((v) => (
              <li key={v} className="mono-sm">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="global" className="section--dark" data-theme="dark">
        <div className="layout">
          <div className={styles.sectionHead}>
            <p className="mono has-pin--top-left">Global presence</p>
            <h2 className="h2">From Kuala Lumpur to the world.</h2>
          </div>
          <div className={styles.threeCol}>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Headquarters</h3>
              <p className="body-sm">Kuala Lumpur, Malaysia</p>
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Regional offices</h3>
              <p className="body-sm">{REGIONAL.join(' · ')}</p>
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Upcoming</h3>
              <p className="body-sm">{UPCOMING.join(' · ')}</p>
            </div>
          </div>
          <p className={`body-sm ${styles.globalNote}`}>
            Plans are also under way to create business affiliations with
            partners worldwide.
          </p>
        </div>
      </section>

      <section id="projects" className="section--light" data-theme="light">
        <div className="layout">
          <div className={styles.sectionHead}>
            <p className="mono has-pin--top-left">Key projects</p>
            <h2 className="h2">23 landmarks and counting.</h2>
          </div>
          <ul className={styles.projects}>
            {PROJECTS.map((p) => (
              <li key={p} className="body-sm">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer id="contact" className={`section--dark ${styles.footer}`} data-theme="dark">
        <div className="layout">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/world/logo.png"
                alt="Wire & Wire Products (M) Sdn Bhd"
                className={styles.footerLogo}
              />
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Visit</h3>
              <p className="body-sm">
                A1-3A-1, Arcoris Business Suites,
                <br />
                Jalan Kiara, Mont Kiara,
                <br />
                50480 Kuala Lumpur, Malaysia
              </p>
            </div>
            <div>
              <h3 className={`mono ${styles.colLabel}`}>Talk</h3>
              <p className="body-sm">
                <a href="tel:+60364196995">Tel +603 6419 6995</a>
                <br />
                Fax +603 6419 6994
                <br />
                <a href="mailto:info@wireproducts.cc">info@wireproducts.cc</a>
              </p>
            </div>
            <div className={styles.footerCta}>
              <a className={styles.btn} href="mailto:info@wireproducts.cc">
                Enquire now
              </a>
            </div>
          </div>
          <p className={`mono-sm ${styles.smallPrint}`}>
            © 2026 Wire &amp; Wire Products (M) Sdn. Bhd. (559241-P)
          </p>
        </div>
      </footer>
    </div>
  );
}
