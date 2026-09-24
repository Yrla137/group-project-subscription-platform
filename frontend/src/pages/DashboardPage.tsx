import Calendar from '../components/Calendar'
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext' // Justera sökvägen om det behövs
import "./DashboardPage.css"

const DashboardPage = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
  }

  // Start page
  if (!user) {
    return (
      <div className="landing-container">
        <section className="hero-section">
          <h1 className="hero-title">
            Organize your life with <span className="highlight-text">LifeSync Planner</span>
          </h1>
          <p className="hero-subtitle">
            Your ultimate productivity hub. Take control of your daily tasks, build lasting habits, 
            and unlock expert seminars to level up your routine.
          </p>
          
          <p>
            Sign in or create an account to start boosting your productivity today!
          </p>

        <div className="hero-buttons">
          <Link to ="login">
          <button className="btn primary-btn">
            Log in
          </button>
          </Link>
          <Link to ="register">
          <button className="btn primary-btn">
            Register
          </button>
          </Link>
        </div>
      </section>

      <section className="features-section">
          <h2 className="section-title">Everything you need to succeed</h2>
          <div className="features-grid">
            
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3 className="feature-heading">Smart Tasks</h3>
              <p className="feature-text">Keep track of your daily to-dos, prioritize like a pro, and never miss a deadline again.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3 className="feature-heading">Habit Tracker</h3>
              <p className="feature-text">Build consistency. Monitor your daily habits and watch your personal growth compound over time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3 className="feature-heading">Exclusive Seminars</h3>
              <p className="feature-text">Join expert-led seminars on time management, productivity, and focus. Unlock higher tiers for full access!</p>
            </div>

          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to transform your productivity?</h2>
            <p className="cta-subtitle">Join LifeSync Planner today and get immediate access to your personalized planner dashboard.</p>
            <a href="/register" className="btn btn-primary">
              Get Started for Free
            </a>
          </div>
        </section>

    </div>
    );
  }

  // Om användaren ÄR inloggad (Visar din vanliga dashboard med kalender)
  return (
    <div>
      <Calendar />
    </div>
  );
}

export default DashboardPage;