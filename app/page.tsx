import { HeroScrub } from '@/components/HeroScrub';
import { StatBand } from '@/components/StatBand';
import { Statement } from '@/components/Statement';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <HeroScrub />

      <StatBand
        stats={[
          { value: 23, label: 'Landmark projects' },
          { value: 100, suffix: '+', label: 'Years combined experience' },
          { value: 1860, suffix: ' MPa', label: 'Tensile grade' },
          { value: 4, label: 'Product lines' },
        ]}
      />

      <Statement
        theme="light"
        label="What we make"
        title="The steel that holds concrete together."
        body="Pre-stressed concrete works because steel takes the tension that
              concrete cannot. We manufacture that steel — PC strand, PC wire,
              PC bar and galvanised strand — to the tolerances that bridges,
              viaducts and towers depend on."
      />

      <Statement
        theme="dark"
        label="Where it goes"
        title="Inside structures you already know."
        body="Kuala Lumpur Convention Centre. Marina Bayfront Vehicular Bridge.
              Boon Lay MRT Extension. Fusionopolis. The Shell ethylene cracker
              complex. Twenty-three landmarks across Malaysia, Singapore,
              Indonesia and the UAE."
      />

      <footer className={`${styles.footer} section--light`} data-theme="light">
        <div className="layout">
          <div className={styles.footerInner}>
            <p className="mono">Wire &amp; Wire Products (M) Sdn. Bhd.</p>
            <p className="mono-sm">
              Grey-box build · design system and hero motion in review
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
