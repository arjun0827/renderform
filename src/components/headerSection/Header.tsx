import "./Header.css";

const Header = () => {
  return (
    <div className="d-flex justify-content-center">
      <div className="header">
        <header>
          <h1 className="fw-normal pt-4">Full-Stack Engineer</h1>
          <div className="py-4">
            <ol className="breadcrumb text-uppercase fw-normal text-secondary">
              <li className="breadcrumb-item">Remote or sf by area</li>
              <li className="breadcrumb-item">product – engineering</li>
              <li className="breadcrumb-item">
              full-time
              </li>
            </ol>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;
