import React from 'react';
import '../css/header.css';
import logo from '/src/assets/images/logo.png';

const Header = () => {
    // Define links here for easy editing later
	const base = "https://www.yavnehyouthleague.com"
    const links = [
        { label: 'HOME', href: base+'/' },
        { label: 'STANDINGS', href: base+'/standings' },
        { label: 'SCHEDULE', href: base+'/schedule' },
        { label: 'FIELDS', href: base+'/fields' },
        // --- Logo goes here ---
        { label: 'RULES & READINGS', href: base+'/readings' },
        { label: 'FAQ', href: base+'/faq' },
        { label: 'SPONSORS', href: base+'/contact' },
        { label: 'CONTACT', href: base+'/contact' }
    ];

    const leftLinks = links.slice(0, 4);
    const rightLinks = links.slice(4, 8);

    return (
        <header className="main-header header_background">
            <div className="header-container">
                {/* Left Navigation Group */}
                <nav className="nav-group left">
                    <ul>
                        {leftLinks.map((link, index) => (
                            <li key={index}>
                                <a href={link.href}>{link.label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Center Logo */}
                <div className="logo-container">
                    <a href="/">
                        <img 
                            src={logo}
                            alt="Yavneh Youth League" 
                            className="header-logo" 
                        />
                    </a>
                </div>

                {/* Right Navigation Group */}
                <nav className="nav-group right">
                    <ul>
                        {rightLinks.map((link, index) => (
                            <li key={index}>
                                <a href={link.href} className={link.className || ''}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;