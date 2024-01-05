import { useCallback, useState } from "react";

import Link from "../Link";

import { Container, NavBar } from "./styles";

const Header = () => {
  const [isHeaderScrollActive, setIsHeaderScrollActive] = useState(false);

  const user = localStorage.getItem("@WeatherHub:user");

  const setScrollToZero = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  const changeNavbarBackground = useCallback(() => {
    setIsHeaderScrollActive(window.scrollY >= 25);
  }, []);

  window.addEventListener("scroll", changeNavbarBackground);

  return (
    <Container>
      <NavBar isHeaderScrollActive={isHeaderScrollActive}>
        <Link to="/" pageName='Home' isHeaderScrollActive={isHeaderScrollActive} onClick={setScrollToZero} />

        <div>
          {user ?
            <Link to="/dashboard" pageName='Dashboard' isHeaderScrollActive={isHeaderScrollActive} onClick={setScrollToZero} />
            : (
              <>
                <Link to="/signin" pageName='Login' isHeaderScrollActive={isHeaderScrollActive} />
                <Link to="/signup" pageName='Registrar' isHeaderScrollActive={isHeaderScrollActive} />
              </>
            )
          }
          <Link to="/about" pageName='Sobre' isHeaderScrollActive={isHeaderScrollActive} />
        </div>
      </NavBar>
    </Container>
  );
};

export default Header;
