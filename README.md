# 🧩 Compound Components — how React components share state without props

An interactive walkthrough of the **compound component** pattern: a group of components that coordinate one piece of state through **Context**, so the consumer writes clean declarative markup instead of threading `active`/`onChange` through every element.

**▶ Live:** https://compound-components.vercel.app/

## The question it answers

How do `<Tabs.Tab>` and `<Tabs.Panel>` stay in sync when you never wire them together?

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">…</Tabs.Panel>
  <Tabs.Panel value="pricing">…</Tabs.Panel>
</Tabs>
```

No `active` prop. No `onChange`. The tabs and panels find each other through a context the parent provides.

## How it works

```tsx
const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  );
}

Tabs.Tab = ({ value, children }) => {
  const { active, setActive } = useTabs();          // read shared state
  return <button aria-selected={active === value}
                 onClick={() => setActive(value)}>{children}</button>;
};

Tabs.Panel = ({ value, children }) => {
  const { active } = useTabs();
  return active === value ? <div>{children}</div> : null;
};
```

Three ideas:

1. **The parent owns the state.** `<Tabs>` holds `active` and puts it in context.
2. **Children consume it implicitly.** Each `Tab`/`Panel` reads context — no props threaded from the caller.
3. **Sub-components are namespaced onto the parent** (`Tabs.Tab`, `Tabs.Panel`). That's the "compound" part; it signals they're meant to be used together and gives a friendly error if used outside `<Tabs>`.

## What it replaces

Without the pattern, the caller owns the state and repeats `active`/`onChange` on every element (prop drilling). Add a tab → wire it again. With it, the state lives inside `<Tabs>` and the caller just declares structure. This is exactly how **Radix UI**, **Reach UI**, and **Headless UI** build their primitives.

The live page also builds an **Accordion** the same way, to show it's a reusable technique — a parent with `createContext` + `useState`, children that `useContext`. Only the shape of the state changes.

## When to use it

When a group of components must coordinate one piece of state: tabs, accordions, menus, selects, radio groups, steppers. If the components are genuinely independent, plain props are simpler.

## Stack

React 19 · TypeScript · Vite.

## Run locally

```bash
npm install
npm run dev
```

## License

MIT © 2026 [dev48v](https://github.com/dev48v) — [dev48v.infy.uk](https://dev48v.infy.uk)
