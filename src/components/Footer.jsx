import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import QRcode from "../img/ZoraService.png";
const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className=" bg-gray-900 text-gray-300 py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-4">
            {t("About_Us")}
          </h2>
          <p className="text-gray-400 text-sm">{t("footer_discription")}</p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-4">
            {t("Quick_Links")}
          </h2>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <a href="#" className="hover:text-white transition">
                {t("Home")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                {t("Product")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                {t("About")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                {t("Contact")}
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-4">
            {t("Contact_Us")}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            {t("Email")}: zorastore@gmail.com
            <br />
            {t("Phone")}: 099 888 777
          </p>
          <div className="flex space-x-4 mb-5">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white transition text-gray-400"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-white transition text-gray-400"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-white transition text-gray-400"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="hover:text-white transition text-gray-400"
            >
              <FaLinkedinIn size={20} />
            </a>
          </div>
          <img
            className="w-25 h-25 object-contain"
            src={QRcode}
            alt="Zora Store QR Code"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Zora Store. {t("reserved")}
      </div>
    </footer>
  );
};

export default Footer;
