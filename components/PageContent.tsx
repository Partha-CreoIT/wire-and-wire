/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  companyProfile,
  productFamilies,
  productFilmPlan,
  projects,
  regionalPresence,
  type ProductFamily,
} from '@/lib/siteContent';
import {
  companyCsrImage,
  hdImage,
  productFilmAssets,
  projectGeneratedImage,
} from '@/lib/media';
import { ContactForm } from './ContactForm';
import { RevealGroup } from './RevealGroup';
import { StatBand } from './StatBand';
import { Statement } from './Statement';
import { CsrGalleryMotion } from './CsrGalleryMotion';
import { ProjectGalleryMotion } from './ProjectGalleryMotion';
import { ProductWorldFilm } from './ProductWorldFilm';
import styles from './ContentSections.module.css';

const applications = productFamilies.flatMap((family) =>
  family.applications.map((application) => ({
    ...application,
    family: family.name,
    image: hdImage(application.image ?? family.image),
  })),
);

const routeCards = [
  {
    href: '/products',
    label: 'Products',
    title: 'Five families of tension steel.',
    body: 'PC strand, PC wire, PC bar, galvanized strand and industrial drawn wire products.',
  },
  {
    href: '/projects',
    label: 'Projects',
    title: `${projects.length} landmark references.`,
    body: 'Infrastructure, commercial, transport and civic works across Malaysia, Singapore, Indonesia and the UAE.',
  },
  {
    href: '/about',
    label: 'About',
    title: 'People, values and governance.',
    body: 'The team, the CEO, the corporate directory and the CSR archive of the Kuala Lumpur company.',
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function productHrefForFilm(id: string) {
  if (id === 'prestressing') return '/products/pc-strand';
  if (id === 'galvanized') return '/products/galvanized-strand-wire';
  if (id === 'unbonded-other') return '/products/other-wires';
  return `/products/${id}`;
}

function SectionHead({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <p className="mono has-pin--top-left">{label}</p>
      <h2 className="h2">{title}</h2>
      {intro && <p className={`body-sm ${styles.sectionIntro}`}>{intro}</p>}
    </div>
  );
}

function PageHero({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro: string;
}) {
  return (
    <section className={`section--light ${styles.pageHero}`} data-theme="light">
      <div className="layout">
        <p className={`mono has-pin--top-left ${styles.routeKicker}`}>{label}</p>
        <h1 className={`h1 ${styles.routeTitle}`}>{title}</h1>
        <p className={`body ${styles.routeIntro}`}>{intro}</p>
      </div>
    </section>
  );
}

function Address({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line}>
          {line}
          <br />
        </span>
      ))}
    </>
  );
}

export function HomeStorySections() {
  return (
    <div className={styles.wrap} data-site-content>
      <StatBand
        stats={[
          { value: projects.length, label: 'Landmark projects' },
          { value: 100, suffix: '+', label: 'Years combined experience' },
          { value: 1860, suffix: ' MPa', label: 'Tensile grade' },
          { value: productFamilies.length, label: 'Product families' },
        ]}
      />

      <Statement
        theme="light"
        label="The company"
        title="Customer satisfaction, above everything."
        body={companyProfile.overview.join(' ')}
      />

      <CompassSection />

      <section className="section--dark" data-theme="dark">
        <div className="layout">
          <SectionHead
            label="Product story"
            title="From wire geometry to landmark infrastructure."
            intro="The new product film follows six beats: strand, prestressing, PC wire, PC bar, galvanized protection and unbonded span applications."
          />
          <RevealGroup as="ol" className={styles.filmBeats}>
            {productFilmPlan.map((beat, i) => (
              <li key={beat.id} className={styles.filmBeat}>
                <div className={styles.cardMedia}>
                  <img
                    className={styles.filmPoster}
                    src={productFilmAssets[i].poster}
                    alt={beat.title}
                    loading="lazy"
                  />
                  <span className={`mono-sm ${styles.cardNum}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p className="mono-sm">{beat.label}</p>
                  <h3 className="h5">{beat.title}</h3>
                  <p className="body-sm">{beat.subject}</p>
                  <Link className={styles.storyLink} href={productHrefForFilm(beat.id)}>
                    Open product
                  </Link>
                </div>
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section--light" data-theme="light">
        <div className="layout">
          <SectionHead
            label="Company archive"
            title="Products, projects and company record."
          />
          <RevealGroup className={styles.storyGrid}>
            {routeCards.map((card) => (
              <article key={card.href} className={styles.storyCard}>
                <p className="mono-sm">{card.label}</p>
                <h3 className="h5">{card.title}</h3>
                <p className="body-sm">{card.body}</p>
                <Link className={styles.storyLink} href={card.href}>
                  Open
                </Link>
              </article>
            ))}
          </RevealGroup>
        </div>
      </section>

      <ContactFooter />
    </div>
  );
}

/* The legacy site's "Our Mission / Our Vision / Global Presence /
   International Recognition" tab block, carried forward as one record. */
function CompassSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="Mission · Vision · Presence"
          title="What we stand for, from Kuala Lumpur outward."
        />
        <RevealGroup className={styles.compassGrid}>
          <article className={styles.compassPanel}>
            <span className={`mono-sm ${styles.compassNum}`}>01</span>
            <h3 className={`mono ${styles.colLabel}`}>Our mission</h3>
            <ul className={styles.missionList}>
              {companyProfile.mission.map((item) => (
                <li key={item} className="body-sm">
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className={styles.compassPanel}>
            <span className={`mono-sm ${styles.compassNum}`}>02</span>
            <h3 className={`mono ${styles.colLabel}`}>Our vision</h3>
            <p className={`h6 ${styles.compassVision}`}>{companyProfile.vision}</p>
          </article>
          <article className={styles.compassPanel}>
            <span className={`mono-sm ${styles.compassNum}`}>03</span>
            <h3 className={`mono ${styles.colLabel}`}>Global presence</h3>
            <p className={`body-sm ${styles.compassBody}`}>
              Headquartered in {regionalPresence.headquarters}, with regional
              offices across the region and more on the way.
            </p>
            <ul className={styles.chips}>
              {regionalPresence.regionalOffices.map((office) => (
                <li key={office} className="mono-sm">
                  {office}
                </li>
              ))}
              {regionalPresence.upcomingOffices.map((office) => (
                <li key={office} className={`mono-sm ${styles.chipSoon}`}>
                  {office}
                </li>
              ))}
            </ul>
          </article>
          <article className={styles.compassPanel}>
            <span className={`mono-sm ${styles.compassNum}`}>04</span>
            <h3 className={`mono ${styles.colLabel}`}>International recognition</h3>
            <p className={`body-sm ${styles.compassBody}`}>
              {companyProfile.recognition}
            </p>
          </article>
        </RevealGroup>
        <RevealGroup as="ul" className={styles.values}>
          {companyProfile.values.map((value) => (
            <li key={value} className="mono-sm">
              {value}
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ProductFamilySection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead
          label="What we make"
          title="Five families of tension steel."
          intro="Every product branch from the legacy site is represented: PC strand, PC wire, PC bar, galvanized strand and wire, plus other drawn wire products."
        />
        <RevealGroup as="ol" className={styles.products}>
          {productFamilies.map((p, i) => (
            <li key={p.slug} className={styles.product}>
              <Link className={styles.productLink} href={`/products/${p.slug}`}>
                <img
                  className={styles.productImg}
                  src={hdImage(p.image)}
                  alt={p.name}
                  loading="lazy"
                />
                <span className={`mono-sm ${styles.productNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={`mono-sm ${styles.productLabel}`}>{p.label}</p>
                <h3 className={`h5 ${styles.productName}`}>{p.name}</h3>
                <p className={`body-sm ${styles.productText}`}>{p.summary}</p>
                <ul className={styles.chips}>
                  <li className="mono-sm">{p.applications.length} applications</li>
                  {p.variants && (
                    <li className="mono-sm">{p.variants.length} variants</li>
                  )}
                </ul>
                <span className={styles.storyLink}>Open product</span>
              </Link>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ProductDataSection() {
  return (
    <section id="product-data" className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="Product data"
          title="The old product tree, rebuilt as usable content."
          intro="The legacy site separated core products, variants and applications across many Joomla pages. Here they are consolidated into a scannable technical surface."
        />
        <RevealGroup className={styles.productDetailGrid}>
          {productFamilies.map((family) => (
            <article key={family.slug} className={styles.detailPanel}>
              <div className={styles.detailPanelHead}>
                <img src={hdImage(family.image)} alt={family.name} loading="lazy" />
                <div>
                  <p className="mono-sm">{family.label}</p>
                  <h3 className="h5">{family.name}</h3>
                </div>
              </div>
              <div className={styles.detailCopy}>
                {family.detail.map((paragraph) => (
                  <p key={paragraph} className="body-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
              {family.variants && (
                <div className={styles.variantBlock}>
                  <h4 className={`mono ${styles.colLabel}`}>Variants</h4>
                  <ul className={styles.plainList}>
                    {family.variants.map((variant) => (
                      <li key={variant.name}>
                        {variant.image && (
                          <img
                            className={styles.variantImg}
                            src={hdImage(variant.image)}
                            alt={variant.name}
                            loading="lazy"
                          />
                        )}
                        <div>
                          <strong>{variant.name}</strong>
                          <span>{variant.description}</span>
                          {variant.uses && <small>{variant.uses.join(' / ')}</small>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* The legacy product pages led with the pre-stressing story, not a type list.
   Families that carry a `process` get it back here as an animatic + steps. */
function ProcessSection({ family }: { family: ProductFamily }) {
  const process = family.process;
  if (!process) return null;

  return (
    <section id="process" className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="The process"
          title={process.title}
          intro={process.intro}
        />
        <RevealGroup className={styles.processGrid}>
          <div className={styles.processMedia}>
            <video
              src={process.video}
              poster={process.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <ol className={styles.processSteps}>
            {process.steps.map((step, i) => (
              <li key={step.name}>
                <span className={styles.processNum}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="h6">{step.name}</h3>
                  <p className="body-sm">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </RevealGroup>
      </div>
    </section>
  );
}

/* "One product finished" — the catalogue continues to the next family. */
function CataloguePager({ family }: { family: ProductFamily }) {
  const index = productFamilies.findIndex((item) => item.slug === family.slug);
  const prev = index > 0 ? productFamilies[index - 1] : null;
  const next =
    index < productFamilies.length - 1 ? productFamilies[index + 1] : null;

  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <div className={styles.pager}>
          {prev ? (
            <Link href={`/products/${prev.slug}`} className={styles.pagerCard}>
              <span className="mono-sm">← Previous product</span>
              <strong className="h5">{prev.name}</strong>
            </Link>
          ) : (
            <Link href="/products" className={styles.pagerCard}>
              <span className="mono-sm">← Catalogue start</span>
              <strong className="h5">All products</strong>
            </Link>
          )}
          <p className={`mono-sm ${styles.pagerCount}`}>
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(productFamilies.length).padStart(2, '0')}
          </p>
          {next ? (
            <Link
              href={`/products/${next.slug}`}
              className={`${styles.pagerCard} ${styles.pagerCardNext}`}
            >
              <span className="mono-sm">Product finished — next →</span>
              <strong className="h5">{next.name}</strong>
            </Link>
          ) : (
            <Link
              href="/products"
              className={`${styles.pagerCard} ${styles.pagerCardNext}`}
            >
              <span className="mono-sm">Catalogue complete →</span>
              <strong className="h5">Back to all products</strong>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* True when every variant carries its legacy dedicated-page content — the
   family then renders one cinematic showcase per variant (content left,
   cinema right) instead of the compact overview panel. */
function isShowcaseFamily(family: ProductFamily) {
  const variants = family.variants ?? [];
  return variants.length > 0 && variants.every((variant) => variant.detail);
}

/* The legacy dedicated sub-product pages (PC Strand → Pre-Stressed Concrete
   Strand / Galvanised Strand / Unbonded Strand), rebuilt one by one inside
   the single catalogue page. */
function VariantShowcases({ family }: { family: ProductFamily }) {
  const variants = family.variants ?? [];
  const kind = variants.length > 1 ? 'Sub-product' : 'The product';
  return (
    <>
      {variants.map((variant, i) => (
        <section
          key={variant.name}
          id={`variant-${slugify(variant.name)}`}
          className={`section--dark ${styles.showcase}`}
          data-theme="dark"
        >
          <div className="layout">
            <div className={styles.showcaseGrid}>
              <div className={styles.showcaseCopy}>
                <span className={styles.showcaseNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className={`mono ${styles.showcaseKicker}`}>
                  {family.name} · {kind}
                </p>
                <h2 className="h3">{variant.name}</h2>
                {(variant.detail ?? [variant.description]).map((paragraph) => (
                  <p key={paragraph} className={`body ${styles.showcaseBody}`}>
                    {paragraph}
                  </p>
                ))}
                {variant.uses && (
                  <ul className={styles.chips}>
                    {variant.uses.map((use) => (
                      <li key={use} className="mono-sm">
                        {use}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.showcaseMedia}>
                {variant.video ? (
                  <video
                    src={variant.video}
                    poster={variant.poster ?? variant.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={hdImage(variant.image ?? family.image)}
                    alt={variant.name}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

function FamilyOverviewSection({ family }: { family: ProductFamily }) {
  return (
      <section id="overview" className="section--light" data-theme="light">
        <div className="layout">
          <SectionHead
            label="Product data"
            title={`${family.name}: product details and application archive.`}
            intro="The product material from the legacy site is preserved here as readable, routed content below the cinematic product story."
          />
          <RevealGroup className={styles.familyDetailGrid}>
            <article className={styles.familySpecPanel}>
              <div className={styles.detailPanelHead}>
                <img src={hdImage(family.image)} alt={family.name} loading="lazy" />
                <div>
                  <p className="mono-sm">{family.label}</p>
                  <h2 className="h5">{family.name}</h2>
                </div>
              </div>
              <div className={styles.detailCopy}>
                {family.detail.map((paragraph) => (
                  <p key={paragraph} className="body-sm">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {family.variants?.length ? (
              <article className={styles.familySpecPanel}>
                <h3 className={`mono ${styles.colLabel}`}>Variants</h3>
                <ul className={styles.plainList}>
                  {family.variants.map((variant) => (
                    <li key={variant.name} id={`variant-${slugify(variant.name)}`}>
                      {variant.image && (
                        <img
                          className={styles.variantImg}
                          src={hdImage(variant.image)}
                          alt={variant.name}
                          loading="lazy"
                        />
                      )}
                      <div>
                        <strong>{variant.name}</strong>
                        <span>{variant.description}</span>
                        {variant.uses && <small>{variant.uses.join(' / ')}</small>}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ) : (
              <article className={styles.familySpecPanel}>
                <h3 className={`mono ${styles.colLabel}`}>Range</h3>
                <p className="body-sm">{family.summary}</p>
              </article>
            )}
          </RevealGroup>
        </div>
      </section>
  );
}

export function ProductFamilyPageContent({ family }: { family: ProductFamily }) {
  return (
    <div id="product-data" className={styles.wrap} data-site-content>
      {isShowcaseFamily(family) ? (
        <VariantShowcases family={family} />
      ) : (
        <FamilyOverviewSection family={family} />
      )}

      <ProcessSection family={family} />

      <section id="applications" className="section--dark" data-theme="dark">
        <div className="layout">
          <SectionHead
            label="Applications"
            title={`${family.applications.length} ${family.name} applications.`}
            intro="Application pages from the old product tree are kept as product-specific records."
          />
          <RevealGroup className={styles.applicationGrid}>
            {family.applications.map((application) => (
              <article
                key={application.name}
                id={`app-${slugify(application.name)}`}
                className={styles.applicationCard}
              >
                <img
                  src={hdImage(application.image ?? family.image)}
                  alt={application.name}
                  loading="lazy"
                />
                <p className="mono-sm">{family.name}</p>
                <h3 className="h6">{application.name}</h3>
                <p className="body-sm">{application.description ?? family.summary}</p>
              </article>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CataloguePager family={family} />

      <ContactFooter />
    </div>
  );
}

function ApplicationsSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead
          label="Applications"
          title={`${applications.length} product applications and use cases.`}
          intro="These are the specific use cases from the old product pages, preserving the engineering context instead of burying it under generic product cards."
        />
        <RevealGroup className={styles.applicationGrid}>
          {applications.map((application) => (
            <article
              key={`${application.family}-${application.name}`}
              className={styles.applicationCard}
            >
              <img src={application.image} alt={application.name} loading="lazy" />
              <p className="mono-sm">{application.family}</p>
              <h3 className="h6">{application.name}</h3>
              {application.description && (
                <p className="body-sm">{application.description}</p>
              )}
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ProductFilmSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="Product journey"
          title="A six-beat cinematic path through the product line."
          intro="This is the Higgsfield film chain: a continuous product journey from strand geometry through real applications."
        />
        <RevealGroup as="ol" className={styles.filmBeats}>
          {productFilmPlan.map((beat, i) => (
            <li key={beat.id} className={styles.filmBeat}>
              <div className={styles.cardMedia}>
                <img
                  className={styles.filmPoster}
                  src={productFilmAssets[i].poster}
                  alt={beat.title}
                  loading="lazy"
                />
                <span className={`mono-sm ${styles.cardNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className={styles.cardBody}>
                <p className="mono-sm">{beat.label}</p>
                <h3 className="h5">{beat.title}</h3>
                <p className="body-sm">{beat.subject}</p>
                <Link className={styles.storyLink} href={productHrefForFilm(beat.id)}>
                  Open product
                </Link>
              </div>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead label="People" title="Built from Kuala Lumpur, outward." />
        <RevealGroup className={styles.aboutGrid}>
          <article className={styles.statementPanel}>
            <p className="mono-sm">The team</p>
            <h3 className="h5">Passion, perseverance, supply discipline.</h3>
            <p className="body-sm">{companyProfile.team}</p>
          </article>
          <article className={styles.quotePanel}>
            <p className="mono-sm">Message from the CEO</p>
            <h3 className="h5">{companyProfile.ceo.name}</h3>
            {companyProfile.ceo.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body-sm">
                {paragraph}
              </p>
            ))}
            <p className={`mono-sm ${styles.signature}`}>
              {companyProfile.ceo.title}
            </p>
          </article>
        </RevealGroup>
      </div>
    </section>
  );
}

function GovernanceSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead label="Company data" title="Governance and corporate directory." />
        <RevealGroup className={styles.governanceGrid}>
          <article>
            <h3 className={`mono ${styles.colLabel}`}>Governance</h3>
            <p className="body-sm">{companyProfile.governance.description}</p>
            <p className="body-sm">{companyProfile.governance.guidelines}</p>
            <ul className={styles.compactList}>
              {companyProfile.governance.items.map((item) => (
                <li key={item} className="mono-sm">
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3 className={`mono ${styles.colLabel}`}>Registered office</h3>
            <p className="body-sm">
              <Address lines={companyProfile.directory.registeredOffice} />
            </p>
            <h3 className={`mono ${styles.colLabel}`}>Correspondence</h3>
            <p className="body-sm">
              <Address lines={companyProfile.directory.correspondenceOffice} />
            </p>
            <p className={`mono-sm ${styles.founding}`}>
              Founded {companyProfile.directory.foundingDate}
            </p>
          </article>
        </RevealGroup>
        <RevealGroup className={styles.partnerGrid}>
          {companyProfile.directory.partners.map((partner) => (
            <article key={`${partner.role}-${partner.name}`}>
              <p className="mono-sm">{partner.role}</p>
              <h3 className="body-sm">{partner.name}</h3>
              <p className="mono-sm">
                <Address lines={partner.address} />
              </p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function CsrSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="CSR"
          title="Community work, kept in the record."
          intro="The old CSR page contained the richest human material on the site. It is now presented as a visual archive instead of a long static article."
        />
        <CsrGalleryMotion>
          <div className={styles.csrGrid}>
            {companyProfile.csr.map((item) => (
              <article key={item.title} className={styles.csrItem} data-csr-card>
                <div className={styles.csrMedia} data-csr-media>
                  <img src={companyCsrImage(item.image)} alt={item.title} loading="lazy" />
                </div>
                <div className={styles.csrBody}>
                  <h3 className="h6">{item.title}</h3>
                  <p className="body-sm">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </CsrGalleryMotion>
      </div>
    </section>
  );
}

/* Cinematic hero for the projects page — the skyline leg of the world film
   ("inside structures you already know") looping behind the headline. */
function ProjectsHero() {
  const totalHits = projects.reduce((sum, project) => sum + project.legacyHits, 0);
  const regions = Array.from(new Set(projects.map((project) => project.location.split(',').pop()!.trim())));

  return (
    <section className={`section--dark ${styles.projectsHero}`} data-theme="dark">
      <video
        className={styles.projectsHeroVideo}
        src="/generated/hero/projects-hero.mp4"
        poster="/world/skyline.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className={styles.projectsHeroScrim} aria-hidden="true" />
      <div className={`layout ${styles.projectsHeroContent}`}>
        <p className={`mono has-pin--top-left ${styles.routeKicker}`}>Projects</p>
        <h1 className={`h1 ${styles.routeTitle}`}>
          Inside structures you already know.
        </h1>
        <p className={`body ${styles.projectsHeroIntro}`}>
          {projects.length} landmark references from the archive — bridges,
          towers, highways and transit across the region, each carrying Wire
          &amp; Wire tension steel.
        </p>
        <ul className={styles.chips}>
          <li className="mono-sm">{projects.length} landmarks</li>
          <li className="mono-sm">{regions.length} territories</li>
          <li className="mono-sm">
            {totalHits.toLocaleString('en-US')} archive views
          </li>
        </ul>
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="Key projects"
          title={`${projects.length} landmarks and counting.`}
          intro="Each project from the old site is represented with a regenerated still image and its original project record."
        />
        <ProjectGalleryMotion>
          <ul className={styles.projects}>
            {projects.map((project) => (
              <li key={project.slug} className={styles.project} data-project-card>
                <div className={styles.projectMedia} data-project-media>
                  <img
                    src={projectGeneratedImage(project.slug)}
                    alt={project.name}
                    loading="lazy"
                  />
                  <span className={`mono-sm ${styles.cardNum} ${styles.projectType}`}>
                    {project.type}
                  </span>
                </div>
                <div className={styles.projectBody}>
                  <h3 className="h6">{project.name}</h3>
                  <p className="body-sm">{project.location}</p>
                  <span className={`mono-sm ${styles.projectViews}`}>
                    {project.legacyHits.toLocaleString('en-US')} archive views
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ProjectGalleryMotion>
      </div>
    </section>
  );
}


function ContactSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead
          label="Contact"
          title="Write to Kuala Lumpur."
          intro="Send an enquiry directly with the form — or reach the office by phone, fax or mail."
        />
        <RevealGroup className={styles.contactSplit}>
          <div className={styles.contactDetails}>
            <article className={styles.contactPanel}>
              <h3 className={`mono ${styles.colLabel}`}>Talk</h3>
              <p className="body-sm">
                <a href="tel:+60364196995">Tel +603 6419 6995</a>
                <br />
                Fax +603 6419 6994
                <br />
                <a href="mailto:info@wireproducts.cc">info@wireproducts.cc</a>
              </p>
            </article>
            <article className={styles.contactPanel}>
              <h3 className={`mono ${styles.colLabel}`}>Correspondence</h3>
              <p className="body-sm">
                <Address lines={companyProfile.directory.correspondenceOffice} />
              </p>
            </article>
            <article className={styles.contactPanel}>
              <h3 className={`mono ${styles.colLabel}`}>Registered office</h3>
              <p className="body-sm">
                <Address lines={companyProfile.directory.registeredOffice} />
              </p>
            </article>
          </div>
          <ContactForm />
        </RevealGroup>
      </div>
    </section>
  );
}

export function ProductsPageContent() {
  return (
    <>
      <ProductWorldFilm />
      <div id="product-archive" className={styles.wrap} data-site-content>
        <ProductFamilySection />
        <ProductDataSection />
        <ApplicationsSection />
        <ContactFooter />
      </div>
    </>
  );
}

export function ProjectsPageContent() {
  return (
    <div className={styles.wrap} data-site-content>
      <ProjectsHero />
      <ProjectsSection />
      <ContactFooter />
    </div>
  );
}

export function AboutPageContent() {
  return (
    <div className={styles.wrap} data-site-content>
      <PageHero
        label="About"
        title="A Kuala Lumpur wire products company built outward."
        intro="The team, the message from the CEO, the corporate directory, governance and the CSR archive — the company record in one place."
      />
      <AboutSection />
      <GovernanceSection />
      <CsrSection />
      <ContactFooter />
    </div>
  );
}

export function ContactPageContent() {
  return (
    <div className={styles.wrap} data-site-content>
      <PageHero
        label="Contact"
        title="Talk to Wire & Wire Products."
        intro="Office, correspondence and direct enquiry details for Wire & Wire Products (M) Sdn. Bhd."
      />
      <ContactSection />
      <ContactFooter />
    </div>
  );
}

const footerNav = [
  { href: '/', label: 'Story' },
  { href: '/products', label: 'Products' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function ContactFooter() {
  return (
    <footer id="contact" className={`section--dark ${styles.footer}`} data-theme="dark">
      <div className="layout">
        <div className={styles.footerCall}>
          <p className={`mono has-pin--top-left ${styles.footerKicker}`}>
            Start a conversation
          </p>
          <h2 className={`h2 ${styles.footerHeadline}`}>
            Put our steel under tension.
          </h2>
          <div className={styles.footerActions}>
            <a className={styles.btn} href="mailto:info@wireproducts.cc">
              Enquire now
            </a>
            <a className={styles.btnGhost} href="tel:+60364196995">
              +603 6419 6995
            </a>
          </div>
        </div>

        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <img
              src="/world/logo.png"
              alt="Wire & Wire Products (M) Sdn Bhd"
              className={styles.footerLogo}
            />
            <p className={`body-sm ${styles.footerTagline}`}>
              Tension steel for pre-stressed concrete — drawn, stranded and
              shipped from Kuala Lumpur since 2001, inside {projects.length}{' '}
              landmark structures.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className={`mono ${styles.colLabel}`}>Explore</h3>
            <ul className={styles.footerLinks}>
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Product families">
            <h3 className={`mono ${styles.colLabel}`}>Products</h3>
            <ul className={styles.footerLinks}>
              {productFamilies.map((family) => (
                <li key={family.slug}>
                  <Link href={`/products/${family.slug}`}>{family.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Visit</h3>
            <p className="body-sm">
              A1-3A-1, Arcoris Business Suites,
              <br />
              Jalan Kiara, Mont Kiara,
              <br />
              50480 Kuala Lumpur, Malaysia
            </p>
            <h3 className={`mono ${styles.colLabel} ${styles.footerTalkLabel}`}>
              Talk
            </h3>
            <p className="body-sm">
              <a href="tel:+60364196995">Tel +603 6419 6995</a>
              <br />
              Fax +603 6419 6994
              <br />
              <a href="mailto:info@wireproducts.cc">info@wireproducts.cc</a>
            </p>
          </div>
        </div>

        <div className={styles.footerMeta}>
          <p className="mono-sm">
            Copyright 2026 Wire &amp; Wire Products (M) Sdn. Bhd. (559241-P)
          </p>
          <p className="mono-sm">Kuala Lumpur · Est. 2001</p>
        </div>
      </div>
      <p className={styles.footerWordmark} aria-hidden="true">
        Wire <span>&amp;</span> Wire
      </p>
    </footer>
  );
}
