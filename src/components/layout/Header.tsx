export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 sm:h-16 items-center px-4 sm:px-6 md:px-8 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <h1 className="text-lg font-bold sm:text-xl md:text-2xl">Todo App</h1>
      </div>
    </header>
  );
}
