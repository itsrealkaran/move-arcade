import { cn } from "@/lib/utils";

export function GridBackgroundDemo() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-white dark:bg-black">
      {/* Grid background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:70px_70px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

      {/* Title text */}
      <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
        Backgrounds
      </p>
    </div>
  );
}
