import React from 'react';

const NavbarContainer = ({ children }) => (
  <div
    style={{
      background: '#1b1d1e',
      position: 'fixed',
      top: '0',
      zIndex: 10,
      width: '100%',
      color: 'white',
      padding: '8px 8px',
      height: '40px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '18px',
      fontFamily: 'Lato,"Helvetica Neue",Arial,Helvetica,sans-serif',
      borderBottom: '1px solid rgba(255,255,255,.1)'
    }}
  >
    { children }
  </div>
);

const Logo = ({ onLogoClick }) => (
  <div onClick={onLogoClick}>
    <img
      height="40"
      style={{
        float: 'left'
      }}
      src="https://upload.wikimedia.org/wikipedia/en/2/20/Openfolio_Square_bright_blue_logo_512x.png"
    />
    <div style={{ position: 'relative', top: '10px', left: '12px' }}>Open Loop</div>
  </div>
);

const HamburgerMenuItem = () => (
  <div style={{
    width: '35px', height: '3px', backgroundColor: 'white', margin: '8px 0'
  }} />
);

const HamburgerMenu = ({ onClick }) => (
  <div style={{
    position: 'absolute', right: '10px', top: '8px', paddingRight: '15px'
  }} onClick={onClick}>
    <HamburgerMenuItem />
    <HamburgerMenuItem />
    <HamburgerMenuItem />
  </div>
);

const Navbar = ({ onClick, onLogoClick }) => (
  <NavbarContainer>
    <Logo onLogoClick={onLogoClick} />
    <HamburgerMenu onClick={onClick} />
  </NavbarContainer>
);

export default Navbar;
