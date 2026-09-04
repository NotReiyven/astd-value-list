import { Shield, FileText } from "lucide-react";

export function LegalChannel({ type }: { type: "tos" | "privacy" }) {
  const isTos = type === "tos";

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#313338] h-full text-[#DBDEE1] p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto bg-[#2B2D31] rounded-[12px] border border-[rgba(255,255,255,0.04)] shadow-sm overflow-hidden">
        
        <div className="bg-[#1E1F22] p-6 md:p-8 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center flex-shrink-0 shadow-inner">
            {isTos ? <FileText className="w-6 h-6 text-[#5865F2]" /> : <Shield className="w-6 h-6 text-[#23a559]" />}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#F2F3F5] tracking-tight uppercase">
              {isTos ? "Terms of Service" : "Privacy Policy"}
            </h1>
            <p className="text-[13px] text-[#949BA4] font-medium mt-1">Last Updated: September 4, 2026</p>
          </div>
        </div>

        <div className="p-6 md:p-8 text-[13px] md:text-[14px] leading-[1.75] text-[#B5BAC1] space-y-6">
          
          {isTos ? (
            <>
              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">1. Acceptance of Terms</h2>
                <p>By accessing and using the ASTD Value List ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our Service.</p>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">2. Disclaimers & Non-Affiliation</h2>
                <p>ASTD Value List is a community-driven resource. We are <strong>not affiliated, associated, authorized, endorsed by, or in any way officially connected with Roblox Corporation</strong>, the creators of All Star Tower Defense, or any of their subsidiaries or affiliates.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#5865F2]">
                  <li>All unit values, demand ratings, and status tags are community estimates and are provided for informational purposes only.</li>
                  <li>We are not responsible for any "bad trades," loss of digital assets, or fluctuations in in-game economies resulting from the use of this Service.</li>
                  <li>Trade at your own risk and always exercise personal judgment.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">3. Acceptable Use & API Rate Limiting</h2>
                <p>Our service utilizes serverless functions to fetch live market data. To protect the integrity of the Service:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#5865F2]">
                  <li>You agree not to use automated scripts, bots, or scrapers to continuously ping our Netlify endpoints.</li>
                  <li>We utilize Upstash Redis for strict rate-limiting. Excessive requests will result in a temporary or permanent block of your IP address.</li>
                  <li>Reverse engineering or attempting to exploit the backend architecture is strictly prohibited.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">4. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms of Service.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">1. Data We Do Not Collect</h2>
                <p>We believe in privacy by design. ASTD Value List operates primarily as a client-side application.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#23a559]">
                  <li>We <strong>do not</strong> require account creation or login.</li>
                  <li>We <strong>do not</strong> ask for your Roblox username, password, or any personally identifiable information (PII).</li>
                  <li>Your active trade configurations (Give/Get items), custom dictionary slang, and UI preferences are stored locally on your device using <code>localStorage</code> and IndexedDB. We have no access to this data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">2. Analytics & Cookies</h2>
                <p>To understand how our platform is used and to improve the user experience, we use Google Analytics.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#23a559]">
                  <li>We implement Google Consent Mode v2. By default, tracking cookies are disabled.</li>
                  <li>If you click "Accept All" on our cookie banner, Google Analytics will place a cookie on your device to track page views, engagement time, and broad geographical data (e.g., country/city).</li>
                  <li>If you decline, we only send anonymous, cookieless pings that do not track your session history.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">3. Server Logs & Rate Limiting</h2>
                <p>When you access our live data, your request passes through our Netlify serverless functions.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-[#23a559]">
                  <li>We utilize Upstash Redis to monitor request frequencies to prevent DDoS attacks and server abuse.</li>
                  <li>Your IP address is temporarily processed in a sliding window memory solely for the purpose of rate-limiting. It is not permanently stored or linked to a personal profile.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[15px] font-bold text-[#F2F3F5] mb-2 uppercase tracking-wide">4. Third-Party Links</h2>
                <p>Our Service contains links to third-party platforms, specifically Discord. We are not responsible for the privacy practices or content of these external sites. Please review their privacy policies when leaving our platform.</p>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}