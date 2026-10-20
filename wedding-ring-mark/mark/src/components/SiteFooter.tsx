export function SiteFooter() {
  return (
    <footer className="border-t-2 border-brand-gold bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-sm">
        <p className="font-serif text-xl">Burrows Jewellers</p>
        <p className="mt-2 opacity-80">Two stores in Mildura and online at{" "}
          <a href="https://burrowsjewellers.com.au" className="text-brand-gold underline-offset-4 hover:underline">burrowsjewellers.com.au</a>
        </p>
        <p className="mt-2 opacity-80">Authorised stockist of Infinity Rings. Ring imagery used with permission.</p>
        <p className="mt-4 text-xs opacity-60">© {new Date().getFullYear()} Burrows Jewellers Pty Ltd · ABN 33 639 388 480</p>
      </div>
    </footer>
  );
}
