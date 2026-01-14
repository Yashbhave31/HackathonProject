import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faGithub,
  faLinkedin,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* BRAND SECTION */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <img
                src="/PublicDetectionweblogo.png"
                alt="CrowdGuardian"
                className="h-10 w-10 rounded-lg group-hover:scale-105 transition-transform"
              />
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Crowd</span>
              <span className="text-blue-500">Guardian</span>
            </h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Next-generation surveillance intelligence powered by YOLOv8. 
              Transforming raw video feeds into actionable security data.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={faTwitter} />
              <SocialIcon icon={faGithub} />
              <SocialIcon icon={faLinkedin} />
              <SocialIcon icon={faDiscord} />
            </div>
          </div>

          {/* NAV COLUMNS */}
          <FooterColumn 
            title="Product" 
            links={["Live Feed", "Video Analytics", "Cloud Storage", "API Access"]} 
          />
          <FooterColumn 
            title="Resources" 
            links={["Documentation", "Release Notes", "Community", "Support"]} 
          />
          <FooterColumn 
            title="Company" 
            links={["About Us", "Contact", "Privacy Policy", "Terms"]} 
          />
        </div>

{/* BOTTOM BAR */}
<div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-4 w-full">
  <p className="text-slate-500 text-[11px] font-mono tracking-widest uppercase text-center">
    © {currentYear} Crowd Guardian. All rights reserved.
  </p>
</div>
      </div>
    </footer>
  );
};

// Sub-component for Navigation Columns
const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col gap-4">
    <h4 className="text-[10px] text-white font-black tracking-[2px] uppercase opacity-50">
      {title}
    </h4>
    <ul className="flex flex-col gap-2">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-slate-400 text-sm hover:text-blue-400 transition-colors duration-200">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

// Sub-component for Social Icons
const SocialIcon = ({ icon }) => (
  <a href="#" className="h-9 w-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300">
    <FontAwesomeIcon icon={icon} size="sm" />
  </a>
);

export default Footer;