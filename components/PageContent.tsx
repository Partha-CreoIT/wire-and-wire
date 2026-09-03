/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import {
  companyProfile,
  investorRelations,
  productFamilies,
  productFilmPlan,
  projects,
  regionalOpportunities,
  regionalPresence,
  type ProductFamily,
} from '@/lib/siteContent';
import {
  companyCsrImage,
  hdImage,
  productFilmAssets,
  projectGeneratedImage,
} from '@/lib/media';
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

const regionalOpportunityCount = regionalOpportunities.reduce(
  (sum, region) => sum + region.oldSiteCount,
  0,
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
    href: '/company',
    label: 'Company',
    title: 'People, values and governance.',
    body: 'The Kuala Lumpur company record, CSR archive, regional presence and corporate directory.',
  },
  {
    href: '/investor',
    label: 'Investor',
    title: 'Professional investor information.',
    body: 'Legacy investor restrictions and MiFID professional investor categories.',
  },
];

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
    <div className={styles.wrap}>
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
                <img
                  className={styles.filmPoster}
                  src={productFilmAssets[i].poster}
                  alt={beat.title}
                  loading="lazy"
                />
                <span className={`mono-sm ${styles.productNum}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mono-sm">{beat.label}</p>
                <h3 className="h5">{beat.title}</h3>
                <p className="body-sm">{beat.subject}</p>
                <Link className={styles.storyLink} href={productHrefForFilm(beat.id)}>
                  Open product
                </Link>
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

export function ProductFamilyPageContent({ family }: { family: ProductFamily }) {
  const relatedFamilies = productFamilies.filter((item) => item.slug !== family.slug);

  return (
    <div id="product-data" className={styles.wrap}>
      <section className="section--light" data-theme="light">
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

      <section className="section--dark" data-theme="dark">
        <div className="layout">
          <SectionHead
            label="Applications"
            title={`${family.applications.length} ${family.name} applications.`}
            intro="Application pages from the old product tree are kept as product-specific records."
          />
          <RevealGroup className={styles.applicationGrid}>
            {family.applications.map((application) => (
              <article key={application.name} className={styles.applicationCard}>
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

      <section className="section--light" data-theme="light">
        <div className="layout">
          <SectionHead label="Related products" title="Continue through the product line." />
          <RevealGroup as="ul" className={styles.relatedProducts}>
            {relatedFamilies.map((item) => (
              <li key={item.slug}>
                <Link className={styles.relatedProduct} href={`/products/${item.slug}`}>
                  <img src={hdImage(item.image)} alt={item.name} loading="lazy" />
                  <span className="mono-sm">{item.label}</span>
                  <strong>{item.name}</strong>
                </Link>
              </li>
            ))}
          </RevealGroup>
        </div>
      </section>

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
              <img
                className={styles.filmPoster}
                src={productFilmAssets[i].poster}
                alt={beat.title}
                loading="lazy"
              />
              <span className={`mono-sm ${styles.productNum}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mono-sm">{beat.label}</p>
              <h3 className="h5">{beat.title}</h3>
              <p className="body-sm">{beat.subject}</p>
              <Link className={styles.storyLink} href={productHrefForFilm(beat.id)}>
                Open product
              </Link>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead label="Principles" title="Service, quality, credibility." />
        <RevealGroup className={styles.threeCol}>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Our mission</h3>
            <ul className={styles.missionList}>
              {companyProfile.mission.map((m) => (
                <li key={m} className="body-sm">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Our vision</h3>
            <p className={`h6 ${styles.vision}`}>{companyProfile.vision}</p>
          </div>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Recognition</h3>
            <p className="body-sm">{companyProfile.recognition}</p>
          </div>
        </RevealGroup>
        <RevealGroup as="ul" className={styles.values}>
          {companyProfile.values.map((v) => (
            <li key={v} className="mono-sm">
              {v}
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
        <details className={styles.disclosure}>
          <summary className="mono">Fields under review in the legacy directory</summary>
          <ul>
            {companyProfile.directory.underReview.map((item) => (
              <li key={item} className="body-sm">
                {item}
              </li>
            ))}
          </ul>
        </details>
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
                <h3 className="h6">{item.title}</h3>
                <p className="body-sm">{item.text}</p>
              </article>
            ))}
          </div>
        </CsrGalleryMotion>
      </div>
    </section>
  );
}

function GlobalSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead label="Global presence" title="From Kuala Lumpur to the world." />
        <RevealGroup className={styles.threeCol}>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Headquarters</h3>
            <p className="body-sm">{regionalPresence.headquarters}</p>
          </div>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Regional offices</h3>
            <p className="body-sm">
              {regionalPresence.regionalOffices.join(' / ')}
            </p>
          </div>
          <div>
            <h3 className={`mono ${styles.colLabel}`}>Upcoming</h3>
            <p className="body-sm">
              {regionalPresence.upcomingOffices.join(' / ')}
            </p>
          </div>
        </RevealGroup>
        <p className={`body-sm ${styles.globalNote}`}>
          Plans are also under way to create business affiliations with partners
          worldwide.
        </p>
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
                </div>
                <p className="mono-sm">{project.type}</p>
                <h3 className="h6">{project.name}</h3>
                <p className="body-sm">{project.location}</p>
                <span className="mono-sm">
                  {project.legacyHits.toLocaleString('en-US')} archive views
                </span>
              </li>
            ))}
          </ul>
        </ProjectGalleryMotion>
      </div>
    </section>
  );
}

function MarketsSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead
          label="Regional project watch"
          title={`${regionalOpportunityCount} infrastructure leads preserved.`}
          intro="The old Web Links area tracked current and upcoming construction activity by country. The archive is kept here as grouped market intelligence."
        />
        <RevealGroup className={styles.marketGrid}>
          {regionalOpportunities.map((region) => (
            <details key={region.country} className={styles.marketPanel}>
              <summary>
                <span className="h6">{region.country}</span>
                <span className="mono-sm">{region.oldSiteCount} links</span>
              </summary>
              <ul>
                {region.items.map((item) => (
                  <li key={item} className="body-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function InvestorSection() {
  return (
    <section className="section--light" data-theme="light">
      <div className="layout">
        <SectionHead
          label="Investor relations"
          title="Professional investor information."
          intro={investorRelations.intro}
        />
        <RevealGroup className={styles.investorGrid}>
          <article>
            <h3 className={`mono ${styles.colLabel}`}>Restrictions</h3>
            <ul className={styles.missionList}>
              {investorRelations.restrictions.map((item) => (
                <li key={item} className="body-sm">
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3 className={`mono ${styles.colLabel}`}>
              MiFID professional categories
            </h3>
            <ul className={styles.compactList}>
              {investorRelations.mifidCategories.map((item) => (
                <li key={item} className="mono-sm">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </RevealGroup>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section--dark" data-theme="dark">
      <div className="layout">
        <SectionHead label="Contact" title="Kuala Lumpur office and correspondence." />
        <RevealGroup className={styles.contactGrid}>
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
        </RevealGroup>
      </div>
    </section>
  );
}

export function ProductsPageContent() {
  return (
    <>
      <ProductWorldFilm />
      <div id="product-archive" className={styles.wrap}>
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
    <div className={styles.wrap}>
      <PageHero
        label="Projects"
        title="Reference projects across infrastructure, towers and transport."
        intro="The project archive preserves the old site references with regenerated still images, locations and archive view counts."
      />
      <ProjectsSection />
      <MarketsSection />
      <ContactFooter />
    </div>
  );
}

export function CompanyPageContent() {
  return (
    <div className={styles.wrap}>
      <PageHero
        label="Company"
        title="A Kuala Lumpur wire products company built outward."
        intro="Company profile, values, people, governance, CSR archive and regional presence in one routed company record."
      />
      <PrinciplesSection />
      <AboutSection />
      <GovernanceSection />
      <CsrSection />
      <GlobalSection />
      <ContactFooter />
    </div>
  );
}

export function InvestorPageContent() {
  return (
    <div className={styles.wrap}>
      <PageHero
        label="Investor"
        title="Professional investor information and restrictions."
        intro="The investor material is preserved as a dedicated route, separate from product and project browsing."
      />
      <InvestorSection />
      <ContactFooter />
    </div>
  );
}

export function ContactPageContent() {
  return (
    <div className={styles.wrap}>
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

export function ContactFooter() {
  return (
    <footer id="contact" className={`section--dark ${styles.footer}`} data-theme="dark">
      <div className="layout">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
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
          Copyright 2026 Wire &amp; Wire Products (M) Sdn. Bhd. (559241-P)
        </p>
      </div>
    </footer>
  );
}
