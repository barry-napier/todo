export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 sm:h-16 items-center justify-center px-4 sm:px-6 md:px-8 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <a
          href="https://github.com/barry-napier/todo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
          aria-label="View source code on GitHub"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}