// src/components/ui/Header.jsx

import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <nav className="bg-green-600 w-full">
        <div className="container mx-auto flex items-center">
          <Link to="/" className="text-white text-lg font-bold py-2 px-4">
            SmartKart
          </Link>
          <ul className="flex flex-1 justify-evenly">
            <li>
              <Link to="/categories" className="block py-2 text-white">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/product" className="block py-2 text-white">
                Products
              </Link>
            </li>
            <li>
              <Link to="/associate" className="block py-2 text-white">
                Associate
              </Link>
            </li>
            {/* Add more navigation links as needed */}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
