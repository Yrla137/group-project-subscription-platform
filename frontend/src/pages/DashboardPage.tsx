import { useEffect, useState } from "react";
import Calendar from '../components/Calendar'
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers';
import type { UserWithTier } from '../types/UserType';
import { useTasks } from "../hooks/useTasks";

import { format } from "date-fns";

import "./DashboardPage.css"
import logo_pic from "../assets/logo_pic.png";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "Good morning";
    if (hour < 17) return "Good day";
    return "Good evening";
};

const DashboardPage = () => {
  const { user: authUser, loading, token } = useAuthContext();
  const { fetchUserProfile } = useUsers();
  
  const tasks = useTasks();

  const [profileData, setProfileData] = useState<UserWithTier | null>(null);+

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const data = await fetchUserProfile();
          setProfileData(data);
        } catch (err) {
          console.error("Couldn't get profile to dashboard", err);
        }
      }
    };

  if (!loading && authUser) {
    loadProfile();
    }
  }, [token, authUser, loading, fetchUserProfile]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
  }



  // Start page
  if (!authUser) {
    return (
      <div className="landing-container">
        <section className="hero-section">
          <h1 className="hero-title">
            Organize your life with <span className="highlight-text">LifeSync Planner</span>
            <span className="logo-dashboard"><img src={logo_pic} alt="Lifesync-logo"/></span>
          </h1>

          <p className="hero-subtitle">
            Your ultimate productivity hub. Take control of your daily tasks, build lasting habits, 
            and unlock expert seminars to level up your routine.
          </p>
          
          <p className="button-info-text">
            Sign in or create an account to start boosting your productivity today!
          </p>

        <div className="hero-buttons">
          <Link to ="login">
          <button className="primary-btn">
            Log in
          </button>
          </Link>
          <Link to ="register">
          <button className="primary-btn">
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
            <a href="/register" className="primary-btn">
              Get Started for Free
            </a>
          </div>
        </section>

    </div>
    );
  }

  const todayFormatted = format(new Date(), "yyyy-MM-dd");
  const taskList = tasks.tasks || [];

  const todaysTasks = taskList.filter((task: any) => {
    if (!task.task_date) return false;
    const taskDateOnly = task.task_date.substring(0, 10);
    return taskDateOnly === todayFormatted;
  });

  const usedTasksCount = todaysTasks.length;
  const maxTasks = profileData?.max_todos_per_day ?? 5;
  const progressPercentage = Math.min((usedTasksCount / maxTasks) * 100, 100);
  const greeting = getGreeting();
  const firstName = profileData ? profileData.first_name : "User"

  return (
    <div className="dashboard-page-container">
      <div className="welcome-banner">
        <div className="welcome-text-area">
          <h1>
            {greeting}, {firstName}! 🌿
          </h1>
          <p>
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
            {" "}– Time to structure your day.
          </p>
        </div>
        <div className="quota-container">
        <div className="quota-pill">
          <div className="quota-text-wrapper">
            <span>{profileData?.tier_title || "Slacker"} quota</span>
            <span className="quota-text">
              {usedTasksCount} of {maxTasks} tasks used
            </span>
          </div>

          <div className="quota-bar-container">
            <div
              className="quota-bar-fill"
              style={{ width: `${progressPercentage}%` }}>
              </div>
          </div>
        </div>
    
    <p className="quota-upgrade-text">
          Your plan allows {maxTasks} daily tasks.{" "}
          <Link to="/tiers" className="upgrade-link">
            Upgrade your subscription
          </Link>{" "}
          to create more.
        </p>
    </div>
      </div>
      <Calendar />
    </div>
  );
}

export default DashboardPage;