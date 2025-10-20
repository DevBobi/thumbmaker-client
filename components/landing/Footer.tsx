import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto py-12 md:py-16 px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Company */}
          <div className="space-y-4">
            <Link href="/dashboard">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent tracking-tight">
                THUMBMAKER
              </h1>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              Creating viral YouTube thumbnails effortlessly with AI-powered
              innovation.
            </p>
            <div className="flex flex-col space-y-1">
              <Link
                className="text-xs text-gray-600 hover:text-brand-600 transition-colors"
                href="/pricing"
              >
                Pricing
              </Link>
              <Link
                className="text-[10px] text-gray-600 hover:text-brand-600 transition-colors"
                href="/terms-conditions"
              >
                Terms & Conditions
              </Link>
              <Link
                className="text-[10px] text-gray-600 hover:text-brand-600 transition-colors"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
          {/* Key Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-900">Key Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-brand-600 transition-colors">
                One-Shot Thumbnail Generation
              </li>
              <li className="hover:text-brand-600 transition-colors">
                AI Text Overlays
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Proven Templates
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Multi-Format Export
              </li>
            </ul>
          </div>
          {/* Thumbnail Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-900">Thumbnail Styles</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-brand-600 transition-colors">
                Gaming Content
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Educational Videos
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Vlogs & Lifestyle
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Tech Reviews
              </li>
              <li className="hover:text-brand-600 transition-colors">
                How-To Tutorials
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Product Reviews
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Entertainment
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Business & Finance
              </li>
            </ul>
          </div>
          {/* Creation Tools */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base text-gray-900">Creation Tools</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-brand-600 transition-colors">
                Product Profiling
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Template Filtering
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Text Generation
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Visual Asset Creation
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Thumbnail Variations
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Format Optimization
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Video Project Management
              </li>
              <li className="hover:text-brand-600 transition-colors">
                Performance Analytics
              </li>
              <li>
                <Link
                  className="text-sm transition-colors hover:text-brand-600"
                  href="/tools"
                >
                  View all tools
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-xs text-gray-600">
            © 2025 <span className="font-semibold">THUMBMAKER</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
