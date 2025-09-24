import { Github, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <div className="flex space-x-6 mb-8">
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900"
      >
        <Github size={24} />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900"
      >
        <Twitter size={24} />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900"
      >
        <Instagram size={24} />
      </a>
    </div>
  );
};

export default Footer;
