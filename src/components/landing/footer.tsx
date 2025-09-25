import { Github,  Twitter } from "lucide-react";

const Footer = () => {
  return (
    <div className="flex space-x-6 mb-8">
      <a
        href="https://github.com/aykansal"
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-300 hover:text-orange-400"
      >
        <Github size={24} />
      </a>
      <a
        href="https://x.com/aykansal"
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-300 hover:text-orange-400"
      >
        <Twitter size={24} />
      </a>
      {/* <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-300 hover:text-orange-400"
      >
        <Instagram size={24} />
      </a> */}
    </div>
  );
};

export default Footer;
