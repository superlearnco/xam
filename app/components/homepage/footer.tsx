import { Link } from "react-router";

export default function FooterSection() {
  return (
    <footer className="border-t py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and tagline */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" aria-label="go home" className="block mb-4">
              <img src="/xam full.png" alt="xam Logo" className="h-8" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered test creation and grading platform for teachers and educators.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} xam by superlearn. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
