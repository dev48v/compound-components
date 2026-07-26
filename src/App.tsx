import { createContext, useContext, useState, type ReactNode } from "react";

/* ─────────── compound component: Tabs ─────────── */
type TabsCtx = { active: string; setActive: (v: string) => void };
const TabsContext = createContext<TabsCtx | null>(null);
function useTabs(): TabsCtx {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("<Tabs.Tab> must be rendered inside <Tabs>");
  return ctx;
}

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}
Tabs.List = ({ children }: { children: ReactNode }) => <div className="tablist" role="tablist">{children}</div>;
Tabs.Tab = ({ value, children }: { value: string; children: ReactNode }) => {
  const { active, setActive } = useTabs();
  const on = active === value;
  return <button role="tab" aria-selected={on} className={"tab" + (on ? " on" : "")} onClick={() => setActive(value)}>{children}</button>;
};
Tabs.Panel = ({ value, children }: { value: string; children: ReactNode }) => {
  const { active } = useTabs();
  return active === value ? <div className="tabpanel" role="tabpanel">{children}</div> : null;
};

/* a second, unrelated consumer — proves ANY descendant can read the shared state */
function ContextProbe() {
  const { active } = useTabs();
  return <div className="probe">a sibling component, deep in the tree, reads the same context: <code>active = "{active}"</code></div>;
}

/* ─────────── compound component: Accordion ─────────── */
type AccCtx = { open: string | null; toggle: (id: string) => void };
const AccContext = createContext<AccCtx | null>(null);
function Accordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>("a");
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  return <AccContext.Provider value={{ open, toggle }}><div className="acc">{children}</div></AccContext.Provider>;
}
Accordion.Item = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => {
  const ctx = useContext(AccContext);
  if (!ctx) throw new Error("<Accordion.Item> must be inside <Accordion>");
  const isOpen = ctx.open === id;
  return (
    <div className={"accitem" + (isOpen ? " open" : "")}>
      <button className="acchdr" onClick={() => ctx.toggle(id)} aria-expanded={isOpen}>
        <span>{title}</span><span className="chev">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="accbody">{children}</div>}
    </div>
  );
};

/* ─────────── page ─────────── */
export default function App() {
  return (
    <div className="wrap">
      <header>
        <h1><span className="logo">🧩</span> Compound Components</h1>
        <a className="ghbtn" href="https://github.com/dev48v/compound-components" target="_blank" rel="noopener">★ Star on GitHub</a>
      </header>
      <p className="sub">
        How do <code>&lt;Tabs.Tab&gt;</code> and <code>&lt;Tabs.Panel&gt;</code> stay in sync when you never wire them together?
        The <b>compound component</b> pattern: the parent holds the state and shares it through <b>Context</b>, so every
        child reads and updates it implicitly. You write clean, declarative markup — no <code>active</code> and{" "}
        <code>onChange</code> threaded through every element.
      </p>

      <div className="grid">
        {/* Tabs demo */}
        <section className="card">
          <h2>the markup you write</h2>
          <pre className="code">{`<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
    <Tabs.Tab value="faq">FAQ</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="pricing">…</Tabs.Panel>
  <Tabs.Panel value="faq">…</Tabs.Panel>
</Tabs>`}</pre>
          <p className="note">No <code>active</code> prop. No <code>onChange</code>. The tabs and panels find each other through context.</p>
        </section>

        {/* live */}
        <section className="card">
          <h2>and it just works</h2>
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
              <Tabs.Tab value="faq">FAQ</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview"><b>Overview.</b> The parent <code>&lt;Tabs&gt;</code> owns one piece of state — the active value — and puts it in context.</Tabs.Panel>
            <Tabs.Panel value="pricing"><b>Pricing.</b> Each <code>&lt;Tabs.Tab&gt;</code> reads that context to know if it's selected, and calls <code>setActive</code> on click.</Tabs.Panel>
            <Tabs.Panel value="faq"><b>FAQ.</b> Each <code>&lt;Tabs.Panel&gt;</code> reads the same context and renders only if its value matches.</Tabs.Panel>
            <ContextProbe />
          </Tabs>
        </section>
      </div>

      {/* how it works: the implementation */}
      <section className="card wide">
        <h2>how they talk — the implementation</h2>
        <div className="split">
          <pre className="code">{`const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("must be inside <Tabs>");
  return ctx;                 // clear error if used wrong
}`}</pre>
          <pre className="code">{`Tabs.List  = ({ children }) =>
  <div role="tablist">{children}</div>;

Tabs.Tab = ({ value, children }) => {
  const { active, setActive } = useTabs();
  return (
    <button aria-selected={active === value}
            onClick={() => setActive(value)}>
      {children}
    </button>
  );
};

Tabs.Panel = ({ value, children }) => {
  const { active } = useTabs();
  return active === value ? <div>{children}</div> : null;
};`}</pre>
        </div>
        <p className="note">Attaching <code>List</code>/<code>Tab</code>/<code>Panel</code> as properties of <code>Tabs</code> is the "compound" part — it namespaces the pieces and signals they belong together.</p>
      </section>

      {/* the alternative it replaces */}
      <section className="card wide">
        <h2>the alternative it replaces</h2>
        <div className="split">
          <div>
            <div className="badlabel">😖 without the pattern — prop drilling</div>
            <pre className="code bad">{`const [active, setActive] = useState("overview");

<TabList>
  <Tab value="overview" active={active} onChange={setActive}>…</Tab>
  <Tab value="pricing"  active={active} onChange={setActive}>…</Tab>
  <Tab value="faq"      active={active} onChange={setActive}>…</Tab>
</TabList>
<Panel value="overview" active={active}>…</Panel>
<Panel value="pricing"  active={active}>…</Panel>
<Panel value="faq"      active={active}>…</Panel>`}</pre>
            <p className="note">The caller owns the state and repeats <code>active</code>/<code>onChange</code> on every element. Add a tab → wire it again.</p>
          </div>
          <div>
            <div className="goodlabel">😌 with it — context does the wiring</div>
            <pre className="code good">{`<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">…</Tabs.Tab>
    <Tabs.Tab value="pricing">…</Tabs.Tab>
    <Tabs.Tab value="faq">…</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="pricing">…</Tabs.Panel>
  <Tabs.Panel value="faq">…</Tabs.Panel>
</Tabs>`}</pre>
            <p className="note">State lives inside <code>Tabs</code>. The caller just declares structure. Same technique powers Radix, Reach UI, and Headless UI.</p>
          </div>
        </div>
      </section>

      {/* second example: reusability */}
      <section className="card wide">
        <h2>same pattern, different component: an Accordion</h2>
        <Accordion>
          <Accordion.Item id="a" title="What makes it a “compound” component?">
            The sub-components are attached to the parent (<code>Accordion.Item</code>) and share state through a context the parent provides — they're designed to be used together.
          </Accordion.Item>
          <Accordion.Item id="b" title="Why not just use props?">
            Props work, but every consumer has to own and thread the state. Context moves that wiring inside the component, so the markup stays declarative.
          </Accordion.Item>
          <Accordion.Item id="c" title="When should I reach for it?">
            When a group of components must coordinate one piece of state — tabs, accordions, menus, selects, radio groups, steppers. If they're truly independent, plain props are simpler.
          </Accordion.Item>
        </Accordion>
        <p className="note">Identical idea — a parent with <code>createContext</code> + <code>useState</code>, children that <code>useContext</code>. Only the shape of the state changed.</p>
      </section>

      <footer>
        Built by <a href="https://dev48v.infy.uk" target="_blank" rel="noopener">dev48v</a> · React 19 + TypeScript + Vite ·
        real compound components (Context, no prop drilling) ·{" "}
        <a href="https://github.com/dev48v/compound-components" target="_blank" rel="noopener">source</a>
      </footer>
    </div>
  );
}
